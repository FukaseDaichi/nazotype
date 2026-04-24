import Link from "next/link";

import styles from "./site-footer.module.css";

type SiteFooterProps = {
  className?: string;
};

const NAV_ITEMS = [
  { index: "01", label: "トップ", href: "/" },
  { index: "02", label: "4つの軸", href: "/#axes" },
  { index: "03", label: "16タイプ", href: "/#all-types-heading" },
] as const;

export function SiteFooter({ className }: SiteFooterProps) {
  const footerClassName = className
    ? `${styles.footer} ${className}`
    : styles.footer;
  const year = new Date().getFullYear();

  return (
    <footer className={footerClassName}>
      <div className={styles.inner}>
        <div className={styles.signature} aria-hidden="true">
          <span className={styles.signatureLine} />
          <span className={styles.signatureMark}>謎</span>
          <span className={styles.signatureWord}>NAZOTOKI TYPE</span>
          <span className={styles.signatureLine} />
        </div>

        <nav className={styles.nav} aria-label="フッターナビゲーション">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={styles.navLink}
            >
              <span className={styles.navIndex} aria-hidden="true">
                {item.index}
              </span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <a
          href="https://nazomatic.vercel.app"
          target="_blank"
          rel="noreferrer"
          className={styles.relatedCard}
          aria-label="関連サイト NAZOMATICを新しいタブで開く"
        >
          <div className={styles.relatedBody}>
            <span className={styles.relatedEyebrow}>RELATED SITE</span>
            <span className={styles.relatedName}>NAZOMATIC</span>
          </div>
          <span className={styles.relatedArrow} aria-hidden="true">
            →
          </span>
        </a>

        <div className={styles.copy}>
          <span className={styles.copySymbol} aria-hidden="true">
            &copy;
          </span>
          <span>{year}</span>
          <span className={styles.copyDot} aria-hidden="true">
            /
          </span>
          <a
            href="https://x.com/2d7rqU5gFQ6VpGo"
            target="_blank"
            rel="noreferrer"
            className={styles.copyName}
            aria-label="制作者 WhiteFranc のXプロフィールを新しいタブで開く"
          >
            WhiteFranc
          </a>
        </div>
      </div>
    </footer>
  );
}
