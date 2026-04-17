# Built-in `image_gen` Notes

## Scope

This skill's primary path uses the built-in `image_gen` tool available inside Codex.

It is not a repo-local HTTP client and it is not the same system as the NanoBanana scripts that remain under `scripts/`.

## Reference Image Handling

The built-in tool uses images that are already visible in the conversation context.

When a reference image only exists on disk:

1. inspect it with `view_image`
2. then call `image_gen`

Do not assume filesystem paths alone are enough for built-in reference-aware generation.

## Output Handling

Built-in generations are saved under:

```text
$CODEX_HOME/generated_images/...
```

For project assets, copy the chosen output into the repo before finishing.

Do not leave a shipped asset only in the default generated-images directory.

## Recommended Mode Choice

- use `generate` for new base chibi creation
- use `edit` only when a near-final image already exists and one constrained change is needed

For this skill, `generate` is the default and preferred path.

## Transparency

Ask for transparent alpha directly in the prompt.

If the result is not clean enough:

- regenerate with a tighter prompt
- validate on a checkerboard

Do not switch to green-screen or local chroma-key removal unless the user explicitly asks for the legacy path.

## Audit Habit

For accepted outputs, it is useful to keep:

- the final prompt text
- the chosen PNG copied into the repo
- a checkerboard preview image
- a short note about which references were used

This keeps later OGP or LINE work reproducible without locking the skill to a legacy API.
