import type { TypeData } from "@/lib/types";

import Image from "next/image";
import Link from "next/link";

import {
  TypeSectionFrame,
  type TypeSectionHeading,
} from "@/components/type/type-detail-page-content/type-section-frame";
import { getTypeOgpImagePath } from "@/lib/site";

type CompatibleType = {
  typeCode: string;
  typeName: string;
};

type TypeCompatibilitySectionProps = {
  heading: TypeSectionHeading;
  compatibility: TypeData["compatibility"];
  compatibleTypes?: CompatibleType[];
};

export function TypeCompatibilitySection({
  heading,
  compatibility,
  compatibleTypes,
}: TypeCompatibilitySectionProps) {
  const resolvedCompatibleTypes = compatibleTypes?.length
    ? compatibleTypes
    : (compatibility.goodWithTypeCodes ?? []).map((typeCode) => ({
        typeCode,
        typeName: typeCode,
      }));

  return (
    <TypeSectionFrame heading={heading}>
      <p className="text-sm leading-relaxed text-[color:var(--color-text-muted)]">
        {compatibility.summary}
      </p>

      {resolvedCompatibleTypes.length ? (
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
          {resolvedCompatibleTypes.map((compatibleType) => {
            const ogpImagePath = getTypeOgpImagePath(compatibleType.typeCode);

            return (
              <Link
                key={compatibleType.typeCode}
                href={`/types/${compatibleType.typeCode}`}
                prefetch={false}
                className="group overflow-hidden rounded-xl border border-midnight-600 bg-midnight-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-midnight-700 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-midnight-700">
                  <Image
                    src={ogpImagePath}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 50vw, 200px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p
                    className="text-xs text-amber-400"
                    style={{ fontFamily: "var(--nzt-font-mono), monospace" }}
                  >
                    {compatibleType.typeCode}
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {compatibleType.typeName}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}

      {compatibility.goodWithDescription ? (
        <p className="mt-4 border-t border-midnight-600 pt-4 text-sm leading-relaxed text-[color:var(--color-text-muted)]">
          {compatibility.goodWithDescription}
        </p>
      ) : null}
    </TypeSectionFrame>
  );
}
