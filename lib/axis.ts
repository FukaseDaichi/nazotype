import type { AxisCode, TypeData } from "@/lib/types";

export type AxisKey = keyof TypeData["axis"];

export type AxisLetterMeta = {
  letter: string;
  english: string;
};

export type AxisSideDefinition = {
  code: string;
  label: string;
  word: string;
  shortDescription: string;
};

export type AxisDefinition = {
  axis: AxisCode;
  axisKey: AxisKey;
  no: string;
  label: string;
  description: string;
  defaultCode: string;
  sides: readonly [AxisSideDefinition, AxisSideDefinition];
};

export type AxisConfig = {
  positiveCode: string;
  negativeCode: string;
  positiveLabel: string;
  negativeLabel: string;
  defaultCode: string;
};

export const AXIS_DEFINITIONS = [
  {
    axis: "A1",
    axisKey: "axis1",
    no: "01",
    label: "Talk / Observe",
    description: "会話で場を動かすか、観察で確度を上げるかを見る軸。",
    defaultCode: "O",
    sides: [
      {
        code: "T",
        label: "発言型",
        word: "Talk",
        shortDescription: "問いかけや整理で議論の口火を切る",
      },
      {
        code: "O",
        label: "観察型",
        word: "Observe",
        shortDescription: "言葉や表情のズレを拾って見極める",
      },
    ],
  },
  {
    axis: "A2",
    axisKey: "axis2",
    no: "02",
    label: "Fact / Reasoning",
    description: "証拠と整合を積むか、背景と意図を広く読むかを見る軸。",
    defaultCode: "F",
    sides: [
      {
        code: "F",
        label: "事実重視",
        word: "Fact",
        shortDescription: "証拠・時系列・発言の一致を足場にする",
      },
      {
        code: "R",
        label: "推理重視",
        word: "Reasoning",
        shortDescription: "動機や裏の意図、別筋の可能性を追う",
      },
    ],
  },
  {
    axis: "A3",
    axisKey: "axis3",
    no: "03",
    label: "Logic / Emotion",
    description: "筋道で詰めるか、関係性や温度感で読むかを見る軸。",
    defaultCode: "L",
    sides: [
      {
        code: "L",
        label: "論理派",
        word: "Logic",
        shortDescription: "合理性と説明の一貫性で判断する",
      },
      {
        code: "E",
        label: "感情派",
        word: "Emotion",
        shortDescription: "気持ちの揺れや人間関係の空気を読む",
      },
    ],
  },
  {
    axis: "A4",
    axisKey: "axis4",
    no: "04",
    label: "Plan / Improvisation",
    description: "進行を整えるか、その場で切り替えるかを見る軸。",
    defaultCode: "P",
    sides: [
      {
        code: "P",
        label: "計画型",
        word: "Plan",
        shortDescription: "順序立てて論点と確認ポイントを整理する",
      },
      {
        code: "I",
        label: "即興型",
        word: "Improvisation",
        shortDescription: "局面ごとに動き方を変えて柔軟に立ち回る",
      },
    ],
  },
] as const satisfies readonly AxisDefinition[];

export const AXIS_CONFIG = AXIS_DEFINITIONS.reduce<Record<AxisCode, AxisConfig>>(
  (accumulator, definition) => {
    const [positiveSide, negativeSide] = definition.sides;

    accumulator[definition.axis] = {
      positiveCode: positiveSide.code,
      negativeCode: negativeSide.code,
      positiveLabel: positiveSide.label,
      negativeLabel: negativeSide.label,
      defaultCode: definition.defaultCode,
    };

    return accumulator;
  },
  {} as Record<AxisCode, AxisConfig>,
);

export const AXIS_LETTER_MAP = AXIS_DEFINITIONS.reduce<
  Record<string, AxisLetterMeta>
>((accumulator, definition) => {
  for (const side of definition.sides) {
    accumulator[side.label] = {
      letter: side.code,
      english: side.word,
    };
  }

  return accumulator;
}, {});
