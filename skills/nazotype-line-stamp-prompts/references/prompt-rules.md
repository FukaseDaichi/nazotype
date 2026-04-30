# Prompt Rules

## Goal

Generate prompts for fal.ai that produce LINE sticker-ready character art with exact visible text already rendered in the image.

## Base Rules

Always enforce these rules:

- one character only
- anime-style or game-ready character illustration
- mandatory super-deformed chibi proportions
- never standard-proportion adult anatomy
- stylized premium sticker-like polish that can skew cute, cool, or dramatic per asset
- exact requested text appears in the image
- no extra text
- no logo
- no watermark
- comfortable margin for later fitting into the final canvas

## Text Rules

The text is part of the image, not a later overlay.

Every LINE stamp in this repo must use the reference chibi as the identity anchor.
Do not allow the model to reinterpret the character as a tall or realistic figure.

Always instruct fal.ai to:

- preserve the same face, hairstyle, outfit, props, and palette as the reference chibi
- keep the body clearly chibi with a large head, compact torso, and short limbs
- keep the full silhouette obviously chibi even in dynamic foreshortened poses
- reject realistic adult proportions such as long legs, small head, or fashion-illustration anatomy

Always instruct fal.ai to:

- render the exact provided text
- avoid misspelling, omission, or extra characters
- treat the lettering as custom illustrated sticker art rather than neutral typography
- make the lettering feel authored by an illustrator, not machine typeset
- keep the text thick and readable
- give the glyphs personality through stroke contrast, silhouette variation, tilt, spacing, and lively baseline rhythm
- let the mood match the asset direction, which may be cute, cool, dramatic, teasing, or sharp
- avoid flattening every asset into the same generic rounded bubble font
- avoid plain default font styling, sterile spacing, and perfectly even mechanical proportions
- keep strong contrast between fill and outline
- use sticker-friendly finishing such as a strong outer outline, optional inline border, highlight, or small shadow when it improves readability
- keep the text fully visible inside the frame
- keep text-related quality control in the main prompt instead of the negative prompt

## Transparency Rules

The repo does not trust model-native transparency.

Always instruct fal.ai to:

- use a perfectly uniform bright green background `#00FF00`
- avoid green on the character
- avoid green in the text fill, outline, or decoration
- keep a crisp boundary between foreground and background
- avoid background shadows, gradients, and clutter

## Role Rules

### `main`

- package-cover feel
- readable at `240x240`
- may use a stronger emotional pose

### `tab`

- readable at `96x74`
- very short text only
- face or upper-body framing is acceptable

### `stamp`

- reaction should read instantly
- text must not collide with the character
- keep the silhouette and lettering sticker-friendly
- vary the body action aggressively across stamps when `poseDirection` is provided
- vary the camera angle aggressively across stamps when `cameraDirection` is provided
- vary the facial read aggressively across stamps when `expressionDirection` is provided

## Negative Constraints

Keep these near the end of the prompt or in `negativePrompt`.

Do not put text-suppression terms such as `文字`, `text`, `letters`, or `typography` into `negativePrompt`.
For LINE stamps, fal.ai is expected to render the requested text and lettering design inside the image, so all text requirements stay on the positive-prompt side.

Recommended `negativePrompt` items:

- multiple characters
- cropped head or feet
- realistic adult proportions
- long legs
- small head
- speech bubbles unless explicitly requested
- logo
- watermark
- background clutter
- green clothing
- green props
