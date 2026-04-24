import Image from "next/image";
import Link from "next/link";

import { getTypeOgpImagePath, getTypePublicPath } from "@/lib/site";

import styles from "./type-ogp-link-card.module.css";

type TypeOgpLinkCardProps = {
  typeCode: string;
  typeName: string;
  tagline?: string;
  href?: string;
  badgeText?: string;
  ctaText?: string;
  className?: string;
  variant?: "standard" | "compact";
  prefetch?: boolean;
  sizes?: string;
};

export function TypeOgpLinkCard({
  typeCode,
  typeName,
  tagline,
  href = getTypePublicPath(typeCode),
  badgeText,
  ctaText = "詳細を見る",
  className = "",
  variant = "standard",
  prefetch = false,
  sizes,
}: TypeOgpLinkCardProps) {
  const cardClassName = [styles.card, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  const resolvedSizes =
    sizes ??
    variant === "compact"
      ? "(max-width: 767px) 100vw, (max-width: 1280px) 50vw, 360px"
      : "(max-width: 767px) 100vw, (max-width: 1280px) 33vw, 280px";

  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={cardClassName}
      aria-label={`${typeName} (${typeCode}) の詳細を見る`}
    >
      <div className={styles.media}>
        <Image
          src={getTypeOgpImagePath(typeCode)}
          alt=""
          fill
          sizes={resolvedSizes}
          className={styles.image}
        />
        <div className={styles.scrim} aria-hidden="true" />
        <div className={styles.frame} aria-hidden="true" />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.identity}>
            <div className={styles.meta}>
              <span className={styles.code}>{typeCode}</span>
            </div>
            <span className={styles.name}>{typeName}</span>
          </div>
          {badgeText ? <span className={styles.badge}>{badgeText}</span> : null}
        </div>
        {tagline ? <span className={styles.tagline}>{tagline}</span> : null}
        <span className={styles.cta}>{ctaText} →</span>
      </div>
    </Link>
  );
}
