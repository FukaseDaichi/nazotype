"use client";

import Link from "next/link";

import { useSecretShareAvailability } from "@/components/secret/secret-share-availability-context";

import styles from "./secret-hero-section.module.css";

export function SecretHeroPrimaryAction() {
  const canShare = useSecretShareAvailability();

  if (canShare) {
    return (
      <a href="#secret-share-panel" className={styles.primaryCta}>
        <span>共有する</span>
        <span className={styles.ctaArrow} aria-hidden="true">
          →
        </span>
      </a>
    );
  }

  return (
    <Link href="/" prefetch={false} className={styles.primaryCta}>
      <span>自分でも診断する</span>
      <span className={styles.ctaArrow} aria-hidden="true">
        →
      </span>
    </Link>
  );
}
