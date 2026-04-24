# 現行コードの問題点・課題

## 1. 現在の状態

2026-04-24 時点で棚卸しした課題は、この更新で解消済み。
新しく見つかった問題は、本書に「未解決」として追記する。

未解決:

- なし

## 2. 解決済み

### 2.1 共有結果の傾向表示が旧軸名を参照していた

- 対象: `components/type/type-detail-page-content/type-signature-section.tsx`
- 対応: `lib/axis.ts` の `AXIS_DEFINITIONS` / `AXIS_LETTER_MAP` を参照する形へ変更
- 結果: `行動型 / 解読型 / 局所型 / 俯瞰型 / 発信型 / 統率型 / 熟考型 / 転換型` の現行 4 軸で表示される

### 2.2 共有キーと URL のタイプ整合性を検証していなかった

- 対象: `components/type/type-detail-page-content/post-diagnosis-state.ts`
- 対応: 共有キーから復元した 4 軸コードを連結し、URL の `typeCode` と一致しない場合は結果表示しないようにした
- 結果: 別タイプの `s` を付けた URL で、本文と軸サマリが混ざることを防ぐ

### 2.3 トップページで未使用の質問マスタを読み込んでいた

- 対象: `app/(marketing)/page.tsx`, `components/home/home-page/home-page.tsx`
- 対応: `getQuestionMaster()` の取得と `questionMaster` props を削除
- 結果: build 時の不要な読み込みと props 契約のノイズを削減

### 2.4 `sharedUserName` が表示されていなかった

- 対象: `components/type/type-detail-page-content/type-detail-hero-section.tsx`
- 対応: `mode="shared"` かつ `sharedUserName` がある場合、ヒーローのタイプ名下に `{name}さんの診断結果` を表示
- 結果: 既存 props と CSS が実際の表示に接続された

### 2.5 LINE スタンプ導線を明示的に非表示にできなかった

- 対象: `lib/site.ts`, `components/layout/line-stamp-floating-promo/line-stamp-floating-promo.tsx`
- 対応: `NEXT_PUBLIC_LINE_STAMP_URL` が空文字、`0`、`false`、`off`、`disabled`、`none` の場合は `LINE_STAMP_URL = null` にする
- 結果: 環境変数で LINE スタンプ導線を一時停止できる

### 2.6 未使用 export が残っていた

- 対象: `lib/post-diagnosis-result.ts`
- 対応: 未使用の `RECOMMENDATION_FEEDBACK_FORM_URL` を削除
- 結果: 使われていない導線情報を整理

### 2.7 配信対象やデータ配下に不要ファイルがあった

- 対象: `public/.DS_Store`, `public/types/.DS_Store`, `public/types/TWLT-ogp.original.png`, `data/.DS_Store`
- 対応: 不要ファイルを削除
- 結果: deploy 成果物やデータ棚卸しのノイズを削減

## 3. 継続検証タスク

- `npm run lint`
- `npm run build`
- `/types/[typeCode]/?s={shareKey}` で、診断直後表示と共有リンク再訪表示の両方を確認する
- 別タイプの URL に共有キーを付けた場合、結果表示が出ないことを確認する
- LINE スタンプ導線の展開、たたむ、閉じる、CTA クリック、非表示 env、ふりがな強調反映を確認する
- `/secret/` の合言葉直後表示、直接アクセス、共有 URL 再訪を確認する
