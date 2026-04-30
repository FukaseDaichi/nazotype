# 現行システム課題メモ

## 1. 文書の目的

本書は、現行コードを正として確認したうえで、実装上または運用上の問題・整理課題を集約する。

確認日: 2026-04-30

実行確認:

- `npm run build`: 成功
- `npm run lint`: 成功
- `npm run start`: 失敗

## 2. 対応優先度

### P1: `npm run start` が静的 export 構成と合っていない

現行の `package.json` は `start` script として `next start` を定義している。

一方で `next.config.ts` は `output: "export"` を指定しているため、Next.js 16.2.1 では `npm run start` が次の理由で失敗する。

```text
"next start" does not work with "output: export" configuration. Use "npx serve@latest out" instead.
```

影響:

- ローカルで production build 後の確認をしようとしたときに、一般的な `npm run start` が使えない
- README や運用手順で `npm run start` を案内すると誤誘導になる

対応案:

- `start` script を削除する、または静的配信用の preview script に置き換える
- 例: `npm run build` 後に `npx serve@latest out` を使う
- Netlify は `out/` を publish directory とする現行方針を維持する

### P2: `/types/[typeCode]/` の `dynamicParams` が明示されていない

現行コードは `app/(types)/types/[typeCode]/page.tsx` の `generateStaticParams()` で 16 タイプを静的生成している。

`npm run build` は成功しており、`out/types/<typeCode>/index.html` も生成される。ただし Next.js の static export ドキュメントでは、`dynamicParams: true` の dynamic route は unsupported features に含まれる。現行コードでは `dynamicParams` を明示していないため、静的 export の制約がコード上から読み取りにくい。

影響:

- 未定義タイプコードを build 後に動的生成する設計ではないことが、コード上で明確ではない
- Next.js の将来挙動変更時に、静的 export 前提とのズレが表面化しやすい

対応案:

- `app/(types)/types/[typeCode]/page.tsx` に `export const dynamicParams = false` を追加し、生成済み 16 タイプだけを扱う意図を明示する
- 追加後に `npm run build` で static export が維持されることを確認する

### P2: タイプ別 OGP 生成スキルの publish 先がアプリ参照先と違う

現行のアプリ本体はタイプ別 OGP として `public/types/{typeCode}-ogp.png` を参照する。

一方で `skills/madamistype-type-ogp-images/` の既定 publish 先は `public/ogp/types/{typeCode}.png` である。

影響:

- スキルで `--publish` しても、そのままでは公開ページの OGP が更新されない
- OGP 更新作業で、生成済み画像と配信用画像の取り違えが起こりやすい

対応案:

- スキル側の既定 publish 先を `public/types/{typeCode}-ogp.png` に合わせる
- もしくは publish 後の反映手順をスクリプト化する

### P3: 旧プロジェクト名 `madamistype-*` のスキル名が残っている

リポジトリ名とアプリ名は `nazotype` だが、次のスキルは旧名のまま残っている。

- `skills/madamistype-type-ogp-images/`
- `skills/madamistype-line-stamp-prompts/`
- `skills/madamistype-line-stamp-images/`

影響:

- 新規作業者が、謎解きタイプ診断向けの現行スキルか判断しにくい
- docs とディレクトリ名の対応は保たれているが、命名上のノイズになっている

対応案:

- 実行スクリプトや docs の参照更新を含めて `nazotype-*` へリネームする
- リネームまでは、各仕様書に「現行名」として明記する運用を続ける

### P3: 未使用の旧 UI コンポーネントが残っている

`components/home/home-page/featured-types-section.tsx` は現行の `HomePage` から参照されていない。

現行トップページの 16 タイプ一覧は `AllTypesSection` と `TypeOgpLinkCard` で表示している。

影響:

- 旧デザインのクラス名や構造が残り、UI 変更時の調査対象が増える
- 実際に表示されるセクションと、残存コンポーネントの責務が紛らわしい

対応案:

- 再利用予定がなければ削除する
- 残す場合は、将来用であることをコメントまたは docs に明記する

## 3. 現時点で問題なしと確認した点

- 質問マスタは 32 問、4 ページ、各ページ 8 問、各軸 8 問で整合している
- 16 タイプ JSON はすべて存在し、対応する通常画像、チビ画像、OGP 画像も `public/types/` に揃っている
- 共有キーは回答全文を持たず、ユーザー名と 4 軸 trend state だけを保持する
- 共有キー復元時は、復元された `typeCode` と URL の `typeCode` が一致しない場合に結果表示しない
- `/secret/` は sitemap に含まれず、metadata で `noindex, nofollow, noarchive` を指定している
