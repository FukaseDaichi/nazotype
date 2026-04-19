import { AXIS_DEFINITIONS } from "@/lib/axis";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

import styles from "./axis-composition-section.module.css";

const AXIS_TAGS: Record<string, string[]> = {
  A1: ["探索", "アイテム回収", "小謎処理", "仮説検証"],
  A2: ["パターン認識", "精読", "大謎統合", "構造理解"],
  A3: ["速報共有", "アイデア出し", "進行管理", "役割振り分け"],
  A4: ["難問継続", "仮説深掘り", "ヒント判断", "時間管理"],
};

const AXIS_DESCRIPTIONS: Record<string, string> = {
  A1: "情報を取りに行くか、その場で処理するか。会場を歩き回り手がかりを発見するか、手元の謎を深く読み解くか。",
  A2: "個別問題に深く入るか、全体構造を見渡すか。細部の規則や違和感を拾うか、情報の接続と全体像を描くか。",
  A3: "気づきを外へ出して流れを作るか、情報を整理してチームを回すか。場に材料を供給するか、全体の効率を整えるか。",
  A4: "今の問題に粘るか、別の手段に切り替えるか。粘り強く考え抜くか、状況を見てヒントや方針転換を判断するか。",
};

export function AxisCompositionSection() {
  return (
    <section id="axes" aria-labelledby="axis-composition-heading">
      <div className="max-w-[1200px] mx-auto px-8 py-24">
        <RevealOnScroll>
          <p className="font-mono text-[0.65rem] tracking-[0.35em] text-gold-400 uppercase mb-4 flex items-center gap-4">
            4 AXES
            <span className="flex-1 h-px bg-gradient-to-r from-gold-400/30 to-transparent max-w-[80px]" />
          </p>
          <h2
            id="axis-composition-heading"
            className="text-[clamp(1.8rem,4vw,3rem)] font-bold leading-tight text-paper-50 mb-6"
          >
            4つの軸が
            <br />
            あなたの役割を定義する
          </h2>
        </RevealOnScroll>

        <RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] mt-16 border border-gold-400/15">
            {AXIS_DEFINITIONS.map((definition) => (
              <article
                key={definition.axis}
                className={styles.axisCard}
              >
                <p className="font-mono text-[0.6rem] text-paper-200 tracking-[0.2em] mb-4">
                  AXIS {definition.no}
                </p>

                <div className="flex items-center gap-4 mb-6">
                  <span className="text-[1.1rem] font-bold px-3 py-1 border border-gold-400 text-gold-300">
                    {definition.sides[0].label}
                  </span>
                  <span className="text-paper-300 tracking-tight">&harr;</span>
                  <span className="text-[1.1rem] font-bold px-3 py-1 border border-gold-400/30 text-paper-200">
                    {definition.sides[1].label}
                  </span>
                </div>

                <p className="text-[0.9rem] leading-relaxed text-paper-200">
                  {AXIS_DESCRIPTIONS[definition.axis] ?? definition.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {(AXIS_TAGS[definition.axis] ?? []).map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[0.6rem] px-2 py-0.5 border border-gold-400/20 text-paper-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
