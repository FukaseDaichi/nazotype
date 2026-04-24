# 謎解きタイプ診断 フロントエンド構成仕様書

## 1. 文書の目的

本書は、現行ソースコードのディレクトリ構成と責務分離を整理するための文書である。
移行計画ではなく、現在このリポジトリに存在する構成だけを扱う。

参照:

- [specification.md](./specification.md)
- [tech-stack-spec.md](./tech-stack-spec.md)

## 2. 現行ディレクトリ構成

```text
app/
  (marketing)/
    page.tsx
  (diagnosis)/
    diagnosis/
      page.tsx
  (special)/
    secret/
      page.tsx
  (types)/
    types/
      [typeCode]/
        page.tsx
  apple-icon.png
  favicon.ico
  globals.css
  layout.tsx
  manifest.ts
  not-found.module.css
  not-found.tsx
  robots.ts
  sitemap.ts

components/
  diagnosis/
    diagnosis-flow/
    start-diagnosis-form/
  home/
    axis-composition-section/
    home-page/
  layout/
    line-stamp-floating-promo/
    site-footer/
  secret/
  type/
    share-actions/
    type-artwork/
    type-detail-page-content/
    type-ogp-link-card/
  ui/
    ambient-orbs.tsx
    particles.tsx
    reveal-on-scroll.tsx

data/
  question-master.json
  special-results/*.json
  types/*.json
  line-stamps/*.json
  line-stamp-images/*
  visual_prompts.md

docs/
  specification.md
  diagnosis-logic-spec.md
  type-design-spec.md
  tech-stack-spec.md
  frontend-directory-structure-spec.md
  character-image-skill-spec.md
  type-ogp-image-spec.md
  line-stamp-skill-spec.md
  line-stamp-promo-component-design.md
  twilight-secret-result-spec.md
  current-issues.md
  nazo.md

lib/
  axis.ts
  data.ts
  diagnosis.ts
  draft-storage.ts
  json-ld.ts
  line-stamp-store-visit.ts
  post-diagnosis-result.ts
  secret-result.ts
  share-key.ts
  site.ts
  types.ts

public/
  main-ogp.png
  line-stamp-main.png
  favicons/*
  types/*

skills/
  nazotype-chibi-character-images/
  madamistype-type-ogp-images/
  madamistype-line-stamp-prompts/
  madamistype-line-stamp-images/

output/
  character-images/
  line-stamp-prompts/
  line-stamp-images/
  main-ogp/
  type-ogp/
  backup_20260421/

out/
  ...
```

補足:

- `out/` は静的エクスポートの生成物であり、アプリ本体のソースではない
- 診断結果表示は `/types/[typeCode]/` に `?s=` を付けて行うため、`[key]` ルートは存在しない
- 隠し結果は通常タイプとは別に `components/secret/` でヒーローと共有表示を持ち、本文の一部だけ `components/type/type-detail-page-content/` を再利用する

## 3. 各ディレクトリの責務

### 3.1 `app/`

責務:

- 公開 URL の定義
- `params` の受け取り
- `generateStaticParams()` / `generateMetadata()` の定義
- `notFound()` 判定
- 必要データの読み込み
- 画面コンポーネントへの props 受け渡し

### 3.2 `components/`

責務:

- 画面本文の組み立て
- UI セクション単位の責務分割
- CSS Module を伴う見た目
- クライアント状態や検索パラメータを扱う部品

主な分類:

- `home`
- `diagnosis`
- `secret`
- `type`
- `layout`
- `ui`

### 3.3 `lib/`

責務:

- 診断ロジック
- 軸定義
- マスタ読み込み
- URL / metadata 補助
- 共有キー
- `localStorage` ラッパー
- 隠し結果の合言葉判定
- LINE STORE 訪問済み状態
- JSON-LD 生成

### 3.4 `data/`

責務:

- 質問マスタ
- 16 タイプ定義
- LINE スタンプ用セット定義
- スタンプ納品物や補助資料の保持

### 3.5 `public/`

責務:

- サイト配信用の静的アセット
- favicon / manifest 用アセット
- タイプ画像 / チビ画像 / OGP
- LINE スタンプ導線画像

### 3.6 `skills/`

責務:

- `image_gen` や fal.ai を使う生成スキル
- スキル固有の CLI、補助スクリプト、reference 文書

### 3.7 `output/`

責務:

- 画像生成スキルの作業出力
- 中間成果物
- レポートや監査用アーティファクト

アプリ本体は通常ここを参照しない。

## 4. Route Group の使い方

現行実装では Route Group を「URL を変えずに見通しを良くするため」に使う。

- `(marketing)`: `/`
- `(diagnosis)`: `/diagnosis`
- `(special)`: `/secret/`
- `(types)`: `/types/[typeCode]/`

診断結果の表示状態は Route Group や動的セグメントではなく、検索パラメータ `?s=` と `localStorage` で切り替える。

## 5. 依存方向

基本ルール:

- `app` → `components`, `lib`, `data` は可
- `components` → `lib` は可
- `components` は必要に応じて `components` の別ドメイン配下を参照する
- `lib` は UI 実装に依存しない
- `data` は静的 JSON / 資料を置く

## 6. 現行構成の注意点

- `/types` 一覧ルートは存在しない
- 診断結果表示は `/types/[typeCode]/?s={shareKey}` で行う
- 隠し特別結果は `/secret/` で表示する
- `type-detail-page-content` 配下には `public` / `shared` の両モードを扱う props があるが、公開ルートとして使っているのは `public` モードのページ 1 本だけである
- OGP 生成スキルの publish 先と、アプリ本体の配信用 OGP 参照先は別である
- LINE スタンプ右下ポップ導線は `components/layout/line-stamp-floating-promo/` にあり、`/` と `/types/[typeCode]/` のページ本文から明示的に差し込む
- `docs/current-issues.md` に、現行コードを正としたうえでの不具合・整理課題を集約する
