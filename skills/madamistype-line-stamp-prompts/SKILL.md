---
name: madamistype-line-stamp-prompts
description: madamistype リポジトリ専用。data/line-stamps/*.json と data/types/*.json を入力として、LINE スタンプ用の構図、文字、文字デザイン、余白、背景透過前提を反映した prompt manifest を生成する。main.png、tab.png、複数 stamp の prompt 設計や review 用 manifest を作成または更新するときに使う。
---

# Madamistype Line Stamp Prompts

## Overview

Use this skill when working inside the `madamistype` repository and the task is to design LINE sticker prompts before image generation.

This skill does not call NanoBanana directly. Its job is to convert repo data into a reviewable `manifest.json` that fixes:

- role-specific composition for `main`, `tab`, and `stamp`
- exact visible text for each asset
- per-asset pose, camera angle, and facial-expression direction
- cute sticker-style lettering directions
- transparent-ready green background directions
- padding-safe framing rules

For this skill, treat NanoBanana as responsible for rendering the requested text and text styling inside the image.
Do not carry over character-image assumptions like `文字なし` or text-suppression negatives into the LINE sticker `negativePrompt`.

Read [line-stamp-skill-spec.md](../../docs/line-stamp-skill-spec.md) when changing the overall design or acceptance criteria.

## Workflow

### 1. Check the repo inputs

Confirm that both of these exist:

- `data/types/*.json`
- `data/line-stamps/*.json`

Each sticker set must resolve to one `typeCode`.

For the exact input and output structure, read [references/io-schema.md](./references/io-schema.md).

### 2. Build prompt manifests

Use `scripts/generate_line_stamp_prompt_set.py` instead of hand-writing prompts repeatedly.

Typical examples:

```bash
python skills/madamistype-line-stamp-prompts/scripts/generate_line_stamp_prompt_set.py --all
python skills/madamistype-line-stamp-prompts/scripts/generate_line_stamp_prompt_set.py --sets ofei-daily-replies
python skills/madamistype-line-stamp-prompts/scripts/generate_line_stamp_prompt_set.py --sets ofei-daily-replies --overwrite
```

The script writes:

- `manifest.json`
- `review.md`
- per-asset `prompt.txt`
- per-asset `negative_prompt.txt`

### 3. Keep text generation explicit

Every asset must define visible text and text styling.

Do not treat text as a later overlay. The prompt must instruct NanoBanana to render the exact text inside the image.
Keep text quality constraints on the positive-prompt side, and keep `negativePrompt` free of text-ban wording.

For detailed prompt rules, read [references/prompt-rules.md](./references/prompt-rules.md).

### 4. Review before image generation

Before using the image skill, confirm:

- each asset has the right text
- text placement will not collide with the character
- `main` and `tab` are not just resized versions of `stamp`
- the green-background transparency instructions are present

## Script Map

### `scripts/generate_line_stamp_prompt_set.py`

Use as the main entry point. It:

- discovers sticker set JSON files
- loads the matching type JSON
- builds role-specific prompts
- writes `manifest.json` and review artifacts

### `scripts/line_stamp_prompt_builder.py`

Use for prompt construction, validation, and manifest assembly.

## Repo-Specific Rules

- Keep sticker-set inputs under `data/line-stamps/`
- Keep prompt outputs under `output/line-stamp-prompts/` by default
- Treat `data/types/*.json` as the canonical character identity source
- Do not move text rendering to a later local overlay step
- When changing the overall workflow, update [line-stamp-skill-spec.md](../../docs/line-stamp-skill-spec.md)

## References

- [references/io-schema.md](./references/io-schema.md): input and output contract
- [references/prompt-rules.md](./references/prompt-rules.md): text, layout, and transparency prompt rules
