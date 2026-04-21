from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent.parent

CASTING_PATH = REPO_ROOT / "docs" / "line-stamp-character-casting.json"
TYPES_DIR = REPO_ROOT / "data" / "types"
OUTPUT_DIR = REPO_ROOT / "data" / "line-stamps"
GENERATED_PREFIX = "generated-"

BASE_OUTER_BORDER = "thick warm cream outer border"

STYLE_PRESETS: dict[str, dict[str, str]] = {
    "shout": {
        "design": "cute and explosive custom Japanese sticker lettering, bold rounded strokes with sharp momentum, very legible, white fill, {accent} outline, {outer_border}, playful speed accents, premium handcrafted LINE sticker typography",
        "layout": "clear big-small rhythm, oversized leading glyph, slightly smaller trailing glyphs, punctuation kicked upward with energetic tilt",
        "effect": "subtle glossy highlight, compact speed slashes, tiny spark accents, small offset shadow only if readability improves",
    },
    "panic": {
        "design": "cute panic-style Japanese sticker lettering, very legible, plump rounded strokes, white fill, {accent} outline, {outer_border}, lively handcrafted distress energy",
        "layout": "staggered size rhythm with one oversized central glyph and smaller supporting glyphs, slightly bouncing baseline to sell urgency",
        "effect": "tiny sweat-drop accents, subtle wobble emphasis, strong outline contrast, minimal offset shadow only if it improves readability",
    },
    "boast": {
        "design": "cute but cocky Japanese sticker lettering, bold rounded strokes, white fill, {accent} outline, {outer_border}, premium handcrafted sticker feel with a little swagger",
        "layout": "oversized first phrase, compact trailing phrase, slightly angled baseline, punctuation tucked for a confident silhouette",
        "effect": "tiny star glint accents, subtle bevel-like highlight, crisp outline, minimal shadow if readability improves",
    },
    "suspicion": {
        "design": "cool suspicious Japanese sticker lettering, highly legible, slightly condensed hand-drawn strokes, pale cream fill, {accent} outline, {outer_border}, custom sticker typography with tension",
        "layout": "main phrase medium-large, tighter spacing near the end, ellipsis smaller and dropped slightly lower for uneasy rhythm",
        "effect": "small ink-like accent marks, restrained highlight, no decoration that weakens tension",
    },
    "anxiety": {
        "design": "soft uneasy Japanese sticker lettering, very legible, rounded handwritten strokes, pale cream fill, {accent} outline, {outer_border}, cute but worried sticker typography",
        "layout": "gentle descending size rhythm, first phrase larger, ending phrase slightly smaller, ellipsis tiny and low",
        "effect": "tiny wavering accent lines, restrained highlight, minimal soft shadow only if readability improves",
    },
    "stoic": {
        "design": "cool stoic Japanese sticker lettering, highly legible, broad hand-shaped strokes, white fill, {accent} outline, {outer_border}, custom premium sticker typography with quiet authority",
        "layout": "balanced two-step hierarchy with one dominant word block and compact supporting characters, stable baseline",
        "effect": "minimal metallic highlight, very small angular accent marks, no busy decoration",
    },
    "cheer": {
        "design": "cute energetic Japanese sticker lettering, very legible, puffy rounded strokes, white fill, {accent} outline, {outer_border}, bright premium LINE sticker typography",
        "layout": "oversized opening glyphs with bouncy trailing characters, punctuation enlarged and lifted for extra excitement",
        "effect": "small sparkles, soft highlight, little burst accents, gentle offset shadow only if readability improves",
    },
    "question": {
        "design": "cute conversational Japanese sticker lettering, highly legible, rounded handwritten strokes, white fill, {accent} outline, {outer_border}, playful premium sticker typography",
        "layout": "friendly compact word block with a larger leading word and smaller trailing phrase, slight diagonal lift at the end",
        "effect": "tiny sparkle or inquiry accent, clean highlight, no clutter around the silhouette",
    },
    "push": {
        "design": "cool assertive Japanese sticker lettering, very legible, bold hand-drawn strokes, white fill, {accent} outline, {outer_border}, punchy premium sticker typography",
        "layout": "one dominant first word, compressed trailing phrase, exclamation slightly oversized and thrust forward",
        "effect": "compact speed burst accents, sharp highlight, minimal shadow only if readability improves",
    },
    "thanks": {
        "design": "cute grateful Japanese sticker lettering, very legible, plump rounded strokes, white fill, {accent} outline, {outer_border}, warm premium sticker typography",
        "layout": "larger main phrase with stacked or tucked punctuation, gentle curved baseline, friendly rounded silhouette",
        "effect": "tiny heart or sparkle accents, soft glossy highlight, subtle shadow only if readability improves",
    },
    "deadpan": {
        "design": "cool deadpan Japanese sticker lettering, highly legible, slightly narrow hand-shaped strokes, pale cream fill, {accent} outline, {outer_border}, understated custom sticker typography",
        "layout": "one compact medium-large word with slight asymmetry, no extra bounce, trailing nuance carried by tilt rather than punctuation",
        "effect": "minimal highlight, tiny flat accent bar, almost no decoration",
    },
    "depressed": {
        "design": "soft defeated Japanese sticker lettering, very legible, rounded drooping strokes, pale cream fill, {accent} outline, {outer_border}, custom sticker typography with low energy",
        "layout": "main phrase medium-large with a subtle downward slope, ending ellipsis much smaller and lower",
        "effect": "tiny falling accent marks, restrained highlight, minimal soft shadow only if readability improves",
    },
    "victory": {
        "design": "cute triumphant Japanese sticker lettering, very legible, bold rounded strokes, white fill, {accent} outline, {outer_border}, celebratory premium LINE sticker typography",
        "layout": "big heroic leading phrase, smaller trailing phrase, punctuation enlarged and flared outward for a victory silhouette",
        "effect": "tiny confetti or star accents, bright glossy highlight, compact burst motif, subtle shadow only if readability improves",
    },
    "tsukkomi": {
        "design": "cute comedic Japanese sticker lettering, highly legible, bold elastic strokes, white fill, {accent} outline, {outer_border}, hand-drawn sticker typography with strong punchline energy",
        "layout": "big first chunk, stretched middle, smaller trailing vowel pull, exaggerated width variation for comic timing",
        "effect": "tiny impact marks, slight wobble, compact burst accents, no clutter over the character",
    },
    "collapse": {
        "design": "cute exhausted Japanese sticker lettering, very legible, rounded droopy strokes, pale cream fill, {accent} outline, {outer_border}, custom sticker typography with drained energy",
        "layout": "main phrase medium-large with uneven lowered baseline, ellipsis very small and sinking at the end",
        "effect": "small wobble accents, restrained highlight, tiny falling marks, soft shadow only if readability improves",
    },
    "willpower": {
        "design": "cool determined Japanese sticker lettering, highly legible, bold sturdy strokes, white fill, {accent} outline, {outer_border}, premium sticker typography with quiet resolve",
        "layout": "one dominant first word with a smaller but firm trailing phrase, stable forward-leaning baseline",
        "effect": "small glint accents, crisp highlight, no overly cute decoration",
    },
    "resolve": {
        "design": "cool composed Japanese sticker lettering, highly legible, structured hand-drawn strokes, white fill, {accent} outline, {outer_border}, premium sticker typography with calculated resolve",
        "layout": "balanced hierarchy with slightly larger opening phrase and compact ending, strong stable silhouette",
        "effect": "minimal angular accents, restrained sheen, very subtle shadow only if readability improves",
    },
    "whisper": {
        "design": "cute whisper-style Japanese sticker lettering, very legible, soft rounded strokes, pale cream fill, {accent} outline, {outer_border}, custom sticker typography with hushed charm",
        "layout": "compact medium-sized phrase with smaller ending, gentle diagonal drift, intimate spacing",
        "effect": "tiny sparkle or hush marks, soft highlight, keep decoration sparse",
    },
    "reassure": {
        "design": "cute reassuring Japanese sticker lettering, very legible, rounded confident strokes, white fill, {accent} outline, {outer_border}, warm premium sticker typography",
        "layout": "clear main phrase with slightly smaller supportive ending, smooth upward curve, balanced spacing",
        "effect": "small soft sparkles, gentle glossy highlight, minimal shadow only if readability improves",
    },
    "sideeye": {
        "design": "cool dismissive Japanese sticker lettering, highly legible, narrow hand-shaped strokes, pale cream fill, {accent} outline, {outer_border}, custom sticker typography with dry edge",
        "layout": "single compact word block with slight sideways slant and restrained size variation",
        "effect": "tiny flat accent bar, almost no decoration, no bounce",
    },
    "want": {
        "design": "cute eager Japanese sticker lettering, very legible, rounded lively strokes, white fill, {accent} outline, {outer_border}, premium sticker typography with youthful excitement",
        "layout": "oversized opening phrase with smaller trailing phrase, playful upward bounce toward the end",
        "effect": "small sparkle accents, soft highlight, gentle shadow only if readability improves",
    },
    "oversight": {
        "design": "cute shocked Japanese sticker lettering, highly legible, rounded hand-drawn strokes, white fill, {accent} outline, {outer_border}, custom sticker typography with startled energy",
        "layout": "big main phrase followed by slightly smaller ending, ellipsis tiny and dropped low after the shock beat",
        "effect": "tiny impact spark, subtle wobble, clean highlight, minimal shadow only if readability improves",
    },
    "close": {
        "design": "cute regretful Japanese sticker lettering, very legible, rounded expressive strokes, pale cream fill, {accent} outline, {outer_border}, custom sticker typography with bittersweet tension",
        "layout": "slightly stretched first phrase, smaller trailing phrase, ellipsis tiny and trailing away",
        "effect": "small fading accent marks, restrained highlight, keep the decoration delicate",
    },
    "formal": {
        "design": "cool crisp Japanese sticker lettering, highly legible, clean hand-shaped strokes, white fill, {accent} outline, {outer_border}, premium sticker typography with polished authority",
        "layout": "dominant first word and smaller formal ending, stable centered baseline, disciplined spacing",
        "effect": "very subtle highlight, minimal trim accents, no busy decoration",
    },
}

PRESET_BY_TEXT: dict[str, str] = {
    "おじゃじんどりまずー": "shout",
    "時間やばい！": "panic",
    "小謎はまかせて！": "boast",
    "違和感がある。。。": "suspicion",
    "ほんとうにこれでよかったのだろうか。。。": "anxiety",
    "後方で腕組んでます。": "stoic",
    "うぉおおおおお！": "cheer",
    "その日あいてる？": "question",
    "その日で頼む！": "push",
    "ありがとう！！": "thanks",
    "ふーん": "deadpan",
    "失敗した。。。": "depressed",
    "成功した！！！": "victory",
    "どないやねーーん！": "tsukkomi",
    "もうだめだ。。。": "collapse",
    "成功したい": "willpower",
    "失敗も辞さない": "resolve",
    "高難易度らしいよ": "whisper",
    "探索系だから大丈夫": "reassure",
    "あたしもいきたい": "want",
    "行く！": "shout",
    "気が付かなかった。。。": "oversight",
    "もう一歩だった。。。": "close",
    "成功です": "formal",
}

TAB_TEXT_OVERRIDES = {
    "おじゃじんどりまずー": "撮",
    "時間やばい！": "急",
    "小謎はまかせて！": "謎",
    "違和感がある。。。": "違",
    "ほんとうにこれでよかったのだろうか。。。": "？",
    "後方で腕組んでます。": "腕",
    "うぉおおおおお！": "熱",
    "その日あいてる？": "空",
    "その日で頼む！": "決",
    "ありがとう！！": "礼",
    "ふーん": "ふ",
    "失敗した。。。": "失",
    "成功した！！！": "成",
    "どないやねーーん！": "ツ",
    "もうだめだ。。。": "限",
    "成功したい": "志",
    "失敗も辞さない": "覚",
    "高難易度らしいよ": "高",
    "探索系だから大丈夫": "探",
    "あたしもいきたい": "行",
    "行く！": "行",
    "気が付かなかった。。。": "気",
    "もう一歩だった。。。": "惜",
    "成功です": "了",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate LINE sticker set inputs from the casting document.")
    parser.add_argument("--casting", default=str(CASTING_PATH), help="Path to line-stamp-character-casting.json")
    parser.add_argument("--output-dir", default=str(OUTPUT_DIR), help="Directory to write sticker set inputs into")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing generated set files")
    return parser.parse_args()


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def accent_text_for_type(type_data: dict[str, Any]) -> str:
    colors = type_data.get("visualProfile", {}).get("colorPalette", [])
    if isinstance(colors, list):
        cleaned = [str(color).strip() for color in colors if str(color).strip()]
        if cleaned:
            return f"{cleaned[0]} accent"
    return "character-matched accent"


def tab_text_for(stamp_text: str) -> str:
    override = TAB_TEXT_OVERRIDES.get(stamp_text)
    if override:
        return override

    compact = re.sub(r"[！!？?。…ー\s]", "", stamp_text)
    if not compact:
        return "行"
    return compact[:1]


def preset_for(text: str) -> dict[str, str]:
    preset_name = PRESET_BY_TEXT.get(text, "shout")
    return STYLE_PRESETS[preset_name]


def render_preset_fields(preset: dict[str, str], accent: str) -> dict[str, str]:
    values = {
        "accent": accent,
        "outer_border": BASE_OUTER_BORDER,
    }
    return {key: value.format(**values) for key, value in preset.items()}


def make_set_id(stamp: dict[str, Any], type_code: str) -> str:
    return f"{GENERATED_PREFIX}stamp-{stamp['id']}-{type_code.lower()}"


def build_main_asset(stamp: dict[str, Any], preset_fields: dict[str, str]) -> dict[str, str]:
    return {
        "intent": "package cover",
        "text": stamp["text"],
        "textDesignPrompt": preset_fields["design"],
        "poseDirection": stamp["poseDirection"],
        "cameraDirection": stamp["cameraDirection"],
        "expressionDirection": stamp["expressionDirection"],
        "textPlacement": "top-left",
        "textLayoutPrompt": preset_fields["layout"],
        "textEffectPrompt": preset_fields["effect"],
    }


def build_tab_asset(stamp: dict[str, Any], preset_fields: dict[str, str]) -> dict[str, str]:
    return {
        "intent": "small icon",
        "text": tab_text_for(stamp["text"]),
        "textDesignPrompt": preset_fields["design"],
        "poseDirection": "上半身中心で、表情と文字が小サイズでもはっきり読めるように簡潔にまとめる。",
        "cameraDirection": "顔と文字の視認性を優先した近めの構図。",
        "expressionDirection": stamp["expressionDirection"],
        "textPlacement": "right",
        "textLayoutPrompt": "single compact hero glyph or ultra-short text block with stronger size hierarchy than the main sticker for tiny tab readability",
        "textEffectPrompt": "very strong outline contrast, simplified decoration, minimal highlight only",
    }


def build_stamp_asset(stamp: dict[str, Any], preset_fields: dict[str, str]) -> dict[str, str]:
    return {
        "id": "01",
        "text": stamp["text"],
        "intent": stamp["intent"],
        "textDesignPrompt": preset_fields["design"],
        "poseDirection": stamp["poseDirection"],
        "cameraDirection": stamp["cameraDirection"],
        "expressionDirection": stamp["expressionDirection"],
        "textPlacement": "top-left",
        "textLayoutPrompt": preset_fields["layout"],
        "textEffectPrompt": preset_fields["effect"],
    }


def build_set_payload(*, stamp: dict[str, Any], type_data: dict[str, Any]) -> dict[str, Any]:
    assigned = stamp["assignedCharacter"]
    type_code = str(assigned["typeCode"]).strip().upper()
    preset_fields = render_preset_fields(preset_for(stamp["text"]), accent_text_for_type(type_data))
    return {
        "setId": make_set_id(stamp, type_code),
        "typeCode": type_code,
        "packageName": f"{assigned['typeName']} {stamp['text']}",
        "locale": "ja",
        "style": "character-only",
        "main": build_main_asset(stamp, preset_fields),
        "tab": build_tab_asset(stamp, preset_fields),
        "stamps": [
            build_stamp_asset(stamp, preset_fields),
        ],
    }


def main() -> None:
    args = parse_args()
    casting_path = Path(args.casting)
    output_dir = Path(args.output_dir)
    casting = load_json(casting_path)

    for stamp in casting["stamps"]:
        assigned = stamp["assignedCharacter"]
        type_code = str(assigned["typeCode"]).strip().upper()
        type_data = load_json(TYPES_DIR / f"{type_code}.json")
        payload = build_set_payload(stamp=stamp, type_data=type_data)
        output_path = output_dir / f"{payload['setId']}.json"
        if output_path.exists() and not args.overwrite:
            continue
        write_json(output_path, payload)


if __name__ == "__main__":
    main()
