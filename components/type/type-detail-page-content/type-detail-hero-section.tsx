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
  const heroHeading = isShared ? (
    <>
      共有された
      <br />
      タイプ結果
    </>
  ) : (
    <>
      {typeData.typeName}
      <br />
      タイプ詳細
    </>
  );

  return (
    <>
      <header className={styles.mast}>
        <Link
          href="/"
          prefetch={false}
          className={styles.mastLogo}
        >
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
        <div className="mx-auto max-w-[768px]">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
            {isShared ? "Shared Result" : "Public File"}
          </p>

          <p className="mt-1 font-mono text-xs tracking-wider text-[color:var(--color-text-on-light-muted)]">
            Case File #{typeData.typeCode}
          </p>

          <div className="mt-6 grid items-center gap-8 md:grid-cols-[40%_1fr]">
            <div className="mx-auto w-full max-w-[260px] md:mx-0">
              <div className="overflow-hidden rounded-xl shadow-md">
                <TypeArtwork
                  typeCode={typeData.typeCode}
                  typeName={typeData.typeName}
                  palette={typeData.visualProfile.colorPalette}
                  priority
                />
              </div>
              {hasChibi ? (
                <div className="mt-4 flex justify-center" aria-hidden="true">
                  <Image
                    src={`/types/${typeData.typeCode}_chibi.png`}
                    alt=""
                    width={100}
                    height={100}
                    className="h-24 w-24 object-contain"
                  />
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-4 text-center md:text-left">
              <h1
                id="result-heading"
                className="font-heading text-[clamp(2rem,6vw,3.5rem)] leading-[0.95] tracking-wide text-[color:var(--color-text-on-light)]"
                style={{ fontFamily: "var(--nzt-font-heading), sans-serif" }}
              >
                {isShared && sharedUserName ? (
                  <>
                    <em className="not-italic text-coral-500">
                      {sharedUserName}
                    </em>
                    <br />
                    さんの診断結果
                  </>
                ) : (
                  heroHeading
                )}
              </h1>

              <p
                className="text-lg leading-relaxed text-amber-500"
                style={{ fontFamily: "var(--nzt-font-note), cursive" }}
              >
                「{typeData.tagline}」
              </p>

              <p className="text-sm leading-relaxed text-[color:var(--color-text-on-light-muted)]">
                {typeData.summary}
              </p>

              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {shouldShowPostDiagnosisActions ? (
                  <>
                    <a
                      href="#type-share-panel"
                      className="inline-flex min-h-[52px] items-center justify-center rounded-lg bg-coral-500 px-8 py-3 font-bold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-coral-600 hover:shadow-md active:translate-y-0"
                    >
                      共有
                    </a>
                    <a
                      href={RECOMMENDATION_FEEDBACK_FORM_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[52px] items-center justify-center rounded-lg border border-cyan-400 px-8 py-3 font-bold text-cyan-500 transition-all duration-150 hover:-translate-y-0.5 hover:bg-cyan-400/10 active:translate-y-0"
                    >
                      おすすめを教える
                    </a>
                  </>
                ) : isShared ? (
                  <Link
                    href="/"
                    prefetch={false}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-lg bg-coral-500 px-8 py-3 font-bold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-coral-600 hover:shadow-md active:translate-y-0"
                  >
                    自分でも診断する
                  </Link>
                ) : (
                  <Link
                    href="/"
                    prefetch={false}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-lg bg-coral-500 px-8 py-3 font-bold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-coral-600 hover:shadow-md active:translate-y-0"
                  >
                    自分でも診断する
                  </Link>
                )}
              </div>

              {shouldShowPostDiagnosisActions ? (
                <p className="text-xs leading-relaxed text-[color:var(--color-text-on-light-muted)]">
                  タイプごとのおすすめ謎解きイベントを集計したいので、よければフォームで教えてください。
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
