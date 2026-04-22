import type { TypeData } from "@/lib/types";

import Image from "next/image";
import Link from "next/link";

import { TypeArtwork } from "@/components/type/type-artwork/type-artwork";
import { RECOMMENDATION_FEEDBACK_FORM_URL } from "@/lib/post-diagnosis-result";

import styles from "./type-detail-hero-section.module.css";

type TypeDetailHeroSectionProps = {
  mode: "public" | "shared";
  typeData: TypeData;
  shareKey?: string;
  publicUrl: string;
  sharedUserName?: string;
  hasChibi?: boolean;
  isPostDiagnosisResult?: boolean;
};

export function TypeDetailHeroSection({
  mode,
  typeData,
  shareKey,
  publicUrl,
  sharedUserName,
  hasChibi = false,
  isPostDiagnosisResult = false,
}: TypeDetailHeroSectionProps) {
  const isShared = mode === "shared";
  const shouldShowPostDiagnosisActions =
    isShared && isPostDiagnosisResult && Boolean(shareKey);
  const axisChips = [
    typeData.axis.axis1,
    typeData.axis.axis2,
    typeData.axis.axis3,
    typeData.axis.axis4,
  ];
  const furiganaChars = Array.from(typeData.furigana ?? "");
  const emphasisIndex = Math.min(
    Math.max(typeData.furiganaEmphasisIndex - 1, 0),
    Math.max(furiganaChars.length - 1, 0),
  );

  return (
    <>
      <header className={styles.mast}>
        <Link href="/" prefetch={false} className={styles.mastLogo}>
          謎解きタイプ診断
        </Link>
        <Link
          href={isShared ? publicUrl : "/"}
          prefetch={false}
          className={styles.mastBack}
        >
          &larr; {isShared ? "タイプ公開ページへ" : "トップへ戻る"}
        </Link>
      </header>

      <section className={styles.heroSection} aria-labelledby="result-heading">
        <div className={styles.auraWrap} aria-hidden="true">
          <span className={styles.aura1} />
          <span className={styles.aura2} />
          <span className={styles.grid} />
        </div>

        <div className={styles.container}>
          <div className={styles.meta}>
            <span className={styles.metaLabel}>
              {isShared ? "Shared Result" : "Public File"}
            </span>
            <span className={styles.metaDivider} aria-hidden="true" />
            <span className={styles.metaCode}>
              CASE FILE #{typeData.typeCode}
            </span>
          </div>

          <div className={styles.stage}>
            <div className={styles.artworkWrap}>
              <div className={styles.artworkFrame}>
                <div className={styles.cornerTl} aria-hidden="true" />
                <div className={styles.cornerTr} aria-hidden="true" />
                <div className={styles.cornerBl} aria-hidden="true" />
                <div className={styles.cornerBr} aria-hidden="true" />

                <TypeArtwork
                  typeCode={typeData.typeCode}
                  typeName={typeData.typeName}
                  palette={typeData.visualProfile.colorPalette}
                  priority
                  className={styles.artworkImage}
                />

                <div className={styles.artworkOverlay} aria-hidden="true" />

                <div className={styles.codeStamp} aria-hidden="true">
                  <span className={styles.codeStampLabel}>TYPE</span>
                  <span className={styles.codeStampValue}>
                    {typeData.typeCode}
                  </span>
                </div>
              </div>

              {hasChibi ? (
                <div className={styles.chibi} aria-hidden="true">
                  <div className={styles.chibiHalo} />
                  <Image
                    src={`/types/${typeData.typeCode}_chibi.png`}
                    alt=""
                    width={180}
                    height={180}
                    className={styles.chibiImage}
                  />
                </div>
              ) : null}
            </div>

            <div className={styles.info}>
              <p className={styles.kicker}>
                {isShared ? "SHARED DIAGNOSIS" : "TYPE DOSSIER"}
              </p>

              <h1 id="result-heading" className={styles.title}>
                <span className={styles.typeName}>
                  <span className={styles.typeNameFurigana} aria-hidden="true">
                    {furiganaChars.map((char, index) => (
                      <span
                        key={`${typeData.typeCode}-furigana-${index}`}
                        className={
                          index === emphasisIndex
                            ? `${styles.typeNameFuriganaChar} ${styles.typeNameFuriganaCharAccent}`
                            : styles.typeNameFuriganaChar
                        }
                      >
                        {char}
                      </span>
                    ))}
                  </span>
                  <span className={styles.typeNameText}>
                    {typeData.typeName}
                  </span>
                </span>
              </h1>

              <div className={styles.axisChips} aria-label="軸の傾向">
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
                {shouldShowPostDiagnosisActions ? (
                  <>
                    <a href="#type-share-panel" className={styles.primaryCta}>
                      <span>共有する</span>
                      <span className={styles.ctaArrow} aria-hidden="true">
                        →
                      </span>
                    </a>
                    <a
                      href={RECOMMENDATION_FEEDBACK_FORM_URL}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.secondaryCta}
                    >
                      おすすめを教える
                    </a>
                  </>
                ) : (
                  <Link href="/" prefetch={false} className={styles.primaryCta}>
                    <span>自分でも診断する</span>
                    <span className={styles.ctaArrow} aria-hidden="true">
                      →
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
