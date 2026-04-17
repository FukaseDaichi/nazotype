from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


SKILL_NAME = "madamistype-line-stamp-prompts"
DEFAULT_PADDING_PX = 10
DEFAULT_RESOLUTION = "2K"
DEFAULT_REFERENCE_BASE_URL = "https://raw.githubusercontent.com/FukaseDaichi/nazotype/refs/heads/main/public/types"

ROLE_SPECS: dict[str, dict[str, Any]] = {
    "main": {
        "canvas": {"width": 240, "height": 240},
        "default_text_placement": "bottom-center",
        "default_intent": "package cover",
        "generation_aspect_ratio": "1:1",
        "prompt_lines": [
            "This asset is the package main image for a LINE sticker set.",
            "Make it memorable and emotionally expressive at small square size.",
            "The composition must still work when viewed at 240 by 240 pixels.",
        ],
    },
    "tab": {
        "canvas": {"width": 96, "height": 74},
        "default_text_placement": "right",
        "default_intent": "small icon",
        "generation_aspect_ratio": "4:3",
        "prompt_lines": [
            "This asset is the tab icon for a LINE sticker set.",
            "Optimize for recognition at very small size.",
            "Face or upper-body framing is allowed if that improves clarity.",
        ],
    },
    "stamp": {
        "canvas": {"width": 370, "height": 320},
        "default_text_placement": "top-right",
        "default_intent": "reaction",
        "generation_aspect_ratio": "4:3",
        "prompt_lines": [
            "This asset is a LINE sticker reaction image.",
            "The reaction must read instantly without needing extra context.",
            "Keep the pose and lettering clean, bold, and sticker-friendly.",
        ],
    },
}

COMMON_NEGATIVE_CONSTRAINTS = [
    "multiple characters",
    "cropped head",
    "cropped feet",
    "deformed hands",
    "extra fingers",
    "logo",
    "watermark",
    "speech bubble",
    "background clutter",
    "background shadows",
    "background gradient",
    "green clothing",
    "green accessories",
    "green hair highlights",
]

CHIBI_NEGATIVE_CONSTRAINTS = [
    "realistic adult proportions",
    "8-head-tall body",
    "fashion illustration proportions",
    "small head",
    "long legs",
    "long torso",
    "semi-realistic anatomy",
]

TEXT_RELATED_NEGATIVE_TERMS = (
    "文字",
    "テキスト",
    "字幕",
    "台詞",
    "セリフ",
    "吹き出し文字",
    "text",
    "texts",
    "letter",
    "letters",
    "lettering",
    "typography",
    "caption",
    "captions",
    "subtitle",
    "subtitles",
    "wording",
)

TRANSPARENT_MODE_INSTRUCTIONS = [
    "Fill the entire background with a perfectly uniform bright chroma key green (#00FF00).",
    "Do not use green on the character, clothing, props, hair, or visible text.",
    "Keep the boundary between the foreground and background crisp and easy to key.",
    "Do not add gradients, patterns, shadows, or extra objects in the background.",
]

CHIBI_STYLE_INSTRUCTIONS = [
    "This must be a super-deformed chibi sticker character, never a standard-proportion anime adult.",
    "Use clearly chibi proportions with a large head, compact torso, short limbs, and simplified hands and feet.",
    "Keep the full figure obviously chibi even when the pose and camera angle become dramatic.",
    "Aim for a cute compact silhouette around two to three heads tall, not a realistic seven to eight heads tall figure.",
    "Preserve the same face, hairstyle, outfit, props, and core palette as the reference chibi character.",
]

LETTERING_STYLE_GUARDRAILS = [
    "Treat the lettering as a hero design element, not a neutral font choice.",
    "Draw custom illustrated sticker lettering with hand-shaped glyphs and intentional silhouette design.",
    "Give the lettering lively stroke contrast, slightly irregular contour rhythm, and expressive weight shifts instead of perfectly uniform strokes.",
    "Let the glyph size, tilt, spacing, and baseline rhythm feel authored by an illustrator rather than machine-typeset.",
    "Use premium sticker finishing such as a thick outer outline, optional inner inline border, subtle highlight, or small offset shadow only when readability improves.",
    "Match the mood requested in the lettering direction, whether it should feel cute, playful, cool, sharp, teasing, or dramatic.",
    "Do not normalize every asset into the same bubbly font treatment.",
    "Avoid sterile default-font proportions, flat mechanical spacing, and generic digital typesetting.",
]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def load_type_data(type_path: Path) -> dict[str, Any]:
    return load_json(type_path)


def load_stamp_set(set_path: Path) -> dict[str, Any]:
    return load_json(set_path)


def resolve_local_reference_path(repo_root: Path, type_code: str) -> Path | None:
    candidates = [
        repo_root / "public" / "types" / f"{type_code}_chibi.png",
        repo_root / "output" / "character-images" / type_code / "chibi" / "transparent.png",
        repo_root / "output" / "character-images" / type_code / "chibi" / "raw.png",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return None


def _require_non_empty_string(value: Any, *, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"Missing required string field: {field_name}")
    return value.strip()


def _format_color_palette(colors: Any) -> str:
    if not isinstance(colors, list):
        return ""
    cleaned = [str(color).strip() for color in colors if str(color).strip()]
    return ", ".join(cleaned)


def _dedupe_constraints(parts: list[str]) -> list[str]:
    seen: set[str] = set()
    deduped: list[str] = []
    for part in parts:
        normalized = part.strip()
        key = normalized.lower()
        if normalized and key not in seen:
            deduped.append(normalized)
            seen.add(key)
    return deduped


def _split_negative_constraints(value: str) -> list[str]:
    normalized = (
        value.replace("、", ",")
        .replace("，", ",")
        .replace(";", ",")
        .replace("；", ",")
        .replace("\n", ",")
    )
    return [part.strip() for part in normalized.split(",") if part.strip()]


def _is_text_related_negative_constraint(part: str) -> bool:
    normalized = part.strip().lower()
    if not normalized:
        return False
    return any(term in part or term in normalized for term in TEXT_RELATED_NEGATIVE_TERMS)


def merge_negative_constraints(type_data: dict[str, Any]) -> str:
    negative_prompt = type_data.get("negativePrompt", {})
    pieces: list[str] = []
    if isinstance(negative_prompt, dict):
        for key in ("en", "ja"):
            value = negative_prompt.get(key)
            if isinstance(value, str) and value.strip():
                pieces.extend(
                    part
                    for part in _split_negative_constraints(value)
                    if not _is_text_related_negative_constraint(part)
                )
    pieces.extend(COMMON_NEGATIVE_CONSTRAINTS)
    pieces.extend(CHIBI_NEGATIVE_CONSTRAINTS)
    return ", ".join(_dedupe_constraints(pieces))


def _build_base_identity_lines(type_data: dict[str, Any], style: str) -> list[str]:
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

    lines = [
        "Create a polished anime-style LINE sticker illustration for the Madamistype project.",
        "Use the provided reference image as a strict chibi identity anchor.",
        f"Character identity: {type_name} ({type_code}).",
        f"Sticker set style: {style}.",
        *CHIBI_STYLE_INSTRUCTIONS,
    ]
    if gender:
        lines.append(f"Gender presentation: {gender}.")
    if age_range:
        lines.append(f"Age impression: {age_range}.")
    if archetype:
        lines.append(f"Archetype: {archetype}.")
    if character_description:
        lines.append(f"Character description: {character_description}.")
    if outfit_description:
        lines.append(f"Outfit and props: {outfit_description}.")
    if color_palette:
        lines.append(f"Color palette: {color_palette}.")
    if pose:
        lines.append(f"Base pose inspiration: {pose}.")
    if expression:
        lines.append(f"Base expression inspiration: {expression}.")
    return lines


def _has_non_ascii(text: str) -> bool:
    return any(ord(char) > 127 for char in text)


def _build_text_instruction_lines(
    text: str,
    text_design: str,
    text_placement: str,
    text_layout: str,
    text_effect: str,
) -> list[str]:
    lines = [
        f'Include the exact visible text "{text}" as part of the sticker artwork.',
        "Spell the text exactly as provided, with no missing characters and no extra characters.",
        f"Use this lettering direction: {text_design}.",
        f"Place the text at {text_placement} while keeping it fully readable and fully inside the frame.",
        "Make the lettering highly stylized, expressive, bold, and high-contrast like a premium LINE sticker.",
        "Treat the lettering as custom illustrated hand-drawn sticker typography, not a plain default font or ordinary digital typesetting.",
        "Make the text feel designed as part of the image composition, not dropped in afterward.",
        "Keep the lettering large enough to feel intentional, while leaving clear breathing room around the character silhouette.",
        "The lettering should read instantly at small size, but still have visible character and charm in the stroke design.",
        *LETTERING_STYLE_GUARDRAILS,
        f"Text layout direction: {text_layout}." if text_layout else "",
        f"Text effect direction: {text_effect}." if text_effect else "",
    ]
    if _has_non_ascii(text):
        lines.extend(
            [
                f"Render the visible text in Japanese exactly as 「{text}」.",
                "Do not translate the text into English.",
                "Do not romanize, localize, paraphrase, or replace the Japanese characters.",
                "Keep the Japanese characters large, bold, and clearly legible.",
                "Treat each kana, kanji, and punctuation mark as a custom drawn shape with personality, not a raw font glyph.",
                "Simplify counters and stroke joins for sticker readability while preserving a distinctive hand-drawn look.",
            ]
        )
    return lines


def build_asset_prompt(type_data: dict[str, Any], *, style: str, asset: dict[str, Any]) -> str:
    role = str(asset["role"])
    role_spec = ROLE_SPECS[role]
    canvas = asset["canvas"]
    padding_px = int(asset["paddingPx"])
    text = str(asset["text"])
    text_design = str(asset["textDesignPrompt"])
    text_placement = str(asset["textPlacement"])
    text_layout = str(asset.get("textLayoutPrompt") or "").strip()
    text_effect = str(asset.get("textEffectPrompt") or "").strip()
    intent = str(asset["intent"])
    pose_direction = str(asset.get("poseDirection") or "").strip()
    camera_direction = str(asset.get("cameraDirection") or "").strip()
    expression_direction = str(asset.get("expressionDirection") or "").strip()

    lines = _build_base_identity_lines(type_data, style)
    lines.extend(role_spec["prompt_lines"])
    lines.extend(
        [
            "Draw exactly one character.",
            f"Sticker intent: {intent}.",
            f"Pose direction: {pose_direction}." if pose_direction else "",
            f"Camera direction: {camera_direction}." if camera_direction else "",
            f"Expression direction: {expression_direction}." if expression_direction else "",
            f"Design for a final canvas of {canvas['width']} by {canvas['height']} pixels.",
            f"Keep about {padding_px} pixels of safe outer margin for both the character and the text.",
            *_build_text_instruction_lines(text, text_design, text_placement, text_layout, text_effect),
            "Do not place the text in a separate footer bar or detached caption area.",
            "Keep both the character silhouette and the lettering clearly visible at small size.",
        ]
    )
    lines.extend(TRANSPARENT_MODE_INSTRUCTIONS)
    lines.extend(
        [
            "Do not include any text other than the exact requested text.",
            "Do not include logos or watermarks.",
            "Keep the final image clean, commercially usable, and sticker-friendly.",
            f"Avoid: {merge_negative_constraints(type_data)}.",
        ]
    )
    return " ".join(line for line in lines if line)


def _default_file_name(role: str, asset_id: str | None) -> str:
    if role == "main":
        return "main.png"
    if role == "tab":
        return "tab.png"
    if asset_id is None:
        raise ValueError("stamp assets require an id.")
    return f"{asset_id}.png"


def _build_asset_payload(
    *,
    type_data: dict[str, Any],
    style: str,
    role: str,
    raw_asset: dict[str, Any],
    asset_id: str | None = None,
) -> dict[str, Any]:
    role_spec = ROLE_SPECS[role]
    text = _require_non_empty_string(raw_asset.get("text"), field_name=f"{role}.text")
    text_design_prompt = _require_non_empty_string(
        raw_asset.get("textDesignPrompt"),
        field_name=f"{role}.textDesignPrompt",
    )
    intent = str(raw_asset.get("intent") or role_spec["default_intent"]).strip()
    text_placement = str(raw_asset.get("textPlacement") or role_spec["default_text_placement"]).strip()
    if not text_placement:
        text_placement = role_spec["default_text_placement"]
    pose_direction = str(raw_asset.get("poseDirection") or "").strip()
    camera_direction = str(raw_asset.get("cameraDirection") or "").strip()
    expression_direction = str(raw_asset.get("expressionDirection") or "").strip()
    text_layout_prompt = str(raw_asset.get("textLayoutPrompt") or "").strip()
    text_effect_prompt = str(raw_asset.get("textEffectPrompt") or "").strip()

    asset: dict[str, Any] = {
        "role": role,
        "fileName": _default_file_name(role, asset_id),
        "intent": intent,
        "text": text,
        "textDesignPrompt": text_design_prompt,
        "textPlacement": text_placement,
        "poseDirection": pose_direction,
        "cameraDirection": camera_direction,
        "expressionDirection": expression_direction,
        "textLayoutPrompt": text_layout_prompt,
        "textEffectPrompt": text_effect_prompt,
        "canvas": dict(role_spec["canvas"]),
        "paddingPx": DEFAULT_PADDING_PX,
        "renderTextInModel": True,
        "generationAspectRatio": role_spec["generation_aspect_ratio"],
        "generationResolution": DEFAULT_RESOLUTION,
    }
    if asset_id is not None:
        asset["id"] = asset_id

    asset["prompt"] = build_asset_prompt(type_data, style=style, asset=asset)
    asset["negativePrompt"] = merge_negative_constraints(type_data)
    return asset


def validate_stamp_set(set_data: dict[str, Any]) -> None:
    _require_non_empty_string(set_data.get("setId"), field_name="setId")
    _require_non_empty_string(set_data.get("typeCode"), field_name="typeCode")
    _require_non_empty_string(set_data.get("packageName"), field_name="packageName")
    _require_non_empty_string(set_data.get("locale"), field_name="locale")
    _require_non_empty_string(set_data.get("style"), field_name="style")

    main_asset = set_data.get("main")
    tab_asset = set_data.get("tab")
    stamps = set_data.get("stamps")

    if not isinstance(main_asset, dict):
        raise ValueError("main must be an object.")
    if not isinstance(tab_asset, dict):
        raise ValueError("tab must be an object.")
    if not isinstance(stamps, list) or not stamps:
        raise ValueError("stamps must be a non-empty list.")

    _require_non_empty_string(main_asset.get("text"), field_name="main.text")
    _require_non_empty_string(main_asset.get("textDesignPrompt"), field_name="main.textDesignPrompt")
    _require_non_empty_string(tab_asset.get("text"), field_name="tab.text")
    _require_non_empty_string(tab_asset.get("textDesignPrompt"), field_name="tab.textDesignPrompt")

    seen_ids: set[str] = set()
    for index, stamp in enumerate(stamps, start=1):
        if not isinstance(stamp, dict):
            raise ValueError(f"stamps[{index}] must be an object.")
        asset_id = _require_non_empty_string(stamp.get("id"), field_name=f"stamps[{index}].id")
        if asset_id in seen_ids:
            raise ValueError(f"Duplicate stamp id: {asset_id}")
        seen_ids.add(asset_id)
        _require_non_empty_string(stamp.get("text"), field_name=f"stamps[{index}].text")
        _require_non_empty_string(
            stamp.get("textDesignPrompt"),
            field_name=f"stamps[{index}].textDesignPrompt",
        )


def build_manifest(*, repo_root: Path, type_data: dict[str, Any], set_data: dict[str, Any]) -> dict[str, Any]:
    validate_stamp_set(set_data)

    set_id = _require_non_empty_string(set_data.get("setId"), field_name="setId")
    type_code = _require_non_empty_string(set_data.get("typeCode"), field_name="typeCode").upper()
    resolved_type_code = str(type_data.get("typeCode", "")).strip().upper()
    if resolved_type_code and resolved_type_code != type_code:
        raise ValueError(f"Sticker set typeCode {type_code} does not match type data {resolved_type_code}.")
    package_name = _require_non_empty_string(set_data.get("packageName"), field_name="packageName")
    locale = _require_non_empty_string(set_data.get("locale"), field_name="locale")
    style = _require_non_empty_string(set_data.get("style"), field_name="style")
    allow_prompt_only_fallback = bool(set_data.get("allowPromptOnlyFallback"))

    local_reference_path = resolve_local_reference_path(repo_root, type_code)
    public_reference_url = f"{DEFAULT_REFERENCE_BASE_URL}/{type_code}_chibi.png"

    assets: list[dict[str, Any]] = []
    assets.append(
        _build_asset_payload(
            type_data=type_data,
            style=style,
            role="main",
            raw_asset=dict(set_data["main"]),
        )
    )
    assets.append(
        _build_asset_payload(
            type_data=type_data,
            style=style,
            role="tab",
            raw_asset=dict(set_data["tab"]),
        )
    )

    for stamp in set_data["stamps"]:
        stamp_asset = dict(stamp)
        asset_id = _require_non_empty_string(stamp_asset.get("id"), field_name="stamp.id")
        assets.append(
            _build_asset_payload(
                type_data=type_data,
                style=style,
                role="stamp",
                raw_asset=stamp_asset,
                asset_id=asset_id,
            )
        )

    manifest: dict[str, Any] = {
        "schemaVersion": "v1",
        "skill": SKILL_NAME,
        "generatedAt": now_iso(),
        "setId": set_id,
        "typeCode": type_code,
        "typeName": str(type_data.get("typeName", "")).strip(),
        "packageName": package_name,
        "locale": locale,
        "style": style,
        "referencePolicy": {
            "preferredVariant": "chibi",
            "allowPromptOnlyFallback": allow_prompt_only_fallback,
            "localReferencePath": str(local_reference_path) if local_reference_path else None,
            "publicReferenceUrl": public_reference_url,
        },
        "assets": assets,
    }
    return manifest


def build_review_markdown(manifest: dict[str, Any]) -> str:
    lines = [
        f"# {manifest['packageName']}",
        "",
        f"- setId: `{manifest['setId']}`",
        f"- typeCode: `{manifest['typeCode']}`",
        f"- locale: `{manifest['locale']}`",
        f"- style: `{manifest['style']}`",
        f"- local reference: `{manifest['referencePolicy'].get('localReferencePath') or 'not found'}`",
        f"- public reference: `{manifest['referencePolicy'].get('publicReferenceUrl') or 'none'}`",
        "",
        "## Assets",
        "",
    ]

    for asset in manifest.get("assets", []):
        asset_label = str(asset["role"])
        if asset.get("id"):
            asset_label = f"{asset_label}:{asset['id']}"
        lines.extend(
            [
                f"### {asset_label}",
                "",
                f"- file: `{asset['fileName']}`",
                f"- text: `{asset['text']}`",
                f"- placement: `{asset['textPlacement']}`",
                f"- pose: `{asset.get('poseDirection') or 'default'}`",
                f"- camera: `{asset.get('cameraDirection') or 'default'}`",
                f"- expression: `{asset.get('expressionDirection') or 'default'}`",
                f"- text layout: `{asset.get('textLayoutPrompt') or 'default'}`",
                f"- intent: `{asset['intent']}`",
                f"- canvas: `{asset['canvas']['width']}x{asset['canvas']['height']}`",
                f"- prompt preview: `{str(asset['prompt'])[:180]}`",
                "",
            ]
        )

    return "\n".join(lines).strip() + "\n"
