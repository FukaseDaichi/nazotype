"use client";

import { useSyncExternalStore } from "react";

import {
  hasVisitedLineStampStore,
  LINE_STAMP_STORE_VISITED_EVENT,
  LINE_STAMP_STORE_VISITED_STORAGE_KEY,
} from "@/lib/line-stamp-store-visit";

import styles from "./type-detail-hero-section.module.css";

type TypeDetailFuriganaProps = {
  typeCode: string;
  furigana: string;
  emphasisIndex: number;
};

function getServerSnapshot() {
  return false;
}

function subscribeToLineStampStoreVisit(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === LINE_STAMP_STORE_VISITED_STORAGE_KEY) {
      onStoreChange();
    }
  }

  window.addEventListener(LINE_STAMP_STORE_VISITED_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(LINE_STAMP_STORE_VISITED_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function TypeDetailFurigana({
  typeCode,
  furigana,
  emphasisIndex,
}: TypeDetailFuriganaProps) {
  const storeVisited = useSyncExternalStore(
    subscribeToLineStampStoreVisit,
    hasVisitedLineStampStore,
    getServerSnapshot,
  );
  const furiganaChars = Array.from(furigana);

  return (
    <span className={styles.typeNameFurigana} aria-hidden="true">
      {furiganaChars.map((char, index) => {
        const isAccent = index === emphasisIndex;
        const className = isAccent
          ? [
              styles.typeNameFuriganaChar,
              storeVisited ? styles.typeNameFuriganaCharAccent : "",
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
