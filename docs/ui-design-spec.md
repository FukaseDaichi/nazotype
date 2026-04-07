# 謎解きタイプ診断 UI デザイン仕様書

## 1. 文書の目的

本書は、現行 UI 実装をもとに画面の見え方と表現ルールを整理した文書である。
理想案ではなく、実際にコード上で描画される見た目を基準にまとめる。

参照:

- [specification.md](./specification.md)
- [frontend-directory-structure-spec.md](./frontend-directory-structure-spec.md)

※ 現行 UI はマダミスタイプ診断のフォークであり、謎解きテーマに合わせたビジュアルリニューアルは未着手。

## 2. デザインコンセプト

現行 UI の核は、やわらかい紙色と証拠書類感を組み合わせた「ケースファイル」表現である。

特徴:

- アイボリー基調の背景
- ラジアルグラデーションとグリッドの重ね合わせ
- ケースファイル、封筒、被疑者カードを思わせるレイアウト
- 英字見出しと日本語本文を混ぜた雑誌的な見せ方
- 黒一色ではなく、紙色と rose / teal を差し色に使う構成

※ 謎解きタイプ診断としてのビジュアルテーマは別途検討する。リアル脱出ゲーム・謎解きの世界観に合ったデザインへ更新する予定。

## 3. カラー

`app/globals.css` のトークンを正とする。

主要色:

- 背景: `#f7f2ed`
- 表面: `#fff9f6`
- 文字: `#2b2430`
- 補助文字: `#6d6471`
- 主ボタン: `#d85e72`
- 主ボタン hover: `#c84f64`
- 補助アクセント: `#2f6f74`
- 補助ボタン: `#7fa8c9`

運用ルール:

- ページ全体は明るいアイボリー基調
- 主アクションは rose 系
- フォーカスや補助アクションは teal / blue 系
- 診断フローの 5 段階スケールでは肯定側を warm、否定側を teal で分ける

## 4. タイポグラフィ

### 4.1 ルートフォント

`app/layout.tsx` で読み込む。

- `Noto Sans JP`
- `Shippori Mincho B1`

### 4.2 画面固有フォント

トップ / 診断 / タイプ詳細では次を追加で使う。

- `Bebas Neue`
- `Special Elite`
- `Noto Serif JP`
- `Caveat`

### 4.3 使い分け

- 大見出し: `Bebas Neue`
- 英字ラベル / メタ情報: `Special Elite`
- 日本語本文: `Noto Serif JP` または `Noto Sans JP`
- 手書き注記: `Caveat`

## 5. 共通 UI 要素

### 5.1 共通クラス

`app/globals.css` に以下の共通部品がある。

- `surface-panel`
- `page-shell`
- `primary-button`
- `secondary-button`
- `text-field`
- `eyebrow`
- `section-title`
- `illustration-frame`

### 5.2 背景表現

`body` は次の重ね合わせで構成する。

- 2 つのラジアルグラデーション
- 縦方向の線形グラデーション
- 固定グリッド風オーバーレイ

### 5.3 アクセシビリティ

- `skip-link` を配置する
- `:focus-visible` を明示する
- `prefers-reduced-motion: reduce` でアニメーションを抑制する

## 6. 画面別ルール

### 6.1 トップページ

主な構成:

1. マストヘッド
2. ヒーローエリア
3. プレビュータイプのサイドカード
4. 診断開始フォーム
5. 4 軸解説
6. 注目タイプ
7. 16 タイプ一覧
8. フッター

ヒーローの特徴:

- 大きな面を使う
- `32 Questions / 4 Pages / 16 Types / 4 Axes` を統計バッジで見せる
- 診断開始 CTA は同一ページ内アンカー `#start`
- サイドカードにはヒーロータイプの画像・タイプ名・タグラインを置く

### 6.2 診断フロー

主な構成:

1. ヘッダーパネル
2. 進捗バー
3. 質問パネル
4. 5 段階のペン先アイコン UI
5. 前へ / 次へボタン

現行 UI の要点:

- ローディング状態と名前未入力状態に専用ステータス画面がある
- 1 画面 8 問
- 各質問は `fieldset` + `legend`
- 未回答時はエラー表示し、最初の未回答設問へフォーカスする

### 6.3 公開タイプ詳細ページ

主な構成:

1. ヘッダー
2. ヒーロー
3. 強み / 注意点
4. 詳しい見立て
5. 担いやすい役割
6. 相性
7. フッター

ヒーローの要素:

- タイプ画像
- チビ画像があれば補助表示
- タイプコード / タイプ名 / タグライン / summary
- CTA は「自分でも診断する」

補足:

- 公開ページでは `Type Signature` セクションを通常表示しない
- 公開ページでは共有パネルも表示しない

### 6.4 共有結果ページ

公開タイプ詳細ページと本文構成を共有しつつ、次が追加される。

- 見出しが「[ユーザー名]さんの診断結果」になる
- `Type Signature` セクションを表示する
- 共有パネルを表示する
- 結果 URL コピーを提供する

ヒーロー下の差分:

- 診断直後の cookie が一致する場合だけ「共有」ボタンを出す
- それ以外の shared page は「自分でも診断する」を出す

## 7. コンポーネント別の役割

### 7.1 ホーム

- `HomeHeroSection`: ヒーロー、統計、開始導線
- `AxisCompositionSection`: 4 軸説明
- `FeaturedTypesSection`: 注目タイプ
- `AllTypesSection`: トップページ内の 16 タイプ一覧

### 7.2 診断

- `StartDiagnosisForm`: 名前入力
- `DiagnosisFlow`: 診断 UI 全体

### 7.3 タイプ詳細

- `TypeArtwork`: 通常画像またはプレースホルダー
- `TypeDetailHeroSection`: ヒーロー
- `TypeSignatureSection`: 共有結果の 4 軸可視化
- `TypeListSection`: 強み / 注意点 / 担いやすい役割
- `TypeCompatibilitySection`: 相性
- `TypeSharePanel`: 共有パネル

## 8. 画像ルール

- 通常画像: `public/types/{typeCode}.png`
- チビ画像: `public/types/{typeCode}_chibi.png`
- OGP: `public/types/{typeCode}-ogp.png`
- 画像未配置時は `TypeArtwork` がプレースホルダーを描画する

## 9. レスポンシブ方針

- モバイル優先
- トップページは大画面で非対称レイアウト
- 診断フローは常に 1 カラム中心
- タイプページは 1 カラムをベースに一部だけ 2 カラムにする

## 10. 現行仕様として含めないもの

- 専用 `/types` 一覧ページ
- `next/og` 前提の動的 OGP レイアウト
- motion ライブラリ依存の演出
