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
        © Whte Franc / Murder Mystery Behavioral Analysis System
      </p>
      <p className={styles.copy}>Powered by 4-Axis Personality Framework</p>
    </footer>
  );
}
