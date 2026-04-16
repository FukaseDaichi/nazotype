# 謎解きタイプ診断 React Bits 導入方針書

## 1. 文書の目的

本書は、[React Bits](https://reactbits.dev/) を使って本アプリにアニメーション表現と動的 UI を増やす際の導入方針を定義する文書である。

目的は「動きを増やすこと」そのものではなく、以下を両立することにある。

- 謎解きゲームらしい高揚感と没入感を UI で強める
- `Next.js 16` + App Router + `output: 'export'` の制約下でも破綻しない
- モバイル閲覧、アクセシビリティ、静的配信、保守性を落とさない
- React Bits を便利な素材集として使いつつ、このリポジトリの設計主導権は維持する

参照:

- [specification.md](./specification.md)
- [ui-design-spec.md](./ui-design-spec.md)
- [tech-stack-spec.md](./tech-stack-spec.md)
- [frontend-directory-structure-spec.md](./frontend-directory-structure-spec.md)

---

## 2. 前提と制約

本リポジトリの前提は以下である。

- フレームワークは `Next.js 16.2.1` / App Router
- UI は `React 19.2.4`
- スタイリングは Tailwind CSS `4` 主体、CSS Module 補助
- `next.config.ts` で `output: "export"` を指定し、静的ホスティングで配信する
- 既存 UI は `components/ui/reveal-on-scroll.tsx`、`components/ui/particles.tsx`、`components/ui/ambient-orbs.tsx` などの軽量な自前表現をすでに持つ

このため、React Bits は「全画面を丸ごと置き換える UI ライブラリ」としてではなく、**局所的に取り込むアニメーション素材集**として扱う。

---

## 3. React Bits の扱い方

### 3.1 基本方針

- React Bits は npm パッケージを一括導入して常用するのではなく、**必要コンポーネントだけ取り込んでローカル所有**する
- 取り込み元は原則として **TypeScript + Tailwind (`TS-TW`) 版** を優先する
- 取り込んだコードはそのまま使わず、本プロジェクトの色・余白・アクセシビリティ・責務分離に合わせて調整する
- React Bits のコンポーネント名や props 設計をそのまま画面側へ露出しない。必要ならこのリポジトリ側で薄いラッパーを挟む

### 3.2 なぜ丸ごと導入しないか

React Bits の公式配布は、コンポーネントごとに依存関係が分かれている。`motion` 系だけで済むものもあれば、`gsap`、`ogl`、`three` などを要求するものもある。したがって、

- 「React Bits を入れたから全部使える」という前提で依存を一括追加すると肥大化しやすい
- 背景系や 3D 系は、静的 export + モバイルでの負荷が高くなりやすい
- `window` / `matchMedia` / `canvas` / WebGL 前提の実装があり、SSR 境界を雑に扱うと破綻しやすい

このため、本アプリでは **採用コンポーネント単位で審査し、依存追加も段階的に行う**。

---

## 4. 採用原則

### 4.1 まず既存実装を活かす

以下は現状のままでも軽量で、今の要件に対して十分強い。

- `RevealOnScroll`: 低コストなスクロール出現
- `Particles`: DOM ベースの軽量パーティクル
- `AmbientOrbs`: 装飾背景

したがって、React Bits はまずこれらを置き換えるためではなく、

- ヒーロー見出しの印象を強める
- 数値やキーワードの見せ方を改善する
- カードや一覧に統一された動きを与える
- 特定セクションだけに高密度な表現を足す

ために使う。

### 4.2 導入順は軽いものから

導入優先度は以下とする。

| 優先度 | 対象 | 例 | 主な依存 | 方針 |
| --- | --- | --- | --- | --- |
| A | テキスト・数値・軽い表示切替 | `BlurText`, `SplitText`, `Counter`, `LogoLoop` | `motion` または依存なし | 最初に採用してよい |
| B | カード・一覧・ホバー演出 | `TiltedCard`, `AnimatedList`, `SpotlightCard`, `PixelCard` | `motion`, `gsap`, Canvas など | セクション単位で限定採用 |
| C | スクロール演出・複合モーション | `AnimatedContent`, `ScrollReveal`, `Shuffle` | `gsap`, `ScrollTrigger` など | 既存 `RevealOnScroll` で不足する場合のみ |
| D | 背景・WebGL・3D | `Particles`, `Aurora`, `Threads`, `DarkVeil`, `Lanyard` など | `ogl`, `three`, WebGL 系 | トップページの一部に限定し、遅延読込前提 |

### 4.3 依存ライブラリは段階導入

導入順は以下を標準とする。

1. `motion`
2. `gsap`
3. `ogl` または `three`

禁止事項:

- 初回導入で `motion` / `gsap` / `ogl` / `three` を同時に追加しない
- 背景系コンポーネントを複数種類同時に常駐させない
- 「見た目が良いから」という理由だけで重い依存を積まない

---

## 5. 実装ルール

### 5.1 Server Component を汚さない

Next.js App Router では page / layout は Server Component が基本である。React Bits の多くは `useEffect`、`window`、`IntersectionObserver`、Canvas、WebGL を使うため、**必要な部分だけを Client Component 化**する。

ルール:

- 画面全体に `"use client"` を付けない
- アニメーション部分だけを小さな Client Component に切り出す
- Server Component からは静的な本文・構造・データ取得を維持する

### 5.2 重い部品は遅延読込する

`gsap`、`ogl`、`three`、Canvas / WebGL 系コンポーネントは、原則として `next/dynamic` による遅延読込対象とする。

標準ルール:

- ファーストビューで必須でないものは遅延読込する
- トップページ下部セクションの演出は IntersectionObserver 連携で後読みする
- SSR 不適合なものは Client Component 内で `dynamic(..., { ssr: false })` を使う

### 5.3 `window` 参照を必ず監査する

React Bits の配布コードには、`window.matchMedia(...)` や `performance.now()` を即時評価する実装が含まれる。これらは Server Component 直下でそのまま使うと危険である。

導入時チェック:

- `window`, `document`, `matchMedia`, `ResizeObserver`, `requestAnimationFrame`, `canvas`, `WebGL` の使用有無
- `useEffect` cleanup があるか
- 依存配列が適切か
- 画面外でもアニメーションが回り続けないか

### 5.4 reduced motion を必須要件にする

アニメーションを増やすほど、`prefers-reduced-motion` 対応は必須になる。

ルール:

- すべての新規アニメーションは reduced motion 時の挙動を定義する
- reduced motion 時は「停止」または「短縮・簡略化」のどちらかを選ぶ
- 背景アニメーション、パララックス、激しい文字分解演出は reduced motion 時に無効化する
- hover 依存の演出には keyboard focus 時の代替も用意する

### 5.5 文字の可読性と意味を壊さない

見出しや本文のアニメーションは、視覚演出よりも情報伝達を優先する。

ルール:

- `h1`, `h2`, CTA テキストは、アニメーション後も通常のテキストとして DOM に残す
- 文字単位分解アニメーションは、読みづらさを増やす本文には使わない
- スクリーンリーダーで不自然にならないかを確認する
- 診断設問本文には強すぎる動きを入れない

### 5.6 アニメーション予算を設ける

1 画面に入れる動きの種類を絞る。

標準予算:

- 常時動作する背景演出: 1種類まで
- スクロール出現ルール: 1種類まで
- カード hover 演出: 1種類まで
- テキスト強調演出: セクションごとに 1種類まで

同一画面で複数のアニメーション文法を混ぜると、ゲーム UI ではなく雑多な UI になる。

---

## 6. このプロジェクトでの採用方針

### 6.1 トップページ `/`

最も演出密度を上げてよい画面。ただし、ファーストビューで重い WebGL を複数重ねない。

推奨:

- 見出し: `BlurText` または `SplitText`
- 数値や短いラベル: `Counter`
- 一覧や紹介帯: `LogoLoop`、`AnimatedList`
- カード強調: `TiltedCard` か `SpotlightCard` のどちらか一系統

慎重採用:

- `Particles`、`Aurora`、`Threads` などの背景系

判断基準:

- 既存 `AmbientOrbs` / `Particles` で十分なら置き換えない
- 背景演出は「世界観の土台」1種類に絞る
- テキスト演出と背景演出を同時に主役化しない

### 6.2 診断ページ `/diagnosis`

ここは演出よりも読みやすさとテンポが優先である。

推奨:

- 進捗数字の見せ方に `Counter`
- 軽いセクション遷移に `motion` ベースのフェード

非推奨:

- 強いパーティクル
- 文字を崩す演出
- hover 前提のインタラクション
- 長時間ループする背景

理由:

- 診断中は集中を妨げる動きが UX を悪化させやすい
- モバイルでは設問文と選択肢が主役である

### 6.3 タイプ詳細 `/types/[typeCode]`

シェア映えは重要だが、結果本文の可読性を壊してはいけない。

推奨:

- ヒーローコピーに `BlurText`
- 軽いカード強調に `TiltedCard` または `SpotlightCard`
- 4軸メーターや数値表示に `Counter`

非推奨:

- 本文段落への過剰なスクランブル演出
- 常時動く大規模背景
- OGP で表現できないクライアント専用の見せ場への依存

---

## 7. 実装配置ルール

### 7.1 ディレクトリ方針

React Bits 由来の汎用部品は以下に置く。

```text
components/
  ui/
    react-bits/
      blur-text/
      counter/
      logo-loop/
```

画面固有の組み立ては既存のドメイン別ディレクトリに置く。

```text
components/
  home/
  diagnosis/
  type/
```

### 7.2 責務分離

- `components/ui/react-bits/*`: upstream 由来の汎用アニメーション部品
- `components/home/*` など: コピー、レイアウト、画面内の意味付け
- `lib/` または `components/ui/`: reduced motion 判定や lazy load 補助などの共通ユーティリティ

React Bits のコンポーネントを画面直下へ直接ベタ置きしない。

---

## 8. 推奨導入ステップ

### フェーズ 1

- `motion` のみ追加
- `BlurText`
- `Counter`
- `LogoLoop` または `AnimatedList`

狙い:

- 目に見える改善を出しつつ、依存コストを最小化する

### フェーズ 2

- 必要時のみ `gsap` 追加
- `AnimatedContent` などの高度な reveal を限定採用
- 既存 `RevealOnScroll` と二重管理しないよう、どちらかに寄せる

狙い:

- セクション単位の演出品質を上げる

### フェーズ 3

- 必要時のみ `ogl` または `three` を追加
- 背景系はトップページの一部だけに採用
- `next/dynamic` と reduced motion を必須化

狙い:

- 世界観の強化。ただし常時負荷は最小化する

---

## 9. 導入時チェックリスト

- このコンポーネントは本当に既存実装より価値があるか
- `TS-TW` 版を起点にしているか
- 追加依存は最小か
- Client Component 境界は最小か
- `window` / `document` / WebGL 依存を監査したか
- `next/dynamic` の対象かどうかを判断したか
- reduced motion 時の挙動を定義したか
- keyboard focus でも破綻しないか
- モバイルで FPS と可読性を確認したか
- 同一画面で動きの種類を増やしすぎていないか

---

## 10. この方針で採らないもの

- React Bits のコンポーネントを大量に一括導入する運用
- 1ページに複数の重い背景アニメーションを共存させる設計
- route 全体を Client Component 化する実装
- 診断設問本文に過剰な文字アニメーションを入れること
- reduced motion 非対応のまま公開すること

---

## 11. 結論

本プロジェクトにおける React Bits のベストプラクティスは、**TS + Tailwind 版を必要部品だけローカル所有し、`motion` から段階導入し、重い背景演出は最後に遅延読込で限定採用すること**である。

まずはトップページとタイプ詳細ページの演出強化から着手し、診断ページは可読性優先で軽く留める。既存の軽量自前 UI をむやみに捨てず、React Bits は「ここぞ」で効かせる。

---

## 12. 調査ソース

- React Bits 公式: [https://reactbits.dev/](https://reactbits.dev/)
- React Bits Installation: [https://reactbits.dev/get-started/installation](https://reactbits.dev/get-started/installation)
- React Bits GitHub: [https://github.com/DavidHDev/react-bits](https://github.com/DavidHDev/react-bits)
- React Bits 公開レジストリ実装例: `https://reactbits.dev/r/<Component>-TS-TW`
- Next.js ローカル docs:
  - `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
  - `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`
  - `node_modules/next/dist/docs/03-architecture/accessibility.md`
- prefers-reduced-motion: [https://web.dev/articles/prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)
