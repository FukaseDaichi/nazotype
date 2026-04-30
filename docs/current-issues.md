# 現行システム課題メモ

## 1. 文書の目的

本書は、現行コードを正として確認したうえで、実装・運用・保守上の課題を集約する。

確認日: 2026-04-30

確認結果:

- `npm run build`: 成功（Windows Node.js v22.16.0 / npm 10.9.2）
- `npm run lint`: 成功（Windows Node.js v22.16.0 / npm 10.9.2）
- `npm run start`: `out/` の静的配信用 script として動作確認済み

## 2. 現時点の未対応課題

現時点で、本書に残すべき未対応のシステム課題はない。

## 3. 2026-04-30 対応済み

### P1: `npm run start` と静的 export 構成の不整合

`next.config.ts` は `output: "export"` を指定しているため、`next start` は現行構成と合わない。

対応:

- `package.json` の `start` を `node scripts/serve-static.mjs out` に変更した
- build から静的配信までまとめて確認する `preview` script を追加した
- Netlify 本番運用は引き続き `out/` を publish directory として配信する

### P2: タイプ別 OGP 生成スキルの publish 先ずれ

アプリ本体はタイプ別 OGP として `public/types/{typeCode}-ogp.png` を参照する。

対応:

- `skills/nazotype-type-ogp-images/scripts/generate_type_ogp_batch.py` の既定 publish 先を `public/types/` に揃えた
- `--publish` 時のコピー先を `public/types/{typeCode}-ogp.png` に揃えた
- 関連 docs の「手動反映が必要」という説明を削除した

### P2: 旧プロジェクト名のスキル名・説明の残存

リポジトリ名とアプリ名は `nazotype` であるため、スキル名・ディレクトリ名・説明も現行名に揃える必要があった。

対応:

- タイプ別 OGP 生成スキルのディレクトリを `skills/nazotype-type-ogp-images/` にリネームした
- LINE スタンプ prompt 生成スキルのディレクトリを `skills/nazotype-line-stamp-prompts/` にリネームした
- LINE スタンプ image 生成スキルのディレクトリを `skills/nazotype-line-stamp-images/` にリネームした
- 各 `SKILL.md`、docs、例示コマンドを `nazotype-*` に更新した
- OGP スキル内のメイン OGP 生成補助スクリプトに残っていた旧タイトル・旧タイプコードを現行データへ更新した

### P3: `/types/[typeCode]/` の静的生成範囲の明示

現行アプリは `output: "export"` 前提で、16 タイプの公開ページを build 時に静的生成する。

対応:

- `app/(types)/types/[typeCode]/page.tsx` に `export const dynamicParams = false` を追加した

### P3: 未使用の旧 UI コンポーネント

`components/home/home-page/featured-types-section.tsx` は現行 `HomePage` から参照されていなかった。

対応:

- 未使用コンポーネントを削除した

## 4. 現時点で問題なしと確認した点

- 質問マスタは 32 問、4 ページ、各ページ 8 問、各軸 8 問で整合している
- 16 タイプ JSON はすべて存在し、対応する通常画像、チビ画像、OGP 画像も `public/types/` に揃っている
- 共有キーは回答全文を持たず、ユーザー名と 4 軸 trend state だけを保持する
- 共有キー復元時は、復元された `typeCode` と URL の `typeCode` が一致しない場合に結果表示しない
- `/secret/` は sitemap に含まれず、metadata で `noindex, nofollow, noarchive` を指定している

## 5. 検証環境の注意

WSL 側 Node.js v22.16.0 から `/mnt/c` 上の本リポジトリで確認した場合、`npm run build` は `Bus error (core dumped)` で落ち、`npm run lint` は長時間終了しなかった。

同じ作業ツリーを Windows 側 Node.js v22.16.0 / npm 10.9.2 で実行すると、`npm run build` と `npm run lint` は成功する。そのため、現時点ではコード差分ではなくローカル実行環境依存の問題として扱う。
