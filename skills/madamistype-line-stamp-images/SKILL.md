---
name: madamistype-line-stamp-images
description: madamistype リポジトリ専用。output/line-stamp-prompts/*/manifest.json を入力として、NanoBanana で文字入り LINE スタンプ画像を生成し、グリーンバック除去で透過 PNG を作り、最終キャンバスへ収めて検証する。main.png、tab.png、複数 stamp の納品 PNG を生成または更新するときに使う。
---

# Madamistype Line Stamp Images

## Overview

Use this skill when working inside the `madamistype` repository and the task is to generate final LINE sticker PNGs from an existing prompt manifest.

This skill expects a prompt manifest from `madamistype-line-stamp-prompts`. It:

- calls NanoBanana with the approved prompt
- keeps the exact requested text inside the image
- keeps the character in the approved chibi proportions
- removes the green background locally
- fits the result into the final delivery canvas
- validates size, alpha, padding, and file size

Read [line-stamp-skill-spec.md](../../docs/line-stamp-skill-spec.md) when changing the overall design or acceptance criteria.

## Workflow

### 1. Make sure a manifest exists

Run the prompt skill first or confirm that:

```text
output/line-stamp-prompts/{setId}/manifest.json
```

already exists.

For the exact input and output structure, read [references/io-schema.md](./references/io-schema.md).

### 2. Generate the PNGs

Use `scripts/generate_line_stamp_images.py` as the main entry point.

Typical examples:

```bash
python skills/madamistype-line-stamp-images/scripts/generate_line_stamp_images.py --set-ids ofei-daily-replies
python skills/madamistype-line-stamp-images/scripts/generate_line_stamp_images.py --all
python skills/madamistype-line-stamp-images/scripts/generate_line_stamp_images.py --set-ids ofei-daily-replies --dry-run
```

The script writes:

- `raw.png`
- `transparent.png`
- `final.png`
- `meta.json`
- `validation-report.json`
- packaged delivery files under `package/`

### 3. Keep transparency local

Do not rely on model-native transparency.

Always:

- generate against a uniform green background
- remove the background locally
- validate the resulting PNG
- treat `raw.png` as a work artifact only and never as a finished sticker

### 4. Validate after generation

Confirm:

- exact final canvas size
- alpha background present
- file size below 1MB
- outer padding preserved
- no severe green fringe remains

The validator can attempt OCR if `pytesseract` is installed, but OCR is optional and may be skipped locally.

## Dependencies

Expected local Python packages for the full workflow:

- `opencv-python`
- `numpy`
- `Pillow`

Optional:

- `pytesseract`

## Script Map

### `scripts/generate_line_stamp_images.py`

Use as the main entry point. It:

- reads manifests
- resolves reference URLs
- calls NanoBanana
- removes the green background
- composes final canvases
- writes validation reports

### `scripts/line_stamp_compositor.py`

Fits the transparent source into the final sticker canvas.

### `scripts/line_stamp_validator.py`

Validates file size, canvas size, alpha, padding, and optional OCR text checks.

## Repo-Specific Rules

- Keep final working output under `output/line-stamp-images/` by default
- Keep the packaged delivery files under `output/line-stamp-images/{setId}/package/`
- Reuse the existing repo NanoBanana client and green-screen remover from the legacy utilities under `nazotype-chibi-character-images`
- Do not replace prompt-defined text with local overlays
- When changing the overall workflow, update [line-stamp-skill-spec.md](../../docs/line-stamp-skill-spec.md)

## References

- [references/io-schema.md](./references/io-schema.md): manifest input and output contract
- [references/render-rules.md](./references/render-rules.md): generation, compositing, and validation rules
