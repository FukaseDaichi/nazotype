# LINE スタンプ右下ポップ導線 仕様書

## 1. 文書の位置づけ

本書は、現行コードに実装済みの **LINE スタンプ右下ポップ導線** を整理する文書である。
実装前設計ではなく、`components/layout/line-stamp-floating-promo/` を正本として記述する。

関連文書:

- [specification.md](./specification.md)
- [frontend-directory-structure-spec.md](./frontend-directory-structure-spec.md)
- [tech-stack-spec.md](./tech-stack-spec.md)
- [line-stamp-skill-spec.md](./line-stamp-skill-spec.md)

## 2. 目的

診断サイトの世界観を壊さずに、LINE スタンプ商品への送客を作る。

重視すること:

- 右下の小さな導線として存在に気づける
- 診断開始フォームやタイプ詳細の読解を邪魔しない
- サイト本体の主 CTA より強く出すぎない
- LINE STORE を訪問したことを、タイプページ側の小さな演出へ反映する

## 3. 表示対象

表示するページ:

- `/`
- `/types/[typeCode]/`

表示しないページ:

- `/diagnosis`
- `/secret/`

差し込み位置:

- `components/home/home-page/home-page.tsx`
- `components/type/type-detail-page-content/type-detail-page-content.tsx`

`app/layout.tsx` には置かず、表示対象ページの本文から明示的に差し込む。

## 4. 実装ファイル

```text
components/
  layout/
    line-stamp-floating-promo/
      line-stamp-floating-promo.tsx
      line-stamp-floating-promo-client.tsx
      line-stamp-floating-promo.module.css

lib/
  line-stamp-store-visit.ts
  site.ts

public/
  line-stamp-main.png
```

責務:

- `line-stamp-floating-promo.tsx`: Server Component。リンク URL と表示文言を決める
- `line-stamp-floating-promo-client.tsx`: Client Component。開閉、非表示、`localStorage`、CTA クリックを扱う
- `line-stamp-floating-promo.module.css`: 固定配置、カード、たたみ表示、モーション
- `lib/line-stamp-store-visit.ts`: LINE STORE 訪問済み状態と通知イベント
- `lib/site.ts`: `LINE_STAMP_URL` の正本

## 5. URL と画像

リンク先:

- 環境変数: `NEXT_PUBLIC_LINE_STAMP_URL`
- 未設定時の既定値: `https://store.line.me/stickershop/product/33688754/ja`
- 非表示にする値: 空文字、`0`、`false`、`off`、`disabled`、`none`

表示画像:

- `public/line-stamp-main.png`

現行実装では既定 URL があるため、環境変数が未定義なら導線は表示される。
一時停止したい場合は、`NEXT_PUBLIC_LINE_STAMP_URL=disabled` のように明示的な無効値を設定する。

## 6. 表示文言

展開時:

- ラベル: `LINE STICKERS`
- バッジ: `NEW`
- 見出し: `16タイプの` / `LINEスタンプあります`
- 説明: `診断後も使いやすい、キャラ入りスタンプです。隠し要素もあります。`
- CTA: `LINE STOREで見る`

たたみ時:

- ラベル: `LINE STICKERS`
- 文言: `16タイプのスタンプ発売中`

タイプページでは `typeCode` を小さなチップとして追加表示する。

## 7. 状態

### 7.1 表示モード

`LineStampFloatingPromoClient` は次の表示モードを持つ。

- `expanded`: 展開カード
- `collapsed`: 右下の小さな導線
- `hidden`: 非表示

初回は `collapsed`。
過去にユーザーが展開した場合だけ、次回以降 `expanded` で復元する。

### 7.2 保存

導線の開閉状態:

- 保存キー: `nazotype:line-stamp-promo:v2`
- 保存値: `{ collapsed?: boolean }`

保存するもの:

- 展開操作: `collapsed: false`
- たたむ操作: `collapsed: true`

保存しないもの:

- 閉じる操作による `hidden`

そのため、閉じる操作は現在のマウント中だけ有効で、再読み込みやページ遷移後には初期表示ルールへ戻る。

## 8. LINE STORE 訪問済み演出

CTA `LINE STOREで見る` をクリックしたとき、`markLineStampStoreVisited()` を呼ぶ。

保存:

- キー: `nazotype:line-stamp-store-visited:v1`
- 値: `1`

通知:

- イベント名: `nazotype:line-stamp-store-visited`
- 同一タブでは custom event
- 別タブでは `storage` event

タイプ詳細ページでは `TypeDetailFurigana` が `useSyncExternalStore` でこの状態を購読し、`furiganaEmphasisIndex` 位置のふりがなへアクセントクラスを付ける。

## 9. レイアウトと操作

- `position: fixed` で右下に配置する
- safe-area を考慮する
- 画像は `next/image` で `/line-stamp-main.png` を表示する
- 外部リンクは通常の `<a>` を使い、`target="_blank"` と `rel="noreferrer"` を付ける
- 展開、たたむ、閉じる操作はボタンで行う
- `prefers-reduced-motion: reduce` ではモーションを抑制する

## 10. アプリ本体との関係

- LINE スタンプ生成スキルの成果物置き場は `data/line-stamp-images/` と `output/line-stamp-images/`
- 右下ポップ導線が直接使う画像は `public/line-stamp-main.png`
- 商品 URL は `lib/site.ts` の `LINE_STAMP_URL`
- `/diagnosis` と `/secret/` には導線を出さない

## 11. 検証観点

- `/` と `/types/[typeCode]/` で導線が表示されること
- `/diagnosis` と `/secret/` で導線が表示されないこと
- 初回表示が `collapsed` であること
- 展開 / たたむ状態が `localStorage` に保存されること
- 閉じる操作は永続保存されないこと
- CTA クリックで LINE STORE が別タブで開くこと
- CTA クリック後、タイプページのふりがな強調色が切り替わること
- モバイルで主コンテンツを過度に覆わないこと
