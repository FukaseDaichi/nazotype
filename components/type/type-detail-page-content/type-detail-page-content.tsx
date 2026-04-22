import type { AxisSummary, TypeData } from "@/lib/types";

import { Suspense } from "react";

import { SiteFooter } from "@/components/layout/site-footer/site-footer";
import { getTypePageJsonLd, stringifyJsonLd } from "@/lib/json-ld";
import { TypeCompatibilitySection } from "@/components/type/type-detail-page-content/type-compatibility-section";
import { TypeDetailHeroSection } from "@/components/type/type-detail-page-content/type-detail-hero-section";
import { TypeListSection } from "@/components/type/type-detail-page-content/type-list-section";
import { TypeOverviewSection } from "@/components/type/type-detail-page-content/type-overview-section";
import { type TypeSectionHeading } from "@/components/type/type-detail-page-content/type-section-frame";
import { PostDiagnosisSection } from "@/components/type/type-detail-page-content/post-diagnosis-section";
import { TypeSharePanel } from "@/components/type/type-detail-page-content/type-share-panel";
import { TypeSignatureSection } from "@/components/type/type-detail-page-content/type-signature-section";

import styles from "./type-detail-page-content.module.css";

type TypeDetailPageContentProps = {
  mode: "public" | "shared";
  typeData: TypeData;
  shareKey?: string;
  shareUrl: string;
  resultUrl?: string;
  publicUrl: string;
  jsonLdPath?: string;
  hidePostDiagnosisSection?: boolean;
  sharedUserName?: string;
  hasChibi?: boolean;
  axisSummaries?: AxisSummary[];
  compatibleTypes?: Array<{ typeCode: string; typeName: string }>;
  isPostDiagnosisResult?: boolean;
};

const SECTION_HEADINGS: Record<string, TypeSectionHeading> = {
  signature: {
    eyebrow: "Type Signature",
    title: "傾向",
    headingId: "signature-heading",
  },
  strengths: {
    eyebrow: "Strengths",
    title: "強み",
    headingId: "strengths-heading",
  },
  cautions: {
    eyebrow: "Cautions",
    title: "注意したい点",
    headingId: "cautions-heading",
  },
  overview: {
    eyebrow: "Overview",
    title: "詳しい見立て",
    headingId: "overview-heading",
  },
  roles: {
    eyebrow: "Roles",
    title: "担いやすい役割",
    headingId: "roles-heading",
  },
  compatibility: {
    eyebrow: "Compatibility",
    title: "相性の傾向",
    headingId: "compat-heading",
  },
};

export function TypeDetailPageContent({
  mode,
  typeData,
  shareKey,
  shareUrl,
  resultUrl,
  publicUrl,
  jsonLdPath,
  hidePostDiagnosisSection = false,
  sharedUserName,
  hasChibi = false,
  axisSummaries,
  compatibleTypes,
  isPostDiagnosisResult = false,
}: TypeDetailPageContentProps) {
  const isShared = mode === "shared";

  return (
    <main id="main-content" className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(getTypePageJsonLd(typeData, jsonLdPath ?? publicUrl)),
        }}
      />

      <TypeDetailHeroSection
        mode={mode}
        typeData={typeData}
        shareKey={shareKey}
        publicUrl={publicUrl}
        sharedUserName={sharedUserName}
        hasChibi={hasChibi}
        isPostDiagnosisResult={isPostDiagnosisResult}
      />

      <div className={styles.shell}>
        <div className={styles.divider} aria-hidden="true">
          <span className={styles.dividerLine} />
          <span className={styles.dividerLabel}>DOSSIER</span>
          <span className={styles.dividerLine} />
        </div>

        {isShared ? (
          <TypeSignatureSection
            heading={SECTION_HEADINGS.signature}
            typeData={typeData}
            axisSummaries={axisSummaries}
          />
        ) : hidePostDiagnosisSection ? null : (
          <Suspense>
            <PostDiagnosisSection
              typeData={typeData}
              publicUrl={publicUrl}
              shareUrl={shareUrl}
            />
          </Suspense>
        )}

        <div className={styles.twoCol}>
          <TypeListSection
            heading={SECTION_HEADINGS.strengths}
            items={typeData.strengths}
            accent="gold"
            index="01"
            marker="check"
          />
          <TypeListSection
            heading={SECTION_HEADINGS.cautions}
            items={typeData.cautions}
            accent="rust"
            index="02"
            marker="warn"
          />
        </div>

        <TypeOverviewSection
          heading={SECTION_HEADINGS.overview}
          content={typeData.detailDescription}
          index="03"
        />

        <TypeListSection
          heading={SECTION_HEADINGS.roles}
          items={typeData.recommendedRole}
          accent="paper"
          index="04"
          marker="dot"
        />

        <TypeCompatibilitySection
          heading={SECTION_HEADINGS.compatibility}
          compatibility={typeData.compatibility}
          compatibleTypes={compatibleTypes}
          index="05"
        />

        {isShared ? (
          <TypeSharePanel
            id="type-share-panel"
            typeCode={typeData.typeCode}
            typeName={typeData.typeName}
            shareText={typeData.shareText}
            shareUrl={shareUrl}
            copyUrl={resultUrl}
            eyebrow="Share"
            title="このタイプページを共有する"
            description="SNS共有はタイプ公開ページへ集約し、この診断結果URLはコピーで送れます。"
          />
        ) : null}

        <SiteFooter className={styles.footer} />
      </div>
    </main>
  );
}
