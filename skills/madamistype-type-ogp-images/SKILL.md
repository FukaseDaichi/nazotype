---
name: madamistype-type-ogp-images
description: Batch-generate X-ready type OGP images for the madamistype repository from data/types/*.json and public/types/*_chibi.png using fal.ai. Use when Codex needs to create, rerun, tune, or publish type-specific OGP assets while preserving the chibi identity and regenerating much bolder, more dynamic poses.
---

# Madamistype Type OGP Images

## Overview

Use this skill when working inside the `madamistype` repository and the task is to generate or update type-specific OGP images for X.

Treat these as the only canonical inputs:

- `data/types/*.json`
- `public/types/{typeCode}_chibi.png`

The goal is not to paste static chibi art into a template. Regenerate each type as the same character in a much more aggressive, share-stopping pose, and have the fal.ai image model render the type text inside the design itself. The local compositor should only add a small `マダミスタイプ診断` label at the bottom-right.

If the overall design or acceptance criteria change, read [type-ogp-image-spec.md](../../docs/type-ogp-image-spec.md).

## Workflow

### 1. Check the repository inputs

Confirm that each target type has:

- `typeCode`
- `typeName`
- `visualProfile`
- `imagePrompt`
- `negativePrompt`

Also confirm that `public/types/{typeCode}_chibi.png` exists unless you intentionally want prompt-only fallback generation.

For the exact input and output contract, read [references/io-schema.md](./references/io-schema.md).

### 2. Build bold OGP prompts

Do not send the stored `imagePrompt` to fal.ai unchanged.

Rewrite it for OGP-specific art generation:

- preserve the same character identity as the reference chibi
- make the pose clearly dynamic and asymmetrical
- allow much bolder body orientations such as floor-level sprawl, reclining action, inversion, or handstand-like framing when readable
- render the exact `typeName` and `typeCode` inside the image as designed typography
- keep the silhouette and typography readable in a social card
- design a substantial background with depth and motion so the result does not feel like an isolated sticker on white
- keep a small bottom-right safe area for the local service label
- forbid extra text, logos, and watermark output from the model

The pose requirement is strict. The result should feel more like a dramatic hero frame than a sticker sheet.

Read [references/prompt-rules.md](./references/prompt-rules.md) before changing prompt behavior.

### 3. Call fal.ai

Use the bundled script instead of re-implementing orchestration.

The script supports:

- prompt generation
- fal.ai queue submit/status/result calls
- candidate artifact storage
- default candidate selection with manual overrides
- minimal deterministic OGP branding
- optional publishing to `public/ogp/types/`

The batch script auto-loads repo-root `.env.character-images` when it exists.

Standard examples:

```bash
python skills/madamistype-type-ogp-images/scripts/generate_type_ogp_batch.py --all --publish
python skills/madamistype-type-ogp-images/scripts/generate_type_ogp_batch.py --types OFEI,TRLP --publish
python skills/madamistype-type-ogp-images/scripts/generate_type_ogp_batch.py --all --overwrite --publish
python skills/madamistype-type-ogp-images/scripts/generate_type_ogp_batch.py --all --dry-run
```

Useful options:

- `--candidates 1` to keep credit usage low for a single pass
- `--candidates 2` or higher when the user explicitly wants exploration
- `--select OFEI:2,TRLP:4` to override the default chosen candidate
- `--retry-failed` to rerun only failed types from the previous batch report
- `--reference-url-base https://raw.githubusercontent.com/FukaseDaichi/nazotype/refs/heads/main/public/types` to override the public reference source
- `--allow-prompt-only-fallback` to continue when a type chibi reference asset is missing

If your Python environment does not already have Pillow, run the same commands with `uv run --with pillow python ...`.

For fal.ai endpoint notes and current API behavior, read [references/fal-notes.md](./references/fal-notes.md).

### 4. Keep the OGP readable

The model should generate the near-final OGP image, including the exact `typeName` and `typeCode` as part of the design.

Always use the compositor to add:

- the small `マダミスタイプ診断` brand label at the bottom-right

Read [references/ogp-layout-rules.md](./references/ogp-layout-rules.md) when adjusting final layout, safe areas, or type treatment.

### 5. Validate the output

Always do a quick post-check:

- the selected image still reads as the same character as the reference chibi
- the pose is obviously dynamic, not upright or symmetric
- the body orientation and camera angle feel bold enough to stop the scroll
- the character fills the frame strongly enough for X
- the background feels intentionally designed and not like a blank white cutout card
- the final OGP is exactly `1200x630`
- the generated `typeName` and `typeCode` are spelled correctly and remain readable at thumbnail size

If you change the skill behavior materially, keep this skill and [type-ogp-image-spec.md](../../docs/type-ogp-image-spec.md) aligned.

## Script Map

### `scripts/generate_type_ogp_batch.py`

Use as the main entry point. It:

- discovers target type JSON files
- loads reference chibi assets
- builds prompt variants
- calls fal.ai
- stores candidate artifacts
- selects a candidate
- composes the final OGP
- optionally publishes to `public/ogp/types/`

### `scripts/ogp_prompt_builder.py`

Use to turn repo type data into OGP-safe prompts and bold pose variants.

### `scripts/fal_client.py`

Use for authenticated requests, polling, and downloads.

### `scripts/candidate_selector.py`

Use for default candidate choice and manual override parsing.

### `scripts/ogp_compositor.py`

Use for deterministic `1200x630` output and the small bottom-right `マダミスタイプ診断` label.

### `scripts/write_manifest.py`

Use for JSON and text artifact writing plus batch-report assembly.

## Repo-Specific Rules

- Keep this skill repo-local under `skills/madamistype-type-ogp-images/`
- Keep intermediate output under `output/type-ogp/` unless the user asks for another location
- Publish final assets to `public/ogp/types/` only when the task calls for site-ready output
- Preserve character identity first, then push pose intensity as far as possible
- Prefer prompt changes over editing `data/types/*.json` unless the user asks to change source data
- Have the model render the final `typeName` and `typeCode` inside the design
- Keep local post-processing text limited to the bottom-right `マダミスタイプ診断` label

## References

- [references/io-schema.md](./references/io-schema.md): repo input and output contract
- [references/prompt-rules.md](./references/prompt-rules.md): prompt rewrite rules and bold-pose policy
- [references/fal-notes.md](./references/fal-notes.md): fal.ai endpoint notes and polling rules
- [references/ogp-layout-rules.md](./references/ogp-layout-rules.md): final OGP composition rules
