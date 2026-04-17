# IO Schema

## Canonical Inputs

Read type identity from:

```text
data/types/*.json
```

Treat that directory as the canonical source for:

- `typeCode`
- `typeName`
- `visualProfile`
- `imagePrompt`
- `negativePrompt`

The built-in `image_gen` prompt should rely primarily on `visualProfile` and use the prompt fields only as supporting material.

## Reference Image Priority

When available, use references in this order:

1. approved existing chibi asset: `public/types/{typeCode}_chibi.png`
2. approved existing standard asset: `public/types/{typeCode}.png`
3. one approved series-style anchor image shared across the batch
4. prompt-only fallback only when no approved image exists

Use the existing chibi as the strongest anchor for:

- head-to-body ratio
- silhouette language
- outfit simplification
- overall "cute but sharp" feel

Use the existing standard image as the strongest anchor for:

- face identity
- hair shape and color
- outfit details
- props
- expression family

## `visualProfile` Fields Most Useful for Chibi Generation

Prefer these fields when available:

- `genderPresentation`
- `ageRange`
- `characterArchetype`
- `characterDescription`
- `outfitDescription`
- `colorPalette`
- `pose`
- `expression`
- `hairStyle`
- `hairColor`

## Canonical Output

The shipped asset path is:

```text
public/types/{typeCode}_chibi.png
```

## Optional Audit Output

When keeping generation artifacts, use:

```text
output/character-images/{typeCode}/chibi/
  prompt.txt
  selected.png
  meta.json
```

Suggested meanings:

- `prompt.txt`: final prompt text used with `image_gen`
- `selected.png`: chosen generated candidate copied into the repo
- `meta.json`: short local note about references used, alpha validation, and any publish decision

## Notes

- Do not depend on `$CODEX_HOME/generated_images/...` as the final project asset location.
- Do not require a `standard` generation pass before creating the base chibi.
- For this skill, transparent alpha is a first-class output requirement, not a post-process step.
