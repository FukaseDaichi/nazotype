import { StartDiagnosisForm } from "@/components/diagnosis/start-diagnosis-form/start-diagnosis-form";

import styles from "./home-page.module.css";

export function HomeHeroSection() {
  return (
    <section className="min-h-svh grid grid-cols-1 place-items-center text-center px-6 sm:px-8 py-20 relative overflow-hidden">
      {/* Decorative lines & cipher text */}
      <div className={styles.heroDeco} aria-hidden="true">
        <div className={`${styles.decoLine} ${styles.decoH}`} style={{ top: "20%" }} />
        <div className={`${styles.decoLine} ${styles.decoH}`} style={{ top: "80%" }} />
        <div className={`${styles.decoLine} ${styles.decoV}`} style={{ left: "10%" }} />
        <div className={`${styles.decoLine} ${styles.decoV}`} style={{ right: "10%" }} />

        <div className={styles.cipherBg} style={{ top: "15%", left: 0, right: 0 }}>
          ALHN DBTC ALHT DBHC ALTN DBTC ALHN DBTN ALHT DBTC ALHN
        </div>
        <div className={styles.cipherBg} style={{ top: "25%", left: 0, right: 0 }}>
          行動型 解読型 局所型 俯瞰型 発信型 統率型 熟考型 転換型 行動型 解読型
        </div>
        <div className={styles.cipherBg} style={{ bottom: "20%", left: 0, right: 0 }}>
          ALHN DBTC ALHT DBHC ALTN DBTC ALHN DBTN ALHT DBTC ALHN
        </div>
        <div className={styles.cipherBg} style={{ bottom: "30%", left: 0, right: 0 }}>
          行動型 解読型 局所型 俯瞰型 発信型 統率型 熟考型 転換型 行動型 解読型
        </div>
      </div>

      <div className="w-full max-w-[640px] min-w-0">
        <p
          className="font-mono text-[0.7rem] tracking-[0.3em] text-gold-400 uppercase mb-6"
          style={{ opacity: 0, animation: "fadeUp 0.8s 0.3s forwards" }}
        >
          NAZOTOKI TYPE DIAGNOSIS
        </p>

        <h1
          className="text-[clamp(2.75rem,12vw,9rem)] font-bold leading-none tracking-tight text-paper-50 break-words"
          style={{ opacity: 0, animation: "fadeUp 1s 0.5s forwards" }}
        >
          謎解き
          <br />
          <span className="block bg-gradient-to-br from-gold-300 via-gold-400 to-paper-200 bg-clip-text text-transparent">
            タイプ診断
          </span>
        </h1>

        <p
          className="mt-8 text-[clamp(1rem,2.5vw,1.3rem)] font-light text-paper-200 leading-[1.9] max-w-[640px]"
          style={{ opacity: 0, animation: "fadeUp 1s 0.8s forwards" }}
        >
          あなたはチームの何者か。
          <br />
          行動・解読・発信・俯瞰——
          <br />
          4軸16タイプで、あなたの
          <strong className="text-paper-50">謎解きの役割</strong>
          が明らかになる。
        </p>

        <div style={{ opacity: 0, animation: "fadeUp 1s 1s forwards" }}>
          <div className="mt-10">
            <StartDiagnosisForm inputId="heroName" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator} aria-hidden="true">
        <div className={styles.scrollLine} />
        <span>SCROLL</span>
      </div>
    </section>
  );
}
