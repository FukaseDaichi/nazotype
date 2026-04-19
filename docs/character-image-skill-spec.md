# キャラクター画像生成スキル仕様書

## 1. 文書の目的

本書は `skills/nazotype-chibi-character-images/` の現行運用を整理する文書である。

対象は **タイプ別ちびキャラ基準画像** の生成・更新であり、通常頭身の立ち絵一括生成や LINE スタンプの文字入れまでは扱わない。

## 2. 対象スキル

- スキル名: `nazotype-chibi-character-images`
- 入口: `skills/nazotype-chibi-character-images/SKILL.md`
- 主ワークフロー: Codex 内蔵 `image_gen`

補足:

- `skills/nazotype-chibi-character-images/scripts/` 配下には fal.ai 系の旧ユーティリティが残る
- それらは主に下流スキル互換のためであり、本スキルの透過処理フォールバックとしては使わない

## 3. 入力

### 3.1 正本データ

- `data/types/*.json`

必要項目:

- `typeCode`
- `typeName`
- `visualProfile`
- `imagePrompt`
- `negativePrompt`

ただし、主に参照するのは `visualProfile` であり、`imagePrompt` / `negativePrompt` は補助情報として扱う。

### 3.2 参照画像

優先順位は次の通り。

1. 承認済み `public/types/{typeCode}_chibi.png`
2. 承認済み `public/types/{typeCode}.png`
3. バッチ全体で共通に使うシリーズ絵柄アンカー
4. 明示的に許可した場合のみ prompt-only fallback

役割:

- `*_chibi.png`: ちび比率、シルエット、簡略化方向の正本
- `*.png`: 顔、髪、衣装、持ち物、人格の正本
- シリーズ絵柄アンカー: 筆致、仕上げ、全体の絵柄統一

### 3.3 環境変数

本スキルの主経路では API キー不要。

`.env.character-images` は、旧 fal.ai ユーティリティや下流スキルが必要とする場合だけ使う。

## 4. 生成対象

生成対象は各タイプ 1 枚の基準ちびキャラ PNG。

必須条件:

- 1 キャラのみ
- 明確にちび体型
- 大胆で読みやすいポーズ
- 背景透過
- 既存タイプ画像と同一人物に見えること

## 5. ワークフロー

1. `data/types/{typeCode}.json` を読む
2. 必要な参照画像を `view_image` で会話へ載せる
3. `image_gen` の `generate` を使って候補を作る
4. 外れた場合は 1 点だけ修正要求を足して再生成する
5. 透過をチェッカー背景で確認する
6. 採用画像を `public/types/{typeCode}_chibi.png` へ反映する
7. 必要なら監査用成果物を `output/character-images/{typeCode}/chibi/` に残す

原則:

- `edit` は near-final 画像への限定修正だけに使う
- 背景除去のための edit 多用は避ける
- グリーンバック生成 + クロマキー除去は既定にもフォールバックにも使わない
- 透過が不安定な場合でも `background_remover.py` へ退避せず、prompt 修正と再生成で合わせる

## 6. 出力

公開用の正本:

```text
public/types/{typeCode}_chibi.png
```

任意の監査用出力:

```text
output/character-images/{typeCode}/chibi/
  prompt.txt
  selected.png
  meta.json
```

`$CODEX_HOME/generated_images/...` は作業中の一時出力であり、公開用正本の置き場ではない。

## 7. 実装上の挙動

- 標準立ち絵を先に生成する前提は持たない
- `negative prompt` 専用フィールドには依存しない
- 透過はモデル側へ直接要求する
- 透明化に失敗した場合は再生成を優先する
- `background_remover.py` はこのスキルの手段に含めない
- 既存の承認済みちび画像がある場合、それを最優先の同一性アンカーにする

## 8. アプリ本体との関係

- アプリ本体が直接参照する配信用ちび画像は `public/types/{typeCode}_chibi.png`
- OGP や LINE スタンプ系スキルは、この承認済みちび画像を最重要参照画像として扱う
- `output/character-images/` は監査や比較用の作業置き場であり、アプリ本体の直接参照先ではない
