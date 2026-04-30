# fal.ai Notes

As of 2026-04-19, this skill is designed around fal.ai queue APIs and defaults to these models:

- text-to-image: `fal-ai/nano-banana-2`
- image edit / reference-aware generation: `fal-ai/nano-banana-2/edit`

Default queue base:

- `https://queue.fal.run`

## Environment Variables

- `FAL_KEY`
- `FAL_QUEUE_URL`
- `FAL_MODEL`
- `FAL_EDIT_MODEL`
- `FAL_REFERENCE_BASE_URL`

If `FAL_REFERENCE_BASE_URL` is unset, the skill defaults to:

```text
https://raw.githubusercontent.com/FukaseDaichi/nazotype/refs/heads/main/public/types
```

## Queue Flow

This repository uses the asynchronous queue flow:

1. submit a request to `POST https://queue.fal.run/{model_path}`
2. poll `GET .../requests/{request_id}/status?logs=1`
3. fetch the final result from `GET .../requests/{request_id}/response`

The task artifacts keep:

- the submitted payload
- the fal.ai submit response
- the final polled status/result response

## Input Mapping

The scripts send a payload close to:

```json
{
  "prompt": "...",
  "image_urls": ["https://..."],
  "aspect_ratio": "16:9",
  "resolution": "2K",
  "output_format": "png",
  "enable_web_search": false
}
```

When no reference images are present, the scripts use the text-to-image model path. When reference URLs exist, they use the edit model path.

## Output Handling

fal.ai result payloads typically expose image URLs under `images[].url`. The local scripts download the first returned image and persist it into the workspace. The remote result URL should be treated as temporary, not as the only durable source.

## References

- Queue docs: [https://fal.ai/docs/documentation/model-apis/inference/queue](https://fal.ai/docs/documentation/model-apis/inference/queue)
- `fal-ai/nano-banana-2`: [https://fal.ai/models/fal-ai/nano-banana-2](https://fal.ai/models/fal-ai/nano-banana-2)
- `fal-ai/nano-banana-2/edit`: [https://fal.ai/models/fal-ai/nano-banana-2/edit/api](https://fal.ai/models/fal-ai/nano-banana-2/edit/api)
