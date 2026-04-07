# キャラクター画像生成スキル仕様書

## 1. 文書の目的

本書は `skills/madamistype-character-images/` の現行運用を、実装ベースで整理した文書である。
対象は「通常キャラクター画像」と「チビキャラ画像」の一括生成であり、アプリ本体の画面仕様そのものを定義する文書ではない。

※ スキルディレクトリ名は現行コードのまま。謎解きタイプ診断用に `nazotype-character-images` へリネームする想定がある。

## 2. 対象スキル

- スキル名: `madamistype-character-images`（現行名）
- 入口: `skills/madamistype-character-images/SKILL.md`
- 主スクリプト: `skills/madamistype-character-images/scripts/generate_character_batch.py`

## 3. 入力

### 3.1 正本データ

- `data/types/*.json`

必要項目:

- `typeCode`
- `typeName`
- `visualProfile`
- `imagePrompt`
- `negativePrompt`

### 3.2 環境変数

リポジトリ直下の `.env.character-images` を自動読み込みする。

- `NANOBANANA_API_KEY`
- `NANOBANANA_API_BASE`

## 4. 生成対象

生成バリアント:

- `standard`
- `chibi`

`--variants standard|chibi|both` で対象を切り替える。既定値は `both`。

## 5. 実行コマンド

代表例:

```bash
python skills/madamistype-character-images/scripts/generate_character_batch.py --all
python skills/madamistype-character-images/scripts/generate_character_batch.py --types ALHN,DBTC
python skills/madamistype-character-images/scripts/generate_character_batch.py --retry-failed
python skills/madamistype-character-images/scripts/generate_character_batch.py --all --overwrite
python skills/madamistype-character-images/scripts/generate_character_batch.py --all --with-transparent
```

主なオプション:

- `--all`
- `--types`
- `--retry-failed`
- `--overwrite`
- `--variants`
- `--with-transparent`
- `--output-dir`
- `--aspect-ratio`
- `--resolution`
- `--poll-interval`
- `--timeout-seconds`
- `--api-base`
- `--dry-run`

## 6. 出力

既定の出力先:

```text
output/character-images/
```

出力構成:

```text
output/character-images/
  batch-report.json
  ALHN/
    standard/
      prompt.txt
      negative_prompt.txt
      request.json
      task.json
      raw.png
      transparent.png   # --with-transparent のときのみ
      meta.json
    chibi/
      prompt.txt
      negative_prompt.txt
      request.json
      task.json
      raw.png
      transparent.png   # --with-transparent のときのみ
      meta.json
```

## 7. 実装上の挙動

- `standard` を先に生成する
- `chibi` 生成時は、可能なら `standard` の `resultImageUrl` を参照画像として使う
- 参照 URL が取れない場合、`chibi` は prompt-only fallback になる
- `--dry-run` では prompt と request だけを書き、API 呼び出しはしない
- `--retry-failed` は既存 `batch-report.json` の失敗分だけ再実行する

## 8. 背景透過モード

`--with-transparent` を付けた場合だけ、グリーンバック前提で `transparent.png` を生成する。

処理:

1. NanoBanana から `raw.png` を取得
2. `scripts/background_remover.py` でグリーン背景を除去
3. `transparent.png` を書き出す

アプリ本体は `transparent.png` を直接参照しない。

## 9. アプリ本体との関係

- このスキルの既定出力先は `output/character-images/`
- アプリ本体が直接参照する配信用画像は `public/types/{typeCode}.png` と `public/types/{typeCode}_chibi.png`
- 生成後にアプリで使う場合は、必要なファイルを `public/types/` 側へ反映する
