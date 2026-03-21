# @repo/ui — AGENTS.md

このパッケージは **共有 UI コンポーネント** と **Storybook** を提供します。React + TailwindCSS で実装され、`apps/web` と `apps/mobile` から利用されます。

## 役割

- 再利用可能な React コンポーネント（Button, Alert, Card, Input など）
- Tailwind ユーティリティ `cn()` によるクラス結合
- グローバル CSS（`styles/globals.css`）とビルド済み `styles.css` の提供
- Storybook によるコンポーネントドキュメント・開発

## ディレクトリ構成

```
src/
├── components/     # コンポーネント（各コンポーネントは xxx.tsx, xxx.stories.tsx, index.ts）
├── utils/          # cn などユーティリティ
├── styles/         # globals.css
└── index.ts        # 公開 API
.storybook/         # Storybook 設定
```

## ルール・慣習

- **スタイル**: TailwindCSS を使用。`@repo/tailwind-config` を参照する。クラスは `cn()` で結合する。
- **カラー**: hex の直書き（`style={{ color: "#..." }}`）は禁止。必ず Tailwind トークンを使う。主要色は `primary-*`（オレンジ）、アクセントは `accent-*`（シアン）、装飾グラデーションは `bg-gradient-brand` / `bg-gradient-brand-br`。詳細は `.cursor/rules/brand-colors.mdc` を参照。
- **コンポーネント**: `forwardRef` を使い、`displayName` を設定する。Props は `HTMLAttributes` を拡張し、`className` を継承する。
- **バリアント**: 見た目のバリエーションは `variant` プロップで渡し、オブジェクトでスタイルを切り替える（例: Alert の `info` / `success` / `warning` / `error`）。
- **ダークモード**: `dark:` プレフィックスで対応する。
- **Storybook**: 各コンポーネントに `*.stories.tsx` を用意する。`mise run storybook` で起動。

## このパッケージを編集するとき

- 新規コンポーネントは `src/components/<name>/` に `*.tsx`, `*.stories.tsx`, `index.ts` を追加し、`src/components/index.ts` と `src/index.ts` から re-export する。
- スタイル変更は Tailwind クラスで行い、デザイントークンは可能な限り `@repo/tailwind-config` のトークンを使う。
- ビルドは `tsup` + `tsc`（型宣言）+ `build:css`（Tailwind）の順で実行される。
