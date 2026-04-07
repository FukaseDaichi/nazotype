import type { TypeData } from "@/lib/types";

import Link from "next/link";

import { TypeArtwork } from "@/components/type/type-artwork/type-artwork";

import styles from "./home-page.module.css";

type FeaturedTypesSectionProps = {
  spotlightTypes: TypeData[];
};

export function FeaturedTypesSection({
  spotlightTypes,
}: FeaturedTypesSectionProps) {
  return (
    <section id="types" aria-labelledby="featured-heading">
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>Featured</span>
        <h2 id="featured-heading" className={styles.sectionTitle}>
          人気になりやすい4タイプ
        </h2>
      </div>
      <p className={styles.sectionCopy}>
        16タイプすべてに固有の名称とキャッチコピーがあります。まずは代表的な4タイプから世界観をご覧ください。
      </p>

      <div className={styles.featuredGrid}>
        {spotlightTypes.map((type) => (
          <Link
            key={type.typeCode}
            href={`/types/${type.typeCode}`}
            prefetch={false}
            className={styles.typeCard}
          >
            <div
              className={styles.typeCardVisual}
              data-code={type.typeCode}
              aria-hidden="true"
            >
              <TypeArtwork
                typeCode={type.typeCode}
                typeName={type.typeName}
                palette={type.visualProfile.colorPalette}
                className={styles.typeArtwork}
              />
            </div>

            <div className={styles.typeCardBody}>
              <p className={styles.typeCardCode}>{type.typeCode}</p>
              <h3 className={styles.typeCardName}>{type.typeName}</h3>
              <p className={styles.typeCardTagline}>{type.tagline}</p>
              <p className={styles.typeCardArrow}>
                <span>Open file</span>
                <span>→</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
