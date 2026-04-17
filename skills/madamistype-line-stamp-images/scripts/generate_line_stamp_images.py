from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent.parent
REUSE_SCRIPT_DIR = REPO_ROOT / "skills" / "nazotype-chibi-character-images" / "scripts"
if str(REUSE_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(REUSE_SCRIPT_DIR))

from background_remover import remove_green_background
from nanobanana_client import NanoBananaClient

from line_stamp_compositor import compose_line_stamp
from line_stamp_validator import validate_line_stamp_image


SKILL_NAME = "madamistype-line-stamp-images"
DEFAULT_REFERENCE_URL_BASE = "https://raw.githubusercontent.com/FukaseDaichi/nazotype/refs/heads/main/public/types"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def ensure_generation_dependencies() -> None:
    missing: list[str] = []
    try:
        import cv2  # noqa: F401
    except ImportError:
        missing.append("opencv-python")
    try:
        import numpy  # noqa: F401
    except ImportError:
        missing.append("numpy")
    try:
        from PIL import Image  # noqa: F401
    except ImportError:
        missing.append("Pillow")

    if missing:
        joined = ", ".join(missing)
        raise RuntimeError(
            "Final LINE stamp generation requires transparent/final PNG output. "
            f"Install the missing dependencies before running this skill: {joined}."
        )


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


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def write_text(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value, encoding="utf-8")


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def parse_args() -> argparse.Namespace:
    load_env_file(REPO_ROOT / ".env.character-images")

    parser = argparse.ArgumentParser(description="Generate Madamistype LINE sticker PNGs from prompt manifests.")
    parser.add_argument("--all", action="store_true", help="Process every manifest under output/line-stamp-prompts.")
    parser.add_argument("--set-ids", help="Comma-separated set ids to process.")
    parser.add_argument("--manifest", help="Explicit manifest.json path.")
    parser.add_argument("--prompt-output-dir", help="Override the prompt manifest root directory.")
    parser.add_argument("--output-dir", help="Override the image output root directory.")
    parser.add_argument("--roles", help="Comma-separated roles to process. Example: main,tab,stamp")
    parser.add_argument("--asset-ids", help="Comma-separated stamp asset ids to process. Example: 01,03")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing asset outputs.")
    parser.add_argument("--poll-interval", type=int, default=8, help="Polling interval in seconds. Default: 8")
    parser.add_argument("--timeout-seconds", type=int, default=600, help="Per-task timeout in seconds. Default: 600")
    parser.add_argument("--resolution", help="Override manifest generation resolution.")
    parser.add_argument("--reference-url-base", help="Override the public base URL used for reference chibi images.")
    parser.add_argument("--api-base", help="Override the NanoBanana API base URL.")
    parser.add_argument("--dry-run", action="store_true", help="Write prompts and requests without calling the API.")
    args = parser.parse_args()

    if not args.all and not args.set_ids and not args.manifest:
        parser.error("Pass one of --all, --set-ids, or --manifest.")

    if not args.api_base:
        args.api_base = os.getenv("NANOBANANA_API_BASE", "https://api.nanobananaapi.ai")
    if not args.reference_url_base:
        args.reference_url_base = os.getenv("NANOBANANA_REFERENCE_BASE_URL", DEFAULT_REFERENCE_URL_BASE)

    return args


def discover_manifests(prompt_output_dir: Path) -> dict[str, Path]:
    manifests: dict[str, Path] = {}
    for manifest_path in sorted(prompt_output_dir.glob("*/manifest.json")):
        manifests[manifest_path.parent.name] = manifest_path
    return manifests


def parse_selected_manifests(args: argparse.Namespace, discovered: dict[str, Path]) -> list[Path]:
    if args.manifest:
        return [Path(args.manifest)]
    if args.set_ids:
        requested = [item.strip() for item in args.set_ids.split(",") if item.strip()]
        missing = [item for item in requested if item not in discovered]
        if missing:
            raise ValueError(f"Unknown set ids: {', '.join(missing)}")
        return [discovered[item] for item in requested]
    return list(discovered.values())


def build_reference_image_url(manifest: dict[str, Any], args: argparse.Namespace) -> str | None:
    type_code = str(manifest.get("typeCode") or "").strip().upper()
    base = str(args.reference_url_base or "").strip().rstrip("/")
    if base and type_code:
        return f"{base}/{type_code}_chibi.png"

    explicit_url = str((manifest.get("referencePolicy") or {}).get("publicReferenceUrl") or "").strip()
    if explicit_url:
        return explicit_url
    return None


def asset_output_dir(set_root: Path, asset: dict[str, Any]) -> Path:
    role = str(asset["role"])
    if role in {"main", "tab"}:
        return set_root / role
    return set_root / "stamps" / str(asset["id"])


def package_path(set_root: Path, asset: dict[str, Any]) -> Path:
    role = str(asset["role"])
    if role in {"main", "tab"}:
        return set_root / "package" / str(asset["fileName"])
    return set_root / "package" / "stamps" / str(asset["fileName"])


def artifact_exists(asset_root: Path) -> bool:
    return (asset_root / "final.png").exists() and (asset_root / "meta.json").exists()


def parse_csv_arg(raw: str | None) -> set[str]:
    if not raw:
        return set()
    return {item.strip() for item in raw.split(",") if item.strip()}


def build_request_payload(asset: dict[str, Any], *, reference_image_url: str | None, resolution_override: str | None) -> dict[str, Any]:
    image_urls = [reference_image_url] if reference_image_url else []
    return {
        "prompt": str(asset["prompt"]),
        "imageUrls": image_urls,
        "aspectRatio": str(asset.get("generationAspectRatio") or "1:1"),
        "resolution": str(resolution_override or asset.get("generationResolution") or "2K"),
        "googleSearch": False,
        "outputFormat": "png",
    }


def process_asset(
    *,
    client: NanoBananaClient | None,
    set_root: Path,
    manifest: dict[str, Any],
    asset: dict[str, Any],
    args: argparse.Namespace,
) -> tuple[dict[str, Any], dict[str, Any] | None]:
    asset_root = asset_output_dir(set_root, asset)
    asset_root.mkdir(parents=True, exist_ok=True)

    prompt_path = asset_root / "prompt.txt"
    request_path = asset_root / "request.json"
    task_path = asset_root / "task.json"
    raw_path = asset_root / "raw.png"
    transparent_path = asset_root / "transparent.png"
    final_path = asset_root / "final.png"
    meta_path = asset_root / "meta.json"

    write_text(prompt_path, str(asset["prompt"]))

    reference_image_url = build_reference_image_url(manifest, args)
    allow_prompt_only = bool((manifest.get("referencePolicy") or {}).get("allowPromptOnlyFallback"))
    if not reference_image_url and not allow_prompt_only:
        raise RuntimeError(f"No reference image URL available for set {manifest['setId']}.")

    request_payload = build_request_payload(asset, reference_image_url=reference_image_url, resolution_override=args.resolution)
    request_summary = {
        "skill": SKILL_NAME,
        "generatedAt": now_iso(),
        "setId": manifest["setId"],
        "typeCode": manifest["typeCode"],
        "role": asset["role"],
        "assetId": asset.get("id"),
        "text": asset["text"],
        "referenceImageUrl": reference_image_url,
        "request": request_payload,
    }
    write_json(request_path, request_summary)

    package_target = package_path(set_root, asset)

    if artifact_exists(asset_root) and not args.overwrite:
        existing_meta = read_json(meta_path)
        validation = existing_meta.get("validation")
        validation_passed = bool((validation or {}).get("passed", False))
        if validation_passed:
            package_target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(final_path, package_target)
        return (
            {
                "role": asset["role"],
                "assetId": asset.get("id"),
                "fileName": asset["fileName"],
                "status": "reused",
                "finalPath": str(final_path),
                "packagePath": str(package_target) if validation_passed else None,
                "validationPassed": validation_passed,
            },
            validation if isinstance(validation, dict) else None,
        )

    if args.dry_run:
        meta = {
            "skill": SKILL_NAME,
            "generatedAt": now_iso(),
            "setId": manifest["setId"],
            "typeCode": manifest["typeCode"],
            "role": asset["role"],
            "assetId": asset.get("id"),
            "status": "dry-run",
            "text": asset["text"],
            "referenceImageUrl": reference_image_url,
            "requestSummary": request_payload,
        }
        write_json(meta_path, meta)
        return (
            {
                "role": asset["role"],
                "assetId": asset.get("id"),
                "fileName": asset["fileName"],
                "status": "dry-run",
                "finalPath": str(final_path),
                "packagePath": str(package_target),
                "validationPassed": None,
            },
            None,
        )

    if client is None:
        raise RuntimeError("NanoBanana client is not available.")

    submitted_payload, submit_response = client.generate_image(
        prompt=str(asset["prompt"]),
        image_urls=request_payload["imageUrls"],
        aspect_ratio=str(request_payload["aspectRatio"]),
        resolution=str(request_payload["resolution"]),
        output_format="png",
        google_search=False,
    )
    task_id = str(((submit_response.get("data") or {}).get("taskId") or "")).strip()
    if not task_id:
        raise RuntimeError(f"Missing taskId in submit response: {submit_response}")

    final_task_response = client.wait_for_task(
        task_id,
        poll_interval=args.poll_interval,
        timeout_seconds=args.timeout_seconds,
    )
    response_data = ((final_task_response.get("data") or {}).get("response") or {})
    result_image_url = str(response_data.get("resultImageUrl") or "").strip()
    if not result_image_url:
        raise RuntimeError(f"Missing resultImageUrl in task response: {final_task_response}")

    write_json(
        task_path,
        {
            "submittedPayload": submitted_payload,
            "submitResponse": submit_response,
            "finalTaskResponse": final_task_response,
        },
    )

    client.download_file(result_image_url, raw_path)
    remove_green_background(raw_path, transparent_path)
    compose_summary = compose_line_stamp(
        source_path=transparent_path,
        destination_path=final_path,
        width=int(asset["canvas"]["width"]),
        height=int(asset["canvas"]["height"]),
        padding_px=int(asset["paddingPx"]),
        dpi=72,
    )

    validation = validate_line_stamp_image(
        image_path=final_path,
        expected_width=int(asset["canvas"]["width"]),
        expected_height=int(asset["canvas"]["height"]),
        padding_px=int(asset["paddingPx"]),
        expected_text=str(asset["text"]),
    )

    if validation["passed"]:
        package_target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(final_path, package_target)

    meta = {
        "skill": SKILL_NAME,
        "generatedAt": now_iso(),
        "setId": manifest["setId"],
        "typeCode": manifest["typeCode"],
        "role": asset["role"],
        "assetId": asset.get("id"),
        "status": "success" if validation["passed"] else "failed",
        "text": asset["text"],
        "referenceImageUrl": reference_image_url,
        "resultImageUrl": result_image_url,
        "requestSummary": request_payload,
        "compose": compose_summary,
        "validation": validation,
    }
    write_json(meta_path, meta)

    return (
        {
            "role": asset["role"],
            "assetId": asset.get("id"),
            "fileName": asset["fileName"],
            "status": meta["status"],
            "finalPath": str(final_path),
            "packagePath": str(package_target) if validation["passed"] else None,
            "validationPassed": validation["passed"],
        },
        validation,
    )


def process_manifest(
    *,
    manifest_path: Path,
    output_root: Path,
    client: NanoBananaClient | None,
    args: argparse.Namespace,
) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    set_id = str(manifest["setId"])
    set_root = output_root / set_id
    set_root.mkdir(parents=True, exist_ok=True)

    asset_results: list[dict[str, Any]] = []
    validations: list[dict[str, Any]] = []
    failed = False
    requested_roles = parse_csv_arg(args.roles)
    requested_asset_ids = parse_csv_arg(args.asset_ids)

    for asset in manifest.get("assets", []):
        role = str(asset.get("role") or "")
        asset_id = str(asset.get("id") or "").strip()
        if requested_roles and role not in requested_roles:
            continue
        if requested_asset_ids and role == "stamp" and asset_id not in requested_asset_ids:
            continue
        try:
            result, validation = process_asset(
                client=client,
                set_root=set_root,
                manifest=manifest,
                asset=asset,
                args=args,
            )
        except Exception as exc:
            failed = True
            result = {
                "role": asset.get("role"),
                "assetId": asset.get("id"),
                "fileName": asset.get("fileName"),
                "status": "failed",
                "error": str(exc),
            }
            validation = None
        asset_results.append(result)
        if validation is not None:
            validations.append(validation)
        if result.get("status") == "failed":
            failed = True

    write_json(
        set_root / "validation-report.json",
        {
            "skill": SKILL_NAME,
            "setId": set_id,
            "generatedAt": now_iso(),
            "assets": validations,
        },
    )

    return {
        "setId": set_id,
        "typeCode": manifest.get("typeCode"),
        "status": "failed" if failed else ("dry-run" if args.dry_run else "success"),
        "manifestPath": str(manifest_path),
        "results": asset_results,
    }


def main() -> None:
    args = parse_args()
    prompt_output_dir = Path(args.prompt_output_dir) if args.prompt_output_dir else REPO_ROOT / "output" / "line-stamp-prompts"
    output_root = Path(args.output_dir) if args.output_dir else REPO_ROOT / "output" / "line-stamp-images"

    discovered = discover_manifests(prompt_output_dir)
    selected_manifests = parse_selected_manifests(args, discovered)
    if not selected_manifests:
        raise FileNotFoundError(f"No LINE stamp manifests found under {prompt_output_dir}")

    client = None
    if not args.dry_run:
        ensure_generation_dependencies()
        api_key = os.getenv("NANOBANANA_API_KEY", "").strip()
        if not api_key:
            raise RuntimeError("NANOBANANA_API_KEY is required unless --dry-run is used.")
        client = NanoBananaClient(api_key=api_key, base_url=args.api_base)

    results: list[dict[str, Any]] = []
    for manifest_path in selected_manifests:
        results.append(
            process_manifest(
                manifest_path=manifest_path,
                output_root=output_root,
                client=client,
                args=args,
            )
        )

    write_json(
        output_root / "batch-report.json",
        {
            "skill": SKILL_NAME,
            "generatedAt": now_iso(),
            "results": results,
        },
    )


if __name__ == "__main__":
    main()
