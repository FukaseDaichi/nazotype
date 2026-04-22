import type { CSSProperties } from "react";
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
  const resultTitle = userName
    ? `${userName}さんの診断結果`
    : "あなたの診断結果";
  const cardStyle = {
    ["--post-diagnosis-ogp-url" as string]: `url("${getTypeOgpImagePath(
      typeData.typeCode,
    )}")`,
  } satisfies CSSProperties;

  return (
    <section
      className={styles.card}
      style={cardStyle}
      aria-labelledby="diagnosis-result-heading"
    >
      <div className={styles.background} aria-hidden="true" />
      <div className={styles.backgroundOverlay} aria-hidden="true" />
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent"
        aria-hidden="true"
      />

      <div className={styles.panel}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>DIAGNOSIS RESULT</p>
          <h2
            id="diagnosis-result-heading"
            className={`${styles.resultTitle} text-balance`}
          >
            {resultTitle}
          </h2>
        </header>

        <div className={styles.content}>
          <div className={`hidden md:flex ${styles.typeBlock}`}>
            <p className={styles.typeLabel}>CASE FILE</p>
            <p className={styles.typeCode}>{typeData.typeCode}</p>
            <p className={`${styles.typeName} text-balance`}>
              {typeData.typeName}
            </p>
          </div>

          <div className={styles.axisPanel}>
            <p className={styles.axisPanelLabel}>4 AXES PROFILE</p>

            <div className={styles.axisList}>
              {axisSummaries.map((summary) => {
                const {
                  dominantScore,
                  fillStyle,
                  isPositiveDominant,
                  negativeScore,
                } = getDominantAxisDisplay(summary);

                return (
                  <div key={summary.axis} className={styles.axisItem}>
                    <div className={styles.axisMeta}>
                      <span
                        className={`${styles.axisLabel} ${
                          isPositiveDominant ? styles.axisLabelStrong : ""
                        }`}
                      >
                        {summary.positiveLabel}
                      </span>
                      <span className={styles.axisValue}>{dominantScore}</span>
                      <span
                        className={`${styles.axisLabel} ${styles.axisLabelRight} ${
                          isPositiveDominant ? "" : styles.axisLabelStrong
                        }`}
                      >
                        {summary.negativeLabel}
                      </span>
                    </div>

                    <div
                      className={styles.axisTrack}
                      aria-label={`${summary.positiveLabel} ${summary.positivePercent}% / ${summary.negativeLabel} ${negativeScore}%`}
                    >
                      <span
                        className={styles.axisFill}
                        style={fillStyle}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
