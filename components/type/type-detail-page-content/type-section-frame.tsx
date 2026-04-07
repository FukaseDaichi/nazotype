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
};

export function TypeSectionFrame({
  heading,
  children,
  className,
  headerAlign = "start",
}: TypeSectionFrameProps) {
  const sectionClassName = [styles.section, className].filter(Boolean).join(" ");

  return (
    <section className={sectionClassName} aria-labelledby={heading.headingId}>
      {headerAlign === "center" ? (
        <div className={styles.sectionHeaderCentered}>
          <span className={styles.sectionEyebrow}>{heading.eyebrow}</span>
          <h2 id={heading.headingId} className={styles.sectionTitle}>
            {heading.title}
          </h2>
        </div>
      ) : (
        <>
          <span className={styles.sectionEyebrow}>{heading.eyebrow}</span>
          <h2 id={heading.headingId} className={styles.sectionTitle}>
            {heading.title}
          </h2>
        </>
      )}
      {children}
    </section>
  );
}
