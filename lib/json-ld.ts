import type { TypeData } from "@/lib/types";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_SHORT_NAME,
  getAbsoluteUrl,
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
    alternateName: SITE_SHORT_NAME,
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS.join(", "),
    url: getAbsoluteUrl("/"),
    inLanguage: "ja-JP",
  };
}

export function getTypePageJsonLd(typeData: TypeData) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${typeData.typeName} (${typeData.typeCode})`,
    description: typeData.summary,
    url: getAbsoluteUrl(`/types/${typeData.typeCode}`),
    inLanguage: "ja-JP",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: getAbsoluteUrl("/"),
    },
  };
}
