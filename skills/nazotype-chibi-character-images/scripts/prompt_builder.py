from __future__ import annotations

import json
from pathlib import Path
from typing import Any


COMMON_NEGATIVE_CONSTRAINTS = [
    "multiple characters",
    "cropped head",
    "cropped feet",
    "deformed hands",
    "extra fingers",
    "text",
    "logo",
    "watermark",
    "background clutter",
]

TRANSPARENT_MODE_INSTRUCTIONS = [
    "Fill the entire background with a perfectly uniform bright chroma key green (#00FF00).",
    "Do not use green on the character, clothing, props, or hair.",
    "Keep the boundary between the character and background crisp and easy to key.",
    "Do not add gradients, patterns, shadows, or extra objects in the background.",
]


def load_type_data(type_path: Path) -> dict[str, Any]:
    return json.loads(type_path.read_text(encoding="utf-8"))


def merge_negative_constraints(type_data: dict[str, Any], with_transparent: bool) -> str:
    negative_prompt = type_data.get("negativePrompt", {})
    pieces: list[str] = []

    for key in ("en", "ja"):
        value = negative_prompt.get(key)
        if isinstance(value, str) and value.strip():
            pieces.append(value.strip())

    pieces.extend(COMMON_NEGATIVE_CONSTRAINTS)

    if with_transparent:
        pieces.extend(
            [
                "green clothing",
                "green accessories",
                "green hair highlights",
                "busy background",
                "background shadows",
                "background gradient",
            ]
        )

    seen: set[str] = set()
    deduped: list[str] = []
    for piece in pieces:
        normalized = piece.strip()
        key = normalized.lower()
        if normalized and key not in seen:
            deduped.append(normalized)
            seen.add(key)

    return ", ".join(deduped)


def _format_color_palette(colors: Any) -> str:
    if not isinstance(colors, list):
        return ""
    cleaned = [str(color).strip() for color in colors if str(color).strip()]
    return ", ".join(cleaned)


def build_prompt(type_data: dict[str, Any], variant: str, with_transparent: bool) -> str:
    if variant not in {"standard", "chibi"}:
        raise ValueError(f"Unsupported variant: {variant}")

    visual = type_data.get("visualProfile", {})

    type_name = str(type_data.get("typeName", "")).strip()
    type_code = str(type_data.get("typeCode", "")).strip()
    gender = str(visual.get("genderPresentation", "")).strip()
    age_range = str(visual.get("ageRange", "")).strip()
    archetype = str(visual.get("characterArchetype", "")).strip()
    character_description = str(visual.get("characterDescription", "")).strip()
    outfit_description = str(visual.get("outfitDescription", "")).strip()
    pose = str(visual.get("pose", "")).strip()
    expression = str(visual.get("expression", "")).strip()
    color_palette = _format_color_palette(visual.get("colorPalette"))

    base_lines = [
        "Create a polished anime-style character illustration for the Madamistype project.",
        f"Character identity: {type_name} ({type_code}).",
    ]

    if gender:
        base_lines.append(f"Gender presentation: {gender}.")
    if age_range:
        base_lines.append(f"Age impression: {age_range}.")
    if archetype:
        base_lines.append(f"Archetype: {archetype}.")
    if character_description:
        base_lines.append(f"Character description: {character_description}.")
    if outfit_description:
        base_lines.append(f"Outfit and props: {outfit_description}.")
    if color_palette:
        base_lines.append(f"Color palette: {color_palette}.")
    if pose:
        base_lines.append(f"Pose: {pose}.")
    if expression:
        base_lines.append(f"Expression: {expression}.")

    if variant == "standard":
        variant_lines = [
            "Draw exactly one character.",
            "Use full-body or near full-body framing.",
            "Keep the entire silhouette visible with comfortable margin around the figure.",
            "Make the image reusable as a standalone character asset.",
        ]
    else:
        variant_lines = [
            "Draw exactly one character.",
            "Turn the character into a super-deformed chibi version with a large head and simplified proportions.",
            "Keep the same identity, hairstyle, outfit, props, and color palette as the base character.",
            "Use a clean sticker-friendly silhouette.",
            "Keep the full figure visible with comfortable margin around the figure.",
        ]

    background_lines = (
        TRANSPARENT_MODE_INSTRUCTIONS
        if with_transparent
        else [
            "Use a simple plain studio-style background with minimal distraction.",
        ]
    )

    avoidance = merge_negative_constraints(type_data, with_transparent)

    closing_lines = [
        "Do not include text, logos, or watermarks.",
        f"Avoid: {avoidance}.",
    ]

    return " ".join(base_lines + variant_lines + background_lines + closing_lines)
