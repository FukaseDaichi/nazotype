"use client";

import { useSyncExternalStore } from "react";

import {
  getLineStampClockInteractionServerSnapshot,
  getLineStampClockInteractionSnapshot,
  subscribeLineStampClockInteraction,
} from "@/lib/line-stamp-clock-interaction";

import styles from "./type-detail-hero-section.module.css";

type TypeDetailFuriganaProps = {
  typeCode: string;
  furigana: string;
  emphasisIndex: number;
};

export function TypeDetailFurigana({
  typeCode,
  furigana,
  emphasisIndex,
}: TypeDetailFuriganaProps) {
  const clockInteraction = useSyncExternalStore(
    subscribeLineStampClockInteraction,
    getLineStampClockInteractionSnapshot,
    getLineStampClockInteractionServerSnapshot,
  );
  const furiganaChars = Array.from(furigana);
  const activeEmphasisHour = emphasisIndex + 1;
  const shouldAccent =
    clockInteraction.isDragging &&
    clockInteraction.selectedHour === activeEmphasisHour;

  return (
    <span className={styles.typeNameFurigana} aria-hidden="true">
      {furiganaChars.map((char, index) => {
        const isAccent = index === emphasisIndex;
        const className = isAccent
          ? [
              styles.typeNameFuriganaChar,
              shouldAccent ? styles.typeNameFuriganaCharAccent : "",
            ]
              .filter(Boolean)
              .join(" ")
          : styles.typeNameFuriganaChar;

        return (
          <span key={`${typeCode}-furigana-${index}`} className={className}>
            {char}
          </span>
        );
      })}
    </span>
  );
}
