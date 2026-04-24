import type { QuestionMaster, TypeData } from "@/lib/types";

import { AxisCompositionSection } from "@/components/home/axis-composition-section/axis-composition-section";
import { AllTypesSection } from "@/components/home/home-page/all-types-section";
import { HomeHeroSection } from "@/components/home/home-page/home-hero-section";
import { ResultPreviewSection } from "@/components/home/home-page/result-preview-section";
import { LineStampFloatingPromo } from "@/components/layout/line-stamp-floating-promo/line-stamp-floating-promo";
import { SiteFooter } from "@/components/layout/site-footer/site-footer";
import { AmbientOrbs } from "@/components/ui/ambient-orbs";
import { Particles } from "@/components/ui/particles";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { getWebsiteJsonLd, stringifyJsonLd } from "@/lib/json-ld";

import styles from "./home-page.module.css";

type HomePageProps = {
  allTypes: TypeData[];
  questionMaster: QuestionMaster;
};

export function HomePage({ allTypes }: HomePageProps) {
  return (
    <main id="main-content" className={styles.home}>
      {/* Ambient effects */}
      <AmbientOrbs />
      <Particles />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(getWebsiteJsonLd()),
        }}
      />

      <div className="relative z-[1]">
        {/* ═══ HERO ═══ */}
        <HomeHeroSection />

        {/* ═══ 4 AXES ═══ */}
        <AxisCompositionSection />

        {/* ═══ 16 TYPES ═══ */}
        <AllTypesSection allTypes={allTypes} />

        {/* ═══ HOW IT WORKS ═══ */}
        <section>
          <div className="max-w-[1200px] mx-auto px-8 py-24">
            <RevealOnScroll>
              <p className="font-mono text-[0.65rem] tracking-[0.35em] text-gold-400 uppercase mb-4 flex items-center gap-4">
                HOW IT WORKS
                <span className="flex-1 h-px bg-gradient-to-r from-gold-400/30 to-transparent max-w-[80px]" />
              </p>
              <h2 className="text-[clamp(1.5rem,4.5vw,3rem)] font-bold leading-tight text-paper-50">
                診断の流れ
              </h2>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 mt-16 relative">
                {/* Connector line (desktop) */}
                <div className={styles.stepsConnector} aria-hidden="true" />

                {[
                  {
                    num: "01",
                    title: (
                      <>
                        名前を入力して
                        <br />
                        診断スタート
                      </>
                    ),
                    desc: "登録不要。名前は任意で、結果ページとシェア時に使われます。",
                  },
                  {
                    num: "02",
                    title: (
                      <>
                        32問に答える
                        <br />
                        （3〜5分）
                      </>
                    ),
                    desc: "謎解き中の具体的な行動を問う設問。「理想」ではなく「自然にやりがち」を選んでください。",
                  },
                  {
                    num: "03",
                    title: (
                      <>
                        タイプ判定と
                        <br />
                        詳細レポート
                      </>
                    ),
                    desc: "4軸のグラフ、強み、役割、相性のよいペア像を一覧で確認できます。",
                  },
                ].map((step) => (
                  <div key={step.num} className="p-8 text-center relative">
                    <div className="w-20 h-20 rounded-full border border-gold-400/30 flex items-center justify-center mx-auto mb-6 relative bg-mystery-800/90">
                      <div className="absolute -inset-1 rounded-full border border-dashed border-gold-400/15" />
                      <span className="font-mono text-xl text-gold-400">
                        {step.num}
                      </span>
                    </div>
                    <p className="text-[1.05rem] font-bold text-paper-50 mb-3">
                      {step.title}
                    </p>
                    <p className="text-[0.85rem] leading-relaxed text-paper-200">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </RevealOnScroll>

            <ResultPreviewSection />
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <SiteFooter />
      </div>

      <LineStampFloatingPromo variant="home" />
    </main>
  );
}
