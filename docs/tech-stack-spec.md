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
| アプリ基盤 | Next.js `16.2.1` | App Router、metadata files、SSG（`output: 'export'`） |
| デプロイ | Netlify | 静的ホスティング、リライトルール |
| UI | React `19.2.4` | ページ描画、クライアント側診断フロー |
| 言語 | TypeScript | 型定義、ロジック実装 |
| スタイル | Tailwind CSS `4`（主）+ CSS Modules（補助） | Tailwind-first。CSS Module は擬似要素・多層背景等に限定 |
| 検証 | ESLint `9` | ソースコード lint |
| データ | JSON ファイル | 質問マスタ、タイプマスタ |
| 画像生成スキル | Codex built-in `image_gen` + Python 補助スクリプト | ちびキャラ生成、NanoBanana 派生処理、アセット生成 |

現行実装には DB、CMS、フォームライブラリ、状態管理ライブラリは入っていない。

デプロイ方式として Netlify の静的ホスティングを採用し、`next.config.ts` で `output: 'export'` を指定する。サーバーサイド API（`cookies()`, `headers()` 等）は使用しない。

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
| `/` | SSG | `getAllTypes()` と `getQuestionMaster()` をビルド時取得 |
| `/diagnosis` | SSG + Client Component | 本文は `DiagnosisFlow` |
| `/types/[typeCode]` | SSG | `generateStaticParams()` で 16 タイプ生成 |
| `/types/[typeCode]/[key]` | クライアントサイドレンダリング | 後述の §3.3 参照 |

### 3.3 共有結果ページの静的化方式

`/types/[typeCode]/[key]` は共有キー `[key]` の値が無限にあるため、ビルド時に全ページを生成できない。以下の方式で静的ホスティングと両立する。

1. Next.js の静的ビルドでは `/types/[typeCode]` までを生成する
2. Netlify のリライトルールで `/types/:typeCode/:key` を `/types/:typeCode/index.html` へ 200 リライトする
3. ページコンポーネントはクライアントサイドで URL パスから `key` セグメントを取得する
4. クライアントサイドで共有キーをデコードし、4 軸サマリ・ユーザー名を復元してレンダリングする
5. 「診断直後の本人か」の判定は `localStorage` で行う（§6.2 参照）

OGP メタデータはタイプ共通の静的 OGP を使用する。共有ページは `noindex` であり、canonical は `/types/[typeCode]` を指すため、SEO 上の影響はない。

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

`lib/post-diagnosis-result.ts` が `localStorage` を扱う。

- キー: `nazotype:post-diagnosis-result`
- 値: `{ typeCode, key, timestamp }`

クライアントサイドで shared page の URL（typeCode + key）と `localStorage` の値を照合し、「診断直後に到達した本人か」を判定する。

※ 現行コードは cookie ベース（`madamistype-post-diagnosis`）であり、`localStorage` への移行が必要。

## 7. 環境変数

### 7.1 アプリ本体

- `NEXT_PUBLIC_SITE_URL`（必須）
- `NEXT_PUBLIC_LINE_STAMP_URL`

絶対 URL の基準は `NEXT_PUBLIC_SITE_URL` を使用する。未設定時のフォールバックは `http://localhost:3000`。

Netlify の環境変数設定で `NEXT_PUBLIC_SITE_URL` を本番ドメインに設定すること。

※ 現行コードには Vercel 環境変数（`VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL`）へのフォールバックが残っており、削除が必要。

### 7.2 画像生成スキル

ちびキャラ基準画像スキルの主経路は Codex 内蔵 `image_gen` を使うため、API キーは必須ではない。

リポジトリ直下の `.env.character-images` は、NanoBanana を使う派生スキルや旧ユーティリティ向けに使う。

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

- ちびキャラ基準画像スキルの公開用正本は `public/types/{typeCode}_chibi.png`
- ちびキャラ基準画像スキルは必要に応じて `output/character-images/` に監査用出力を残す
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
- サーバーサイド API（`cookies()`, `headers()` 等）
- Vercel 固有の機能・環境変数
