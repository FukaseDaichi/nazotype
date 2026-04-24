import type { TypeData } from "@/lib/types";

import Image from "next/image";
import Link from "next/link";

import { SecretHeroPrimaryAction } from "@/components/secret/secret-hero-primary-action";

import styles from "./secret-hero-section.module.css";

type SecretHeroSectionProps = {
  typeData: TypeData;
  ogpImageSrc: string;
  publicUrl: string;
};

export function SecretHeroSection({
  typeData,
  ogpImageSrc,
}: SecretHeroSectionProps) {
  const axisChips = [
    typeData.axis.axis1,
    typeData.axis.axis2,
    typeData.axis.axis3,
    typeData.axis.axis4,
  ];
  const furiganaChars = Array.from(typeData.furigana ?? "");

  return (
    <>
      <header className={styles.mast}>
        <Link href="/" prefetch={false} className={styles.mastLogo}>
          謎解きタイプ診断
        </Link>
        <Link href="/" prefetch={false} className={styles.mastBack}>
          &larr; トップへ戻る
        </Link>
      </header>

      <section className={styles.hero} aria-labelledby="secret-result-heading">
        <div className={styles.auraWrap} aria-hidden="true">
          <span className={styles.aura1} />
          <span className={styles.aura2} />
          <span className={styles.aura3} />
        </div>
        <div className={styles.grid} aria-hidden="true" />

        <div className={styles.container}>
          <div className={styles.banner}>
            <span className={styles.bannerLine} aria-hidden="true" />
            <span className={styles.bannerDot} aria-hidden="true" />
            <span>Classified &middot; Unsealed</span>
            <span className={styles.bannerDot} aria-hidden="true" />
            <span className={styles.bannerLine} aria-hidden="true" />
          </div>

          <div className={styles.stage}>
            <div className={styles.visual}>
              <div className={styles.cornerTl} aria-hidden="true" />
              <div className={styles.cornerTr} aria-hidden="true" />
              <div className={styles.cornerBl} aria-hidden="true" />
              <div className={styles.cornerBr} aria-hidden="true" />

              <Image
                src={ogpImageSrc}
                alt={`${typeData.typeName}のキーアート`}
                fill
                priority
                sizes="(max-width: 960px) 100vw, 640px"
                className={styles.visualImage}
              />

              <div className={styles.scanlines} aria-hidden="true" />
              <div className={styles.visualShine} aria-hidden="true" />
              <div className={styles.visualVignette} aria-hidden="true" />

              <div
                className={`${styles.stamp} hidden sm:flex`}
                aria-hidden="true"
              >
                <span className={styles.stampLabel}>SEAL</span>
                <span className={styles.stampValue}>BROKEN</span>
              </div>

              <div
                className={`${styles.caseStamp} hidden sm:flex`}
                aria-hidden="true"
              >
                <span className={styles.caseStampLabel}>CASE FILE</span>
                <span className={styles.caseStampValue}>
                  #{typeData.typeCode}
                </span>
              </div>
            </div>

            <div className={styles.info}>
              <p className={styles.kicker}>
                <span className={styles.kickerKey} aria-hidden="true" />
                Secret Dossier · 隠し結果
              </p>

              <h1 id="secret-result-heading" className={styles.title}>
                {furiganaChars.length ? (
                  <span className={styles.titleFurigana} aria-hidden="true">
                    {furiganaChars.map((char, index) => (
                      <span key={`${typeData.typeCode}-furi-${index}`}>
                        {char}
                      </span>
                    ))}
                  </span>
                ) : null}
                <span className={styles.titleText}>{typeData.typeName}</span>
                <span className={styles.titleEn}>{typeData.typeCode}</span>
              </h1>

              <div className={styles.axisRow} aria-label="軸の傾向">
                {axisChips.map((axis) => (
                  <span key={axis} className={styles.axisChip}>
                    {axis}
                  </span>
                ))}
              </div>

              <blockquote className={styles.tagline}>
                <span className={styles.quoteMark} aria-hidden="true">
                  &laquo;
                </span>
                <span>{typeData.tagline}</span>
                <span className={styles.quoteMark} aria-hidden="true">
                  &raquo;
                </span>
              </blockquote>

              <p className={styles.summary}>{typeData.summary}</p>

              <div className={styles.actions}>
                <SecretHeroPrimaryAction />
                <a href="#secret-dossier" className={styles.secondaryCta}>
                  全文を読む
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
