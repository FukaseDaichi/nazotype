import type { AxisSummary, TypeData } from "@/lib/types";

import {
  Bebas_Neue,
  Caveat,
  Noto_Serif_JP,
  Special_Elite,
} from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer/site-footer";
import { getTypePageJsonLd, stringifyJsonLd } from "@/lib/json-ld";
import { TypeCompatibilitySection } from "@/components/type/type-detail-page-content/type-compatibility-section";
import { TypeDetailHeroSection } from "@/components/type/type-detail-page-content/type-detail-hero-section";
import { TypeListSection } from "@/components/type/type-detail-page-content/type-list-section";
import { TypeOverviewSection } from "@/components/type/type-detail-page-content/type-overview-section";
import { type TypeSectionHeading } from "@/components/type/type-detail-page-content/type-section-frame";
import { TypeSharePanel } from "@/components/type/type-detail-page-content/type-share-panel";
import { TypeSignatureSection } from "@/components/type/type-detail-page-content/type-signature-section";

import styles from "./type-detail-page-content.module.css";

const displayFont = Bebas_Neue({
  variable: "--rcf-font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const typewriterFont = Special_Elite({
  variable: "--rcf-font-typewriter",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const serifFont = Noto_Serif_JP({
  variable: "--rcf-font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

const noteFont = Caveat({
  variable: "--rcf-font-note",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

type TypeDetailPageContentProps = {
  mode: "public" | "shared";
  typeData: TypeData;
  shareKey?: string;
  shareUrl: string;
  resultUrl?: string;
  publicUrl: string;
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
  playstyle: {
    eyebrow: "Playstyle",
    title: "向いている立ち回り",
    headingId: "playstyle-heading",
  },
  roles: {
    eyebrow: "Roles",
    title: "向いている役回り",
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
  sharedUserName,
  hasChibi = false,
  axisSummaries,
  compatibleTypes,
  isPostDiagnosisResult = false,
}: TypeDetailPageContentProps) {
  const isShared = mode === "shared";

  return (
    <main
      id="main-content"
      className={`${displayFont.variable} ${typewriterFont.variable} ${serifFont.variable} ${noteFont.variable} ${styles.page}`}
    >
      <div aria-hidden="true" className={styles.backdrop} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(getTypePageJsonLd(typeData)),
        }}
      />

      <div className={styles.shell}>
        <TypeDetailHeroSection
          mode={mode}
          typeData={typeData}
          shareKey={shareKey}
          publicUrl={publicUrl}
          sharedUserName={sharedUserName}
          hasChibi={hasChibi}
          isPostDiagnosisResult={isPostDiagnosisResult}
        />
        {(isPostDiagnosisResult || isShared) && (
          <TypeSignatureSection
            heading={SECTION_HEADINGS.signature}
            typeData={typeData}
            axisSummaries={axisSummaries}
          />
        )}

        <div className={styles.twoCol}>
          <TypeListSection
            heading={SECTION_HEADINGS.strengths}
            items={typeData.strengths}
          />
          <TypeListSection
            heading={SECTION_HEADINGS.cautions}
            items={typeData.cautions}
          />
        </div>

        <TypeOverviewSection
          heading={SECTION_HEADINGS.overview}
          content={typeData.detailDescription}
        />

        <div className={styles.twoCol}>
          <TypeListSection
            heading={SECTION_HEADINGS.playstyle}
            items={typeData.recommendedPlaystyle}
          />
          <TypeListSection
            heading={SECTION_HEADINGS.roles}
            items={typeData.suitableRoles}
          />
        </div>

        <TypeCompatibilitySection
          heading={SECTION_HEADINGS.compatibility}
          compatibility={typeData.compatibility}
          compatibleTypes={compatibleTypes}
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
