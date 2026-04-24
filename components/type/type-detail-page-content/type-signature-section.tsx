import type { CSSProperties } from "react";

import { AXIS_DEFINITIONS, AXIS_LETTER_MAP } from "@/lib/axis";
import type { AxisSummary, TypeData } from "@/lib/types";

import { type TypeSectionHeading } from "@/components/type/type-detail-page-content/type-section-frame";

import styles from "./type-signature-section.module.css";

const AXIS_COLORS = [
  { fill: "var(--color-gold-400)", glow: "rgba(193, 155, 46, 0.3)" },
  { fill: "var(--color-gold-300)", glow: "rgba(232, 201, 106, 0.3)" },
  { fill: "var(--color-clue-400)", glow: "rgba(61, 104, 152, 0.3)" },
  { fill: "var(--color-paper-200)", glow: "rgba(201, 185, 154, 0.3)" },
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
  const summaryMap = axisSummaries?.length
    ? new Map(axisSummaries.map((summary) => [summary.axis, summary]))
    : null;

  const axisDetails = AXIS_DEFINITIONS.map((definition, index) => {
    const summary = summaryMap?.get(definition.axis);
    const [positiveSide, negativeSide] = definition.sides;
    const dominant = summary?.resolvedLabel ?? typeData.axis[definition.axisKey];
    const other =
      dominant === positiveSide.label ? negativeSide.label : positiveSide.label;
    const dominantMeta = AXIS_LETTER_MAP[dominant] ?? {
      letter: dominant.charAt(0),
      english: dominant,
    };
    const otherMeta = AXIS_LETTER_MAP[other] ?? {
      letter: other.charAt(0),
      english: other,
    };

    if (!summary) {
      return {
        dominant,
        other,
        dominantMeta,
        otherMeta,
        percent: DEFAULT_SIGNATURE_PERCENT,
        trackPercent: DEFAULT_SIGNATURE_PERCENT,
        color: AXIS_COLORS[index],
      };
    }

    const percent =
      summary.resolvedCode === summary.positiveCode
        ? summary.positivePercent
        : summary.negativePercent;

    return {
      dominant,
      other,
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
            <p className="font-mono text-[0.64rem] uppercase tracking-widest text-gold-400/70">
              NAZOTYPE
            </p>
            <p className={styles.boardCode}>{typeData.typeCode}</p>
            <p className="mt-1 text-base leading-snug text-gold-300/80">
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
                  <span className="text-[clamp(1rem,2vw,1.4rem)] leading-none text-gold-400 font-bold">
                    {axis.dominantMeta.letter}
                  </span>
                  <span className="text-sm leading-none">
                    {axis.dominant}
                  </span>
                </div>
                {hasData ? (
                  <span className="font-mono text-xs tracking-wider text-gold-300/80">
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
              <span className="font-mono text-[0.6rem] tracking-wide opacity-50">
                {axis.dominant} vs {axis.other}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.boardCaption}>
          <p className="text-[clamp(1rem,2.6vw,1.5rem)] leading-tight text-gold-300/90">
            {signatureFormula}
          </p>
          <p className="font-mono text-[0.62rem] uppercase tracking-widest opacity-50">
            CASE FILE #{typeData.typeCode}
          </p>
          <p className="text-sm leading-snug text-gold-300/80">
            {typeData.typeName}
          </p>
        </div>
      </div>
    </div>
  );
}
