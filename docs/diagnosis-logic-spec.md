# 謎解きタイプ診断 診断ロジック仕様書

## 1. 文書の目的

本書は、現行コードに基づいて質問集計、軸判定、共有キー生成までの診断ロジックを整理する。

対象:

- 質問マスタの前提
- 回答値の数値化
- 4 軸スコア計算
- 同点処理
- 16 タイプへの変換
- 4 軸サマリ
- 共有キー

## 2. 前提

### 2.1 設問構成

- 全 32 問
- 1 ページ 8 問
- 全 4 ページ
- 各軸 8 問ずつ

### 2.2 軸順

軸順は `data/question-master.json` の `meta.axisOrder` と `lib/axis.ts` に合わせる。

1. `A1`: 行動型 / 解読型
2. `A2`: 局所型 / 俯瞰型
3. `A3`: 発信型 / 統率型
4. `A4`: 熟考型 / 転換型

### 2.3 コード対応

| 軸 | 正方向 | 負方向 | 既定値 |
| --- | --- | --- | --- |
| `A1` | `A` = 行動型 | `D` = 解読型 | `D` |
| `A2` | `L` = 局所型 | `B` = 俯瞰型 | `L` |
| `A3` | `H` = 発信型 | `T` = 統率型 | `T` |
| `A4` | `N` = 熟考型 | `C` = 転換型 | `N` |

## 3. 質問マスタ

### 3.1 各質問の必須項目

- `questionId`
- `questionText`
- `axis`
- `direction`
- `displayOrder`
- `pageNo`
- `weight`
- `isActive`
- `tieBreakerPriority`

### 3.2 運用ルール

- 集計対象は `isActive = true` の設問のみ
- 現行マスタでは全問 `weight = 1.0`
- ページ表示は `pageNo` に従う
- `tieBreakerPriority` 未設定時は `0` とみなす

## 4. 回答値

### 4.1 画面上の選択肢

| ラベル | 値 |
| --- | --- |
| とてもそう思う | `5` |
| ややそう思う | `4` |
| どちらでもない | `3` |
| あまりそう思わない | `2` |
| まったくそう思わない | `1` |

### 4.2 内部変換

集計時は `-2` から `+2` の差分値へ変換する。

- `forward`: `answerValue - 3`
- `reverse`: `3 - answerValue`

| 回答 | `forward` | `reverse` |
| --- | --- | --- |
| `5` | `+2` | `-2` |
| `4` | `+1` | `-1` |
| `3` | `0` | `0` |
| `2` | `-1` | `+1` |
| `1` | `-2` | `+2` |

## 5. 4 軸スコア計算

軸スコアは次で求める。

```text
axisScore = Σ(delta × weight)
```

現行では `weight = 1.0` 固定のため、実質は `delta` の単純合計である。
各軸 8 問なので、理論上の範囲は `-16` から `+16`。

## 6. 軸の確定

### 6.1 通常判定

- `score > 0`: 正方向
- `score < 0`: 負方向
- `score = 0`: 同点処理へ進む

### 6.2 同点処理

同点時は `tieBreakerPriority` 降順で設問を見て、最初に `delta != 0` となる設問の向きで決める。

処理順:

1. 同軸の設問を `tieBreakerPriority` 降順で並べる
2. 回答済み設問だけを見る
3. `delta > 0` なら正方向
4. `delta < 0` なら負方向
5. 全設問が `0` の場合は軸既定値を使う

## 7. 診断結果オブジェクト

`calculateDiagnosisResult()` は以下を返す。

- `typeCode`
- `axisScores`
- `axisSummaries`

`typeCode` は 4 軸の `resolvedCode` を軸順に連結した 4 文字である。

例:

- `A1 = A`
- `A2 = L`
- `A3 = H`
- `A4 = N`
- 結果 `typeCode = ALHN`

## 8. 4 軸サマリ

各軸サマリは以下を持つ。

- `axis`
- `positiveLabel`
- `negativeLabel`
- `positiveCode`
- `negativeCode`
- `score`
- `positivePercent`
- `negativePercent`
- `resolvedCode`
- `resolvedLabel`

表示用パーセントは次で計算する。

```text
positivePercent = round(((score + 16) / 32) * 100)
negativePercent = 100 - positivePercent
```

最終値は `0` から `100` に clamp する。

## 9. ユーザー名の扱い

- 診断開始時と共有キー生成時に trim する
- 最大 10 文字に切り詰める
- 共有キー内部では UTF-8 バイト列として保持し、40 byte を上限にする

## 10. 共有キー

### 10.1 論理構造

共有キーはユーザー名と 4 軸トレンド状態だけを保持する。

```json
{
  "v": 3,
  "n": "ユーザー名",
  "t": [27, 14, 33, 8]
}
```

- `v`: バージョン
- `n`: 正規化済みユーザー名
- `t`: 4 軸ぶんの compact trend state

### 10.2 エンコード方式

- 共有キーは Base64URL
- 内部表現は `1 byte の名前長 + 名前 UTF-8 bytes + 3 byte の packed trend states`
- trend state は 4 軸ぶんの 6 bit 値を 24 bit に pack する

### 10.3 trend state の扱い

- 通常スコアは `score + 16` へ変換する
- `score = 0` のときだけ専用 state を使う
- `0` かつ正側確定は `33`
- `0` かつ負側確定は `16`

## 11. 結果表示ページでの復元

現行実装では専用の共有ページは持たず、`/types/[typeCode]/?s={shareKey}` で復元する。

復元手順:

1. `PostDiagnosisSection` が検索パラメータ `s` を読む
2. `decodeShareKey()` で payload を復元する
3. `expandShareKeyAxisSummaries()` で 4 軸サマリへ展開する
4. 同じ `typeCode` の直近診断結果が `localStorage` にあれば「診断直後」扱いにする
5. 診断直後なら `PostDiagnosisResultCard`、それ以外なら `TypeSignatureSection` を表示する

補足:

- `s` がない場合でも、同じ `typeCode` の直近診断結果が `localStorage` にあれば復元を試みる
- 現行コードでは share key の resolved code と URL の `typeCode` の整合性検証は行っていない

## 12. 実装ファイル

主要実装:

- `lib/diagnosis.ts`
- `lib/axis.ts`
- `lib/share-key.ts`
- `lib/draft-storage.ts`
- `lib/post-diagnosis-result.ts`
- `data/question-master.json`
- `components/diagnosis/diagnosis-flow/diagnosis-flow.tsx`
- `components/type/type-detail-page-content/post-diagnosis-section.tsx`

## 13. 検証観点

- 質問数が 32 問であること
- 各軸 8 問ずつであること
- `pageNo` が `1`〜`4` に収まること
- 同じ回答セットで同じ `typeCode` になること
- 同点時処理が決定的に動くこと
- `positivePercent` / `negativePercent` が `0`〜`100` に収まること
- 共有キーから 4 軸サマリが復元できること
