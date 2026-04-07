export const POST_DIAGNOSIS_RESULT_COOKIE_NAME = "madamistype-post-diagnosis";
export const RECOMMENDATION_FEEDBACK_FORM_URL =
  "https://forms.gle/7NFV8uz2WahKkroTA";

const POST_DIAGNOSIS_RESULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 10;

export function getPostDiagnosisResultCookieValue(typeCode: string, key: string) {
  return `${typeCode}:${key}`;
}

export function buildPostDiagnosisResultCookie(typeCode: string, key: string) {
  return [
    `${POST_DIAGNOSIS_RESULT_COOKIE_NAME}=${getPostDiagnosisResultCookieValue(typeCode, key)}`,
    `Max-Age=${POST_DIAGNOSIS_RESULT_COOKIE_MAX_AGE}`,
    `Path=/types/${typeCode}/${key}`,
    "SameSite=Lax",
  ].join("; ");
}

export function writePostDiagnosisResultCookie(typeCode: string, key: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = buildPostDiagnosisResultCookie(typeCode, key);
}

export function buildClearPostDiagnosisResultCookie(
  typeCode: string,
  key: string,
) {
  return [
    `${POST_DIAGNOSIS_RESULT_COOKIE_NAME}=`,
    "Max-Age=0",
    `Path=/types/${typeCode}/${key}`,
    "SameSite=Lax",
  ].join("; ");
}

export function clearPostDiagnosisResultCookie(typeCode: string, key: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = buildClearPostDiagnosisResultCookie(typeCode, key);
}
