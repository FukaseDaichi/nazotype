---
name: nazotype-chibi-character-images
description: nazotype リポジトリ専用。`data/types/*.json` と既存のタイプ画像を正本として、内蔵 `image_gen` を使い、統一感のある背景透過ちびキャラを生成・更新するときに使う。`public/types/{typeCode}_chibi.png` を作る、既存絵柄に寄せる、タイプごとの同一性を保ったまま大胆なポーズへ振る場合に使う。
---

# Nazotype Chibi Character Images

## Overview

Use this skill when working inside the `nazotype` repository and the task is to create or refresh a type's base chibi character asset.

This skill is **chibi-first**. The primary workflow uses the built-in `image_gen` tool, not the repo's NanoBanana scripts.

Treat these as the source of truth, in this order:

1. `data/types/*.json`
2. approved existing shipped assets under `public/types/`
3. one approved series-style anchor image used across the batch

The canonical publish target is:

```text
public/types/{typeCode}_chibi.png
```

If you need the project-level acceptance criteria, read [character-image-skill-spec.md](../../docs/character-image-skill-spec.md).

## Workflow

### 1. Gather the right references

Before generating, inspect:

- `data/types/{typeCode}.json`
- `public/types/{typeCode}.png` when it exists as the strongest non-chibi identity anchor
- `public/types/{typeCode}_chibi.png` when it exists as the strongest approved chibi anchor
- one approved series-style reference image shared across the batch

For exact reference priority and output locations, read [references/io-schema.md](./references/io-schema.md).

### 2. Build a reference-aware prompt

Use the built-in `image_gen` tool in `generate` mode by default.

Do not rely on prompt-only generation when reference images already exist.

Build prompts around these roles:

- style anchor: one approved image that defines the series rendering style
- identity anchor: the existing standard type image when available
- chibi anchor: the existing approved chibi when available

Use [references/prompt-rules.md](./references/prompt-rules.md) for the exact prompt shape.

Always keep these requirements in the prompt:

- exactly one character
- clearly super-deformed chibi proportions
- bold, readable pose
- full silhouette visible unless the user explicitly wants a tighter crop
- transparent background with true alpha
- no text, logo, watermark, frame, or scene background

### 3. Generate, then regenerate if needed

Preferred loop:

1. generate a fresh candidate with `image_gen`
2. inspect the result against the references
3. if one thing is off, regenerate with one targeted correction

Prefer **regeneration** over edit-based cleanup.

Use `edit` only when there is already a near-final image whose identity and pose must be preserved.

Do not default to green-screen generation or local chroma-key removal for this skill.

### 4. Publish the selected asset

Project-bound finals must not remain only under `$CODEX_HOME/generated_images/...`.

After selecting the best result:

- copy it into `public/types/{typeCode}_chibi.png`
- optionally keep an audit bundle under `output/character-images/{typeCode}/chibi/`

Suggested audit artifacts:

- `prompt.txt`
- `selected.png`
- `preview-checker.png`
- `meta.json`

### 5. Validate before finishing

Check all of these:

- same character identity as the references
- obviously chibi, not adult-proportioned
- silhouette reads cleanly at small size
- transparent background really works on a checkerboard
- hands, feet, and face are not visibly broken
- no green halo, text fragments, or clipped limbs

## Repo-Specific Rules

- Prefer the built-in `image_gen` workflow for all new base chibi work.
- Use `view_image` before generation when the reference asset only exists on disk.
- Keep `data/types/*.json` as the canonical identity source. Do not invent new fields there.
- If `public/types/{typeCode}_chibi.png` is already approved, preserve it as the strongest chibi identity anchor.
- If both standard and chibi references exist, use both: standard for identity fidelity, chibi for proportions and silhouette language.
- The legacy NanoBanana scripts under `scripts/` remain only for downstream or older workflows. Do not choose them for new chibi base asset work unless the user explicitly asks for that legacy path.

## References

- [references/io-schema.md](./references/io-schema.md): reference priority, inputs, and publish targets
- [references/prompt-rules.md](./references/prompt-rules.md): stable prompt structure for this chibi pipeline
- [references/image-gen-notes.md](./references/image-gen-notes.md): built-in `image_gen` operational notes
- [references/line-stamp-extension.md](./references/line-stamp-extension.md): how the approved chibi base feeds later sticker work
