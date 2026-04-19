import {
  TypeSectionFrame,
  type TypeSectionHeading,
} from "@/components/type/type-detail-page-content/type-section-frame";

import styles from "./type-overview-section.module.css";

type TypeOverviewSectionProps = {
  heading: TypeSectionHeading;
  content: string;
  index?: string;
};

export function TypeOverviewSection({
  heading,
  content,
  index,
}: TypeOverviewSectionProps) {
  return (
    <TypeSectionFrame heading={heading} accent="paper" index={index}>
      <div className={styles.overview}>
        <span className={styles.openQuote} aria-hidden="true">
          “
        </span>
        <p className={styles.body}>{content}</p>
      </div>
    </TypeSectionFrame>
  );
}
