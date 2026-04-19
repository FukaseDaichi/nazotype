import type { CSSProperties } from "react";

import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

import styles from "./home-page.module.css";

type ResultPreviewAxis = {
  left: string;
  right: string;
  fill: number;
};

const RESULT_PREVIEW_AXES: ResultPreviewAxis[] = [
  { left: "行動型", right: "解読型", fill: 72 },
  { left: "局所型", right: "俯瞰型", fill: 38 },
  { left: "発信型", right: "統率型", fill: 65 },
  { left: "熟考型", right: "転換型", fill: 25 },
];

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getDominantAxisDisplay(axis: ResultPreviewAxis) {
  const leftScore = clampPercentage(axis.fill);
  const rightScore = 100 - leftScore;
  const isLeftDominant = leftScore >= rightScore;
  const dominantScore = isLeftDominant ? leftScore : rightScore;

  const fillStyle: CSSProperties = {
    width: `${dominantScore}%`,
    left: isLeftDominant ? 0 : "auto",
    right: isLeftDominant ? "auto" : 0,
  };

  return {
    dominantScore,
    fillStyle,
    isLeftDominant,
  };
}

export function ResultPreviewSection() {
  return (
    <RevealOnScroll>
      <div className="max-w-[680px] mx-auto mt-16 border border-gold-400/20 bg-mystery-800/80 backdrop-blur-[10px] p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

        <p className="font-mono text-[0.65rem] text-gold-400 tracking-[0.25em] mb-6">
          OUTPUT PREVIEW — 診断後の出力イメージ
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {RESULT_PREVIEW_AXES.map((axis) => {
            const { dominantScore, fillStyle, isLeftDominant } =
              getDominantAxisDisplay(axis);

            return (
              <div key={axis.left} className="flex flex-col gap-1.5">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 font-mono text-[0.65rem]">
                  <span
                    className={
                      isLeftDominant ? "text-gold-300" : "text-paper-200"
                    }
                  >
                    {axis.left}
                  </span>
                  <span className="text-[0.8rem] text-gold-300 tracking-[0.12em]">
                    {dominantScore}
                  </span>
                  <span
                    className={`text-right ${isLeftDominant ? "text-paper-200" : "text-gold-300"}`}
                  >
                    {axis.right}
                  </span>
                </div>

                <div
                  className="h-[3px] bg-gold-400/15 relative overflow-hidden rounded-sm"
                  aria-label={`${axis.left} ${axis.fill} / ${axis.right} ${100 - axis.fill}`}
                >
                  <div className={styles.resultAxisFill} style={fillStyle} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 inline-block px-6 py-2 border border-gold-400 text-xl font-bold text-gold-300 tracking-wider">
          ALHN — 鑑識マニア
        </div>
      </div>
    </RevealOnScroll>
  );
}
