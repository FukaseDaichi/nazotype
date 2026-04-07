# 謎解きタイプ診断

Next.js 16 App Router で実装された、リアル脱出ゲーム・謎解き向けの 4 軸 16 タイプ役割傾向診断アプリです。
協力型謎解きにおける参加者の得意な振る舞い・役割傾向を可視化し、ペアやチーム編成を支援します。

## コンセプト

- 「解く力の優劣」ではなく「役割の違い」を可視化する
- 謎解き中の行動・判断・情報処理・周囲との関わり方を 4 軸で分析する
- すべてのタイプに異なる強みがあり、適切な組み合わせで最大の力を発揮する

## 4 軸

| 軸 | 正方向 | 負方向 | 何を測るか |
| --- | --- | --- | --- |
| A1 | 行動型 `A` | 解読型 `D` | 情報を取りに行くか、その場で処理するか |
| A2 | 局所型 `L` | 俯瞰型 `B` | 個別問題に深く入るか、全体構造を見渡すか |
| A3 | 発信型 `H` | 統率型 `T` | 気づきを外へ出すか、情報を整理してチームを回すか |
| A4 | 熟考型 `N` | 転換型 `C` | 今の問題に粘るか、別の手段に切り替えるか |

## 現在の実装状況

現行コードはマダミスタイプ診断からのフォークです。軸定義・タイプデータ・質問文・UI テーマ等の実装変更は未着手であり、仕様書（`docs/`）が先行しています。

基盤として動作する機能:

- トップページから名前を入力して診断を開始する
- 32 問を 8 問ずつ 4 ページで回答する
- 5 段階回答を 4 軸へ集計し、16 タイプを判定する
- 診断途中の `userName` / `answers` / `currentPage` を `localStorage` に保存して復元する
- 診断完了後は `/types/[typeCode]/[key]` の共有結果ページへ遷移する
- 公開タイプ詳細ページ `/types/[typeCode]` でタイプ固定情報を読む
- 共有結果ページでは共有ユーザー名と 4 軸サマリを表示し、結果 URL をコピーできる
- SNS 共有は公開タイプ詳細ページ `/types/[typeCode]` に集約する
- OGP、JSON-LD、`sitemap.xml`、`robots.txt`、`manifest.webmanifest` を実装している

## ルート

| ルート | 役割 | 検索エンジン向け扱い |
| --- | --- | --- |
| `/` | トップページ | index |
| `/diagnosis` | 診断フロー | `noindex` |
| `/types/[typeCode]` | 公開タイプ詳細ページ | index / canonical |
| `/types/[typeCode]/[key]` | 共有結果ページ | `noindex` / canonical は公開ページ |

補足:

- 専用の `/types` 一覧ページはありません
- 16 タイプ一覧はトップページ内に表示します

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 環境変数

### アプリ本体

- `NEXT_PUBLIC_SITE_URL`
  本番用のサイト URL。`metadataBase`、canonical、JSON-LD、sitemap の絶対 URL に使います
- `NEXT_PUBLIC_LINE_STAMP_URL`
  任意。設定するとトップページの LINE スタンプ導線を有効化します

絶対 URL の基準は次の優先順で決まります。

- `NEXT_PUBLIC_SITE_URL`
- Vercel 環境変数 `VERCEL_PROJECT_PRODUCTION_URL` または `VERCEL_URL`
- `http://localhost:3000`

### 画像生成スキル

画像生成スクリプトはリポジトリ直下の `.env.character-images` を読みます。

- `NANOBANANA_API_KEY`
- `NANOBANANA_API_BASE`
- `NANOBANANA_REFERENCE_BASE_URL`

## 利用可能なコマンド

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## ディレクトリ概要

```text
app/          ルート定義、metadata files、ページ入口
components/   画面本文と UI コンポーネント
data/         質問マスタと 16 タイプ定義
docs/         仕様書
lib/          データ取得、診断ロジック、共有キー、メタデータ補助
public/       配信用の静的アセット
skills/       画像生成スキル
output/       画像生成スキルの作業出力
```

## ドキュメント

- [docs/specification.md](./docs/specification.md)
  主仕様書（診断モデル設計 + アプリ仕様）
- [docs/diagnosis-logic-spec.md](./docs/diagnosis-logic-spec.md)
  診断ロジック、同点処理、共有キー
- [docs/type-design-spec.md](./docs/type-design-spec.md)
  16 タイプ定義と `data/types/*.json` の項目
- [docs/tech-stack-spec.md](./docs/tech-stack-spec.md)
  技術構成、ルーティング、SEO、状態保持
- [docs/ui-design-spec.md](./docs/ui-design-spec.md)
  UI の見た目と画面差分
- [docs/frontend-directory-structure-spec.md](./docs/frontend-directory-structure-spec.md)
  ディレクトリ構成と責務分離
- [docs/character-image-skill-spec.md](./docs/character-image-skill-spec.md)
  キャラクター画像生成スキルの運用
- [docs/type-ogp-image-spec.md](./docs/type-ogp-image-spec.md)
  タイプ別 OGP 画像生成スキルの運用
- [docs/line-stamp-skill-spec.md](./docs/line-stamp-skill-spec.md)
  LINE スタンプ用 prompt / image スキルの設計

## 検証メモ

- `npm run build` では `/`、`/diagnosis`、`/types/[typeCode]` が静的生成されます
- `/types/[typeCode]/[key]` は `cookies()` を使うため動的ルートです
- アプリ本体が参照するタイプ別 OGP は `public/types/{typeCode}-ogp.png` です
