# タイプ別 OGP 画像生成スキル仕様書

## 1. 文書の目的

本書は `skills/madamistype-type-ogp-images/` の現行運用を、実装ベースで整理した文書である。
対象はタイプ別 OGP 候補の生成、採用候補の選定、最終 OGP の書き出しである。

※ スキルディレクトリ名は現行コードのまま。謎解きタイプ診断用に `nazotype-type-ogp-images` へリネームする想定がある。

## 2. 対象スキル

- スキル名: `madamistype-type-ogp-images`（現行名）
- 入口: `skills/madamistype-type-ogp-images/SKILL.md`
- 主スクリプト: `skills/madamistype-type-ogp-images/scripts/generate_type_ogp_batch.py`

## 3. 入力

### 3.1 正本データ

- `data/types/*.json`
- `public/types/{typeCode}_chibi.png`

必要項目:

- `typeCode`
- `typeName`
- `visualProfile`
- `imagePrompt`
- `negativePrompt`

### 3.2 環境変数

リポジトリ直下の `.env.character-images` を自動読み込みする。

- `FAL_KEY`
- `FAL_QUEUE_URL`
- `FAL_MODEL`
- `FAL_EDIT_MODEL`
- `FAL_REFERENCE_BASE_URL`

`FAL_REFERENCE_BASE_URL` 未設定時の既定値は、GitHub 上の `public/types/` を指す raw URL である。

## 4. 実行コマンド

代表例:

```bash
python skills/madamistype-type-ogp-images/scripts/generate_type_ogp_batch.py --all
python skills/madamistype-type-ogp-images/scripts/generate_type_ogp_batch.py --types ALHN,DBTC
python skills/madamistype-type-ogp-images/scripts/generate_type_ogp_batch.py --retry-failed
python skills/madamistype-type-ogp-images/scripts/generate_type_ogp_batch.py --all --overwrite
python skills/madamistype-type-ogp-images/scripts/generate_type_ogp_batch.py --all --publish
```

主なオプション:

- `--all`
- `--types`
- `--retry-failed`
- `--overwrite`
- `--publish`
- `--publish-dir`
- `--output-dir`
- `--candidates`
- `--select`
- `--aspect-ratio`
- `--resolution`
- `--poll-interval`
- `--reference-url-base`
- `--allow-prompt-only-fallback`
- `--brand-label`
- `--timeout-seconds`
- `--api-base`
- `--dry-run`

## 5. 出力

既定の作業出力先:

```text
output/type-ogp/
```

既定の publish 先:

```text
public/ogp/types/
```

出力構成:

```text
output/type-ogp/
  batch-report.json
  ALHN/
    reference/
      chibi.png
    candidates/
      prompt-01.txt
      negative_prompt-01.txt
      request-01.json
      task-01.json
      candidate-01.png
    selected/
      hero.png
      selection.json
      selection-note.txt
    final/
      ogp.png
      meta.json
```

## 6. 実装上の挙動

- 参照チビ画像があれば、その公開 URL を `image_urls` に渡して候補生成する
- 候補数は `--candidates` で指定する。既定値は `1`
- `choose_candidate()` により採用候補を 1 枚選ぶ
- `--select ALHN:2` のように手動上書きできる
- `compose_ogp()` が最終 OGP を `1200x630` で書き出す
- `--publish` 指定時だけ publish 先へコピーする
- `--dry-run` では prompt と request を書くだけで、API は呼ばない

現行の演出方針:

- ちび基準画像と同一人物性を保ったまま、より大胆な寝そべり・逆立ち・倒れ込み・急旋回なども許容する
- カメラはローアングル、俯瞰、ダッチアングル、回転感のある構図など極端寄りを優先する
- 背景は白場の多い切り抜き調ではなく、奥行きと動勢を感じる OGP 一体型の画面として作る
- ただし文字面の可読性と bottom-right のブランド安全域は維持する

## 7. 画面との関係

重要:

- アプリ本体が参照するタイプ別 OGP は `public/types/{typeCode}-ogp.png`
- このスキルの既定 publish 先は `public/ogp/types/{typeCode}.png`

つまり、スキルの publish 先は現状そのままではアプリ本体に接続されていない。
サイト配信用に使う場合は、別途 `public/types/{typeCode}-ogp.png` へ反映する必要がある。

## 8. 制約

- 参照チビ画像がない場合は `--allow-prompt-only-fallback` が必要
- 生成結果の品質判定は完全自動ではなく、採用候補の確認が前提
- アプリ本体は `next/og` を使わず、静的 OGP アセットを参照する
