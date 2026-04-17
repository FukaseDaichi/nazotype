# Prompt Rules

## Goal

Generate one transparent-background chibi asset that:

- clearly reads as the target type
- matches the approved series style
- holds up as a reusable base asset for later OGP and LINE work

## Core Shape

Every prompt should include these ideas explicitly:

- one character only
- polished anime chibi illustration
- true transparent alpha background
- cute but sharp, not soft mascot-only
- bold pose with a readable silhouette
- no text, logo, watermark, frame, or scenic background

## Reference Roles

Label the references in the prompt instead of dropping them in silently.

Recommended roles:

- `Image 1 = series style reference`
- `Image 2 = character identity reference`
- `Image 3 = approved chibi reference` when it exists

## Identity Rules

Preserve all of these from the reference set:

- face identity
- hairstyle and silhouette
- outfit silhouette
- key props
- main palette
- character attitude

If standard and chibi references disagree, prefer:

- face and outfit detail from the standard reference
- proportions and silhouette discipline from the chibi reference

## Chibi Rules

Make these non-optional:

- super-deformed chibi body, around 2.5 to 3 heads tall
- compact torso
- simplified limbs and hands
- full figure still obviously chibi even in perspective
- the result should feel like a premium sticker-ready character, not a full-proportion anime adult

## Pose Rules

The base chibi should not be static.

Prefer:

- diagonal action
- one clear gesture or prop read
- slight foreshortening
- an instantly readable silhouette at thumbnail size

Avoid:

- idle standing poses
- symmetrical mannequin poses
- cropped hands or feet
- busy VFX that compete with the character

## Transparency Rules

Ask for real transparent alpha directly.

Do not add:

- green-screen instructions
- background gradients
- studio floor
- environment scene
- halo glow as a fake cutout

If transparency fails, regenerate. Do not default to chroma-key cleanup.

## Recommended Prompt Skeleton

```text
Use case: stylized-concept
Asset type: transparent chibi character asset for nazotype
Primary request: create one chibi version of the target type while preserving the same identity as the references
Input images: Image 1 = series style reference; Image 2 = standard identity reference; Image 3 = approved chibi reference
Subject: one <gender presentation> chibi character, <typeName>, <hair>, <outfit>, <props>, <expression>
Style/medium: polished anime chibi illustration with painterly accents, premium game-ready asset
Composition/framing: full body fully visible, bold dynamic pose, clean silhouette, slight foreshortening, nothing cropped
Lighting/mood: <attitude words from the type>
Color palette: <palette>
Constraints: true transparent alpha background mandatory; single character only; preserve face, hair identity, outfit cues, props, and persona from the references; no text, no logo, no watermark, no frame, no scene background
Avoid: realistic adult proportions, extra characters, clutter, scenery, cropped limbs, broken hands, fake cutout glow
```

## Winning Pattern From This Repo

The best results in this repo came from prompts that combined:

- one fixed series-style anchor
- one strong identity anchor from the shipped standard art
- a direct statement that transparent alpha is mandatory
- a bold but simple prop-driven pose
- a strict ban on scenery and extra background treatment

## Anti-Patterns

Avoid these mistakes:

- using prompt-only generation when a strong shipped reference already exists
- using `edit` just to remove a background
- asking for transparent output and green-screen at the same time
- keeping the original half-body framing from the standard art
- over-specifying background splashes so they become a scene
- forgetting to say the result must stay unmistakably chibi
