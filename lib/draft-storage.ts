import { DRAFT_STORAGE_KEY } from "@/lib/site";
import { normalizeUserName, toAnswerValue } from "@/lib/diagnosis";
import type { AnswersRecord, DiagnosisDraft } from "@/lib/types";

export function readDiagnosisDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as DiagnosisDraft;

    if (typeof parsed.userName !== "string" || typeof parsed.currentPage !== "number") {
      return null;
    }

    return {
      userName: normalizeUserName(parsed.userName),
      answers: sanitizeAnswers(parsed.answers),
      currentPage: parsed.currentPage,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    } satisfies DiagnosisDraft;
  } catch {
    return null;
  }
}

export function writeDiagnosisDraft(draft: DiagnosisDraft) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    DRAFT_STORAGE_KEY,
    JSON.stringify({
      ...draft,
      userName: normalizeUserName(draft.userName),
      answers: sanitizeAnswers(draft.answers),
    }),
  );
}

export function clearDiagnosisDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
}

function sanitizeAnswers(answers: AnswersRecord | undefined) {
  return Object.entries(answers ?? {}).reduce<AnswersRecord>((accumulator, entry) => {
    const [questionId, value] = entry;
    const answerValue = toAnswerValue(value);

    if (answerValue) {
      accumulator[questionId] = answerValue;
    }

    return accumulator;
  }, {});
}
