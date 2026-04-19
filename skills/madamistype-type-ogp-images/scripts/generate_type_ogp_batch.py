from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path
from typing import Any


SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from candidate_selector import choose_candidate, parse_selection_overrides
from fal_client import FalAIClient
from ogp_compositor import compose_ogp
from ogp_prompt_builder import build_candidate_prompts, find_reference_chibi, load_type_data
from write_manifest import copy_file, now_iso, read_json, write_json, write_text


SKILL_NAME = "madamistype-type-ogp-images"
DEFAULT_REFERENCE_URL_BASE = "https://raw.githubusercontent.com/FukaseDaichi/nazotype/refs/heads/main/public/types"


def repo_root_from_script() -> Path:
    return SCRIPT_DIR.parent.parent.parent


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


def discover_type_files(types_dir: Path) -> dict[str, Path]:
    return {path.stem.upper(): path for path in sorted(types_dir.glob("*.json"))}


def parse_args() -> argparse.Namespace:
    repo_root = repo_root_from_script()
    load_env_file(repo_root / ".env.character-images")

    parser = argparse.ArgumentParser(description="Batch-generate Madamistype type OGP images with fal.ai.")
    parser.add_argument("--all", action="store_true", help="Generate OGP assets for every type JSON.")
    parser.add_argument("--types", help="Comma-separated list of type codes to process.")
    parser.add_argument("--retry-failed", action="store_true", help="Retry failed type codes from the previous batch report.")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing intermediate artifacts.")
    parser.add_argument("--output-dir", help="Override working output directory.")
    parser.add_argument("--publish-dir", help="Override final publish directory.")
    parser.add_argument("--publish", action="store_true", help="Copy final OGPs to the publish directory.")
    parser.add_argument("--candidates", type=int, default=1, help="Number of prompt candidates per type. Default: 1")
    parser.add_argument("--aspect-ratio", default="16:9", help="fal.ai aspect_ratio. Default: 16:9")
    parser.add_argument("--resolution", default="2K", help="fal.ai resolution. Default: 2K")
    parser.add_argument("--poll-interval", type=int, default=8, help="Polling interval in seconds. Default: 8")
    parser.add_argument("--select", help="Manual candidate overrides such as OFEI:2,TRLP:4")
    parser.add_argument("--brand-label", default="マダミスタイプ診断", help="Small brand label added at the bottom-right of the final OGP.")
    parser.add_argument(
        "--reference-url-base",
        help=(
            "Public base URL for reference chibi images. "
            f"Default: {DEFAULT_REFERENCE_URL_BASE}"
        ),
    )
    parser.add_argument(
        "--allow-prompt-only-fallback",
        action="store_true",
        help="Allow prompt-only generation when the local reference chibi is missing.",
    )
    parser.add_argument("--timeout-seconds", type=int, default=600, help="Per-request timeout in seconds. Default: 600")
    parser.add_argument("--api-base", help="Override the fal.ai queue base URL.")
    parser.add_argument("--text-model", help="Override the fal.ai text-to-image model path.")
    parser.add_argument("--edit-model", help="Override the fal.ai image-edit model path.")
    parser.add_argument("--dry-run", action="store_true", help="Write prompts and planned requests without calling the API.")
    args = parser.parse_args()

    if not args.api_base:
        args.api_base = os.getenv("FAL_QUEUE_URL", "https://queue.fal.run")
    if not args.text_model:
        args.text_model = os.getenv("FAL_MODEL", "fal-ai/nano-banana-2")
    if not args.edit_model:
        args.edit_model = os.getenv("FAL_EDIT_MODEL", "fal-ai/nano-banana-2/edit")
    if not args.reference_url_base:
        args.reference_url_base = os.getenv("FAL_REFERENCE_BASE_URL", DEFAULT_REFERENCE_URL_BASE)

    if not args.all and not args.types and not args.retry_failed:
        parser.error("Pass one of --all, --types, or --retry-failed.")
    if args.publish and args.dry_run:
        parser.error("--publish cannot be used together with --dry-run.")
    if args.candidates < 1:
        parser.error("--candidates must be at least 1.")

    return args


def load_failed_type_codes(output_dir: Path) -> list[str]:
    report_path = output_dir / "batch-report.json"
    if not report_path.exists():
        raise FileNotFoundError(f"Cannot use --retry-failed because {report_path} does not exist.")

    report = read_json(report_path)
    failed: list[str] = []
    for item in report.get("results", []):
        if item.get("status") == "failed":
            failed.append(str(item["typeCode"]).upper())
    if not failed:
        raise ValueError("No failed type codes found in the existing batch report.")
    return failed


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


def build_candidate_paths(type_root: Path, candidate_index: int) -> dict[str, Path]:
    suffix = f"{candidate_index:02d}"
    candidate_root = type_root / "candidates"
    return {
        "prompt": candidate_root / f"prompt-{suffix}.txt",
        "negativePrompt": candidate_root / f"negative_prompt-{suffix}.txt",
        "request": candidate_root / f"request-{suffix}.json",
        "task": candidate_root / f"task-{suffix}.json",
        "image": candidate_root / f"candidate-{suffix}.png",
    }


def build_reference_image_url(reference_url_base: str, type_code: str) -> str:
    base = reference_url_base.strip().rstrip("/")
    if not base:
        raise ValueError("reference_url_base must not be empty.")
    return f"{base}/{type_code}_chibi.png"


def read_result_image_url(task_path: Path) -> str | None:
    if not task_path.exists():
        return None

    task_payload = read_json(task_path)
    final_task_response = task_payload.get("finalTaskResponse") or task_payload
    data = final_task_response.get("data") or {}
    response = data.get("response") or {}
    return FalAIClient.extract_result_image_url(task_payload)


def process_type(
    *,
    client: FalAIClient | None,
    repo_root: Path,
    output_dir: Path,
    publish_dir: Path,
    args: argparse.Namespace,
    type_path: Path,
    selection_overrides: dict[str, int],
) -> dict[str, Any]:
    type_data = load_type_data(type_path)
    type_code = str(type_data["typeCode"]).strip().upper()
    type_name = str(type_data["typeName"]).strip()

    type_root = output_dir / type_code
    reference_dir = type_root / "reference"
    selected_dir = type_root / "selected"
    final_dir = type_root / "final"
    reference_dir.mkdir(parents=True, exist_ok=True)
    selected_dir.mkdir(parents=True, exist_ok=True)
    final_dir.mkdir(parents=True, exist_ok=True)

    reference_path = find_reference_chibi(repo_root, type_code)
    reference_copy_path = reference_dir / "chibi.png"
    reference_exists = reference_path.exists()
    if reference_exists:
        copy_file(reference_path, reference_copy_path)

    reference_image_url = None
    if reference_exists:
        reference_image_url = build_reference_image_url(args.reference_url_base, type_code)

    candidates = build_candidate_prompts(type_data, candidate_count=args.candidates)
    candidate_records: list[dict[str, Any]] = []

    for candidate in candidates:
        candidate_index = int(candidate["candidateIndex"])
        paths = build_candidate_paths(type_root, candidate_index)
        write_text(paths["prompt"], str(candidate["prompt"]))
        write_text(paths["negativePrompt"], str(candidate["negativePrompt"]))

        image_urls = [reference_image_url] if reference_image_url else []
        reference_mode = "type-chibi-url" if image_urls else "prompt-only-fallback"
        request_payload = {
            "prompt": str(candidate["prompt"]),
            "image_urls": image_urls,
            "aspect_ratio": args.aspect_ratio,
            "resolution": args.resolution,
            "enable_web_search": False,
            "output_format": "png",
            "model_path": args.edit_model if image_urls else args.text_model,
        }
        request_summary = {
            "skill": SKILL_NAME,
            "generatedAt": now_iso(),
            "typeCode": type_code,
            "candidateIndex": candidate_index,
            "variantId": candidate["variantId"],
            "titlePlacement": candidate["titlePlacement"],
            "referenceMode": reference_mode,
            "referenceImagePath": str(reference_path) if reference_exists else None,
            "referenceImageUrl": reference_image_url,
            "request": request_payload,
        }
        write_json(paths["request"], request_summary)

        if paths["image"].exists() and paths["task"].exists() and not args.overwrite:
            candidate_records.append(
                {
                    "candidateIndex": candidate_index,
                    "variantId": candidate["variantId"],
                    "titlePlacement": candidate["titlePlacement"],
                    "selectionHint": candidate["selectionHint"],
                    "status": "reused",
                    "referenceMode": reference_mode,
                    "resultImageUrl": read_result_image_url(paths["task"]),
                    "paths": {key: str(value) for key, value in paths.items()},
                }
            )
            continue

        if args.dry_run:
            candidate_records.append(
                {
                    "candidateIndex": candidate_index,
                    "variantId": candidate["variantId"],
                    "titlePlacement": candidate["titlePlacement"],
                    "selectionHint": candidate["selectionHint"],
                    "status": "dry-run",
                    "referenceMode": reference_mode,
                    "paths": {key: str(value) for key, value in paths.items()},
                }
            )
            continue

        if client is None:
            raise RuntimeError("fal.ai client is required unless --dry-run is enabled.")

        try:
            if not image_urls and not args.allow_prompt_only_fallback:
                raise FileNotFoundError(
                    f"Reference chibi not found for {type_code}: {reference_path}. "
                    "Pass --allow-prompt-only-fallback to continue without it."
                )

            submitted_payload, submit_response = client.generate_image(
                prompt=str(candidate["prompt"]),
                image_urls=image_urls,
                aspect_ratio=args.aspect_ratio,
                resolution=args.resolution,
                output_format="png",
                google_search=False,
            )
            request_id = client.extract_request_id(submit_response)
            if not request_id:
                raise RuntimeError(f"Missing request_id in submit response: {submit_response}")
            model_path = str(submit_response.get("model_path") or request_payload["model_path"]).strip()

            final_task_response = client.wait_for_task(
                request_id,
                model_path=model_path,
                status_url=str(submit_response.get("status_url") or "").strip() or None,
                response_url=str(submit_response.get("response_url") or "").strip() or None,
                poll_interval=args.poll_interval,
                timeout_seconds=args.timeout_seconds,
            )
            result_image_url = str(client.extract_result_image_url(final_task_response) or "").strip()
            if not result_image_url:
                raise RuntimeError(f"Missing result image URL in fal.ai response: {final_task_response}")

            write_json(
                paths["task"],
                {
                    "submittedAt": now_iso(),
                    "requestId": request_id,
                    "modelPath": model_path,
                    "submitPayload": submitted_payload,
                    "submitResponse": submit_response,
                    "finalTaskResponse": final_task_response,
                },
            )
            client.download_file(result_image_url, paths["image"])
            candidate_records.append(
                {
                    "candidateIndex": candidate_index,
                    "variantId": candidate["variantId"],
                    "titlePlacement": candidate["titlePlacement"],
                    "selectionHint": candidate["selectionHint"],
                    "status": "success",
                    "referenceMode": reference_mode,
                    "resultImageUrl": result_image_url,
                    "paths": {key: str(value) for key, value in paths.items()},
                }
            )
        except Exception as exc:
            write_json(
                paths["task"],
                {
                    "error": str(exc),
                    "generatedAt": now_iso(),
                },
            )
            candidate_records.append(
                {
                    "candidateIndex": candidate_index,
                    "variantId": candidate["variantId"],
                    "titlePlacement": candidate["titlePlacement"],
                    "selectionHint": candidate["selectionHint"],
                    "status": "failed",
                    "error": str(exc),
                    "referenceMode": reference_mode,
                    "paths": {key: str(value) for key, value in paths.items()},
                }
            )

    meta_path = final_dir / "meta.json"
    summary: dict[str, Any] = {
        "skill": SKILL_NAME,
        "generatedAt": now_iso(),
        "typeCode": type_code,
        "typeName": type_name,
        "referenceImagePath": str(reference_path) if reference_exists else None,
        "referenceImageUrl": reference_image_url,
        "candidateCountRequested": args.candidates,
        "dryRun": args.dry_run,
        "candidates": candidate_records,
    }

    if args.dry_run:
        summary["status"] = "dry-run"
        write_json(meta_path, summary)
        return {
            "typeCode": type_code,
            "typeName": type_name,
            "status": "dry-run",
            "candidateCount": len(candidate_records),
            "metaPath": str(meta_path),
        }

    try:
        selected, selection_note = choose_candidate(
            type_code=type_code,
            candidates=candidate_records,
            override_index=selection_overrides.get(type_code),
        )
    except Exception as exc:
        summary["status"] = "failed"
        summary["error"] = str(exc)
        write_json(meta_path, summary)
        return {
            "typeCode": type_code,
            "typeName": type_name,
            "status": "failed",
            "error": str(exc),
            "metaPath": str(meta_path),
        }

    selected_hero_path = selected_dir / "hero.png"
    selection_json_path = selected_dir / "selection.json"
    selection_note_path = selected_dir / "selection-note.txt"
    copy_file(Path(selected["paths"]["image"]), selected_hero_path)
    write_json(selection_json_path, selected)
    write_text(selection_note_path, selection_note)

    final_ogp_path = final_dir / "ogp.png"
    compose_meta = compose_ogp(
        hero_path=selected_hero_path,
        output_path=final_ogp_path,
        type_data=type_data,
        title_placement=str(selected["titlePlacement"]),
        brand_label=args.brand_label,
    )

    published_path: str | None = None
    if args.publish:
        publish_target = publish_dir / f"{type_code}.png"
        copy_file(final_ogp_path, publish_target)
        published_path = str(publish_target)

    summary.update(
        {
            "status": "success",
            "selectedCandidate": selected,
            "selectionNote": selection_note,
            "finalOgpPath": str(final_ogp_path),
            "publishedPath": published_path,
            "compositor": compose_meta,
        }
    )
    write_json(meta_path, summary)

    return {
        "typeCode": type_code,
        "typeName": type_name,
        "status": "success",
        "selectedCandidateIndex": selected["candidateIndex"],
        "finalOgpPath": str(final_ogp_path),
        "publishedPath": published_path,
        "metaPath": str(meta_path),
    }


def main() -> int:
    args = parse_args()
    repo_root = repo_root_from_script()
    output_dir = Path(args.output_dir).resolve() if args.output_dir else repo_root / "output" / "type-ogp"
    publish_dir = Path(args.publish_dir).resolve() if args.publish_dir else repo_root / "public" / "ogp" / "types"
    types_dir = repo_root / "data" / "types"

    discovered = discover_type_files(types_dir)
    selected_types = parse_selected_types(args, discovered, output_dir)
    selection_overrides = parse_selection_overrides(args.select)

    client = None
    if not args.dry_run:
        api_key = os.getenv("FAL_KEY", "").strip()
        if not api_key:
            raise RuntimeError(
                "Set FAL_KEY in the shell or in repo-root .env.character-images before running without --dry-run."
            )
        client = FalAIClient(
            api_key=api_key,
            base_url=args.api_base,
            text_model=args.text_model,
            edit_model=args.edit_model,
            timeout_seconds=args.timeout_seconds,
        )

    results: list[dict[str, Any]] = []
    failures = 0
    for type_code in selected_types:
        try:
            result = process_type(
                client=client,
                repo_root=repo_root,
                output_dir=output_dir,
                publish_dir=publish_dir,
                args=args,
                type_path=discovered[type_code],
                selection_overrides=selection_overrides,
            )
        except Exception as exc:
            failures += 1
            result = {
                "typeCode": type_code,
                "status": "failed",
                "error": str(exc),
            }
        else:
            if result.get("status") == "failed":
                failures += 1
        results.append(result)

    success_count = sum(1 for item in results if item.get("status") in {"success", "dry-run"})
    batch_report = {
        "skill": SKILL_NAME,
        "generatedAt": now_iso(),
        "repoRoot": str(repo_root),
        "typesDir": str(types_dir),
        "outputDir": str(output_dir),
        "publishDir": str(publish_dir),
        "publish": args.publish,
        "dryRun": args.dry_run,
        "aspectRatio": args.aspect_ratio,
        "resolution": args.resolution,
        "referenceUrlBase": args.reference_url_base,
        "successCount": success_count,
        "failureCount": failures,
        "results": results,
    }
    write_json(output_dir / "batch-report.json", batch_report)

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
