export type AxisCode = "A1" | "A2" | "A3" | "A4";
export type Direction = "forward" | "reverse";
export type AnswerValue = 1 | 2 | 3 | 4 | 5;
export type TypeCode = string;

export type Question = {
  questionId: string;
  questionText: string;
  axis: AxisCode;
  direction: Direction;
  displayOrder: number;
  pageNo: number;
  weight: number;
  isActive: boolean;
  tieBreakerPriority?: number;
};

export type QuestionMaster = {
  meta: {
    title: string;
    version: string;
    questionCount: number;
    pageCount: number;
    questionsPerPage: number;
    axisOrder: AxisCode[];
  };
  questions: Question[];
};

export type Compatibility = {
  summary: string;
  goodWithTypeCodes?: string[];
  goodWithDescription?: string;
};

export type VisualProfile = {
  genderPresentation: string;
  ageRange: string;
  characterArchetype: string;
  characterDescription: string;
  outfitDescription: string;
  colorPalette: string[];
  pose: string;
  expression: string;
  background?: string;
};

export type PromptPair = {
  ja: string;
  en: string;
};

export type TypeData = {
  typeId: string;
  typeCode: TypeCode;
  typeName: string;
  tagline: string;
  summary: string;
  detailDescription: string;
  strengths: string[];
  cautions: string[];
  recommendedPlaystyle: string[];
  suitableRoles: string[];
  compatibility: Compatibility;
  shareText: string;
  axis: {
    axis1: string;
    axis2: string;
    axis3: string;
    axis4: string;
  };
  visualProfile: VisualProfile;
  imagePrompt: PromptPair;
  negativePrompt: PromptPair;
};

export type AnswersRecord = Partial<Record<string, AnswerValue>>;

export type DiagnosisDraft = {
  userName: string;
  answers: AnswersRecord;
  currentPage: number;
  updatedAt: string;
};

export type ShareKeyTrendStates = [number, number, number, number];

export type ShareKeyPayloadV3 = {
  v: 3;
  n: string;
  t: ShareKeyTrendStates;
};

export type ShareKeyPayload = ShareKeyPayloadV3;

export type AxisSummary = {
  axis: AxisCode;
  positiveLabel: string;
  negativeLabel: string;
  positiveCode: string;
  negativeCode: string;
  score: number;
  positivePercent: number;
  negativePercent: number;
  resolvedCode: string;
  resolvedLabel: string;
};

export type DiagnosisResult = {
  typeCode: string;
  axisScores: Record<AxisCode, number>;
  axisSummaries: AxisSummary[];
};
