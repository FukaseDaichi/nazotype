import type { ReactNode } from "react";

import styles from "./type-section-frame.module.css";

export type TypeSectionHeading = {
  eyebrow: string;
  title: string;
  headingId: string;
};

type TypeSectionFrameProps = {
  heading: TypeSectionHeading;
  children: ReactNode;
  className?: string;
  headerAlign?: "start" | "center";
  accent?: "gold" | "clue" | "rust" | "paper";
  index?: string;
};

const ACCENT_CLASS: Record<NonNullable<TypeSectionFrameProps["accent"]>, string> = {
  gold: styles.accentGold,
  clue: styles.accentClue,
  rust: styles.accentRust,
  paper: styles.accentPaper,
};

export function TypeSectionFrame({
  heading,
  children,
  className,
  headerAlign = "start",
  accent = "gold",
  index,
}: TypeSectionFrameProps) {
  const sectionClassName = [
    styles.section,
    ACCENT_CLASS[accent],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClassName} aria-labelledby={heading.headingId}>
      <div className={styles.cornerTl} aria-hidden="true" />
      <div className={styles.cornerTr} aria-hidden="true" />
      <div className={styles.cornerBl} aria-hidden="true" />
      <div className={styles.cornerBr} aria-hidden="true" />

      <header
        className={`${styles.header} ${
          headerAlign === "center" ? styles.headerCenter : ""
        }`}
      >
        {index ? (
          <span className={styles.index} aria-hidden="true">
            {index}
          </span>
        ) : null}
        <div className={styles.headingText}>
          <span className={styles.eyebrow}>{heading.eyebrow}</span>
          <h2 id={heading.headingId} className={styles.title}>
            {heading.title}
          </h2>
        </div>
      </header>

      <div className={styles.body}>{children}</div>
    </section>
  );
}
