# LINE スタンプ右下ポップ導線 設計方針

## 1. 文書の位置づけ

本書は、`謎解きタイプ診断` の公開ページに追加する **LINE スタンプ宣伝コンポーネント** の実装前設計である。

注意:

- 本書は **将来実装の方針書** であり、現行実装の説明ではない
- 現行の正本仕様は [specification.md](./specification.md) を優先する
- 実装後に仕様として固定する場合は、関連する現行仕様書へ反映する

## 2. 背景と入力条件

今回の入力条件:

- 右下にポップで宣伝するコンポーネントを追加したい
- かわいいデザインにしたい
- 反映先はトップページ `/` と各タイプページ `/types/[typeCode]/`
- 宣伝先 URL は `https://store.line.me/stickershop/product/33688754/ja`
- メイン画像は `public/line-stamp-main.png` を使う

補足:

- LINE STORE 上の商品名は `謎解きタイプ診断スタンプ①`
- 現行コードでは `NEXT_PUBLIC_LINE_STAMP_URL` / `LINE_STAMP_URL` は存在するが、公開 UI では未使用
- `public/line-stamp-main.png` は `240 x 240` px

参照した既存文書:

- [specification.md](./specification.md)
- [frontend-directory-structure-spec.md](./frontend-directory-structure-spec.md)
- [tech-stack-spec.md](./tech-stack-spec.md)
- [line-stamp-skill-spec.md](./line-stamp-skill-spec.md)

実装時に前提とする Next.js 文書:

- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route-groups.md`

## 3. 目的

この導線の目的は、診断サイトの世界観を壊さずに LINE スタンプへの送客を増やすことにある。

重視すること:

- ひと目で存在に気づける
- ただの広告ではなく、キャラクターの延長として自然に見える
- かわいいが、現行サイトの「謎解き / dossier / gold accent」の空気から浮きすぎない
- 診断開始フォームやタイプ詳細の読解を邪魔しない

## 4. 配置方針

### 4.1 表示対象ページ

表示するページ:

- `/`
- `/types/[typeCode]/`

表示しないページ:

- `/diagnosis`
- `/secret/`

理由:

- 診断中は集中を切らしたくない
- 隠し結果ページは演出優先で、別の宣伝導線を混ぜない

### 4.2 差し込み位置

ルート全体の `app/layout.tsx` には置かず、ページ本文側で明示的に差し込む。

差し込み候補:

- `components/home/home-page/home-page.tsx`
- `components/type/type-detail-page-content/type-detail-page-content.tsx`

この方針にする理由:

- 公開ページだけに出し分けやすい
- `Route Group` を増やさずに制御できる
- `/diagnosis` と `/secret/` への誤表示を防ぎやすい

## 5. UI コンセプト

### 5.1 方向性

デザインの軸は **「かわいいポップ感」+「謎解きサイトの品のよさ」** とする。

見た目のイメージ:

- 右下からふわっと現れる「吹き出し型」の小さな販促カード
- スタンプ画像がカードから少しはみ出して見える
- キラッとした飾りや丸みでポップ感を出す
- 文字色や縁取りには既存サイトの `gold / mystery / paper` 系トーンも混ぜ、別世界の広告にしない

### 5.2 視覚要素

入れたい要素:

- `NEW` か `LINE STICKERS` の小さなバッジ
- `public/line-stamp-main.png` のメイン画像
- 1 行で伝わるコピー
- CTA ボタン
- 最小限の閉じる or たたむ操作

避けたいこと:

- 全画面を覆うモーダル化
- 画面下の広い帯バナー
- まぶしすぎる点滅
- サイト本体の主 CTA より強い主張

## 6. コンポーネント仕様

### 6.1 コンポーネント名

仮称:

- `LineStampFloatingPromo`

### 6.2 表示バリエーション

`variant` を持たせ、トップとタイプページで文言を変える。

想定:

- `home`
- `type`

表示文言の例:

`home`:

- 見出し: `16タイプのLINEスタンプ、できました`
- 補足: `診断のあとも使いやすい、キャラ入りスタンプです。`

`type`:

- 見出し: `{typeName} も入ったスタンプ発売中`
- 補足: `このタイプを含む16タイプのスタンプをLINEで使えます。`

タイプページ補助情報:

- `typeCode` を小さなチップで見せてもよい
- キャラページごとの文脈に寄せるが、リンク先は共通の 1 商品にする

### 6.3 状態

必要な状態:

- `expanded`: 通常表示
- `collapsed`: 右下の小さなピル表示
- `hidden`: URL 未設定時は非表示

推奨挙動:

- Desktop / Tablet は初回 `expanded`
- 高さが低い Mobile は初回 `collapsed`
- ユーザーがたたんだ状態は `localStorage` に保存して再訪時も尊重する

保存キー案:

- `nazotype:line-stamp-promo:v1`

## 7. レイアウト方針

### 7.1 固定位置

- `position: fixed`
- `right: 12px ~ 24px`
- `bottom: 12px ~ 24px`
- `env(safe-area-inset-right)` / `env(safe-area-inset-bottom)` を加味する
- 常時最前面ではなく、既存 UI を壊さない範囲の `z-index` にする

### 7.2 サイズ

目安:

- Desktop: 幅 `320px` 前後
- Tablet: 幅 `280px` 前後
- Mobile: 幅 `min(260px, calc(100vw - 24px))`

モバイルでは次を守る:

- ヒーローの入力フォームや固定導線を覆いすぎない
- 画面高が低い場合は `collapsed` 初期表示で逃がす

### 7.3 情報密度

カード内の情報は絞る。

載せる情報:

- 商品訴求
- キャラ感
- 1 つの CTA

載せない情報:

- 価格
- 長文説明
- 外部レビュー

価格や販売条件は変動しうるため、UI に固定表示しない。

## 8. ビジュアル方針

### 8.1 カラー

ベース案:

- クリーム系の吹き出し面
- コーラルピンク or ピーチのポップ差し色
- ミント or ライトブルーの小アクセント
- 境界線や影は既存の `mystery` / `gold` 系を引用

狙い:

- 「かわいい」を出しつつ、既存ページ上で浮きすぎない
- 画像が主役になり、ボタンだけが目立ちすぎない

### 8.2 形状

推奨:

- 大きめ角丸
- 吹き出しのしっぽ
- 画像をカード上辺から少しオーバーラップ

### 8.3 モーション

推奨:

- 初回表示時に小さくフェードアップ
- 画像や飾りにわずかな bob / float
- ホバー時だけ CTA の影とスケールを少し強める

必須:

- `prefers-reduced-motion: reduce` では常時静止

## 9. 実装境界

### 9.1 Server / Client の分離

Next.js 16 の方針に合わせ、ページ本体は Server Component のまま維持する。

推奨構成:

- Server 側: 表示可否判定、`variant` や `typeName` の受け渡し
- Client 側: `collapsed` 状態、閉じる操作、`localStorage` 永続化

理由:

- 不要にページ全体を Client Component 化しない
- 右下ポップ固有の軽いインタラクションだけをクライアントへ閉じ込める

### 9.2 リンク実装

外部サイト遷移なので、`next/link` ではなく通常の `<a>` を使う。

推奨属性:

- `href={LINE_STAMP_URL}`
- `target="_blank"`
- `rel="noreferrer"`

### 9.3 URL の正本

リンク先の正本は `lib/site.ts` の `LINE_STAMP_URL` とする。

運用方針:

- `.env*` で `NEXT_PUBLIC_LINE_STAMP_URL=https://store.line.me/stickershop/product/33688754/ja` を設定する
- URL 未設定時はコンポーネントを描画しない

これにより、将来リンク先を差し替えても UI 側の修正を減らせる。

## 10. ファイル配置案

現行構成に沿う配置案:

```text
components/
  layout/
    line-stamp-floating-promo/
      line-stamp-floating-promo.tsx
      line-stamp-floating-promo-client.tsx
      line-stamp-floating-promo.module.css
```

採用理由:

- `home` 専用でも `type` 専用でもない
- 汎用 `ui` ではなく、サイト固有の販促導線である
- `SiteFooter` と同じくページをまたいで使う共有パーツとして扱いやすい

## 11. 表示ルール詳細

### 11.1 トップページ

方針:

- ヒーローの空気を壊さないよう、カードサイズは控えめ
- 「診断のあともキャラを楽しめる」文脈で訴求する

推奨コピー方向:

- `診断のあとも、LINEで使える`
- `16タイプがスタンプになりました`

### 11.2 タイプページ

方針:

- 閲覧中のタイプとの接続を感じさせる
- ただし、商品画像は共通の `line-stamp-main.png` を主とする

推奨コピー方向:

- `{typeName} もいるよ`
- `{typeName} をLINEでも連れていける`

## 12. アクセシビリティ

必須要件:

- キーボード操作で CTA とたたむボタンに到達できる
- 画像には内容が伝わる `alt` を付ける
- コントラストを確保する
- 動きは `prefers-reduced-motion` に従う

`alt` の例:

- `謎解きタイプ診断スタンプ①のメイン画像`

## 13. 受け入れ基準

実装後、最低限満たしたい条件:

1. `/` と `/types/[typeCode]/` で右下に導線が出る
2. `/diagnosis` と `/secret/` では出ない
3. クリックで LINE STORE の対象商品へ遷移する
4. 見た目が「かわいいポップ」寄りになっている
5. モバイルで主コンテンツを過度に覆わない
6. `NEXT_PUBLIC_LINE_STAMP_URL` 未設定時に壊れない
7. `prefers-reduced-motion` とキーボード操作に配慮されている

## 14. 次の実装ステップ

次に進むときの順序:

1. `components/layout/line-stamp-floating-promo/` を追加する
2. `home-page.tsx` と `type-detail-page-content.tsx` に差し込む
3. `LINE_STAMP_URL` と `public/line-stamp-main.png` を接続する
4. Mobile の `collapsed` 初期表示と保存挙動を入れる
5. かわいい見た目の微調整を行う

