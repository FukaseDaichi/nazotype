from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageChops, ImageColor, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[3]
TARGET_SIZE = (1200, 630)
OUTPUT_PATH = ROOT / "output" / "main-ogp" / "main-ogp.png"
META_PATH = ROOT / "output" / "main-ogp" / "meta.json"
PUBLISH_PATH = ROOT / "public" / "main-ogp.png"
TYPE_CODES = ("TFLP", "TRLP", "OREI", "OFEP")
BG_NOIR = "#0d0b08"
BG_WARM = "#1c1508"
PAPER = "#f0e8d5"
PAPER_DARK = "#e2d6be"
INK = "#1a1208"
STAMP = "#c0392b"
SEPIA = "#8b6914"
SEPIA_LIGHT = "#c4a96b"
AMBER = "#d4820a"
GRID = (196, 169, 107, 18)

FONT_SERIF = Path("C:/Windows/Fonts/NotoSerifJP-VF.ttf")
FONT_SANS = Path("C:/Windows/Fonts/NotoSansJP-VF.ttf")
FONT_ALT = Path("C:/Windows/Fonts/arialbd.ttf")


def load_font(path: Path, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    if path.exists():
        return ImageFont.truetype(str(path), size=size)
    if FONT_ALT.exists():
        return ImageFont.truetype(str(FONT_ALT), size=size)
    return ImageFont.load_default()


def rgba(value: str, alpha: int) -> tuple[int, int, int, int]:
    red, green, blue = ImageColor.getrgb(value)
    return red, green, blue, alpha


def non_transparent_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A")
    background = Image.new("L", image.size, 0)
    diff = ImageChops.difference(alpha, background)
    return diff.getbbox() or (0, 0, image.width, image.height)


def fit_image(image: Image.Image, target_size: tuple[int, int]) -> Image.Image:
    box = non_transparent_bbox(image)
    cropped = image.crop(box)
    ratio = min(target_size[0] / cropped.width, target_size[1] / cropped.height)
    resized = cropped.resize(
        (max(1, int(cropped.width * ratio)), max(1, int(cropped.height * ratio))),
        Image.Resampling.LANCZOS,
    )
    return resized


def draw_background(canvas: Image.Image) -> None:
    draw = ImageDraw.Draw(canvas, "RGBA")
    draw.rectangle((0, 0, *TARGET_SIZE), fill=BG_NOIR)

    for bounds, color in (
        ((-120, -90, 520, 400), rgba(BG_WARM, 220)),
        ((690, 220, 1320, 760), (18, 12, 5, 255)),
        ((810, -80, 1300, 260), rgba("#2a1f08", 200)),
    ):
        draw.ellipse(bounds, fill=color)

    for x in range(0, TARGET_SIZE[0], 32):
        draw.line((x, 0, x, TARGET_SIZE[1]), fill=GRID, width=1)
    for y in range(0, TARGET_SIZE[1], 32):
        draw.line((0, y, TARGET_SIZE[0], y), fill=GRID, width=1)


def draw_character_layer(base: Image.Image, type_code: str, bounds: tuple[int, int, int, int], tint: str) -> None:
    source = Image.open(ROOT / "public" / "types" / f"{type_code}.png").convert("RGBA")
    fitted = fit_image(source, (bounds[2] - bounds[0], bounds[3] - bounds[1]))

    shadow = Image.new("RGBA", fitted.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow, "RGBA")
    alpha = fitted.getchannel("A")
    shadow_draw.bitmap((0, 0), alpha, fill=(0, 0, 0, 170))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))

    tint_layer = Image.new("RGBA", fitted.size, rgba(tint, 42))
    tinted = Image.alpha_composite(fitted, tint_layer)

    center_x = bounds[0] + (bounds[2] - bounds[0] - fitted.width) // 2
    center_y = bounds[1] + (bounds[3] - bounds[1] - fitted.height) // 2

    base.alpha_composite(shadow, (center_x + 18, center_y + 22))
    base.alpha_composite(tinted, (center_x, center_y))


def draw_paper_panel(base: Image.Image) -> None:
    panel = Image.new("RGBA", (560, 520), rgba(PAPER, 255))
    draw = ImageDraw.Draw(panel, "RGBA")
    draw.rectangle((0, 0, 559, 519), outline=rgba(SEPIA_LIGHT, 150), width=2)

    for x in range(0, panel.width, 40):
        draw.line((x, 0, x, panel.height), fill=rgba(SEPIA, 22), width=1)
    draw.line((56, 0, 56, panel.height), fill=rgba(STAMP, 80), width=2)

    draw.rounded_rectangle((406, 34, 534, 76), radius=12, outline=rgba(STAMP, 200), width=3)

    serif_l = load_font(FONT_SERIF, 60)
    serif_m = load_font(FONT_SERIF, 24)
    serif_s = load_font(FONT_SERIF, 18)
    sans_s = load_font(FONT_SANS, 18)
    sans_m = load_font(FONT_SANS, 22)
    sans_l = load_font(FONT_SANS, 28)

    draw.text((34, 32), "Case File / Main Share Visual", font=sans_s, fill=rgba(SEPIA, 220))
    draw.text((420, 40), "TOP", font=sans_m, fill=rgba(STAMP, 220))
    draw.text((34, 92), "マダミスタイプ診断", font=serif_l, fill=INK)
    draw.text((38, 172), "Noir Case File", font=sans_l, fill=rgba(STAMP, 220))
    draw.text(
        (34, 214),
        "32問の答えから、卓上での立ち回りを\n4軸16タイプで見える化する。",
        font=serif_m,
        fill=rgba("#3d2e10", 240),
        spacing=10,
    )

    draw.text(
        (34, 302),
        "夜の捜査記録のように、\n自分のプレイ傾向を機密ファイルとして受け取る。",
        font=serif_s,
        fill=rgba("#6b5020", 230),
        spacing=8,
    )

    stats = (
        ("32", "Questions"),
        ("4", "Axes"),
        ("16", "Types"),
    )
    stat_x = 34
    for value, label in stats:
        draw.rectangle((stat_x, 402, stat_x + 150, 474), fill=rgba(INK, 248), outline=rgba(SEPIA_LIGHT, 90), width=1)
        draw.text((stat_x + 16, 414), value, font=load_font(FONT_SANS, 42), fill=rgba(AMBER, 255))
        draw.text((stat_x + 74, 428), label, font=sans_s, fill=rgba(SEPIA_LIGHT, 220))
        stat_x += 170

    draw.text((34, 488), "murder mystery types / share-ready key visual", font=sans_s, fill=rgba(SEPIA, 170))

    tape = Image.new("RGBA", panel.size, (0, 0, 0, 0))
    tape_draw = ImageDraw.Draw(tape, "RGBA")
    tape_draw.rounded_rectangle((224, -8, 340, 28), radius=8, fill=(210, 190, 140, 138))
    tape_draw.rounded_rectangle((18, 476, 128, 512), radius=8, fill=(210, 190, 140, 116))
    tape = tape.rotate(-3, resample=Image.Resampling.BICUBIC, center=(282, 10))
    panel.alpha_composite(tape)

    panel_shadow = Image.new("RGBA", (600, 560), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(panel_shadow, "RGBA")
    shadow_draw.rounded_rectangle((20, 20, 580, 540), radius=18, fill=(0, 0, 0, 140))
    panel_shadow = panel_shadow.filter(ImageFilter.GaussianBlur(28))

    base.alpha_composite(panel_shadow, (306, 42))
    base.alpha_composite(panel, (326, 54))


def write_meta(type_codes: Iterable[str]) -> None:
    META_PATH.parent.mkdir(parents=True, exist_ok=True)
    META_PATH.write_text(
        json.dumps(
            {
                "asset": str(PUBLISH_PATH),
                "working": str(OUTPUT_PATH),
                "sourceSkill": "madamistype-type-ogp-images",
                "sourceTypeCodes": list(type_codes),
                "size": {"width": TARGET_SIZE[0], "height": TARGET_SIZE[1]},
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )


def main() -> int:
    canvas = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 255))
    draw_background(canvas)

    draw_character_layer(canvas, "OREI", (8, 22, 332, 340), "#d4820a")
    draw_character_layer(canvas, "OFEP", (858, 18, 1188, 332), "#8a3e52")
    draw_character_layer(canvas, "TFLP", (-36, 246, 392, 660), "#705e7b")
    draw_character_layer(canvas, "TRLP", (800, 212, 1228, 648), "#2e836b")
    draw_paper_panel(canvas)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    PUBLISH_PATH.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUTPUT_PATH, format="PNG")
    canvas.save(PUBLISH_PATH, format="PNG")
    write_meta(TYPE_CODES)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
