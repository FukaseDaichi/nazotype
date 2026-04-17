# Prompt Rules

## Goal

Convert repo type data into generation prompts that produce reusable asset images instead of result-card illustrations.

## Base Rules

Always enforce these rules:

- one character only
- anime-style or game-ready character illustration
- full-body or near full-body framing
- entire silhouette visible
- enough margin around the figure
- no text
- no logo
- no watermark

## Source Priorities

Prefer fields in this order:

1. `visualProfile`
2. `typeName`
3. `imagePrompt`
4. `negativePrompt`

Use `imagePrompt` and `negativePrompt` as supporting context. Do not paste them unchanged.

## Standard Variant

For `standard`:

- preserve the character's age impression, archetype, outfit, props, colors, pose, and expression
- rewrite any half-body framing into full-body or near full-body framing
- replace detailed scenic backgrounds with a simple studio-like background

## Chibi Variant

For `chibi`:

- preserve the same character identity as `standard`
- simplify body proportions
- enlarge the head
- keep the silhouette clean for sticker use
- keep key props, palette, and hairstyle intact

If a usable `standard` result URL exists, use it as a NanoBanana reference image.

## Transparent Mode Rules

Transparent mode is optional.

When enabled, append all of the following constraints to the main prompt:

- background must be perfectly uniform bright green `#00FF00`
- do not use green on the subject
- keep a crisp boundary between subject and background
- do not add background gradients
- do not add background shadows
- do not add background patterns

This rule exists because the repo uses local chroma-key removal rather than trusting model-native transparency.

## Negative Constraints

NanoBanana `generate-2` documentation does not list a dedicated negative prompt parameter.

Because of that:

- keep `negative_prompt.txt` as a record
- merge the highest-value constraints into the main prompt as avoidance instructions

Useful constraints to keep near the end of the prompt:

- avoid multiple characters
- avoid cropped head or feet
- avoid broken hands
- avoid background clutter
- avoid text, logos, and watermarks

## Anti-Patterns

Avoid these mistakes:

- reusing `imagePrompt.en` unchanged when it still says waist-up
- asking for "transparent background" without chroma-key instructions
- letting scenic backgrounds compete with the character silhouette
- generating the chibi version before the standard version
