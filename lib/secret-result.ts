import secretResultJson from "@/data/special-results/secret.json";
import type { TypeData } from "@/lib/types";

const TWILIGHT_TRIGGER = "とわいらいと";
const HIRAGANA_OFFSET = 0x60;
const SECRET_SHARE_ENTRY_TTL_MS = 5 * 60 * 1000;

export const SECRET_SHARE_ENTRY_STORAGE_KEY = "nazotype:secret-share-entry";

export const SECRET_PUBLIC_PATH = "/secret/";

const secretResult = secretResultJson as TypeData;

export function getSecretResult() {
  return secretResult;
}

export function getSecretPublicPath() {
  return SECRET_PUBLIC_PATH;
}

export function normalizeSecretTriggerName(value: string) {
  return toHiragana(value.trim().slice(0, 10).normalize("NFKC"));
}

export function isSecretTriggerName(value: string) {
  return normalizeSecretTriggerName(value) === TWILIGHT_TRIGGER;
}

export function writeSecretShareEntry(path = SECRET_PUBLIC_PATH) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      SECRET_SHARE_ENTRY_STORAGE_KEY,
      JSON.stringify({
        path,
        timestamp: Date.now(),
      }),
    );
  } catch {
    // localStorage が使えない環境では無視
  }
}

export function readSecretShareEntry(path = SECRET_PUBLIC_PATH) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const raw = localStorage.getItem(SECRET_SHARE_ENTRY_STORAGE_KEY);
    if (!raw) {
      return false;
    }

    const parsed = JSON.parse(raw) as {
      path?: unknown;
      timestamp?: unknown;
    };

    if (
      typeof parsed.path !== "string" ||
      typeof parsed.timestamp !== "number" ||
      Date.now() - parsed.timestamp > SECRET_SHARE_ENTRY_TTL_MS
    ) {
      localStorage.removeItem(SECRET_SHARE_ENTRY_STORAGE_KEY);
      return false;
    }

    return parsed.path === path;
  } catch {
    try {
      localStorage.removeItem(SECRET_SHARE_ENTRY_STORAGE_KEY);
    } catch {
      // localStorage が使えない環境では無視
    }

    return false;
  }
}

export function clearSecretShareEntry() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(SECRET_SHARE_ENTRY_STORAGE_KEY);
  } catch {
    // localStorage が使えない環境では無視
  }
}

function toHiragana(value: string) {
  return value.replace(/[ァ-ヶ]/gu, (char) =>
    String.fromCharCode(char.charCodeAt(0) - HIRAGANA_OFFSET),
  );
}
