import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { TypeDetailPageContent } from "@/components/type/type-detail-page-content/type-detail-page-content";
import {
  getTypeByCode,
  getTypesByCodes,
  hasChibiImage,
} from "@/lib/data";
import { decodeShareKey, expandShareKeyAxisSummaries } from "@/lib/share-key";
import { getAbsoluteUrl, getTypeOgpImagePath } from "@/lib/site";
import {
  getPostDiagnosisResultCookieValue,
  POST_DIAGNOSIS_RESULT_COOKIE_NAME,
} from "@/lib/post-diagnosis-result";

type PageProps = {
  params: Promise<{ typeCode: string; key: string }>;
};

async function getSharedPageData(typeCode: string, key: string) {
  const typeData = await getTypeByCode(typeCode);
  const payload = decodeShareKey(key);

  if (!typeData || !payload) {
    notFound();
  }

  const axisSummaries = expandShareKeyAxisSummaries(payload);

  if (axisSummaries.map((summary) => summary.resolvedCode).join("") !== typeCode) {
    notFound();
  }

  const hasChibi = await hasChibiImage(typeData.typeCode);
  const compatibleTypes = await getTypesByCodes(
    typeData.compatibility.goodWithTypeCodes ?? [],
  );

  return {
    typeData,
    publicUrl: `/types/${typeData.typeCode}`,
    shareUrl: getAbsoluteUrl(`/types/${typeData.typeCode}`),
    resultUrl: getAbsoluteUrl(`/types/${typeData.typeCode}/${key}`),
    sharedUserName: payload.n,
    hasChibi,
    axisSummaries,
    compatibleTypes: compatibleTypes.map(({ typeCode, typeName }) => ({
      typeCode,
      typeName,
    })),
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { typeCode, key } = await params;
  const { typeData } = await getSharedPageData(typeCode, key);
  const ogImagePath = getTypeOgpImagePath(typeData.typeCode);

  return {
    title: `共有された結果: ${typeData.typeName} (${typeData.typeCode})`,
    description: `${typeData.typeName}（${typeData.typeCode}）の共有タイプページです。`,
    alternates: {
      canonical: `/types/${typeData.typeCode}`,
    },
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: `共有結果: ${typeData.typeName} (${typeData.typeCode})`,
      description: typeData.tagline,
      url: `/types/${typeData.typeCode}/${key}`,
      images: [ogImagePath],
    },
    twitter: {
      card: "summary_large_image",
      title: `共有結果: ${typeData.typeName}`,
      description: typeData.tagline,
      images: [ogImagePath],
    },
  };
}

export default async function SharedResultPage({ params }: PageProps) {
  const { typeCode, key } = await params;
  const cookieStore = await cookies();
  const {
    typeData,
    shareUrl,
    resultUrl,
    publicUrl,
    sharedUserName,
    hasChibi,
    axisSummaries,
    compatibleTypes,
  } =
    await getSharedPageData(typeCode, key);
  const isPostDiagnosisResult =
    cookieStore.get(POST_DIAGNOSIS_RESULT_COOKIE_NAME)?.value ===
    getPostDiagnosisResultCookieValue(typeCode, key);

  return (
    <TypeDetailPageContent
      mode="shared"
      typeData={typeData}
      shareKey={key}
      shareUrl={shareUrl}
      resultUrl={resultUrl}
      publicUrl={publicUrl}
      sharedUserName={sharedUserName}
      hasChibi={hasChibi}
      axisSummaries={axisSummaries}
      compatibleTypes={compatibleTypes}
      isPostDiagnosisResult={isPostDiagnosisResult}
    />
  );
}
