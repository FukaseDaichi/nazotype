from __future__ import annotations

import json
from pathlib import Path
from typing import Any


POSE_VARIANTS = [
    {
        "variantId": "action-forward",
        "titlePlacement": "left",
        "poseInstruction": (
            "Drive the character into an extreme action pose with aggressive motion. "
            "Prefer striking asymmetry, visible torso twist, foreshortening, and a silhouette that feels caught mid-scene rather than posed. "
            "Allow daring body orientations such as leaning hard, near-fall recovery, floor-level sprawl, airborne kick, or other unconventional but readable action."
        ),
        "cameraInstruction": (
            "Favor cinematic camera work such as top-down, low-angle, dutch tilt, or dramatic close perspective. "
            "Do not default to safe eye-level framing."
        ),
        "selectionHint": "Best when the type should feel explosive, surprising, and instantly clickable.",
    },
    {
        "variantId": "reaction-side",
        "titlePlacement": "right",
        "poseInstruction": (
            "Create a fast sideways reaction with weight shift, asymmetrical shoulders, "
            "and a sharp side gaze or hand movement."
        ),
        "cameraInstruction": "Favor a side-heavy composition with visible directional flow.",
        "selectionHint": "Best when the type reads through quick instincts or observation.",
    },
    {
        "variantId": "secretive-turn",
        "titlePlacement": "left",
        "poseInstruction": (
            "Use an over-the-shoulder turn, half-turn, or covert glance while keeping the "
            "body clearly in motion and the silhouette readable."
        ),
        "cameraInstruction": "Favor a tense mid-turn framing rather than a posed portrait.",
        "selectionHint": "Best when the type benefits from mystery, stealth, or tension.",
    },
    {
        "variantId": "prop-led",
        "titlePlacement": "right",
        "poseInstruction": (
            "Let the signature prop lead the motion and silhouette. The prop should create "
            "the pose logic, not sit passively at the side."
        ),
        "cameraInstruction": "Favor a dynamic composition where the prop helps define the frame.",
        "selectionHint": "Best when the type identity is inseparable from its tool or role.",
    },
]


COMMON_NEGATIVE_CONSTRAINTS = [
    "multiple characters",
    "static standing pose",
    "symmetrical pose",
    "tiny character",
    "unreadable silhouette",
    "redesigned outfit",
    "missing props",
    "cluttered background",
    "extra text beyond the exact requested title and type code",
    "translated title",
    "english headline",
    "subtitle",
    "brand label",
    "caption",
    "wrong spelling in the requested title or type code",
    "logo",
    "watermark",
]

TEXT_FORBIDDEN_TOKENS = {
    "text",
    "no text",
    "文字",
    "文字なし",
    "文字無し",
}


def load_type_data(type_path: Path) -> dict[str, Any]:
    return json.loads(type_path.read_text(encoding="utf-8"))


def find_reference_chibi(repo_root: Path, type_code: str) -> Path:
    return repo_root / "public" / "types" / f"{type_code}_chibi.png"


def _split_and_filter_text_tokens(value: str) -> list[str]:
    normalized = value.replace("、", ",")
    parts = [part.strip() for part in normalized.split(",")]
    filtered: list[str] = []
    for part in parts:
        cleaned = part.strip().strip(".。").strip()
        if not cleaned:
            continue
        if cleaned.lower() in TEXT_FORBIDDEN_TOKENS:
            continue
        filtered.append(cleaned)
    return filtered


def merge_negative_constraints(type_data: dict[str, Any]) -> str:
    negative_prompt = type_data.get("negativePrompt", {})
    pieces: list[str] = []

    if isinstance(negative_prompt, dict):
        for key in ("en", "ja"):
            value = negative_prompt.get(key)
            if isinstance(value, str) and value.strip():
                pieces.extend(_split_and_filter_text_tokens(value))

    pieces.extend(COMMON_NEGATIVE_CONSTRAINTS)

    seen: set[str] = set()
    deduped: list[str] = []
    for piece in pieces:
        normalized = piece.strip()
        dedupe_key = normalized.lower()
        if normalized and dedupe_key not in seen:
            deduped.append(normalized)
            seen.add(dedupe_key)

    return ", ".join(deduped)


def _format_color_palette(colors: Any) -> str:
    if not isinstance(colors, list):
        return ""
    cleaned = [str(color).strip() for color in colors if str(color).strip()]
    return ", ".join(cleaned)


def _supporting_prompt(type_data: dict[str, Any]) -> str:
    image_prompt = type_data.get("imagePrompt", {})
    if not isinstance(image_prompt, dict):
        return ""

    pieces: list[str] = []
    for key in ("en", "ja"):
        value = image_prompt.get(key)
        if isinstance(value, str) and value.strip():
            filtered = _split_and_filter_text_tokens(value)
            if filtered:
                pieces.append(", ".join(filtered))

    return " ".join(pieces[:2])


def build_candidate_prompts(type_data: dict[str, Any], candidate_count: int = 1) -> list[dict[str, Any]]:
    if candidate_count < 1:
        raise ValueError("candidate_count must be at least 1.")

    visual = type_data.get("visualProfile", {})
    type_name = str(type_data.get("typeName", "")).strip()
    type_code = str(type_data.get("typeCode", "")).strip()
    gender = str(visual.get("genderPresentation", "")).strip()
    age_range = str(visual.get("ageRange", "")).strip()
    archetype = str(visual.get("characterArchetype", "")).strip()
    character_description = str(visual.get("characterDescription", "")).strip()
    outfit_description = str(visual.get("outfitDescription", "")).strip()
    base_pose = str(visual.get("pose", "")).strip()
    expression = str(visual.get("expression", "")).strip()
    color_palette = _format_color_palette(visual.get("colorPalette"))
    supporting_prompt = _supporting_prompt(type_data)
    negative_prompt = merge_negative_constraints(type_data)

    candidates: list[dict[str, Any]] = []
    for index in range(candidate_count):
        variant = POSE_VARIANTS[index % len(POSE_VARIANTS)]
        title_side = variant["titlePlacement"]

        prompt_lines = [
            "Create a polished anime-style chibi OGP card for a shareable X post.",
            f"Character identity: {type_name} ({type_code}).",
            "This must be the exact same character as the reference chibi, not a redesign.",
            "Preserve the same face, hairstyle, outfit, props, and core color palette as the reference chibi.",
            "Keep the result cute and chibi-proportioned, but not static, idle, or sticker-like.",
            "The generated image itself must include the title typography as part of the final design.",
            f'Render the exact Japanese title text "{type_name}".',
            f'Render the exact type code text "{type_code}".',
            "Keep the spelling, casing, and character order exact. Do not translate, paraphrase, or replace the requested text.",
            "Do not translate the Japanese title into English or any other language.",
            "The only Latin letters allowed in the image are the exact type code characters.",
            f"Place the title and type code as integrated editorial typography on the {title_side} side of the composition.",
            "The typography should feel designed into the image, not pasted on afterward.",
        ]

        if gender:
            prompt_lines.append(f"Gender presentation: {gender}.")
        if age_range:
            prompt_lines.append(f"Age impression: {age_range}.")
        if archetype:
            prompt_lines.append(f"Archetype: {archetype}.")
        if character_description:
            prompt_lines.append(f"Character notes: {character_description}.")
        if outfit_description:
            prompt_lines.append(f"Outfit and props: {outfit_description}.")
        if color_palette:
            prompt_lines.append(f"Core palette: {color_palette}.")
        if expression:
            prompt_lines.append(f"Expression: {expression}.")
        if base_pose:
            prompt_lines.append(f"Base pose cue from the type data: {base_pose}.")
        if supporting_prompt:
            prompt_lines.append(f"Supporting visual hints: {supporting_prompt}.")

        prompt_lines.extend(
            [
                f"Pose direction ({variant['variantId']}): {variant['poseInstruction']}",
                variant["cameraInstruction"],
                "Compose exactly one character, large in frame, with a strong diagonal silhouette.",
                "Make the pose extremely bold, asymmetrical, and mid-action.",
                "Ensure either the torso twist, limb action, or gaze direction clearly suggests motion.",
                "Prefer a composition that feels surprising and physically dynamic rather than neat or centered.",
                "An unusual camera angle is welcome if readability stays strong.",
                "Use a restrained atmospheric background with minimal clutter and clean value separation.",
                "Keep the integrated title and type code highly readable at social-card size.",
                "Keep the bottom-right corner visually simple and blank. Do not place any text there.",
                "Do not add any text other than the exact requested title and type code. Do not add logo, watermark, extra characters, or a plain upright pose.",
                f"Avoid: {negative_prompt}.",
            ]
        )

        candidates.append(
            {
                "candidateIndex": index + 1,
                "variantId": variant["variantId"],
                "titlePlacement": title_side,
                "selectionHint": variant["selectionHint"],
                "prompt": " ".join(prompt_lines),
                "negativePrompt": negative_prompt,
            }
        )

    return candidates
