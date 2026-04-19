import type { AxisSummary, TypeData } from "@/lib/types";

import styles from "./post-diagnosis-result-card.module.css";

type PostDiagnosisResultCardProps = {
  typeData: TypeData;
  axisSummaries: AxisSummary[];
  userName?: string;
};

export function PostDiagnosisResultCard({
  typeData,
  axisSummaries,
  userName,
}: PostDiagnosisResultCardProps) {
  const eyebrowSuffix = userName ? `${userName} さんの診断結果` : "あなたの診断結果";

  return (
    <section
      className={styles.card}
      aria-labelledby="diagnosis-result-heading"
    >
      <span className={styles.topLine} aria-hidden="true" />

      <p className={styles.eyebrow}>
        <span className={styles.eyebrowKey}>DIAGNOSIS RESULT</span>
        <span className={styles.eyebrowDash} aria-hidden="true">
          —
        </span>
        <span className={styles.eyebrowValue}>{eyebrowSuffix}</span>
      </p>

      <h2 id="diagnosis-result-heading" className={styles.srHeading}>
        {typeData.typeCode} {typeData.typeName}
      </h2>

      <div className={styles.axisGrid}>
        {axisSummaries.map((summary) => (
          <div key={summary.axis} className={styles.axis}>
            <div className={styles.axisLabels}>
              <span
                className={`${styles.axisLabel} ${
                  summary.resolvedCode === summary.positiveCode
                    ? styles.axisLabelActive
                    : ""
                }`}
              >
                {summary.positiveLabel}
              </span>
              <span
                className={`${styles.axisLabel} ${
                  summary.resolvedCode === summary.negativeCode
                    ? styles.axisLabelActive
                    : ""
                }`}
              >
                {summary.negativeLabel}
              </span>
            </div>
            <div className={styles.axisTrack}>
              <span
                className={styles.axisFill}
                style={{ width: `${summary.positivePercent}%` }}
                aria-hidden="true"
              />
              <span
                className={styles.axisMid}
                aria-hidden="true"
              />
            </div>
            <div className={styles.axisMeta}>
              <span className={styles.axisPercent}>
                {summary.positivePercent}%
              </span>
              <span className={styles.axisPercent}>
                {summary.negativePercent}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.resultBadge}>
        <span className={styles.resultCode}>{typeData.typeCode}</span>
        <span className={styles.resultDash} aria-hidden="true">
          —
        </span>
        <span className={styles.resultName}>{typeData.typeName}</span>
      </div>
    </section>
  );
}
