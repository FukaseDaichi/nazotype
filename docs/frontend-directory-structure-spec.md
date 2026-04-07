# 謎解きタイプ診断 フロントエンド構成仕様書

## 1. 文書の目的

本書は現行ソースコードのディレクトリ構成と責務分離を整理するための文書である。
過去の移行計画ではなく、現在存在する構成だけを説明する。

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
  (types)/
    types/
      [typeCode]/
        page.tsx
        [key]/
          page.tsx
  apple-icon.png
  favicon.ico
  globals.css
  layout.tsx
  manifest.ts
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
    site-footer/
  type/
    share-actions/
    type-artwork/
    type-detail-page-content/

data/
  question-master.json
  types/*.json

docs/
  specification.md
  diagnosis-logic-spec.md
  type-design-spec.md
  tech-stack-spec.md
  ui-design-spec.md
  frontend-directory-structure-spec.md
  character-image-skill-spec.md
  type-ogp-image-spec.md
  line-stamp-skill-spec.md

lib/
  axis.ts
  data.ts
  diagnosis.ts
  draft-storage.ts
  json-ld.ts
  post-diagnosis-result.ts
  share-key.ts
  site.ts
  types.ts

public/
  main-ogp.png
  favicons/*
  types/*

skills/
  madamistype-character-images/
  madamistype-type-ogp-images/

output/
  character-images/
  type-ogp/
```

※ `skills/` 配下のディレクトリ名は現行コードのまま。謎解きタイプ診断用にリネームする際は `nazotype-character-images` / `nazotype-type-ogp-images` を想定する。

## 3. 各ディレクトリの責務

### 3.1 `app/`

責務:

- 公開 URL の定義
- `params` の受け取り
- `generateMetadata`
- `notFound()` 判定
- 必要データの読み込み
- 本文コンポーネントへの props 受け渡し

大きな JSX 本文は `components/` 側へ寄せる。

### 3.2 `components/`

責務:

- 実際の画面本文
- UI セクションの組み立て
- CSS Module を伴う見た目
- クライアント状態管理を持つ部品

ドメイン別の大分類:

- `home`
- `diagnosis`
- `type`
- `layout`

### 3.3 `lib/`

責務:

- 診断ロジック
- 軸定義
- マスタ読み込み
- 共有キー
- metadata / URL 補助
- `localStorage` / cookie のラッパー

### 3.4 `data/`

責務:

- 質問マスタ
- 16 タイプ定義

アプリ本体が読む静的データの正本を置く。

### 3.5 `public/`

責務:

- サイト配信用の静的アセット
- favicon / manifest 用アセット
- タイプ画像 / チビ画像 / OGP

### 3.6 `skills/`

責務:

- NanoBanana を使う画像生成スキル
- スキル固有の CLI、補助スクリプト、reference 文書

### 3.7 `output/`

責務:

- 画像生成スキルの作業出力
- 中間成果物、候補、メタデータ

アプリ本体は通常ここを参照しない。

## 4. Route Group の使い方

現行実装では Route Group を「URL を変えずに見通しを良くするため」に使う。

- `(marketing)`: `/`
- `(diagnosis)`: `/diagnosis`
- `(types)`: `/types/[typeCode]` と `/types/[typeCode]/[key]`

## 5. 依存方向

基本ルール:

- `app` → `components`, `lib`, `data` は可
- `components` → `lib` は可
- `components/home` → `components/type`, `components/layout` は可
- `lib` は UI 実装に依存しない
- `data` は純粋な静的 JSON とする

## 6. 現行構成の注意点

- `/types` 一覧ルートは存在しない
- shared page は cookie 利用のため動的ルートになる
- OGP 生成スキルの publish 先と、アプリ本体の配信用 OGP 参照先は別である
