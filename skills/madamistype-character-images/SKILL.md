---
name: madamistype-character-images
description: madamistype リポジトリ専用。data/types/*.json を入力として、NanoBanana で通常キャラクター画像とチビキャラ画像を一括生成し、必要に応じてグリーンバックとクロマキー処理で背景透過 PNG を作る。タイプ別キャラクター素材、チビキャラ、透過素材、将来の LINE スタンプ素材を生成または更新するときに使う。
---

# Madamistype Character Images

## Overview

Use this skill when working inside the `madamistype` repository and the task is to generate or update type-based character images from `data/types/*.json`.

Treat `data/types/*.json` as the single source of truth. Generate two variants per type:

- `standard`: the base character art
- `chibi`: the deformed sticker-friendly version

Keep output under `output/character-images/` unless the user asks for another location.

If you need the full project-level rationale, read [character-image-skill-spec.md](../../docs/character-image-skill-spec.md). Read it only when changing the overall design or acceptance criteria.

## Workflow

### 1. Check the repository inputs

Confirm that `data/types/*.json` exists and that each target file has at least:

- `typeCode`
- `typeName`
- `visualProfile`
- `imagePrompt`
- `negativePrompt`

If the task is about a subset of types, limit processing to those `typeCode` values.

For the exact input and output shape, read [references/io-schema.md](./references/io-schema.md).

### 2. Build prompts for the requested variants

Do not send the existing `imagePrompt` to NanoBanana unchanged.

Rewrite it into asset-oriented prompts that fit this repository:

- center one character only
- full-body or near full-body framing
- enough margin so the silhouette is not clipped
- no text, no logo, no watermark
- preserve hairstyle, outfit, props, and palette from `visualProfile`

For the precise prompt rules, read [references/prompt-rules.md](./references/prompt-rules.md).

Important:

- NanoBanana docs do not document a separate negative prompt field for `generate-2`
- Keep `negative_prompt.txt` as an artifact for review
- Fold the most important negative constraints back into the main `prompt`

### 3. Call NanoBanana

Use the `Nanobanana 2` endpoint and poll task status until completion.

Use `scripts/generate_character_batch.py` for batch work instead of rewriting the same orchestration each time.

The batch script auto-loads repo-root `.env.character-images` when it exists.

Standard examples:

```bash
python skills/madamistype-character-images/scripts/generate_character_batch.py --all
python skills/madamistype-character-images/scripts/generate_character_batch.py --types OFEI,TRLP
python skills/madamistype-character-images/scripts/generate_character_batch.py --all --overwrite
python skills/madamistype-character-images/scripts/generate_character_batch.py --retry-failed
```

If transparent output is required, enable the option explicitly:

```bash
python skills/madamistype-character-images/scripts/generate_character_batch.py --all --with-transparent
```

For NanoBanana endpoint notes and API behavior, read [references/nanobanana-notes.md](./references/nanobanana-notes.md).

### 4. Handle transparent output as an option

Transparent output is not the default path.

Only enable it when the user explicitly asks for transparent PNGs or when the downstream task clearly requires alpha output.

When transparent output is enabled:

- instruct NanoBanana to render a perfectly uniform chroma-key green background
- forbid green on the subject
- run the OpenCV chroma-key remover in `scripts/background_remover.py`

Do not rely on "transparent background" wording alone. This repository uses green background generation plus local chroma-key processing as the reliable path.

### 5. Preserve character identity across variants

Generate `standard` first.

When generating `chibi`, prefer the `standard` result image URL as the `imageUrls` reference so the character stays visually consistent. If that URL is unavailable, fall back to prompt-only generation and record the fallback in metadata.

### 6. Save artifacts predictably

Keep these files per type and variant:

- `prompt.txt`
- `negative_prompt.txt`
- `request.json`
- `task.json`
- `raw.png`
- `transparent.png` only when transparent mode is enabled
- `meta.json`

Also write a batch-level `batch-report.json`.

### 7. Validate the output

Always do a quick post-check:

- confirm the character count is one
- confirm silhouette is not clipped
- confirm hands and face are not severely broken
- confirm `transparent.png` has alpha when transparent mode was enabled

If you are changing the skill itself, keep `SKILL.md`, `references/`, and the scripts aligned.

## Script Map

### `scripts/generate_character_batch.py`

Use as the main entry point. It:

- discovers target type JSON files
- builds prompts
- calls NanoBanana
- downloads results
- optionally runs transparent conversion
- writes metadata and batch reports

### `scripts/prompt_builder.py`

Use to convert repo type data into final prompts and local review artifacts.

### `scripts/nanobanana_client.py`

Use for authenticated requests, polling, and downloads.

### `scripts/background_remover.py`

Use only for the transparent option. It applies the green-screen chroma-key workflow defined in the repo spec.

## Repo-Specific Rules

- Keep the skill repo-local under `skills/madamistype-character-images/`
- Keep output repo-local under `output/character-images/` by default
- Prefer prompt changes over editing the source type JSON unless the user asks to change the master data
- Do not invent new type data fields in `data/types/*.json`
- When changing generation behavior, update [character-image-skill-spec.md](../../docs/character-image-skill-spec.md) if the behavior changes materially

## References

- [references/io-schema.md](./references/io-schema.md): repo input and output contract
- [references/prompt-rules.md](./references/prompt-rules.md): prompt rewrite rules and transparent mode additions
- [references/nanobanana-notes.md](./references/nanobanana-notes.md): NanoBanana endpoint notes and polling rules
- [references/line-stamp-extension.md](./references/line-stamp-extension.md): future LINE sticker expansion guidance
