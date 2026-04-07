import type { QuestionMaster, TypeData } from "@/lib/types";

import Link from "next/link";

import { StartDiagnosisForm } from "@/components/diagnosis/start-diagnosis-form/start-diagnosis-form";
import { TypeArtwork } from "@/components/type/type-artwork/type-artwork";
import { LINE_STAMP_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

import styles from "./home-page.module.css";

const FEATURE_SUMMARIES = [
  {
    number: "01",
    title: "憑依のさせ方を分析",
    copy: "あなた自身というより、プレイの仕方や考え方に着目",
  },
  {
    number: "02",
    title: "分析手法は統計心理学ベースのAI",
    copy: "質問内容や傾向もAIによる分析結果",
  },
  {
    number: "03",
    title: "結果ページと共有",
    copy: "強み・注意点・相性・向いている役回りまで一気に",
  },
] as const;

type HomeHeroSectionProps = {
  heroType: TypeData;
  questionMaster: QuestionMaster;
};

export function HomeHeroSection({
  heroType,
  questionMaster,
}: HomeHeroSectionProps) {
  return (
    <>
      <header className={styles.masthead}>
        <div>
          <div className={styles.mastheadLogo}>{SITE_NAME}</div>
          <div className={styles.mastheadSub}>
            Murder Mystery Personality Diagnosis
          </div>
        </div>
        <nav aria-label="メインナビ">
          <ul className={styles.mastheadNav}>
            <li>
              <Link href="#axes">Axes</Link>
            </li>
            <li>
              <Link href="#types">Types</Link>
            </li>
            <li>
              <Link href="#all-types-heading">All 16</Link>
            </li>
          </ul>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.caseEnvelope}>
          <span className={styles.stampConfidential}>Confidential</span>

          <p className={styles.fileMeta}>
            Case File #RCF-2025 / Murder Mystery Behavioral Analysis
          </p>

          <h1 id="hero-heading" className={styles.caseTitle}>
            <em>あなたの</em>
            <br />
            {SITE_TAGLINE}
          </h1>

          <p className={styles.handnote}>- 卓上での立ち回りを解析せよ</p>

          <p className={styles.caseBody}>
            32問の答えから、マーダーミステリー卓での発言・推理・感情・進め方のクセを
            4軸で見立てます。一般的な性格診断ではなく、卓上での立ち回りに特化した
            16タイプ診断です。自分のマダミスタイプを知ることで、卓の相性や
            おすすめマダミス選びのヒントも見つかります。
          </p>

          <div className={styles.statsRow}>
            <div className={styles.statBadge}>
              <strong>{questionMaster.meta.questionCount}</strong>
              Questions
            </div>
            <div className={styles.statBadge}>
              <strong>{questionMaster.meta.pageCount}</strong>
              Pages
            </div>
            <div className={styles.statBadge}>
              <strong>16</strong>
              Types
            </div>
            <div className={styles.statBadge}>
              <strong>4</strong>
              Axes
            </div>
          </div>

          <a href="#start" className={styles.ctaPrimary}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            診断を始める
          </a>

          <div className={styles.features}>
            {FEATURE_SUMMARIES.map((feature) => (
              <div key={feature.number} className={styles.featureItem}>
                <span className={styles.featureNum}>{feature.number}</span>
                <h2 className={styles.featureTitle}>{feature.title}</h2>
                <p className={styles.featureCopy}>{feature.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.photoCard}>
            <TypeArtwork
              typeCode={heroType.typeCode}
              typeName={heroType.typeName}
              palette={heroType.visualProfile.colorPalette}
              priority
              className={styles.heroArtwork}
            />

            <p className={styles.cardTypeCode}>
              Preview Type / {heroType.typeCode}
            </p>
            <p className={styles.cardTypeName}>{heroType.typeName}</p>
            <p className={styles.cardTagline}>{heroType.tagline}</p>
            <p className={styles.cardSummary}>{heroType.summary}</p>
            <Link
              href={`/types/${heroType.typeCode}`}
              prefetch={false}
              className={styles.cardLink}
            >
              ファイルを開く →
            </Link>
          </div>

          <div className={styles.lineCard}>
            <p className={styles.lineLabel}>Line Stickers</p>
            <p className={styles.lineTitle}>LINEスタンプ展開予定</p>
            {LINE_STAMP_URL ? (
              <a
                href={LINE_STAMP_URL}
                target="_blank"
                rel="noreferrer"
                className={styles.lineBtn}
              >
                LINEスタンプを見る
              </a>
            ) : (
              <span className={`${styles.lineBtn} ${styles.lineBtnDisabled}`}>
                準備中
              </span>
            )}
          </div>
        </aside>

        <div id="start" className={styles.formZone}>
          <div>
            <p className={styles.formLabel}>Start Diagnosis</p>
            <p className={styles.formSub}>診断スタート / 所要時間 約5分</p>
          </div>
          <div className={styles.formSlot}>
            <StartDiagnosisForm />
          </div>
        </div>
      </section>
    </>
  );
}
