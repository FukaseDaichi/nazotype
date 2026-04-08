import type { TypeData } from "@/lib/types";

import Link from "next/link";

import { TypeArtwork } from "@/components/type/type-artwork/type-artwork";

type AllTypesSectionProps = {
  allTypes: TypeData[];
};

export function AllTypesSection({ allTypes }: AllTypesSectionProps) {
  return (
    <section className="mb-16" aria-labelledby="all-types-heading">
      <div className="flex items-baseline gap-4 mb-4">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
          All Types
        </span>
        <h2
          id="all-types-heading"
          className="font-heading text-[clamp(1.6rem,3vw,2.4rem)] tracking-wider m-0"
        >
          全16タイプ
        </h2>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
        {allTypes.map((type) => (
          <Link
            key={type.typeCode}
            href={`/types/${type.typeCode}`}
            prefetch={false}
            className="group block rounded-xl border border-midnight-600 bg-midnight-800 overflow-hidden no-underline hover:bg-midnight-700 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="aspect-square bg-gradient-to-br from-midnight-700 to-midnight-800 flex items-center justify-center relative overflow-hidden">
              <TypeArtwork
                typeCode={type.typeCode}
                typeName={type.typeName}
                palette={type.visualProfile.colorPalette}
              />
            </div>
            <div className="p-3">
              <p className="font-mono text-[0.7rem] text-amber-400 m-0 tracking-wider">
                {type.typeCode}
              </p>
              <p className="text-sm font-bold mt-0.5 m-0 text-[--color-text] group-hover:text-amber-400 transition-colors duration-200">
                {type.typeName}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
