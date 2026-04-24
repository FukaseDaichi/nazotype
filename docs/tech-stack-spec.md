# 謎解きタイプ診断 技術構成仕様書

## 1. 文書の目的

本書は、現行ソースコードの技術構成、ルーティング、メタデータ、状態保持を整理する文書である。

関連文書:

- [specification.md](./specification.md)
- [diagnosis-logic-spec.md](./diagnosis-logic-spec.md)
- [frontend-directory-structure-spec.md](./frontend-directory-structure-spec.md)

## 2. 使用技術

| 区分 | 採用技術 | 用途 |
| --- | --- | --- |
| アプリ基盤 | Next.js `16.2.1` | App Router、metadata files、静的エクスポート |
| UI | React `19.2.4` | ページ描画、クライアント側診断フロー |
| 言語 | TypeScript | 型定義、ロジック実装 |
| スタイル | Tailwind CSS `4` + CSS Modules | ユーティリティ主体の実装と装飾補助 |
| 検証 | ESLint `9` | ソースコード lint |
| データ | JSON ファイル | 質問マスタ、タイプマスタ、隠し結果、LINE スタンプセット |
| 画像生成 | Codex built-in `image_gen` + Python 補助スクリプト | ちびキャラ生成、fal.ai 派生処理、アセット生成 |

現行実装には DB、CMS、フォームライブラリ、状態管理ライブラリは入っていない。

## 3. Next.js 設定

`next.config.ts` の現行設定:

- `output: "export"`
- `trailingSlash: true`
- `images.unoptimized = true`

このため:

- ページは静的エクスポート前提
- パスは末尾スラッシュ付きで配信する
- `next/image` は最適化サーバーなしで使う

## 4. ルーティングとレンダリング

### 4.1 App Router 構成

```text
app/
  (marketing)/page.tsx
  (diagnosis)/diagnosis/page.tsx
  (special)/secret/page.tsx
  (types)/types/[typeCode]/page.tsx
```

Route Group `(marketing)`, `(diagnosis)`, `(special)`, `(types)` は URL に出ない。

### 4.2 各ルートの実装方式

| ルート | 実装方式 | 備考 |
| --- | --- | --- |
| `/` | SSG | `getAllTypes()` と `getQuestionMaster()` を取得 |
| `/diagnosis` | SSG + Client Component | 本文は `DiagnosisFlow` |
| `/secret/` | SSG + Client 補助表示 | 隠し特別結果ページ、`noindex, nofollow, noarchive` |
| `/types/[typeCode]/` | SSG + Client 補助表示 | `generateStaticParams()` で 16 タイプを生成 |

### 4.3 検索パラメータ

現行実装で使う検索パラメータ:

- `/diagnosis?page=2` の `page`
- `/types/[typeCode]/?s={shareKey}` の `s`

補足:

- `page` は質問ページ番号の同期用
- `s` は共有キーの復元用
- `s` があっても別ルートにはならず、metadata も公開タイプページのまま

## 5. データ読み込み

### 5.1 質問マスタ / タイプマスタ

- `data/question-master.json`
- `data/types/*.json`
- `data/special-results/secret.json`

`lib/data.ts` が Node.js の `fs/promises` と React の `cache()` を使って読み込む。
ただし、隠し結果 `secret.json` は `lib/secret-result.ts` が JSON import で読み込む。

主な関数:

- `getQuestionMaster()`
- `getAllTypeCodes()`
- `getAllTypes()`
- `getTypeByCode()`
- `getTypesByCodes()`
- `hasTypeImage()`
- `hasChibiImage()`

### 5.2 画像有無判定

`TypeArtwork` は `hasTypeImage()` を使い、配信用画像がなければプレースホルダーへフォールバックする。

## 6. メタデータ / SEO

### 6.1 ルート共通 metadata

`app/layout.tsx` で次を定義する。

- `metadataBase`
- title template
- description
- keywords
- icons
- Open Graph
- Twitter Card
- Google verification
- `viewport.themeColor`

### 6.2 ページ別 metadata

- `/`: canonical `/`
- `/diagnosis`: `robots.index = false`
- `/secret/`: `robots.index = false`, `follow = false`, `noarchive = true`
- `/types/[typeCode]/`: `generateMetadata()` でタイプ別 metadata を作る

### 6.3 JSON-LD

`lib/json-ld.ts` で生成する。

- トップページ: `WebSite`
- タイプページ: `WebPage`
- 隠し結果ページ: `WebPage`

### 6.4 サイト補助ファイル

- `app/sitemap.ts`
- `app/robots.ts`
- `app/manifest.ts`

補足:

- `manifest.ts` は `public/favicons/manifest.json` を読み込んで返す
- `sitemap.ts` は `/` と `/types/[typeCode]/` だけを列挙し、`/diagnosis` は含めない
- `sitemap.ts` は `/secret/` も含めない
- `robots.ts`, `sitemap.ts`, `manifest.ts` は `dynamic = "force-static"` を指定する

## 7. クライアント側状態保持

### 7.1 診断途中状態

`lib/draft-storage.ts` が `localStorage` を扱う。

- キー: `nazotype:diagnosis-draft:v1`
- 保存値: `userName`, `answers`, `currentPage`, `updatedAt`

### 7.2 直近診断結果

`lib/post-diagnosis-result.ts` が `localStorage` を扱う。

- キー: `nazotype:post-diagnosis-result`
- 値: `{ typeCode, key, timestamp }`

用途:

- 診断直後に到達した結果かどうかの判定
- `?s=` がない場合の同一タイプ結果の復元補助

### 7.3 隠し結果の一時共有フラグ

`lib/secret-result.ts` と `components/secret/secret-share-availability-context.tsx` が `localStorage` を扱う。

- キー: `nazotype:secret-share-entry`
- 値: `{ path, timestamp }`
- TTL: 5 分
- 合言葉入力直後の初回表示でだけ共有 CTA / 共有パネルを出し、その後は消費して削除する

### 7.4 LINE スタンプ導線

`components/layout/line-stamp-floating-promo/line-stamp-floating-promo-client.tsx` と `lib/line-stamp-store-visit.ts` が `localStorage` を扱う。

- 導線の開閉状態キー: `nazotype:line-stamp-promo:v2`
- LINE STORE 訪問済みキー: `nazotype:line-stamp-store-visited:v1`
- 訪問済み通知イベント: `nazotype:line-stamp-store-visited`
- 訪問済み状態はタイプページのふりがな強調表示へ反映する

## 8. 環境変数

### 8.1 アプリ本体

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_LINE_STAMP_URL`

挙動:

- 絶対 URL の基準は `NEXT_PUBLIC_SITE_URL`
- 未設定時のフォールバックは `http://localhost:3000`
- `NEXT_PUBLIC_SITE_URL` にプロトコルがない場合は `https://` を補う
- `NEXT_PUBLIC_LINE_STAMP_URL` は LINE スタンプ右下ポップ導線のリンク先に使う
- `NEXT_PUBLIC_LINE_STAMP_URL` 未設定時は `https://store.line.me/stickershop/product/33688754/ja` を使う
- `NEXT_PUBLIC_LINE_STAMP_URL` が空文字、`0`、`false`、`off`、`disabled`、`none` の場合は LINE スタンプ導線を表示しない

### 8.2 画像生成スキル

`.env.character-images` は fal.ai 系スキルや旧ユーティリティ向けに使う。

- `FAL_KEY`
- `FAL_QUEUE_URL`
- `FAL_MODEL`
- `FAL_EDIT_MODEL`
- `FAL_REFERENCE_BASE_URL`

## 9. アセット運用

### 9.1 アプリ本体が参照するアセット

- `public/main-ogp.png`
- `public/line-stamp-main.png`
- `public/types/{typeCode}.png`
- `public/types/{typeCode}_chibi.png`
- `public/types/{typeCode}-ogp.png`
- `public/types/TWLT-ogp.png`
- `public/favicons/*`

### 9.2 画像生成スキルの出力

- ちびキャラ基準画像スキルの公開用正本は `public/types/{typeCode}_chibi.png`
- タイプ別 OGP スキルは `output/type-ogp/` に作業出力する
- タイプ別 OGP スキルの既定 publish 先は `public/ogp/types/`
- LINE スタンプ系スキルは `output/line-stamp-prompts/` と `output/line-stamp-images/` を使う
- LINE スタンプ右下ポップ導線の表示画像は `public/line-stamp-main.png`

補足:

- アプリ本体のタイプ別 OGP 参照先は `public/types/{typeCode}-ogp.png`
- 隠し結果の OGP 参照先は `public/types/TWLT-ogp.png`
- OGP スキルの既定 publish 先は、そのままではアプリ本体に接続されていない

## 10. 現行実装に含まれないもの

- DB 永続化
- API 経由の診断保存
- 認証機能
- Headless CMS
- `next/og` による request-time OGP 生成
- React Hook Form / Zod
- Zustand / Redux などの状態管理ライブラリ
- サーバーサイドの回答保持や cookie ベースの結果管理
