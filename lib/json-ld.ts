import type { TypeData } from "@/lib/types";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_SHORT_NAME,
  getAbsoluteUrl,
  getTypePublicPath,
} from "@/lib/site";

export function stringifyJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</gu, "\\u003c");
}

export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": getAbsoluteUrl("/#website"),
    name: SITE_NAME,
    alternateName: [SITE_SHORT_NAME, "謎解き診断", "謎解き16タイプ診断"],
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS.join(", "),
    url: getAbsoluteUrl("/"),
    inLanguage: "ja-JP",
    about: [
      "謎解き",
      "謎解きイベント",
      "リアル脱出ゲーム",
      "16タイプ診断",
    ],
  };
}

export function getTypePageJsonLd(typeData: TypeData, pathname?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${typeData.typeName} (${typeData.typeCode}) | ${SITE_NAME}`,
    description: `謎解きタイプ診断の16タイプ「${typeData.typeName} (${typeData.typeCode})」の詳細。${typeData.summary}`,
    url: getAbsoluteUrl(pathname ?? getTypePublicPath(typeData.typeCode)),
    inLanguage: "ja-JP",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: getAbsoluteUrl("/"),
    },
  };
}
