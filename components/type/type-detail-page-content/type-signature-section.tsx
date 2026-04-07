import type { CSSProperties } from "react";

import type { AxisSummary, TypeData } from "@/lib/types";

import { type TypeSectionHeading } from "@/components/type/type-detail-page-content/type-section-frame";

import styles from "./type-signature-section.module.css";

const AXIS_LETTER_MAP: Record<string, { letter: string; english: string }> = {
  発言型: { letter: "T", english: "Talk" },
  観察型: { letter: "O", english: "Observe" },
  事実重視: { letter: "F", english: "Fact" },
  推理重視: { letter: "R", english: "Reasoning" },
  論理派: { letter: "L", english: "Logic" },
  感情派: { letter: "E", english: "Emotion" },
  計画型: { letter: "P", english: "Plan" },
  即興型: { letter: "I", english: "Improvise" },
};

const AXIS_TONE_MAP = [
  {
    accent: "rgba(231, 137, 37, 0.3)",
    soft: "rgba(216, 95, 103, 0.1)",
    glow: "rgba(216, 95, 103, 0.1)",
  },
  {
    accent: "rgba(231, 137, 37, 0.3)",
    soft: "rgba(226, 161, 47, 0.1)",
    glow: "rgba(226, 161, 47, 0.1)",
  },
  {
    accent: "rgba(231, 137, 37, 0.3)",
    soft: "rgba(67, 161, 166, 0.1)",
    glow: "rgba(67, 161, 166, 0.1)",
  },
  {
    accent: "rgba(231, 137, 37, 0.3)",
    soft: "rgba(79, 134, 218, 0.1)",
    glow: "rgba(79, 134, 218, 0.1)",
  },
] as const;

const DEFAULT_SIGNATURE_PERCENT = 65;

/* ── Radar geometry ── */

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/* ── Component ── */

type TypeSignatureSectionProps = {
  heading: TypeSectionHeading;
  typeData: TypeData;
  axisSummaries?: AxisSummary[];
};

export function TypeSignatureSection({
  heading,
  typeData,
  axisSummaries,
}: TypeSignatureSectionProps) {
  const rawAxes = [
    {
      dominant: typeData.axis.axis1,
      other: typeData.axis.axis1 === "発言型" ? "観察型" : "発言型",
    },
    {
      dominant: typeData.axis.axis2,
      other: typeData.axis.axis2 === "事実重視" ? "推理重視" : "事実重視",
    },
    {
      dominant: typeData.axis.axis3,
      other: typeData.axis.axis3 === "論理派" ? "感情派" : "論理派",
    },
    {
      dominant: typeData.axis.axis4,
      other: typeData.axis.axis4 === "計画型" ? "即興型" : "計画型",
    },
  ];

  const summaryMap = axisSummaries?.length
    ? (Object.fromEntries(axisSummaries.map((s, i) => [i, s])) as Record<
        number,
        AxisSummary
      >)
    : null;

  const axisDetails = rawAxes.map((axis, index) => {
    const dominantMeta = AXIS_LETTER_MAP[axis.dominant] ?? {
      letter: axis.dominant.charAt(0),
      english: axis.dominant,
    };
    const otherMeta = AXIS_LETTER_MAP[axis.other] ?? {
      letter: axis.other.charAt(0),
      english: axis.other,
    };

    if (!summaryMap) {
      return {
        ...axis,
        dominantMeta,
        otherMeta,
        percent: DEFAULT_SIGNATURE_PERCENT,
        trackPercent: DEFAULT_SIGNATURE_PERCENT,
        tone: AXIS_TONE_MAP[index],
      };
    }

    const s = summaryMap[index];
    const percent = !s
      ? DEFAULT_SIGNATURE_PERCENT
      : s.positiveLabel === axis.dominant
        ? s.positivePercent
        : s.negativePercent;

    return {
      ...axis,
      dominantMeta,
      otherMeta,
      percent,
      trackPercent: clamp(percent, 6, 94),
      tone: AXIS_TONE_MAP[index],
    };
  });

  const hasData = Boolean(axisSummaries?.length);

  const signatureFormula = axisDetails
    .map((axis) => axis.dominantMeta.english)
    .join(" + ");
  const boardStyle = {
    ["--signature-ogp-url" as string]: `url("/types/${typeData.typeCode}-ogp.png")`,
  } as CSSProperties;

  return (
    <div
      className={styles.signatureShowcase}
      aria-label={heading.title}
      role="region"
    >
      <div className={styles.signatureBoard} style={boardStyle}>
        <div className={styles.signatureBoardPlate}>
          <p className={styles.signatureBoardMark}>MADAMIS TYPE</p>
          <p className={styles.signatureBoardCode}>{typeData.typeCode}</p>
          <p className={styles.signatureBoardName}>{typeData.typeName}</p>
        </div>

        <div className={styles.signatureBoardMetrics}>
          {axisDetails.map((axis) => (
            <div
              key={`${axis.dominant}-metric`}
              className={styles.signatureBoardMetric}
              style={
                {
                  ["--signature-axis-accent" as string]: axis.tone.accent,
                  ["--signature-axis-accent-soft" as string]: axis.tone.soft,
                  ["--signature-axis-accent-glow" as string]: axis.tone.glow,
                } as CSSProperties
              }
            >
              <div className={styles.signatureBoardMetricHead}>
                <div>
                  <span className={styles.signatureBoardMetricLetter}>
                    {axis.dominantMeta.letter}
                  </span>
                  <span className={styles.signatureBoardDomain}>
                    {axis.dominant}
                  </span>
                </div>

                {hasData ? (
                  <span className={styles.signatureBoardMetricValue}>
                    {axis.percent}%
                  </span>
                ) : null}
              </div>
              <div
                className={styles.signatureBoardMetricTrack}
                aria-hidden="true"
              >
                <span
                  className={styles.signatureBoardMetricFill}
                  style={{ width: `${axis.trackPercent}%` }}
                />
              </div>
              <span className={styles.signatureBoardMetricPair}>
                {axis.dominant} vs {axis.other}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.signatureBoardCaption}>
          <p className={styles.signatureBoardFormula}>{signatureFormula}</p>
          <p className={styles.signatureBoardCase}>
            CASE FILE #{typeData.typeCode}
          </p>
          <p className={styles.signatureBoardCaptionName}>
            {typeData.typeName}
          </p>
        </div>
      </div>
    </div>
  );
}
