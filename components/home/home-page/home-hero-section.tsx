import type { QuestionMaster, TypeData } from "@/lib/types";

import Link from "next/link";

import { StartDiagnosisForm } from "@/components/diagnosis/start-diagnosis-form/start-diagnosis-form";
import { TypeArtwork } from "@/components/type/type-artwork/type-artwork";
import { SITE_NAME } from "@/lib/site";

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
      {/* Minimal masthead */}
      <header className="flex items-baseline justify-between gap-4 py-5 border-b border-midnight-600 mb-10">
        <div>
          <div className="font-heading text-[clamp(1.4rem,3vw,2rem)] tracking-wider text-amber-400">
            {SITE_NAME}
          </div>
          <div className="font-mono text-[0.65rem] text-[--color-text-muted] tracking-[0.2em] uppercase">
            Puzzle-Solving Role Diagnosis
          </div>
        </div>
        <nav aria-label="メインナビ">
          <ul className="flex gap-6 list-none m-0 p-0">
            <li>
              <Link
                href="#axes"
                className="font-mono text-xs tracking-widest text-[--color-text-muted] no-underline uppercase hover:text-amber-400 transition-colors duration-200"
              >
                Axes
              </Link>
            </li>
            <li>
              <Link
                href="#types"
                className="font-mono text-xs tracking-widest text-[--color-text-muted] no-underline uppercase hover:text-amber-400 transition-colors duration-200"
              >
                Types
              </Link>
            </li>
            <li>
              <Link
                href="#all-types-heading"
                className="font-mono text-xs tracking-widest text-[--color-text-muted] no-underline uppercase hover:text-amber-400 transition-colors duration-200"
              >
                All 16
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero section */}
      <section className="relative py-8 md:py-16 mb-12" aria-labelledby="hero-heading">
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-12 items-center">
          {/* Left: Text + CTA */}
          <div className="text-center md:text-left">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
              16-Type Puzzle-Solver Profile
            </p>
            <h1
              id="hero-heading"
              className="font-heading text-[clamp(2rem,6vw,3.5rem)] leading-tight mt-3"
            >
              あなたの
              <br />
              謎解きスタイルは？
            </h1>
            <p className="text-sm text-[--color-text-muted] mt-3 max-w-md mx-auto md:mx-0">
              32の質問であなたの強み・役割を16タイプで診断。
              リアル脱出ゲームや謎解きイベントでの行動・視野・共有・判断のクセを
              4軸で見立てます。
            </p>

            {/* Stats row */}
            <div className="flex gap-3 flex-wrap mt-6 justify-center md:justify-start">
              <div className="min-w-[5rem] rounded-lg border border-midnight-600 bg-midnight-800 px-3 py-2 text-center">
                <span className="block font-heading text-xl text-amber-400">
                  {questionMaster.meta.questionCount}
                </span>
                <span className="font-mono text-[0.65rem] text-[--color-text-muted] uppercase tracking-wider">
                  Questions
                </span>
              </div>
              <div className="min-w-[5rem] rounded-lg border border-midnight-600 bg-midnight-800 px-3 py-2 text-center">
                <span className="block font-heading text-xl text-amber-400">
                  {questionMaster.meta.pageCount}
                </span>
                <span className="font-mono text-[0.65rem] text-[--color-text-muted] uppercase tracking-wider">
                  Pages
                </span>
              </div>
              <div className="min-w-[5rem] rounded-lg border border-midnight-600 bg-midnight-800 px-3 py-2 text-center">
                <span className="block font-heading text-xl text-amber-400">
                  16
                </span>
                <span className="font-mono text-[0.65rem] text-[--color-text-muted] uppercase tracking-wider">
                  Types
                </span>
              </div>
              <div className="min-w-[5rem] rounded-lg border border-midnight-600 bg-midnight-800 px-3 py-2 text-center">
                <span className="block font-heading text-xl text-amber-400">
                  4
                </span>
                <span className="font-mono text-[0.65rem] text-[--color-text-muted] uppercase tracking-wider">
                  Axes
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8">
              <a
                href="#start"
                className="inline-flex items-center justify-center gap-2 min-h-[52px] rounded-lg px-8 py-3 bg-coral-500 text-white font-bold text-lg shadow-sm hover:bg-coral-600 hover:-translate-y-0.5 hover:shadow-md transition-all duration-150"
              >
                診断スタート
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
              </a>
            </div>
            <p className="font-mono text-xs text-[--color-text-muted] mt-4 tracking-wide">
              {questionMaster.meta.questionCount}問 ・ {questionMaster.meta.pageCount}ページ ・ 約5分
            </p>
          </div>

          {/* Right: Featured type card */}
          <div className="flex justify-center md:justify-end">
            <Link
              href={`/types/${heroType.typeCode}`}
              prefetch={false}
              className="block max-w-[280px] w-full rounded-xl border border-midnight-600 bg-midnight-800 overflow-hidden shadow-md hover:bg-midnight-700 hover:-translate-y-1 transition-all duration-200 no-underline"
            >
              <div className="aspect-square bg-gradient-to-br from-midnight-700 to-midnight-800 flex items-center justify-center relative overflow-hidden">
                <TypeArtwork
                  typeCode={heroType.typeCode}
                  typeName={heroType.typeName}
                  palette={heroType.visualProfile.colorPalette}
                  priority
                />
              </div>
              <div className="p-4">
                <p className="font-mono text-xs text-amber-400 m-0">
                  {heroType.typeCode}
                </p>
                <p className="font-bold mt-1 m-0 text-[--color-text]">
                  {heroType.typeName}
                </p>
                <p className="font-note text-sm text-amber-400/80 mt-1 m-0">
                  「{heroType.tagline}」
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Start form zone */}
        <div
          id="start"
          className="mt-12 rounded-xl border border-midnight-600 bg-midnight-800 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6"
        >
          <div className="shrink-0">
            <p className="font-heading text-xl tracking-wider text-[--color-text] m-0">
              Start Diagnosis
            </p>
            <p className="font-mono text-[0.7rem] text-[--color-text-muted] tracking-widest mt-1 m-0">
              診断スタート / 所要時間 約5分
            </p>
          </div>
          <div className="flex-1 min-w-[260px] w-full">
            <StartDiagnosisForm />
          </div>
        </div>
      </section>
    </>
  );
}
