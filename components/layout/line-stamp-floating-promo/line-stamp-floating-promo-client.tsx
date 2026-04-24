"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./line-stamp-floating-promo.module.css";

const PROMO_STORAGE_KEY = "nazotype:line-stamp-promo:v1";

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

function shouldStartCollapsed() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(max-width: 767px), (max-height: 740px)").matches;
}

export function LineStampFloatingPromoClient({
  href,
  title,
  description,
  collapsedText,
  typeCode,
}: LineStampFloatingPromoClientProps) {
  const [mode, setMode] = useState<PromoMode | null>(null);

  useEffect(() => {
    const preferences = readPreferences();
    const collapsed =
      typeof preferences.collapsed === "boolean"
        ? preferences.collapsed
        : shouldStartCollapsed();
    const initialMode: PromoMode = collapsed ? "collapsed" : "expanded";

    const frame = window.requestAnimationFrame(() => {
      setMode(initialMode);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function handleExpand() {
    setMode("expanded");
    writePreferences({ ...readPreferences(), collapsed: false });
  }

  function handleCollapse() {
    setMode("collapsed");
    writePreferences({ ...readPreferences(), collapsed: true });
  }

  function handleDismiss() {
    setMode("hidden");
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
            <span className={styles.visualRing}>
              <Image
                src="/line-stamp-main.png"
                alt=""
                width={108}
                height={108}
                className={styles.visualImage}
              />
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
