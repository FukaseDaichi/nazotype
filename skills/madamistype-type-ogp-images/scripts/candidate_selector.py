from __future__ import annotations

from typing import Any


POSE_PRIORITY = {
    "action-forward": 0,
    "prop-led": 1,
    "reaction-side": 2,
    "secretive-turn": 3,
}


def parse_selection_overrides(raw: str | None) -> dict[str, int]:
    if not raw:
        return {}

    overrides: dict[str, int] = {}
    items = [item.strip() for item in raw.split(",") if item.strip()]
    for item in items:
        if ":" not in item:
            raise ValueError(f"Invalid --select item: {item}. Expected TYPECODE:INDEX.")
        type_code, candidate_index = item.split(":", 1)
        type_code = type_code.strip().upper()
        if not type_code:
            raise ValueError(f"Invalid empty type code in --select item: {item}")
        try:
            parsed_index = int(candidate_index.strip())
        except ValueError as exc:
            raise ValueError(f"Invalid candidate index in --select item: {item}") from exc
        if parsed_index < 1:
            raise ValueError(f"Candidate index must be >= 1 in --select item: {item}")
        overrides[type_code] = parsed_index

    return overrides


def choose_candidate(
    *,
    type_code: str,
    candidates: list[dict[str, Any]],
    override_index: int | None = None,
) -> tuple[dict[str, Any], str]:
    successful = [candidate for candidate in candidates if candidate.get("status") in {"success", "reused"}]
    if not successful:
        raise ValueError(f"No successful candidates available for {type_code}.")

    indexed = {int(candidate["candidateIndex"]): candidate for candidate in successful}

    if override_index is not None:
        selected = indexed.get(override_index)
        if selected is None:
            raise ValueError(
                f"--select requested candidate {override_index} for {type_code}, but it did not complete successfully."
            )
        note = (
            f"Selected candidate {override_index} via manual override. "
            f"Variant: {selected.get('variantId', 'unknown')}."
        )
        return selected, note

    ordered = sorted(
        successful,
        key=lambda candidate: (
            POSE_PRIORITY.get(str(candidate.get("variantId", "")), 999),
            int(candidate["candidateIndex"]),
        ),
    )
    selected = ordered[0]
    note = (
        f"Selected candidate {selected['candidateIndex']} by default. "
        f"Prioritized bold pose families and earliest successful result."
    )
    return selected, note
