# @repo/api — AGENTS.md

このパッケージは **HTTP API** です。Hono で実装され、OpenAPI（`@repo/spec` 生成）から Orval で Hono ルートと Zod スキーマを生成します。Node（`@hono/node-server`）と Cloudflare Workers（`worker.ts`）の両方から同じ `app` をマウントできます。

## 役割

- REST 風エンドポイント（例: タスク CRUD、ヘルスチェック）
- better-auth 連携（`/api/auth/*`、モバイル用 OAuth 補助ルート）
- `@repo/infrastructure` 経由の DB・認証初期化
- 生成ルート（`src/generated/routes.ts`）と手書きハンドラ（`src/handlers/*.ts`）の結合

## ディレクトリ構成

```
src/
├── app.ts              # Hono アプリ本体（ミドルウェア・生成ルートマウント・Better Auth）
├── index.ts            # Node エントリ（serve）
├── worker.ts           # Workers エントリ（app.fetch を export）
├── lib/
│   └── trusted-origins.ts
├── middleware/
│   └── app-cors.ts
├── types/
│   └── app-env.ts      # Hono の Variables / Bindings 型
├── handlers/           # Orval が参照するハンドラ実装（手書き）
└── generated/          # Orval 生成（手で編集しない）
    ├── routes.ts       # ルート定義の合成
    ├── endpoints/
    └── schemas/
orval.config.ts         # 入力: packages/spec/generated/openapi.yaml
wrangler.toml           # Workers・アセット（web dist）・Hyperdrive 等
```

## ルール・慣習

- **生成コード**: `src/generated/` は手編集しない。OpenAPI を変えたあと Orval で再生成する。
- **仕様の源泉**: API の契約は `@repo/spec`（TypeSpec）→ OpenAPI。変更は必ず spec 側から行い、ルート全体は `mise run generate`（`pnpm turbo run generate`）で spec クライアント等と揃える。API 専用の Orval は `pnpm --filter @repo/api generate`。
- **ミドルウェア**: `/api/auth/*` と `/api/tasks/*` に DB・auth 初期化（`dbAuthMiddleware`）。`/api/tasks/*` には続けてセッション（`sessionMiddleware`）で `user` / `session` をセット。新しい認証必須プレフィックスを足す場合は `app.ts` で同様にマウントする。
- **ルート順**: 生成ルートを先にマウントし、続けて Better Auth の `/api/auth/*` フォールバックを登録する（`app.ts` のコメント参照）。
- **環境変数**: Node では `process.env`、Workers では `c.env`。DB は `HYPERDRIVE.connectionString` または `DATABASE_URL`。OAuth・セッションは `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` など（未設定時の挙動は `app.ts` を参照）。
- **Workers**: [`wrangler.toml`](wrangler.toml) で `main = src/worker.ts`、必要に応じて Hyperdrive バインディングを設定する。

## このパッケージを編集するとき

- 新規エンドポイント: `@repo/spec` の TypeSpec を更新 → `mise run generate` → `pnpm --filter @repo/api generate` → `src/handlers/` に実装を追加（Orval がスタブを期待する形に合わせる）。
- ハンドラは生成スキーマ（Zod）で入力を検証し、`@repo/core` / `@repo/infrastructure` を通じてドメイン処理する。
- ローカル開発: `mise run dev:api` または `pnpm --filter @repo/api dev`（既定ポート 3000、`PORT` で変更）。
