import type { QuestionMaster, TypeData } from "@/lib/types";
import {
  Bebas_Neue,
  Caveat,
  Noto_Serif_JP,
  Special_Elite,
} from "next/font/google";

import { AxisCompositionSection } from "@/components/home/axis-composition-section/axis-composition-section";
import { AllTypesSection } from "@/components/home/home-page/all-types-section";
import { FeaturedTypesSection } from "@/components/home/home-page/featured-types-section";
import { HomeHeroSection } from "@/components/home/home-page/home-hero-section";
import { SiteFooter } from "@/components/layout/site-footer/site-footer";
import { getWebsiteJsonLd, stringifyJsonLd } from "@/lib/json-ld";

import styles from "./home-page.module.css";

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

const FEATURED_TYPE_CODES = new Set(["TFLP", "TRLP", "OREI", "OFEP"]);

type HomePageProps = {
  allTypes: TypeData[];
  questionMaster: QuestionMaster;
};

export function HomePage({ allTypes, questionMaster }: HomePageProps) {
  const featuredTypes = allTypes.filter((type) =>
    FEATURED_TYPE_CODES.has(type.typeCode),
  );
  const spotlightTypes =
    featuredTypes.length > 0 ? featuredTypes : allTypes.slice(0, 4);
  const heroType =
    allTypes.find((type) => type.typeCode === "TFLP") ??
    spotlightTypes[0] ??
    null;

  if (!heroType) {
    return (
      <main id="main-content" className="page-shell py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: stringifyJsonLd(getWebsiteJsonLd()),
          }}
        />
        <section className="surface-panel flex flex-col gap-3">
          <p className="eyebrow">Home</p>
          <h1 className="section-title">
            タイプデータを読み込めませんでした。
          </h1>
          <p className="text-sm leading-7 text-[color:var(--color-text-subtle)]">
            データ配置を確認してから、もう一度アクセスしてください。
          </p>
        </section>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className={`${displayFont.variable} ${typewriterFont.variable} ${serifFont.variable} ${noteFont.variable} ${styles.home}`}
    >
      <div aria-hidden="true" className={styles.backdrop} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(getWebsiteJsonLd()),
        }}
      />

      <div className={styles.shell}>
        <HomeHeroSection heroType={heroType} questionMaster={questionMaster} />
        <AxisCompositionSection />
        <FeaturedTypesSection spotlightTypes={spotlightTypes} />
        <AllTypesSection allTypes={allTypes} />
        <SiteFooter />
      </div>
    </main>
  );
}
