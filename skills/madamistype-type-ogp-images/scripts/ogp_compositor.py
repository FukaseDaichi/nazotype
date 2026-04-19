from __future__ import annotations

from pathlib import Path
from typing import Any


TARGET_SIZE = (1200, 630)
FONT_CANDIDATES = [
    Path("/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc"),
    Path("/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc"),
    Path("/Library/Fonts/Arial Unicode.ttf"),
    Path("/System/Library/Fonts/Supplemental/Arial Unicode.ttf"),
    Path("C:/Windows/Fonts/NotoSansJP-VF.ttf"),
    Path("C:/Windows/Fonts/YuGothB.ttc"),
    Path("C:/Windows/Fonts/YuGothM.ttc"),
    Path("C:/Windows/Fonts/meiryob.ttc"),
    Path("C:/Windows/Fonts/meiryo.ttc"),
    Path("C:/Windows/Fonts/msgothic.ttc"),
    Path("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"),
    Path("/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"),
]


def _import_pillow() -> tuple[Any, Any, Any]:
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError as exc:
        raise RuntimeError("Pillow is required. Use `uv run --with pillow python ...`.") from exc
    return Image, ImageDraw, ImageFont


def _pick_font_path() -> Path | None:
    for path in FONT_CANDIDATES:
        if path.exists():
            return path
    return None


def _load_font(size: int) -> tuple[Any, str]:
    _, _, image_font = _import_pillow()
    font_path = _pick_font_path()
    if font_path is not None:
        return image_font.truetype(str(font_path), size=size), str(font_path)
    return image_font.load_default(), "default"


def _cover_resize(image: Any, target_size: tuple[int, int]) -> Any:
    image_width, image_height = image.size
    target_width, target_height = target_size
    scale = max(target_width / image_width, target_height / image_height)
    resized = image.resize((int(image_width * scale), int(image_height * scale)))
    left = max(0, (resized.size[0] - target_width) // 2)
    top = max(0, (resized.size[1] - target_height) // 2)
    return resized.crop((left, top, left + target_width, top + target_height))


def compose_ogp(
    *,
    hero_path: Path,
    output_path: Path,
    type_data: dict[str, Any],
    title_placement: str,
    brand_label: str = "謎タイプ診断",
) -> dict[str, Any]:
    image, image_draw, _ = _import_pillow()

    hero = image.open(hero_path).convert("RGBA")
    composed = _cover_resize(hero, TARGET_SIZE)
    draw = image_draw.Draw(composed, "RGBA")

    brand_font, brand_font_path = _load_font(28)
    text_bbox = draw.textbbox((0, 0), brand_label, font=brand_font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    badge_padding_x = 16
    badge_padding_y = 10
    badge_x = TARGET_SIZE[0] - text_width - (badge_padding_x * 2) - 24
    badge_y = TARGET_SIZE[1] - text_height - (badge_padding_y * 2) - 20
    badge_box = (
        badge_x,
        badge_y,
        badge_x + text_width + (badge_padding_x * 2),
        badge_y + text_height + (badge_padding_y * 2),
    )
    text_x = badge_x + badge_padding_x
    text_y = badge_y + badge_padding_y - text_bbox[1]

    draw.rounded_rectangle(
        badge_box,
        radius=14,
        fill=(14, 18, 28, 184),
        outline=(248, 245, 240, 96),
        width=1,
    )
    draw.text(
        (text_x, text_y),
        brand_label,
        font=brand_font,
        fill=(248, 245, 240, 236),
        stroke_width=2,
        stroke_fill=(10, 12, 18, 150),
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    composed.save(output_path, format="PNG")

    return {
        "targetSize": {"width": TARGET_SIZE[0], "height": TARGET_SIZE[1]},
        "titlePlacement": title_placement,
        "brandLabel": brand_label,
        "fonts": {
            "brand": brand_font_path,
        },
        "typeCode": str(type_data.get("typeCode", "")).strip().upper(),
    }
