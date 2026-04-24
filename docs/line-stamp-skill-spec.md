# LINE スタンプ生成スキル運用仕様書

## 1. 文書の目的

本書は、現行リポジトリに存在する LINE スタンプ生成ワークフローを整理する文書である。

対象スキル:

- `skills/madamistype-line-stamp-prompts/`
- `skills/madamistype-line-stamp-images/`

補足:

- リポジトリ名は `nazotype` だが、スキル名は現時点でも `madamistype-*` のまま残っている
- 本書は将来案ではなく、現行の入出力契約と実装フローを記述する

## 2. 全体構成

LINE スタンプ生成は 2 段階に分かれている。

### 2.1 Prompt スキル

- スキル名: `madamistype-line-stamp-prompts`
- 入口: `skills/madamistype-line-stamp-prompts/SKILL.md`
- 主スクリプト: `skills/madamistype-line-stamp-prompts/scripts/generate_line_stamp_prompt_set.py`

役割:

- `data/line-stamps/*.json` を読む
- `data/types/*.json` を読む
- role ごとの prompt / negativePrompt を組み立てる
- `manifest.json` と review 用成果物を書く

### 2.2 Image スキル

- スキル名: `madamistype-line-stamp-images`
- 入口: `skills/madamistype-line-stamp-images/SKILL.md`
- 主スクリプト: `skills/madamistype-line-stamp-images/scripts/generate_line_stamp_images.py`

役割:

- `output/line-stamp-prompts/*/manifest.json` を読む
- fal.ai を呼ぶ
- グリーンバック除去で透過 PNG を作る
- 最終キャンバスへ配置する
- 検証レポートと package を書く

## 3. 入力

### 3.1 正本データ

- `data/types/*.json`
- `data/line-stamps/*.json`

### 3.2 参照画像

Image スキルは原則として `public/types/{typeCode}_chibi.png` の公開 URL を参照画像に使う。

補足:

- `referencePolicy.allowPromptOnlyFallback = true` の場合だけ prompt-only fallback を許可する
- Prompt スキル側では `output/character-images/{typeCode}/chibi/transparent.png` なども候補に入れる実装がある

### 3.3 環境変数

`.env.character-images` を利用する。

- `FAL_KEY`
- `FAL_QUEUE_URL`
- `FAL_MODEL`
- `FAL_EDIT_MODEL`
- `FAL_REFERENCE_BASE_URL`

### 3.4 生成依存

Image スキルの最終生成には以下が必要:

- `opencv-python`
- `numpy`
- `Pillow`

任意:

- `pytesseract`

## 4. セット定義

`data/line-stamps/{setId}.json` は少なくとも次を持つ。

- `setId`
- `typeCode`
- `packageName`
- `locale`
- `style`
- `main`
- `tab`
- `stamps`

各 asset で使う主な項目:

- `intent`
- `text`
- `textDesignPrompt`
- `poseDirection`
- `cameraDirection`
- `expressionDirection`
- `textPlacement`
- `textLayoutPrompt`
- `textEffectPrompt`

## 5. Prompt スキルの出力

既定の出力先:

```text
output/line-stamp-prompts/
```

出力構成:

```text
output/line-stamp-prompts/
  batch-report.json
  {setId}/
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
```

`manifest.json` の主な項目:

- `setId`
- `typeCode`
- `style`
- `referencePolicy`
- `assets[]`

各 asset の主な項目:

- `role`
- `fileName`
- `text`
- `textDesignPrompt`
- `textPlacement`
- `poseDirection`
- `cameraDirection`
- `expressionDirection`
- `textLayoutPrompt`
- `textEffectPrompt`
- `canvas.width`
- `canvas.height`
- `paddingPx`
- `prompt`
- `negativePrompt`
- `renderTextInModel`

## 6. Image スキルの出力

既定の出力先:

```text
output/line-stamp-images/
```

出力構成:

```text
output/line-stamp-images/
  batch-report.json
  {setId}/
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
      ...
    stamps/
      01/
        ...
    package/
      main.png
      tab.png
      stamps/
        01.png
```

各成果物の意味:

- `raw.png`: fal.ai から取得した元画像
- `transparent.png`: グリーンバック除去後の透過 PNG
- `final.png`: 最終キャンバスに収めた納品候補
- `validation-report.json`: サイズ、余白、透明度、ファイルサイズの検証結果
- `package/`: 納品用に並べたファイル群

## 7. サイズ要件

現行ワークフローで扱う最終キャンバス:

| 種別 | ファイル名 | サイズ |
| --- | --- | --- |
| メイン画像 | `main.png` | `240 x 240` px |
| タブ画像 | `tab.png` | `96 x 74` px |
| スタンプ画像 | 任意連番 PNG | `370 x 320` px |

共通要件:

- PNG
- 背景透過
- 1MB 以下を目標に検証する
- 外周余白は `paddingPx` を基準に扱う
- 文字はローカル合成せず、モデル出力に含める

## 8. 実行コマンド

### 8.1 Prompt スキル

```bash
python skills/madamistype-line-stamp-prompts/scripts/generate_line_stamp_prompt_set.py --all
python skills/madamistype-line-stamp-prompts/scripts/generate_line_stamp_prompt_set.py --sets altc-iku-trial
python skills/madamistype-line-stamp-prompts/scripts/generate_line_stamp_prompt_set.py --sets altc-iku-trial --overwrite
```

### 8.2 Image スキル

```bash
python skills/madamistype-line-stamp-images/scripts/generate_line_stamp_images.py --all
python skills/madamistype-line-stamp-images/scripts/generate_line_stamp_images.py --set-ids altc-iku-trial
python skills/madamistype-line-stamp-images/scripts/generate_line_stamp_images.py --set-ids altc-iku-trial --dry-run
```

## 9. 実装上の挙動

- Prompt スキルは `manifest.json` を唯一の prompt 正本として生成する
- Image スキルは manifest を再解釈せず、それを入力として使う
- 文字は prompt 側で完全指定し、後段でローカル描画しない
- Image スキルはモデル透明化ではなく、グリーンバック除去で透過 PNG を作る
- package 出力は `output/line-stamp-images/{setId}/package/` にまとまる
- 既存の `data/line-stamp-images/` は配信用というより保管済み成果物置き場で、アプリ本体は参照しない

## 10. アプリ本体との関係

- 現行の公開サイトには `LineStampFloatingPromo` として LINE スタンプへの右下ポップ導線が実装されている
- 表示対象は `/` と `/types/[typeCode]/`
- `/diagnosis` と `/secret/` には表示しない
- `NEXT_PUBLIC_LINE_STAMP_URL` は `lib/site.ts` の `LINE_STAMP_URL` を通じて導線のリンク先に使う
- `NEXT_PUBLIC_LINE_STAMP_URL` 未設定時は `https://store.line.me/stickershop/product/33688754/ja` を使う
- `NEXT_PUBLIC_LINE_STAMP_URL` が空文字、`0`、`false`、`off`、`disabled`、`none` の場合は導線を表示しない
- 導線の表示画像は `public/line-stamp-main.png`
- `data/line-stamp-images/` は保管済み成果物置き場であり、導線が直接参照する配信用正本ではない
- LINE スタンプ生成系の成果物は運用・制作物であり、App Router の表示ロジックからは直接参照されない
