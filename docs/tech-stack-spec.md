# 謎解きタイプ診断 技術構成仕様書

## 1. 文書の目的

本書は現行ソースコードの技術構成、ルーティング、メタデータ、状態保持を整理する文書である。

関連文書:

- [specification.md](./specification.md)
- [diagnosis-logic-spec.md](./diagnosis-logic-spec.md)
- [frontend-directory-structure-spec.md](./frontend-directory-structure-spec.md)

## 2. 使用技術

| 区分 | 採用技術 | 用途 |
| --- | --- | --- |
| アプリ基盤 | Next.js `16.2.1` | App Router、metadata files、SSG/動的ルート |
| UI | React `19.2.4` | ページ描画、クライアント側診断フロー |
| 言語 | TypeScript | 型定義、ロジック実装 |
| スタイル | Tailwind CSS `4`（主）+ CSS Modules（補助） | Tailwind-first。CSS Module は擬似要素・多層背景等に限定 |
| 検証 | ESLint `9` | ソースコード lint |
| データ | JSON ファイル | 質問マスタ、タイプマスタ |
| 画像生成スキル | Python | NanoBanana 連携、アセット生成 |

現行実装には DB、CMS、フォームライブラリ、状態管理ライブラリは入っていない。

## 3. ルーティングとレンダリング

### 3.1 App Router 構成

```text
app/
  (marketing)/page.tsx
  (diagnosis)/diagnosis/page.tsx
  (types)/types/[typeCode]/page.tsx
  (types)/types/[typeCode]/[key]/page.tsx
```

Route Group `(marketing)`, `(diagnosis)`, `(types)` は URL に出ない。

### 3.2 各ルートの実装方式

| ルート | 実装方式 | 備考 |
| --- | --- | --- |
| `/` | Server Component | `getAllTypes()` と `getQuestionMaster()` を取得 |
| `/diagnosis` | Server Component + Client Component | 本文は `DiagnosisFlow` |
| `/types/[typeCode]` | SSG | `generateStaticParams()` で 16 タイプ生成 |
| `/types/[typeCode]/[key]` | 動的ルート | `cookies()` を使うため動的 |

## 4. データ読み込み

### 4.1 質問マスタ / タイプマスタ

- `data/question-master.json`
- `data/types/*.json`

`lib/data.ts` が `react` の `cache()` を使って読み込む。

主な関数:

- `getQuestionMaster()`
- `getAllTypeCodes()`
- `getAllTypes()`
- `getTypeByCode()`
- `getTypesByCodes()`
- `hasTypeImage()`
- `hasChibiImage()`

### 4.2 画像有無判定

`TypeArtwork` は `hasTypeImage()` を使い、配信用画像がなければプレースホルダーへフォールバックする。

## 5. メタデータ / SEO

### 5.1 ルート共通 metadata

`app/layout.tsx` で次を定義する。

- `metadataBase`
- title template
- description
- keywords
- Open Graph
- Twitter Card
- Google verification
- viewport themeColor

### 5.2 ページ別 metadata

- `/`: canonical `/`
- `/diagnosis`: `robots.index = false`
- `/types/[typeCode]`: `generateMetadata()`
- `/types/[typeCode]/[key]`: `generateMetadata()`、`robots.index = false`、canonical は公開ページ

### 5.3 JSON-LD

`lib/json-ld.ts` で生成する。

- トップページ: `WebSite`
- タイプページ系: `WebPage`

shared page でも、JSON-LD の URL は公開ページ `/types/[typeCode]` を基準にしている。

### 5.4 サイト補助ファイル

- `app/sitemap.ts`
- `app/robots.ts`
- `app/manifest.ts`

`manifest.ts` は `public/favicons/manifest.json` を読み込んで返す。

## 6. クライアント側状態保持

### 6.1 診断途中状態

`lib/draft-storage.ts` が `localStorage` を扱う。

- キー: `nazotype:diagnosis-draft:v1`
- 保存値: `userName`, `answers`, `currentPage`, `updatedAt`

※ 現行コードのキーは `madamistype:diagnosis-draft:v1` であり、実装変更時に移行する。

### 6.2 診断直後判定

`lib/post-diagnosis-result.ts` が cookie を扱う。

- Cookie 名: `nazotype-post-diagnosis`
- 値: `${typeCode}:${key}`
- Path: `/types/${typeCode}/${key}`

※ 現行コードの Cookie 名は `madamistype-post-diagnosis` であり、実装変更時に移行する。

この cookie によって、shared page で「診断直後に到達した本人か」を判定している。

## 7. 環境変数

### 7.1 アプリ本体

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_LINE_STAMP_URL`

絶対 URL の基準は次の優先順で決まる。

- `NEXT_PUBLIC_SITE_URL`
- Vercel 環境変数 `VERCEL_PROJECT_PRODUCTION_URL` または `VERCEL_URL`
- `http://localhost:3000`

### 7.2 画像生成スキル

リポジトリ直下の `.env.character-images` を読み込む。

- `NANOBANANA_API_KEY`
- `NANOBANANA_API_BASE`
- `NANOBANANA_REFERENCE_BASE_URL`

## 8. アセット運用

### 8.1 アプリ本体が参照するアセット

- `public/main-ogp.png`
- `public/types/{typeCode}.png`
- `public/types/{typeCode}_chibi.png`
- `public/types/{typeCode}-ogp.png`
- `public/favicons/*`

### 8.2 画像生成スキルの出力

- キャラクター画像スキルは `output/character-images/` に作業出力する
- タイプ別 OGP スキルは `output/type-ogp/` に作業出力し、`--publish` 時は `public/ogp/types/` にコピーする

補足:

- アプリ本体のタイプ別 OGP 参照先は `public/types/{typeCode}-ogp.png`
- OGP スキルの publish 先は現状そのままではアプリ本体に接続されていない

## 9. 現行実装に含まれないもの

- DB 永続化
- API 経由の診断保存
- Headless CMS
- `next/og` による request-time OGP 生成
- React Hook Form / Zod
- Zustand / Redux などの状態管理ライブラリ
