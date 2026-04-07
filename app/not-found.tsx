import { Bebas_Neue, Caveat, Special_Elite } from "next/font/google";
import Link from "next/link";

import styles from "./not-found.module.css";

const displayFont = Bebas_Neue({
  variable: "--rcf-font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const typewriterFont = Special_Elite({
  variable: "--rcf-font-typewriter",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const noteFont = Caveat({
  variable: "--rcf-font-note",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

export default function NotFound() {
  return (
    <main
      id="main-content"
      className={`${displayFont.variable} ${typewriterFont.variable} ${noteFont.variable} ${styles.page}`}
    >
      <div aria-hidden="true" className={styles.backdrop} />

      <div className={styles.shell}>
        <div className={styles.envelope}>
          <span className={styles.stamp}>Case Closed</span>

          <p className={styles.fileMeta}>
            Error 404 / File Not Found
          </p>

          <h1 className={styles.title}>
            <em>Page</em>
            <br />
            Not Found
          </h1>

          <p className={styles.handnote}>
            - 該当するファイルは存在しません
          </p>

          <p className={styles.body}>
            タイプコードか共有URLが壊れている可能性があります。
            トップページからもう一度診断を始めてください。
          </p>

          <div className={styles.actions}>
            <Link href="/" className={styles.ctaPrimary}>
              トップへ戻る
            </Link>
            <Link href="/diagnosis" className={styles.ctaSecondary}>
              診断ページへ
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
