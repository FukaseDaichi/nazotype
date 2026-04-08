import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon} aria-hidden="true">🔑</div>
        <h1 className={styles.title}>ページが見つかりません</h1>
        <p className={styles.description}>
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primaryLink}>
            トップページへ
          </Link>
          <Link href="/#types" className={styles.ghostLink}>
            タイプ一覧を見る →
          </Link>
        </div>
      </div>
    </div>
  );
}
