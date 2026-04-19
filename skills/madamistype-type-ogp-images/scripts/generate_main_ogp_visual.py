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
REFERENCE_TYPE_CODES = ("TFLP", "TRLP", "OREI", "OFEP")
TARGET_SIZE = (1200, 630)


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
        Create a premium anime-style key visual for the website "Madamis Type", a murder mystery play-style diagnosis service.
        Use the four reference characters only as visual inspiration for a representative ensemble cast.
        Preserve the feeling of four distinct mystery-archetype characters with different silhouettes, outfits, and palettes inspired by the references.
        Show exactly four characters total in one coherent scene.

        Scene direction:
        a late-night noir investigation room,
        a dramatic case-file atmosphere,
        an ivory evidence board and scattered dossiers,
        red string, paper files, photos, desk-light mood,
        elegant editorial framing,
        strong depth and cinematic lighting,
        polished anime illustration.

        Composition requirements:
        place the ensemble weighted toward the right and lower-right,
        create one large foreground character, two midground characters, and one smaller background character,
        asymmetrical composition,
        clear readable silhouettes,
        visually rich but not cluttered,
        reserve the left third for a large title treatment built directly into the artwork,
        keep generous margins so the title is not cropped.

        Title requirements:
        render the exact Japanese title "マダミスタイプ診断",
        the title must be large, stylish, crisp, and highly legible,
        use elegant Japanese display typography with a premium noir poster feeling,
        use off-white, ivory, pale gold, or warm paper-like lettering,
        make the title the only readable text in the image,
        do not misspell, distort, replace, or invent characters,
        do not add subtitles, English text, logos, labels, or any extra lettering.

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
        elegant anime key art,
        thumbnail-readable.

        Strict constraints:
        no extra text beyond the exact title "マダミスタイプ診断",
        no logo,
        no watermark,
        no UI,
        no speech bubbles,
        no extra fifth character,
        no crowded background details behind the title area,
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


def compose_final(raw_path: Path, final_path: Path) -> None:
    Image, _, _, _, _ = _import_pillow()
    canvas = _cover_resize(Image.open(raw_path).convert("RGBA"), TARGET_SIZE)

    final_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(final_path, format="PNG")


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
    compose_final(RAW_PATH, FINAL_PATH)

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
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
