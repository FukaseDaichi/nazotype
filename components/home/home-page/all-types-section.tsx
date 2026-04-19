import type { TypeData } from "@/lib/types";

import Link from "next/link";

import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

type AllTypesSectionProps = {
  allTypes: TypeData[];
};

const TYPE_ICONS: Record<string, string> = {
  ALHN: "\uD83D\uDD0D",
  ALHC: "\u26A1",
  ALTN: "\uD83D\uDDDD",
  ALTC: "\uD83C\uDF0A",
  ABHN: "\uD83D\uDDFA",
  ABHC: "\uD83D\uDD25",
  ABTN: "\uD83E\uDDED",
  ABTC: "\uD83C\uDF2A",
  DLHN: "\uD83D\uDD2E",
  DLHC: "\u2728",
  DLTN: "\uD83C\uDFDB",
  DLTC: "\uD83C\uDFAF",
  DBHN: "\uD83D\uDCE1",
  DBHC: "\uD83D\uDCA1",
  DBTN: "\u2696",
  DBTC: "\uD83C\uDF10",
};

export function AllTypesSection({ allTypes }: AllTypesSectionProps) {
  return (
    <section
      className="py-24"
      style={{ background: "rgba(0,0,0,0.3)" }}
      aria-labelledby="all-types-heading"
    >
      <div className="max-w-[1200px] mx-auto px-8">
        <RevealOnScroll>
          <p className="font-mono text-[0.65rem] tracking-[0.35em] text-gold-400 uppercase mb-4 flex items-center gap-4">
            16 TYPES
            <span className="flex-1 h-px bg-gradient-to-r from-gold-400/30 to-transparent max-w-[80px]" />
          </p>
          <h2
            id="all-types-heading"
            className="text-[clamp(1.8rem,4vw,3rem)] font-bold leading-tight text-paper-50 mb-6"
          >
            16タイプ、
            <br />
            あなたはどれか
          </h2>
          <p className="text-[1.05rem] font-light leading-[1.9] text-paper-200 max-w-[600px]">
            4軸の組み合わせで生まれる16のキャラクター。どのタイプも異なる強みを持ち、チームに欠かせない存在です。
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-[2px] mt-16">
            {allTypes.map((type) => (
              <Link
                key={type.typeCode}
                href={`/types/${type.typeCode}`}
                prefetch={false}
                className="group aspect-square flex flex-col items-center justify-center text-center p-4 no-underline relative overflow-hidden border border-gold-400/15 bg-mystery-800/60 backdrop-blur-sm transition-all duration-200 hover:border-gold-400/40 hover:bg-gold-400/10"
              >
                <span className="absolute inset-0 bg-gradient-to-br from-gold-400/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <span className="font-mono text-[0.6rem] text-gold-400/70 tracking-[0.15em] mb-1 relative z-[1]">
                  {type.typeCode}
                </span>
                <span className="text-[1.6rem] mb-1 relative z-[1]">
                  {TYPE_ICONS[type.typeCode] ?? "\u2B50"}
                </span>
                <span className="text-[0.8rem] font-bold text-paper-100 leading-snug relative z-[1] group-hover:text-gold-300 transition-colors duration-200">
                  {type.typeName}
                </span>
              </Link>
            ))}
          </div>
        </RevealOnScroll>

        <RevealOnScroll>
          <p className="text-center mt-8 font-mono text-[0.7rem] text-paper-200 tracking-[0.15em] opacity-80">
            診断後に、あなたのタイプが詳しく解き明かされます
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
