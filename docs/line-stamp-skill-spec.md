# LINE スタンプ生成スキル設計書

## 1. 文書の目的

本書は、キャラクター画像生成スキルを土台として、LINE スタンプ用画像を生成する新規スキル群の設計案を定義する文書である。
現時点では未実装の設計であり、現行運用の整理ではなく、今後実装するための分割方針と入出力契約を定める。

## 2. 設計方針

今回の LINE スタンプ生成は、1 つのスキルにまとめず、次の 2 段階に分割する。

- `nazotype-line-stamp-prompts`
  構図、表情、ポーズ、余白、役割別の見せ方を決めて、画像生成用 prompt manifest を作る
- `nazotype-line-stamp-images`
  prompt manifest を入力として、実際の画像生成、透過化、リサイズ、最終 PNG 書き出しを行う

この分割により、次の利点を得る。

- 構図設計だけを先にレビューできる
- 画像生成時に勝手にポーズや見せ方が変わるのを防げる
- 失敗時に prompt 設計と画像生成を切り分けて再実行できる
- 将来、別モデルや別 API に切り替える場合でも、manifest 契約を保てる

## 3. 出力要件

LINE スタンプ用の最終成果物は次の要件を満たす。

| 種別         | ファイル名     | サイズ         |
| ------------ | -------------- | -------------- |
| メイン画像   | `main.png`     | `240 x 240` px |
| タブ画像     | `tab.png`      | `96 x 74` px   |
| スタンプ画像 | 任意の連番 PNG | `370 x 320` px |

共通要件:

- フォーマットは PNG
- 背景は透過
- RGB
- 72dpi 以上
- 各画像は 1MB 以下
- 画像サイズは偶数
- コンテンツ外周には約 10px の余白を確保する
- スタンプ画像では文字も NanoBanana の生成結果に含める

設計上の既定値:

- スタンプ画像は原則 `370 x 320` px の固定キャンバスで書き出す
- `main.png` と `tab.png` は別 prompt を持つ専用アセットとして扱う
- モデルに最終サイズを直接作らせず、高解像度で生成した後にローカルで透過化と整形を行う
- 文字入れはローカル合成せず、NanoBanana の prompt に明示したうえで画像内に直接描かせる
- 透過処理はモデル任せにせず、グリーンバック生成後にプログラムで行う

## 4. 対象スキル

### 4.1 `nazotype-line-stamp-prompts`

目的:

- LINE スタンプごとの構図案を作る
- 画像生成に渡す最終 prompt、表示文言、文字デザイン指定、review 用メタデータを作る
- `main`、`tab`、`stamp` ごとの役割差を明文化する

責務:

- `data/types/*.json` からキャラクター同一性の正本を読む
- スタンプセット定義を読み、各スタンプの意図を解釈する
- 表情、ポーズ、カメラアングル、視線、フレーミング、余白方針を決める
- 各 asset に入れる文言と、可愛いスタンプ風の文字デザイン指定を決める
- 画像生成用 `prompt` と `negativePrompt` を確定する
- `data/types/*.json` 由来の `文字なし` / `文字` 系の禁止語は LINE スタンプ用途では `negativePrompt` に持ち込まない
- 画像生成スキルへ渡す `manifest.json` を出力する

非責務:

- 画像 API 呼び出し
- 背景透過処理
- PNG 最適化
- 最終サイズ書き出し

### 4.2 `nazotype-line-stamp-images`

目的:

- prompt manifest を受け取り、文字入りの LINE スタンプ納品用 PNG を作る

責務:

- `manifest.json` を読む
- 参照画像を解決する
- 画像生成 API を呼ぶ
- prompt に含まれる文字指定を NanoBanana へそのまま渡す
- グリーンバック除去で透過 PNG を作る
- 最終キャンバスに収める
- サイズ、容量、余白、透過、RGB を検証する
- 納品物と作業 artifacts を保存する

非責務:

- スタンプごとの構図再設計
- テキスト文言そのものの再解釈
- キャラクター設定の変更

## 5. 既存スキルとの関係

キャラクター画像生成スキルとの関係は次の通りとする。

- キャラクター同一性の正本は引き続き `data/types/*.json`
- LINE スタンプでは、既存の `chibi` 系資産を優先的な参照画像として使う
- 背景透過は既存と同様に「グリーンバック生成 + ローカル除去」を基本とする
- prompt 生成ルールは既存 `prompt_builder.py` の考え方を継承しつつ、LINE スタンプ向けに拡張する
- 文字入れは既存キャラクター画像スキルの責務外とし、LINE スタンプ専用 workflow で扱う

優先参照順:

1. 承認済みの LINE スタンプ基準画像
2. `public/types/{typeCode}_chibi.png`
3. `output/character-images/{typeCode}/chibi/transparent.png`
4. 明示指定がある場合だけ prompt-only fallback

## 6. 新規入力データ

LINE スタンプでは、既存 `data/types/*.json` だけでは足りない。
スタンプ固有の文言や用途を持つ、新しいセット定義を追加する。

推奨配置:

```text
data/line-stamps/{setId}.json
```

想定フィールド:

- `setId`
- `typeCode`
- `packageName`
- `locale`
- `style`
- `main`
- `tab`
- `stamps`

最小構成の例:

```json
{
  "setId": "alhn-daily-replies",
  "typeCode": "ALHN",
  "packageName": "ALHN daily replies",
  "locale": "ja",
  "style": "character-only",
  "main": {
    "intent": "package cover",
    "text": "ALHN",
    "textDesignPrompt": "rounded cute bubble lettering, thick outline, high contrast, sticker-like"
  },
  "tab": {
    "intent": "small icon",
    "text": "A!",
    "textDesignPrompt": "very short rounded sticker lettering, bold, readable at small size"
  },
  "stamps": [
    {
      "id": "01",
      "text": "了解",
      "intent": "acknowledgement",
      "textDesignPrompt": "cute handwritten Japanese sticker text, bold rounded strokes, white fill, pink outline"
    },
    {
      "id": "02",
      "text": "ありがとう",
      "intent": "thanks",
      "textDesignPrompt": "cute handwritten Japanese sticker text, bold rounded strokes, white fill, yellow outline"
    }
  ]
}
```

V1 では `stamps[].text` を必須とし、`textDesignPrompt` も合わせて保持する。
文字は後段で合成せず、NanoBanana の prompt で直接描かせる前提とする。

## 7. 受け渡し manifest

2 スキル間の正本は `manifest.json` とする。
画像生成スキルは、この manifest を唯一の prompt 入力として扱い、構図を再解釈しない。

推奨出力先:

```text
output/line-stamp-prompts/{setId}/manifest.json
```

想定構造:

```json
{
  "schemaVersion": "v1",
  "skill": "nazotype-line-stamp-prompts",
  "setId": "alhn-daily-replies",
  "typeCode": "ALHN",
  "style": "character-only",
  "referencePolicy": {
    "preferredVariant": "chibi",
    "allowPromptOnlyFallback": false
  },
  "assets": [
    {
      "role": "main",
      "fileName": "main.png",
      "text": "ALHN",
      "textDesignPrompt": "rounded cute bubble lettering, thick outline, high contrast, sticker-like",
      "textPlacement": "bottom-center",
      "canvas": { "width": 240, "height": 240 },
      "paddingPx": 10,
      "prompt": "...",
      "negativePrompt": "...",
      "renderTextInModel": true
    },
    {
      "role": "tab",
      "fileName": "tab.png",
      "text": "A!",
      "textDesignPrompt": "very short rounded sticker lettering, bold, readable at small size",
      "textPlacement": "right",
      "canvas": { "width": 96, "height": 74 },
      "paddingPx": 10,
      "prompt": "...",
      "negativePrompt": "...",
      "renderTextInModel": true
    },
    {
      "role": "stamp",
      "id": "01",
      "fileName": "01.png",
      "text": "了解",
      "intent": "acknowledgement",
      "textDesignPrompt": "cute handwritten Japanese sticker text, bold rounded strokes, white fill, pink outline",
      "cameraDirection": "やや煽りのある斜め前からの中距離ショット",
      "expressionDirection": "相手を見透かすような半笑い",
      "textPlacement": "top-right",
      "canvas": { "width": 370, "height": 320 },
      "paddingPx": 10,
      "prompt": "...",
      "negativePrompt": "...",
      "renderTextInModel": true
    }
  ]
}
```

必須ルール:

- `assets` は `main`、`tab`、`stamp` を混在可能にする
- 各 asset は最終キャンバスサイズを manifest 上で確定する
- 画像生成スキルは `prompt` を勝手に補わず、必要な追加は共通安全制約だけに限定する
- 各 asset は `text`、`textDesignPrompt`、`textPlacement` を持つ
- 各 asset は必要に応じて `poseDirection`、`cameraDirection`、`expressionDirection` を持てる
- `renderTextInModel` は常に `true` とする
- 文字は prompt で完全一致指定し、ローカル後乗せでは扱わない

## 8. Prompt スキルの設計

### 8.1 入力

- `data/types/*.json`
- `data/line-stamps/{setId}.json`
- 必要に応じて既存 `public/types/{typeCode}_chibi.png` の参照情報

### 8.2 出力

既定出力先:

```text
output/line-stamp-prompts/{setId}/
```

出力構成:

```text
output/line-stamp-prompts/{setId}/
  manifest.json
  review.md
  main/
    prompt.txt
    negative_prompt.txt
    meta.json
  tab/
    prompt.txt
    negative_prompt.txt
    meta.json
  stamps/
    01/
      prompt.txt
      negative_prompt.txt
      spec.json
    02/
      prompt.txt
      negative_prompt.txt
      spec.json
```

### 8.3 Prompt 設計ルール

共通:

- キャラクターは 1 人のみ
- asset に定義された文字を必ず入れる
- 指定文字は誤字なく完全一致で描かせる
- 文字は可愛いスタンプ風のデザインにする
- 文字は太め、丸み、縁取り、高コントラストを基本とする
- ロゴ、透かし、指定外の文字は入れない
- 文字の完全一致、可読性、タイポグラフィ品質は `prompt` 側で強く指示し、`negativePrompt` では文字自体を否定しない
- 背景は後段で透過化しやすい単色前提にする
- シルエットが欠けない
- 約 10px の余白を後段で確保できる構図にする
- 文字もキャラクターもキャンバス内で欠けない

`main`:

- パッケージの顔になる 1 枚
- 240 x 240 の正方形で視認性が落ちない構図
- 全身寄りでもよいが、感情とキャラ性が最優先
- 短い文字を添えても破綻しないレイアウトにする

`tab`:

- 96 x 74 の小サイズで識別できる構図
- 顔、髪型、象徴的な小物を優先する
- 全身ではなく、上半身または顔寄りを許容する
- 文字は極短にし、潰れない太さとコントラストを優先する

`stamp`:

- ジェスチャーや感情が一目で分かる
- 370 x 320 の横長キャンバスで中央重心を基本とする
- 文字とキャラクターが競合しない位置を指定する
- 文字自体もスタンプらしい可愛さを持つように design prompt を入れる

### 8.4 Review Gate

prompt スキルの完了条件:

- すべての asset に `prompt` と `negativePrompt` がある
- `negativePrompt` に `文字`、`text`、`letters` など文字生成を阻害する語が入っていない
- すべての asset に `text` と `textDesignPrompt` がある
- `main`、`tab`、`stamp` の役割差が manifest 上で明文化されている
- 参照画像ポリシーが確定している
- 人間が review できる `review.md` がある

## 9. 画像生成スキルの設計

### 9.1 入力

- `output/line-stamp-prompts/{setId}/manifest.json`
- 参照画像
- `.env.character-images`

必要環境変数:

- `NANOBANANA_API_KEY`
- `NANOBANANA_API_BASE`
- `NANOBANANA_REFERENCE_BASE_URL` 任意

### 9.2 出力

既定出力先:

```text
output/line-stamp-images/{setId}/
```

出力構成:

```text
output/line-stamp-images/{setId}/
  batch-report.json
  validation-report.json
  main/
    prompt.txt
    request.json
    task.json
    raw.png
    transparent.png
    final.png
    meta.json
  tab/
    prompt.txt
    request.json
    task.json
    raw.png
    transparent.png
    final.png
    meta.json
  stamps/
    01/
      prompt.txt
      request.json
      task.json
      raw.png
      transparent.png
      final.png
      meta.json
  package/
    main.png
    tab.png
    stamps/
      01.png
      02.png
```

`package/` 配下を最終納品物とする。

### 9.3 生成フロー

1. manifest を読む
2. 役割ごとに参照画像を解決する
3. 高解像度のグリーンバック画像を生成する
4. ローカルで背景除去して `transparent.png` を作る
5. 最終キャンバスへフィット配置する
6. PNG を最適化して 1MB 以下へ収める
7. 検証結果を `validation-report.json` に書く

### 9.4 画像生成ルール

- モデルには最終の小サイズを直接要求しない
- 生成時は十分な余白を持つ高解像度ソースを作る
- 最終配置で `paddingPx` を守る
- `main` と `tab` は単純リサイズで流用せず、manifest に従って個別生成する
- 文字は必ずモデルに描かせる
- 文字デザインは prompt 内で明示し、可愛いスタンプ風タイポグラフィとして扱う
- 透過処理は必ずローカルプログラムで行う

### 9.5 検証ルール

各最終 PNG で次を確認する。

- 指定サイズと一致する
- 幅と高さが偶数
- カラーモデルが RGB ベースの透過 PNG である
- 透過背景を持つ
- 72dpi 以上のメタデータを持つ
- 1MB 以下
- 外周余白が約 10px ある
- 被写体が欠けていない
- 文字が欠けていない
- 文字が読める太さとコントラストを持つ
- 指定文言と実際の文字列が一致している
- 緑フリンジが残っていない

## 10. 推奨スクリプト構成

### 10.1 Prompt スキル側

推奨スクリプト:

- `scripts/generate_line_stamp_prompt_set.py`
- `scripts/line_stamp_prompt_builder.py`
- `scripts/write_line_stamp_manifest.py`

### 10.2 画像生成スキル側

推奨スクリプト:

- `scripts/generate_line_stamp_images.py`
- `scripts/line_stamp_compositor.py`
- `scripts/line_stamp_validator.py`

既存からの再利用候補:

- キャラクター画像生成スキルの `scripts/nanobanana_client.py`
- キャラクター画像生成スキルの `scripts/background_remover.py`

## 11. 役割別の構図ポリシー

`main`、`tab`、`stamp` は同じキャラクターでも構図目的が違うため、同一 prompt の使い回しを禁止する。

`main`:

- パッケージ全体の印象を代表する
- 感情表現は強めでもよい
- 1 枚でキャラクターの魅力が伝わることを優先する

`tab`:

- 極小表示で識別できることを最優先にする
- 細かいポーズより顔の特徴を優先する

`stamp`:

- 感情やリアクションが瞬時に分かる
- 複数枚を並べたときの一貫性を保つ

## 12. V1 の非対象

今回の初期設計では、次を非対象とする。

- 自動採用判定だけで全 stamp を確定すること
- LINE へのアップロード自動化
- アニメーションスタンプ
- ローカル合成による後乗せ文字入れ

## 13. 将来拡張

将来は次を追加できる設計にする。

- 文字デザインテンプレート辞書
- 表情セットの半自動展開
- 複数候補からの自動選定
- 納品 ZIP の自動生成
- 公開用 `public/` アセットとの連携

## 14. 実装開始時の優先順

実装は次の順で進めるのが妥当である。

1. `data/line-stamps/{setId}.json` の入力仕様を固める
2. prompt スキルで `manifest.json` を出せるようにする
3. image スキルで `stamp` のみ先に生成できるようにする
4. `main` と `tab` を追加する
5. 透過、容量、dpi の自動検証を仕上げる
