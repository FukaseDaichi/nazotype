# IO Schema

## Input Sources

Read the character identity from:

```text
data/types/*.json
```

Read the LINE sticker set definition from:

```text
data/line-stamps/*.json
```

## Required Sticker Set Fields

Each set JSON is expected to provide at least:

- `setId`
- `typeCode`
- `packageName`
- `locale`
- `style`
- `main.intent`
- `main.text`
- `main.textDesignPrompt`
- `main.poseDirection` (optional)
- `main.cameraDirection` (optional)
- `main.expressionDirection` (optional)
- `main.textLayoutPrompt` (optional)
- `main.textEffectPrompt` (optional)
- `tab.intent`
- `tab.text`
- `tab.textDesignPrompt`
- `tab.poseDirection` (optional)
- `tab.cameraDirection` (optional)
- `tab.expressionDirection` (optional)
- `tab.textLayoutPrompt` (optional)
- `tab.textEffectPrompt` (optional)
- `stamps[]`
- `stamps[].id`
- `stamps[].text`
- `stamps[].intent`
- `stamps[].textDesignPrompt`
- `stamps[].poseDirection` (optional)
- `stamps[].cameraDirection` (optional)
- `stamps[].expressionDirection` (optional)
- `stamps[].textLayoutPrompt` (optional)
- `stamps[].textEffectPrompt` (optional)

`textPlacement` is optional and will default by role.
`poseDirection` is optional but recommended when the set needs strong pose variation across stickers.

## Output Root

Default output root:

```text
output/line-stamp-prompts/
```

## Output Layout

```text
output/line-stamp-prompts/
  batch-report.json
  ofei-daily-replies/
    manifest.json
    review.md
    main/
      prompt.txt
      negative_prompt.txt
      meta.json
    tab/
      prompt.txt
      negative_prompt.txt
      meta.json
    stamps/
      01/
        prompt.txt
        negative_prompt.txt
        spec.json
```

## Manifest Contract

The prompt skill must write a `manifest.json` that the image skill can consume directly.

Each asset entry must include:

- `role`
- `fileName`
- `text`
- `textDesignPrompt`
- `textPlacement`
- `poseDirection`
- `cameraDirection`
- `expressionDirection`
- `textLayoutPrompt`
- `textEffectPrompt`
- `canvas.width`
- `canvas.height`
- `paddingPx`
- `prompt`
- `negativePrompt`
- `renderTextInModel`

`negativePrompt` must not contain text-suppression terms such as `文字`, `text`, `letters`, or `typography`.
Text correctness and lettering design must be enforced in `prompt`, because fal.ai is responsible for rendering the visible text.
Every asset prompt must also make chibi proportions mandatory and reject standard adult proportions.
