export const SITE_NAME = "マダミスタイプ診断";
export const SITE_SHORT_NAME = "マダミスタイプ";
export const SITE_DESCRIPTION =
  "マダミスタイプ診断は、マーダーミステリーでの立ち回りを32問から4軸16タイプで見える化するサービスです。自分のマダミスタイプや、おすすめマダミス選びのヒントがわかります。";
export const SITE_KEYWORDS = [
  "マダミスタイプ診断",
  "マダミスタイプ",
  "おすすめマダミス",
  "マーダーミステリー",
  "マダミス診断",
  "16タイプ診断",
] as const;
export const SITE_TAGLINE = "立ち回りを、16タイプで見える化する。";
export const SITE_THEME_COLOR = "#f7f2ed";
export const SITE_BACKGROUND_COLOR = "#f7f2ed";
export const LINE_STAMP_URL = process.env.NEXT_PUBLIC_LINE_STAMP_URL ?? "";
export const DRAFT_STORAGE_KEY = "madamistype:diagnosis-draft:v1";

const PALETTE_COLOR_MAP: Record<string, string> = {
  beige: "#D9C6B0",
  black: "#1D1721",
  brown: "#7E5C45",
  burgundy: "#7C304C",
  charcoal: "#434047",
  copper: "#B86E4B",
  "dark brown": "#5D4436",
  "dark gray": "#4F4B54",
  "dark navy": "#26345B",
  "deep blue": "#2B5D8C",
  "deep green": "#2D735B",
  "dusty blue": "#7A91B5",
  emerald: "#2E836B",
  gold: "#C49B57",
  "ice blue": "#B7D4E8",
  ivory: "#F7F2ED",
  "lavender gray": "#A9A1B5",
  "light gray": "#D8CEC9",
  navy: "#31456D",
  plum: "#6F506E",
  silver: "#BCC3CF",
  "smoke gray": "#8C8792",
  "smoky purple": "#705E7B",
  "steel blue": "#5E7D99",
  white: "#FFF9F6",
  "wine red": "#8A3E52",
};

export function getMetadataBase() {
  try {
    return new URL(getSiteOrigin());
  } catch {
    return new URL("http://localhost:3000");
  }
}

function normalizeOrigin(value: string | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function getSiteOrigin() {
  const explicitOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);

  if (explicitOrigin) {
    return explicitOrigin;
  }

  const vercelOrigin = normalizeOrigin(
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL,
  );

  if (vercelOrigin) {
    return vercelOrigin;
  }

  return "http://localhost:3000";
}

export function getAbsoluteUrl(pathname = "/") {
  return new URL(pathname, getMetadataBase()).toString();
}

export function getTypeOgpImagePath(typeCode: string) {
  return `/types/${typeCode}-ogp.png`;
}

export function resolvePalette(colors: string[]) {
  const resolved = colors
    .map((color) => PALETTE_COLOR_MAP[color.toLowerCase()])
    .filter(Boolean);

  if (resolved.length >= 2) {
    return resolved;
  }

  return ["#C97B92", "#2F6F74", "#F7F2ED"];
}
