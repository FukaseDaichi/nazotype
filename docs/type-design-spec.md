# 謎解きタイプ診断 タイプ定義仕様書

## 1. 文書の目的

本書は `data/types/*.json` に格納する 16 タイプ定義の構造を整理した文書である。
タイプコード規則、表示項目、画像生成向け補助項目の扱いを定義する。

関連文書:

- [specification.md](./specification.md)
- [diagnosis-logic-spec.md](./diagnosis-logic-spec.md)
- [character-image-skill-spec.md](./character-image-skill-spec.md)
- [type-ogp-image-spec.md](./type-ogp-image-spec.md)

## 2. タイプコード規則

タイプコードは 4 文字固定で、各文字は診断軸に対応する。

1. 1 文字目: 行動型 `A` / 解読型 `D`
2. 2 文字目: 局所型 `L` / 俯瞰型 `B`
3. 3 文字目: 発信型 `H` / 統率型 `T`
4. 4 文字目: 熟考型 `N` / 転換型 `C`

例:

- `ALHN` = 行動型 / 局所型 / 発信型 / 熟考型
- `DBTC` = 解読型 / 俯瞰型 / 統率型 / 転換型

## 3. 16 タイプ一覧

| コード | 軸構成 | タイプ名 | タグライン |
| --- | --- | --- | --- |
| `ALHN` | 行動型 / 局所型 / 発信型 / 熟考型 | 鑑識マニア | 「ねえ見てこれ」の回数チーム最多。しかも毎回大事なやつ。 |
| `ALHC` | 行動型 / 局所型 / 発信型 / 転換型 | 瞬間キャッチャー | 5分で3つ見つけて、もう次の部屋に行ってる。 |
| `ALTN` | 行動型 / 局所型 / 統率型 / 熟考型 | エリアの主 | 「ここは任せて」で黙々やって、本当に全部終わらせる人。 |
| `ALTC` | 行動型 / 局所型 / 統率型 / 転換型 | 突破キラー | 詰まった？ この人に渡せば3秒で動き出す。 |
| `ABHN` | 行動型 / 俯瞰型 / 発信型 / 熟考型 | 歩くホワイトボード | 部屋中歩き回った結果を、全部覚えてる。なんで？ |
| `ABHC` | 行動型 / 俯瞰型 / 発信型 / 転換型 | 人間Wi-Fi | あっちとこっちの情報、なぜか全部持ってる。 |
| `ABTN` | 行動型 / 俯瞰型 / 統率型 / 熟考型 | 現場の総監督 | 気づいたら全員、この人の指示で動いてる。 |
| `ABTC` | 行動型 / 俯瞰型 / 統率型 / 転換型 | ライブ軍師 | 作戦？ 今つくってるけど、もう半分うまくいってる。 |
| `DLHN` | 解読型 / 局所型 / 発信型 / 熟考型 | 実況解読者 | 「えーとこれは……あっわかった！」が止まらない。 |
| `DLHC` | 解読型 / 局所型 / 発信型 / 転換型 | 小謎キラー | 気づいたら3つ解いてて、4つ目に手を出してる。 |
| `DLTN` | 解読型 / 局所型 / 統率型 / 熟考型 | 人間検算機 | この人が「合ってる」と言えば、合ってる。 |
| `DLTC` | 解読型 / 局所型 / 統率型 / 転換型 | 仕分け番長 | 「これ後回し。これ先。」の判断が毎回正しくて怖い。 |
| `DBHN` | 解読型 / 俯瞰型 / 発信型 / 熟考型 | 伏線回収マシン | バラバラの答えが、この人の頭でひとつになる。 |
| `DBHC` | 解読型 / 俯瞰型 / 発信型 / 転換型 | ひらめき爆弾 | 「その発想はなかった」が何度も起きる。本人もなぜか知らない。 |
| `DBTN` | 解読型 / 俯瞰型 / 統率型 / 熟考型 | 沈黙の切り札 | ずっと黙ってたのに、一言で全部ひっくり返す。 |
| `DBTC` | 解読型 / 俯瞰型 / 統率型 / 転換型 | プランBの天才 | A案が死んでも大丈夫。この人にはH案まである。 |

## 4. `data/types/*.json` の項目

各タイプ JSON は少なくとも次を持つ。

| 項目 | 用途 |
| --- | --- |
| `typeId` | タイプ識別子。`typeCode` と同値にする |
| `typeCode` | 4 文字のタイプコード |
| `typeName` | 表示名 |
| `tagline` | ヒーローで使う短いコピー |
| `summary` | 一段落の概要説明 |
| `detailDescription` | 詳細説明本文 |
| `strengths` | 強みの箇条書き |
| `cautions` | 注意したい点の箇条書き |
| `recommendedRole` | 担いやすい役割 |
| `compatibility` | 相性情報 |
| `shareText` | SNS 共有文面のベース |
| `axis` | 4 軸ラベルのネストオブジェクト |
| `visualProfile` | 画像生成向けの見た目補助情報 |
| `imagePrompt` | 画像生成向けの元プロンプト |
| `negativePrompt` | 画像生成向けの禁止条件 |

旧仕様の `recommendedPlaystyle` / `suitableRoles` は `recommendedRole` に統合する方針。

## 5. `axis` オブジェクト

`axis` は各タイプの 4 軸ラベルを保持する。

```json
{
  "axis": {
    "axis1": "行動型",
    "axis2": "局所型",
    "axis3": "発信型",
    "axis4": "熟考型"
  }
}
```

使いどころ:

- shared page の 4 軸サマリ表示
- タイプ固有の軸ラベル表示
- 画像生成スキルでの補助情報

## 6. `compatibility` オブジェクト

`compatibility` は次の形を取る。

```json
{
  "summary": "相性の総評",
  "goodWithTypeCodes": ["DBTC", "DBHN"],
  "goodWithDescription": "補足説明"
}
```

補足:

- `summary` は本文セクションで表示する
- `goodWithTypeCodes` は公開ページで相性のよいタイプ一覧を引くために使う
- `goodWithDescription` は補足説明として表示する

相性表現の方針（[specification.md](./specification.md) 7-4 参照）:

- 「相性が悪い」と断定しない
- 補完関係と、調整が必要な関係を区別して表現する

## 7. `visualProfile` と画像生成補助項目

`visualProfile` はアプリ本体の表示ロジックと画像生成スキルの両方で使われる。

主な項目:

- `genderPresentation`
- `ageRange`
- `characterArchetype`
- `characterDescription`
- `outfitDescription`
- `colorPalette`
- `pose`
- `expression`
- `background` 任意

現在の利用先:

- `TypeArtwork` のプレースホルダー配色
- キャラクター画像生成スキル
- タイプ別 OGP 画像生成スキル

`imagePrompt` / `negativePrompt` はアプリ本体の描画では直接使わず、スキル側の入力として扱う。

## 8. 画面との対応

公開タイプ詳細ページ `/types/[typeCode]` では主に次を使う。

- `typeName`
- `typeCode`
- `tagline`
- `summary`
- `detailDescription`
- `strengths`
- `cautions`
- `recommendedRole`
- `compatibility`

共有結果ページ `/types/[typeCode]/[key]` では上記に加えて、共有キーから復元した 4 軸サマリを表示する。

## 9. アセットとの対応

タイプコードごとに、アプリ本体が参照する配信用アセットは次の通り。

- `public/types/{typeCode}.png`
- `public/types/{typeCode}_chibi.png`
- `public/types/{typeCode}-ogp.png`

画像ファイルが存在しない場合、`TypeArtwork` は `visualProfile.colorPalette` を使ってプレースホルダーを描画する。

## 10. 移行メモ

- 現行コードのタイプコードはマダミスタイプ診断の軸（`T/O`, `F/R`, `L/E`, `P/I`）に基づく
- 本仕様の軸（`A/D`, `L/B`, `H/T`, `N/C`）への移行にあたり、`data/types/*.json` の全面再作成が必要
- タイプ名・タグライン・説明文・visualProfile 等も謎解きテーマに合わせて再設計する
