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
        <div className="mx-auto max-w-[768px]">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-gold-400">
            {isShared ? "Shared Result" : "Public File"}
          </p>

          <p className="mt-1 font-mono text-xs tracking-wider text-paper-300">
            Case File #{typeData.typeCode}
          </p>

          <div className="mt-6 grid items-center gap-8 md:grid-cols-[40%_1fr]">
            <div className="mx-auto w-full max-w-[260px] md:mx-0">
              <div className="overflow-hidden shadow-md border border-gold-400/20">
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
                className="text-[clamp(2rem,6vw,3.5rem)] leading-[0.95] tracking-wide text-paper-50 font-bold"
              >
                {isShared && sharedUserName ? (
                  <>
                    <em className="not-italic text-gold-300">
                      {sharedUserName}
                    </em>
                    <br />
                    さんの診断結果
                  </>
                ) : (
                  heroHeading
                )}
              </h1>

              <p className="text-lg leading-relaxed text-gold-300">
                &laquo;{typeData.tagline}&raquo;
              </p>

              <p className="text-sm leading-relaxed text-paper-200">
                {typeData.summary}
              </p>

              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {shouldShowPostDiagnosisActions ? (
                  <>
                    <a
                      href="#type-share-panel"
                      className="inline-flex min-h-[52px] items-center justify-center bg-gradient-to-br from-gold-400 to-gold-500 px-8 py-3 font-bold text-mystery-800 transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                    >
                      共有
                    </a>
                    <a
                      href={RECOMMENDATION_FEEDBACK_FORM_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[52px] items-center justify-center border border-gold-400 px-8 py-3 font-bold text-gold-300 transition-all duration-150 hover:bg-gold-400/10 active:scale-[0.98]"
                    >
                      おすすめを教える
                    </a>
                  </>
                ) : isShared ? (
                  <Link
                    href="/"
                    prefetch={false}
                    className="inline-flex min-h-[52px] items-center justify-center bg-gradient-to-br from-gold-400 to-gold-500 px-8 py-3 font-bold text-mystery-800 transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                  >
                    自分でも診断する
                  </Link>
                ) : (
                  <Link
                    href="/"
                    prefetch={false}
                    className="inline-flex min-h-[52px] items-center justify-center bg-gradient-to-br from-gold-400 to-gold-500 px-8 py-3 font-bold text-mystery-800 transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                  >
                    自分でも診断する
                  </Link>
                )}
              </div>

              {shouldShowPostDiagnosisActions ? (
                <p className="text-xs leading-relaxed text-paper-300">
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
