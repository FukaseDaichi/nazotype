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
    <section
      className={`${sectionClassName} rounded-xl border border-midnight-600 bg-midnight-800 p-5 shadow-sm`}
      aria-labelledby={heading.headingId}
    >
      {headerAlign === "center" ? (
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
            {heading.eyebrow}
          </span>
          <h2
            id={heading.headingId}
            className="text-xl font-bold leading-tight"
            style={{ fontFamily: "var(--nzt-font-heading), sans-serif" }}
          >
            {heading.title}
          </h2>
        </div>
      ) : (
        <div className="space-y-1">
          <span className="block font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
            {heading.eyebrow}
          </span>
          <h2
            id={heading.headingId}
            className="text-xl font-bold leading-tight"
            style={{ fontFamily: "var(--nzt-font-heading), sans-serif" }}
          >
            {heading.title}
          </h2>
        </div>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}
