import type { Metadata } from "next";

import { HomePage } from "@/components/home/home-page/home-page";
import { getAllTypes } from "@/lib/data";
import {
  MAIN_OGP_IMAGE_PATH,
  SITE_DESCRIPTION,
  SITE_HOME_TITLE,
  SITE_KEYWORDS,
  SITE_NAME,
  getStaticSocialImage,
} from "@/lib/site";

const homeOgpImage = getStaticSocialImage(
  MAIN_OGP_IMAGE_PATH,
  `${SITE_NAME} のトップ OGP 画像`,
);

export const metadata: Metadata = {
  title: {
    absolute: SITE_HOME_TITLE,
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ja_JP",
    url: "/",
    title: SITE_HOME_TITLE,
    description: SITE_DESCRIPTION,
    images: [homeOgpImage],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_HOME_TITLE,
    description: SITE_DESCRIPTION,
    images: [homeOgpImage],
  },
};

export default async function MarketingHomePage() {
  const allTypes = await getAllTypes();

  return <HomePage allTypes={allTypes} />;
}
