export const POST_DIAGNOSIS_RESULT_STORAGE_KEY = "nazotype:post-diagnosis-result";
export const RECOMMENDATION_FEEDBACK_FORM_URL =
  "https://forms.gle/7NFV8uz2WahKkroTA";

type PostDiagnosisResult = {
  typeCode: string;
  key: string;
  timestamp: number;
};

export function getPostDiagnosisResultValue(typeCode: string, key: string): PostDiagnosisResult {
  return { typeCode, key, timestamp: Date.now() };
}

export function writePostDiagnosisResult(typeCode: string, key: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      POST_DIAGNOSIS_RESULT_STORAGE_KEY,
      JSON.stringify(getPostDiagnosisResultValue(typeCode, key)),
    );
  } catch {
    // localStorage が使えない環境では無視
  }
}

export function readPostDiagnosisResult(): PostDiagnosisResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(POST_DIAGNOSIS_RESULT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PostDiagnosisResult;
  } catch {
    return null;
  }
}

export function isPostDiagnosisResultMatch(typeCode: string, key: string): boolean {
  const stored = readPostDiagnosisResult();
  if (!stored) return false;
  return stored.typeCode === typeCode && stored.key === key;
}

export function clearPostDiagnosisResult() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(POST_DIAGNOSIS_RESULT_STORAGE_KEY);
  } catch {
    // localStorage が使えない環境では無視
  }
}
