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

const AXIS_COLORS = [
  { fill: "var(--color-coral-500)", glow: "rgba(230, 90, 74, 0.3)" },
  { fill: "var(--color-amber-400)", glow: "rgba(232, 168, 50, 0.3)" },
  { fill: "var(--color-cyan-400)", glow: "rgba(46, 196, 214, 0.3)" },
  { fill: "var(--color-midnight-500)", glow: "rgba(58, 85, 144, 0.3)" },
] as const;

const DEFAULT_SIGNATURE_PERCENT = 65;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

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
        color: AXIS_COLORS[index],
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
      color: AXIS_COLORS[index],
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
      <div className={styles.board} style={boardStyle}>
        <div className={styles.boardBg} aria-hidden="true" />

        <div className={styles.boardTop}>
          <div>
            <p
              className="font-mono text-[0.64rem] uppercase tracking-widest text-amber-400/70"
              style={{ fontFamily: "var(--nzt-font-mono), monospace" }}
            >
              NAZOTYPE
            </p>
            <p className={styles.boardCode}>{typeData.typeCode}</p>
            <p
              className="mt-1 text-base leading-snug text-amber-300/80"
              style={{ fontFamily: "var(--nzt-font-serif), serif" }}
            >
              {typeData.typeName}
            </p>
          </div>
        </div>

        <div className={styles.boardMetrics}>
          {axisDetails.map((axis) => (
            <div
              key={`${axis.dominant}-metric`}
              className="flex flex-col gap-1"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[clamp(1rem,2vw,1.4rem)] leading-none text-amber-400"
                    style={{
                      fontFamily: "var(--nzt-font-heading), sans-serif",
                    }}
                  >
                    {axis.dominantMeta.letter}
                  </span>
                  <span
                    className="text-sm leading-none"
                    style={{ fontFamily: "var(--nzt-font-serif), serif" }}
                  >
                    {axis.dominant}
                  </span>
                </div>
                {hasData ? (
                  <span
                    className="font-mono text-xs tracking-wider text-amber-300/80"
                    style={{ fontFamily: "var(--nzt-font-mono), monospace" }}
                  >
                    {axis.percent}%
                  </span>
                ) : null}
              </div>
              <div className={styles.metricTrack} aria-hidden="true">
                <span
                  className={styles.metricFill}
                  style={{
                    width: `${axis.trackPercent}%`,
                    background: axis.color.fill,
                    boxShadow: `0 0 12px ${axis.color.glow}`,
                  }}
                />
              </div>
              <span
                className="font-mono text-[0.6rem] tracking-wide opacity-50"
                style={{ fontFamily: "var(--nzt-font-mono), monospace" }}
              >
                {axis.dominant} vs {axis.other}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.boardCaption}>
          <p
            className="text-[clamp(1rem,2.6vw,1.5rem)] leading-tight text-amber-300/90"
            style={{ fontFamily: "var(--nzt-font-note), cursive" }}
          >
            {signatureFormula}
          </p>
          <p
            className="font-mono text-[0.62rem] uppercase tracking-widest opacity-50"
            style={{ fontFamily: "var(--nzt-font-mono), monospace" }}
          >
            CASE FILE #{typeData.typeCode}
          </p>
          <p
            className="text-sm leading-snug text-amber-300/80"
            style={{ fontFamily: "var(--nzt-font-serif), serif" }}
          >
            {typeData.typeName}
          </p>
        </div>
      </div>
    </div>
  );
}
