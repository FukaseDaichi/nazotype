# OGP Layout Rules

## Final Output

Always compose the final output at:

- `1200 x 630`
- PNG
- X `summary_large_image`

## Text Content

Keep local compositor text minimal:

- model-rendered primary: `typeName`
- model-rendered secondary: `typeCode`
- compositor-added tertiary: small `マダミスタイプ診断` label at the bottom-right

Do not add explanation copy inside the final OGP unless the user explicitly asks for a different treatment.

## Safe Layout

Reserve one side of the image for readable integrated title text. The prompt builder encodes either left or right title placement for each candidate.

Text-side expectations:

- enough padding that thumbnail crops do not clip the integrated title
- high contrast between text and background
- exact spelling for `typeName` and `typeCode`

## Visual Priorities

Order of importance:

1. character silhouette
2. readable generated `typeName` and `typeCode`
3. motion and personality
4. decorative treatment

If a decorative effect hurts readability, remove it.

## Composition Guidance

The compositor should:

- crop the hero art to cover the full frame
- preserve the most expressive part of the pose
- avoid covering the model-rendered title text
- add only the small bottom-right `マダミスタイプ診断` label

## Brand Direction

The card should feel:

- premium
- dramatic
- clean
- editorial

It should not feel:

- like a screenshot
- like a sticker pack sheet
- like an infographic
- like a generic game card with excessive chrome

## Publish Path

When the batch is site-ready, copy the final image to:

```text
public/ogp/types/{typeCode}.png
```

Keep the working files in `output/type-ogp/` even when publishing.
