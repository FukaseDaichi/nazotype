from __future__ import annotations

import json
import os
import shutil
import sys
import textwrap
from pathlib import Path
from typing import Any


SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from fal_client import FalAIClient


ROOT = Path(__file__).resolve().parents[3]
OUTPUT_DIR = ROOT / "output" / "main-ogp"
WORK_DIR = OUTPUT_DIR / "fal"
RAW_PATH = WORK_DIR / "raw.png"
FINAL_PATH = OUTPUT_DIR / "main-ogp.png"
PUBLIC_PATH = ROOT / "public" / "main-ogp.png"
META_PATH = OUTPUT_DIR / "meta.json"
REQUEST_PATH = WORK_DIR / "request.json"
TASK_PATH = WORK_DIR / "task.json"
PROMPT_PATH = WORK_DIR / "prompt.txt"
PREVIOUS_PUBLIC_PATH = WORK_DIR / "previous-public-main-ogp.png"
REFERENCE_URL_BASE = os.getenv(
    "FAL_REFERENCE_BASE_URL",
    "https://raw.githubusercontent.com/FukaseDaichi/nazotype/refs/heads/main/public/types",
).rstrip("/")
REFERENCE_TYPE_CODES = ("abhc", "abtn", "alhn", "dltc")
TARGET_SIZE = (1200, 630)
FONT_CANDIDATES = [
    Path("/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc"),
    Path("/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc"),
    Path("/Library/Fonts/Arial Unicode.ttf"),
    Path("/System/Library/Fonts/Supplemental/Arial Unicode.ttf"),
    Path("C:/Windows/Fonts/NotoSansJP-VF.ttf"),
    Path("C:/Windows/Fonts/YuGothB.ttc"),
    Path("C:/Windows/Fonts/YuGothM.ttc"),
]


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        if stripped.startswith("export "):
            stripped = stripped[len("export ") :].strip()
        key, value = stripped.split("=", 1)
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]
        if key:
            os.environ.setdefault(key, value)


def build_reference_urls() -> list[str]:
    return [f"{REFERENCE_URL_BASE}/{type_code}.png" for type_code in REFERENCE_TYPE_CODES]


def build_prompt() -> str:
    return textwrap.dedent(
        """
        Create a premium anime-style key visual for the website "謎解きタイプ診断", a play-style diagnosis service for escape rooms, puzzle events, and cooperative mystery games.
        Use the four reference characters only as visual inspiration for a representative ensemble cast from the current service.
        Preserve the feeling of four distinct puzzle-archetype characters with different silhouettes, outfits, props, and palettes inspired by the references.
        Show exactly four characters total in one coherent scene.

        Scene direction:
        a late-night clue analysis room,
        a dramatic evidence-board and puzzle-war-room atmosphere,
        clue cards, coded notes, maps, desk lights, paper files, and red-string energy,
        elegant editorial framing with a premium mystery-poster mood,
        strong depth, layered lighting, and cinematic contrast,
        polished anime illustration.

        Composition requirements:
        place the ensemble weighted toward the center-right and lower-right,
        create one large foreground character, two midground characters, and one smaller background character,
        all four characters should feel connected in one active strategy moment rather than a lineup,
        asymmetrical composition,
        clear readable silhouettes,
        visually rich but not cluttered,
        reserve the left third for local title compositing after generation,
        keep generous negative space on the left so a large title can be added later without fighting the artwork,
        do not place faces or important props deep inside the far-left title zone.

        Character direction:
        deduction, observation, communication, quick thinking, team play, psychological tension,
        stylish investigative fashion,
        varied poses with clear motion and overlapping conversation energy,
        each character should feel intelligent, cool, and capable in a different way,
        no comedic expression or mascot presentation,
        no mascot look,
        no chibi proportions.

        Visual style:
        premium,
        dramatic,
        clean,
        editorial,
        puzzle-noir strategy room,
        elegant anime key art with luxury poster sensibility,
        thumbnail-readable.

        Strict constraints:
        no text,
        no logo,
        no watermark,
        no UI,
        no speech bubbles,
        no extra fifth character,
        no crowded details that overwhelm the left title zone,
        no split-panel comic layout,
        no collage borders.
        """
    ).strip()


def _import_pillow() -> tuple[Any, Any, Any, Any]:
    try:
        from PIL import Image, ImageColor, ImageDraw, ImageFilter, ImageFont
    except ImportError as exc:
        raise RuntimeError("Pillow is required. Run with `uv run --with pillow python ...`.") from exc
    return Image, ImageColor, ImageDraw, ImageFilter, ImageFont


def _pick_font_path() -> Path | None:
    for path in FONT_CANDIDATES:
        if path.exists():
            return path
    return None


def _load_font(size: int) -> tuple[Any, str]:
    _, _, _, _, image_font = _import_pillow()
    font_path = _pick_font_path()
    if font_path is not None:
        return image_font.truetype(str(font_path), size=size), str(font_path)
    return image_font.load_default(), "default"


def _cover_resize(image: Any, target_size: tuple[int, int]) -> Any:
    Image, _, _, _, _ = _import_pillow()
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


def compose_final(raw_path: Path, final_path: Path) -> dict[str, Any]:
    Image, ImageColor, ImageDraw, ImageFilter, _ = _import_pillow()
    canvas = _cover_resize(Image.open(raw_path).convert("RGBA"), TARGET_SIZE)

    overlay = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")

    panel_box = (32, 34, 522, 596)
    draw.rounded_rectangle(
        panel_box,
        radius=32,
        fill=(9, 13, 24, 196),
        outline=(240, 225, 196, 78),
        width=2,
    )
    draw.ellipse((-160, -140, 640, 700), fill=(8, 12, 20, 84))
    draw.ellipse((620, -40, 1300, 420), fill=(187, 126, 34, 20))
    draw.line((68, 114, 474, 114), fill=(221, 184, 118, 68), width=2)
    draw.line((68, 500, 474, 500), fill=(221, 184, 118, 40), width=1)

    title_font, title_font_path = _load_font(84)
    subtitle_font, subtitle_font_path = _load_font(26)
    stat_font, stat_font_path = _load_font(24)
    micro_font, micro_font_path = _load_font(18)

    subtitle = "32問でわかる、あなたの謎解きスタイル"
    title = "謎解き\nタイプ診断"
    stat = "32問 ・ 4軸 ・ 16タイプ"

    subtitle_fill = ImageColor.getrgb("#d2b06e") + (232,)
    title_fill = ImageColor.getrgb("#f6eddc") + (242,)
    stroke_fill = ImageColor.getrgb("#101522") + (220,)
    shadow_fill = ImageColor.getrgb("#000000") + (96,)

    draw.multiline_text(
        (70, 146),
        title,
        font=title_font,
        fill=shadow_fill,
        spacing=6,
    )
    draw.text((70, 72), subtitle, font=subtitle_font, fill=subtitle_fill)
    draw.multiline_text(
        (64, 140),
        title,
        font=title_font,
        fill=title_fill,
        spacing=6,
        stroke_width=2,
        stroke_fill=stroke_fill,
    )
    draw.text((70, 396), "協力型謎解きの立ち回りを、\nシネマティックなタイプ像で可視化する。", font=stat_font, fill=(228, 220, 204, 216), spacing=10)

    badge_box = (68, 492, 344, 542)
    draw.rounded_rectangle(badge_box, radius=18, fill=(189, 130, 42, 228))
    draw.text((90, 503), stat, font=micro_font, fill=(20, 18, 14, 240))

    corner = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    corner_draw = ImageDraw.Draw(corner, "RGBA")
    corner_draw.rounded_rectangle((12, 12, 1188, 618), radius=30, outline=(245, 235, 214, 58), width=2)
    corner_draw.arc((20, 20, 120, 120), start=180, end=270, fill=(245, 235, 214, 68), width=2)
    corner_draw.arc((1080, 20, 1180, 120), start=270, end=360, fill=(245, 235, 214, 68), width=2)
    corner_draw.arc((20, 510, 120, 610), start=90, end=180, fill=(245, 235, 214, 68), width=2)
    corner_draw.arc((1080, 510, 1180, 610), start=0, end=90, fill=(245, 235, 214, 68), width=2)

    overlay = overlay.filter(ImageFilter.GaussianBlur(0.3))
    canvas = Image.alpha_composite(canvas, overlay)
    canvas = Image.alpha_composite(canvas, corner)

    final_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(final_path, format="PNG")
    return {
        "fonts": {
            "title": title_font_path,
            "subtitle": subtitle_font_path,
            "stat": stat_font_path,
            "micro": micro_font_path,
        },
        "title": title,
        "subtitle": subtitle,
        "stat": stat,
    }


def main() -> int:
    load_env_file(ROOT / ".env.character-images")
    api_key = os.getenv("FAL_KEY", "").strip()
    if not api_key:
        raise RuntimeError("FAL_KEY is required in .env.character-images or the environment.")

    client = FalAIClient(
        api_key=api_key,
        base_url=os.getenv("FAL_QUEUE_URL", "https://queue.fal.run").strip(),
        text_model=os.getenv("FAL_MODEL", "fal-ai/nano-banana-2").strip(),
        edit_model=os.getenv("FAL_EDIT_MODEL", "fal-ai/nano-banana-2/edit").strip(),
        timeout_seconds=90,
    )

    prompt = build_prompt()
    reference_urls = build_reference_urls()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    PROMPT_PATH.write_text(prompt, encoding="utf-8")

    payload, submit_response = client.generate_image(
        prompt=prompt,
        image_urls=reference_urls,
        aspect_ratio="16:9",
        resolution="2K",
        output_format="png",
        google_search=False,
    )
    request_id = client.extract_request_id(submit_response)
    if not request_id:
        raise RuntimeError(f"Missing request_id in fal.ai response: {submit_response}")

    model_path = str(submit_response.get("model_path") or client.edit_model).strip()
    final_task_response = client.wait_for_task(
        request_id,
        model_path=model_path,
        status_url=str(submit_response.get("status_url") or "").strip() or None,
        response_url=str(submit_response.get("response_url") or "").strip() or None,
        poll_interval=8,
        timeout_seconds=900,
    )
    result_image_url = str(client.extract_result_image_url(final_task_response) or "").strip()
    if not result_image_url:
        raise RuntimeError(f"Missing result image URL in fal.ai task response: {final_task_response}")

    REQUEST_PATH.write_text(
        json.dumps(
            {
                "prompt": prompt,
                "image_urls": reference_urls,
                "aspect_ratio": "16:9",
                "resolution": "2K",
                "output_format": "png",
                "enable_web_search": False,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    TASK_PATH.write_text(
        json.dumps(
            {
                "requestId": request_id,
                "modelPath": model_path,
                "submitResponse": submit_response,
                "finalTaskResponse": final_task_response,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    client.download_file(result_image_url, RAW_PATH)
    compose_meta = compose_final(RAW_PATH, FINAL_PATH)

    if PUBLIC_PATH.exists():
        shutil.copy2(PUBLIC_PATH, PREVIOUS_PUBLIC_PATH)
    shutil.copy2(FINAL_PATH, PUBLIC_PATH)

    META_PATH.write_text(
        json.dumps(
            {
                "asset": str(PUBLIC_PATH),
                "working": str(FINAL_PATH),
                "raw": str(RAW_PATH),
                "prompt": str(PROMPT_PATH),
                "request": str(REQUEST_PATH),
                "task": str(TASK_PATH),
                "sourceSkill": "madamistype-type-ogp-images",
                "sourceTypeCodes": list(REFERENCE_TYPE_CODES),
                "referenceUrlBase": REFERENCE_URL_BASE,
                "resultImageUrl": result_image_url,
                "size": {"width": TARGET_SIZE[0], "height": TARGET_SIZE[1]},
                "compositor": compose_meta,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
