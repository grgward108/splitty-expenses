# @repo/web — AGENTS.md

このパッケージは **Web フロントエンドアプリ** です。React + Vite + TanStack Router で実装され、`@repo/ui` のコンポーネントと `@repo/spec` の API クライアントを利用します。

## 役割

- 認証（better-auth クライアント、Google サインイン）
- 認証必須ページ（タスク一覧・設定）と認証不要ページ（ログイン）のルーティング
- タスクの CRUD UI とユーザー設定画面

## ディレクトリ構成

```
src/
├── lib/
│   └── auth-client.ts    # better-auth クライアント
├── contexts/
│   └── theme.tsx         # ナイトモード（ThemeProvider / useTheme）
├── routes/               # TanStack Router ファイルベースルーティング
│   ├── __root.tsx        # ルートレイアウト（ヘッダー・認証表示）
│   ├── _auth/            # 認証必須レイアウト（パスに影響しない）
│   │   ├── route.tsx     # beforeLoad で認証チェック + Outlet
│   │   ├── index/
│   │   │   ├── route.tsx      # "/" タスク一覧
│   │   │   └── route.model.ts # タスクの型・定数
│   │   └── settings/
│   │       ├── route.tsx      # "/settings" 設定
│   │       └── route.model.ts # 設定フォームの型
│   └── login/
│       └── route.tsx     # "/login" ログイン（認証不要）
├── styles/
│   └── globals.css
├── main.tsx
└── routeTree.gen.ts      # 自動生成（編集しない）
```

## ルール・慣習

- **ルート構成**: 認証必須は `_auth/` 配下に置く。`_auth` はパスレスレイアウトなので URL は `/`, `/settings` のようになる。
- **ファイル命名**: 各ルートは `route.tsx` で定義する。ロジック・型は同階層の `route.model.ts` に分離する（`routeFileIgnorePattern` で `.model.` を含むファイルはルート生成対象外）。
- **認証ガード**: `_auth/route.tsx` の `beforeLoad` で `authClient.getSession()` を実行し、未ログインなら `/login` へリダイレクトする。子ルートでは個別の `beforeLoad` は不要。
- **認証フロー**: ログインは `authClient.signIn.social({ provider: "google", ... })`。ログアウトは `authClient.signOut()` を await し、`fetchOptions.onSuccess` で `window.location.href = "/login"` してフルリロードする。
- **セッション・ユーザー**: `authClient.useSession()` で取得。`session.user.image` に Google のプロフィール画像 URL が入る。
- **ナイトモード**: `contexts/theme.tsx` の `ThemeProvider` で状態を保持し、`localStorage` に保存。設定画面で `useTheme()` から切り替え。
- **UI**: `@repo/ui` のコンポーネントを使用。API は `@repo/spec` の生成クライアントを使用する。

## このパッケージを編集するとき

- 新規「認証必須」ページは `src/routes/_auth/<path>/route.tsx` を追加する。必要なら同階層に `route.model.ts` を置く。
- 認証不要の新規ページは `src/routes/` 直下に `<path>/route.tsx` を追加する（例: `login/route.tsx`）。
- ルート追加・削除後は `routeTree.gen.ts` が Vite ビルド時に自動生成される。手動で編集しない。
- 環境変数 `VITE_API_BASE_URL` で API のベース URL を指定する（未指定時は `http://localhost:3000`）。
