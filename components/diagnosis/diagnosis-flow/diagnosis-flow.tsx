"use client";

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
import { getTypePublicPath } from "@/lib/site";
import type { AnswerValue, AnswersRecord, QuestionMaster } from "@/lib/types";

import styles from "./diagnosis-flow.module.css";

function getScaleButtonClass(value: number, selected: number | undefined) {
  const isSelected = selected === value;

  switch (value) {
    case 1:
      return isSelected
        ? `border-gold-400 bg-gold-400 text-mystery-800 scale-110 ${styles.scaleGlow1}`
        : "border-gold-400/60 text-gold-400 hover:bg-gold-400/10";
    case 2:
      return isSelected
        ? `border-gold-300/60 bg-gold-300 text-mystery-800 scale-110 ${styles.scaleGlow2}`
        : "border-gold-300/60 text-gold-300/80 hover:bg-gold-300/10";
    case 3:
      return isSelected
        ? "border-mystery-500 bg-mystery-500 text-paper-50 scale-110"
        : "border-mystery-500 text-mystery-500 hover:bg-mystery-500/10";
    case 4:
      return isSelected
        ? `border-paper-200/60 bg-paper-200 text-mystery-800 scale-110 ${styles.scaleGlow4}`
        : "border-paper-200/60 text-paper-200/80 hover:bg-paper-200/10";
    case 5:
      return isSelected
        ? `border-paper-300 bg-paper-300 text-paper-50 scale-110 ${styles.scaleGlow5}`
        : "border-paper-300 text-paper-300 hover:bg-paper-300/10";
    default:
      return "border-mystery-600 text-[--color-text-muted]";
  }
}

type DiagnosisFlowProps = {
  questionMaster: QuestionMaster;
};

type LocationState = {
  currentPage: number;
  hasPageQuery: boolean;
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
    router.push(
      `${getTypePublicPath(result.typeCode)}?s=${encodeURIComponent(key)}`,
    );
  }

  /* ── Loading state ── */
  if (!isHydrated) {
    return (
      <main id="main-content" className="min-h-dvh">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className={styles.spinner} aria-hidden="true" />
            <p className="font-mono text-xs tracking-widest uppercase text-paper-200">
              Preparing
            </p>
            <h1 className="text-xl font-bold text-paper-50">
              診断の準備をしています
            </h1>
            <p className="text-sm text-paper-200">
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
      <main id="main-content" className="min-h-dvh">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="border border-gold-400/20 bg-mystery-800/80 p-8 flex flex-col gap-4">
            <p className="font-mono text-xs tracking-widest uppercase text-paper-200">
              Diagnosis
            </p>
            <h1 className="text-xl font-bold text-paper-50">
              まずはお名前を入れて診断を始めます
            </h1>
            <p className="text-sm text-paper-200">
              このページを直接開いた場合は、トップページの開始フォームから進んでください。
            </p>
            <Link
              href="/"
              prefetch={false}
              className="inline-flex items-center justify-center min-h-[52px] px-8 py-3 bg-gold-400 text-mystery-800 font-bold text-base transition-all hover:opacity-90 active:scale-[0.98]"
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
      <main id="main-content" className="min-h-dvh">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className={styles.spinner} aria-hidden="true" />
            <p className="font-mono text-xs tracking-widest uppercase text-paper-200">
              Calculating
            </p>
            <h1 className="text-xl font-bold text-paper-50">
              診断結果を計算しています
            </h1>
            <p className="text-sm text-paper-200">
              あなたの回答を4軸の記録にまとめています。
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ── Main diagnosis flow ── */
  return (
    <main id="main-content" className="min-h-dvh">
      {/* Progress Header - sticky */}
      <header className="sticky top-0 z-40 bg-mystery-900/95 backdrop-blur-sm border-b border-gold-400/10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-mono text-paper-200">
              Page {currentPage} / {totalPages}
            </span>
            <span className="text-gold-400 font-bold text-sm">
              謎解きタイプ診断
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-[3px] w-full bg-mystery-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-400 to-gold-300 transition-all duration-500 ease-out"
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
            className="font-mono text-2xl text-gold-400 outline-none tracking-wider"
          >
            ページ {currentPage} / {totalPages}
          </h1>
          <p className="text-sm text-paper-200 mt-1">
            直感で答えてください
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-paper-200 font-mono">
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
            className="mb-4 border border-gold-400/30 bg-gold-400/10 px-4 py-3 text-sm text-gold-400"
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
                className="border border-gold-400/10 bg-mystery-800/60 backdrop-blur-sm p-5"
              >
                <legend
                  ref={(element) => {
                    questionRefs.current[question.questionId] = element;
                  }}
                  tabIndex={-1}
                  className="w-full mb-1 outline-none"
                >
                  <span className="font-mono text-xs text-gold-400 font-bold">
                    Q{String(question.displayOrder).padStart(2, "0")}
                  </span>
                  <span className="block text-base leading-relaxed mt-2">
                    {question.questionText}
                  </span>
                </legend>

                {/* 5-point scale */}
                <div className="mt-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-paper-200 shrink-0 w-16 text-right">
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
                    <span className="text-xs text-paper-200 shrink-0 w-16">
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
            className="mt-4 border border-rust-500/30 bg-rust-500/10 px-4 py-3 text-sm text-rust-400"
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
              className="text-gold-400 text-sm hover:text-gold-300 hover:underline underline-offset-4 transition-colors cursor-pointer"
            >
              前のページへ
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="w-full sm:w-auto min-w-[280px] min-h-[52px] px-8 py-3 bg-gradient-to-br from-gold-400 to-gold-500 text-mystery-800 font-bold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            {currentPage === totalPages
              ? "診断結果を見る \u2192"
              : "次のページへ \u2192"}
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
