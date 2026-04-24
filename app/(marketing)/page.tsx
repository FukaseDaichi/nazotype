import type { Metadata } from "next";

import { HomePage } from "@/components/home/home-page/home-page";
import { getAllTypes, getQuestionMaster } from "@/lib/data";
import {
  MAIN_OGP_IMAGE_PATH,
  SITE_DESCRIPTION,
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
    absolute: SITE_NAME,
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
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [homeOgpImage],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [homeOgpImage],
  },
};

export default async function MarketingHomePage() {
  const [allTypes, questionMaster] = await Promise.all([
    getAllTypes(),
    getQuestionMaster(),
  ]);

  return <HomePage allTypes={allTypes} questionMaster={questionMaster} />;
}
