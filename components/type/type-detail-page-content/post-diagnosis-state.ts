import type { AxisSummary } from "@/lib/types";

import {
  isPostDiagnosisResultMatch,
  readPostDiagnosisResult,
} from "@/lib/post-diagnosis-result";
import { decodeShareKey, expandShareKeyAxisSummaries } from "@/lib/share-key";
import { getAbsoluteUrl } from "@/lib/site";

export type ResolvedPostDiagnosisState = {
  userName: string;
  shareKey: string;
  axisSummaries: AxisSummary[];
  resultUrl: string;
  isPostDiagnosis: boolean;
};

export type SearchParamsLike = {
  get(name: string): string | null;
};

function createResolvedPostDiagnosisState(
  shareKey: string,
  typeCode: string,
  publicUrl: string,
  isPostDiagnosis: boolean,
) {
  const payload = decodeShareKey(shareKey);

  if (!payload) {
    return null;
  }

  const axisSummaries = expandShareKeyAxisSummaries(payload);
  const resolvedTypeCode = axisSummaries
    .map((summary) => summary.resolvedCode)
    .join("");

  if (resolvedTypeCode !== typeCode) {
    return null;
  }

  return {
    userName: payload.n,
    shareKey,
    axisSummaries,
    resultUrl: getAbsoluteUrl(`${publicUrl}?s=${shareKey}`),
    isPostDiagnosis,
  } satisfies ResolvedPostDiagnosisState;
}

export function resolvePostDiagnosisState(
  searchParams: SearchParamsLike,
  typeCode: string,
  publicUrl: string,
) {
  const keyParam = searchParams.get("s");
  if (keyParam) {
    return createResolvedPostDiagnosisState(
      keyParam,
      typeCode,
      publicUrl,
      isPostDiagnosisResultMatch(typeCode, keyParam),
    );
  }

  const stored = readPostDiagnosisResult();
  if (!stored || stored.typeCode !== typeCode) {
    return null;
  }

  return createResolvedPostDiagnosisState(stored.key, typeCode, publicUrl, true);
}
