"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { resolvePostDiagnosisState } from "./post-diagnosis-state";
import styles from "./type-detail-hero-section.module.css";

type TypeDetailHeroPrimaryActionProps = {
  typeCode: string;
  publicUrl: string;
};

export function TypeDetailHeroPrimaryAction({
  typeCode,
  publicUrl,
}: TypeDetailHeroPrimaryActionProps) {
  const searchParams = useSearchParams();
  const shouldShowShareAction = Boolean(
    resolvePostDiagnosisState(searchParams, typeCode, publicUrl)?.isPostDiagnosis,
  );

  if (shouldShowShareAction) {
    return (
      <a href="#type-share-panel" className={styles.primaryCta}>
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
