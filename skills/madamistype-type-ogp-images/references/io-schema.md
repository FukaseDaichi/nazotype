# IO Schema

## Input Sources

Read type data from:

```text
data/types/*.json
```

Read reference chibi assets from:

```text
public/types/{typeCode}_chibi.png
```

Treat these as the canonical inputs for OGP generation.

## Required Type Fields

Each type JSON is expected to provide at least:

- `typeCode`
- `typeName`
- `visualProfile`
- `imagePrompt`
- `negativePrompt`

The generator primarily uses `visualProfile` plus the existing chibi asset to preserve identity.

## `visualProfile` Fields Used by the Skill

The scripts use these fields when available:

- `genderPresentation`
- `ageRange`
- `characterArchetype`
- `characterDescription`
- `outfitDescription`
- `colorPalette`
- `pose`
- `expression`

Missing optional fields should degrade gracefully.

## Output Root

Default output root:

```text
output/type-ogp/
```

## Output Layout

```text
output/type-ogp/
  batch-report.json
  OFEI/
    reference/
      chibi.png
    candidates/
      prompt-01.txt
      negative_prompt-01.txt
      request-01.json
      task-01.json
      candidate-01.png
      prompt-02.txt
      ...
    selected/
      hero.png
      selection.json
      selection-note.txt
    final/
      ogp.png
      meta.json
public/ogp/types/
  OFEI.png
```

## Artifact Meanings

- `reference/chibi.png`: copied local reference image
- `prompt-*.txt`: final prompt sent to the model
- `negative_prompt-*.txt`: local review artifact for merged constraints
- `request-*.json`: NanoBanana request summary without credentials, including the derived public reference URL
- `task-*.json`: NanoBanana submit response plus final polling response
- `candidate-*.png`: generated candidate art
- `selected/hero.png`: chosen candidate copied into a stable path
- `selection.json`: machine-readable selected candidate metadata
- `selection-note.txt`: short human-readable selection rationale
- `final/ogp.png`: final OGP image with only the small bottom-right `マダミスタイプ診断` label added locally
- `final/meta.json`: per-type execution summary
- `batch-report.json`: batch-level status report
