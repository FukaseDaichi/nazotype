from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


SCRIPT_DIR = Path(__file__).resolve().parent

from line_stamp_prompt_builder import build_manifest, build_review_markdown, load_stamp_set, load_type_data


SKILL_NAME = "madamistype-line-stamp-prompts"


def repo_root_from_script() -> Path:
    return SCRIPT_DIR.parent.parent.parent


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def write_text(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value, encoding="utf-8")


def discover_set_files(sets_dir: Path) -> dict[str, Path]:
    return {path.stem: path for path in sorted(sets_dir.glob("*.json"))}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate Madamistype LINE sticker prompt manifests.")
    parser.add_argument("--all", action="store_true", help="Generate prompt manifests for every sticker set JSON.")
    parser.add_argument("--sets", help="Comma-separated set ids to process.")
    parser.add_argument("--output-dir", help="Override the output directory.")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing manifest outputs.")
    args = parser.parse_args()

    if not args.all and not args.sets:
        parser.error("Pass one of --all or --sets.")

    return args


def parse_selected_sets(args: argparse.Namespace, discovered: dict[str, Path]) -> list[str]:
    if args.sets:
        requested = [item.strip() for item in args.sets.split(",") if item.strip()]
        missing = [item for item in requested if item not in discovered]
        if missing:
            raise ValueError(f"Unknown set ids: {', '.join(missing)}")
        return requested
    return sorted(discovered)


def write_asset_artifacts(set_root: Path, asset: dict[str, Any]) -> None:
    role = str(asset["role"])
    if role in {"main", "tab"}:
        asset_root = set_root / role
        write_text(asset_root / "prompt.txt", str(asset["prompt"]))
        write_text(asset_root / "negative_prompt.txt", str(asset["negativePrompt"]))
        write_json(asset_root / "meta.json", asset)
        return

    asset_id = str(asset["id"])
    asset_root = set_root / "stamps" / asset_id
    write_text(asset_root / "prompt.txt", str(asset["prompt"]))
    write_text(asset_root / "negative_prompt.txt", str(asset["negativePrompt"]))
    write_json(asset_root / "spec.json", asset)


def process_set(*, repo_root: Path, output_root: Path, set_path: Path, overwrite: bool) -> dict[str, Any]:
    set_data = load_stamp_set(set_path)
    set_id = str(set_data["setId"]).strip()
    type_code = str(set_data["typeCode"]).strip().upper()
    type_path = repo_root / "data" / "types" / f"{type_code}.json"
    if not type_path.exists():
        raise FileNotFoundError(f"Type JSON not found for set {set_id}: {type_path}")

    set_root = output_root / set_id
    manifest_path = set_root / "manifest.json"
    if manifest_path.exists() and not overwrite:
        return {
            "setId": set_id,
            "typeCode": type_code,
            "status": "skipped",
            "manifestPath": str(manifest_path),
        }

    type_data = load_type_data(type_path)
    manifest = build_manifest(repo_root=repo_root, type_data=type_data, set_data=set_data)

    write_json(manifest_path, manifest)
    write_text(set_root / "review.md", build_review_markdown(manifest))
    for asset in manifest["assets"]:
        write_asset_artifacts(set_root, asset)

    return {
        "setId": set_id,
        "typeCode": type_code,
        "status": "success",
        "manifestPath": str(manifest_path),
        "assetCount": len(manifest["assets"]),
    }


def main() -> None:
    args = parse_args()
    repo_root = repo_root_from_script()
    sets_dir = repo_root / "data" / "line-stamps"
    if not sets_dir.exists():
        raise FileNotFoundError(f"Sticker set directory not found: {sets_dir}")

    discovered = discover_set_files(sets_dir)
    if not discovered:
        raise FileNotFoundError(f"No sticker set JSON files found in {sets_dir}")

    selected = parse_selected_sets(args, discovered)
    output_root = Path(args.output_dir) if args.output_dir else repo_root / "output" / "line-stamp-prompts"

    results: list[dict[str, Any]] = []
    for set_id in selected:
        results.append(
            process_set(
                repo_root=repo_root,
                output_root=output_root,
                set_path=discovered[set_id],
                overwrite=args.overwrite,
            )
        )

    write_json(
        output_root / "batch-report.json",
        {
            "skill": SKILL_NAME,
            "results": results,
        },
    )


if __name__ == "__main__":
    main()
