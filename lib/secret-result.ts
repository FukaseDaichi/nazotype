import secretResultJson from "@/data/special-results/secret.json";
import type { TypeData } from "@/lib/types";

const TWILIGHT_TRIGGER = "とわいらいと";
const HIRAGANA_OFFSET = 0x60;

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

function toHiragana(value: string) {
  return value.replace(/[ァ-ヶ]/gu, (char) =>
    String.fromCharCode(char.charCodeAt(0) - HIRAGANA_OFFSET),
  );
}
