# 謎解きタイプ診断 タイプ定義仕様書

## 1. 文書の目的

本書は `data/types/*.json` に格納する 16 タイプ定義の構造を、現行コードに合わせて整理した文書である。

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

## 3. `data/types/*.json` の項目

各タイプ JSON は少なくとも次を持つ。

| 項目 | 型 | 用途 |
| --- | --- | --- |
| `typeId` | `string` | タイプ識別子。`typeCode` と同値 |
| `typeCode` | `string` | 4 文字のタイプコード |
| `typeName` | `string` | 表示名 |
| `furigana` | `string` | `typeName` の読み仮名 |
| `furiganaLength` | `number` | 読み仮名の文字数 |
| `furiganaEmphasisIndex` | `number` | 強調位置。1 始まり |
| `tagline` | `string` | ヒーローで使う短いコピー |
| `summary` | `string` | 一段落の概要説明 |
| `detailDescription` | `string` | 詳細説明本文 |
| `strengths` | `string[]` | 強みの箇条書き |
| `cautions` | `string[]` | 注意したい点の箇条書き |
| `recommendedRole` | `string[]` | 担いやすい役割 |
| `compatibility` | object | 相性情報 |
| `shareText` | `string` | 共有文面の元テキスト |
| `axis` | object | 4 軸ラベル |
| `visualProfile` | object | 画像生成向け見た目情報 |
| `imagePrompt` | object | `ja` / `en` の prompt pair |
| `negativePrompt` | object | `ja` / `en` の prompt pair |

## 4. 16 タイプ一覧

| コード | 軸構成 | タイプ名 |
| --- | --- | --- |
| `ALHN` | 行動型 / 局所型 / 発信型 / 熟考型 | 鑑識マニア |
| `ALHC` | 行動型 / 局所型 / 発信型 / 転換型 | 瞬間キャッチャー |
| `ALTN` | 行動型 / 局所型 / 統率型 / 熟考型 | エリアの主 |
| `ALTC` | 行動型 / 局所型 / 統率型 / 転換型 | 突破キラー |
| `ABHN` | 行動型 / 俯瞰型 / 発信型 / 熟考型 | 歩くホワイトボード |
| `ABHC` | 行動型 / 俯瞰型 / 発信型 / 転換型 | 人間Wi-Fi |
| `ABTN` | 行動型 / 俯瞰型 / 統率型 / 熟考型 | 現場の総監督 |
| `ABTC` | 行動型 / 俯瞰型 / 統率型 / 転換型 | ライブ軍師 |
| `DLHN` | 解読型 / 局所型 / 発信型 / 熟考型 | 実況解読者 |
| `DLHC` | 解読型 / 局所型 / 発信型 / 転換型 | 小謎キラー |
| `DLTN` | 解読型 / 局所型 / 統率型 / 熟考型 | 人間検算機 |
| `DLTC` | 解読型 / 局所型 / 統率型 / 転換型 | 仕分け番長 |
| `DBHN` | 解読型 / 俯瞰型 / 発信型 / 熟考型 | 伏線回収マシン |
| `DBHC` | 解読型 / 俯瞰型 / 発信型 / 転換型 | ひらめき爆弾 |
| `DBTN` | 解読型 / 俯瞰型 / 統率型 / 熟考型 | 沈黙の切り札 |
| `DBTC` | 解読型 / 俯瞰型 / 統率型 / 転換型 | プランBの天才 |

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

現行実装での使いどころ:

- タイプ詳細ページのヒーロー内チップ表示
- 診断結果表示時の補助情報
- 画像生成スキルの補助情報

## 6. `compatibility` オブジェクト

`compatibility` は次の形を取る。

```json
{
  "summary": "相性の総評",
  "goodWithTypeCodes": ["DBTC", "DBHN"],
  "goodWithDescription": "補足説明"
}
```

利用先:

- `summary`: 相性セクション本文
- `goodWithTypeCodes`: `getTypesByCodes()` による関連タイプ解決
- `goodWithDescription`: 補足説明表示

## 7. `visualProfile`

`visualProfile` はアプリ本体と画像生成スキルの両方で使う。

現行データで確認できる主な項目:

- `genderPresentation`
- `ageRange`
- `characterArchetype`
- `characterDescription`
- `outfitDescription`
- `colorPalette`
- `pose`
- `expression`
- `background`
- `hairColor`
- `hairStyle`

現行利用先:

- `TypeArtwork` のプレースホルダー配色
- ちびキャラ画像生成スキル
- タイプ別 OGP 画像生成スキル
- LINE スタンプ生成スキル

## 8. 画面との対応

`/types/[typeCode]/` で主に使う項目:

- `typeName`
- `typeCode`
- `tagline`
- `summary`
- `detailDescription`
- `strengths`
- `cautions`
- `recommendedRole`
- `compatibility`
- `axis`

`/types/[typeCode]/?s={shareKey}` では上記に加えて、共有キーから復元した 4 軸サマリを組み合わせて結果表示を行う。

## 9. 共有文面との対応

`shareText` は共有 UI の元テキストとして使う。

現行実装の扱い:

- ネイティブ共有と LINE 共有では `shareText` をそのまま使う
- X 共有では先頭の本文を使い、ハッシュタグ行は除去したうえで別パラメータとして `#謎解きタイプ診断` を付与する

## 10. アセットとの対応

タイプコードごとに、アプリ本体が参照する配信用アセットは次の通り。

- `public/types/{typeCode}.png`
- `public/types/{typeCode}_chibi.png`
- `public/types/{typeCode}-ogp.png`

画像ファイルが存在しない場合、`TypeArtwork` は `visualProfile.colorPalette` を使ってプレースホルダーを描画する。
