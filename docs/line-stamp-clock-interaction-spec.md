# LINE スタンプ時計連動演出 変更仕様書

## 1. 文書の位置づけ

本書は、`components/layout/line-stamp-floating-promo/line-stamp-floating-promo-client.tsx` の時計型導線と、`furiganaEmphasisIndex` を使うページ内演出の変更仕様を定義する。

関連文書:

- [specification.md](./specification.md)
- [line-stamp-promo-component-design.md](./line-stamp-promo-component-design.md)
- [type-design-spec.md](./type-design-spec.md)
- [tech-stack-spec.md](./tech-stack-spec.md)
- [frontend-directory-structure-spec.md](./frontend-directory-structure-spec.md)

本仕様を実装した後は、LINE STORE 訪問済み状態によるふりがな強調よりも、本書の時計連動演出を正とする。

## 2. 目的

LINE スタンプ右下ポップ導線を、単なる外部送客リンクではなく、サイト内の隠し要素に触れる小さな操作体験として扱う。

重視すること:

- 右下導線の小ささと邪魔しなさは維持する
- 時計の長針を触って動かせることが直感的に分かる
- 長針の位置と `furiganaEmphasisIndex` が一致した瞬間だけ、ページ側に反応が出る
- 16 タイプ一覧とタイプ詳細のメイン画像は、ドラッグ中でなくても時刻一致で発火させる
- タイプ詳細のふりがな強調だけは、ユーザーがドラッグしているときだけ発火させる

## 3. 対象範囲

対象ページ:

- `/`
- `/types/[typeCode]/`

対象コンポーネント:

- `LineStampFloatingPromoClient`
- `TypeDetailFurigana`
- `AllTypesSection`
- `TypeOgpLinkCard`

対象外:

- 診断ロジック
- 共有キー
- LINE スタンプの商品 URL
- LINE スタンプ画像生成スキル

本仕様ではトップページの既存「16タイプ一覧」を対象とする。

## 4. 時計導線の仕様

### 4.1 表示

展開カード状態の右下ポップ導線に、12 個の数字を持つ時計盤と長針を表示する。

- 時計盤は 1 から 12 までの時刻目盛りを持つ
- 長針は時計中心を軸に回転する
- 長針はドラッグ可能な主操作対象である
- 展開カードの CTA `LINE STOREで見る` は従来通り外部リンクとして残す

時計のドラッグ操作が、外部リンク CTA やカード開閉操作として扱われてはならない。

### 4.2 自動回転

長針は通常時、12 秒で 1 周する。

- 1 周: 360 度
- 周期: 12,000ms
- 1 秒あたりの角速度: 30 度
- `prefers-reduced-motion: reduce` では自動回転しない
- ドラッグ中は自動回転を停止し、ユーザー操作を優先する
- ドラッグ終了後は、終了時点の角度から自動回転を再開する

自動回転中も `selectedHour` は更新する。トップページのタイプカードとタイプ詳細ページのメイン画像は、自動回転中でも時刻一致で発火してよい。

### 4.3 ドラッグ操作

時計盤または長針を pointer down した時点で、時計操作状態を `isDragging: true` にする。

ドラッグ中は、時計中心からポインター座標へ向かうベクトルを長針の角度として扱う。

- 12 時方向を 0 度とする
- 時計回りを正方向とする
- 3 時方向は 90 度
- 6 時方向は 180 度
- 9 時方向は 270 度

pointer up / pointer cancel / pointer capture lost で `isDragging: false` に戻す。

## 5. `furiganaEmphasisIndex` と時計位置の対応

`furiganaEmphasisIndex` は、従来通り 1 始まりの強調位置である。本仕様では同じ値を時計盤の時刻番号としても使う。

| 値 | 時計位置 | 角度 |
| --- | --- | --- |
| `1` | 1 時 | 30 度 |
| `2` | 2 時 | 60 度 |
| `3` | 3 時 | 90 度 |
| `4` | 4 時 | 120 度 |
| `5` | 5 時 | 150 度 |
| `6` | 6 時 | 180 度 |
| `7` | 7 時 | 210 度 |
| `8` | 8 時 | 240 度 |
| `9` | 9 時 | 270 度 |
| `10` | 10 時 | 300 度 |
| `11` | 11 時 | 330 度 |
| `12` | 12 時 | 0 度 |

選択中の時刻は、長針角度を最も近い 30 度刻みに丸めて求める。

発火条件:

```text
selectedHour === furiganaEmphasisIndex
```

ふりがな強調の発火条件だけは、上記に加えて `isDragging === true` を必要とする。

境界では最も近い時刻を採用する。同じ距離になった場合は、実装側で一貫した丸め規則を持てばよい。

## 6. 状態共有

時計操作状態は一時的な UI 状態として扱い、`localStorage` には保存しない。

推奨する状態:

```ts
type LineStampClockInteractionState = {
  isDragging: boolean;
  angleDeg: number;
  selectedHour: number | null;
};
```

推奨する通知イベント名:

```text
nazotype:line-stamp-clock-interaction
```

実装では `useSyncExternalStore` で購読できる小さな外部 store を `lib/line-stamp-clock-interaction.ts` に置くことを推奨する。SSR 時の snapshot は `isDragging: false`, `selectedHour: null` とする。

## 7. `/types/[typeCode]/` の演出

タイプ詳細ページでは、対象タイプの `furiganaEmphasisIndex` と時計の `selectedHour` が一致したとき、メインのタイプ画像を光らせる。

メイン画像の発火条件:

- 時計の長針が、表示中タイプの `furiganaEmphasisIndex` と同じ時刻を指している

ふりがな強調の発火条件:

- ユーザーが時計をドラッグ中である
- 時計の長針が、表示中タイプの `furiganaEmphasisIndex` と同じ時刻を指している

非発火条件:

- LINE STORE へ遷移しただけ
- ふりがな強調については、長針が自動回転で該当位置を通過しただけ
- ふりがな強調については、ドラッグ終了後に長針が該当位置で止まっているだけ

演出:

- メイン画像の枠と画像面に gold 系のきらり発光を出す
- 既存のふりがな文字単位表示を使う
- 強調対象は `furiganaEmphasisIndex - 1` の文字
- 強調色は gold 系を基本とする
- ふりがなは発火中だけアクセントクラスを付け、発火条件を外れたら即座に戻す

## 8. `/` の 16 タイプ一覧演出

トップページでは、16 タイプ一覧の各カードが自身の `furiganaEmphasisIndex` を持つ。

時計の `selectedHour` とカードの `furiganaEmphasisIndex` が一致した場合、そのカードに「きらり」と光る演出を出す。

発火条件:

- カードの `furiganaEmphasisIndex` と時計の `selectedHour` が一致している

挙動:

- 一致するカードは複数あってよい
- 該当カードは同時に光ってよい
- カードのリンク機能は維持する
- 演出によるレイアウトシフトを起こさない
- `prefers-reduced-motion: reduce` では光の走査アニメーションを止め、静的な枠線・発光だけにする

推奨する見た目:

- カードの画像面を斜めに横切る短い光の筋
- gold 系の一瞬の枠線発光
- 文字情報を読めなくするほど強い白飛びは避ける
- ホバー演出とは別の、ドラッグ連動中だけの一時演出にする

## 9. LINE STORE 訪問済み状態との関係

本仕様では、LINE STORE 訪問済み状態をページ側演出のトリガーに使わない。

- CTA クリックは外部 LINE STORE を開くための操作である
- CTA クリックだけでタイプ詳細のふりがなを光らせない
- CTA クリックだけでトップページのタイプ一覧を光らせない
- 既存の `nazotype:line-stamp-store-visited:v1` を互換目的で残す場合でも、本仕様の演出判定には使わない

## 10. アクセシビリティ

時計操作は、ポインター操作に依存しすぎないようにする。

- 時計盤のタップ領域は 44px 以上を確保する
- 時計操作対象には明確な focus-visible を出す
- 展開ボタンの中に別の button を入れるような入れ子の interactive 要素は避ける
- 時計操作対象は `role="slider"` 相当の情報を持たせることを検討する
- キーボードでは左右キーまたは上下キーで時刻を 1 つずつ動かせるようにする
- キーボード操作時も、操作中だけ `isDragging` 相当の active 状態を短時間立て、同じ演出を確認できるようにする

## 11. 検証観点

- 展開カード状態の長針が 12 秒で 1 周すること
- `prefers-reduced-motion: reduce` では自動回転しないこと
- 時計をドラッグできること
- 時計をドラッグしても、意図せず導線が展開しないこと
- `/types/[typeCode]/` で、ドラッグ中かつ対象時刻一致時だけふりがなが光ること
- `/types/[typeCode]/` で、ドラッグ中でなくても対象時刻一致時にメイン画像が光ること
- `/types/[typeCode]/` で、LINE STORE クリックだけではふりがなが光らないこと
- `/types/[typeCode]/` で、自動回転通過だけではふりがなが光らないこと
- `/` で、ドラッグ中でなくても対象時刻一致時に該当タイプカードがきらりと光ること
- `/` で、対象時刻が一致する複数カードが同時に光ること
- ドラッグ終了後、ふりがな強調が解除されること
- モバイルの片手操作で主コンテンツを過度に覆わないこと
- きらり演出がテキスト可読性を壊さないこと
