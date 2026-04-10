import type { QuestionMaster, TypeData } from "@/lib/types";

import { AxisCompositionSection } from "@/components/home/axis-composition-section/axis-composition-section";
import { AllTypesSection } from "@/components/home/home-page/all-types-section";
import { HomeHeroSection } from "@/components/home/home-page/home-hero-section";
import { SiteFooter } from "@/components/layout/site-footer/site-footer";
import { AmbientOrbs } from "@/components/ui/ambient-orbs";
import { Particles } from "@/components/ui/particles";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { getWebsiteJsonLd, stringifyJsonLd } from "@/lib/json-ld";
import { StartDiagnosisForm } from "@/components/diagnosis/start-diagnosis-form/start-diagnosis-form";

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

        {/* ═══ CONCEPT ═══ */}
        <section style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="max-w-[1200px] mx-auto px-8 py-24">
            <RevealOnScroll>
              <p className="font-mono text-[0.65rem] tracking-[0.35em] text-gold-400 uppercase mb-4 flex items-center gap-4">
                CONCEPT
                <span className="flex-1 h-px bg-gradient-to-r from-gold-400/30 to-transparent max-w-[80px]" />
              </p>
              <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold leading-tight text-paper-50 mb-6">
                「解く力」ではなく
                <br />
                「役割の違い」を診る
              </h2>
              <p className="text-[1.05rem] font-light leading-[1.9] text-paper-200 max-w-[600px]">
                本診断は、リアル脱出ゲームや周遊型謎解きにおける
                <strong className="text-paper-50">行動傾向・役割適性</strong>
                を測るものです。
                あなたが頭いいかどうかではなく、チームの中でどう動くか——その違いを4軸で可視化します。
              </p>
            </RevealOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mt-16">
              {/* Concept visual: rotating rings + axis diagram */}
              <RevealOnScroll>
                <div className={styles.conceptVisual}>
                  <div className={`${styles.conceptRing} ${styles.ringOuter}`} />
                  <div className={`${styles.conceptRing} ${styles.ringMid}`} />
                  <div className={`${styles.conceptRing} ${styles.ringInner}`} />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className={styles.axisDiagram}>
                      <div className={styles.axisLineH} />
                      <div className={styles.axisLineV} />
                      {/* Cardinal dots */}
                      <div className={styles.axisDot} style={{ left: "50%", top: "5%" }} />
                      <div className={styles.axisDot} style={{ left: "50%", top: "95%" }} />
                      <div className={styles.axisDot} style={{ left: "5%", top: "50%" }} />
                      <div className={styles.axisDot} style={{ left: "95%", top: "50%" }} />
                      {/* Labels */}
                      <div className={styles.axisLabelItem} style={{ left: "50%", top: 0, transform: "translate(-50%,-100%)" }}>俯瞰型</div>
                      <div className={styles.axisLabelItem} style={{ left: "50%", bottom: 0, transform: "translate(-50%,100%)" }}>局所型</div>
                      <div className={styles.axisLabelItem} style={{ left: 0, top: "50%", transform: "translate(-100%,-50%)" }}>行動型</div>
                      <div className={styles.axisLabelItem} style={{ right: 0, top: "50%", transform: "translate(100%,-50%)" }}>解読型</div>
                      {/* Scatter dots */}
                      {[
                        { left: "25%", top: "30%", size: 5, opacity: 0.5 },
                        { left: "70%", top: "25%", size: 4, opacity: 0.4 },
                        { left: "60%", top: "70%", size: 6, opacity: 0.6 },
                        { left: "30%", top: "65%", size: 4, opacity: 0.3 },
                        { left: "80%", top: "55%", size: 5, opacity: 0.5 },
                        { left: "20%", top: "45%", size: 3, opacity: 0.35 },
                        { left: "45%", top: "80%", size: 4, opacity: 0.4 },
                        { left: "75%", top: "40%", size: 5, opacity: 0.5 },
                      ].map((dot, i) => (
                        <div
                          key={i}
                          className="absolute rounded-full bg-gold-400 -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: dot.left,
                            top: dot.top,
                            width: dot.size,
                            height: dot.size,
                            opacity: dot.opacity,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Concept points */}
              <RevealOnScroll>
                <ul className="flex flex-col gap-6 list-none p-0">
                  {[
                    {
                      num: "01",
                      text: (
                        <>
                          <strong className="text-paper-50 font-medium">4軸・16タイプ</strong>
                          の独自モデル。MBTIではなく、謎解きに特化した役割傾向モデルです。
                        </>
                      ),
                    },
                    {
                      num: "02",
                      text: (
                        <>
                          <strong className="text-paper-50 font-medium">優劣なし。</strong>
                          すべてのタイプに強みがあり、チームで補完し合うことを重視します。
                        </>
                      ),
                    },
                    {
                      num: "03",
                      text: (
                        <>
                          <strong className="text-paper-50 font-medium">ペア相性診断。</strong>
                          組み合わせの妙がわかる。イベント前のアイスブレイクにも最適です。
                        </>
                      ),
                    },
                    {
                      num: "04",
                      text: (
                        <>
                          謎解きの
                          <strong className="text-paper-50 font-medium">行動・判断・情報処理・関わり方</strong>
                          を問う32問。普段の性格ではなく、ゲーム中の動き方を測ります。
                        </>
                      ),
                    },
                  ].map((point) => (
                    <li key={point.num} className="flex gap-5 items-start">
                      <span className="font-mono text-[0.7rem] text-gold-400 mt-0.5 shrink-0 w-8">
                        {point.num}
                      </span>
                      <span className="text-[0.95rem] leading-relaxed text-paper-200">
                        {point.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </RevealOnScroll>
            </div>
          </div>
        </section>

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
              <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold leading-tight text-paper-50">
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
                    <p className="text-[0.85rem] leading-relaxed text-paper-300">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </RevealOnScroll>

            {/* Result teaser */}
            <RevealOnScroll>
              <div className="max-w-[680px] mx-auto mt-16 border border-gold-400/20 bg-mystery-800/80 backdrop-blur-[10px] p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

                <p className="font-mono text-[0.65rem] text-gold-400 tracking-[0.25em] mb-6">
                  OUTPUT PREVIEW — 診断後の出力イメージ
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { left: "行動型", right: "解読型", fill: 72 },
                    { left: "局所型", right: "俯瞰型", fill: 38 },
                    { left: "発信型", right: "統率型", fill: 65 },
                    { left: "熟考型", right: "転換型", fill: 25 },
                  ].map((axis) => (
                    <div key={axis.left} className="flex flex-col gap-1.5">
                      <div className="flex justify-between font-mono text-[0.65rem] text-paper-300">
                        <span>{axis.left}</span>
                        <span>{axis.right}</span>
                      </div>
                      <div className="h-[3px] bg-gold-400/15 relative overflow-hidden rounded-sm">
                        <div
                          className={styles.resultAxisFill}
                          style={{ width: `${axis.fill}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 inline-block px-6 py-2 border border-gold-400 text-xl font-bold text-gold-300 tracking-wider">
                  ALHN — 探索の猟犬
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="text-center py-32 px-8 relative">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(193,155,46,0.06), transparent 60%)",
            }}
          />
          <div className="relative z-[1] max-w-[700px] mx-auto">
            <RevealOnScroll>
              <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-paper-50 leading-tight mb-6">
                さあ、あなたの
                <br />
                タイプを解け。
              </h2>
              <p className="text-base text-paper-200 mb-12 leading-[1.8]">
                チームの「なぜかうまくいく」は、役割の補完から生まれる。
                <br />
                診断は無料、登録不要、3〜5分で完了します。
              </p>
            </RevealOnScroll>
            <RevealOnScroll>
              <StartDiagnosisForm inputId="ctaName" />
            </RevealOnScroll>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <SiteFooter />
      </div>
    </main>
  );
}
