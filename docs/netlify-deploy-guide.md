# Netlify デプロイメモ

この文書は、`/Users/fukasedaichi/git/nazotype` の現行実装を Netlify に載せるときの前提と注意点をまとめたものです。2026-04-24 時点でローカル `npm run build` が成功し、静的 export が成立することを確認済みです。

## 現行実装の前提

- Next.js は `16.2.1`。
- `next.config.ts` は `output: "export"`、`trailingSlash: true`、`images.unoptimized = true`。
- そのため、このアプリは現状「サーバー付き Next.js」ではなく「静的 export を配る構成」です。
- 実際の build では `/`、`/diagnosis/`、`/secret/`、`/types/[typeCode]/`、`/robots.txt`、`/sitemap.xml`、`/manifest.webmanifest` が静的生成されます。

参照:

- [`../next.config.ts`](../next.config.ts)
- [`../package.json`](../package.json)
- [`./tech-stack-spec.md`](./tech-stack-spec.md)

## 推奨デプロイ方式

現状のリポジトリ構成から見ると、Netlify では Next.js の SSR アダプタ運用より、`out/` を publish directory にする静的サイト運用のほうが素直です。これは Netlify の build/publish の仕組みと、Next.js の static export 仕様を合わせたうえでの推奨判断です。

推奨値:

| 項目              | 推奨値          |
| ----------------- | --------------- |
| Base directory    | リポジトリ root |
| Build command     | `npm run build` |
| Publish directory | `out`           |
| Node.js           | `>= 20.9.0`     |

メモ:

- Netlify の Next.js 自動判定では一般に build command が `next build`、publish directory が `.next` になることがあります。
- ただしこのリポジトリは `output: "export"` を使っており、デプロイ対象の HTML/CSS/JS 一式は `out/` に出ます。
- そのため、Netlify 側で自動検出値が入っても `publish = "out"` に合わせて確認するのが安全です。

`netlify.toml` を置くなら最小構成は次の形です。

```toml
[build]
  command = "npm run build"
  publish = "out"
```

## 環境変数

### 必須

`NEXT_PUBLIC_SITE_URL`

- 本番 URL を入れる。
- `metadataBase`、`robots.txt`、`sitemap.xml`、OGP の絶対 URL 生成に使われる。
- 未設定だと `http://localhost:3000` にフォールバックするため、本番 deploy では必ず設定したい。
- `https://example.com` のようにプロトコル付きで入れるのが無難です。

参照:

- [`../lib/site.ts`](../lib/site.ts)
- [`../app/layout.tsx`](../app/layout.tsx)
- [`../app/robots.ts`](../app/robots.ts)
- [`../app/sitemap.ts`](../app/sitemap.ts)

### 任意

`NEXT_PUBLIC_LINE_STAMP_URL`

- LINE スタンプ導線の差し替え用です。
- 未設定でも既定値にフォールバックします。

`NEXT_PUBLIC_GA_MEASUREMENT_ID`

- GA4 で診断完了件数とタイプ別割合を集計する場合に設定します。
- 値は GA4 Web data stream の Measurement ID で、docs 上では `G-REDACTED` と表記します。
- 未設定の場合、GA4 script は読み込まず、`diagnosis_complete` event も送信しません。
- Deploy Preview のデータを production の GA4 に混ぜたくない場合、preview context では未設定にするか、preview 用の GA4 property / data stream を使います。

参照:

- [`./survey-result-statistics-architecture.md`](./survey-result-statistics-architecture.md)

### 運用上の注意

- `NEXT_PUBLIC_` 付きの値は build 後のブラウザ配信物に埋め込まれるので、秘密情報は入れない。
- Netlify では deploy context ごとに環境変数の値を分けられる。
- Deploy Preview でも絶対 URL を正しく出したいなら、preview 用 context に別値を持たせる。
- 逆に production と preview で同じ `NEXT_PUBLIC_SITE_URL` を使うと、preview の `sitemap.xml` や OGP URL が production ドメインを向くことがあります。
- Netlify の build 環境は `.env` を自動では読まない前提で考え、必要な値は UI / CLI / API 側に持たせるほうが安全です。

## Netlify で気をつけるポイント

### 1. `trailingSlash: true` と Pretty URLs を崩さない

- 現在の build 出力は `/about/index.html` 型になります。
- Netlify は Pretty URLs が有効なら `/about` を `/about/` に寄せて扱えます。
- スラッシュ付け替えを独自 redirect で無理に書くと、ループや意図しない挙動の原因になります。
- 現状は Netlify の標準挙動に寄せるのが安全です。

### 2. `output/` は deploy 対象ではない

- Netlify が配るのは publish directory 配下だけです。
- このリポジトリでは画像生成スキルの作業成果物が `output/` に出ることがありますが、そこを書き換えただけでは本番には反映されません。
- アプリ本体が参照する正本は `public/` 配下です。
- 特に OGP やタイプ画像は `public/types/` 側に揃っているかを確認してから deploy すること。
- 将来 `_redirects` や `_headers` を使う場合も、publish directory に入る形にするか、`netlify.toml` で管理すること。

参照:

- [`./tech-stack-spec.md`](./tech-stack-spec.md)
- [`./frontend-directory-structure-spec.md`](./frontend-directory-structure-spec.md)

### 3. `next/image` は今のまま `unoptimized` 前提

- static export では、`next/image` のデフォルト最適化は使えません。
- 現在は `images.unoptimized = true` になっているので、このままで正しいです。
- もし将来 Netlify Image CDN やデフォルト最適化を活かしたくなったら、静的 export 前提の構成を見直す必要があります。

### 4. 追加機能しだいで「静的 deploy」では足りなくなる

Next.js 側の static export では、次のような機能は使えません。

- `cookies()`
- `headers()`
- `next.config` の rewrites / redirects / headers
- ISR
- Draft Mode
- Server Actions
- request に依存する Route Handlers
- `generateStaticParams()` なしの動的ルート

Netlify 自体は Next.js の SSR / ISR / Middleware / Server Actions をサポートしていますが、それは OpenNext アダプタ側の実行モデルを使う場合です。今のリポジトリは `output: "export"` でそのモードを使っていません。

つまり:

- 現状のままなら `out/` 配信でよい。
- 将来サーバー機能を足したら、Netlify 側も `.next` ベースの Next.js 運用へ切り替える前提で再設計する。

### 5. preview と production で `localStorage` は共有されない

- 診断途中データと直近結果は `localStorage` に保存しています。
- Deploy Preview は production と別 origin になるので、下書きや直近結果は引き継がれません。
- QA 時に「前の結果が消えた」と見えても仕様どおりです。

参照:

- [`../lib/draft-storage.ts`](../lib/draft-storage.ts)
- [`../lib/post-diagnosis-result.ts`](../lib/post-diagnosis-result.ts)

### 6. Node.js バージョンを固定したほうが安全

- `next@16.2.1` の engine は `>=20.9.0` です。
- このリポジトリには `.nvmrc` や `.node-version` がないため、Netlify 側の Node.js 解釈に任せきりにしないほうが安心です。
- Netlify UI、`NODE_VERSION`、または version file のいずれかで 20 系以上に揃えておくと事故が減ります。

## デプロイ前チェックリスト

- `npm run build` がローカルで通る。
- `out/index.html` が生成される。
- `out/diagnosis/index.html`、`out/secret/index.html`、`out/types/<typeCode>/index.html` が生成される。
- `NEXT_PUBLIC_SITE_URL` が production URL になっている。
- GA4 集計を有効にする場合、`NEXT_PUBLIC_GA_MEASUREMENT_ID` が production 用の Measurement ID になっている。
- `sitemap.xml` と OGP の絶対 URL が production 向きになっている。
- `public/types/` の画像と OGP が最新になっている。
- Netlify の publish directory が `out` になっている。
- Pretty URLs を不用意に無効化していない。

## 参考資料

- [Next.js: Deploying](https://nextjs.org/docs/app/getting-started/deploying)
- [Next.js: Static Exports](https://nextjs.org/docs/app/guides/static-exports)
- [Next.js: `output`](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
- [Next.js: `trailingSlash`](https://nextjs.org/docs/app/api-reference/config/next-config-js/trailingSlash)
- [Netlify: Next.js on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/)
- [Netlify: Build configuration overview](https://docs.netlify.com/build/configure-builds/overview/)
- [Netlify: Build environment variables](https://docs.netlify.com/build/configure-builds/environment-variables/)
- [Netlify: Environment variables overview](https://docs.netlify.com/build/environment-variables/overview)
- [Netlify: Use environment variables with frameworks](https://docs.netlify.com/build/frameworks/use-environment-variables-with-frameworks/)
- [Netlify: Redirect options](https://docs.netlify.com/routing/redirects/redirect-options/)
