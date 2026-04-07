import { AXIS_DEFINITIONS } from "@/lib/axis";

import styles from "./axis-composition-section.module.css";

export function AxisCompositionSection() {
  return (
    <section
      id="axes"
      className={styles.section}
      aria-labelledby="axis-composition-heading"
    >
      <div className={styles.header}>
        <span className={styles.eyebrow}>Axis Signature</span>
        <h2 id="axis-composition-heading" className={styles.title}>
          16タイプを決める4つの軸
        </h2>
        <p className={styles.copy}>
          まずは各軸が何を見ているのかを読むと、タイプ名の意味がつかみやすくなります。
        </p>
      </div>

      <div className={styles.grid}>
        {AXIS_DEFINITIONS.map((definition) => (
          <article key={definition.axis} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardAxis}>Axis {definition.no}</span>
              <h3 className={styles.cardTitle}>{definition.label}</h3>
              <p className={styles.axisCopy}>{definition.description}</p>
            </div>

            <div className={styles.side}>
              <div className={styles.letterRow}>
                <div className="w-1/3">
                  <span
                    className={`${styles.bigLetter} ${styles.bigLetterPrimary}`}
                  >
                    {definition.sides[0].code}
                  </span>
                  <span
                    className={`${styles.wordRest} ${styles.wordRestPrimary}`}
                  >
                    {definition.sides[0].word.slice(1)}
                  </span>
                </div>
                <p className={`${styles.jpLabel}`}>
                  {definition.sides[0].label}
                </p>
              </div>
              <p className={styles.sideCopy}>
                {definition.sides[0].shortDescription}
              </p>
            </div>

            <div className={styles.vsRow} aria-hidden="true">
              <span className={styles.vsLine} />
              <span className={styles.vsText}>VS</span>
              <span className={styles.vsLine} />
            </div>

            <div className={styles.side}>
              <div className={styles.letterRow}>
                <div className="w-1/3">
                  <span
                    className={`${styles.bigLetter} ${styles.bigLetterPrimary}`}
                  >
                    {definition.sides[1].code}
                  </span>
                  <span
                    className={`${styles.wordRest} ${styles.wordRestPrimary}`}
                  >
                    {definition.sides[1].word.slice(1)}
                  </span>
                </div>
                <p className={`${styles.jpLabel} `}>
                  {definition.sides[1].label}
                </p>
              </div>
              <p className={styles.sideCopy}>
                {definition.sides[1].shortDescription}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
