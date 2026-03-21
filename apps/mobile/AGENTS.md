# @repo/mobile — AGENTS.md

このパッケージは **モバイル（ネイティブシェル）向けフロント** です。React + Vite の上に Ionic React と Capacitor を載せ、ルーティングは `react-router-dom` v5 と `@ionic/react-router` を使います。`@repo/ui`・`@repo/spec`（生成クライアント・`setAuthToken`）を共有します。

## 役割

- タスク一覧・設定・ログイン画面
- Google 等の OAuth（ネイティブではアプリ内ブラウザ＋ディープリンクでトークン受け取り）
- セッション・トークンと `@repo/spec` の fetcher の同期

## ディレクトリ構成

```
src/
├── App.tsx             # IonApp / IonReactRouter、DeepLinkHandler、認証に応じたタブ or ログイン
├── main.tsx
├── pages/              # Login, Tasks, Settings
├── hooks/
│   ├── use-auth.ts
│   └── use-auth-session.ts
├── lib/
│   ├── auth-client.ts
│   └── token-storage.ts  # Capacitor Preferences 等
└── styles/
capacitor.config.ts
vite.config.ts
```

## ルール・慣習

- **認証 UI フロー**: セッション確認中はスピナー。未認証は `LoginPage` のみ。認証済みは `/tasks`・`/settings` のタブ（キャッチオールリダイレクトを避け、`AppContent` 内でパスを正規化する）。詳細は `App.tsx` のコメント参照。
- **ディープリンク**: ネイティブで `CapacitorApp.addListener("appUrlOpen", ...)`。カスタムスキーム（例: `monorepoapp://auth/callback?token=...`）でトークンを受け取り、`saveToken` と `setAuthToken` の後に `Browser.close` とフルリロードで状態を揃える。
- **API**: `@repo/spec` の生成クライアントと TanStack Query。ベース URL・認証ヘッダーは fetcher 側（`setAuthToken`）と揃える。
- **UI**: `@repo/ui` と Ionic コンポーネントを併用。スタイルは Tailwind（`@repo/tailwind-config`）。

## このパッケージを編集するとき

- 新規画面は `pages/` に追加し、`App.tsx` のルート・タブに組み込む。
- Web（`apps/web`）と API 契約を共有する変更は、先に `@repo/spec` を更新して generate する。
- Capacitor の同期: `pnpm --filter @repo/mobile cap:sync`（プラットフォーム追加後など）。
- ローカル: `pnpm --filter @repo/mobile dev` またはモノレポの `dev` タスクに従う。
