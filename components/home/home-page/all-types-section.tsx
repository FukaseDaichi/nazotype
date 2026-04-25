import type { TypeData } from "@/lib/types";

import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { TypeOgpLinkCard } from "@/components/type/type-ogp-link-card/type-ogp-link-card";

type AllTypesSectionProps = {
  allTypes: TypeData[];
};

export function AllTypesSection({ allTypes }: AllTypesSectionProps) {
  return (
    <section
      className="py-24"
      style={{ background: "rgba(0,0,0,0.3)" }}
      aria-labelledby="all-types-heading"
    >
      <div className="max-w-[1200px] mx-auto px-0">
        <RevealOnScroll className="px-8">
          <p className="font-mono text-[0.65rem] tracking-[0.35em] text-gold-400 uppercase mb-4 flex items-center gap-4">
            16 TYPES
            <span className="flex-1 h-px bg-gradient-to-r from-gold-400/30 to-transparent max-w-[80px]" />
          </p>
          <h2
            id="all-types-heading"
            className="text-[clamp(1.5rem,4.5vw,3rem)] font-bold leading-tight text-paper-50 mb-6"
          >
            16タイプ、
            <br />
            あなたはどれか
          </h2>
          <p className="text-[1.05rem] font-light leading-[1.9] text-paper-200 max-w-[600px]">
            4軸の組み合わせで生まれる16の謎解きタイプ。どのタイプも異なる強みを持ち、チームに欠かせない存在です。
          </p>
        </RevealOnScroll>

        <RevealOnScroll className="px-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mt-16">
            {allTypes.map((type) => (
              <TypeOgpLinkCard
                key={type.typeCode}
                typeCode={type.typeCode}
                typeName={type.typeName}
                badgeText="TYPE"
                variant="compact"
                sizes="(max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
              />
            ))}
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="px-8">
          <p className="text-center mt-8 font-mono text-[0.7rem] text-paper-200 tracking-[0.15em] opacity-80">
            診断後に、あなたのタイプが詳しく解き明かされます
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
