# Cloudflare Workers 移行ガイド

このドキュメントでは、リポジトリの現状と Cloudflare Workers へデプロイするために必要な変更点を説明します。

## アーキテクチャ概要

### 現状 (As-Is)

```
Browser ──→ Vite Dev Server (localhost:5173) ──→ proxy /api/* ──→ Node.js (localhost:3000)
                                                                       │
                                                                  Hono app.ts
                                                                       │
                                                                  postgres (TCP)
                                                                       │
                                                                  Docker PostgreSQL
```

- **Web アプリ**: Vite 開発サーバーで配信される React SPA。本番ホスティングは未設定。
- **API**: `@hono/node-server` (Node.js ランタイム) 上で動作する Hono。本番ホスティングは未設定。
- **データベース**: Docker Compose 経由の PostgreSQL（ローカル開発のみ）。`postgres` npm パッケージ（TCP ソケット）で接続。
- **認証**: Better Auth。モジュールスコープで設定され、import 時に `process.env` を読み取る。
- **IaC**: なし。README に `packages/cdk`（AWS CDK）の記載があるが削除済み。デプロイ先が存在しない。

### 移行後 (To-Be)

```
Browser ──→ Cloudflare Worker
                │
                ├── /*        ──→ 静的アセット (apps/web/dist の SPA)
                │
                └── /api/*    ──→ Hono app.ts
                                      │
                                  Hyperdrive (コネクションプーリング)
                                      │
                                  マネージド PostgreSQL (Neon または Supabase)
```

- **Web アプリ + API**: 単一の Cloudflare Worker から配信。静的 SPA ファイルは Worker アセットとしてバンドル。
- **データベース**: 外部マネージド PostgreSQL（例: Neon、Supabase）。Cloudflare Hyperdrive 経由でコネクションプーリングとキャッシングを実現。
- **認証**: Better Auth の設定は同じだが、モジュールスコープではなくリクエストごとに遅延初期化。
- **IaC**: `wrangler.toml`（Worker 設定）+ GitHub Actions（CI/CD）。

## 変更が必要な箇所

### 1. Workers エントリーポイント（新規）

| ファイル | ステータス |
|------|--------|
| `apps/api/src/worker.ts` | **新規ファイル** |
| `apps/api/wrangler.toml` | **新規ファイル** |
| `apps/api/src/index.ts` | 変更なし（ローカル開発で引き続き使用） |

既存の `index.ts` は Node.js 上で Hono を起動します。新しい `worker.ts` は同じ Hono アプリを Cloudflare Workers ランタイム向けにエクスポートします。どちらのエントリーポイントも同じ `app.ts` を共有します。

```
apps/api/src/
  index.ts    ← Node.js エントリー (ローカル開発: tsx watch)
  worker.ts   ← Workers エントリー (本番: wrangler deploy)
  app.ts      ← 共有 Hono アプリ (ランタイム非依存)
```

### 2. Infrastructure パッケージのリファクタリング（破壊的変更）

根本的な問題: `packages/infrastructure` は `process.env` を使ってデータベースと認証のインスタンスを**モジュールスコープ**で生成しています。Cloudflare Workers には `process.env` がなく、環境バインディングをリクエストコンテキスト経由で渡します。

#### データベース (`packages/infrastructure/src/database/drizzle.ts`)

**現状（モジュールレベルのシングルトン）:**
```typescript
// このモジュールをインポートした瞬間に実行される
const connectionString = process.env.DATABASE_URL;    // ← import 時に環境変数を読み取る
if (!connectionString) throw new Error("...");         // ← 環境変数が未設定ならクラッシュ
const client = postgres(connectionString);             // ← 即座に TCP コネクションを開く
export const db = drizzle(client, { schema });         // ← グローバルな単一インスタンス
```

**移行後（ファクトリ関数）:**
```typescript
// import 時には何も実行されない。呼び出し側がいつ・どの設定で生成するか決める。
const cachedDbByConnectionString = new Map<string, ReturnType<typeof drizzle>>();

export function getDb(connectionString: string) {
  const cachedDb = cachedDbByConnectionString.get(connectionString);
  if (cachedDb) {
    return cachedDb;
  }

  const db = drizzle(postgres(connectionString), { schema });
  cachedDbByConnectionString.set(connectionString, db);
  return db;
}
```

- Node.js（ローカル開発）: `getDb(process.env.DATABASE_URL)`
- Workers（本番）: `getDb(c.env.HYPERDRIVE.connectionString)`

#### 認証 (`packages/infrastructure/src/auth/auth.ts`)

**現状（モジュールレベルのシングルトン）:**
```typescript
import { db } from "../database/drizzle.js";   // ← import 時に db 生成がトリガーされる

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", ... }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",       // ← import 時に環境変数を読み取る
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  trustedOrigins: ["http://localhost:5173", ...],  // ← ハードコード
});
```

**移行後（ファクトリ関数）:**
```typescript
const cachedAuthByDb = new WeakMap<DrizzleDatabase, Map<string, ReturnType<typeof betterAuth>>>();

export function getAuth(config: {
  db: DrizzleDatabase;
  googleClientId: string;
  googleClientSecret: string;
  trustedOrigins: string[];
}) {
  const key = JSON.stringify({
    googleClientId: config.googleClientId,
    googleClientSecret: config.googleClientSecret,
    trustedOrigins: [...config.trustedOrigins].sort(),
  });

  const cache = cachedAuthByDb.get(config.db) ?? new Map();
  cachedAuthByDb.set(config.db, cache);

  if (cache.has(key)) return cache.get(key);

  const auth = betterAuth({
    database: drizzleAdapter(config.db, { provider: "pg", ... }),
    socialProviders: {
      google: {
        clientId: config.googleClientId,
        clientSecret: config.googleClientSecret,
      },
    },
    trustedOrigins: config.trustedOrigins,
  });

  cache.set(key, auth);
  return auth;
}
```

#### リポジトリ (`packages/infrastructure/src/repositories/task-repository.ts`)

**現状:** モジュールレベルのシングルトンから `db` を直接インポート。
```typescript
import { db } from "../database/drizzle.js";

export class DrizzleTaskRepository implements TaskRepository {
  async findById(userId: string, id: TaskId) {
    const [row] = await db.select()...   // ← グローバルな db を使用
  }
}
```

**移行後:** コンストラクタ経由で `db` を受け取る（依存性の注入）。
```typescript
export class DrizzleTaskRepository implements TaskRepository {
  constructor(private db: DrizzleDatabase) {}

  async findById(userId: string, id: TaskId) {
    const [row] = await this.db.select()...   // ← 注入された db を使用
  }
}
```

### 3. App ミドルウェア（変更）

`apps/api/src/app.ts` は現在トップレベルで `auth` をインポートし、CORS オリジンをハードコードしています。以下の変更が必要です:

1. ミドルウェア内で `db` と `auth` を遅延初期化する（Workers では env バインディング、Node.js では `process.env` を使用）
2. 環境設定から CORS オリジンを読み取る
3. `process.env` の代わりに環境変数から `BETTER_AUTH_URL` を読み取る

### 4. Wrangler 設定

`apps/api/wrangler.toml` で以下を定義:

- Worker 名とエントリーポイント (`src/worker.ts`)
- `nodejs_compat` フラグ（`postgres` ドライバーと Better Auth に必要）
- 静的アセットディレクトリ (`../web/dist` — ビルド済み React SPA)
- Hyperdrive バインディング（PostgreSQL のコネクションプーリング）
- staging と production の環境オーバーライド

### 5. CI/CD（新規）

`.github/workflows/deploy.yml`:

```
develop へ push → staging にデプロイ
main へ push    → production にデプロイ

ステップ:
  1. 依存関係のインストール (pnpm)
  2. Web アプリのビルド (vite build)
  3. API のビルド (tsc)
  4. マイグレーション実行 (drizzle-kit)
  5. デプロイ (wrangler deploy)
```

## 使用する Cloudflare サービス

| サービス | 用途 |
|---------|---------|
| **Workers** | Hono API の実行 + 静的 SPA アセットの配信 |
| **Hyperdrive** | 外部 PostgreSQL のコネクションプーリングとキャッシング |
| **Workers Secrets** | `BETTER_AUTH_SECRET`、`GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET` の保存 |

## 環境セットアップ

### シークレット (`wrangler secret bulk` で設定)

これらは `wrangler.toml` には記載しません — Cloudflare に暗号化されて保存されます:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Hyperdrive (`wrangler hyperdrive create` で設定)

```bash
# マネージド PostgreSQL を指す Hyperdrive 設定を作成
wrangler hyperdrive create monorepo-db \
  --connection-string="postgres://user:pass@host:5432/dbname"

# 返された ID を wrangler.toml の [[hyperdrive]] にコピー
```

### 環境マトリクス

| | ローカル開発 | Staging | Production |
|---|---|---|---|
| API ランタイム | Node.js (`tsx watch`) | Cloudflare Workers | Cloudflare Workers |
| Web ホスティング | Vite 開発サーバー | Worker 静的アセット | Worker 静的アセット |
| データベース | Docker PostgreSQL | マネージド Postgres + Hyperdrive | マネージド Postgres + Hyperdrive |
| シークレット | `.mise.local.toml` | `wrangler secret bulk --env staging` | `wrangler secret bulk --env production` |
| デプロイ | なし | `wrangler deploy --env staging` | `wrangler deploy --env production` |

## 移行の順序

各ステップは独立した変更です。すべてのステップの後もローカル開発は引き続き動作します。

1. **Workers エントリーポイント + wrangler.toml の追加**（完了）
   - 新規ファイルのみ、既存コードの変更なし
2. **Infrastructure をファクトリ関数にリファクタリング**
   - `drizzle.ts`: シングルトン → `getDb(connectionString)`
   - `auth.ts`: シングルトン → `getAuth(config)`
   - `task-repository.ts`: グローバル `db` → コンストラクタインジェクション
   - `apps/api` 内のすべてのインポート先を更新
3. **app.ts を環境対応にする**
   - ミドルウェアでの db/auth の遅延初期化
   - 環境変数からの動的 CORS オリジン設定
4. **`wrangler` を devDependency に追加し、デプロイスクリプトを作成**
   - `package.json`、`.mise.toml` に追加
5. **外部 PostgreSQL + Hyperdrive のセットアップ**
   - マネージド Postgres（Neon/Supabase）のプロビジョニング
   - Hyperdrive 設定の作成、`wrangler.toml` の更新
6. **GitHub Actions デプロイワークフローの追加**

## 移行後のディレクトリ構成

```
apps/
  api/
    src/
      index.ts          ← Node.js エントリー（変更なし、ローカル開発用）
      worker.ts         ← 新規: Cloudflare Workers エントリー
      app.ts            ← 変更: 環境対応の初期化
      generated/        ← 変更なし
      handlers/         ← 変更なし
    wrangler.toml       ← 新規: Cloudflare Worker 設定
    package.json        ← 変更: wrangler 依存追加
  web/
    dist/               ← ビルド済み SPA（Worker が静的アセットとして配信）
    ...                 ← 変更なし
  mobile/
    ...                 ← 変更なし
packages/
  core/                 ← 変更なし
  infrastructure/
    src/
      database/
        drizzle.ts      ← 変更: ファクトリ関数化
      auth/
        auth.ts         ← 変更: ファクトリ関数化
      repositories/
        task-repository.ts  ← 変更: 依存性の注入
  spec/                 ← 変更なし
  ui/                   ← 変更なし
.github/
  workflows/
    deploy.yml          ← 新規: CI/CD パイプライン
```
