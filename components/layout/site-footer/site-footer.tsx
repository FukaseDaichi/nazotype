import Link from "next/link";

import styles from "./site-footer.module.css";

type SiteFooterProps = {
  className?: string;
};

export function SiteFooter({ className }: SiteFooterProps) {
  const footerClassName = className
    ? `${styles.footer} ${className}`
    : styles.footer;

  return (
    <footer className={footerClassName}>
      <nav className={styles.nav} aria-label="フッターナビゲーション">
        <Link href="/" prefetch={false} className={styles.navLink}>
          トップ
        </Link>
        <span className={styles.navSep} aria-hidden="true">&middot;</span>
        <Link href="/#axes" prefetch={false} className={styles.navLink}>
          4つの軸
        </Link>
        <span className={styles.navSep} aria-hidden="true">&middot;</span>
        <Link href="/#all-types-heading" prefetch={false} className={styles.navLink}>
          16タイプ
        </Link>
      </nav>
      <p className={styles.copy}>
        NAZOTOKI TYPE DIAGNOSIS &nbsp;&middot;&nbsp; 4軸16タイプ謎解きロール診断
        &nbsp;&middot;&nbsp; 能力ではなく、役割の違いを診る
      </p>
    </footer>
  );
}
