import type { CSSProperties } from "react";

import previewStyles from "@/components/home/home-page/home-page.module.css";
import { getTypeOgpImagePath } from "@/lib/site";
import type { AxisSummary, TypeData } from "@/lib/types";

import styles from "./post-diagnosis-result-card.module.css";

type PostDiagnosisResultCardProps = {
  typeData: TypeData;
  axisSummaries: AxisSummary[];
  userName?: string;
};

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getDominantAxisDisplay(summary: AxisSummary) {
  const positiveScore = clampPercentage(summary.positivePercent);
  const negativeScore = 100 - positiveScore;
  const isPositiveDominant =
    positiveScore === negativeScore
      ? summary.resolvedCode === summary.positiveCode
      : positiveScore > negativeScore;
  const dominantScore = isPositiveDominant ? positiveScore : negativeScore;

  const fillStyle: CSSProperties = {
    width: `${dominantScore}%`,
    left: isPositiveDominant ? 0 : "auto",
    right: isPositiveDominant ? "auto" : 0,
  };

  return {
    dominantScore,
    fillStyle,
    isPositiveDominant,
    negativeScore,
  };
}

export function PostDiagnosisResultCard({
  typeData,
  axisSummaries,
  userName,
}: PostDiagnosisResultCardProps) {
  const eyebrowSuffix = userName ? `${userName} さんの診断結果` : "あなたの診断結果";
  const cardStyle = {
    ["--post-diagnosis-ogp-url" as string]: `url("${getTypeOgpImagePath(
      typeData.typeCode,
    )}")`,
  } satisfies CSSProperties;

  return (
    <section
      className={`${styles.card} max-w-[680px] mx-auto border border-gold-400/20 bg-mystery-800/80 backdrop-blur-[10px] p-10 relative overflow-hidden`}
      style={cardStyle}
      aria-labelledby="diagnosis-result-heading"
    >
      <div className={styles.background} aria-hidden="true" />
      <div className={styles.backgroundOverlay} aria-hidden="true" />
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <p className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[0.65rem] text-gold-400 tracking-[0.25em]">
          <span>DIAGNOSIS RESULT</span>
          <span className="text-gold-400/50" aria-hidden="true">
            —
          </span>
          <span className="text-paper-200 tracking-[0.12em]">
            {eyebrowSuffix}
          </span>
        </p>

        <h2 id="diagnosis-result-heading" className={styles.srHeading}>
          {typeData.typeCode} {typeData.typeName}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {axisSummaries.map((summary) => {
            const {
              dominantScore,
              fillStyle,
              isPositiveDominant,
              negativeScore,
            } = getDominantAxisDisplay(summary);

            return (
              <div key={summary.axis} className="flex flex-col gap-1.5">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 font-mono text-[0.65rem]">
                  <span
                    className={
                      isPositiveDominant ? "text-gold-300" : "text-paper-200"
                    }
                  >
                    {summary.positiveLabel}
                  </span>
                  <span className="text-[0.8rem] tracking-[0.12em] text-gold-300">
                    {dominantScore}
                  </span>
                  <span
                    className={`text-right ${isPositiveDominant ? "text-paper-200" : "text-gold-300"}`}
                  >
                    {summary.negativeLabel}
                  </span>
                </div>

                <div
                  className="relative h-[3px] overflow-hidden rounded-sm bg-gold-400/15"
                  aria-label={`${summary.positiveLabel} ${summary.positivePercent}% / ${summary.negativeLabel} ${negativeScore}%`}
                >
                  <span
                    className={previewStyles.resultAxisFill}
                    style={fillStyle}
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 inline-block border border-gold-400 px-6 py-2 text-xl font-bold tracking-wider text-gold-300">
          <span>{typeData.typeCode}</span>
          <span className="px-2" aria-hidden="true">
            —
          </span>
          <span>{typeData.typeName}</span>
        </div>
      </div>
    </section>
  );
}
