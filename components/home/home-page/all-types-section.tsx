import type { TypeData } from "@/lib/types";

import Link from "next/link";

import styles from "./home-page.module.css";

type AllTypesSectionProps = {
  allTypes: TypeData[];
};

export function AllTypesSection({ allTypes }: AllTypesSectionProps) {
  return (
    <section className={styles.allTypes} aria-labelledby="all-types-heading">
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>Index</span>
        <h2 id="all-types-heading" className={styles.sectionTitle}>
          16タイプ一覧
        </h2>
      </div>

      <div className={styles.typeChipGrid}>
        {allTypes.map((type) => (
          <Link
            key={type.typeCode}
            href={`/types/${type.typeCode}`}
            prefetch={false}
            className={styles.typeChip}
          >
            <span className={styles.typeChipCode}>{type.typeCode}</span>
            <span className={styles.typeChipName}>{type.typeName}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
