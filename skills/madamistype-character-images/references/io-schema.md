# IO Schema

## Input Source

Read type data from:

```text
data/types/*.json
```

Treat this directory as the canonical source for character generation inputs.

## Required Input Fields

Each type JSON is expected to provide at least:

- `typeCode`
- `typeName`
- `visualProfile`
- `imagePrompt`
- `negativePrompt`

The generator primarily relies on `visualProfile` for stable character identity and uses `imagePrompt` plus `negativePrompt` as supporting material.

## `visualProfile` Fields Used by the Skill

The scripts expect these fields when available:

- `genderPresentation`
- `ageRange`
- `characterArchetype`
- `characterDescription`
- `outfitDescription`
- `colorPalette`
- `pose`
- `expression`

Missing optional fields should degrade gracefully, but the better these fields are, the more consistent the output will be.

## Output Root

Default output root:

```text
output/character-images/
```

## Output Layout

```text
output/character-images/
  batch-report.json
  OFEI/
    standard/
      prompt.txt
      negative_prompt.txt
      request.json
      task.json
      raw.png
      transparent.png
      meta.json
    chibi/
      prompt.txt
      negative_prompt.txt
      request.json
      task.json
      raw.png
      transparent.png
      meta.json
```

`transparent.png` exists only when transparent mode is enabled.

## Artifact Meanings

- `prompt.txt`: final merged prompt actually sent to NanoBanana
- `negative_prompt.txt`: local review artifact for constraints that were folded into the main prompt
- `request.json`: submitted payload without credentials
- `task.json`: submit response plus final polled task response
- `raw.png`: downloaded NanoBanana result
- `transparent.png`: optional chroma-key result with alpha
- `meta.json`: local execution summary
- `batch-report.json`: batch-level status report
