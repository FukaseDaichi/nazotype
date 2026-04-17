# IO Schema

## Input Source

Read prompt manifests from:

```text
output/line-stamp-prompts/*/manifest.json
```

Treat the manifest as the single prompt source for image generation.

## Required Manifest Fields

The image skill expects at least:

- `setId`
- `typeCode`
- `referencePolicy`
- `assets[]`
- `assets[].role`
- `assets[].fileName`
- `assets[].text`
- `assets[].textDesignPrompt`
- `assets[].textPlacement`
- `assets[].poseDirection`
- `assets[].canvas.width`
- `assets[].canvas.height`
- `assets[].paddingPx`
- `assets[].prompt`
- `assets[].negativePrompt`
- `assets[].renderTextInModel`

## Output Root

Default output root:

```text
output/line-stamp-images/
```

## Output Layout

```text
output/line-stamp-images/
  batch-report.json
  ofei-daily-replies/
    validation-report.json
    main/
      prompt.txt
      request.json
      task.json
      raw.png
      transparent.png
      final.png
      meta.json
    tab/
      ...
    stamps/
      01/
        ...
    package/
      main.png
      tab.png
      stamps/
        01.png
```

## Artifact Meanings

- `prompt.txt`: prompt sent to NanoBanana
- `request.json`: request summary without credentials
- `task.json`: submit and final task responses
- `raw.png`: downloaded model output
- `transparent.png`: local green-screen removal result
- `final.png`: final composed delivery canvas
- `meta.json`: generation summary for one asset
- `validation-report.json`: per-asset validation summary
