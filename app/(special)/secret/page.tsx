import type { Metadata } from "next";

import { TypeDetailPageContent } from "@/components/type/type-detail-page-content/type-detail-page-content";
import { getAbsoluteUrl } from "@/lib/site";
import { getSecretPublicPath, getSecretResult } from "@/lib/secret-result";

const secretResult = getSecretResult();
const secretPublicPath = getSecretPublicPath();

export const metadata: Metadata = {
  title: `${secretResult.typeName} (${secretResult.typeCode})`,
  description: secretResult.summary,
  alternates: {
    canonical: secretPublicPath,
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },
  openGraph: {
    title: `${secretResult.typeName} (${secretResult.typeCode})`,
    description: secretResult.tagline,
    url: secretPublicPath,
    images: ["/main-ogp.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${secretResult.typeName} (${secretResult.typeCode})`,
    description: secretResult.tagline,
    images: ["/main-ogp.png"],
  },
};

export default function SecretPage() {
  return (
    <TypeDetailPageContent
      mode="shared"
      typeData={secretResult}
      shareUrl={getAbsoluteUrl(secretPublicPath)}
      publicUrl={secretPublicPath}
      jsonLdPath={secretPublicPath}
      hidePostDiagnosisSection
      hasChibi={false}
      compatibleTypes={[]}
    />
  );
}
