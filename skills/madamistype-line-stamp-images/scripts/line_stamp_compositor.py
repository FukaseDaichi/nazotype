from __future__ import annotations

from pathlib import Path
from typing import Any


BYTE_LIMIT = 1_000_000


def _require_pillow() -> Any:
    try:
        from PIL import Image
    except ImportError as exc:
        raise RuntimeError(
            "line_stamp_compositor.py requires Pillow. Install it before generating final sticker PNGs."
        ) from exc
    return Image


def _find_visible_bbox(image: Any, alpha_threshold: int = 8) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value > alpha_threshold else 0)
    bbox = mask.getbbox()
    if bbox is None:
        return (0, 0, image.width, image.height)
    return bbox


def _despill_green_halo(image: Any) -> Any:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            max_rb = max(r, b)
            green_excess = g - max_rb
            if green_excess <= 16:
                continue

            reduced_g = max_rb + int(green_excess * 0.18)
            if a < 200:
                reduced_a = max(0, a - int(min(70, green_excess * 0.9)))
            else:
                reduced_a = a
            pixels[x, y] = (r, max(0, min(255, reduced_g)), b, max(0, min(255, reduced_a)))
    return rgba


def compose_line_stamp(
    *,
    source_path: str | Path,
    destination_path: str | Path,
    width: int,
    height: int,
    padding_px: int,
    dpi: int = 72,
) -> dict[str, Any]:
    Image = _require_pillow()
    source_path = Path(source_path)
    destination_path = Path(destination_path)

    with Image.open(source_path) as source_image:
        source = _despill_green_halo(source_image)
        bbox = _find_visible_bbox(source)
        cropped = source.crop(bbox)

    max_width = max(1, width - (padding_px * 2))
    max_height = max(1, height - (padding_px * 2))
    scale = min(max_width / max(1, cropped.width), max_height / max(1, cropped.height))
    target_width = max(1, int(round(cropped.width * scale)))
    target_height = max(1, int(round(cropped.height * scale)))

    resampling = getattr(Image, "Resampling", Image).LANCZOS
    resized = _despill_green_halo(cropped.resize((target_width, target_height), resampling))

    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    offset_x = max(0, (width - target_width) // 2)
    offset_y = max(0, (height - target_height) // 2)
    canvas.alpha_composite(resized, (offset_x, offset_y))

    destination_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(destination_path, format="PNG", optimize=True, compress_level=9, dpi=(dpi, dpi))
    file_size = destination_path.stat().st_size
    if file_size > BYTE_LIMIT:
        raise ValueError(f"Final PNG exceeds 1MB: {destination_path} ({file_size} bytes)")

    return {
        "sourcePath": str(source_path),
        "destinationPath": str(destination_path),
        "cropBox": {"left": bbox[0], "top": bbox[1], "right": bbox[2], "bottom": bbox[3]},
        "scaledSize": {"width": target_width, "height": target_height},
        "offset": {"x": offset_x, "y": offset_y},
        "dpi": dpi,
        "fileSize": file_size,
    }
