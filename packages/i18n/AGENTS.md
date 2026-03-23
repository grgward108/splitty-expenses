# @repo/i18n — AGENTS.md

共有の **多言語リソース** と **i18next / react-i18next** の初期化を提供します。`apps/web`・`apps/mobile`・`apps/hp` から `@repo/i18n` を参照します。

## 役割

- `src/locales/ja|en/*.json` … namespace ごとの翻訳（`common`, `auth`, `tasks`, `settings`, `landing`）
- `initI18n()` … アプリ起動時に 1 回 await してから React をマウントする
- `getLocaleForDate()` … `toLocaleDateString` 用の BCP47 ロケール（`ja-JP` / `en-US`）

## ルール・慣習

- **文言追加**: まず `ja` と `en` の同じキー構造で JSON を更新する。型補完は `src/types.ts` の `i18next` モジュール拡張に依存する。
- **namespace**: 画面領域に合わせて分ける（例: タスク画面は `tasks`）。
- **HP**: `initI18n({ defaultNS: "landing" })` でデフォルト namespace を landing にする。
- **言語保持**: `i18next-browser-languagedetector` が `localStorage` と `navigator` を使用する。

## このパッケージを編集するとき

- ビルド: `pnpm --filter @repo/i18n build`（`tsup` + `tsc --emitDeclarationOnly`）
- 翻訳キー変更後は依存アプリの `t("...")` を追従させる
