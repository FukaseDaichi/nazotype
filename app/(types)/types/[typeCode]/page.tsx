import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getAllTypeCodes,
  getTypeByCode,
  getTypesByCodes,
  hasChibiImage,
} from "@/lib/data";
import {
  SITE_NAME,
  getAbsoluteUrl,
  getStaticSocialImage,
  getTypeOgpImagePath,
  getTypePublicPath,
} from "@/lib/site";
import { TypeDetailPageContent } from "@/components/type/type-detail-page-content/type-detail-page-content";

type PageProps = {
  params: Promise<{ typeCode: string }>;
};

export async function generateStaticParams() {
  const typeCodes = await getAllTypeCodes();
  return typeCodes.map((typeCode) => ({ typeCode }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { typeCode } = await params;
  const typeData = await getTypeByCode(typeCode);

  if (!typeData) {
    notFound();
  }

  const ogImagePath = getTypeOgpImagePath(typeData.typeCode);
  const ogImage = getStaticSocialImage(
    ogImagePath,
    `${typeData.typeName} (${typeData.typeCode}) の OGP 画像`,
  );
  const publicPath = getTypePublicPath(typeData.typeCode);
  const typePageTitle = `${typeData.typeName} (${typeData.typeCode})`;
  const typePageDescription = `謎解きタイプ診断の16タイプ「${typeData.typeName} (${typeData.typeCode})」の詳細。${typeData.summary}`;

  return {
    title: typePageTitle,
    description: typePageDescription,
    alternates: {
      canonical: publicPath,
    },
    openGraph: {
      title: `${typePageTitle} | ${SITE_NAME}`,
      description: typePageDescription,
      url: publicPath,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${typePageTitle} | ${SITE_NAME}`,
      description: typePageDescription,
      images: [ogImage],
    },
  };
}

export default async function TypeDetailPage({ params }: PageProps) {
  const { typeCode } = await params;
  const typeData = await getTypeByCode(typeCode);

  if (!typeData) {
    notFound();
  }

  const publicUrl = getTypePublicPath(typeData.typeCode);
  const hasChibi = await hasChibiImage(typeData.typeCode);
  const compatibleTypes = await getTypesByCodes(
    typeData.compatibility.goodWithTypeCodes ?? [],
  );

  return (
    <TypeDetailPageContent
      mode="public"
      typeData={typeData}
      shareUrl={getAbsoluteUrl(publicUrl)}
      publicUrl={publicUrl}
      hasChibi={hasChibi}
      compatibleTypes={compatibleTypes.map(({ typeCode, typeName }) => ({
        typeCode,
        typeName,
      }))}
    />
  );
}
