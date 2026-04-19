import {
  TypeSectionFrame,
  type TypeSectionHeading,
} from "@/components/type/type-detail-page-content/type-section-frame";

import styles from "./type-list-section.module.css";

type TypeListSectionProps = {
  heading: TypeSectionHeading;
  items: string[];
  accent?: "gold" | "clue" | "rust" | "paper";
  index?: string;
  marker?: "dash" | "check" | "warn" | "dot";
};

const MARKER_CHAR: Record<NonNullable<TypeListSectionProps["marker"]>, string> = {
  dash: "─",
  check: "✓",
  warn: "!",
  dot: "●",
};

export function TypeListSection({
  heading,
  items,
  accent = "gold",
  index,
  marker = "dash",
}: TypeListSectionProps) {
  const markerChar = MARKER_CHAR[marker];

  return (
    <TypeSectionFrame heading={heading} accent={accent} index={index}>
      <ul className={styles.list}>
        {items.map((item, i) => (
          <li key={item} className={styles.item}>
            <span className={styles.marker} aria-hidden="true">
              {markerChar}
            </span>
            <span className={styles.itemIndex} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={styles.text}>{item}</span>
          </li>
        ))}
      </ul>
    </TypeSectionFrame>
  );
}
