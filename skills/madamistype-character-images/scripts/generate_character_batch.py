from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from background_remover import remove_green_background
from nanobanana_client import NanoBananaClient
from prompt_builder import build_prompt, load_type_data, merge_negative_constraints


SKILL_NAME = "madamistype-character-images"


def load_env_file(path: Path) -> bool:
    if not path.exists():
        return False

    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue

        if stripped.startswith("export "):
            stripped = stripped[len("export ") :].strip()

        if "=" not in stripped:
            continue

        key, value = stripped.split("=", 1)
        key = key.strip()
        value = value.strip()

        if not key:
            continue

        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]

        os.environ.setdefault(key, value)

    return True


def parse_args() -> argparse.Namespace:
    repo_root = repo_root_from_script()
    load_env_file(repo_root / ".env.character-images")

    parser = argparse.ArgumentParser(description="Batch-generate Madamistype character images with NanoBanana.")
    parser.add_argument("--all", action="store_true", help="Generate images for every type JSON.")
    parser.add_argument("--types", help="Comma-separated list of type codes to process.")
    parser.add_argument("--retry-failed", action="store_true", help="Retry failed types from the previous batch report.")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing artifacts.")
    parser.add_argument(
        "--variants",
        choices=("standard", "chibi", "both"),
        default="both",
        help="Select which variants to generate. Default: both",
    )
    parser.add_argument("--with-transparent", action="store_true", help="Generate green-screen art and export transparent PNGs.")
    parser.add_argument("--output-dir", help="Override output directory.")
    parser.add_argument("--aspect-ratio", default="1:1", help="NanoBanana aspectRatio. Default: 1:1")
    parser.add_argument("--resolution", default="2K", help="NanoBanana resolution. Default: 2K")
    parser.add_argument("--poll-interval", type=int, default=8, help="Polling interval in seconds. Default: 8")
    parser.add_argument("--timeout-seconds", type=int, default=600, help="Per-task timeout in seconds. Default: 600")
    parser.add_argument("--api-base", help="Override the NanoBanana API base URL.")
    parser.add_argument("--dry-run", action="store_true", help="Write prompts and payloads without calling the API.")
    args = parser.parse_args()

    if not args.api_base:
        args.api_base = os.getenv("NANOBANANA_API_BASE", "https://api.nanobananaapi.ai")

    if not args.all and not args.types and not args.retry_failed:
        parser.error("Pass one of --all, --types, or --retry-failed.")

    return args


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def repo_root_from_script() -> Path:
    return SCRIPT_DIR.parent.parent.parent


def discover_type_files(types_dir: Path) -> dict[str, Path]:
    files = sorted(types_dir.glob("*.json"))
    return {path.stem.upper(): path for path in files}


def load_failed_type_codes(output_dir: Path) -> list[str]:
    report_path = output_dir / "batch-report.json"
    if not report_path.exists():
        raise FileNotFoundError(f"Cannot use --retry-failed because {report_path} does not exist.")

    report = json.loads(report_path.read_text(encoding="utf-8"))
    failed_codes: list[str] = []
    for item in report.get("results", []):
        variants = item.get("variants", {})
        if any(variant.get("status") == "failed" for variant in variants.values()):
            failed_codes.append(item["typeCode"])

    if not failed_codes:
        raise ValueError("No failed types found in the existing batch report.")

    return failed_codes


def parse_selected_types(args: argparse.Namespace, discovered: dict[str, Path], output_dir: Path) -> list[str]:
    if args.types:
        requested = [item.strip().upper() for item in args.types.split(",") if item.strip()]
        missing = [item for item in requested if item not in discovered]
        if missing:
            raise ValueError(f"Unknown type codes: {', '.join(missing)}")
        return requested
    if args.retry_failed:
        return load_failed_type_codes(output_dir)
    return sorted(discovered)


def read_result_image_url(variant_dir: Path) -> str | None:
    task_path = variant_dir / "task.json"
    if not task_path.exists():
        return None

    task_data = json.loads(task_path.read_text(encoding="utf-8"))
    final_response = task_data.get("finalTaskResponse") or {}
    data = final_response.get("data") or {}
    response = data.get("response") or {}
    value = response.get("resultImageUrl")
    if isinstance(value, str) and value.strip():
        return value.strip()
    return None


def existing_meta_matches_mode(variant_dir: Path, with_transparent: bool) -> bool:
    meta_path = variant_dir / "meta.json"
    if not meta_path.exists():
        return False

    try:
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return False

    return bool(meta.get("withTransparent")) == with_transparent


def artifact_exists(variant_dir: Path, with_transparent: bool) -> bool:
    if not existing_meta_matches_mode(variant_dir, with_transparent):
        return False

    raw_exists = (variant_dir / "raw.png").exists()
    if not raw_exists:
        return False
    if with_transparent:
        return (variant_dir / "transparent.png").exists()
    return True


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def write_text(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value, encoding="utf-8")


def build_meta(
    *,
    type_code: str,
    variant: str,
    with_transparent: bool,
    status: str,
    prompt: str,
    negative_prompt: str,
    payload: dict[str, Any] | None,
    reference_mode: str,
    result_image_url: str | None,
    error: str | None = None,
) -> dict[str, Any]:
    meta: dict[str, Any] = {
        "skill": SKILL_NAME,
        "generatedAt": now_iso(),
        "typeCode": type_code,
        "variant": variant,
        "withTransparent": with_transparent,
        "status": status,
        "referenceMode": reference_mode,
        "resultImageUrl": result_image_url,
        "promptPreview": prompt[:500],
        "negativePromptPreview": negative_prompt[:500],
    }
    if payload is not None:
        meta["requestSummary"] = {
            "aspectRatio": payload.get("aspectRatio"),
            "resolution": payload.get("resolution"),
            "outputFormat": payload.get("outputFormat"),
            "imageUrlsCount": len(payload.get("imageUrls", [])),
        }
    if error:
        meta["error"] = error
    return meta


def process_variant(
    *,
    client: NanoBananaClient | None,
    type_data: dict[str, Any],
    variant: str,
    output_dir: Path,
    with_transparent: bool,
    overwrite: bool,
    dry_run: bool,
    aspect_ratio: str,
    resolution: str,
    poll_interval: int,
    timeout_seconds: int,
    reference_url: str | None = None,
) -> dict[str, Any]:
    type_code = str(type_data["typeCode"])
    variant_dir = output_dir / type_code / variant
    variant_dir.mkdir(parents=True, exist_ok=True)

    if artifact_exists(variant_dir, with_transparent) and not overwrite:
        result_url = read_result_image_url(variant_dir)
        prompt_path = variant_dir / "prompt.txt"
        negative_path = variant_dir / "negative_prompt.txt"
        meta = build_meta(
            type_code=type_code,
            variant=variant,
            with_transparent=with_transparent,
            status="skipped",
            prompt=prompt_path.read_text(encoding="utf-8") if prompt_path.exists() else "",
            negative_prompt=negative_path.read_text(encoding="utf-8") if negative_path.exists() else "",
            payload=None,
            reference_mode="stored-artifacts",
            result_image_url=result_url,
        )
        write_json(variant_dir / "meta.json", meta)
        return {
            "status": "skipped",
            "resultImageUrl": result_url,
            "referenceMode": "stored-artifacts",
        }

    prompt = build_prompt(type_data, variant, with_transparent)
    negative_prompt = merge_negative_constraints(type_data, with_transparent)
    write_text(variant_dir / "prompt.txt", prompt)
    write_text(variant_dir / "negative_prompt.txt", negative_prompt)

    image_urls: list[str] = []
    reference_mode = "none"
    if variant == "chibi" and reference_url:
        image_urls = [reference_url]
        reference_mode = "standard-result-url"
    elif variant == "chibi":
        reference_mode = "prompt-only-fallback"

    payload = {
        "prompt": prompt,
        "imageUrls": image_urls,
        "aspectRatio": aspect_ratio,
        "resolution": resolution,
        "googleSearch": False,
        "outputFormat": "png",
    }
    write_json(variant_dir / "request.json", payload)

    if dry_run:
        meta = build_meta(
            type_code=type_code,
            variant=variant,
            with_transparent=with_transparent,
            status="dry-run",
            prompt=prompt,
            negative_prompt=negative_prompt,
            payload=payload,
            reference_mode=reference_mode,
            result_image_url=None,
        )
        write_json(variant_dir / "meta.json", meta)
        return {
            "status": "dry-run",
            "resultImageUrl": None,
            "referenceMode": reference_mode,
        }

    if client is None:
        raise RuntimeError("API client is not available.")

    try:
        submitted_payload, submit_response = client.generate_image(
            prompt=prompt,
            image_urls=image_urls,
            aspect_ratio=aspect_ratio,
            resolution=resolution,
            output_format="png",
            google_search=False,
        )
        task_id = ((submit_response.get("data") or {}).get("taskId") or "").strip()
        if not task_id:
            raise RuntimeError(f"Missing taskId in submit response: {submit_response}")

        final_task_response = client.wait_for_task(
            task_id,
            poll_interval=poll_interval,
            timeout_seconds=timeout_seconds,
        )

        task_data = final_task_response.get("data") or {}
        response = task_data.get("response") or {}
        result_image_url = response.get("resultImageUrl")
        if not isinstance(result_image_url, str) or not result_image_url.strip():
            raise RuntimeError(f"Missing resultImageUrl in final task response: {final_task_response}")

        write_json(
            variant_dir / "task.json",
            {
                "submittedAt": now_iso(),
                "submitResponse": submit_response,
                "finalTaskResponse": final_task_response,
            },
        )

        raw_path = variant_dir / "raw.png"
        client.download_file(result_image_url, raw_path)

        if with_transparent:
            remove_green_background(raw_path, variant_dir / "transparent.png")

        meta = build_meta(
            type_code=type_code,
            variant=variant,
            with_transparent=with_transparent,
            status="success",
            prompt=prompt,
            negative_prompt=negative_prompt,
            payload=submitted_payload,
            reference_mode=reference_mode,
            result_image_url=result_image_url,
        )
        write_json(variant_dir / "meta.json", meta)
        return {
            "status": "success",
            "resultImageUrl": result_image_url,
            "referenceMode": reference_mode,
        }
    except Exception as exc:
        meta = build_meta(
            type_code=type_code,
            variant=variant,
            with_transparent=with_transparent,
            status="failed",
            prompt=prompt,
            negative_prompt=negative_prompt,
            payload=payload,
            reference_mode=reference_mode,
            result_image_url=None,
            error=str(exc),
        )
        write_json(variant_dir / "meta.json", meta)
        return {
            "status": "failed",
            "error": str(exc),
            "resultImageUrl": None,
            "referenceMode": reference_mode,
        }


def main() -> int:
    args = parse_args()

    repo_root = repo_root_from_script()
    types_dir = repo_root / "data" / "types"
    output_dir = Path(args.output_dir).resolve() if args.output_dir else repo_root / "output" / "character-images"

    discovered = discover_type_files(types_dir)
    selected_codes = parse_selected_types(args, discovered, output_dir)
    requested_variants = ["standard", "chibi"] if args.variants == "both" else [args.variants]

    client = None
    if not args.dry_run:
        api_key = os.getenv("NANOBANANA_API_KEY", "").strip()
        if not api_key:
            raise RuntimeError(
                "Set NANOBANANA_API_KEY in the shell or in repo-root .env.character-images before running without --dry-run."
            )
        client = NanoBananaClient(api_key=api_key, base_url=args.api_base)

    results: list[dict[str, Any]] = []

    for type_code in selected_codes:
        type_data = load_type_data(discovered[type_code])
        type_output_dir = output_dir / type_code

        variant_results: dict[str, Any] = {}
        reference_url = read_result_image_url(type_output_dir / "standard")

        if "standard" in requested_variants:
            standard_result = process_variant(
                client=client,
                type_data=type_data,
                variant="standard",
                output_dir=output_dir,
                with_transparent=args.with_transparent,
                overwrite=args.overwrite,
                dry_run=args.dry_run,
                aspect_ratio=args.aspect_ratio,
                resolution=args.resolution,
                poll_interval=args.poll_interval,
                timeout_seconds=args.timeout_seconds,
            )
            variant_results["standard"] = standard_result
            reference_url = standard_result.get("resultImageUrl") or read_result_image_url(type_output_dir / "standard")

        if "chibi" in requested_variants:
            chibi_result = process_variant(
                client=client,
                type_data=type_data,
                variant="chibi",
                output_dir=output_dir,
                with_transparent=args.with_transparent,
                overwrite=args.overwrite,
                dry_run=args.dry_run,
                aspect_ratio=args.aspect_ratio,
                resolution=args.resolution,
                poll_interval=args.poll_interval,
                timeout_seconds=args.timeout_seconds,
                reference_url=reference_url,
            )
            variant_results["chibi"] = chibi_result

        results.append(
            {
                "typeCode": type_code,
                "variants": variant_results,
            }
        )

    success_count = sum(
        1
        for item in results
        for variant in item["variants"].values()
        if variant.get("status") in {"success", "skipped", "dry-run"}
    )
    failure_count = sum(
        1
        for item in results
        for variant in item["variants"].values()
        if variant.get("status") == "failed"
    )

    write_json(
        output_dir / "batch-report.json",
        {
            "skill": SKILL_NAME,
            "generatedAt": now_iso(),
            "repoRoot": str(repo_root),
            "typesDir": str(types_dir),
            "outputDir": str(output_dir),
            "withTransparent": args.with_transparent,
            "dryRun": args.dry_run,
            "successCount": success_count,
            "failureCount": failure_count,
            "results": results,
        },
    )

    return 1 if failure_count else 0


if __name__ == "__main__":
    raise SystemExit(main())
