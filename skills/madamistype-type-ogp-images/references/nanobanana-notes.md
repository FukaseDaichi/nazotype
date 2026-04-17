# NanoBanana Notes

## Primary Endpoint

As of 2026-03-27, this skill is designed around the NanoBanana `generate-2` endpoint:

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

Optional override:

- `NANOBANANA_REFERENCE_BASE_URL`

If `NANOBANANA_REFERENCE_BASE_URL` is unset, the skill defaults to:

- `https://raw.githubusercontent.com/FukaseDaichi/nazotype/refs/heads/main/public/types`

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

## Reference Image Rule for OGP

NanoBanana expects public image URLs, not local file uploads, for this workflow.

For type OGP generation:

- keep `public/types/{typeCode}_chibi.png` as the canonical local reference asset
- derive a public URL for that file with `--reference-url-base`
- send that derived URL as the single `imageUrls` reference when possible

The local chibi file is still copied into `output/type-ogp/{typeCode}/reference/` for auditability.

## Negative Prompt Caveat

The official `generate-2` docs do not document a separate negative prompt field.

Do not add undocumented payload fields blindly.

Instead:

- keep a local `negative_prompt-*.txt`
- merge critical avoidance constraints into `prompt`

## Reference Links

- Docs home: [https://docs.nanobananaapi.ai/cn](https://docs.nanobananaapi.ai/cn)
- Generate Image (Nanobanana 2): [https://docs.nanobananaapi.ai/cn/nanobanana-api/generate-image-2](https://docs.nanobananaapi.ai/cn/nanobanana-api/generate-image-2)
- Get Task Details: [https://docs.nanobananaapi.ai/cn/nanobanana-api/get-task-details](https://docs.nanobananaapi.ai/cn/nanobanana-api/get-task-details)
