import type { Metadata } from "next";

import { SecretPageContent } from "@/components/secret/secret-page-content";
import { getAbsoluteUrl, getTypeOgpImagePath } from "@/lib/site";
import { getSecretPublicPath, getSecretResult } from "@/lib/secret-result";

const secretResult = getSecretResult();
const secretPublicPath = getSecretPublicPath();
const secretOgpImage = getTypeOgpImagePath(secretResult.typeCode);

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
    images: [secretOgpImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${secretResult.typeName} (${secretResult.typeCode})`,
    description: secretResult.tagline,
    images: [secretOgpImage],
  },
};

export default function SecretPage() {
  return (
    <SecretPageContent
      typeData={secretResult}
      ogpImageSrc={secretOgpImage}
      shareUrl={getAbsoluteUrl(secretPublicPath)}
      publicUrl={secretPublicPath}
      jsonLdPath={secretPublicPath}
    />
  );
}
