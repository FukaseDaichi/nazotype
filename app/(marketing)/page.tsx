import type { Metadata } from "next";

import { HomePage } from "@/components/home/home-page/home-page";
import { getAllTypes, getQuestionMaster } from "@/lib/data";
import { SITE_DESCRIPTION, SITE_KEYWORDS } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: "マダミスタイプ診断",
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  alternates: {
    canonical: "/",
  },
};

export default async function MarketingHomePage() {
  const [allTypes, questionMaster] = await Promise.all([
    getAllTypes(),
    getQuestionMaster(),
  ]);

  return <HomePage allTypes={allTypes} questionMaster={questionMaster} />;
}
