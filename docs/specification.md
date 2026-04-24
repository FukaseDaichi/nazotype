# 謎解きタイプ診断 仕様書

## 1. 文書の位置づけ

本書は、現行コードを正本として謎解きタイプ診断アプリ全体の仕様を整理する主文書である。
`docs/` 配下の補助文書と矛盾する場合は、本書よりも実装を優先し、そのうえで本書を更新する。

関連文書:

- [diagnosis-logic-spec.md](./diagnosis-logic-spec.md)
- [type-design-spec.md](./type-design-spec.md)
- [tech-stack-spec.md](./tech-stack-spec.md)
- [frontend-directory-structure-spec.md](./frontend-directory-structure-spec.md)
- [character-image-skill-spec.md](./character-image-skill-spec.md)
- [type-ogp-image-spec.md](./type-ogp-image-spec.md)
- [line-stamp-skill-spec.md](./line-stamp-skill-spec.md)
- [line-stamp-promo-component-design.md](./line-stamp-promo-component-design.md)
- [twilight-secret-result-spec.md](./twilight-secret-result-spec.md)
- [current-issues.md](./current-issues.md)
- [DESIGN.md](../DESIGN.md)

## 2. システム概要

### 2.1 システム名称

**謎解きタイプ診断**

### 2.2 目的

本システムは、リアル脱出ゲームや周遊型謎解きなどの協力型謎解きにおける立ち回りを、4 軸 16 タイプで可視化する。

重視すること:

- 解く力の優劣ではなく、役割傾向の違いを見せる
- 自己理解とチーム内の補完関係の発見を助ける
- 診断コンテンツとして楽しく共有できる形にする

## 3. 診断モデル

### 3.1 4 軸

| 軸 | 正方向 | 負方向 | コード |
| --- | --- | --- | --- |
| A1 | 行動型 | 解読型 | `A` / `D` |
| A2 | 局所型 | 俯瞰型 | `L` / `B` |
| A3 | 発信型 | 統率型 | `H` / `T` |
| A4 | 熟考型 | 転換型 | `N` / `C` |

### 3.2 タイプ決定

- 32 問を 4 ページで回答する
- 各軸 8 問ずつを集計する
- 軸ごとの確定コードを連結して 4 文字の `typeCode` を作る
- 16 件のタイプ定義は `data/types/*.json` に保持する

### 3.3 出力内容

診断後に表示する主な情報:

- タイプコード
- タイプ名
- タグライン
- 4 軸サマリ
- 強み
- 注意したい点
- 詳しい見立て
- 担いやすい役割
- 相性の傾向

## 4. 公開ルート

| ルート | 役割 | 検索エンジン向け扱い |
| --- | --- | --- |
| `/` | トップページ | index |
| `/diagnosis` | 診断フロー | `noindex` |
| `/types/[typeCode]/` | タイプ詳細ページ兼、診断結果表示ページ | index / canonical |
| `/secret/` | 隠し特別結果ページ | `noindex, nofollow, noarchive` |

補足:

- `/types` 一覧ページは存在しない
- 16 タイプ一覧はトップページ内に配置する
- 診断フローは `?page=` を使って表示中ページを URL と同期する
- 診断結果は `/types/[typeCode]/?s={shareKey}` の形で同じ公開ページ上に載せる
- 隠し結果 `/secret/` の詳細は [twilight-secret-result-spec.md](./twilight-secret-result-spec.md) を参照する

## 5. ユーザーフロー

1. ユーザーが `/` にアクセスする
2. トップページの開始フォームで名前を入力し、診断を開始する
3. 名前が通常入力なら `/diagnosis` で 32 問に回答する
4. 名前が `とわいらいと` または `トワイライト` なら、一時共有フラグを `localStorage` に保存して `/secret/` に直接遷移する
5. 通常診断時は診断結果を計算し、共有キーを生成して `localStorage` に直近結果を保存する
6. 通常診断時は `/types/[typeCode]/?s={shareKey}` に遷移する
7. タイプページ内で共有キーを復元し、4 軸サマリ付きの結果表示を出す
8. SNS 共有は公開タイプページ URL を使い、結果 URL はコピー導線で扱う
9. LINE スタンプ導線から外部 LINE STORE を開いた場合、訪問済み状態を `localStorage` に保存し、タイプ名ふりがなの強調表示に反映する

## 6. 画面仕様

### 6.1 トップページ

トップページは 1 ページ完結で、以下を表示する。

- ヒーロー
- 診断開始フォーム
- 4 軸説明
- 16 タイプ一覧
- 診断の流れ
- LINE スタンプ右下ポップ導線
- JSON-LD `WebSite`

開始フォームの仕様:

- 名前は必須入力
- 最大 10 文字
- 既存ドラフトがあれば「前回の続きから再開する」を表示する
- 送信時に `localStorage` のドラフトを初期化または引き継ぐ
- ただし名前が `とわいらいと` または `トワイライト` の場合は、診断フローへ進まず、一時共有フラグ付きで `/secret/` を開く

### 6.2 診断フロー

診断フローの仕様:

- 32 問
- 1 ページ 8 問、全 4 ページ
- 回答は 5 段階
- 各ページの 8 問すべてに回答しないと次へ進めない
- 前ページへ戻れる
- 進捗バーと回答済み件数を表示する
- `?page=` と現在ページを同期する
- ドラフトを `localStorage` から復元する
- 名前なしで直接開いた場合はトップページへ戻す導線を表示する

### 6.3 タイプ詳細ページ

`/types/[typeCode]/` は公開用のタイプ詳細ページであり、同時に診断結果表示の受け皿でもある。

常に表示する内容:

- タイプ名
- タイプコード
- タグライン
- サマリー
- タイプ画像
- チビ画像があれば補助表示
- 強み
- 注意したい点
- 詳しい見立て
- 担いやすい役割
- 相性の傾向
- LINE スタンプ右下ポップ導線
- JSON-LD `WebPage`

LINE スタンプ導線の `LINE STOREで見る` を一度クリックしたブラウザでは、各タイプページの `furiganaEmphasisIndex` 位置のふりがな強調色を LINE STORE 訪問済み状態として切り替える。

共有キーや直近結果がない公開タイプページでは、シェアパネルは表示しない。

### 6.4 診断結果表示モード

`/types/[typeCode]/` に共有キー `?s=` が付いている場合、または同じ `typeCode` の直近結果が `localStorage` に残っている場合、ページ内で結果表示を追加する。

表示の分岐:

- 直近診断と一致する場合は `PostDiagnosisResultCard` を表示する
- それ以外で `?s=` が復元できる場合は 4 軸サマリ付きの署名表示を出す
- 共有キーがない場合は結果表示を追加しない

共有導線の仕様:

- SNS 共有 URL は常に公開タイプページ URL を使う
- コピー導線では結果 URL を使える
- X 共有時は `#謎解きタイプ診断` を付ける

## 7. メタデータと OGP

- トップページ OGP は `/main-ogp.png`
- タイプ別 OGP は `/types/{typeCode}-ogp.png`
- 隠し結果 OGP は `/types/TWLT-ogp.png`
- ルート共通 `metadata` は `app/layout.tsx` にある
- タイプ別 metadata は `app/(types)/types/[typeCode]/page.tsx` の `generateMetadata()` で作る
- 隠し結果 metadata は `app/(special)/secret/page.tsx` で作る
- `?s=` は metadata を切り替えない
- `next/og` による request-time 生成は使わず、静的アセットを参照する

## 8. データ仕様

### 8.1 質問マスタ

`data/question-master.json` に保持する。

主な項目:

- `meta.title`
- `meta.version`
- `meta.questionCount`
- `meta.pageCount`
- `meta.questionsPerPage`
- `meta.axisOrder`
- `questions[].questionId`
- `questions[].questionText`
- `questions[].axis`
- `questions[].direction`
- `questions[].displayOrder`
- `questions[].pageNo`
- `questions[].weight`
- `questions[].isActive`
- `questions[].tieBreakerPriority`

### 8.2 タイプマスタ

`data/types/*.json` に 16 件保持する。

主な項目:

- `typeId`
- `typeCode`
- `typeName`
- `furigana`
- `furiganaLength`
- `furiganaEmphasisIndex`
- `tagline`
- `summary`
- `detailDescription`
- `strengths`
- `cautions`
- `recommendedRole`
- `compatibility`
- `shareText`
- `axis`
- `visualProfile`
- `imagePrompt`
- `negativePrompt`

### 8.3 隠し結果マスタ

`data/special-results/secret.json` に 1 件保持する。

現行値:

- `typeCode`: `TWLT`
- `typeName`: `最終兵器`
- 公開ルート: `/secret/`
- OGP: `public/types/TWLT-ogp.png`

この結果は 4 軸 16 タイプには含めず、合言葉入力時だけ表示する特別結果として扱う。

### 8.4 共有キー

共有キーは回答全文ではなく、以下だけを持つ。

- バージョン
- 正規化済みユーザー名
- 4 軸トレンド状態

詳細は [diagnosis-logic-spec.md](./diagnosis-logic-spec.md) を参照する。

### 8.5 アセット

アプリ本体が参照する主な配信用アセット:

- `public/main-ogp.png`
- `public/line-stamp-main.png`
- `public/types/{typeCode}.png`
- `public/types/{typeCode}_chibi.png`
- `public/types/{typeCode}-ogp.png`
- `public/types/TWLT-ogp.png`
- `public/favicons/*`

## 9. 保存・環境変数

### 9.1 ブラウザ保存

- 診断途中データは `nazotype:diagnosis-draft:v1`
- 直近診断結果は `nazotype:post-diagnosis-result`
- 隠し結果の一時共有フラグは `nazotype:secret-share-entry`
- LINE スタンプ導線の開閉状態は `nazotype:line-stamp-promo:v2`
- LINE STORE 訪問済み状態は `nazotype:line-stamp-store-visited:v1`
- いずれも `localStorage` のみを使う

### 9.2 環境変数

アプリ本体で参照する環境変数:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_LINE_STAMP_URL`

補足:

- `NEXT_PUBLIC_SITE_URL` 未設定時は `http://localhost:3000` を使う
- `NEXT_PUBLIC_SITE_URL` にプロトコルがない場合は `https://` を補う
- `NEXT_PUBLIC_LINE_STAMP_URL` は LINE スタンプ右下ポップ導線のリンク先に使う
- `NEXT_PUBLIC_LINE_STAMP_URL` 未設定時は `https://store.line.me/stickershop/product/33688754/ja` を使う
- `NEXT_PUBLIC_LINE_STAMP_URL` が空文字、`0`、`false`、`off`、`disabled`、`none` の場合は LINE スタンプ導線を表示しない

## 10. 非機能・運用前提

- `next.config.ts` で `output: "export"` を指定する
- `trailingSlash: true` を有効にする
- `next/image` は `images.unoptimized = true` で使う
- サーバー側の回答保存、認証、DB 永続化、API ルートは持たない
- 質問マスタとタイプマスタは静的 JSON で管理する
- 画像生成スキルの中間成果物は `output/` に保存し、アプリ本体は通常参照しない

## 11. 現行実装メモ

- 診断結果表示は専用の共有ルートではなく、公開タイプページに `?s=` を付けて実現している
- `app/(types)/types/[typeCode]/page.tsx` だけが公開ルートで、`[key]` セグメントは存在しない
- タイプ別 OGP 生成スキルの既定 publish 先は `public/ogp/types/` であり、アプリ本体が参照する `public/types/{typeCode}-ogp.png` とは別である
- `/types` 一覧ページはない
- LINE スタンプ右下ポップ導線は `/` と `/types/[typeCode]/` だけに表示する
- 現行課題は [current-issues.md](./current-issues.md) に集約する
