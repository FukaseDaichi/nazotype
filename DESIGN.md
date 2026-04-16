# DESIGN.md — 謎解きタイプ診断 デザインシステム

## 1. デザインの目的

「スマホで片手で診断して、結果をスクショして即シェアしたくなる」体験をつくる。

この 1 文がすべての設計判断の基準となる。迷ったらこの文に立ち戻る。

### 最上位ゴール

| 優先度 | ゴール |
| --- | --- |
| 1 | **スマホで親指だけで完結する** — タップ・スワイプ・スクロールのみ |
| 2 | **結果画面がスクショ映えする** — SNS で見た人が「自分もやりたい」と思う |
| 3 | **「かっこいい」と思わせる** — ダークで洗練されたゲーム UI |
| 4 | **迷わない** — 次に何をすればいいか常に明確 |

---

## 2. デザインコンセプト

### コンセプト名

**「Player Select」— 次のミッション、あなたの役割は？**

協力型ゲーム開始前のキャラクター選択画面がモチーフ。
暗い空間に浮かぶプレイヤーカード、光るステータスバー、チーム編成のアイコン。

### デザイン原則

| # | 原則 | 判断基準 |
| --- | --- | --- |
| 1 | **Thumb-first** | 主要操作が画面下半分で完結するか？ |
| 2 | **Less is more** | 1 画面 1 メッセージに収まっているか？ |
| 3 | **光で導く** | 色だけで次のアクションがわかるか？ |
| 4 | **Screenshot-ready** | そのまま切り取って SNS に載せられるか？ |
| 5 | **Fast** | 3G 回線でも 3 秒以内に意味のある描画があるか？ |

---

## 3. カラーシステム

### 3-1. パレット

サイト全体はダーク基調。アクセントカラーで視線を誘導する。

**Base（暗面）**

| トークン | 値 | 用途 |
| --- | --- | --- |
| `mystery-950` | `#0a0812` | 最深部・ページ背景 |
| `mystery-900` | `#0f0d1d` | セクション背景 |
| `mystery-800` | `#1a1530` | カード・パネル |
| `mystery-700` | `#241f45` | ホバー・浮き上がり |
| `mystery-600` | `#302a5a` | ボーダー |
| `mystery-500` | `#3d366f` | 無効状態・トラック |

**Gold（ブランド・発見）**

| トークン | 値 | 用途 |
| --- | --- | --- |
| `gold-300` | `#e8c96a` | ハイライト・光 |
| `gold-400` | `#c19b2e` | ブランド主調・ラベル |
| `gold-500` | `#a07e20` | 強調テキスト |
| `gold-600` | `#86691a` | 暗面アクセント |

**Clue（インタラクション）**

| トークン | 値 | 用途 |
| --- | --- | --- |
| `clue-400` | `#3d6898` | UI 要素・ボタン |
| `clue-500` | `#2d4a6e` | リンク・アクティブ |
| `clue-600` | `#1f3a58` | 押下時 |

**Rust（CTA・アクション）**

| トークン | 値 | 用途 |
| --- | --- | --- |
| `rust-400` | `#b34825` | CTA ホバー |
| `rust-500` | `#e65a3a` | CTA ボタン |
| `rust-600` | `#833019` | CTA 押下 |

**Paper（テキスト階層）**

| トークン | 値 | 用途 |
| --- | --- | --- |
| `paper-50` | `#f5f0e8` | 本文テキスト |
| `paper-100` | `#e8e0cc` | やや控えめテキスト |
| `paper-200` | `#c9b99a` | サブテキスト |
| `paper-300` | `#8b6d4a` | 最も控えめなテキスト |

### 3-2. セマンティックトークン

```css
:root {
  --color-bg: var(--color-mystery-950);
  --color-surface: var(--color-mystery-800);
  --color-surface-hover: var(--color-mystery-700);
  --color-border: var(--color-mystery-600);
  --color-text: #f5f0e8;
  --color-text-muted: #c9b99a;
  --color-text-subtle: #8b6d4a;
  --color-brand: var(--color-gold-400);
  --color-cta: #e65a3a;
  --color-cta-hover: var(--color-rust-400);
}
```

### 3-3. 運用ルール

- ページ全体は常にダーク（`mystery-950`）。ライトモード切替なし
- 唯一の明面は**タイプ詳細ヒーロー**（`paper-50` 背景）
- CTA は rust 系、副次アクションは clue 系
- 発見・強調・ラベルは gold 系
- テキストコントラスト: WCAG AA（4.5:1）以上を必ず確保

---

## 4. タイポグラフィ

### 4-1. フォントスタック

| 役割 | フォント | 用途 |
| --- | --- | --- |
| 日本語見出し | `Shippori Mincho B1` | タイプ名・セクション見出し |
| 日本語本文 | `Noto Sans JP`（Variable） | 可読性最優先の本文 |
| 英字・コード | `Space Mono` | ラベル・タイプコード・eyebrow |
| 格調ある説明文 | `Noto Serif JP` | タイプ詳細の「見立て」パート |

### 4-2. サイズスケール

| 名前 | サイズ | Tailwind | 用途 |
| --- | --- | --- | --- |
| hero | `clamp(2.5rem, 8vw, 5rem)` | カスタム | ヒーロー見出し |
| h1 | `clamp(1.5rem, 4vw, 2.25rem)` | カスタム | ページ見出し |
| h2 | `1.25rem` | `text-xl` | セクション見出し |
| body | `1rem` | `text-base` | 本文（最小 16px） |
| small | `0.875rem` | `text-sm` | 補足・メタ |
| xs | `0.75rem` | `text-xs` | ラベル・バッジ |

### 4-3. 日本語タイポグラフィルール

| ルール | 値 | 理由 |
| --- | --- | --- |
| 本文 `line-height` | `1.8`〜`2.0` | 日本語は英語より行間が必要 |
| 本文 `letter-spacing` | `0.04em` | 字間を少し開けて可読性向上 |
| スマホ行長 | 15〜21 文字 | 日本語の読みやすい 1 行長 |
| 最小フォントサイズ | `16px`（モバイル） | 14px 以下は可読性が著しく低下 |
| イタリック | **使用禁止** | 日本語フォントでイタリックは判読困難 |
| 強調 | `font-weight` or `color` | イタリックの代わりにウェイトか色で強調 |

---

## 5. スペース・表面・レイアウト

### 5-1. 表面レベル

影ではなく**明度差**で奥行きを表現する（ダーク UI では影が見えないため）。

| レベル | 背景 | ボーダー | 用途 |
| --- | --- | --- | --- |
| Ground | `mystery-950` | — | ページ背景 |
| Surface | `mystery-800` | `mystery-600` 1px | カード・パネル |
| Raised | `mystery-700` | `mystery-600` 1px | ホバー・強調 |
| Light | `paper-50` | — | タイプヒーローのみ |

### 5-2. 角丸

統一感のために 2 サイズに絞る。

| 要素 | 値 | 用途 |
| --- | --- | --- |
| カード・パネル | `rounded-xl`（16px） | メインの囲み |
| ボタン・入力 | `rounded-lg`（12px） | インタラクティブ要素 |
| バッジ・チップ | `rounded-full` | 小さな装飾 |

### 5-3. ページ背景

テクスチャレス。微かなラジアルグロウで光源を暗示するだけ。

```css
body {
  background:
    radial-gradient(ellipse at 20% 10%, rgba(193, 155, 46, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 90%, rgba(61, 104, 152, 0.03) 0%, transparent 50%),
    var(--color-mystery-950);
}
```

> ノイズテクスチャ（SVG `feTurbulence`）は廃止。パフォーマンスを食う割に効果が薄い。

### 5-4. コンテンツ幅

| コンテキスト | 最大幅 | 理由 |
| --- | --- | --- |
| 本文コンテンツ | `max-w-2xl`（672px） | 日本語 20 文字前後で折り返し |
| カードグリッド | `max-w-4xl`（896px） | 4 列まで |
| ヒーロー | `max-w-5xl`（1024px） | 2 カラム時に余裕を持たせる |
| 全幅 | 制限なし | ヘッダー・フッターのみ |

すべて `mx-auto px-5` で中央配置。`px-5`（20px）はスマホでのサイドマージン最適値。

---

## 6. モバイルファースト・インタラクション設計

これが本デザインの核。すべてスマホ片手操作を前提に設計する。

### 6-1. サムゾーン設計

```
┌──────────────────────┐
│                      │  ← 到達困難ゾーン
│   情報表示エリア       │     ここには読むだけの要素を置く
│   （タイトル、説明）    │     （見出し、進捗、説明テキスト）
│                      │
├──────────────────────┤
│                      │  ← 快適ゾーン（画面下 60%）
│   操作エリア           │     タップ可能な要素はすべてここ
│   （ボタン、選択肢）    │     （回答ボタン、ナビ、CTA）
│                      │
│  ┌────────────────┐  │
│  │  Primary CTA    │  │  ← 最重要アクションは最下部
│  └────────────────┘  │
└──────────────────────┘
```

### 6-2. タッチターゲット

| 要素 | 最小サイズ | 推奨サイズ | 間隔 |
| --- | --- | --- | --- |
| ボタン | 48×48px | 52×52px | 8px 以上 |
| 回答ボタン（5 段階） | 48×48px | 52×52px | 8px |
| テキスト入力 | 高さ 52px | — | — |
| リンクテキスト | タップ領域 48px 確保 | — | — |

### 6-3. 診断フローの操作設計

診断は**縦スクロール形式**を維持する（1 ページ 8 問）。
ただし、操作のしやすさを徹底的に改善する。

**5 段階スケール（横並び）**:

```
そう思わない  ①  ②  ③  ④  ⑤  そう思う

  gold ←─────── neutral ──────→ paper
  (warm)                        (cool)
```

- 各ボタン: `w-12 h-12`（48px）以上、`rounded-full`
- ボタン内に数字を表示（1〜5）
- 選択時: `scale-110` + グロウ出現 + 色塗り
- 未選択時: ボーダーのみのゴースト表示
- 端点ラベル: ボタン列の上に配置（`text-xs text-muted`）
- `touch-action: manipulation` で 300ms タップ遅延を除去

**色のグラデーション（方向を示す、良し悪しではない）**:

| 値 | 未選択 | 選択時 |
| --- | --- | --- |
| 1 | `border-gold-400/60` | `bg-gold-400 text-mystery-800` + glow |
| 2 | `border-gold-300/40` | `bg-gold-300 text-mystery-800` |
| 3 | `border-mystery-500` | `bg-mystery-500 text-paper-50` |
| 4 | `border-paper-200/40` | `bg-paper-200 text-mystery-800` |
| 5 | `border-paper-300/60` | `bg-paper-300 text-mystery-800` + glow |

**ナビゲーション**:
- 「次のページへ」ボタンは**画面下部に固定**（`sticky bottom-0`）
- 「前のページへ」はボタン上のゴーストリンク
- 全問回答するまでボタンは `disabled`
- 未回答の質問にはパルスアニメーションでガイド

### 6-4. プログレスバー

```
┌──────────────────────────────────┐
│ Page 1 / 4       謎解きタイプ診断  │
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░ │
└──────────────────────────────────┘
```

- `sticky top-0 z-40`
- `mystery-950/90 backdrop-blur-md`
- バートラック: `h-1 bg-mystery-700 rounded-full`
- バーフィル: `bg-gradient-to-r from-gold-400 to-gold-300`
- `transition-all duration-500 ease-out`

---

## 7. 共通 UI パーツ

### 7-1. ボタン

**Primary（CTA）**:
```
inline-flex items-center justify-center gap-2
min-h-[52px] rounded-lg px-8 py-3
bg-[#e65a3a] text-white font-bold text-base
shadow-sm
hover:bg-rust-400 hover:-translate-y-0.5 hover:shadow-md
active:translate-y-0 active:scale-[0.98]
transition-all duration-150
```

**Secondary（副次）**:
```
inline-flex items-center justify-center gap-2
min-h-[52px] rounded-lg px-8 py-3
border border-clue-400 text-clue-400 font-bold text-base
hover:bg-clue-400/10 hover:-translate-y-0.5
active:translate-y-0
transition-all duration-150
```

**Ghost（テキストリンク風）**:
```
text-clue-400 text-sm font-medium
hover:text-clue-400/80 hover:underline underline-offset-4
transition-colors duration-150
```

**全ボタン共通**:
- タッチターゲット 48×48px 以上
- `focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-mystery-950`
- `disabled:opacity-40 disabled:pointer-events-none`

### 7-2. カード

**基本カード**:
```
rounded-xl border border-mystery-600 bg-mystery-800 p-5
hover:bg-mystery-700 hover:-translate-y-0.5
transition-all duration-200
```

**タイプカード（一覧用）**:
```
rounded-xl border border-mystery-600 bg-mystery-800 p-4
flex flex-col items-center gap-2 text-center
hover:bg-mystery-700 hover:border-gold-400/30 hover:-translate-y-1
transition-all duration-200
```

### 7-3. セクション構成

すべてのコンテンツセクションで統一する構造:

```tsx
<section className="space-y-4">
  <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-gold-400">
    {eyebrow}  {/* 例: "STRENGTHS" */}
  </p>
  <h2 className="font-serif text-xl leading-tight text-paper-50">
    {title}    {/* 例: "強み" */}
  </h2>
  <div>{content}</div>
</section>
```

セクション間の余白: `gap-12`（48px）以上。

### 7-4. リスト

ダッシュマーカーで統一:

```tsx
<ul className="space-y-3">
  <li className="flex gap-3 leading-relaxed">
    <span className="text-gold-400 shrink-0 mt-1">─</span>
    <span>{item}</span>
  </li>
</ul>
```

---

## 8. 画面別デザイン

### 8-1. トップページ

#### 全体構成

```
┌─ ヒーロー（全画面）───────────────┐
│  キャッチコピー                    │
│  診断スタートフォーム               │
├─ フィーチャードタイプ ──────────────┤
│  ピックアップタイプカード            │
├─ 4 軸プレビュー ────────────────┤
│  軸カード ×4                     │
├─ タイプギャラリー ──────────────┤
│  16 タイプグリッド                 │
├─ フッター ──────────────────────┤
└──────────────────────────────────┘
```

#### ヒーロー

全画面（`min-h-svh`）、中央揃え、ダーク背景。

```
┌──────────────────────────┐
│                          │
│  NAZOTOKI TYPE           │  ← eyebrow (mono, gold, xs)
│  DIAGNOSIS               │
│                          │
│  謎解き                   │  ← h1 (hero size, bold)
│  タイプ診断               │     グラデーション文字
│                          │
│  あなたはチームの何者か。   │  ← sub (paper-200, sm)
│  4軸16タイプで、           │
│  あなたの謎解きの役割が     │
│  明らかになる。            │
│                          │
│  ┌────────────────────┐  │
│  │ ニックネーム（任意）   │  │  ← input
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │   診断スタート →     │  │  ← primary CTA
│  └────────────────────┘  │
│  32問 ・ 約5分             │  ← stats (mono, xs, muted)
│                          │
└──────────────────────────┘
```

- ヒーロー見出し: `font-serif`, hero サイズ, `bg-gradient-to-br from-gold-300 via-gold-400 to-paper-200 bg-clip-text text-transparent`
- 入力 + CTA はヒーロー内に配置（別セクションに分けない → 1 画面で完結）
- スクロールインジケーター: 下部に控えめに配置

#### フィーチャードタイプ

ランダムまたは固定で 1〜3 タイプをピックアップ。

```
┌──────┐  ┌──────┐  ┌──────┐
│ Art  │  │ Art  │  │ Art  │
│ DLHN │  │ ALHN │  │ DBHN │
│ 鑑識  │  │ 突撃  │  │ 伏線  │
│ マニア │  │ 隊長  │  │ 回収  │
└──────┘  └──────┘  └──────┘
```

- `grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4`
- 各カード: タイプカードスタイル

#### 4 軸プレビュー

```
┌─ AXIS 01 ──────────────┐
│ 行動型 ←──────→ 解読型   │
│ 自ら動いて    手元の材料  │
│ 情報を取る    から読む    │
└─────────────────────────┘
```

- `grid md:grid-cols-2 gap-4`
- 各カード上辺に軸固有色の 2px ライン（§10 の色ペア参照）

#### タイプギャラリー

- `grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3`
- 各カード: サムネイル + コード + タイプ名
- リンク: `/types/{typeCode}` へ

#### フッター

- `mystery-950` 背景, `py-8`, `text-xs text-muted text-center`

---

### 8-2. 診断フロー

#### 全体構成

```
┌─ プログレスバー（sticky top）──────┐
├─ ページヘッダー ──────────────────┤
│  ページ番号 + ガイド               │
├─ 質問リスト ──────────────────────┤
│  Q.01 ─ [① ② ③ ④ ⑤]           │
│  Q.02 ─ [① ② ③ ④ ⑤]           │
│  ... × 8問                      │
├─ ナビ（sticky bottom）────────────┤
│  ← 前へ       [次のページへ →]     │
└──────────────────────────────────┘
```

#### 質問カード

```
┌──────────────────────────────────┐
│ Q.01                             │  mystery-800, rounded-xl, p-5
│                                  │
│ 友だちとの予定は、自分から          │
│ 提案することが多い。               │
│                                  │
│  そう思わない        そう思う       │  ← 端点ラベル（上段）
│     ①  ②  ③  ④  ⑤              │  ← 5 段階ボタン（下段）
│                                  │
└──────────────────────────────────┘
```

- 質問番号: `font-mono text-xs text-gold-400 font-bold`
- 質問文: `text-base leading-relaxed`
- カード間: `gap-4`

#### ナビゲーションバー（sticky bottom）

```
┌──────────────────────────────────┐
│  ← 前のページへ                    │  ← ghost link（page 1 では非表示）
│  ┌────────────────────────────┐  │
│  │      次のページへ →          │  │  ← primary, 全幅
│  └────────────────────────────┘  │
│  すべての質問に答えてください        │  ← 未回答時（text-sm, rust）
└──────────────────────────────────┘
```

- `sticky bottom-0 z-30`
- `bg-mystery-950/90 backdrop-blur-md`
- `safe-area-inset-bottom` でノッチ対応: `pb-[env(safe-area-inset-bottom,12px)]`
- 最終ページ: ラベルを「診断結果を見る」に変更

---

### 8-3. タイプ詳細ページ（公開）

URL: `/types/[typeCode]`

#### 全体構成

```
┌─ ヘッダーバー ──────────────────┐
├─ タイプヒーロー（明面）──────────┤
│  アートワーク + タイプ情報         │
├──────── ここから暗面 ───────────┤
├─ 強み ─────────────────────────┤
├─ 注意点 ───────────────────────┤
├─ 詳しい見立て ─────────────────┤
├─ 担いやすい役割 ────────────────┤
├─ 相性 ─────────────────────────┤
├─ 末尾 CTA ─────────────────────┤
├─ フッター ─────────────────────┤
└──────────────────────────────────┘
```

#### タイプヒーロー（明面）

唯一の明るい背景（`paper-50`）。タイプの「顔」を大きく見せる。

**モバイル**:

```
┌──────────────────────────┐  paper-50
│                          │
│  Public File             │  ← eyebrow
│  #DLHN                   │  ← code (mono, gold-500)
│                          │
│  ┌──────────────────┐    │
│  │                  │    │
│  │    [Artwork]     │    │  ← max-w-[260px]
│  │                  │    │     rounded-xl, shadow-md
│  └──────────────────┘    │
│                          │
│  鑑識マニア               │  ← type name (serif, h1)
│                          │
│  「現場に残った痕跡を       │  ← tagline (gold-500)
│    すべて拾い上げる」       │
│                          │
│  サマリテキスト。           │  ← summary (text-sm, muted)
│                          │
│  ┌────────────────────┐  │
│  │   自分でも診断する →  │  │  ← primary CTA
│  └────────────────────┘  │
│                          │
└──────────────────────────┘
```

**デスクトップ（md 以上）**: 左 40% アートワーク、右 60% テキスト。

#### 暗面セクション

ヒーロー以降はダーク（`mystery-950`）。明面→暗面はハードカット（グラデーションなし）。

- **強み / 注意点**: `grid md:grid-cols-2 gap-6`、各カード `mystery-800 rounded-xl p-6`
- **詳しい見立て**: `font-serif leading-loose`（Noto Serif JP で格調ある文章）
- **担いやすい役割**: チップ形式 `rounded-full px-4 py-2 border border-mystery-600 bg-mystery-700`
- **相性**: タイプカードグリッド、リンク付き

#### 公開ページで表示しないもの

- Type Signature セクション（共有結果ページ専用）
- 共有パネル（共有結果ページ専用）

---

### 8-4. 共有結果ページ

URL: `/types/[typeCode]/[key]`（Netlify 200 rewrite で CSR）

§8-3 をベースに以下を差分適用。

#### ヒーローの差分

| 項目 | 公開ページ | 共有結果ページ |
| --- | --- | --- |
| eyebrow | `"Public File"` | `"Shared Result"` |
| 見出し | タイプ名のみ | `"[ユーザー名]さんの診断結果"` |

#### 追加: Type Signature（スクショ映え 1 枚絵）

ヒーロー直後に挿入。**SNS シェア時にスクリーンショットされる想定の 1 枚ビジュアル**。

```
┌─────────────────────────────────────────┐
│                                         │
│  鑑識マニア              謎解きタイプ診断  │
│                                         │
│              D  L  H  N                 │
│                                         │
│  ── Axis 01 ════════════════ 72% ──    │
│  ── Axis 02 ════════════════ 45% ──    │
│  ── Axis 03 ════════════════ 83% ──    │
│  ── Axis 04 ════════════════ 61% ──    │
│                                         │
└─────────────────────────────────────────┘
```

設計:
- アスペクト比: `4 / 5`（Instagram / X で映える縦長）
- `mystery-800 rounded-xl overflow-hidden`
- 背景: ダークグラデーション + 微かなラジアルグロウ
- タイプ名: `font-serif` 大きく左上
- タイプコード: 中央に `font-mono` で大きく
- 4 軸バー: §10 の色ペアでグラデーション
- 右上: サイト名キャプション（`font-mono text-xs text-muted`）

#### 追加: 共有パネル

```
┌─ Share ──────────────────────────┐
│ 結果を共有する                     │
│                                  │
│ [X で共有]  [LINE で共有]          │  ← secondary buttons
│ [URL をコピー]                    │
└──────────────────────────────────┘
```

- 「URL をコピー」: クリック後 `"コピーしました"` に 1.5 秒間変化

#### エラー状態（無効な共有キー）

- 画面中央に `min-h-[60vh] flex items-center justify-center`
- `mystery-800 rounded-xl p-8 text-center`
- 鍵アイコン + 「リンクが無効です」+ CTA

---

## 9. ヘッダーバー

全ページ共通。

```
┌──────────────────────────────────┐
│ 🔑 謎解きタイプ診断      タイプ一覧 │
└──────────────────────────────────┘
```

- `sticky top-0 z-50`
- `mystery-950/90 backdrop-blur-md`
- `border-b border-mystery-600`
- 高さ: 56px
- 左: ロゴ（`font-bold text-gold-400`）
- 右: ナビリンク（`text-sm`、ghost スタイル）
- `max-w-5xl mx-auto px-5`

---

## 10. 4 軸メトリクスの配色

各軸に固有の色ペアを割り当てる。

| 軸 | 左方向色 | 右方向色 | 意図 |
| --- | --- | --- | --- |
| 行動型 ↔ 解読型 | `#e65a3a`（rust 系） | `#3d6898`（clue 系） | 動く ↔ 読む |
| 局所型 ↔ 俯瞰型 | `#c19b2e`（gold 系） | `#7b8fff`（indigo） | 集中 ↔ 俯瞰 |
| 発信型 ↔ 統率型 | `#e8c96a`（gold 明） | `#6bc9a0`（green） | 発散 ↔ 収束 |
| 熟考型 ↔ 転換型 | `#c89bef`（purple） | `#5dd8e6`（cyan） | 深める ↔ 切替 |

バー: `h-2 rounded-full`、色ペアの `linear-gradient`。`transition-all duration-500`。

---

## 11. モーション

### 11-1. アニメーション定義

| 名前 | 内容 | 用途 |
| --- | --- | --- |
| `fadeUp` | `opacity 0→1` + `translateY 20px→0`, 400ms | セクション出現 |
| `scaleIn` | `scale 0.95→1` + `opacity 0→1`, 200ms | 選択フィードバック |
| `fillBar` | `width 0→target`, 600ms, `ease-out` | プログレスバー |
| `pulse` | `opacity 0.5→1→0.5`, 1.5s, infinite | ローディング |

### 11-2. ルール

| ルール | 値 |
| --- | --- |
| アニメーション対象プロパティ | `transform` と `opacity` のみ（GPU 最適化） |
| マイクロインタラクション | 100〜200ms |
| UI トランジション | 200〜400ms |
| リビール | 400〜600ms |
| スタガー間隔 | 50ms 刻み |
| イージング | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` を基本 |
| `prefers-reduced-motion: reduce` | すべて `duration: 0ms` に |

### 11-3. 結果画面のリビールシーケンス

診断完了直後の結果表示は演出を入れる:

1. タイプ名 + コード → フェードイン（0ms）
2. アートワーク → スケールイン（200ms）
3. タグライン → フェードアップ（400ms）
4. Type Signature の 4 軸バー → 左から充填（600ms、各バー 100ms スタガー）

合計約 1.5 秒。短く、キレのある演出。

---

## 12. レスポンシブ

| ブレークポイント | 値 | 主な変化 |
| --- | --- | --- |
| デフォルト | 0px〜 | 1 カラム、すべて縦積み |
| `sm` | 520px | ギャラリー 3 列化 |
| `md` | 768px | ヒーロー 2 カラム、強み/注意点横並び |
| `lg` | 1024px | コンテンツ最大幅制約 |

- **モバイルファースト**: すべて 1 カラムから設計し、`md:` 以上で展開
- 診断フローは**常に 1 カラム**（デスクトップでも）
- タイプギャラリーは `auto-fill` で自動調整

---

## 13. アクセシビリティ

| 項目 | 対応 |
| --- | --- |
| スキップリンク | `skip-link` をページ先頭に配置 |
| フォーカスリング | `focus-visible` で `gold-400` リング 2px, offset 2px |
| テキストコントラスト | WCAG AA（4.5:1）以上 |
| タッチターゲット | 48×48px 以上（WCAG 2.5.8） |
| モーション | `prefers-reduced-motion: reduce` で即時完了 |
| セマンティクス | 適切な heading 階層、`role`、`aria-label` |
| 画像 | すべての `<img>` に `alt` を設定 |

---

## 14. パフォーマンス目標

| 指標 | 目標 | 対策 |
| --- | --- | --- |
| LCP | < 2.5s | ヒーロー画像を `priority` で読み込み |
| INP | < 200ms | 回答ボタンは即座に視覚フィードバック |
| CLS | < 0.1 | 画像に `width`/`height` を必ず指定 |
| フォント | FOUT 最小化 | `font-display: swap` + サブセット |

### 画像最適化

| 種類 | パス | サイズ |
| --- | --- | --- |
| 通常画像 | `public/types/{typeCode}.png` | 512×512 |
| チビ画像 | `public/types/{typeCode}_chibi.png` | 200×200 |
| OGP 画像 | `public/types/{typeCode}-ogp.png` | 1200×630 |

- 画像未配置時はプレースホルダー（グラデーション + コードバッジ）
- `next/image` で WebP 自動変換（static export では `unoptimized` のため、ビルド前に手動最適化）

---

## 15. スタイリング方針

### 15-1. 優先順位

```
Tailwind ユーティリティ（JSX 内）  ← 大多数のスタイルはここ
      ↓ 足りないときだけ
CSS Module（*.module.css）        ← 複雑なグロウ・アニメーション
      ↓ 全体共通のみ
globals.css                       ← トークン定義・ベーススタイル
```

### 15-2. `@theme` でトークン登録

Tailwind CSS v4 の `@theme` ディレクティブで全トークンを登録。JSX 側は Tailwind クラスで参照。

### 15-3. CSS Module の使いどころ

| 用途 | 理由 |
| --- | --- |
| ラジアルグロウ背景 | 複数 `radial-gradient` の重ね合わせ |
| `@keyframes` 適用 | アニメーション定義の参照 |
| 1 要素に 15 クラス以上 | 可読性のため |

CSS Module 内でもトークン変数で色を参照。値の直書き禁止。

### 15-4. やらないこと

| パターン | 理由 |
| --- | --- |
| `::before`/`::after` の装飾線 | クリーンに保つ。旧テーマの残滓 |
| 背景にグリッド/ノイズテクスチャ | テクスチャレスで統一。パフォーマンス |
| 色やサイズを CSS に直書き | Tailwind トークンで一元管理 |
| `@apply` でユーティリティをまとめる | コンポーネント化で対処 |
| イタリック体 | 日本語で判読困難 |

---

## 16. コンポーネント一覧

### ホーム

| コンポーネント | 役割 |
| --- | --- |
| `HomeHeroSection` | ヒーロー（キャッチ + フォーム + CTA） |
| `FeaturedTypesSection` | ピックアップタイプカード |
| `AxisPreviewSection` | 4 軸プレビューカード |
| `AllTypesSection` | 16 タイプギャラリーグリッド |

### 診断

| コンポーネント | 役割 |
| --- | --- |
| `DiagnosisProgress` | sticky プログレスヘッダー |
| `DiagnosisFlow` | 診断 UI 全体（ページ管理） |
| `QuestionCard` | 質問テキスト + 5 段階スケール |
| `FivePointScale` | 5 段階回答ボタン群 |

### タイプ詳細

| コンポーネント | 役割 |
| --- | --- |
| `TypeDetailHeroSection` | 明面ヒーロー |
| `TypeSignatureSection` | 4 軸ビジュアルボード（共有のみ） |
| `TypeListSection` | 強み / 注意点 / 役割 |
| `TypeOverviewSection` | 詳しい見立て |
| `TypeCompatibilitySection` | 相性タイプグリッド |
| `TypeSharePanel` | 共有パネル（共有のみ） |
| `TypeArtwork` | 画像 or プレースホルダー |

---

## 17. 対象外

以下は本書のスコープ外。

- 専用 `/types` 一覧ページ（トップページ内ギャラリーで代替）
- 動的 OGP 生成（`next/og`）— static export の制約
- framer-motion 等の motion ライブラリ依存 — CSS アニメーションで対応
- サーバーサイド API / Edge Function
- ダークモード / ライトモード切替（常時ダーク）
- i18n / 多言語対応
