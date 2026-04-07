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
    label: "Action / Decode",
    description: "情報を取りに行くか、その場で処理するかを見る軸。",
    defaultCode: "D",
    sides: [
      {
        code: "A",
        label: "行動型",
        word: "Action",
        shortDescription: "自ら動いて手がかりや情報を取りに行く",
      },
      {
        code: "D",
        label: "解読型",
        word: "Decode",
        shortDescription: "手元の材料から答えを読み解く",
      },
    ],
  },
  {
    axis: "A2",
    axisKey: "axis2",
    no: "02",
    label: "Local / Bird's-eye",
    description: "個別問題に深く入るか、全体構造を見渡すかを見る軸。",
    defaultCode: "L",
    sides: [
      {
        code: "L",
        label: "局所型",
        word: "Local",
        shortDescription: "目の前の1問に集中し、細部を捉える",
      },
      {
        code: "B",
        label: "俯瞰型",
        word: "Bird's-eye",
        shortDescription: "全体の構造や進捗を見渡す",
      },
    ],
  },
  {
    axis: "A3",
    axisKey: "axis3",
    no: "03",
    label: "Herald / Tactician",
    description: "情報を出す人か、流れをまとめる人かを見る軸。",
    defaultCode: "T",
    sides: [
      {
        code: "H",
        label: "発信型",
        word: "Herald",
        shortDescription: "発見や気づきをすぐ仲間に共有する",
      },
      {
        code: "T",
        label: "統率型",
        word: "Tactician",
        shortDescription: "情報を整理し、チームの流れをまとめる",
      },
    ],
  },
  {
    axis: "A4",
    axisKey: "axis4",
    no: "04",
    label: "Tenacity / Change",
    description: "今の問題に粘るか、別の手段に切り替えるかを見る軸。",
    defaultCode: "N",
    sides: [
      {
        code: "N",
        label: "熟考型",
        word: "Tenacity",
        shortDescription: "時間をかけて考え抜き、突破口を見つける",
      },
      {
        code: "C",
        label: "転換型",
        word: "Change",
        shortDescription: "状況を見て方針変更や切り替えを判断する",
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
