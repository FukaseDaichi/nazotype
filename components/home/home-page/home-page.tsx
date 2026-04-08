import type { QuestionMaster, TypeData } from "@/lib/types";
import {
  Bebas_Neue,
  IBM_Plex_Mono,
  Klee_One,
  Noto_Serif_JP,
} from "next/font/google";

import { AxisCompositionSection } from "@/components/home/axis-composition-section/axis-composition-section";
import { AllTypesSection } from "@/components/home/home-page/all-types-section";
import { FeaturedTypesSection } from "@/components/home/home-page/featured-types-section";
import { HomeHeroSection } from "@/components/home/home-page/home-hero-section";
import { SiteFooter } from "@/components/layout/site-footer/site-footer";
import { getWebsiteJsonLd, stringifyJsonLd } from "@/lib/json-ld";

import styles from "./home-page.module.css";

const headingFont = Bebas_Neue({
  variable: "--nzt-font-heading",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const monoFont = IBM_Plex_Mono({
  variable: "--nzt-font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

const serifFont = Noto_Serif_JP({
  variable: "--nzt-font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

const noteFont = Klee_One({
  variable: "--nzt-font-note",
  subsets: ["latin"],
  weight: ["400"],
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
      <main id="main-content" className="max-w-5xl mx-auto px-4 py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: stringifyJsonLd(getWebsiteJsonLd()),
          }}
        />
        <section className="rounded-xl border border-midnight-600 bg-midnight-800 p-6 flex flex-col gap-3">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
            Home
          </p>
          <h1 className="font-heading text-2xl">
            タイプデータを読み込めませんでした。
          </h1>
          <p className="text-sm text-[--color-text-muted]">
            データ配置を確認してから、もう一度アクセスしてください。
          </p>
        </section>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className={`${headingFont.variable} ${monoFont.variable} ${serifFont.variable} ${noteFont.variable} ${styles.home}`}
    >
      <div aria-hidden="true" className={styles.heroGlow} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(getWebsiteJsonLd()),
        }}
      />

      <div className="relative z-[1] max-w-[1200px] mx-auto px-4 md:px-8 pb-16">
        <HomeHeroSection heroType={heroType} questionMaster={questionMaster} />
        <AxisCompositionSection />
        <FeaturedTypesSection spotlightTypes={spotlightTypes} />
        <AllTypesSection allTypes={allTypes} />
        <SiteFooter />
      </div>
    </main>
  );
}
