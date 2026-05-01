# LINE スタンプ右下ポップ導線 仕様書

## 1. 文書の位置づけ

本書は、現行コードに実装済みの **LINE スタンプ右下ポップ導線** と、時計ドラッグ連動演出の変更方針を整理する文書である。
基本構成は `components/layout/line-stamp-floating-promo/` を正本として記述し、時計ドラッグ連動演出の詳細は [line-stamp-clock-interaction-spec.md](./line-stamp-clock-interaction-spec.md) を参照する。

関連文書:

- [specification.md](./specification.md)
- [frontend-directory-structure-spec.md](./frontend-directory-structure-spec.md)
- [tech-stack-spec.md](./tech-stack-spec.md)
- [line-stamp-skill-spec.md](./line-stamp-skill-spec.md)
- [line-stamp-clock-interaction-spec.md](./line-stamp-clock-interaction-spec.md)

## 2. 目的

診断サイトの世界観を壊さずに、LINE スタンプ商品への送客を作る。

重視すること:

- 右下の小さな導線として存在に気づける
- 診断開始フォームやタイプ詳細の読解を邪魔しない
- サイト本体の主 CTA より強く出すぎない
- 時計の長針をドラッグした操作を、タイプページやトップページ側の小さな演出へ反映する

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

## 4. 実装ファイルと追加予定ファイル

```text
components/
  layout/
    line-stamp-floating-promo/
      line-stamp-floating-promo.tsx
      line-stamp-floating-promo-client.tsx
      line-stamp-floating-promo.module.css

lib/
  line-stamp-store-visit.ts
  line-stamp-clock-interaction.ts
  site.ts

public/
  line-stamp-main.png
```

責務:

- `line-stamp-floating-promo.tsx`: Server Component。リンク URL と表示文言を決める
- `line-stamp-floating-promo-client.tsx`: Client Component。開閉、非表示、`localStorage`、CTA クリック、時計長針の自動回転とドラッグ操作を扱う
- `line-stamp-floating-promo.module.css`: 固定配置、カード、たたみ表示、モーション
- `lib/line-stamp-store-visit.ts`: LINE STORE 訪問済み状態と通知イベント。時計ドラッグ連動演出のトリガーには使わない
- `lib/line-stamp-clock-interaction.ts`: 時計操作の一時状態と通知イベント。実装時に追加する想定
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

## 8. 時計ドラッグ連動演出

たたみ状態の導線には 12 個の数字を持つ時計盤と長針を表示する。

長針の基本挙動:

- 通常時は 12 秒で 1 周する
- `prefers-reduced-motion: reduce` では自動回転しない
- ドラッグ中は自動回転を止める
- ドラッグ中の角度から、最も近い時刻番号を `selectedHour` として求める

ページ側の発火条件:

- `isDragging === true`
- `selectedHour === furiganaEmphasisIndex`

タイプ詳細ページでは、この条件を満たす間だけ `furiganaEmphasisIndex` 位置のふりがなを光らせる。

トップページでは、この条件を満たす 16 タイプ一覧カードを一時的にきらりと光らせる。一致するカードが複数ある場合は同時に光ってよい。

時計操作状態は一時 UI 状態であり、`localStorage` に保存しない。LINE STORE 訪問済み状態は、この演出のトリガーとして使わない。

## 9. レイアウトと操作

- `position: fixed` で右下に配置する
- safe-area を考慮する
- 画像は `next/image` で `/line-stamp-main.png` を表示する
- 外部リンクは通常の `<a>` を使い、`target="_blank"` と `rel="noreferrer"` を付ける
- 展開、たたむ、閉じる操作はボタンで行う
- たたみ状態の時計盤はドラッグでき、ドラッグ操作が導線展開クリックとして扱われないようにする
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
- たたみ状態の長針が 12 秒で 1 周すること
- 時計をドラッグでき、ドラッグ中は自動回転が止まること
- 時計ドラッグ中かつ時刻一致時だけ、タイプページのふりがな強調色が切り替わること
- 時計ドラッグ中かつ時刻一致時だけ、トップページの 16 タイプ一覧カードがきらりと光ること
- CTA クリックだけでは、ふりがな強調やタイプ一覧カードのきらり演出が発火しないこと
- モバイルで主コンテンツを過度に覆わないこと
