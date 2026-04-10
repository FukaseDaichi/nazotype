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
      <p className={styles.copy}>
        NAZOTOKI TYPE DIAGNOSIS &nbsp;&middot;&nbsp; 4軸16タイプ謎解きロール診断
        &nbsp;&middot;&nbsp; 能力ではなく、役割の違いを診る
      </p>
    </footer>
  );
}
