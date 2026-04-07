import type {
  AnswerValue,
  AnswersRecord,
  AxisCode,
  AxisSummary,
  DiagnosisResult,
  Question,
  QuestionMaster,
} from "@/lib/types";
import { AXIS_CONFIG } from "@/lib/axis";

export const ANSWER_OPTIONS: Array<{ label: string; value: AnswerValue }> = [
  { label: "とてもそう思う", value: 5 },
  { label: "ややそう思う", value: 4 },
  { label: "どちらでもない", value: 3 },
  { label: "あまりそう思わない", value: 2 },
  { label: "まったくそう思わない", value: 1 },
];

export function getQuestionsForPage(
  questionMaster: QuestionMaster,
  pageNo: number,
) {
  return questionMaster.questions.filter(
    (question) => question.isActive && question.pageNo === pageNo,
  );
}

export function getActiveQuestions(questionMaster: QuestionMaster) {
  return questionMaster.questions.filter((question) => question.isActive);
}

export function normalizeUserName(value: string) {
  return value.trim().slice(0, 10);
}

export function toAnswerValue(value: number | string | undefined | null) {
  const numeric = Number(value);
  if (numeric >= 1 && numeric <= 5) {
    return numeric as AnswerValue;
  }

  return undefined;
}

export function calculateDiagnosisResult(
  questionMaster: QuestionMaster,
  answers: AnswersRecord,
): DiagnosisResult {
  const activeQuestions = getActiveQuestions(questionMaster);
  const axisSummaries = questionMaster.meta.axisOrder.map((axis) => {
    const questions = activeQuestions.filter((question) => question.axis === axis);
    return calculateAxisSummary(axis, questions, answers);
  });

  const axisScores = axisSummaries.reduce<Record<AxisCode, number>>(
    (accumulator, summary) => {
      accumulator[summary.axis] = summary.score;
      return accumulator;
    },
    {
      A1: 0,
      A2: 0,
      A3: 0,
      A4: 0,
    },
  );

  return {
    typeCode: axisSummaries.map((summary) => summary.resolvedCode).join(""),
    axisScores,
    axisSummaries,
  };
}

export function getAxisConfig(axis: AxisCode) {
  return AXIS_CONFIG[axis];
}

function calculateAxisSummary(
  axis: AxisCode,
  questions: Question[],
  answers: AnswersRecord,
): AxisSummary {
  const config = AXIS_CONFIG[axis];
  const score = questions.reduce((sum, question) => {
    const answerValue = answers[question.questionId];
    if (!answerValue) {
      return sum;
    }

    return sum + getQuestionDelta(question.direction, answerValue) * question.weight;
  }, 0);

  const resolvedCode = resolveAxisCode(axis, score, questions, answers);
  const resolvedLabel =
    resolvedCode === config.positiveCode
      ? config.positiveLabel
      : config.negativeLabel;
  const positivePercent = Math.round(((score + 16) / 32) * 100);
  const negativePercent = 100 - positivePercent;

  return {
    axis,
    positiveLabel: config.positiveLabel,
    negativeLabel: config.negativeLabel,
    positiveCode: config.positiveCode,
    negativeCode: config.negativeCode,
    score,
    positivePercent: clampPercent(positivePercent),
    negativePercent: clampPercent(negativePercent),
    resolvedCode,
    resolvedLabel,
  };
}

function resolveAxisCode(
  axis: AxisCode,
  score: number,
  questions: Question[],
  answers: AnswersRecord,
) {
  const config = AXIS_CONFIG[axis];

  if (score > 0) {
    return config.positiveCode;
  }

  if (score < 0) {
    return config.negativeCode;
  }

  const prioritizedQuestions = [...questions].sort(
    (left, right) =>
      (right.tieBreakerPriority ?? 0) - (left.tieBreakerPriority ?? 0),
  );

  for (const question of prioritizedQuestions) {
    const answerValue = answers[question.questionId];
    if (!answerValue) {
      continue;
    }

    const delta = getQuestionDelta(question.direction, answerValue);

    if (delta > 0) {
      return config.positiveCode;
    }

    if (delta < 0) {
      return config.negativeCode;
    }
  }

  return config.defaultCode;
}

function getQuestionDelta(direction: Question["direction"], answerValue: AnswerValue) {
  if (direction === "forward") {
    return answerValue - 3;
  }

  return 3 - answerValue;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}
