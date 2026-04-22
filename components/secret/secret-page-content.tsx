import type { TypeData } from "@/lib/types";

import { SiteFooter } from "@/components/layout/site-footer/site-footer";
import { SecretHeroSection } from "@/components/secret/secret-hero-section";
import { TypeCompatibilitySection } from "@/components/type/type-detail-page-content/type-compatibility-section";
import { TypeListSection } from "@/components/type/type-detail-page-content/type-list-section";
import { TypeOverviewSection } from "@/components/type/type-detail-page-content/type-overview-section";
import { type TypeSectionHeading } from "@/components/type/type-detail-page-content/type-section-frame";
import { TypeSharePanel } from "@/components/type/type-detail-page-content/type-share-panel";
import { getTypePageJsonLd, stringifyJsonLd } from "@/lib/json-ld";

import styles from "./secret-page-content.module.css";

type SecretPageContentProps = {
  typeData: TypeData;
  ogpImageSrc: string;
  shareUrl: string;
  publicUrl: string;
  jsonLdPath?: string;
};

const SECTION_HEADINGS: Record<string, TypeSectionHeading> = {
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

export function SecretPageContent({
  typeData,
  ogpImageSrc,
  shareUrl,
  publicUrl,
  jsonLdPath,
}: SecretPageContentProps) {
  return (
    <main id="main-content" className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(
            getTypePageJsonLd(typeData, jsonLdPath ?? publicUrl),
          ),
        }}
      />

      <SecretHeroSection
        typeData={typeData}
        ogpImageSrc={ogpImageSrc}
        publicUrl={publicUrl}
      />

      <div id="secret-dossier" className={styles.shell}>
        <div className={styles.divider} aria-hidden="true">
          <span className={styles.dividerLine} />
          <span className={styles.dividerLabel}>
            <span className={styles.dividerGlyph} />
            Secret Dossier
            <span className={styles.dividerGlyph} />
          </span>
          <span className={styles.dividerLine} />
        </div>

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
          compatibleTypes={[]}
          index="05"
        />

        <TypeSharePanel
          id="type-share-panel"
          typeCode={typeData.typeCode}
          typeName={typeData.typeName}
          shareText={typeData.shareText}
          shareUrl={shareUrl}
          eyebrow="Share"
          title="この秘密を誰かに渡す"
          description="SNSで共有して、同じ結末にたどり着いた仲間を集めよう。"
        />

        <SiteFooter className={styles.footer} />
      </div>
    </main>
  );
}
