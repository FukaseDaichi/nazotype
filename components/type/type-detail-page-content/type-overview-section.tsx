import {
  TypeSectionFrame,
  type TypeSectionHeading,
} from "@/components/type/type-detail-page-content/type-section-frame";

import styles from "./type-overview-section.module.css";

type TypeOverviewSectionProps = {
  heading: TypeSectionHeading;
  content: string;
};

export function TypeOverviewSection({
  heading,
  content,
}: TypeOverviewSectionProps) {
  return (
    <TypeSectionFrame heading={heading}>
      <p className={styles.detailText}>{content}</p>
    </TypeSectionFrame>
  );
}
