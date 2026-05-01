"use client";

import type { KeyboardEvent, PointerEvent } from "react";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  getClockHourFromAngle,
  normalizeClockAngle,
  resetLineStampClockInteractionState,
  setLineStampClockInteractionState,
} from "@/lib/line-stamp-clock-interaction";
import { markLineStampStoreVisited } from "@/lib/line-stamp-store-visit";

import styles from "./line-stamp-floating-promo.module.css";

const PROMO_STORAGE_KEY = "nazotype:line-stamp-promo:v2";
const ROTATION_PERIOD_MS = 12_000;
const HOUR_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

type PromoPreferences = {
  collapsed?: boolean;
};

type PromoMode = "expanded" | "collapsed" | "hidden";

type LineStampFloatingPromoClientProps = {
  href: string;
  title: string;
  description: string;
  collapsedText: string;
  typeCode?: string;
};

function readPreferences(): PromoPreferences {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(PROMO_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as PromoPreferences;
    return { collapsed: parsed.collapsed };
  } catch {
    return {};
  }
}

function writePreferences(preferences: PromoPreferences) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      PROMO_STORAGE_KEY,
      JSON.stringify(preferences),
    );
  } catch {
    // localStorage が使えない環境では無視
  }
}

function pointerToHandAngle(
  clientX: number,
  clientY: number,
  center: { x: number; y: number },
): number {
  const dx = clientX - center.x;
  const dy = clientY - center.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI + 90;
}

function smoothAngle(nextAngle: number, prevAngle: number): number {
  let result = nextAngle;
  let diff = result - prevAngle;
  while (diff > 180) {
    result -= 360;
    diff -= 360;
  }
  while (diff < -180) {
    result += 360;
    diff += 360;
  }
  return result;
}

export function LineStampFloatingPromoClient({
  href,
  title,
  description,
  collapsedText,
  typeCode,
}: LineStampFloatingPromoClientProps) {
  const [mode, setMode] = useState<PromoMode | null>(null);
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const clockRef = useRef<HTMLSpanElement | null>(null);
  const centerRef = useRef<{ x: number; y: number } | null>(null);
  const angleRef = useRef(0);
  const keyboardReleaseTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const selectedHour = getClockHourFromAngle(angle);

  useEffect(() => {
    const preferences = readPreferences();
    const initialMode: PromoMode =
      preferences.collapsed === false ? "expanded" : "collapsed";

    const frame = window.requestAnimationFrame(() => {
      setMode(initialMode);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (mode !== "expanded" || isDragging) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      return;
    }

    let frame = 0;
    let lastTime = performance.now();
    const tick = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;
      const nextAngle =
        angleRef.current + (delta / ROTATION_PERIOD_MS) * 360;
      angleRef.current = nextAngle;
      setAngle(nextAngle);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [mode, isDragging]);

  useEffect(() => {
    if (mode === "expanded") {
      return;
    }

    if (keyboardReleaseTimeoutRef.current) {
      clearTimeout(keyboardReleaseTimeoutRef.current);
      keyboardReleaseTimeoutRef.current = null;
    }

    centerRef.current = null;
    resetLineStampClockInteractionState(angleRef.current);
  }, [mode]);

  useEffect(() => {
    return () => {
      if (keyboardReleaseTimeoutRef.current) {
        clearTimeout(keyboardReleaseTimeoutRef.current);
      }
      resetLineStampClockInteractionState(angleRef.current);
    };
  }, []);

  function setClockAngle(nextAngle: number) {
    angleRef.current = nextAngle;
    setAngle(nextAngle);
  }

  function publishClockInteraction(nextAngle: number, dragging: boolean) {
    setLineStampClockInteractionState({
      isDragging: dragging,
      angleDeg: normalizeClockAngle(nextAngle),
      selectedHour: dragging ? getClockHourFromAngle(nextAngle) : null,
    });
  }

  function updateClockAngle(nextAngle: number, dragging: boolean) {
    setClockAngle(nextAngle);
    publishClockInteraction(nextAngle, dragging);
  }

  function clearKeyboardReleaseTimeout() {
    if (!keyboardReleaseTimeoutRef.current) {
      return;
    }

    clearTimeout(keyboardReleaseTimeoutRef.current);
    keyboardReleaseTimeoutRef.current = null;
  }

  function finishClockInteraction() {
    clearKeyboardReleaseTimeout();
    setIsDragging(false);
    centerRef.current = null;
    resetLineStampClockInteractionState(angleRef.current);
  }

  function scheduleKeyboardInteractionFinish() {
    clearKeyboardReleaseTimeout();
    keyboardReleaseTimeoutRef.current = setTimeout(() => {
      keyboardReleaseTimeoutRef.current = null;
      finishClockInteraction();
    }, 650);
  }

  function handleExpand() {
    setMode("expanded");
    writePreferences({ ...readPreferences(), collapsed: false });
  }

  function handleCollapse() {
    finishClockInteraction();
    setMode("collapsed");
    writePreferences({ ...readPreferences(), collapsed: true });
  }

  function handleDismiss() {
    finishClockInteraction();
    setMode("hidden");
  }

  function handleStoreCtaClick() {
    markLineStampStoreVisited();
  }

  function handleClockPointerDown(e: PointerEvent<HTMLSpanElement>) {
    if (e.button !== 0) return;
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    centerRef.current = center;
    clearKeyboardReleaseTimeout();
    setIsDragging(true);
    const next = pointerToHandAngle(e.clientX, e.clientY, center);
    updateClockAngle(smoothAngle(next, angleRef.current), true);
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleClockPointerMove(e: PointerEvent<HTMLSpanElement>) {
    const center = centerRef.current;
    if (!center) return;
    const next = pointerToHandAngle(e.clientX, e.clientY, center);
    updateClockAngle(smoothAngle(next, angleRef.current), true);
  }

  function handleClockPointerUp(e: PointerEvent<HTMLSpanElement>) {
    finishClockInteraction();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  function handleClockKeyDown(e: KeyboardEvent<HTMLSpanElement>) {
    const keyDelta: Partial<Record<string, number>> = {
      ArrowRight: 30,
      ArrowUp: 30,
      ArrowLeft: -30,
      ArrowDown: -30,
    };
    const delta = keyDelta[e.key];

    if (delta === undefined) {
      return;
    }

    e.preventDefault();
    const nextAngle = angleRef.current + delta;
    setIsDragging(true);
    updateClockAngle(nextAngle, true);
    scheduleKeyboardInteractionFinish();
  }

  if (mode === null || mode === "hidden") {
    return null;
  }

  if (mode === "collapsed") {
    return (
      <aside className={styles.root} aria-label="LINEスタンプ案内">
        <div className={styles.collapsedShell}>
          <button
            type="button"
            onClick={handleExpand}
            className={styles.collapsedButton}
            aria-label="LINEスタンプ案内を開く"
          >
            <span className={styles.collapsedThumb}>
              <Image
                src="/line-stamp-main.png"
                alt=""
                width={64}
                height={64}
                className={styles.collapsedThumbImage}
              />
              <span className={styles.collapsedPip} aria-hidden="true" />
            </span>
            <span className={styles.collapsedContent}>
              <span className={styles.collapsedEyebrow}>LINE STICKERS</span>
              <span className={styles.collapsedText}>{collapsedText}</span>
            </span>
            <span className={styles.collapsedChevron} aria-hidden="true">
              &rsaquo;
            </span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className={styles.collapsedClose}
            aria-label="LINEスタンプ案内を閉じる"
          >
            <svg
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
              className={styles.controlIcon}
            >
              <path
                d="M4 4l4 4M8 4l-4 4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </aside>
    );
  }

  const titleLines = title.split("\n");

  return (
    <aside className={styles.root} aria-label="LINEスタンプ案内">
      <section className={styles.card}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            LINE STICKERS
            <span className={styles.newPill}>NEW</span>
          </p>
          <div className={styles.controls}>
            <button
              type="button"
              onClick={handleCollapse}
              className={styles.iconButton}
              aria-label="LINEスタンプ案内をたたむ"
            >
              <svg
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                className={styles.controlIcon}
              >
                <path
                  d="M3 6h6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className={styles.iconButton}
              aria-label="LINEスタンプ案内を閉じる"
            >
              <svg
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                className={styles.controlIcon}
              >
                <path
                  d="M4 4l4 4M8 4l-4 4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.copy}>
            <h2 className={styles.title}>
              {titleLines.map((line, index) => (
                <span
                  key={`${line}-${index}`}
                  className={styles.titleLine}
                >
                  {line}
                </span>
              ))}
            </h2>
            <p className={styles.description}>{description}</p>
            {typeCode ? (
              <p
                className={styles.typeChip}
                aria-label={`対象タイプ ${typeCode}`}
              >
                {typeCode}
              </p>
            ) : null}
          </div>

          <div className={styles.visual}>
            <span className={styles.visualGlow} aria-hidden="true" />
            <span
              ref={clockRef}
              className={[
                styles.visualRing,
                isDragging ? styles.visualRingDragging : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onPointerDown={handleClockPointerDown}
              onPointerMove={handleClockPointerMove}
              onPointerUp={handleClockPointerUp}
              onPointerCancel={handleClockPointerUp}
              onLostPointerCapture={finishClockInteraction}
              onKeyDown={handleClockKeyDown}
              role="slider"
              tabIndex={0}
              aria-label="LINEスタンプ時計の長針"
              aria-valuemin={1}
              aria-valuemax={12}
              aria-valuenow={selectedHour}
              aria-valuetext={`${selectedHour}時`}
            >
              <Image
                src="/line-stamp-main.png"
                alt=""
                width={108}
                height={108}
                className={styles.visualImage}
              />
              <span className={styles.visualOverlay} aria-hidden="true" />
              <svg
                className={styles.clockFace}
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="47"
                  className={styles.clockBezel}
                />
                {HOUR_NUMBERS.map((n) => {
                  const rad = ((n * 30 - 90) * Math.PI) / 180;
                  const r = 40;
                  return (
                    <text
                      key={n}
                      x={50 + r * Math.cos(rad)}
                      y={50 + r * Math.sin(rad)}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className={styles.clockNumber}
                    >
                      {n}
                    </text>
                  );
                })}
                {Array.from({ length: 60 }, (_, i) => {
                  if (i % 5 === 0) return null;
                  const rad = ((i * 6 - 90) * Math.PI) / 180;
                  const inner = 45;
                  const outer = 47;
                  return (
                    <line
                      key={i}
                      x1={50 + inner * Math.cos(rad)}
                      y1={50 + inner * Math.sin(rad)}
                      x2={50 + outer * Math.cos(rad)}
                      y2={50 + outer * Math.sin(rad)}
                      className={styles.clockTick}
                    />
                  );
                })}
                <circle
                  cx="50"
                  cy="50"
                  r="2.4"
                  className={styles.clockPivot}
                />
              </svg>
              <span
                className={styles.clockHand}
                style={{
                  transform: `translate(-50%, -80%) rotate(${angle}deg)`,
                }}
                aria-hidden="true"
              >
                <Image
                  src="/longhand.png"
                  alt=""
                  width={200}
                  height={300}
                  draggable={false}
                  className={styles.clockHandImage}
                />
              </span>
            </span>
            <span className={styles.visualBadge} aria-hidden="true">
              LINE
            </span>
          </div>
        </div>

        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={styles.cta}
          onClick={handleStoreCtaClick}
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className={styles.ctaIcon}
          >
            <path d="M10 2C5.58 2 2 4.91 2 8.5c0 2.07 1.25 3.92 3.2 5.11V17l3.06-1.81c.56.11 1.14.17 1.74.17 4.42 0 8-2.91 8-6.5S14.42 2 10 2z" />
          </svg>
          <span className={styles.ctaLabel}>LINE STOREで見る</span>
          <span className={styles.ctaArrow} aria-hidden="true">
            &rsaquo;
          </span>
        </a>
      </section>
    </aside>
  );
}
