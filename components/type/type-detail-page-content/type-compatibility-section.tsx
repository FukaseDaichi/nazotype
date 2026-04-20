import type { TypeData } from "@/lib/types";

import { TypeOgpLinkCard } from "@/components/type/type-ogp-link-card/type-ogp-link-card";
import {
  TypeSectionFrame,
  type TypeSectionHeading,
} from "@/components/type/type-detail-page-content/type-section-frame";

import styles from "./type-compatibility-section.module.css";

type CompatibleType = {
  typeCode: string;
  typeName: string;
};

type TypeCompatibilitySectionProps = {
  heading: TypeSectionHeading;
  compatibility: TypeData["compatibility"];
  compatibleTypes?: CompatibleType[];
  index?: string;
};

export function TypeCompatibilitySection({
  heading,
  compatibility,
  compatibleTypes,
  index,
}: TypeCompatibilitySectionProps) {
  const resolvedCompatibleTypes = compatibleTypes?.length
    ? compatibleTypes
    : (compatibility.goodWithTypeCodes ?? []).map((typeCode) => ({
        typeCode,
        typeName: typeCode,
      }));

  return (
    <TypeSectionFrame heading={heading} accent="clue" index={index}>
      <p className={styles.summary}>{compatibility.summary}</p>

      {resolvedCompatibleTypes.length ? (
        <div className={styles.grid}>
          {resolvedCompatibleTypes.map((compatibleType) => (
            <TypeOgpLinkCard
              key={compatibleType.typeCode}
              typeCode={compatibleType.typeCode}
              typeName={compatibleType.typeName}
              badgeText="相性◎"
              ctaText="このタイプを見る"
              variant="compact"
              className={styles.card}
            />
          ))}
        </div>
      ) : null}

      {compatibility.goodWithDescription ? (
        <p className={styles.description}>{compatibility.goodWithDescription}</p>
      ) : null}
    </TypeSectionFrame>
  );
}
