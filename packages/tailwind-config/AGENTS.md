# @repo/tailwind-config — AGENTS.md

このパッケージは **共有 Tailwind CSS 設定** を提供します。テーマ（色・フォント・スペーシング・シャドウ・アニメーションなど）を一元管理し、`packages/ui` や各 app で利用します。

## 役割

- Tailwind の `theme.extend` の共通定義（色 primary/accent/secondary/success/warning/danger、フォント、spacing、borderRadius、boxShadow、animation/keyframes）
- デザイントークン（`tokens.js`）に基づくカラーパレットの生成
- `base.css` と `postcss.config.js` の提供（必要に応じて他パッケージから参照）

## ブランドカラー

| 用途 | トークン | Hex |
|------|----------|-----|
| 背景 | `brand.background` / `brand-background` | #F7FAFF |
| メイン | `primary-500`（オレンジ） | #F7AB00 |
| アクセント | `accent-500`（シアン） | #00E5FF |
| テキスト | `brand.text` / `secondary-900` | #0B1026 |
| グラデーション | `bg-gradient-brand` / `bg-gradient-brand-br` | #F7AB00 → #00E5FF |

- `primary`（50–950）: メインのインタラクティブ色（ボタン・リンク・フォーカスリング）
- `accent`（50–950）: アクセント補助色（バッジ・ハイライト・装飾）
- `secondary`（50–950）: ニュートラル（本文テキスト・ボーダー・ミュート背景）
- グラデーション: ヒーロー・CTA・ローディング等の装飾に `bg-gradient-brand` / `bg-gradient-brand-br` を使う

## ファイル構成

```
index.js          # Tailwind の config を export（theme 拡張）
tokens.js         # 色などのトークン定義（hex 付きパレット）
base.css          # ベーススタイル（必要なら）
postcss.config.js # PostCSS 設定
```

## ルール・慣習

- **形式**: ESM（`export default`）で Tailwind の設定オブジェクトを export。`tokens.js` から `brand` と `colors` を読み、`toHexPalette` で hex に正規化して `theme.extend.colors` に渡す。
- **ダークモード**: `darkMode: "class"` を想定。色は `theme.extend.colors` で定義し、コンポーネント側で `dark:` を使う。
- **content**: このパッケージでは `content: []`。実際の content パスは利用側（ui や app）の `tailwind.config.js` で指定する。
- **変更時**: トークンや theme を変更したら、`@repo/ui` およびこの設定を参照している app のビルド・表示を確認する。

## このパッケージを編集するとき

- 色の追加・変更は `tokens.js` を編集し、`index.js` の `theme.extend.colors` に必要なパレットを追加する。
- フォント・スペーシング・シャドウ・アニメーションは `index.js` の `theme.extend` を直接編集する。
- 新しいトークンファイルを作る場合は、`index.js` から import して theme にマッピングする。
