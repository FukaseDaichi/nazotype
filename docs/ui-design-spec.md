# 謎解きタイプ診断 UI デザイン仕様書

## 1. 文書の目的

本書は、謎解きタイプ診断の UI デザイン方針を定義する設計仕様書である。
リアル脱出ゲーム・協力型謎解きの世界観に合わせた新デザインの方向性を定める。

参照:

- [specification.md](./specification.md)
- [frontend-directory-structure-spec.md](./frontend-directory-structure-spec.md)

---

## 2. デザインコンセプト

### 2-1. コンセプト名

**「ミッションボード」— 脱出前の作戦会議室**

リアル脱出ゲームの開始前、チームが集まってブリーフィングを受ける**作戦会議室**がモチーフ。壁にはミッションボードが掛かり、チームメンバーの得意分野が整理されている。暗い室内に、手がかりを照らす琥珀色の光と、装置のシアンの発光が差す。

### 2-2. ムードキーワード

- **没入 × 親しみ**：ダークベースで脱出ゲーム会場の空気を作りつつ、色彩と丸みで威圧感を消す
- **発見の光**：暗闇の中で手がかりを見つけた瞬間の高揚感を、アンバーのアクセントで表す
- **チームの装備画面**：ゲームのキャラ選択・ステータス画面のような「自分の強みを確認する楽しさ」
- **設計図と手書きメモ**：ブループリントの正確さと、走り書きの臨場感の同居

### 2-3. 旧テーマとの対応

| マダミス版（旧） | 謎解き版（新） |
| --- | --- |
| ケースファイル・封筒 | ミッションボード・作戦会議室 |
| 被疑者カード | チームメンバーカード |
| CONFIDENTIAL スタンプ | MISSION ASSIGNED バッジ |
| ノワール・セピア基調 | ミッドナイトブルー基調 |
| 古紙テクスチャ | ブループリントグリッド |
| 万年筆ペン先アイコン | 発光ドット / キーモチーフ |
| rose / plum 差し色 | amber / cyan 差し色 |

---

## 3. スタイリング方針

### 3-1. 基本原則：Tailwind-first

本プロジェクトのスタイリングは **Tailwind CSS を第一手段** とし、CSS は Tailwind だけでは表現できない場面に限って補助的に使う。

```
Tailwind ユーティリティ（JSX 内）  ← 大多数のスタイルはここ
      ↓ 足りないときだけ
CSS Module（*.module.css）        ← 複雑な装飾・擬似要素
      ↓ 全体共通だけ
globals.css                       ← トークン定義・ベーススタイル・@keyframes
```

### 3-2. `@theme` によるトークン登録

Tailwind CSS v4 では `@theme` ディレクティブでデザイントークンを登録すると、自動的にユーティリティクラスとして使えるようになる。本プロジェクトのカラー・フォント・スペーシング・角丸・シャドウ等はすべて `globals.css` 内の `@theme` で登録し、JSX 側では Tailwind クラスで参照する。

```css
/* globals.css */
@import "tailwindcss";

@theme {
  /* カラー */
  --color-midnight-950: #080d18;
  --color-midnight-900: #0e1525;
  --color-midnight-800: #162038;
  --color-midnight-700: #1e2d52;
  --color-midnight-600: #2a3d6b;
  --color-amber-400: #e8a832;
  --color-cyan-400: #2ec4d6;
  --color-coral-500: #e65a4a;
  --color-paper-100: #f2ebe0;
  /* ... 他トークンも同様 */

  /* フォント */
  --font-body: "Noto Sans JP", "Hiragino Sans", sans-serif;
  --font-display: "Shippori Mincho B1", "Yu Mincho", serif;
  --font-mono: "IBM Plex Mono", monospace;
  --font-note: "Klee One", cursive;
  --font-heading: "Bebas Neue", sans-serif;

  /* スペーシング */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  /* ... */

  /* 角丸 */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* シャドウ */
  --shadow-sm: 0 2px 10px rgba(14, 21, 37, 0.25);
  --shadow-md: 0 12px 32px rgba(14, 21, 37, 0.3);
}
```

これにより、JSX 内で以下のように参照できる:

```jsx
<div className="bg-midnight-800 border border-midnight-600 rounded-xl p-5 shadow-sm">
  <h2 className="font-display text-amber-400 text-xl tracking-tight">...</h2>
  <p className="text-[--color-text-subtle] text-sm">...</p>
</div>
```

### 3-3. Tailwind で行うこと

以下は **すべて Tailwind ユーティリティクラスで JSX に直接書く**。CSS ファイルに分離しない。

| 領域 | 例 |
| --- | --- |
| レイアウト | `flex`, `grid`, `grid-cols-3`, `gap-4`, `items-center` |
| サイズ・スペーシング | `w-full`, `max-w-[40rem]`, `mx-auto`, `p-5`, `mt-8` |
| カラー | `bg-midnight-800`, `text-amber-400`, `border-midnight-600` |
| タイポグラフィ | `font-display`, `text-xl`, `tracking-tight`, `leading-tight` |
| 角丸・ボーダー | `rounded-xl`, `border`, `border-midnight-600` |
| シャドウ | `shadow-sm`, `shadow-md` |
| レスポンシブ | `md:grid-cols-2`, `lg:grid-cols-4` |
| 状態 | `hover:bg-midnight-700`, `focus-visible:ring-2`, `focus-visible:ring-cyan-400` |
| トランジション | `transition-all`, `duration-200`, `ease-out` |
| 表示制御 | `hidden`, `sm:block`, `sr-only` |

### 3-4. CSS Module で行うこと

以下は Tailwind だけでは表現しにくいため、**コンポーネントごとの CSS Module**（`*.module.css`）に書く。

| 用途 | 理由 |
| --- | --- |
| 多層背景テクスチャ | ブループリントグリッド、方眼線など `background` の複数重ね合わせ |
| 擬似要素の装飾 | `::before` / `::after` によるテープ風装飾、マージンライン、スタンプバッジ |
| `@keyframes` 参照 | コンポーネント固有のアニメーション適用 |
| `data-*` 属性セレクタ | `[data-tone="5"]` など動的バリアント |
| 極端に長くなる className の回避 | 1 要素に 15 クラス以上つく場合は CSS Module のほうが可読性で勝る |

CSS Module 内でも **色やスペーシングは Tailwind のトークン変数を参照する**。ハードコーディングしない。

```css
/* good: トークン参照 */
.blueprintGrid::before {
  background-size: 32px 32px;
  background-image:
    linear-gradient(var(--color-midnight-600) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-midnight-600) 1px, transparent 1px);
  opacity: 0.06;
}

/* bad: 値を直書き */
.blueprintGrid::before {
  background-image: linear-gradient(#2a3d6b 1px, transparent 1px);
}
```

### 3-5. `globals.css` で行うこと

`globals.css` の責務は最小限に絞る。

| 用途 | 内容 |
| --- | --- |
| `@theme` | デザイントークンの登録（カラー、フォント、スペーシング、角丸、シャドウ） |
| ベーススタイル | `body` の背景（多層グラデーション＋グリッド）、`::selection`、`a` のリセット |
| `@keyframes` | 全体で共有するアニメーション定義（`fadeSlideUp`, `pulseGlow` 等） |
| アクセシビリティ | `.skip-link`、`:focus-visible` のグローバル定義、`prefers-reduced-motion` |

### 3-6. 旧 globals.css クラスの移行方針

現行コードには `.surface-panel`、`.primary-button`、`.eyebrow` 等のグローバル CSS クラスが多数あるが、新デザインではこれらを **Tailwind ユーティリティの組み合わせに置き換える**。

移行パターン:

| 旧クラス | 新しい表現方法 |
| --- | --- |
| `.page-shell` | `max-w-[40rem] mx-auto px-4` |
| `.primary-button` | `inline-flex items-center gap-3 min-h-[52px] rounded-lg px-6 py-3 bg-coral-500 text-white font-bold shadow-sm hover:bg-coral-600 hover:-translate-y-px transition-all` |
| `.secondary-button` | `inline-flex items-center gap-3 min-h-[52px] rounded-lg px-6 py-3 border border-cyan-500 text-cyan-400 font-bold hover:bg-cyan-500/10 hover:-translate-y-px transition-all` |
| `.text-field` | `w-full min-h-[52px] rounded-lg border border-midnight-600 bg-midnight-800 px-4 py-3 transition-all focus-visible:border-cyan-400 focus-visible:ring-4 focus-visible:ring-cyan-400/15` |
| `.eyebrow` | `font-mono text-xs font-bold uppercase tracking-widest text-amber-400` |
| `.section-title` | `font-display text-2xl leading-tight tracking-tight` |
| `.surface-panel` | CSS Module に残す（`::after` 擬似要素を使うため） |
| `.briefing-panel` | CSS Module に残す（多層テクスチャ背景のため） |

繰り返し現れるユーティリティの組み合わせが冗長になる場合は、**React コンポーネントとして切り出す**（CSS クラスとして抽出するのではなく）。

```tsx
// CSS クラスではなく React コンポーネントで再利用する
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl leading-tight tracking-tight">{children}</h2>;
}
```

### 3-7. 避けるべきパターン

| やらないこと | 理由 |
| --- | --- |
| 色やスペーシングを CSS に直書き | `@theme` 経由の Tailwind クラスを使えば一元管理できる |
| 単純な hover/focus を CSS に書く | `hover:`, `focus-visible:` バリアントで足りる |
| レスポンシブ切り替えを `@media` で CSS に書く | `sm:`, `md:`, `lg:` プレフィックスで足りる |
| `@apply` で Tailwind をまとめる | コンポーネント化で対処する。`@apply` は globals.css の最小限に留める |
| globals.css に新しい見た目クラスを追加する | Tailwind ユーティリティまたは CSS Module で対処する |

---

## 4. カラーパレット

### 4-1. プリミティブ

**Midnight（ベース）**

| トークン | 値 | 用途 |
| --- | --- | --- |
| `midnight-950` | `#080d18` | 最深部、ボディ背景グラデーション端 |
| `midnight-900` | `#0e1525` | ページ背景 |
| `midnight-800` | `#162038` | カード・パネル背景 |
| `midnight-700` | `#1e2d52` | 浮き上がった面・ホバー |
| `midnight-600` | `#2a3d6b` | ボーダー・区切り線 |
| `midnight-500` | `#3a5590` | 無効状態の枠 |

**Paper（ブリーフィング面）**

| トークン | 値 | 用途 |
| --- | --- | --- |
| `paper-50` | `#faf7f2` | 最明面・ヒーローカード |
| `paper-100` | `#f2ebe0` | ブリーフィングボード面 |
| `paper-200` | `#e5dace` | 控えめな明面 |
| `paper-300` | `#c9bfb0` | 紙面のサブテキスト |

**Amber（発見・ゴールド）**

| トークン | 値 | 用途 |
| --- | --- | --- |
| `amber-300` | `#f5c84a` | ハイライト・バッジ |
| `amber-400` | `#e8a832` | ブランドカラー主調 |
| `amber-500` | `#d49420` | 強調時 |
| `amber-600` | `#b07a15` | 暗い面上のアクセント |

**Cyan（装置・メカニズム）**

| トークン | 値 | 用途 |
| --- | --- | --- |
| `cyan-300` | `#5dd8e6` | 発光表現・選択状態 |
| `cyan-400` | `#2ec4d6` | インタラクティブ要素 |
| `cyan-500` | `#1aabb8` | ボタン・リンク |
| `cyan-600` | `#148e9a` | 押下時 |

**Coral（アクション・始動）**

| トークン | 値 | 用途 |
| --- | --- | --- |
| `coral-300` | `#f58d80` | ソフトな注意 |
| `coral-400` | `#f07060` | 通常 |
| `coral-500` | `#e65a4a` | 主 CTA |
| `coral-600` | `#d14838` | CTA ホバー |

**ユーティリティ**

| トークン | 値 | 用途 |
| --- | --- | --- |
| `success` | `#3cb97a` | 成功・完了 |
| `warning` | `#e8a832` | 注意（amber-400 共用） |
| `danger` | `#e65a4a` | エラー（coral-500 共用） |

### 4-2. セマンティックトークン

| トークン | 参照先 | 用途 |
| --- | --- | --- |
| `--color-bg` | `midnight-900` | ページ背景 |
| `--color-surface` | `midnight-800` | カード・パネル |
| `--color-surface-raised` | `midnight-700` | 浮き上がりパネル |
| `--color-briefing` | `paper-100` | 明面（ヒーロー・ブリーフィング） |
| `--color-briefing-strong` | `paper-50` | 最明面 |
| `--color-line` | `midnight-600` | ボーダー |
| `--color-text` | `#e8e4dc` | 暗面上テキスト |
| `--color-text-subtle` | `#8b9ab5` | 暗面上サブテキスト |
| `--color-text-on-briefing` | `#1a2240` | 明面上テキスト |
| `--color-text-on-briefing-subtle` | `#5a6478` | 明面上サブテキスト |
| `--color-brand` | `amber-400` | ブランド主調 |
| `--color-brand-strong` | `amber-500` | ブランド強調 |
| `--color-accent` | `cyan-400` | アクセント |
| `--color-accent-soft` | `cyan-400` / 12% | 薄いアクセント背景 |
| `--color-action-primary` | `coral-500` | 主ボタン |
| `--color-action-primary-hover` | `coral-600` | 主ボタンホバー |
| `--color-action-secondary` | `cyan-500` | 副ボタン |
| `--color-action-secondary-hover` | `cyan-600` | 副ボタンホバー |
| `--color-focus-ring` | `cyan-400` | フォーカスリング |

### 4-3. 運用ルール

- ページ全体はミッドナイトブルーのダーク基調
- ブリーフィングカード（ヒーロー、ミッションボード）だけ明面にする
- 主 CTA は coral、補助アクションは cyan
- 発見・強調は amber、状態表示は cyan
- 診断フローの 5 段階スケールでは肯定側を amber（warm）、否定側を cyan（cool）で分ける
- ダーク面上のテキストは WCAG AA 以上のコントラストを確保する

---

## 5. タイポグラフィ

### 5.1 ルートフォント

`app/layout.tsx` で読み込む。

- `Noto Sans JP` — 日本語本文
- `Shippori Mincho B1` — 日本語ディスプレイ・引用

### 5.2 画面固有フォント

トップ / 診断 / タイプ詳細では次を追加で使う。

- `Bebas Neue` — 英字大見出し
- `IBM Plex Mono` — コード・ラベル・メタ情報（旧 Special Elite の代替）
- `Noto Serif JP` — 日本語の格調ある見せ方
- `Klee One` — 手書きメモ・フィールドノート風注記（旧 Caveat の代替）

### 5.3 使い分け

| 用途 | フォント | 意図 |
| --- | --- | --- |
| 英字大見出し | `Bebas Neue` | インパクト、ミッション感 |
| タイプコード・軸コード | `IBM Plex Mono` | 装置の表示板、データ的な正確さ |
| 英字ラベル・メタ | `IBM Plex Mono` | ブループリントの注記 |
| 日本語本文 | `Noto Sans JP` | 可読性 |
| 日本語ディスプレイ | `Shippori Mincho B1` | タイプ名・タグラインの格調 |
| 日本語説明文で格調が必要 | `Noto Serif JP` | 診断結果の説明 |
| 手書きメモ | `Klee One` | フィールドノート、走り書き |

---

## 6. 背景と空間表現

### 6-1. ページ背景

`body` は次の重ね合わせで構成する。

1. `midnight-950` → `midnight-900` の縦グラデーション（部屋の奥行き）
2. 左上に amber の極薄ラジアルグラデーション（光源の暗示）
3. 右下に cyan の極薄ラジアルグラデーション（装置の発光）
4. **ブループリントグリッド**：`midnight-600` / 6% の 32×32px 格子（旧グリッドの代替）

### 6-2. ブリーフィング面

ヒーローやミッションボードなど明るい面では:

- `paper-100` ベース
- 薄い方眼線テクスチャ（`paper-200` / 40%、16×16px 格子）
- 左マージンラインを amber に変更（旧 red 代替）

---

## 7. 共通 UI パターン

### 7.1 Tailwind ユーティリティで表現するパターン

以下は globals.css にクラスを作らず、JSX 内の Tailwind クラスで直接表現する。

| パターン | Tailwind クラス例 |
| --- | --- |
| ページシェル | `max-w-[40rem] mx-auto px-4 relative` |
| プライマリボタン | `inline-flex items-center gap-3 min-h-[52px] rounded-lg px-6 py-3 bg-coral-500 text-white font-bold shadow-sm hover:bg-coral-600 hover:-translate-y-px transition-all` |
| セカンダリボタン | `inline-flex items-center gap-3 min-h-[52px] rounded-lg px-6 py-3 border border-cyan-500 text-cyan-400 font-bold hover:bg-cyan-500/10 hover:-translate-y-px transition-all` |
| テキストフィールド | `w-full min-h-[52px] rounded-lg border border-midnight-600 bg-midnight-800 px-4 py-3 transition-all focus-visible:border-cyan-400 focus-visible:ring-4 focus-visible:ring-cyan-400/15 outline-none` |
| アイブロウ | `font-mono text-xs font-bold uppercase tracking-widest text-amber-400` |
| セクション見出し | `font-display text-2xl leading-tight tracking-tight` |
| ヒーローグリッド | `grid gap-5 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:items-start` |
| メトリクスカード | `flex flex-col gap-1 rounded-lg bg-midnight-700 p-3` |
| メトリクス値 | `font-heading text-[1.7rem] leading-none text-amber-400` |
| プログレストラック | `h-1 rounded-full bg-midnight-700 overflow-hidden` |
| プログレスフィル | `h-full origin-left bg-gradient-to-r from-cyan-400 to-amber-400` |
| タイプカード | `flex flex-col gap-2 rounded-lg border border-midnight-600 bg-midnight-800 p-4 hover:bg-midnight-700 transition-colors` |
| タイプチップ | `flex flex-col gap-1 rounded-lg border border-midnight-600 bg-midnight-800 p-3 hover:-translate-y-px transition-all` |

繰り返しが多い組み合わせは React コンポーネントで再利用する（セクション 3-6 参照）。

### 7.2 CSS Module に残すパターン

以下は擬似要素や多層背景が必要なため、CSS Module（`*.module.css`）で定義する。

| パターン | 理由 |
| --- | --- |
| `surfacePanel` | `::after` で内側ボーダーを描画する |
| `briefingPanel` | 多層テクスチャ背景 + 左マージンライン（`::before`） |
| `illustrationFrame` | プレースホルダーの多層グラデーション背景 |
| `blueprintGrid` | `body::before` のブループリントグリッドオーバーレイ |
| `stampBadge` | 回転 + 半透明の「MISSION ASSIGNED」バッジ（`transform` + `opacity` の組み合わせ） |
| `tapeDecoration` | テープ風装飾の `::before` |

CSS Module 内でも色・スペーシングは `var(--color-midnight-800)` 等のトークン変数で参照する。

### 7.3 アイコン・モチーフ

テーマに沿ったモチーフをアクセントとして使う。

| モチーフ | 使いどころ | 意味 |
| --- | --- | --- |
| 鍵 / 錠前 | ヘッダー、CTA 付近 | 解錠＝自分を知る |
| 歯車 | 軸の説明、メカニズム的表示 | 噛み合い＝チーム連携 |
| コンパス | 4 軸ダイアグラム | 方向性＝傾向 |
| 電球 | 発見・ヒント | ひらめき＝気づき |
| 地図ピン | タイプ一覧 | 位置づけ＝自分の居場所 |

モチーフは SVG アイコンとして最小限に使い、散りばめすぎない。

### 7.4 アクセシビリティ

- `skip-link` を配置する
- `:focus-visible` で `cyan-400` のフォーカスリングを明示する
- `prefers-reduced-motion: reduce` でアニメーションを抑制する
- ダーク背景上のテキストは WCAG AA（4.5:1）以上を確保する
- ブリーフィング面上のテキストも同様

---

## 8. 画面別ルール

### 8.1 トップページ

主な構成:

1. マストヘッド
2. ミッションボード風ヒーロー
3. プレビュータイプのサイドカード
4. 診断開始フォーム
5. 4 軸解説
6. 注目タイプ
7. 16 タイプ一覧
8. フッター

#### マストヘッド

- ダーク背景、`midnight-800` 下ボーダー
- ロゴ：`amber-400` テキスト、鍵アイコンをあしらう
- ナビ：`IBM Plex Mono`、小文字、ホバーで `cyan-300`

#### ヒーロー

- **ブリーフィング面**（`paper-100` 背景）を大きく使う
- 方眼テクスチャ、左マージンライン（`amber-400`）
- ファイルメタ：`IBM Plex Mono`、`paper-300` テキスト
- タイトル：`Bebas Neue` + `Shippori Mincho`
- 「MISSION ASSIGNED」バッジ：回転配置、amber 枠、半透明
- 統計バッジ：`32 Questions / 4 Pages / 16 Types / 4 Axes`、amber 数値
- CTA：`#start` アンカーへの `primary-button`

#### サイドカード

- `midnight-800` 背景、上辺に `amber-400` ライン
- チームメンバーカードの見た目
- タイプ画像、タイプコード（`IBM Plex Mono`、amber）、タイプ名、タグライン
- 下部にサマリテキスト

#### 診断開始フォーム

- `midnight-900` 背景セクション
- 名前入力フィールド：focus で `cyan-400` ボーダーとグロウ
- 開始ボタン：`coral-500`、ホバーで浮き上がり
- 続きから再開リンク：`cyan-400` テキスト

#### 4 軸解説

- ダーク背景、上部に amber のラジアルグラデーントアクセント
- 縦ストライプパターンオーバーレイ（ブループリント風）
- 各軸をカードで表示
- 軸コード：`IBM Plex Mono`、`amber-300` で大きく表示
- 対比する 2 方向を VS 区切りで並べる
- カード背景：`midnight-800` に微かな cyan のラジアルグロウ

#### 注目タイプ

- 4 カラムグリッド（暗面）
- 各カードの上辺に軸テーマカラーのアクセントライン
- ホバーで画像が明るくなる
- タイプ名、コード、タグライン

#### 16 タイプ一覧

- auto-fit グリッド、最小 160px
- `midnight-800` チップカード
- タイプコード（amber）、タイプ名
- ホバーで `midnight-700` に浮き上がり

### 8.2 診断フロー

主な構成:

1. ブリーフィングヘッダー
2. ミッション進捗バー
3. 質問パネル
4. 5 段階スケール
5. 前へ / 次へボタン

#### ブリーフィングヘッダー

- `paper-100` 背景、方眼テクスチャ
- 左マージンライン（`amber-400`）
- ファイルメタ：`IBM Plex Mono`
- ページタイトル：`Shippori Mincho`
- 進捗バー：`midnight-700` トラック、`cyan-400` → `amber-400` グラデーション fill

#### 質問パネル

- `midnight-900` 背景
- 各質問は `midnight-800` カード、上辺に薄いグラデーントアクセントライン
- セクションヘッダーに軸名を表示
- スケールガイド：左右のラベルで方向を示す

#### 5 段階スケール

5 段階の回答 UI は、amber ↔ cyan のグラデーションで傾向の方向を表現する。

| 段階 | 色 | ラベル |
| --- | --- | --- |
| 5（とてもそう思う） | `amber-500` 強 | warm 側 |
| 4（ややそう思う） | `amber-400` 弱 | warm 側 |
| 3（どちらでもない） | `paper-300` ミュート | 中立 |
| 2（あまりそう思わない） | `cyan-400` 弱 | cool 側 |
| 1（まったくそう思わない） | `cyan-500` 強 | cool 側 |

選択時：アイコンが拡大し、ドロップシャドウ（対応色のグロウ）が付く。

#### アクションボタン

- 「次へ」：`coral-500`、`Bebas Neue`、全幅
- 「前へ」：透過、`IBM Plex Mono`、枠線のみ
- モバイルでは縦並び（「次へ」が上）

#### 特殊状態

- ローディング：ダーク画面にパルスアニメーション
- 名前未入力：トップへ戻す導線を表示
- 未回答エラー：`coral-400` テキスト、最初の未回答設問へフォーカス

### 8.3 公開タイプ詳細ページ

主な構成:

1. ヘッダー
2. チームメンバーカード風ヒーロー
3. 強み / 注意点
4. 詳しい見立て
5. 担いやすい役割
6. 相性
7. フッター

#### ヒーロー

- **ブリーフィング面**（`paper-100` 背景）
- 方眼テクスチャ、左マージンライン（`amber-400`）
- 「MISSION ASSIGNED」バッジ（回転配置、amber）
- ファイルメタ：`IBM Plex Mono`
- タイプ名：`Shippori Mincho`、クランプスケーリング
- タグライン：`Klee One`、`amber-500`
- 2 カラム：アートワーク（260px）+ コンテンツ（1fr）
- アートワーク：上辺にテープ風装飾、`illustration-frame` に収める
- チビ画像があれば 200×200 の補助フレームに表示
- CTA：「自分でも診断する」（`primary-button`）

#### 本文セクション

各セクションは統一レイアウト:

- `midnight-800` 背景パネル
- eyebrow（`IBM Plex Mono`、`amber-400`）+ section-title + コンテンツ
- リスト項目のブレット：amber ダッシュ
- フェードアップアニメーション

#### 相性セクション

- 相性タイプのカードを auto-fit グリッドで配置
- 各カード：1.91:1 アスペクト、OGP 画像背景
- ホバーで画像がスケールアップ、シャドウ強調
- タイプ名とコードバッジのオーバーレイ

#### 補足

- 公開ページでは `Type Signature` セクションを表示しない
- 公開ページでは共有パネルも表示しない

### 8.4 共有結果ページ

公開タイプ詳細ページと本文構成を共有しつつ、次が追加される。

- 見出しが「[ユーザー名]さんの診断結果」になる
- `Type Signature` セクションを表示する
- 共有パネルを表示する
- 結果 URL コピーを提供する

#### Type Signature セクション

- 1.91:1 アスペクト比のボード
- ダークグラデーション背景に OGP 画像（フィルター付き）
- グリッドオーバーレイ（40×40px）
- 左上：タイプ名プレート
- 中央：タイプコード大文字（`Bebas Neue`、クランプ 3rem-4.8rem）
- 4 軸メトリクス：プログレスバーで表示、各軸に対応色を割り当てる
- 右下：診断名キャプション

#### ヒーロー下の差分

- 診断直後の `localStorage` が一致する場合だけ「共有」ボタンを出す
- それ以外の shared page は「自分でも診断する」を出す

---

## 9. 4 軸メトリクスの配色

4 軸の可視化では、各軸に固有の色ペアを割り当てる。

| 軸 | 正方向色 | 負方向色 | 意図 |
| --- | --- | --- | --- |
| 行動型 ↔ 解読型 | `coral-400` | `cyan-400` | 動く ↔ 読む |
| 局所型 ↔ 俯瞰型 | `amber-400` | `#7b8fff`（soft indigo） | 集中 ↔ 俯瞰 |
| 発信型 ↔ 統率型 | `#f5c84a`（amber-300） | `#6bc9a0`（soft green） | 発散 ↔ 収束 |
| 熟考型 ↔ 転換型 | `#c89bef`（soft purple） | `#5dd8e6`（cyan-300） | 深める ↔ 切り替える |

プログレスバーはこの色ペアのグラデーションで傾向の強さを表現する。

---

## 10. コンポーネント別の役割

### 10.1 ホーム

- `HomeHeroSection`: ミッションボード風ヒーロー、統計、開始導線
- `AxisCompositionSection`: 4 軸のブループリント風解説
- `FeaturedTypesSection`: 注目タイプのカードグリッド
- `AllTypesSection`: トップページ内の 16 タイプ一覧

### 10.2 診断

- `StartDiagnosisForm`: 名前入力
- `DiagnosisFlow`: 診断 UI 全体（ブリーフィングヘッダー + 質問パネル）

### 10.3 タイプ詳細

- `TypeArtwork`: 通常画像またはプレースホルダー
- `TypeDetailHeroSection`: チームメンバーカード風ヒーロー
- `TypeSignatureSection`: 共有結果の 4 軸可視化ボード
- `TypeListSection`: 強み / 注意点 / 担いやすい役割
- `TypeCompatibilitySection`: 相性
- `TypeSharePanel`: 共有パネル

---

## 11. 画像ルール

- 通常画像: `public/types/{typeCode}.png`
- チビ画像: `public/types/{typeCode}_chibi.png`
- OGP: `public/types/{typeCode}-ogp.png`
- 画像未配置時は `TypeArtwork` がプレースホルダーを描画する
- プレースホルダーは `midnight-700` → `midnight-800` グラデーション + タイプコードバッジ（amber）
- 画像表示時のフィルター：旧 sepia → `brightness(0.95) contrast(1.05)`（ダーク背景に合わせた軽い調整のみ）

---

## 12. アニメーション

| 名前 | 内容 | 用途 |
| --- | --- | --- |
| `fadeSlideUp` | opacity 0→1, translateY 16px→0, 500ms | セクション出現 |
| `pulseGlow` | box-shadow の明滅（cyan-400 / 20%） | ローディング |
| `progressFill` | scaleX 0→1, ease-out | 進捗バー |

- 遅延は 0.1s 刻みのスタガーで使う
- `prefers-reduced-motion: reduce` ですべて即時表示に切り替える

---

## 13. レスポンシブ方針

- モバイル優先
- トップページは大画面で非対称レイアウト（ヒーロー 2 カラム）
- 診断フローは常に 1 カラム中心
- タイプページは 1 カラムをベースに一部だけ 2 カラムにする
- ブレークポイント：520px / 640px / 768px / 940px / 1180px

---

## 14. 現行仕様として含めないもの

- 専用 `/types` 一覧ページ
- `next/og` 前提の動的 OGP レイアウト
- motion ライブラリ依存の演出
