from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


class NanoBananaClient:
    def __init__(self, api_key: str, base_url: str = "https://api.nanobananaapi.ai", timeout_seconds: int = 60) -> None:
        if not api_key:
            raise ValueError("NanoBanana API key is required.")
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout_seconds = timeout_seconds

    def _request_json(self, method: str, url: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        body = None
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/136.0.0.0 Safari/537.36"
            ),
        }

        if payload is not None:
            body = json.dumps(payload).encode("utf-8")
            headers["Content-Type"] = "application/json"

        request = urllib.request.Request(url=url, data=body, method=method, headers=headers)

        try:
            with urllib.request.urlopen(request, timeout=self.timeout_seconds) as response:
                raw = response.read().decode("utf-8")
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"NanoBanana HTTP {exc.code}: {detail}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"NanoBanana request failed: {exc}") from exc

        try:
            return json.loads(raw)
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"NanoBanana returned non-JSON response: {raw}") from exc

    def generate_image(
        self,
        *,
        prompt: str,
        image_urls: list[str] | None = None,
        aspect_ratio: str = "1:1",
        resolution: str = "2K",
        output_format: str = "png",
        google_search: bool = False,
        callback_url: str | None = None,
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        payload: dict[str, Any] = {
            "prompt": prompt,
            "imageUrls": image_urls or [],
            "aspectRatio": aspect_ratio,
            "resolution": resolution,
            "googleSearch": google_search,
            "outputFormat": output_format,
        }
        if callback_url:
            payload["callBackUrl"] = callback_url

        response = self._request_json("POST", f"{self.base_url}/api/v1/nanobanana/generate-2", payload)
        return payload, response

    def get_task_details(self, task_id: str) -> dict[str, Any]:
        query = urllib.parse.urlencode({"taskId": task_id})
        return self._request_json("GET", f"{self.base_url}/api/v1/nanobanana/record-info?{query}")

    def wait_for_task(self, task_id: str, *, poll_interval: int = 8, timeout_seconds: int = 600) -> dict[str, Any]:
        deadline = time.monotonic() + timeout_seconds

        while True:
            response = self.get_task_details(task_id)
            data = response.get("data") or {}
            success_flag = data.get("successFlag")

            if success_flag == 1:
                return response
            if success_flag in {2, 3}:
                message = data.get("errorMessage") or response.get("msg") or "Generation failed."
                raise RuntimeError(f"NanoBanana task failed for {task_id}: {message}")
            if time.monotonic() >= deadline:
                raise TimeoutError(f"Timed out waiting for NanoBanana task {task_id}")

            time.sleep(poll_interval)

    def download_file(self, url: str, destination: Path) -> None:
        destination.parent.mkdir(parents=True, exist_ok=True)
        request = urllib.request.Request(
            url=url,
            headers={
                "Accept": "*/*",
                "Accept-Language": "en-US,en;q=0.9",
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/136.0.0.0 Safari/537.36"
                ),
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout_seconds) as response:
                destination.write_bytes(response.read())
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Image download failed with HTTP {exc.code}: {detail}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"Image download failed: {exc}") from exc
