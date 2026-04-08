"use client";

import {
  Bebas_Neue,
  IBM_Plex_Mono,
  Klee_One,
  Noto_Serif_JP,
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
import { writePostDiagnosisResult } from "@/lib/post-diagnosis-result";
import { createShareKey } from "@/lib/share-key";
import type { AnswerValue, AnswersRecord, QuestionMaster } from "@/lib/types";

import styles from "./diagnosis-flow.module.css";

const headingFont = Bebas_Neue({
  variable: "--nzt-font-heading",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const monoFont = IBM_Plex_Mono({
  variable: "--nzt-font-mono",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const serifFont = Noto_Serif_JP({
  variable: "--nzt-font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

const noteFont = Klee_One({
  variable: "--nzt-font-note",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  preload: false,
});

const fontVars = `${headingFont.variable} ${monoFont.variable} ${serifFont.variable} ${noteFont.variable}`;

type DiagnosisFlowProps = {
  questionMaster: QuestionMaster;
};

type LocationState = {
  currentPage: number;
  hasPageQuery: boolean;
};

function getScaleButtonClass(value: number, selected: number | undefined) {
  const isSelected = selected === value;

  switch (value) {
    case 1:
      return isSelected
        ? `border-cyan-500 bg-cyan-500 text-white scale-110 ${styles.scaleGlow1}`
        : "border-cyan-500 text-cyan-500 hover:bg-cyan-500/10";
    case 2:
      return isSelected
        ? `border-cyan-400/60 bg-cyan-400 text-midnight-900 scale-110 ${styles.scaleGlow2}`
        : "border-cyan-400/60 text-cyan-400/80 hover:bg-cyan-400/10";
    case 3:
      return isSelected
        ? "border-midnight-500 bg-midnight-500 text-white scale-110"
        : "border-midnight-500 text-midnight-500 hover:bg-midnight-500/10";
    case 4:
      return isSelected
        ? `border-amber-400/60 bg-amber-400 text-midnight-900 scale-110 ${styles.scaleGlow4}`
        : "border-amber-400/60 text-amber-400/80 hover:bg-amber-400/10";
    case 5:
      return isSelected
        ? `border-amber-500 bg-amber-500 text-white scale-110 ${styles.scaleGlow5}`
        : "border-amber-500 text-amber-500 hover:bg-amber-500/10";
    default:
      return "border-midnight-600 text-[--color-text-muted]";
  }
}

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
  const answeredCount = activeQuestions.filter(
    (question) => answers[question.questionId],
  ).length;
  const currentPageAnsweredCount = pageQuestions.filter(
    (question) => answers[question.questionId],
  ).length;
  const progressPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

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
    writePostDiagnosisResult(result.typeCode, key);
    router.push(`/types/${result.typeCode}/${key}`);
  }

  /* ── Loading state ── */
  if (!isHydrated) {
    return (
      <main id="main-content" className={`${fontVars} min-h-dvh`}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className={styles.spinner} aria-hidden="true" />
            <p className="font-mono text-xs tracking-widest uppercase text-[--color-text-muted]">
              Preparing
            </p>
            <h1 className="font-serif text-xl font-bold text-[--color-text]">
              診断の準備をしています
            </h1>
            <p className="text-sm text-[--color-text-muted]">
              前回の保存内容と表示ページを確認しています。
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ── No username state ── */
  if (!userName) {
    return (
      <main id="main-content" className={`${fontVars} min-h-dvh`}>
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="rounded-xl border border-midnight-600 bg-midnight-800 p-8 flex flex-col gap-4">
            <p className="font-mono text-xs tracking-widest uppercase text-[--color-text-muted]">
              Diagnosis
            </p>
            <h1 className="font-serif text-xl font-bold text-[--color-text]">
              まずはお名前を入れて診断を始めます
            </h1>
            <p className="text-sm text-[--color-text-muted]">
              このページを直接開いた場合は、トップページの開始フォームから進んでください。
            </p>
            <Link
              href="/"
              prefetch={false}
              className="inline-flex items-center justify-center min-h-[52px] rounded-lg px-8 py-3 bg-coral-500 text-white font-bold text-base shadow-sm hover:bg-coral-600 hover:-translate-y-0.5 transition-all"
            >
              トップページへ戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ── Submitting state ── */
  if (isSubmitting) {
    return (
      <main id="main-content" className={`${fontVars} min-h-dvh`}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className={styles.spinner} aria-hidden="true" />
            <p className="font-mono text-xs tracking-widest uppercase text-[--color-text-muted]">
              Calculating
            </p>
            <h1 className="font-serif text-xl font-bold text-[--color-text]">
              診断結果を計算しています
            </h1>
            <p className="text-sm text-[--color-text-muted]">
              あなたの回答を4軸の記録にまとめています。
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ── Main diagnosis flow ── */
  return (
    <main id="main-content" className={`${fontVars} min-h-dvh`}>
      {/* Progress Header - sticky */}
      <header className="sticky top-0 z-40 bg-midnight-900/95 backdrop-blur-sm border-b border-midnight-600">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-mono text-[--color-text-muted]">
              Page {currentPage} / {totalPages}
            </span>
            <span className="text-amber-400 font-bold text-sm">
              謎解きタイプ診断
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1 w-full bg-midnight-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1
            ref={pageHeadingRef}
            tabIndex={-1}
            className="font-heading text-2xl text-amber-400 outline-none"
          >
            ページ {currentPage} / {totalPages}
          </h1>
          <p className="text-sm text-[--color-text-muted] mt-1">
            直感で答えてください
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-[--color-text-muted]">
            <span aria-live="polite">
              回答済み {answeredCount} / {totalQuestions}
            </span>
            <span>
              このページ {currentPageAnsweredCount} / {pageQuestions.length}
            </span>
          </div>
        </div>

        {restoreNotice ? (
          <p
            className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400"
            role="status"
          >
            {restoreNotice}
          </p>
        ) : null}

        {/* Questions */}
        <div className="space-y-4">
          {pageQuestions.map((question) => {
            const selectedValue = answers[question.questionId];

            return (
              <fieldset
                key={question.questionId}
                className="rounded-xl border border-midnight-600 bg-midnight-800 p-5"
              >
                <legend
                  ref={(element) => {
                    questionRefs.current[question.questionId] = element;
                  }}
                  tabIndex={-1}
                  className="w-full mb-1 outline-none"
                >
                  <span className="font-mono text-xs text-amber-400 font-bold">
                    Q{String(question.displayOrder).padStart(2, "0")}
                  </span>
                  <span className="block text-base leading-relaxed mt-2">
                    {question.questionText}
                  </span>
                </legend>

                {/* 5-point scale */}
                <div className="mt-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-[--color-text-muted] shrink-0 w-16 text-right">
                      そう思わない
                    </span>
                    <div className="flex gap-2">
                      {ANSWER_OPTIONS.slice()
                        .reverse()
                        .map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={`w-11 h-11 rounded-full border-2 font-bold text-sm transition-all duration-150 cursor-pointer ${getScaleButtonClass(option.value, selectedValue)}`}
                            onClick={() =>
                              handleAnswerChange(
                                question.questionId,
                                option.value,
                              )
                            }
                            aria-label={option.label}
                          >
                            {option.value}
                          </button>
                        ))}
                    </div>
                    <span className="text-xs text-[--color-text-muted] shrink-0 w-16">
                      そう思う
                    </span>
                  </div>
                </div>
              </fieldset>
            );
          })}
        </div>

        {validationError ? (
          <p
            className="mt-4 rounded-lg border border-coral-500/30 bg-coral-500/10 px-4 py-3 text-sm text-coral-500"
            role="alert"
          >
            {validationError}
          </p>
        ) : null}

        {/* Navigation */}
        <div className="mt-8 mb-12 flex flex-col items-center gap-3">
          {currentPage > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="text-cyan-400 text-sm hover:text-cyan-300 hover:underline underline-offset-4 transition-colors cursor-pointer"
            >
              前のページへ
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="w-full sm:w-auto min-w-[280px] min-h-[52px] rounded-lg px-8 py-3 bg-coral-500 text-white font-bold text-base shadow-sm hover:bg-coral-600 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            {currentPage === totalPages
              ? "診断結果を見る →"
              : "次のページへ →"}
          </button>
        </div>
      </div>
    </main>
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
