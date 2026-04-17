from __future__ import annotations

from pathlib import Path
from typing import Any


def _require_pillow() -> Any:
    try:
        from PIL import Image
    except ImportError as exc:
        raise RuntimeError(
            "line_stamp_validator.py requires Pillow. Install it before validating sticker PNGs."
        ) from exc
    return Image


def _find_visible_bbox(image: Any, alpha_threshold: int = 8) -> tuple[int, int, int, int] | None:
    if "A" not in image.getbands():
        return None
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value > alpha_threshold else 0)
    return mask.getbbox()


def _has_alpha(image: Any) -> bool:
    return "A" in image.getbands() or "transparency" in image.info


def _measure_green_ratio(image: Any) -> float:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    visible = 0
    greenish = 0
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            if a <= 32:
                continue
            visible += 1
            if g > 100 and g > r + 30 and g > b + 30:
                greenish += 1
    if visible == 0:
        return 0.0
    return greenish / visible


def _try_ocr_text(image: Any, expected_text: str) -> dict[str, Any]:
    try:
        import pytesseract
    except ImportError:
        return {
            "status": "skipped",
            "reason": "pytesseract is not installed.",
            "detectedText": None,
        }

    try:
        detected = pytesseract.image_to_string(image.convert("RGBA"), config="--psm 6")
    except Exception as exc:  # pragma: no cover - depends on local OCR setup
        return {
            "status": "skipped",
            "reason": f"OCR failed: {exc}",
            "detectedText": None,
        }

    normalized_expected = "".join(expected_text.split())
    normalized_detected = "".join(detected.split())
    return {
        "status": "passed" if normalized_expected and normalized_expected in normalized_detected else "failed",
        "reason": None,
        "detectedText": detected.strip() or None,
    }


def validate_line_stamp_image(
    *,
    image_path: str | Path,
    expected_width: int,
    expected_height: int,
    padding_px: int,
    expected_text: str | None = None,
) -> dict[str, Any]:
    Image = _require_pillow()
    image_path = Path(image_path)
    failures: list[str] = []
    warnings: list[str] = []

    if not image_path.exists():
        return {
            "passed": False,
            "failures": [f"Image not found: {image_path}"],
            "warnings": [],
        }

    file_size = image_path.stat().st_size
    if file_size > 1_000_000:
        failures.append(f"File size exceeds 1MB: {file_size} bytes")

    with Image.open(image_path) as image:
        image.load()
        bbox = _find_visible_bbox(image)
        has_alpha = _has_alpha(image)
        green_ratio = _measure_green_ratio(image)
        dpi_info = image.info.get("dpi")
        ocr_result = _try_ocr_text(image, expected_text) if expected_text else None

        if image.format != "PNG":
            failures.append(f"Unexpected image format: {image.format}")
        if image.width != expected_width or image.height != expected_height:
            failures.append(
                f"Unexpected canvas size: {image.width}x{image.height}, expected {expected_width}x{expected_height}"
            )
        if image.width % 2 != 0 or image.height % 2 != 0:
            failures.append("Image dimensions must be even.")
        if image.mode != "RGBA":
            failures.append(f"Unexpected image mode: {image.mode}. Expected RGBA.")
        if not has_alpha:
            failures.append("Image does not expose an alpha channel.")

        dpi_x = dpi_y = None
        if isinstance(dpi_info, tuple) and len(dpi_info) >= 2:
            dpi_x, dpi_y = dpi_info[0], dpi_info[1]
            if dpi_x < 72 or dpi_y < 72:
                failures.append(f"DPI is below 72: {dpi_x}x{dpi_y}")
        else:
            failures.append("PNG DPI metadata is missing.")

        padding = None
        if bbox is None:
            failures.append("Visible foreground was not detected.")
        else:
            left, top, right, bottom = bbox
            padding = {
                "left": left,
                "top": top,
                "right": expected_width - right,
                "bottom": expected_height - bottom,
            }
            min_padding = max(0, padding_px - 2)
            for side, value in padding.items():
                if value < min_padding:
                    failures.append(f"Outer padding is too small on {side}: {value}px")

        if green_ratio > 0.02:
            failures.append(f"Visible green fringe ratio is too high: {green_ratio:.4f}")

        if ocr_result:
            if ocr_result["status"] == "failed":
                warnings.append(
                    f"Expected text `{expected_text}` was not confirmed by OCR. Detected: {ocr_result.get('detectedText')!r}"
                )
            elif ocr_result["status"] == "skipped":
                warnings.append(f"Text OCR skipped: {ocr_result['reason']}")

    return {
        "passed": not failures,
        "imagePath": str(image_path),
        "fileSize": file_size,
        "expectedSize": {"width": expected_width, "height": expected_height},
        "padding": padding,
        "greenRatio": green_ratio,
        "ocr": ocr_result,
        "failures": failures,
        "warnings": warnings,
    }
