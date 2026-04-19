import type { TypeData } from "@/lib/types";

import Image from "next/image";
import Link from "next/link";

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
            <Link
              key={compatibleType.typeCode}
              href={`/types/${compatibleType.typeCode}`}
              prefetch={false}
              className={styles.card}
            >
              <div className={styles.cardBg} aria-hidden="true" />
              <div className={styles.chibiWrap}>
                <div className={styles.chibiHalo} aria-hidden="true" />
                <Image
                  src={`/types/${compatibleType.typeCode}_chibi.png`}
                  alt=""
                  width={160}
                  height={160}
                  className={styles.chibi}
                />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.cardCode}>
                  {compatibleType.typeCode}
                </span>
                <span className={styles.cardName}>
                  {compatibleType.typeName}
                </span>
                <span className={styles.cardArrow} aria-hidden="true">
                  詳細へ →
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      {compatibility.goodWithDescription ? (
        <p className={styles.description}>{compatibility.goodWithDescription}</p>
      ) : null}
    </TypeSectionFrame>
  );
}
