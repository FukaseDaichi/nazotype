from __future__ import annotations

import argparse
from pathlib import Path


def remove_green_background(input_path: str | Path, output_path: str | Path) -> None:
    try:
        import cv2
        import numpy as np
    except ImportError as exc:
        raise RuntimeError(
            "background_remover.py requires opencv-python and numpy. "
            "Install them before using --with-transparent."
        ) from exc

    input_path = Path(input_path)
    output_path = Path(output_path)

    img = cv2.imread(str(input_path), cv2.IMREAD_COLOR)
    if img is None:
        raise FileNotFoundError(f"Image not found: {input_path}")

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    lower_green = np.array([40, 150, 100])
    upper_green = np.array([80, 255, 255])
    green_mask = cv2.inRange(hsv, lower_green, upper_green)

    lower_edge = np.array([35, 80, 80])
    upper_edge = np.array([85, 255, 255])
    edge_mask = cv2.inRange(hsv, lower_edge, upper_edge)

    edge_only_mask = cv2.bitwise_and(edge_mask, cv2.bitwise_not(green_mask))
    subject_mask = cv2.bitwise_not(edge_mask)

    kernel = np.ones((3, 3), np.uint8)
    subject_mask = cv2.erode(subject_mask, kernel, iterations=1)
    subject_mask = cv2.dilate(subject_mask, kernel, iterations=2)
    subject_mask = cv2.GaussianBlur(subject_mask, (5, 5), 0)

    img_bgra = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)

    b = img_bgra[:, :, 0].astype("float32")
    g = img_bgra[:, :, 1].astype("float32")
    r = img_bgra[:, :, 2].astype("float32")

    edge_pixels = edge_only_mask > 0
    max_rb = np.maximum(r, b)
    green_excess = g - max_rb
    despill_mask = edge_pixels & (green_excess > 20)
    despill_amount = green_excess * 0.7
    g[despill_mask] = g[despill_mask] - despill_amount[despill_mask]
    img_bgra[:, :, 1] = np.clip(g, 0, 255).astype("uint8")

    img_bgra[:, :, 3] = subject_mask

    output_path.parent.mkdir(parents=True, exist_ok=True)
    if not cv2.imwrite(str(output_path), img_bgra):
        raise RuntimeError(f"Failed to write transparent image: {output_path}")


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Remove green background and export transparent PNG.")
    parser.add_argument("input_path", help="Path to the green background source image.")
    parser.add_argument("output_path", help="Path to the transparent PNG output.")
    return parser.parse_args()


def main() -> None:
    args = _parse_args()
    remove_green_background(args.input_path, args.output_path)


if __name__ == "__main__":
    main()
