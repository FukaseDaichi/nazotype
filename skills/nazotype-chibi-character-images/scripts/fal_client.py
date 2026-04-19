from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


class FalAIClient:
    def __init__(
        self,
        api_key: str,
        *,
        base_url: str = "https://queue.fal.run",
        text_model: str = "fal-ai/nano-banana-2",
        edit_model: str = "fal-ai/nano-banana-2/edit",
        timeout_seconds: int = 60,
    ) -> None:
        if not api_key:
            raise ValueError("fal.ai API key is required.")
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.text_model = text_model.strip().strip("/")
        self.edit_model = edit_model.strip().strip("/")
        self.timeout_seconds = timeout_seconds

    def _headers(self, *, json_body: bool = False) -> dict[str, str]:
        headers = {
            "Authorization": f"Key {self.api_key}",
            "Accept": "application/json",
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/136.0.0.0 Safari/537.36"
            ),
        }
        if json_body:
            headers["Content-Type"] = "application/json"
        return headers

    def _request_json(self, method: str, url: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        body = None
        if payload is not None:
            body = json.dumps(payload).encode("utf-8")

        request = urllib.request.Request(
            url=url,
            data=body,
            method=method,
            headers=self._headers(json_body=payload is not None),
        )

        try:
            with urllib.request.urlopen(request, timeout=self.timeout_seconds) as response:
                raw = response.read().decode("utf-8")
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"fal.ai HTTP {exc.code}: {detail}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"fal.ai request failed: {exc}") from exc

        try:
            return json.loads(raw)
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"fal.ai returned non-JSON response: {raw}") from exc

    def _model_path_for(self, image_urls: list[str] | None) -> str:
        return self.edit_model if image_urls else self.text_model

    def _submit_url(self, model_path: str) -> str:
        return f"{self.base_url}/{model_path.strip('/')}"

    def _status_url(self, model_path: str, request_id: str) -> str:
        return f"{self.base_url}/{model_path.strip('/')}/requests/{request_id}/status"

    def _response_url(self, model_path: str, request_id: str) -> str:
        return f"{self.base_url}/{model_path.strip('/')}/requests/{request_id}/response"

    @staticmethod
    def extract_request_id(submit_response: dict[str, Any]) -> str | None:
        value = submit_response.get("request_id")
        if isinstance(value, str) and value.strip():
            return value.strip()

        legacy_value = ((submit_response.get("data") or {}).get("taskId") or "")
        if isinstance(legacy_value, str) and legacy_value.strip():
            return legacy_value.strip()
        return None

    @staticmethod
    def extract_result_image_url(payload: dict[str, Any]) -> str | None:
        candidates: list[Any] = [payload]
        while candidates:
            current = candidates.pop(0)
            if isinstance(current, dict):
                value = current.get("resultImageUrl")
                if isinstance(value, str) and value.strip():
                    return value.strip()

                images = current.get("images")
                if isinstance(images, list):
                    for image in images:
                        if isinstance(image, dict):
                            url = image.get("url")
                            if isinstance(url, str) and url.strip():
                                return url.strip()

                image = current.get("image")
                if isinstance(image, dict):
                    url = image.get("url")
                    if isinstance(url, str) and url.strip():
                        return url.strip()

                for key in ("resultResponse", "finalTaskResponse", "response", "data", "output"):
                    nested = current.get(key)
                    if nested is not None:
                        candidates.append(nested)
            elif isinstance(current, list):
                candidates.extend(current)
        return None

    def generate_image(
        self,
        *,
        prompt: str,
        image_urls: list[str] | None = None,
        aspect_ratio: str = "1:1",
        resolution: str = "2K",
        output_format: str = "png",
        google_search: bool = False,
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        model_path = self._model_path_for(image_urls)
        payload: dict[str, Any] = {
            "prompt": prompt,
            "aspect_ratio": aspect_ratio,
            "resolution": resolution,
            "output_format": output_format,
            "enable_web_search": bool(google_search),
        }
        if image_urls:
            payload["image_urls"] = image_urls

        response = self._request_json("POST", self._submit_url(model_path), payload)
        response.setdefault("model_path", model_path)
        return payload, response

    def get_status(self, request_id: str, *, model_path: str) -> dict[str, Any]:
        query = urllib.parse.urlencode({"logs": 1})
        url = f"{self._status_url(model_path, request_id)}?{query}"
        return self._request_json("GET", url)

    def get_result(self, request_id: str, *, model_path: str) -> dict[str, Any]:
        return self._request_json("GET", self._response_url(model_path, request_id))

    def wait_for_task(
        self,
        request_id: str,
        *,
        model_path: str,
        poll_interval: int = 8,
        timeout_seconds: int = 600,
    ) -> dict[str, Any]:
        deadline = time.monotonic() + timeout_seconds

        while True:
            status_response = self.get_status(request_id, model_path=model_path)
            status = str(status_response.get("status") or "").strip().upper()

            if status == "COMPLETED":
                result_response = self.get_result(request_id, model_path=model_path)
                return {
                    "request_id": request_id,
                    "model_path": model_path,
                    "statusResponse": status_response,
                    "resultResponse": result_response,
                }

            if status in {"FAILED", "CANCELLED", "ERROR"}:
                raise RuntimeError(f"fal.ai request failed for {request_id}: {status_response}")

            if time.monotonic() >= deadline:
                raise TimeoutError(f"Timed out waiting for fal.ai request {request_id}")

            time.sleep(poll_interval)

    def download_file(self, url: str, destination: Path) -> None:
        destination.parent.mkdir(parents=True, exist_ok=True)
        request = urllib.request.Request(url=url, headers=self._headers())
        try:
            with urllib.request.urlopen(request, timeout=self.timeout_seconds) as response:
                destination.write_bytes(response.read())
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Image download failed with HTTP {exc.code}: {detail}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"Image download failed: {exc}") from exc
