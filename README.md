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
| `packages/infrastructure` | External service integrations | DynamoDB, AWS SDK |
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

### Local Database (DynamoDB Local)

ローカル開発では Docker Compose で DynamoDB Local を使用します。

```bash
# DynamoDB Local を起動
mise run docker:up

# テーブルを初期化
mise run dynamodb:init

# 停止
mise run docker:down
```

- **DynamoDB Local**: http://localhost:8000
- **DynamoDB Admin UI**: http://localhost:8001

> Note: `mise run dev` を実行すると、自動的に DynamoDB Local が起動しテーブルが初期化されます。

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

app.post("/tasks", zValidator("json", tasksCreateBody), async (c) => {
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
│   └── api/              # Hono API server
├── packages/
│   ├── core/             # Domain logic
│   ├── infrastructure/   # External integrations (DynamoDB)
│   ├── ui/               # Shared UI components + Storybook
│   ├── spec/             # API spec & generated code (client + server)
│   ├── cdk/              # AWS CDK infrastructure
│   └── tailwind-config/  # Shared Tailwind config
├── docker-compose.yml    # DynamoDB Local
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
| `mise run dynamodb:init` | Initialize DynamoDB tables |

## Environment Variables

`.mise.toml` で以下の環境変数が設定されています（ローカル開発用）:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | 環境 | `development` |
| `VITE_API_BASE_URL` | API のベース URL | `http://localhost:3000` |
| `DYNAMODB_ENDPOINT` | DynamoDB エンドポイント | `http://localhost:8000` |
| `AWS_REGION` | AWS リージョン | `us-east-1` |
| `DYNAMODB_TABLE_NAME` | DynamoDB テーブル名 | `tasks` |

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


