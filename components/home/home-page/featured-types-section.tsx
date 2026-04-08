import type { TypeData } from "@/lib/types";

import Link from "next/link";

import { TypeArtwork } from "@/components/type/type-artwork/type-artwork";

type FeaturedTypesSectionProps = {
  spotlightTypes: TypeData[];
};

export function FeaturedTypesSection({
  spotlightTypes,
}: FeaturedTypesSectionProps) {
  return (
    <section id="types" className="mb-16" aria-labelledby="featured-heading">
      <div className="flex items-baseline gap-4 mb-4">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
          Featured
        </span>
        <h2
          id="featured-heading"
          className="font-heading text-[clamp(1.6rem,3vw,2.4rem)] tracking-wider m-0"
        >
          注目タイプ
        </h2>
      </div>
      <p className="text-sm text-[--color-text-muted] mb-6 max-w-2xl">
        16タイプすべてに固有の名称とキャッチコピーがあります。まずは代表的な4タイプから世界観をご覧ください。
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {spotlightTypes.map((type) => (
          <Link
            key={type.typeCode}
            href={`/types/${type.typeCode}`}
            prefetch={false}
            className="group block rounded-xl border border-midnight-600 bg-midnight-800 overflow-hidden no-underline hover:bg-midnight-700 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(232,168,50,0.1)] transition-all duration-200"
          >
            <div className="aspect-square bg-gradient-to-br from-midnight-700 to-midnight-800 flex items-center justify-center relative overflow-hidden">
              <TypeArtwork
                typeCode={type.typeCode}
                typeName={type.typeName}
                palette={type.visualProfile.colorPalette}
              />
            </div>

            <div className="p-4 flex flex-col gap-1">
              <p className="font-mono text-xs text-amber-400 m-0">
                {type.typeCode}
              </p>
              <h3 className="font-serif text-base font-bold m-0 text-[--color-text]">
                {type.typeName}
              </h3>
              <p className="font-note text-sm text-amber-400/60 m-0">
                {type.tagline}
              </p>
              <p className="flex items-center gap-1.5 mt-2 font-mono text-[0.65rem] text-[--color-text-muted] uppercase tracking-wider group-hover:text-amber-400 group-hover:gap-2.5 transition-all duration-200">
                <span>View profile</span>
                <span>→</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
