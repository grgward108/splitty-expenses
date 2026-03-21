# Monorepo

A full-stack TypeScript monorepo built with Turborepo.

## Tech Stack

- **Build System**: [Turborepo](https://turbo.build/repo)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Runtime Manager**: [mise](https://mise.jdx.dev/)
- **Language**: TypeScript

### Apps

| App | Description | Tech |
|-----|-------------|------|
| `apps/web` | Web application | React, Tanstack Router, Tanstack Query, Vite |
| `apps/mobile` | Mobile application | Ionic, Capacitor, React |
| `apps/api` | Backend API | Hono, Node.js |

### Packages

| Package | Description | Tech |
|---------|-------------|------|
| `packages/core` | Domain logic (no external dependencies) | Pure TypeScript |
| `packages/infrastructure` | External service integrations | PostgreSQL, Drizzle ORM |
| `packages/ui` | Shared UI components & Storybook | React, TailwindCSS, Storybook |
| `packages/spec` | API specification & code generation | TypeSpec, Orval, OpenAPI, Zod |
| `packages/cdk` | Infrastructure as Code | AWS CDK |
| `packages/tailwind-config` | Shared Tailwind configuration | TailwindCSS, PostCSS |

## Getting Started

### Prerequisites

- [mise](https://mise.jdx.dev/) - Runtime version manager

### Installation

```bash
# Install Node.js and pnpm via mise
mise install

# Install dependencies
mise run install

# Generate API client & server code from TypeSpec
mise run generate

# Build all packages
mise run build
```

### Development

```bash
# Run all apps in development mode
mise run dev

# Run specific app
mise run dev:web
mise run dev:mobile
mise run dev:api
```

#### `mise run dev` で開く localhost 一覧

`mise run dev` は `pnpm turbo run dev storybook` を実行し、各パッケージの開発サーバーが並列で起動します。デフォルトのポートは次のとおりです（環境変数で変えている場合はその値に従います）。

| サービス | URL | 備考 |
|----------|-----|------|
| Web アプリ | http://localhost:5173 | `apps/web`（Vite） |
| API | http://localhost:3000 | `apps/api`（`PORT` で変更可） |
| Mobile（Vite） | http://localhost:8100 | `apps/mobile` |
| Swagger UI（OpenAPI） | http://localhost:4000/api-docs | `packages/spec`（`SWAGGER_PORT` でポート変更可。`/` は `/api-docs` にリダイレクト） |
| Storybook | http://localhost:6006 | `packages/ui` |
| Scalar API ドキュメント | http://localhost:8788 | `apps/api-docs`（`serve` で `public/` を配信） |
| PostgreSQL | `localhost:5432` | DB 接続用（ブラウザ用 URL ではない） |

`packages/ui` の `dev`（tsup の watch）はビルドウォッチのみで、ブラウザで開く URL はありません。コンポーネント確認は上記 Storybook を利用してください。

### Local Database (PostgreSQL)

ローカル開発では Docker Compose で PostgreSQL を使用します。**初回のみ** mise のローカル設定を用意してください。

```bash
# 初回のみ: .mise.local.toml を作成（パスワードと DATABASE_URL を設定）
cp .mise.local.toml.example .mise.local.toml
# .mise.local.toml を開き、POSTGRES_PASSWORD と DATABASE_URL をローカル用の値に書き換える
```

`mise run` でタスクを実行すると `.mise.local.toml` の環境変数が読み込まれるため、`docker:up` や `db:migrate` でその値が使われます。

```bash
# PostgreSQL を起動
mise run docker:up

# マイグレーションを実行
mise run db:migrate

# 停止
mise run docker:down
```

- **PostgreSQL**: localhost:5432（接続文字列は `DATABASE_URL`）

> Note: `mise run dev` を実行すると、自動的に Docker Compose で PostgreSQL が起動しマイグレーションが実行されます。その前に `.mise.local.toml` の設定が必要です。

### API Generation Flow

1. Edit API spec in `packages/spec/src/main.tsp`
2. Run `mise run generate:spec`
3. OpenAPI schema is generated in `packages/spec/generated/openapi.yaml`
4. Orval generates:
   - **Frontend**: Tanstack Query hooks in `packages/spec/generated/client/`
   - **Backend**: Hono routes, Zod schemas in `packages/spec/generated/hono/`
5. Import and use in your apps

```typescript
// Frontend: apps/web or apps/mobile
import { useTasksList, useTasksCreate } from "@repo/spec/client/tasks/tasks";

function TasksPage() {
  const { data, isLoading } = useTasksList();
  const createTask = useTasksCreate();
  // ...
}
```

```typescript
// Backend: apps/api - using generated Zod schemas for validation
import { zValidator } from "@hono/zod-validator";
import {
  tasksCreateBody,
  tasksListQueryParams,
} from "@repo/spec/hono/zod/tasks";

app.post("/api/tasks", zValidator("json", tasksCreateBody), async (c) => {
  const body = c.req.valid("json"); // Fully typed from OpenAPI spec
  // ...
});
```

## Project Structure

```
monorepo/
├── apps/
│   ├── web/              # React web app
│   ├── mobile/           # Ionic mobile app
│   ├── api/              # Hono API server
│   └── api-docs/         # Scalar API docs (static)
├── packages/
│   ├── core/             # Domain logic
│   ├── infrastructure/   # External integrations (PostgreSQL, Drizzle ORM)
│   ├── ui/               # Shared UI components + Storybook
│   ├── spec/             # API spec & generated code (client + server)
│   ├── cdk/              # AWS CDK infrastructure
│   └── tailwind-config/  # Shared Tailwind config
├── docker-compose.yml    # PostgreSQL (local)
├── turbo.json            # Turborepo config
├── pnpm-workspace.yaml   # pnpm workspace config
└── tsconfig.json         # Base TypeScript config
```

## Tasks

すべてのタスクは `mise tasks` で確認できます。

| Task | Description |
|------|-------------|
| `mise run build` | Build all packages and apps |
| `mise run dev` | Start development servers |
| `mise run generate` | Generate API client & server code from TypeSpec |
| `mise run typecheck` | Run TypeScript type checking |
| `mise run lint` | Run linting (Biome) |
| `mise run format` | Format code (Biome) |
| `mise run check` | Run lint + format check |
| `mise run clean` | Clean build outputs |
| `mise run storybook` | Start Storybook |
| `mise run docker:up` | Start Docker Compose services |
| `mise run docker:down` | Stop Docker Compose services |
| `mise run db:migrate` | Run PostgreSQL migrations |
| `mise run db:generate` | Generate Drizzle migration files |
| `mise run db:studio` | Open Drizzle Studio |

## Environment Variables

- **`.mise.toml`**: 共通の環境変数（`NODE_ENV`, `BETTER_AUTH_URL` など）。リポジトリにコミットされます。
- **`.mise.local.toml`**: ローカル専用の環境変数（`DATABASE_URL`, `POSTGRES_PASSWORD` など）。`.gitignore` されているためコミットされません。初回は `.mise.local.toml.example` をコピーして作成します。

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | 環境（.mise.toml） |
| `BETTER_AUTH_URL` | API のベース URL（.mise.toml） |
| `DATABASE_URL` | PostgreSQL 接続文字列（.mise.local.toml） |
| `POSTGRES_PASSWORD` | Docker Compose 用 PostgreSQL パスワード（.mise.local.toml） |

## Mobile Development

### iOS

```bash
mise run build:mobile
mise run cap:sync
mise run cap:ios
```

### Android

```bash
mise run build:mobile
mise run cap:sync
mise run cap:android
```

## Storybook

UI コンポーネントのドキュメントは `packages/ui` 内の Storybook で管理しています。

```bash
# Storybook を起動
mise run storybook
```

http://localhost:6006 でアクセスできます。

## Git Hooks

Husky と lint-staged を使用してコミット時に自動でコードチェックを行います。

- **pre-commit**: Biome による lint + format チェック

```bash
# 手動で lint-staged を実行
mise run lint-staged
```

## License

MIT


