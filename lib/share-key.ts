import { AXIS_CONFIG } from "@/lib/axis";
import { normalizeUserName } from "@/lib/diagnosis";
import type {
  AxisCode,
  AxisSummary,
  ShareKeyPayload,
  ShareKeyPayloadV3,
  ShareKeyTrendStates,
} from "@/lib/types";

const SHARE_AXIS_ORDER: AxisCode[] = ["A1", "A2", "A3", "A4"];
const COMPACT_NAME_BYTE_LIMIT = 40;
const COMPACT_TREND_BYTE_LENGTH = 3;
const COMPACT_ZERO_NEGATIVE_STATE = 16;
const COMPACT_ZERO_POSITIVE_STATE = 33;
const COMPACT_MAX_STATE = 33;

export function createShareKey(userName: string, axisSummaries: AxisSummary[]) {
  return encodeShareKey({
    v: 3,
    n: normalizeUserName(userName),
    t: encodeTrendStates(axisSummaries),
  });
}

export function encodeShareKey(payload: ShareKeyPayload) {
  return encodeCompactShareKey(payload);
}

export function decodeShareKey(key: string) {
  try {
    const bytes = decodeBase64UrlToBytes(key);
    return decodeCompactShareKey(bytes);
  } catch {
    return null;
  }
}

export function expandShareKeyAxisSummaries(payload: ShareKeyPayloadV3) {
  return payload.t.map((state, index) =>
    decodeTrendState(SHARE_AXIS_ORDER[index], state),
  );
}

function encodeCompactShareKey(payload: ShareKeyPayloadV3) {
  const nameBytes = encodeUtf8(payload.n);

  if (nameBytes.length > COMPACT_NAME_BYTE_LIMIT) {
    throw new Error("Share key user name is too long to encode.");
  }

  const bytes = new Uint8Array(1 + nameBytes.length + COMPACT_TREND_BYTE_LENGTH);
  bytes[0] = nameBytes.length;
  bytes.set(nameBytes, 1);
  bytes.set(packTrendStates(payload.t), 1 + nameBytes.length);

  return encodeBase64UrlBytes(bytes);
}

function decodeCompactShareKey(bytes: Uint8Array) {
  const nameByteLength = bytes[0];

  if (nameByteLength > COMPACT_NAME_BYTE_LIMIT) {
    return null;
  }

  const expectedLength = 1 + nameByteLength + COMPACT_TREND_BYTE_LENGTH;
  if (bytes.length !== expectedLength) {
    return null;
  }

  const trendStates = unpackTrendStates(
    bytes.subarray(1 + nameByteLength, expectedLength),
  );

  if (!trendStates) {
    return null;
  }

  return {
    v: 3 as const,
    n: normalizeUserName(decodeUtf8(bytes.subarray(1, 1 + nameByteLength))),
    t: trendStates,
  };
}

function encodeTrendStates(axisSummaries: AxisSummary[]): ShareKeyTrendStates {
  const summaryByAxis = new Map(axisSummaries.map((summary) => [summary.axis, summary]));

  return SHARE_AXIS_ORDER.map((axis) => {
    const summary = summaryByAxis.get(axis);

    if (!summary) {
      throw new Error(`Missing axis summary for ${axis}.`);
    }

    return encodeTrendState(summary);
  }) as ShareKeyTrendStates;
}

function encodeTrendState(summary: AxisSummary) {
  const roundedScore = Math.round(summary.score);

  if (roundedScore < -16 || roundedScore > 16) {
    throw new Error(`Axis score for ${summary.axis} is out of range.`);
  }

  if (roundedScore === 0) {
    return summary.resolvedCode === summary.positiveCode
      ? COMPACT_ZERO_POSITIVE_STATE
      : COMPACT_ZERO_NEGATIVE_STATE;
  }

  return roundedScore + 16;
}

function decodeTrendState(axis: AxisCode, state: number): AxisSummary {
  const config = AXIS_CONFIG[axis];
  const score = decodeTrendScore(state);
  const resolvedCode = isPositiveTrendState(state)
    ? config.positiveCode
    : config.negativeCode;
  const positivePercent = Math.round(((score + 16) / 32) * 100);
  const negativePercent = 100 - positivePercent;

  return {
    axis,
    positiveLabel: config.positiveLabel,
    negativeLabel: config.negativeLabel,
    positiveCode: config.positiveCode,
    negativeCode: config.negativeCode,
    score,
    positivePercent,
    negativePercent,
    resolvedCode,
    resolvedLabel:
      resolvedCode === config.positiveCode
        ? config.positiveLabel
        : config.negativeLabel,
  };
}

function decodeTrendScore(state: number) {
  if (state === COMPACT_ZERO_NEGATIVE_STATE || state === COMPACT_ZERO_POSITIVE_STATE) {
    return 0;
  }

  return state - 16;
}

function isPositiveTrendState(state: number) {
  return state === COMPACT_ZERO_POSITIVE_STATE || state > COMPACT_ZERO_NEGATIVE_STATE;
}

function packTrendStates(states: ShareKeyTrendStates) {
  // Four 6-bit trend states fit exactly into 24 bits.
  const packed =
    (states[0] << 18) | (states[1] << 12) | (states[2] << 6) | states[3];

  return Uint8Array.of((packed >> 16) & 0xff, (packed >> 8) & 0xff, packed & 0xff);
}

function unpackTrendStates(bytes: Uint8Array) {
  if (bytes.length !== COMPACT_TREND_BYTE_LENGTH) {
    return null;
  }

  const packed = (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];

  return toTrendStates([
    (packed >> 18) & 0x3f,
    (packed >> 12) & 0x3f,
    (packed >> 6) & 0x3f,
    packed & 0x3f,
  ]);
}

function toTrendStates(states: number[]) {
  if (states.some((state) => !Number.isInteger(state) || state < 0 || state > COMPACT_MAX_STATE)) {
    return null;
  }

  return [...states] as ShareKeyTrendStates;
}

function encodeUtf8(input: string) {
  return new TextEncoder().encode(input);
}

function decodeUtf8(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes);
}

function encodeBase64UrlBytes(input: Uint8Array) {
  if (typeof window === "undefined") {
    return Buffer.from(input).toString("base64url");
  }

  let binary = "";

  input.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return window
    .btoa(binary)
    .replace(/\+/gu, "-")
    .replace(/\//gu, "_")
    .replace(/=+$/u, "");
}

function decodeBase64UrlToBytes(input: string) {
  if (typeof window === "undefined") {
    return Uint8Array.from(Buffer.from(input, "base64url"));
  }

  const normalized = input.replace(/-/gu, "+").replace(/_/gu, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = window.atob(normalized + padding);

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
