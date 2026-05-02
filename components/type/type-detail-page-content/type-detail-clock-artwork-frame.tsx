"use client";

import type { ReactNode } from "react";

import { useSyncExternalStore } from "react";

import {
  getLineStampClockInteractionServerSnapshot,
  getLineStampClockInteractionSnapshot,
  subscribeLineStampClockInteraction,
} from "@/lib/line-stamp-clock-interaction";

import styles from "./type-detail-hero-section.module.css";

type TypeDetailClockArtworkFrameProps = {
  activeHour: number;
  children: ReactNode;
};

export function TypeDetailClockArtworkFrame({
  activeHour,
  children,
}: TypeDetailClockArtworkFrameProps) {
  const clockInteraction = useSyncExternalStore(
    subscribeLineStampClockInteraction,
    getLineStampClockInteractionSnapshot,
    getLineStampClockInteractionServerSnapshot,
  );
  const isClockMatched = clockInteraction.selectedHour === activeHour;
  const shouldHighlightFrame =
    isClockMatched && clockInteraction.isPointerDragging;
  const className = [
    styles.artworkFrame,
    isClockMatched ? styles.artworkFrameClockSparkle : "",
    shouldHighlightFrame ? styles.artworkFrameClockActive : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={className}>{children}</div>;
}
