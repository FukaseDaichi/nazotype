from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
import textwrap
from dataclasses import dataclass
from pathlib import Path
from typing import Any


SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from generate_main_ogp_visual import build_reference_urls, load_env_file
from nanobanana_client import NanoBananaClient


ROOT = Path(__file__).resolve().parents[3]
OUTPUT_DIR = ROOT / "output" / "main-ogp" / "variants"
CONTACT_SHEET_PATH = OUTPUT_DIR / "contact-sheet.png"
MANIFEST_PATH = OUTPUT_DIR / "index.json"
PREVIOUS_PUBLIC_PATH = OUTPUT_DIR / "previous-public-main-ogp.png"
PUBLIC_PATH = ROOT / "public" / "main-ogp.png"
TARGET_SIZE = (1200, 630)
FONT_SANS = Path("C:/Windows/Fonts/NotoSansJP-VF.ttf")
FONT_ALT = Path("C:/Windows/Fonts/arialbd.ttf")


@dataclass(frozen=True)
class Variant:
    slug: str
    name: str
    scene: str
    title_style: str


VARIANTS = (
    Variant(
        slug="roundtable-debate",
        name="Roundtable Debate",
        scene=(
            "a circular evidence table covered with photos, notebooks, and red-string clue cards, "
            "four characters leaning inward in the middle of an intense deduction meeting, "
            "one points to the center of the table, one speaks with an open dossier, "
            "one replies with a skeptical gesture, one listens while taking notes, "
            "oblique cinematic angle, warm desk lamps, layered depth, visible conversation energy"
        ),
        title_style=(
            "design the title as a luxurious gold-foil art-deco logotype with engraved shadow depth, "
            "thin crimson ornament lines, refined framing, and a polished mystery-poster finish"
        ),
    ),
    Variant(
        slug="evidence-board-briefing",
        name="Evidence Board Briefing",
        scene=(
            "a giant evidence board with pinned photos, suspect notes, and case documents, "
            "four characters actively briefing each other, "
            "one pins a clue onto the board, one turns to argue a theory, "
            "one crosses arms and responds, one holds files and leans forward, "
            "dramatic side light, strong depth, investigation room atmosphere"
        ),
        title_style=(
            "design the title as a dramatic ivory and crimson mystery plaque with metallic inlay, "
            "ornamental borders, subtle embossed texture, and elegant Japanese poster typography"
        ),
    ),
    Variant(
        slug="velvet-salon-conference",
        name="Velvet Salon Conference",
        scene=(
            "a late-night velvet lounge with a low coffee table covered in dossiers, glasses, and torn notes, "
            "four characters in an intimate conspiratorial discussion, "
            "they lean toward each other, exchange glances, gesture over documents, "
            "the mood is suspicious, intelligent, and theatrical, "
            "soft lamp glow, rich shadows, premium editorial composition"
        ),
        title_style=(
            "design the title as luminous antique serif lettering with layered paper-cut ornament, "
            "subtle gilded edges, elegant flourishes, and a premium stage-poster feeling"
        ),
    ),
    Variant(
        slug="secret-library-strategy",
        name="Secret Library Strategy",
        scene=(
            "a hidden library war room with maps, stacked files, hanging lamps, and open reference books, "
            "four characters mid-conversation during a high-stakes strategy talk, "
            "one flips open a file, one points toward a marked map, "
            "one reacts with a sharp counterpoint, one observes while preparing to speak, "
            "deep perspective, cinematic lighting, serious collaborative tension"
        ),
        title_style=(
            "design the title as a bold bronze-and-gold mystery logo with layered drop shadows, "
            "ornamental filigree, engraved serif strokes, and a high-end Japanese movie-poster look"
        ),
    ),
)

VARIANT_MAP = {variant.slug: variant for variant in VARIANTS}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--variant",
        action="append",
        choices=sorted(VARIANT_MAP.keys()),
        help="Generate only the specified variant. Repeat to generate multiple variants.",
    )
    parser.add_argument(
        "--publish",
        choices=sorted(VARIANT_MAP.keys()),
        help="Copy the selected generated variant to public/main-ogp.png.",
    )
    parser.add_argument(
        "--contact-sheet",
        action="store_true",
        help="Build a contact sheet from already generated variants.",
    )
    return parser.parse_args()


def _import_pillow() -> tuple[Any, Any, Any]:
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError as exc:
        raise RuntimeError("Pillow is required. Run with `uv run --with pillow python ...`.") from exc
    return Image, ImageDraw, ImageFont


def _cover_resize(image: Any, target_size: tuple[int, int]) -> Any:
    Image, _, _ = _import_pillow()
    image_width, image_height = image.size
    target_width, target_height = target_size
    scale = max(target_width / image_width, target_height / image_height)
    resized = image.resize(
        (int(image_width * scale), int(image_height * scale)),
        Image.Resampling.LANCZOS,
    )
    left = max(0, (resized.size[0] - target_width) // 2)
    top = max(0, (resized.size[1] - target_height) // 2)
    return resized.crop((left, top, left + target_width, top + target_height))


def _load_font(size: int) -> Any:
    _, _, image_font = _import_pillow()
    if FONT_SANS.exists():
        return image_font.truetype(str(FONT_SANS), size=size)
    if FONT_ALT.exists():
        return image_font.truetype(str(FONT_ALT), size=size)
    return image_font.load_default()


def build_prompt(variant: Variant) -> str:
    return textwrap.dedent(
        f"""
        Create a premium anime-style key visual for the website "Madamis Type", a murder mystery play-style diagnosis service.
        Use the four reference characters only as visual inspiration for a representative ensemble cast.
        Preserve the feeling of four distinct mystery-archetype characters with different silhouettes, outfits, and palettes inspired by the references.
        Show exactly four characters total in one coherent scene.

        Core story direction:
        the four characters are actively discussing a case,
        they should be making eye contact, reacting to each other, interrupting, leaning in, and gesturing over evidence,
        it must feel like a live deduction meeting in progress instead of a static lineup,
        not everyone faces the camera,
        not a hero pose poster,
        not an action battle scene,
        the energy is intelligent, tense, collaborative, and suspicious.

        Scene direction:
        {variant.scene}

        Composition requirements:
        build a strong conversation arc with overlapping poses and expressive hands,
        keep the title integrated into the scene as part of the poster design,
        preserve enough open structure so the title remains clean and readable,
        let props, paper layers, red string, lamps, files, and atmospheric details support the composition,
        keep the image thumbnail-readable and not cluttered.

        Title requirements:
        render the exact Japanese title "マダミスタイプ診断" exactly once,
        make it very large, iconic, stylish, and highly legible,
        {variant.title_style},
        the title should feel like a premium Japanese mystery movie logo,
        prioritize elegant readable Japanese characters over excessive effects,
        no missing characters, no swapped characters, no gibberish, no fake text, no extra words.

        Character direction:
        mystery, deduction, observation, performance, psychological tension,
        stylish investigative fashion,
        varied poses with clear motion,
        each character should feel intelligent, theatrical, and suspicious in a different way,
        no comedic expression,
        no mascot look,
        no chibi proportions.

        Visual style:
        premium,
        dramatic,
        clean,
        editorial,
        noir case file,
        elegant anime poster art,
        luxurious finish,
        thumbnail-readable.

        Strict constraints:
        no extra text beyond the exact title "マダミスタイプ診断",
        no logo,
        no watermark,
        no UI,
        no speech bubbles,
        no extra fifth character,
        no split-panel comic layout,
        no collage borders.
        """
    ).strip()


def compose_final(raw_path: Path, final_path: Path) -> None:
    Image, _, _ = _import_pillow()
    canvas = _cover_resize(Image.open(raw_path).convert("RGBA"), TARGET_SIZE)
    final_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(final_path, format="PNG")


def variant_paths(variant: Variant) -> dict[str, Path]:
    variant_dir = OUTPUT_DIR / variant.slug
    return {
        "dir": variant_dir,
        "prompt": variant_dir / "prompt.txt",
        "request": variant_dir / "request.json",
        "task": variant_dir / "task.json",
        "raw": variant_dir / "raw.png",
        "final": variant_dir / "final.png",
        "meta": variant_dir / "meta.json",
    }


def generate_variant(client: NanoBananaClient, variant: Variant, reference_urls: list[str]) -> dict[str, Any]:
    paths = variant_paths(variant)
    paths["dir"].mkdir(parents=True, exist_ok=True)

    prompt = build_prompt(variant)
    paths["prompt"].write_text(prompt, encoding="utf-8")

    payload, submit_response = client.generate_image(
        prompt=prompt,
        image_urls=reference_urls,
        aspect_ratio="16:9",
        resolution="2K",
        output_format="png",
        google_search=False,
    )
    task_id = str(((submit_response.get("data") or {}).get("taskId") or "")).strip()
    if not task_id:
        raise RuntimeError(f"Missing taskId in NanoBanana response for {variant.slug}: {submit_response}")

    final_task_response = client.wait_for_task(task_id, poll_interval=8, timeout_seconds=900)
    result_image_url = str((((final_task_response.get("data") or {}).get("response") or {}).get("resultImageUrl") or "")).strip()
    if not result_image_url:
        raise RuntimeError(f"Missing resultImageUrl in task response for {variant.slug}: {final_task_response}")

    paths["request"].write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    paths["task"].write_text(
        json.dumps(
            {
                "submitResponse": submit_response,
                "finalTaskResponse": final_task_response,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    client.download_file(result_image_url, paths["raw"])
    compose_final(paths["raw"], paths["final"])

    meta = {
        "slug": variant.slug,
        "name": variant.name,
        "scene": variant.scene,
        "titleStyle": variant.title_style,
        "prompt": str(paths["prompt"]),
        "request": str(paths["request"]),
        "task": str(paths["task"]),
        "raw": str(paths["raw"]),
        "final": str(paths["final"]),
        "resultImageUrl": result_image_url,
        "size": {"width": TARGET_SIZE[0], "height": TARGET_SIZE[1]},
    }
    paths["meta"].write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    return meta


def load_existing_meta(variant: Variant) -> dict[str, Any] | None:
    meta_path = variant_paths(variant)["meta"]
    if not meta_path.exists():
        return None
    return json.loads(meta_path.read_text(encoding="utf-8"))


def write_manifest(entries: list[dict[str, Any]]) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(
        json.dumps(
            {
                "variants": entries,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )


def build_contact_sheet(entries: list[dict[str, Any]]) -> None:
    if not entries:
        return

    Image, ImageDraw, _ = _import_pillow()
    tile_w = 560
    tile_h = 294
    margin = 40
    gutter = 28
    header_h = 92
    label_h = 58
    rows = (len(entries) + 1) // 2
    sheet_w = margin * 2 + tile_w * 2 + gutter
    sheet_h = margin * 2 + header_h + rows * tile_h + max(0, rows - 1) * gutter + rows * label_h

    sheet = Image.new("RGB", (sheet_w, sheet_h), "#100d09")
    draw = ImageDraw.Draw(sheet)
    font_title = _load_font(34)
    font_label = _load_font(20)
    font_meta = _load_font(16)

    draw.text((margin, margin - 2), "Main OGP Variants", font=font_title, fill="#f3ead6")
    draw.text((margin, margin + 40), "discussion-focused NanoBanana candidates", font=font_meta, fill="#bca47a")

    for index, entry in enumerate(entries):
        row = index // 2
        col = index % 2
        x = margin + col * (tile_w + gutter)
        y = margin + header_h + row * (tile_h + label_h + gutter)

        preview = _cover_resize(Image.open(entry["final"]).convert("RGB"), (tile_w, tile_h))
        sheet.paste(preview, (x, y))

        draw.rounded_rectangle((x, y, x + tile_w, y + tile_h), radius=12, outline="#8a6b2f", width=2)
        draw.text((x, y + tile_h + 10), f"{index + 1}. {entry['name']}", font=font_label, fill="#f3ead6")
        draw.text((x, y + tile_h + 34), entry["slug"], font=font_meta, fill="#bca47a")

    CONTACT_SHEET_PATH.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(CONTACT_SHEET_PATH, format="PNG")


def publish_variant(slug: str) -> None:
    variant = VARIANT_MAP[slug]
    final_path = variant_paths(variant)["final"]
    if not final_path.exists():
        raise FileNotFoundError(f"Variant image not found: {final_path}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    if PUBLIC_PATH.exists():
        shutil.copy2(PUBLIC_PATH, PREVIOUS_PUBLIC_PATH)
    shutil.copy2(final_path, PUBLIC_PATH)


def main() -> int:
    args = parse_args()
    selected_variants = [VARIANT_MAP[slug] for slug in (args.variant or list(VARIANT_MAP.keys()))]

    load_env_file(ROOT / ".env.character-images")
    api_key = os.getenv("NANOBANANA_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("NANOBANANA_API_KEY is required in .env.character-images or the environment.")

    if args.contact_sheet and not args.variant and not args.publish:
        entries = [entry for variant in VARIANTS if (entry := load_existing_meta(variant))]
        write_manifest(entries)
        build_contact_sheet(entries)
        return 0

    client = NanoBananaClient(
        api_key=api_key,
        base_url=os.getenv("NANOBANANA_API_BASE", "https://api.nanobananaapi.ai").strip(),
        timeout_seconds=90,
    )

    reference_urls = build_reference_urls()
    entries = []
    for variant in selected_variants:
        entries.append(generate_variant(client, variant, reference_urls))

    if args.publish:
        publish_variant(args.publish)

    if args.contact_sheet or len(entries) > 1:
        existing_entries = [entry for variant in VARIANTS if (entry := load_existing_meta(variant))]
        write_manifest(existing_entries)
        build_contact_sheet(existing_entries)
    else:
        write_manifest(entries)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
