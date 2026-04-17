# NanoBanana Notes

## Primary Endpoint

As of 2026-03-23, the repository skill is designed around the NanoBanana `generate-2` endpoint:

- `POST https://api.nanobananaapi.ai/api/v1/nanobanana/generate-2`

Documented fields:

- `prompt`
- `imageUrls`
- `aspectRatio`
- `resolution`
- `googleSearch`
- `outputFormat`
- `callBackUrl`

## Polling Endpoint

Use task polling rather than callbacks by default:

- `GET https://api.nanobananaapi.ai/api/v1/nanobanana/record-info?taskId=...`

Why:

- local Codex sessions do not reliably expose a public callback URL
- polling is simpler for repo-local batch generation

## Environment Variables

The batch script auto-loads this repo-root file when present:

- `.env.character-images`

Supported keys:

- `NANOBANANA_API_KEY`
- `NANOBANANA_API_BASE`

Shell environment variables still work as usual.

## Status Interpretation

The task detail response documents:

- `successFlag = 0`: in progress
- `successFlag = 1`: success
- `successFlag = 2`: task creation failed
- `successFlag = 3`: generation failed

When successful, use:

- `data.response.resultImageUrl`

## Result Download Rule

Download generated images immediately after success and treat the local file as the durable artifact.

The docs note that:

- `originImageUrl` is short-lived
- `resultImageUrl` lasts longer, but should still not be treated as the only durable source

## Reference Image Rule for Chibi

Prefer the `standard` variant's `resultImageUrl` as the `imageUrls` input when generating `chibi`.

If the stored URL is unavailable, fall back to prompt-only generation and record that fallback in metadata.

## Negative Prompt Caveat

The official `generate-2` docs do not document a separate negative prompt field.

Do not add undocumented payload fields blindly.

Instead:

- keep a local `negative_prompt.txt`
- merge critical avoidance constraints into `prompt`

## Reference Links

- Docs home: [https://docs.nanobananaapi.ai/cn](https://docs.nanobananaapi.ai/cn)
- Generate Image (Nanobanana 2): [https://docs.nanobananaapi.ai/cn/nanobanana-api/generate-image-2](https://docs.nanobananaapi.ai/cn/nanobanana-api/generate-image-2)
- Get Task Details: [https://docs.nanobananaapi.ai/cn/nanobanana-api/get-task-details](https://docs.nanobananaapi.ai/cn/nanobanana-api/get-task-details)
