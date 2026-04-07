import type { CSSProperties } from "react";

import Image from "next/image";

import { hasTypeImage } from "@/lib/data";
import { resolvePalette } from "@/lib/site";

type TypeArtworkProps = {
  typeCode: string;
  typeName: string;
  palette: string[];
  priority?: boolean;
  className?: string;
};

export async function TypeArtwork({
  typeCode,
  typeName,
  palette,
  priority = false,
  className = "",
}: TypeArtworkProps) {
  const imageAvailable = await hasTypeImage(typeCode);
  const [primary, secondary, accent] = resolvePalette(palette);

  if (imageAvailable) {
    return (
      <div className={`illustration-frame ${className}`.trim()}>
        <Image
          src={`/types/${typeCode}.png`}
          alt={`${typeName}のキャラクターイラスト`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 480px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`illustration-frame placeholder-illustration ${className}`.trim()}
      style={
        {
          "--placeholder-primary": primary,
          "--placeholder-secondary": secondary,
          "--placeholder-accent": accent,
        } as CSSProperties
      }
      aria-label={`${typeName}のイラストは準備中です`}
    >
      <div className="placeholder-badge">{typeCode}</div>
      <p className="font-display text-2xl leading-tight">{typeName}</p>
      <p className="text-sm text-[color:var(--color-text-subtle)]">
        イラストを追加するとここに表示されます
      </p>
    </div>
  );
}
