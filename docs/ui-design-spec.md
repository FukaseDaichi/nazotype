# 謎解きタイプ診断 UI デザイン仕様書

## 1. 文書の目的

本書は、謎解きタイプ診断の全画面 UI デザインをゼロから定義する。
「スクリーンショットを撮って共有したくなる診断結果」を最上位目標とし、
協力型謎解き・脱出ゲームの世界観を**モダンなゲーム UI** の文法で表現する。

参照:

- [specification.md](./specification.md)
- [type-design-spec.md](./type-design-spec.md)
- [tech-stack-spec.md](./tech-stack-spec.md)

---

## 2. デザインコンセプト

### 2-1. コンセプト名

**「プレイヤーセレクト」— 次のミッション、あなたの役割は？**

協力型ゲーム開始前の**キャラクター選択画面**がモチーフ。
暗い画面に浮かぶプレイヤーカード、光るステータスバー、チーム編成のアイコン。
自分の強みを「発見」し、チームでの役割を「装備」する感覚をつくる。

> 旧デザイン（ノワール調ケースファイル）から完全に脱却する。
> 紙テクスチャ、封筒、スタンプ、テープ装飾、走り書きメモ——これらはすべて廃止。

### 2-2. デザイン原則

| 原則 | 説明 |
| --- | --- |
| **ダーク & クリーン** | 暗い背景に余計な装飾を載せない。テクスチャではなくグロウで奥行きを出す |
| **カード = キャラクター** | タイプは「プレイヤーカード」として一貫した形で見せる |
| **光で導く** | amber で発見、cyan でインタラクション、coral でアクション。色が次の行動を示す |
| **シェア映えが最優先** | 結果画面はスクリーンショットされる前提で設計する |
| **親指で完結** | すべての操作がモバイルの片手持ちで完結する |

### 2-3. ムードリファレンス

| リファレンス | 取り入れる要素 |
| --- | --- |
| 協力型ゲームのキャラ選択画面 | ダーク UI、光るアクセント、ステータス表示 |
| 16personalities.com | キャラクター + 一言 + 傾向バーの構成 |
| Spotify Wrapped | 1 枚絵の情報密度、シェア前提のビジュアル |

### 2-4. 旧デザインからの変更点

| 廃止するもの | 代わりに使うもの |
| --- | --- |
| ケースファイル封筒（`.caseEnvelope`） | フラットなダークカード |
| CONFIDENTIAL スタンプ | 控えめなバッジテキスト |
| 紙テクスチャ・方眼・マージンライン | 無地の表面 + ラジアルグロウ |
| テープ装飾（`::before`/`::after`） | `rounded-xl` のクリーンなエッジ |
| セピア / ノワール色（`#8b6914` 等） | ミッドナイトブルー + amber/cyan |
| `--rcf-*` CSS 変数体系 | `@theme` 登録の Tailwind トークン |
| Special Elite / Caveat フォント | IBM Plex Mono / Klee One |
| CSS Module 主体のスタイリング | Tailwind-first、CSS Module は補助のみ |

---

## 3. スタイリング方針

### 3-1. 基本原則：Tailwind-first

```
Tailwind ユーティリティ（JSX 内）  ← 大多数のスタイルはここ
      ↓ 足りないときだけ
CSS Module（*.module.css）        ← 複雑なグロウ・擬似要素
      ↓ 全体共通だけ
globals.css                       ← トークン定義・ベーススタイル
```

### 3-2. `@theme` によるトークン登録

Tailwind CSS v4 の `@theme` ディレクティブですべてのデザイントークンを登録する。
JSX 側では Tailwind クラスで参照する。旧来の `--rcf-*` 変数はすべて廃止。

```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-midnight-950: #080d18;
  --color-midnight-900: #0e1525;
  --color-midnight-800: #162038;
  --color-midnight-700: #1e2d52;
  --color-midnight-600: #2a3d6b;
  --color-midnight-500: #3a5590;
  --color-amber-300: #f5c84a;
  --color-amber-400: #e8a832;
  --color-amber-500: #d49420;
  --color-amber-600: #b07a15;
  --color-cyan-300: #5dd8e6;
  --color-cyan-400: #2ec4d6;
  --color-cyan-500: #1aabb8;
  --color-cyan-600: #148e9a;
  --color-coral-400: #f07060;
  --color-coral-500: #e65a4a;
  --color-coral-600: #d14838;
  --color-paper-50: #faf7f2;
  --color-paper-100: #f2ebe0;
  --color-paper-200: #e5dace;
  --color-paper-300: #c9bfb0;

  --font-body: "Noto Sans JP", "Hiragino Sans", sans-serif;
  --font-display: "Shippori Mincho B1", "Yu Mincho", serif;
  --font-mono: "IBM Plex Mono", monospace;
  --font-note: "Klee One", cursive;
  --font-heading: "Bebas Neue", sans-serif;

  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  --shadow-sm: 0 2px 10px rgba(14, 21, 37, 0.25);
  --shadow-md: 0 12px 32px rgba(14, 21, 37, 0.3);
  --shadow-glow-amber: 0 0 20px rgba(232, 168, 50, 0.15);
  --shadow-glow-cyan: 0 0 20px rgba(46, 196, 214, 0.15);
}
```

### 3-3. CSS Module の使いどころ

CSS Module は以下の場合**のみ**使う:

| 用途 | 理由 |
| --- | --- |
| ラジアルグロウ背景 | 複数 `radial-gradient` の重ね合わせ |
| `@keyframes` 適用 | アニメーション定義の参照 |
| 1 要素に 15 クラス以上つく場合 | 可読性のため |

CSS Module 内でも色・サイズは `var(--color-midnight-800)` 等のトークン変数で参照する。値の直書き禁止。

### 3-4. 避けるべきパターン

| やらないこと | 理由 |
| --- | --- |
| `::before`/`::after` による装飾線・テープ・スタンプ | 旧テーマの残滓。クリーンに保つ |
| 背景にグリッドテクスチャを敷く | テクスチャレスで統一 |
| `position: absolute` による装飾配置 | レイアウトフローで解決する |
| 色やスペーシングを CSS に直書き | Tailwind トークンで一元管理 |
| `@apply` でユーティリティをまとめる | React コンポーネント化で対処 |

---

## 4. カラーパレット

### 4-1. プリミティブ

**Midnight（ベース）**

| トークン | 値 | 用途 |
| --- | --- | --- |
| `midnight-950` | `#080d18` | 最深部 |
| `midnight-900` | `#0e1525` | ページ背景 |
| `midnight-800` | `#162038` | カード・パネル |
| `midnight-700` | `#1e2d52` | ホバー・浮き上がり |
| `midnight-600` | `#2a3d6b` | ボーダー |
| `midnight-500` | `#3a5590` | 無効状態 |

**Amber（発見・ブランド）**

| トークン | 値 | 用途 |
| --- | --- | --- |
| `amber-300` | `#f5c84a` | ハイライト |
| `amber-400` | `#e8a832` | ブランド主調 |
| `amber-500` | `#d49420` | 強調時 |
| `amber-600` | `#b07a15` | 暗面アクセント |

**Cyan（インタラクション）**

| トークン | 値 | 用途 |
| --- | --- | --- |
| `cyan-300` | `#5dd8e6` | 発光・選択 |
| `cyan-400` | `#2ec4d6` | UI 要素 |
| `cyan-500` | `#1aabb8` | ボタン・リンク |
| `cyan-600` | `#148e9a` | 押下時 |

**Coral（アクション）**

| トークン | 値 | 用途 |
| --- | --- | --- |
| `coral-400` | `#f07060` | 通常 |
| `coral-500` | `#e65a4a` | CTA |
| `coral-600` | `#d14838` | CTA ホバー |

**Paper（明面ヒーロー専用）**

| トークン | 値 | 用途 |
| --- | --- | --- |
| `paper-50` | `#faf7f2` | タイプヒーロー背景 |
| `paper-100` | `#f2ebe0` | 控えめ明面 |
| `paper-200` | `#e5dace` | サブ要素 |
| `paper-300` | `#c9bfb0` | 明面サブテキスト |

### 4-2. セマンティックトークン

| トークン | 値 | 用途 |
| --- | --- | --- |
| `--color-bg` | `midnight-900` | ページ背景 |
| `--color-surface` | `midnight-800` | カード |
| `--color-surface-hover` | `midnight-700` | カードホバー |
| `--color-border` | `midnight-600` | ボーダー |
| `--color-text` | `#e8e4dc` | ダーク面テキスト |
| `--color-text-muted` | `#8b9ab5` | ダーク面サブテキスト |
| `--color-text-on-light` | `#1a2240` | 明面テキスト |
| `--color-text-on-light-muted` | `#5a6478` | 明面サブテキスト |
| `--color-brand` | `amber-400` | ブランド |
| `--color-accent` | `cyan-400` | アクセント |
| `--color-cta` | `coral-500` | 主 CTA |
| `--color-cta-hover` | `coral-600` | CTA ホバー |

### 4-3. 運用ルール

- ページ全体はダーク基調（`midnight-900`）
- 明面（`paper-50`）を使うのは**タイプ詳細ページのヒーロー領域だけ**
- CTA は coral、副次アクションは cyan
- 発見・強調・ラベルは amber
- ダーク面テキストは WCAG AA（4.5:1）以上

---

## 5. タイポグラフィ

### 5-1. フォントスタック

| 用途 | フォント | 意図 |
| --- | --- | --- |
| 日本語本文 | `Noto Sans JP` | 可読性 |
| 日本語ディスプレイ | `Shippori Mincho B1` | タイプ名・見出しの格調 |
| 英字大見出し | `Bebas Neue` | インパクト |
| コード・ラベル | `IBM Plex Mono` | データ的な正確さ |
| 日本語説明（格調） | `Noto Serif JP` | 詳しい見立ての文章 |
| 手書きメモ風 | `Klee One` | タグラインのアクセント |

### 5-2. サイズスケール

| 名前 | サイズ | 用途 |
| --- | --- | --- |
| hero | `clamp(2rem, 6vw, 3.5rem)` | ヒーロー見出し |
| h1 | `clamp(1.5rem, 4vw, 2.25rem)` | ページ見出し |
| h2 | `1.25rem`（`text-xl`） | セクション見出し |
| body | `1rem`（`text-base`） | 本文 |
| small | `0.875rem`（`text-sm`） | 補足・メタ |
| xs | `0.75rem`（`text-xs`） | ラベル・バッジ |

---

## 6. 空間と表面

### 6-1. ページ背景

`body` はシンプルな構成。テクスチャ・グリッドは使わない。

```css
body {
  background:
    radial-gradient(ellipse at 15% 10%, rgba(232, 168, 50, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 85% 90%, rgba(46, 196, 214, 0.03) 0%, transparent 50%),
    linear-gradient(to bottom, #080d18, #0e1525);
}
```

微かなラジアルグロウが光源を暗示するだけ。表面はフラットに保ち、カードの重なりで奥行きを出す。

### 6-2. 表面レベル

| レベル | 背景 | ボーダー | 影 | 用途 |
| --- | --- | --- | --- | --- |
| Ground | `midnight-900` | — | — | ページ背景 |
| Surface | `midnight-800` | `midnight-600` 1px | `shadow-sm` | カード・セクション |
| Raised | `midnight-700` | `midnight-600` 1px | `shadow-md` | ホバー・強調 |
| Light | `paper-50` | — | — | タイプヒーローのみ |

すべてのカード: `rounded-xl`（16px）で統一。

### 6-3. 明面と暗面の切り替え

明面はタイプ詳細ヒーローでのみ使用する。切り替わりは `py-12` 以上の余白で自然に分離する。
明面から暗面への遷移にグラデーション帯は使わない（硬い切り替えでゲーム UI 感を出す）。

---

## 7. 共通 UI パターン

### 7-1. ボタン

**Primary**（主要アクション）:
```
inline-flex items-center justify-center gap-2
min-h-[52px] rounded-lg px-8 py-3
bg-coral-500 text-white font-bold text-base
shadow-sm
hover:bg-coral-600 hover:-translate-y-0.5 hover:shadow-md
active:translate-y-0
transition-all duration-150
```

**Secondary**（副次アクション）:
```
inline-flex items-center justify-center gap-2
min-h-[52px] rounded-lg px-8 py-3
border border-cyan-400 text-cyan-400 font-bold text-base
hover:bg-cyan-400/10 hover:-translate-y-0.5
active:translate-y-0
transition-all duration-150
```

**Ghost**（テキストリンク風）:
```
text-cyan-400 text-sm font-medium
hover:text-cyan-300 hover:underline underline-offset-4
transition-colors duration-150
```

全ボタン共通:
- タッチターゲット **48×48px** 以上
- `focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight-900`
- `disabled:opacity-40 disabled:pointer-events-none`

### 7-2. カード

**基本カード**:
```
rounded-xl border border-midnight-600 bg-midnight-800 p-5
shadow-sm
hover:bg-midnight-700 hover:shadow-md hover:-translate-y-0.5
transition-all duration-200
```

**タイプカード**（タイプ一覧用・小）:
```
rounded-xl border border-midnight-600 bg-midnight-800 p-4
flex flex-col items-center gap-2 text-center
hover:bg-midnight-700 hover:border-amber-400/30 hover:-translate-y-1
transition-all duration-200
```

### 7-3. セクション構成

すべてのコンテンツセクションは統一構成:

```tsx
<section className="space-y-4">
  <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
    {eyebrow}  // 例: "Strengths"
  </p>
  <h2 className="font-display text-xl leading-tight">
    {title}    // 例: "強み"
  </h2>
  <div>{content}</div>
</section>
```

セクション間の余白: `gap-12`（48px）以上。

### 7-4. リスト

箇条書きはダッシュマーカーで統一:

```tsx
<ul className="space-y-3">
  <li className="flex gap-3">
    <span className="text-amber-400 shrink-0">─</span>
    <span>{item}</span>
  </li>
</ul>
```

### 7-5. アクセシビリティ

- `skip-link` をページ先頭に配置
- `:focus-visible` で `cyan-400` フォーカスリング（2px、offset 2px）
- `prefers-reduced-motion: reduce` でアニメーション即時完了
- ダーク面テキスト: WCAG AA（4.5:1）以上
- 明面テキスト: 同上
- タッチターゲット: 48×48px 以上（WCAG 2.5.8）

---

## 8. 画面別デザイン

### 8-1. トップページ

#### 構成

```
┌─ ヘッダーバー ──────────────────────┐
├─ ヒーロー ──────────────────────────┤
│  キャッチコピー + CTA               │
│  フィーチャードタイプカード          │
├─ 3 ステップ ────────────────────────┤
│  答える → 判定 → 活かす              │
├─ 4 軸プレビュー ────────────────────┤
│  軸カード ×4                         │
├─ 診断開始フォーム ──────────────────┤
│  名前入力 + 開始ボタン               │
├─ タイプギャラリー ──────────────────┤
│  16 タイプミニカードグリッド          │
├─ フッター ──────────────────────────┤
└──────────────────────────────────────┘
```

#### ヘッダーバー

```
┌──────────────────────────────────────┐
│ 🔑 謎解きタイプ診断         タイプ一覧 │
└──────────────────────────────────────┘
```

- `sticky top-0 z-50`
- `midnight-900/95` 背景（`backdrop-blur-sm`）
- `border-b border-midnight-600`
- 高さ: 56px
- 左: ロゴ「謎解きタイプ診断」（`font-bold text-amber-400`）
- 右: 「タイプ一覧」ghost link（`text-sm`）
- コンテンツ最大幅: `max-w-5xl mx-auto`

#### ヒーロー

ダーク面。テクスチャなし。ページ全幅。

**モバイル（1 カラム、中央揃え）**:

```
┌──────────────────────────┐  midnight-900
│                          │
│  16-Type Puzzle-Solver   │  ← eyebrow (mono, amber, xs)
│  Profile                 │
│                          │
│  あなたの                 │  ← h1 (display, hero size)
│  謎解きスタイルは？        │
│                          │
│  32の質問で強み・役割を     │  ← sub (text-muted, sm)
│  16タイプで診断            │
│                          │
│  ┌────────────────────┐  │
│  │                    │  │
│  │   [Type Artwork]   │  │  ← フィーチャードカード
│  │                    │  │
│  │  DLHN 鑑識マニア    │  │     midnight-800 card
│  │  「タグライン…」     │  │     rounded-xl, shadow-md
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │   診断スタート →     │  │  ← primary button, full width
│  └────────────────────┘  │
│                          │
│  32問 ・ 4ページ ・ 約5分  │  ← stats (mono, xs, text-muted)
│                          │
└──────────────────────────┘
```

**デスクトップ（2 カラム）**:

```
┌────────────────────────────────────────────┐
│                                            │
│  16-Type Puzzle-Solver     ┌────────────┐  │
│  Profile                   │            │  │
│                            │  Artwork   │  │
│  あなたの                   │            │  │
│  謎解きスタイルは？          │  DLHN      │  │
│                            │  鑑識マニア  │  │
│  32の質問で強み・役割を      │  「…」      │  │
│  16タイプで診断              └────────────┘  │
│                                            │
│  [診断スタート →]                            │
│                                            │
│  32問 ・ 4ページ ・ 約5分                     │
│                                            │
└────────────────────────────────────────────┘
  ← 55% テキスト+CTA →    ← 45% カード →
```

- フィーチャードカード: ランダムまたは固定タイプ 1 枚。`midnight-800` カード、`rounded-xl`、`shadow-md`
- アートワーク内: 画像 + コードバッジ + 名前 + タグライン
- `#start` へのアンカーリンク or 直接診断ページリンク

#### 3 ステップ

```
┌───────────┐    ┌───────────┐    ┌───────────┐
│  ① 回答    │    │  ② 判定    │    │  ③ 活用    │
│            │    │            │    │            │
│  32の質問   │ →  │  16タイプ   │ →  │  チームで   │
│  に答える   │    │  から判定   │    │  活かす     │
└───────────┘    └───────────┘    └───────────┘
```

- デスクトップ: 3 カラム（`grid grid-cols-3 gap-6`）
- モバイル: 横スクロール or 縦積み（`grid gap-4`）
- 各ステップ:
  - 番号バッジ: `w-8 h-8 rounded-full bg-amber-400 text-midnight-900 font-bold flex items-center justify-center`
  - テキスト: `font-bold text-base` + `text-sm text-muted`
- ステップ間の矢印: デスクトップのみ、`text-midnight-500`

#### 4 軸プレビュー

```
┌────── AXIS 01 ──────┐  ┌────── AXIS 02 ──────┐
│ Action / Decode      │  │ Local / Bird's-eye   │
│                      │  │                      │
│ 行動型 ←──→ 解読型    │  │ 局所型 ←──→ 俯瞰型   │
│                      │  │                      │
│ 自ら動いて   手元の    │  │ 1問に     全体構造を  │
│ 情報を取る   材料から  │  │ 集中する   見渡す     │
└──────────────────────┘  └──────────────────────┘
┌────── AXIS 03 ──────┐  ┌────── AXIS 04 ──────┐
│ Herald / Tactician   │  │ Tenacity / Change    │
│ ...                  │  │ ...                  │
└──────────────────────┘  └──────────────────────┘
```

- セクション見出し: 「4つの軸で、あなたを診断」
- `grid md:grid-cols-2 gap-4`
- 各カード: `midnight-800`、`rounded-xl`、`p-5`
  - 軸ラベル: `"AXIS 01"`（`font-mono text-xs text-amber-400 uppercase tracking-widest`）
  - 軸名: `"Action / Decode"`（`font-heading text-lg`）
  - 2 つの極: 左右に配置。ラベル（`font-bold text-sm`）+ 一行説明（`text-xs text-muted`）
  - 中央に `←→` または区切り線
  - カード上辺に 2px の軸固有色アクセントライン（§9 参照）

#### 診断開始フォーム

```
┌──────────────────────────────┐
│                              │
│  Mission Start               │  ← eyebrow
│  診断をはじめる               │  ← h2
│                              │
│  ┌────────────────────────┐  │
│  │ ニックネーム（任意）      │  │  ← text field
│  └────────────────────────┘  │
│  共有URL に表示されます        │  ← 注釈 (xs, muted)
│                              │
│  ┌────────────────────────┐  │
│  │    診断スタート →        │  │  ← primary button
│  └────────────────────────┘  │
│                              │
│  前回の続きから再開 →          │  ← ghost link (条件付き表示)
│                              │
└──────────────────────────────┘
```

- `id="start"`（ヒーロー CTA のアンカー先）
- `midnight-800` パネル、`rounded-xl`、`p-8`、中央寄せ
- テキストフィールド: `max-w-sm mx-auto`
- フィールドスタイル: `w-full min-h-[52px] rounded-lg border border-midnight-600 bg-midnight-900 px-4 py-3 text-base focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/15 outline-none transition-all`
- 下書き復元リンク: `localStorage` に前回データがある場合のみ表示

#### タイプギャラリー

```
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ Art  │ │ Art  │ │ Art  │ │ Art  │
│ DLHN │ │ ALHN │ │ DBHN │ │ ...  │
│ 鑑識  │ │ 突撃  │ │ 伏線  │ │      │
│ マニア │ │ 隊長  │ │ 回収  │ │      │
└──────┘ └──────┘ └──────┘ └──────┘
  ...        x16 cards total
```

- セクション見出し: 「全16タイプ」
- `grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3`
- 各タイプカード:
  - アートワークサムネイル: `aspect-square rounded-lg overflow-hidden bg-midnight-700`（プレースホルダーの場合コードバッジ表示）
  - コード: `font-mono text-xs text-amber-400`
  - タイプ名: `font-bold text-sm`
  - リンク: `/types/{typeCode}` へ
  - ホバー: `bg-midnight-700`、`border-amber-400/30`、`-translate-y-1`

#### フッター

- `midnight-950` 背景、`py-8`
- `text-xs text-muted text-center`
- `© Whte Franc / Puzzle-Solving Role Diagnosis System`

---

### 8-2. 診断フロー

#### 構成

```
┌─ プログレスバー（sticky）────────────┐
├─ ページヘッダー ─────────────────────┤
│  ページ番号 + ガイド                   │
├─ 質問リスト ─────────────────────────┤
│  Q.01 ─ [○ ○ ○ ○ ○]                │
│  Q.02 ─ [○ ○ ○ ○ ○]                │
│  ... × 8問                          │
├─ ナビゲーション ─────────────────────┤
│  [← 前のページ]  [次のページへ →]      │
└──────────────────────────────────────┘
```

#### プログレスヘッダー

```
┌──────────────────────────────────────┐
│ Page 1 / 4            謎解きタイプ診断 │
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└──────────────────────────────────────┘
```

- `sticky top-0 z-40`
- `midnight-900/95 backdrop-blur-sm`
- 高さ: 自動（上段: ラベル + 下段: バー）
- 上段:
  - 左: `"Page 1 / 4"`（`font-mono text-sm text-muted`）
  - 右: ロゴリンク（`text-sm text-amber-400`）
- 下段: プログレスバー
  - トラック: `h-1 w-full bg-midnight-700 rounded-full`
  - フィル: `bg-gradient-to-r from-cyan-400 to-amber-400`、幅 = ページ進捗（25%/50%/75%/100%）
  - アニメーション: `transition-all duration-500 ease-out`

#### ページヘッダー

- `pt-8 pb-6`
- 見出し: `"ページ 1 / 4"`（`font-heading text-2xl text-amber-400`）
- ガイド: `"直感で答えてください"`（`text-sm text-muted mt-1`）

#### 質問カード

```
┌──────────────────────────────────────┐  midnight-800
│                                      │  rounded-xl
│  Q.01                                │  p-5
│                                      │
│  友だちとの予定は、自分から             │
│  提案することが多い。                  │
│                                      │
│  そう思わない  ○  ○  ○  ○  ○  そう思う │
│                                      │
└──────────────────────────────────────┘
```

- `midnight-800 rounded-xl p-5 space-y-4`
- 質問番号: `"Q.01"`（`font-mono text-xs text-amber-400 font-bold`）
- 質問テキスト: `text-base leading-relaxed`
- カード間: `gap-4`

#### 5 段階スケール

```
そう思わない   ①   ②   ③   ④   ⑤   そう思う
              cyan          neutral       amber
```

横一列の 5 つの円形ボタン + 両端ラベル:

| 段階 | 未選択（輪郭） | 選択時（塗り + グロウ） |
| --- | --- | --- |
| 1 | `border-2 border-cyan-500` | `bg-cyan-500 text-white shadow-[0_0_16px_rgba(46,196,214,0.35)]` |
| 2 | `border-2 border-cyan-400/60` | `bg-cyan-400 text-midnight-900 shadow-[0_0_12px_rgba(46,196,214,0.25)]` |
| 3 | `border-2 border-midnight-500` | `bg-midnight-500 text-white` |
| 4 | `border-2 border-amber-400/60` | `bg-amber-400 text-midnight-900 shadow-[0_0_12px_rgba(232,168,50,0.25)]` |
| 5 | `border-2 border-amber-500` | `bg-amber-500 text-white shadow-[0_0_16px_rgba(232,168,50,0.35)]` |

設計ルール:
- 各ボタン: `w-11 h-11`（44px）以上。モバイルでは `w-12 h-12`（48px）を推奨
- `rounded-full`
- ボタン内に数字（1〜5）を表示
- ボタン間: `gap-2`（8px）以上
- 端点ラベル: ボタン列の左右、`text-xs text-muted`
- 選択アニメーション: `scale-110` + グロウ出現、`duration-150 ease-out`
- `flex items-center justify-between` で横一列に配置

> **重要**: amber（warm）↔ cyan（cool）は傾向の**方向**を示す。良い/悪いの意味はない。
> スケールの見た目にポジティブ/ネガティブの印象を持たせないよう配慮する。

#### ナビゲーション

- `mt-8 mb-12`
- 中央揃え、`flex flex-col items-center gap-3`

```
        ← 前のページへ           ← ghost link（ページ1では非表示）

  ┌──────────────────────────┐
  │      次のページへ →        │  ← primary button
  └──────────────────────────┘    モバイル: 全幅
                                  デスクトップ: min-w-[280px]
```

- 最終ページのみ: `"診断結果を見る →"` にラベル変更
- 未回答がある場合:
  - ボタンは `disabled` 状態
  - ボタン下に `"すべての質問に答えてください"` テキスト（`text-sm text-coral-400`）

---

### 8-3. 公開タイプ詳細ページ

#### 構成

```
┌─ ヘッダーバー ──────────────────────┐
├─ タイプヒーロー（明面）───────────────┤
│  アートワーク + タイプ情報 + CTA       │
├─────────────── ここから暗面 ──────────┤
├─ 強み ──────────────────────────────┤
├─ 注意点 ────────────────────────────┤
├─ 詳しい見立て ──────────────────────┤
├─ 担いやすい役割 ─────────────────────┤
├─ 相性 ──────────────────────────────┤
├─ 末尾 CTA ──────────────────────────┤
├─ フッター ──────────────────────────┤
└──────────────────────────────────────┘
```

#### ヘッダーバー

- トップページと同一構成
- 右: `"← トップへ戻る"` ghost link

#### タイプヒーロー

唯一の**明面**（`paper-50`）セクション。タイプの「顔」を大きく見せる。

**モバイル（中央揃え、1 カラム）**:

```
┌──────────────────────────────┐  paper-50
│                              │
│  Public File                 │  ← eyebrow (mono, text-on-light-muted)
│  #DLHN                       │  ← code (mono, amber-500)
│                              │
│     ┌──────────────────┐     │
│     │                  │     │
│     │    [Artwork]     │     │  ← max-w-[260px], rounded-xl
│     │                  │     │     shadow-md
│     └──────────────────┘     │
│                              │
│       鑑識マニア              │  ← type name (display, h1 size)
│                              │
│  「現場に残った痕跡を          │  ← tagline (note font, amber-500)
│    すべて拾い上げる」          │
│                              │
│  サマリテキスト。              │  ← summary (text-sm, muted)
│  このタイプの特徴を            │
│  簡潔に説明する文章。          │
│                              │
│  ┌────────────────────────┐  │
│  │   自分でも診断する →     │  │  ← primary button
│  └────────────────────────┘  │
│                              │
└──────────────────────────────┘
```

**デスクトップ（2 カラム）**:

```
┌─────────────────────────────────────────────┐
│                                             │
│  Public File                                │
│  #DLHN                                      │
│                                             │
│  ┌──────────────┐    鑑識マニア              │
│  │              │                           │
│  │   Artwork    │    「現場に残った痕跡を      │
│  │              │      すべて拾い上げる」      │
│  │              │                           │
│  └──────────────┘    サマリテキスト...         │
│                                             │
│                      [自分でも診断する →]      │
│                                             │
└─────────────────────────────────────────────┘
  ← 40% Artwork →      ← 60% Info →
```

具体的な要素:
- 背景: `paper-50`、テクスチャなし
- eyebrow: `"Public File"`（`font-mono text-xs uppercase tracking-widest`、`text-on-light-muted`）
- タイプコード: `"#DLHN"`（`font-mono text-sm font-bold`、`amber-500`）
- アートワーク: `max-w-[260px] rounded-xl shadow-md overflow-hidden`
- タイプ名: `font-display`、`clamp(1.75rem, 5vw, 2.5rem)`、`text-on-light`
- タグライン: `font-note`、`text-base`、`amber-500`。括弧「」で囲む
- サマリ: `text-sm`、`text-on-light-muted`、`leading-relaxed`
- CTA: primary button
- チビ画像: ある場合、タイプ名の右に `w-16 h-16 rounded-full overflow-hidden` で表示

#### 強み / 注意点

ヒーロー以降はダーク面（`midnight-900`）。

**デスクトップ: 2 カラム横並び / モバイル: 縦積み**

```
┌─ Strengths ────────┐  ┌─ Cautions ─────────┐
│ 強み                │  │ 注意したい点         │
│                    │  │                    │
│ ─ 項目1            │  │ ─ 項目1            │
│ ─ 項目2            │  │ ─ 項目2            │
│ ─ 項目3            │  │ ─ 項目3            │
└────────────────────┘  └────────────────────┘
```

- `grid md:grid-cols-2 gap-6`
- 各カード: `midnight-800 rounded-xl p-6`
- §7-3 のセクション構成 + §7-4 のリスト

#### 詳しい見立て

```
┌─ Overview ─────────────────────────┐
│ 詳しい見立て                        │
│                                    │
│ 詳細な説明テキスト。                 │
│ 複数段落にわたって                   │
│ タイプの特徴を詳しく述べる。          │
└────────────────────────────────────┘
```

- `midnight-800 rounded-xl p-6`
- 本文: `font-serif leading-loose text-base`（`Noto Serif JP` で格調ある表現）

#### 担いやすい役割

```
┌─ Roles ────────────────────────────┐
│ 担いやすい役割                       │
│                                    │
│ [情報整理係] [証拠管理] [記録係]      │  ← chip/tag 形式
└────────────────────────────────────┘
```

- チップ: `rounded-full px-4 py-2 border border-midnight-600 bg-midnight-700 text-sm font-medium`
- `flex flex-wrap gap-2`

#### 相性

```
┌─ Compatibility ────────────────────┐
│ 相性の傾向                          │
│                                    │
│ 説明テキスト...                      │
│                                    │
│ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │ Art  │ │ Art  │ │ Art  │        │
│ │ CODE │ │ CODE │ │ CODE │        │
│ │ 名前  │ │ 名前  │ │ 名前  │        │
│ └──────┘ └──────┘ └──────┘        │
└────────────────────────────────────┘
```

- `grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4`
- 各カード: タイプカード（§7-2）と同一スタイル
- アートワーク: `aspect-[4/3] rounded-lg overflow-hidden bg-midnight-700`
- コードバッジ: `font-mono text-xs text-amber-400`
- 名前: `font-bold text-sm`
- リンク: 各タイプの公開詳細ページへ

#### 末尾 CTA

- `text-center py-8`
- `"自分でも診断する"` primary button
- 補足: `"32問 ・ 約5分で診断"`（`text-xs text-muted mt-2`）

#### 公開ページで表示しないもの

- Type Signature セクション
- 共有パネル

---

### 8-4. 共有結果ページ

§8-3（公開タイプ詳細ページ）をベースに差分を適用する。

#### 静的配信と CSR

`output: 'export'` の制約上、`/types/[typeCode]/[key]` の動的ルートは存在しない。
Netlify `_redirects` で `/types/:typeCode/:key` → `/types/:typeCode/index.html`（200 リライト）し、
クライアント側で URL パスから共有キーを取得・デコードして表示を切り替える。

#### ヒーローの差分

| 項目 | 公開ページ | 共有結果ページ |
| --- | --- | --- |
| eyebrow | `"Public File"` | `"Shared Result"` |
| 見出し | タイプ名 | `"[ユーザー名]さんの診断結果"` |
| ヘッダー右リンク | `"← トップへ戻る"` | `"← タイプ公開ページへ"` |

#### 追加: Type Signature セクション

ヒーロー直後に挿入する。スクリーンショット共有を想定した **1 枚絵のビジュアルボード**。

```
┌─────────────────────────────────────────┐
│                                         │
│  鑑識マニア                  謎解きタイプ  │
│                             診断        │
│                                         │
│              D L H N                    │
│                                         │
│  ── Axis 01 ═══════════════ 72% ──     │
│  ── Axis 02 ═══════════════ 45% ──     │
│  ── Axis 03 ═══════════════ 83% ──     │
│  ── Axis 04 ═══════════════ 61% ──     │
│                                         │
└─────────────────────────────────────────┘
```

- アスペクト比: `1.91 / 1`（OGP と同一）
- `midnight-800 rounded-xl overflow-hidden`
- 背景: ダークグラデーション + 微かなラジアルグロウ
- 左上: タイプ名プレート（`font-display`）
- 中央: タイプコード（`font-heading`、`clamp(3rem, 8vw, 4.8rem)`）
- 下部: 4 軸プログレスバー（§9 の色ペアでグラデーション）
- 右上: 診断名キャプション（`font-mono text-xs text-muted`）

#### 追加: 共有パネル

相性セクションの後に配置。

```
┌─ Share ────────────────────────────┐
│ 結果を共有する                       │
│                                    │
│ SNS共有はタイプ公開ページへ、          │
│ 診断結果URLはコピーで送れます。        │
│                                    │
│ [X で共有]  [LINE で共有]            │  ← secondary buttons
│ [URL をコピー]                      │
└────────────────────────────────────┘
```

- ボタン: secondary style（`border border-cyan-400`）
- 「URL をコピー」: クリック後 `"コピーしました ✓"` にテキスト変化（1.5 秒後に戻す）

#### 診断直後の出し分け

`localStorage` の診断結果と URL のタイプコード + 共有キーが一致する場合:

| 項目 | 一致する場合（自分の結果） | 一致しない場合（他人の結果） |
| --- | --- | --- |
| ヒーロー CTA | `"共有"` + `"おすすめを教える"` | `"自分でも診断する"` |
| Type Signature | 表示 | 表示 |
| 共有パネル | 表示 | 非表示 |

#### ローディング状態

共有キーのデコード中:

```
┌──────────────────────────────┐  paper-50
│                              │
│     ┌──────────────────┐     │
│     │ ████████████████ │     │  ← pulse placeholder
│     │ ████████████████ │     │     (midnight-200/50)
│     └──────────────────┘     │
│                              │
│     ████████████             │  ← text placeholder x3
│     ████████                 │
│     ██████████████████       │
│                              │
└──────────────────────────────┘
```

- ヒーロー領域のみ表示。本文セクションは非表示
- プレースホルダー: `rounded-md bg-paper-200 animate-pulse`

#### エラー状態（無効な共有キー）

```
┌──────────────────────────────┐  midnight-800
│                              │  rounded-xl
│          🔑 (icon)           │  p-8
│                              │  text-center
│     リンクが無効です           │
│                              │
│     共有リンクの形式が         │
│     正しくないか、期限が       │
│     切れている可能性が         │
│     あります。                │
│                              │
│     [トップページへ]          │  ← primary
│     タイプ一覧を見る →         │  ← ghost link
│                              │
└──────────────────────────────┘
```

- 画面中央に配置（`min-h-[60vh] flex items-center justify-center`）
- アイコン: 鍵 SVG、`text-amber-400`、48px
- 見出し: `font-display text-xl mt-4`
- 説明: `text-sm text-muted mt-2 max-w-[280px]`
- CTA: `mt-6 flex flex-col items-center gap-3`

---

## 9. 4 軸メトリクスの配色

4 軸の可視化では、各軸に固有の色ペアを割り当てる。

| 軸 | 正方向（左）色 | 負方向（右）色 | 意図 |
| --- | --- | --- | --- |
| 行動型 ↔ 解読型 | `coral-400` | `cyan-400` | 動く ↔ 読む |
| 局所型 ↔ 俯瞰型 | `amber-400` | `#7b8fff` | 集中 ↔ 俯瞰 |
| 発信型 ↔ 統率型 | `amber-300` | `#6bc9a0` | 発散 ↔ 収束 |
| 熟考型 ↔ 転換型 | `#c89bef` | `cyan-300` | 深める ↔ 切り替える |

プログレスバーは `h-2 rounded-full` で、色ペアの `linear-gradient` で傾向の強さを表現する。
バーの充填率は 0〜100% でアニメーション表示（`transition-all duration-500`）。

---

## 10. コンポーネント構成

### 10-1. ホーム

| コンポーネント | 役割 |
| --- | --- |
| `HomeHeroSection` | ヒーロー（キャッチ + CTA + フィーチャードカード） |
| `HomeStepsSection` | 3 ステップ紹介 |
| `AxisPreviewSection` | 4 軸プレビューカード |
| `StartDiagnosisForm` | 名前入力 + 開始ボタン |
| `AllTypesSection` | 16 タイプギャラリーグリッド |

### 10-2. 診断

| コンポーネント | 役割 |
| --- | --- |
| `DiagnosisProgress` | sticky プログレスヘッダー |
| `DiagnosisFlow` | 診断 UI 全体（ページ管理） |
| `QuestionCard` | 質問テキスト + 5 段階スケール |
| `FivePointScale` | 5 段階回答ボタン群 |

### 10-3. タイプ詳細

| コンポーネント | 役割 |
| --- | --- |
| `TypeDetailHeroSection` | 明面ヒーロー（アートワーク + 情報） |
| `TypeSignatureSection` | 4 軸ビジュアルボード（共有のみ） |
| `TypeListSection` | 強み / 注意点 / 担いやすい役割 |
| `TypeOverviewSection` | 詳しい見立て |
| `TypeCompatibilitySection` | 相性タイプグリッド |
| `TypeSharePanel` | 共有パネル（共有のみ） |
| `TypeArtwork` | 画像 or プレースホルダー |

---

## 11. 画像

| 種類 | パス | サイズ |
| --- | --- | --- |
| 通常画像 | `public/types/{typeCode}.png` | 512×512 推奨 |
| チビ画像 | `public/types/{typeCode}_chibi.png` | 200×200 推奨 |
| OGP 画像 | `public/types/{typeCode}-ogp.png` | 1200×630 |

- 画像未配置時は `TypeArtwork` がプレースホルダーを描画
- プレースホルダー: `bg-gradient-to-br from-midnight-700 to-midnight-800` + タイプコードバッジ（`font-heading text-amber-400`）
- 画像フィルター: `brightness(0.95) contrast(1.05)`（ダーク背景との調和）

---

## 12. モーション

| 名前 | 内容 | 用途 |
| --- | --- | --- |
| `fadeIn` | `opacity: 0→1`、300ms、`ease-out` | セクション出現 |
| `slideUp` | `translateY: 12px→0` + fadeIn、400ms | カード出現 |
| `scaleIn` | `scale: 0.95→1` + fadeIn、200ms | 選択フィードバック |
| `pulse` | `opacity: 0.5→1→0.5`、1.5s、infinite | ローディング |
| `fillBar` | `scaleX: 0→target`、600ms、`ease-out` | プログレスバー |

ルール:
- 出現スタガー: 0.05s 刻み
- ホバー / 選択のトランジション: `duration-150 ease-out`
- `prefers-reduced-motion: reduce` ですべて即時完了（`duration: 0ms`）

---

## 13. レスポンシブ

| ブレークポイント | 値 | 主な変化 |
| --- | --- | --- |
| `sm` | 520px | ギャラリー 3 列化 |
| `md` | 768px | ヒーロー 2 カラム化、強み/注意点横並び |
| `lg` | 1024px | コンテンツ最大幅制約 |

- **モバイルファースト**: すべて 1 カラムから設計し、`md:` 以上で展開
- コンテンツ最大幅: `max-w-3xl`（768px）、`mx-auto`、`px-4`
- 全幅セクション: ヒーロー、フッターのみ
- 診断フロー: 常に 1 カラム
- タイプギャラリー: `auto-fill` で自動調整

---

## 14. 対象外

以下は本仕様の対象外とする。

- 専用 `/types` 一覧ページ（トップページ内のギャラリーで代替）
- `next/og` 前提の動的 OGP 生成
- framer-motion 等の motion ライブラリ依存
- サーバーサイド API / Edge Function
- ダークモード / ライトモード切替（常時ダーク）
- i18n / 多言語対応
