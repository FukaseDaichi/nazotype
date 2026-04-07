"use client";

import {
  Bebas_Neue,
  Caveat,
  Noto_Serif_JP,
  Special_Elite,
} from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  ANSWER_OPTIONS,
  calculateDiagnosisResult,
  getQuestionsForPage,
} from "@/lib/diagnosis";
import { readDiagnosisDraft, writeDiagnosisDraft } from "@/lib/draft-storage";
import { writePostDiagnosisResultCookie } from "@/lib/post-diagnosis-result";
import { createShareKey } from "@/lib/share-key";
import type { AnswerValue, AnswersRecord, QuestionMaster } from "@/lib/types";

import styles from "./diagnosis-flow.module.css";

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

const serifFont = Noto_Serif_JP({
  variable: "--rcf-font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
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

const fontVars = `${displayFont.variable} ${typewriterFont.variable} ${serifFont.variable} ${noteFont.variable}`;

type DiagnosisFlowProps = {
  questionMaster: QuestionMaster;
};

type LocationState = {
  currentPage: number;
  hasPageQuery: boolean;
};

const ANSWER_PRESENTATIONS: Record<
  AnswerValue,
  {
    tone: "red-strong" | "red-soft" | "neutral" | "teal-soft" | "teal-strong";
    shortLabel: string;
    caption: string;
    size: number;
  }
> = {
  5: {
    tone: "red-strong",
    shortLabel: "とても",
    caption: "そう思う",
    size: 46,
  },
  4: {
    tone: "red-soft",
    shortLabel: "やや",
    caption: "そう思う",
    size: 40,
  },
  3: {
    tone: "neutral",
    shortLabel: "中立",
    caption: "どちらでもない",
    size: 34,
  },
  2: {
    tone: "teal-soft",
    shortLabel: "やや",
    caption: "そう思わない",
    size: 40,
  },
  1: {
    tone: "teal-strong",
    shortLabel: "全く",
    caption: "そう思わない",
    size: 46,
  },
};

export function DiagnosisFlow({ questionMaster }: DiagnosisFlowProps) {
  const router = useRouter();
  const totalPages = questionMaster.meta.pageCount;
  const totalQuestions = questionMaster.meta.questionCount;
  const activeQuestions = questionMaster.questions.filter(
    (question) => question.isActive,
  );

  const [isHydrated, setIsHydrated] = useState(false);
  const [userName, setUserName] = useState("");
  const [answers, setAnswers] = useState<AnswersRecord>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [restoreNotice, setRestoreNotice] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const questionRefs = useRef<Record<string, HTMLElement | null>>({});

  const pageQuestions = getQuestionsForPage(questionMaster, currentPage);
  const firstQuestionNumber = pageQuestions[0]?.displayOrder ?? 1;
  const lastQuestionNumber =
    pageQuestions[pageQuestions.length - 1]?.displayOrder ??
    firstQuestionNumber;
  const answeredCount = activeQuestions.filter(
    (question) => answers[question.questionId],
  ).length;
  const currentPageAnsweredCount = pageQuestions.filter(
    (question) => answers[question.questionId],
  ).length;
  const progressRatio = totalQuestions > 0 ? answeredCount / totalQuestions : 0;

  useEffect(() => {
    const applyStateFromLocation = (showNotice: boolean) => {
      const locationState = readLocationState(totalPages);
      const draft = readDiagnosisDraft();
      const nextName = draft?.userName ?? "";
      const nextAnswers = draft?.answers ?? {};
      const nextPage = nextName
        ? clampPage(
            locationState.hasPageQuery
              ? locationState.currentPage
              : (draft?.currentPage ?? 1),
            totalPages,
          )
        : 1;

      setUserName(nextName);
      setAnswers(nextAnswers);
      setCurrentPage(nextPage);
      syncUrl(nextPage, "replace");

      if (
        showNotice &&
        draft &&
        Object.keys(draft.answers).length > 0 &&
        !locationState.hasPageQuery
      ) {
        setRestoreNotice("保存していた回答を復元しました。");
      }
    };

    const frame = window.requestAnimationFrame(() => {
      applyStateFromLocation(true);
      setIsHydrated(true);
    });

    const handlePopState = () => {
      applyStateFromLocation(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [totalPages]);

  useEffect(() => {
    if (!isHydrated || !userName) {
      return;
    }

    writeDiagnosisDraft({
      userName,
      answers,
      currentPage,
      updatedAt: new Date().toISOString(),
    });
  }, [answers, currentPage, isHydrated, userName]);

  useEffect(() => {
    if (!isHydrated || !userName) {
      return;
    }

    pageHeadingRef.current?.focus();
  }, [currentPage, isHydrated, userName]);

  function handleAnswerChange(questionId: string, value: number) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value as AnswerValue,
    }));
    setValidationError("");
    setRestoreNotice("");
  }

  function moveToPage(nextPage: number, mode: "push" | "replace") {
    const clamped = clampPage(nextPage, totalPages);
    setCurrentPage(clamped);
    syncUrl(clamped, mode);
    setValidationError("");
    setRestoreNotice("");
  }

  function handlePrevious() {
    moveToPage(currentPage - 1, "push");
  }

  function handleNext() {
    const unansweredQuestions = pageQuestions.filter(
      (question) => !answers[question.questionId],
    );

    if (unansweredQuestions.length > 0) {
      setValidationError("このページの8問すべてに回答してください。");
      questionRefs.current[unansweredQuestions[0].questionId]?.focus();
      return;
    }

    if (currentPage < totalPages) {
      moveToPage(currentPage + 1, "push");
      return;
    }

    const unansweredOverall = activeQuestions.find(
      (question) => !answers[question.questionId],
    );

    if (unansweredOverall) {
      moveToPage(unansweredOverall.pageNo, "push");
      setValidationError(
        "未回答の質問があります。抜けているページへ戻しました。",
      );
      requestAnimationFrame(() => {
        questionRefs.current[unansweredOverall.questionId]?.focus();
      });
      return;
    }

    setIsSubmitting(true);

    const result = calculateDiagnosisResult(questionMaster, answers);
    const key = createShareKey(userName, result.axisSummaries);
    writePostDiagnosisResultCookie(result.typeCode, key);
    router.push(`/types/${result.typeCode}/${key}`);
  }

  if (!isHydrated) {
    return (
      <main id="main-content" className={`${fontVars} ${styles.page}`}>
        <div aria-hidden="true" className={styles.backdrop} />
        <div className={styles.shell}>
          <section
            className={`${styles.statusPanel} ${styles.statusPanelCentered}`}
          >
            <div className={styles.loadingMark} aria-hidden="true" />
            <p className={styles.eyebrow}>Preparing</p>
            <h1 className={styles.statusTitle}>診断の準備をしています</h1>
            <p className={styles.statusCopy}>
              前回の保存内容と表示ページを確認しています。
            </p>
          </section>
        </div>
      </main>
    );
  }

  if (!userName) {
    return (
      <main id="main-content" className={`${fontVars} ${styles.page}`}>
        <div aria-hidden="true" className={styles.backdrop} />
        <div className={styles.shell}>
          <section className={styles.statusPanel}>
            <p className={styles.eyebrow}>Diagnosis</p>
            <h1 className={styles.statusTitle}>
              まずはお名前を入れて診断を始めます
            </h1>
            <p className={styles.statusCopy}>
              このページを直接開いた場合は、トップページの開始フォームから進んでください。
            </p>
            <Link href="/" prefetch={false} className={styles.ctaPrimary}>
              トップページへ戻る
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (isSubmitting) {
    return (
      <main id="main-content" className={`${fontVars} ${styles.page}`}>
        <div aria-hidden="true" className={styles.backdrop} />
        <div className={styles.shell}>
          <section
            className={`${styles.statusPanel} ${styles.statusPanelCentered}`}
          >
            <div className={styles.loadingMark} aria-hidden="true" />
            <p className={styles.eyebrow}>Calculating</p>
            <h1 className={styles.statusTitle}>診断結果を計算しています</h1>
            <p className={styles.statusCopy}>
              あなたの回答を4軸の記録にまとめています。
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className={`${fontVars} ${styles.page}`}>
      <div aria-hidden="true" className={styles.backdrop} />

      <div className={styles.shell}>
        {/* ── 古紙ヘッダーパネル ── */}
        <div className={styles.headerPanel}>
          <div className={styles.headerTop}>
            <div className={styles.headerCopy}>
              <p className={styles.fileMeta}>
                Diagnosis File / Page {String(currentPage).padStart(2, "0")}
              </p>
              <h1
                ref={pageHeadingRef}
                tabIndex={-1}
                className={styles.pageTitle}
              >
                {userName}さんの診断
              </h1>
              <p className={styles.handNote} aria-hidden="true">
                - ペン先で印をつけるように、迷いすぎずに選んでください
              </p>
            </div>

            <Link href="/" prefetch={false} className={styles.backLink}>
              トップへ戻る
            </Link>
          </div>

          <div className={`hidden md:grid ${styles.metaGrid}`}>
            <div className={styles.metaCard}>
              <span className={styles.metaLabel}>Page</span>
              <strong className={styles.metaValue}>
                {currentPage} / {totalPages}
              </strong>
            </div>
            <div className={styles.metaCard}>
              <span className={styles.metaLabel}>Questions</span>
              <strong className={styles.metaValue}>
                {firstQuestionNumber} - {lastQuestionNumber}
              </strong>
            </div>
            <div className={styles.metaCard}>
              <span className={styles.metaLabel}>Answered</span>
              <strong className={styles.metaValue}>
                {answeredCount} / {totalQuestions}
              </strong>
            </div>
          </div>

          <div aria-live="polite" className={styles.progressBlock}>
            <div className={styles.progressHeader}>
              <span>
                回答済み {answeredCount} / {totalQuestions}
              </span>
              <span>
                このページ {currentPageAnsweredCount} / {pageQuestions.length}
              </span>
            </div>
            <div className={styles.progressTrack} aria-hidden="true">
              <div
                className={styles.progressFill}
                style={{ transform: `scaleX(${progressRatio})` }}
              />
            </div>
          </div>

          {restoreNotice ? (
            <p className={styles.statusNote} role="status">
              {restoreNotice}
            </p>
          ) : null}
        </div>

        {/* ── 黒質問パネル ── */}
        <div className={styles.questionsPanel}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Question Sheet</p>
              <h2 className={styles.sectionTitle}>
                質問 {firstQuestionNumber}〜{lastQuestionNumber}
              </h2>
            </div>
            <p className={styles.sectionCopy}>
              気持ちの強さに近いものを選んでください。
            </p>
          </div>

          <div className={styles.scaleGuide} aria-hidden="true">
            <span
              className={`hidden md:inline ${styles.scaleLabel} ${styles.scaleLabelRed}`}
            >
              とてもそう思う
            </span>
            <div className={styles.scalePreview}>
              {ANSWER_OPTIONS.map((option) => {
                const presentation = ANSWER_PRESENTATIONS[option.value];

                return (
                  <div
                    key={`guide-${option.value}`}
                    className={styles.scalePreviewItem}
                    data-tone={presentation.tone}
                  >
                    <PenScaleIcon
                      size={presentation.size}
                      className={styles.scalePreviewIcon}
                    />
                  </div>
                );
              })}
            </div>
            <span
              className={`hidden md:inline ${styles.scaleLabel} ${styles.scaleLabelTeal}`}
            >
              全くそうは思わない
            </span>
            <div className="flex justify-between w-full md:hidden">
              <span className={`${styles.scaleLabel} ${styles.scaleLabelRed}`}>
                とてもそう思う
              </span>
              <span className={`${styles.scaleLabel} ${styles.scaleLabelTeal}`}>
                全くそうは思わない
              </span>
            </div>
          </div>

          <div className={styles.questionList}>
            {pageQuestions.map((question) => {
              const selectedValue = answers[question.questionId];

              return (
                <fieldset
                  key={question.questionId}
                  className={styles.questionCard}
                >
                  <legend
                    ref={(element) => {
                      questionRefs.current[question.questionId] = element;
                    }}
                    tabIndex={-1}
                    className={styles.questionLegend}
                  >
                    <span className={styles.questionNumber}>
                      Q{String(question.displayOrder).padStart(2, "0")}
                    </span>
                    <span className={styles.questionText}>
                      {question.questionText}
                    </span>
                  </legend>

                  <div className={styles.answerScaleRow}>
                    <span
                      className={`${styles.scaleEdgeLabel} ${styles.scaleLabelRed}`}
                    >
                      そう思う
                    </span>
                    {ANSWER_OPTIONS.map((option) => {
                      const presentation = ANSWER_PRESENTATIONS[option.value];
                      const checked = selectedValue === option.value;

                      return (
                        <label
                          key={option.value}
                          className={`${styles.answerChoice} ${checked ? styles.answerChoiceSelected : ""}`}
                          data-tone={presentation.tone}
                        >
                          <input
                            type="radio"
                            name={question.questionId}
                            value={option.value}
                            checked={checked}
                            onChange={() =>
                              handleAnswerChange(
                                question.questionId,
                                option.value,
                              )
                            }
                            className={styles.answerInput}
                            aria-label={option.label}
                          />
                          <span
                            className={styles.answerVisual}
                            aria-hidden="true"
                          >
                            <PenScaleIcon
                              size={presentation.size}
                              className={styles.answerIcon}
                            />
                          </span>
                          <span className={styles.visuallyHidden}>
                            {option.label}
                          </span>
                        </label>
                      );
                    })}
                    <span
                      className={`${styles.scaleEdgeLabel} ${styles.scaleLabelTeal}`}
                    >
                      思わない
                    </span>
                  </div>
                  <div className={styles.answerSelectedArea}>
                    {selectedValue ? (
                      <span
                        className={`${styles.answerSelectedLabel} ${styles.answerSelectedLabelVisible}`}
                      >
                        {
                          ANSWER_OPTIONS.find((o) => o.value === selectedValue)
                            ?.label
                        }
                      </span>
                    ) : null}
                  </div>
                </fieldset>
              );
            })}
          </div>

          {validationError ? (
            <p
              className={`${styles.statusNote} ${styles.statusNoteError}`}
              role="alert"
            >
              {validationError}
            </p>
          ) : null}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handlePrevious}
              className={styles.ctaSecondary}
              disabled={currentPage === 1}
            >
              前の8問へ戻る
            </button>
            <button
              type="button"
              onClick={handleNext}
              className={styles.ctaPrimary}
            >
              {currentPage === totalPages ? "診断結果を見る" : "次の8問へ進む"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function PenScaleIcon({
  className,
  size,
}: {
  className?: string;
  size: number;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M32 8c1.3 0 2.5.5 3.4 1.4l12.2 12.2c1.2 1.2 1.6 2.9 1.1 4.4L43.2 43c-.3 1-.9 1.8-1.7 2.4L32 55l-9.5-9.6c-.8-.6-1.4-1.4-1.7-2.4L15.3 26c-.5-1.5-.1-3.2 1.1-4.4L28.6 9.4C29.5 8.5 30.7 8 32 8Z" />
      <path d="M32 20.5a6.2 6.2 0 1 1 0 12.4a6.2 6.2 0 0 1 0-12.4Z" />
      <path d="M32 32.9v14.6" />
    </svg>
  );
}

function readLocationState(totalPages: number): LocationState {
  if (typeof window === "undefined") {
    return {
      currentPage: 1,
      hasPageQuery: false,
    };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    currentPage: clampPage(Number(params.get("page") ?? "1"), totalPages),
    hasPageQuery: params.has("page"),
  };
}

function clampPage(value: number, totalPages: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.min(totalPages, value));
}

function buildDiagnosisUrl(page: number) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/diagnosis?${query}` : "/diagnosis";
}

function syncUrl(page: number, mode: "push" | "replace") {
  if (typeof window === "undefined") {
    return;
  }

  const url = buildDiagnosisUrl(page);
  if (mode === "push") {
    window.history.pushState(null, "", url);
    return;
  }

  window.history.replaceState(null, "", url);
}
