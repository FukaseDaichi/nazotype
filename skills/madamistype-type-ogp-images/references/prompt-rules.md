# Prompt Rules

## Core Goal

Generate a near-final OGP card, not just isolated hero art.

Every prompt must produce:

- exactly one character
- the same character identity as the reference chibi
- a much more dynamic pose than the stored chibi
- the exact `typeName` and `typeCode` rendered inside the design
- a clear silhouette that reads at social-card size

## What Must Stay Fixed

Keep these invariant unless the user explicitly asks for a redesign:

- face and overall identity
- hairstyle
- outfit
- key props
- core color palette
- general personality impression

State these invariants explicitly on every API call. Do not rely on the model to infer them from previous attempts.

## Bold Pose Policy

The reference chibi is an anchor, not the target pose.

Push each candidate toward a visibly stronger frame:

- use diagonal action instead of flat front-facing posture
- force asymmetry in shoulders, hips, hands, or gaze
- make the prop or gesture feel mid-action
- prefer forward movement, twist, recoil, reach, or over-the-shoulder energy
- avoid static standing, mascot presentation, or idle sticker poses

Good pose families:

- `action-forward`: stepping in, leaning in, reaching, lunging
- `reaction-side`: side glance, side step, quick pivot
- `secretive-turn`: turn-back, look-over-shoulder, hidden-angle tension
- `prop-led`: the prop creates the motion and silhouette

## OGP Composition Constraints

Every prompt should also include:

- single character only
- large silhouette
- place the requested title typography on the requested title side
- background must stay simple enough for the integrated title typography
- keep a small bottom-right safe area for the local service label
- no logo
- no watermark

Preferred wording:

- "render the exact title and type code on the left side as integrated editorial typography"
- "compose the character large in frame with a strong diagonal silhouette"
- "avoid busy background details that compete with the integrated card text"

## Negative Constraints

Merge the type JSON `negativePrompt` with these common OGP negatives:

- multiple characters
- static standing pose
- symmetrical pose
- tiny character
- unreadable silhouette
- redesigned outfit
- missing prop
- cluttered background
- extra text beyond the exact requested title and type code
- wrong spelling in the requested title or type code
- logo
- watermark

Keep `negative_prompt-*.txt` as a review artifact even though the main model call uses the merged positive prompt strategy.

## Prompt Skeleton

Use a structure close to this:

```text
Create a polished anime-style chibi OGP card for X.
Character identity: {typeName} ({typeCode}).
Preserve the same face, hairstyle, outfit, props, and core palette as the reference chibi.
Render the exact title text "{typeName}" and the exact type code "{typeCode}" inside the image.
Keep the spelling exact and do not add any other text.
Character notes: {characterDescription}
Outfit and props: {outfitDescription}
Color palette: {palette}
Expression: {expression}
Pose direction: {pose_variant}
Compose exactly one character.
Make the pose bold, asymmetrical, and mid-action.
Keep the character large in frame with a clean readable silhouette.
Place the title and type code on the {title_side} side as integrated editorial typography.
Keep a small clean safe area in the bottom-right corner for the local service label.
Use a restrained atmospheric background that supports the character but does not become busy.
Do not add any text beyond the exact requested title and type code, and do not add logo, watermark, extra characters, or a static sticker pose.
```

## Candidate Count Guidance

Default to `1` candidate per type to keep credit usage low.

Use `2` or more only when:

- a type is especially hard to keep on-model
- the user explicitly wants more exploration
- you are trying to recover from low pose variance
