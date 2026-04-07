import type { TypeData } from "@/lib/types";

import Image from "next/image";
import Link from "next/link";

import {
  TypeSectionFrame,
  type TypeSectionHeading,
} from "@/components/type/type-detail-page-content/type-section-frame";
import { getTypeOgpImagePath } from "@/lib/site";

import styles from "./type-compatibility-section.module.css";

type CompatibleType = {
  typeCode: string;
  typeName: string;
};

type TypeCompatibilitySectionProps = {
  heading: TypeSectionHeading;
  compatibility: TypeData["compatibility"];
  compatibleTypes?: CompatibleType[];
};

export function TypeCompatibilitySection({
  heading,
  compatibility,
  compatibleTypes,
}: TypeCompatibilitySectionProps) {
  const resolvedCompatibleTypes = compatibleTypes?.length
    ? compatibleTypes
    : (compatibility.goodWithTypeCodes ?? []).map((typeCode) => ({
        typeCode,
        typeName: typeCode,
      }));

  return (
    <TypeSectionFrame heading={heading}>
      <p className={styles.compatText}>{compatibility.summary}</p>
      {resolvedCompatibleTypes.length ? (
        <div className={styles.compatLinks}>
          {resolvedCompatibleTypes.map((compatibleType) => {
            const ogpImagePath = getTypeOgpImagePath(compatibleType.typeCode);

            return (
              <Link
                key={compatibleType.typeCode}
                href={`/types/${compatibleType.typeCode}`}
                prefetch={false}
                className={styles.compatLink}
              >
                <Image
                  src={ogpImagePath}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 960px) 50vw, 280px"
                  className={styles.compatLinkImage}
                />
                <span className={styles.compatLinkBody}>
                  <span className={styles.compatLinkName}>
                    {compatibleType.typeName}
                  </span>
                  <span className={styles.compatLinkMeta}>
                    <span className={styles.compatLinkCode}>
                      {compatibleType.typeCode}
                    </span>
                    <span className={styles.compatLinkHint}>Type Detail</span>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}
      {compatibility.goodWithDescription ? (
        <p className={styles.compatText}>{compatibility.goodWithDescription}</p>
      ) : null}
    </TypeSectionFrame>
  );
}
