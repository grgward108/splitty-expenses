---
name: template-guide
description: Guide for this full-stack TypeScript monorepo template. Use when scaffolding a new project from this template, adding full-stack features end-to-end, understanding the monorepo architecture, or integrating new apps/packages. Triggers on: "scaffold a new feature", "add an endpoint", "set up the template", "add a new app/package", "how does the monorepo work", or any task involving the template's conventions (TypeSpec, Orval, Hono, Drizzle, TanStack, Turborepo).
---

# Template Guide

Full-stack TypeScript monorepo template using Turborepo + pnpm workspaces with a contract-first API approach.

## Architecture Overview

```
monorepo/
├── apps/
│   ├── web/       # React + Vite + TanStack Router/Query (port 5173)
│   ├── hp/        # Landing/marketing site, Cloudflare Pages (port 5174)
│   ├── mobile/    # Ionic + Capacitor + React (port 8100)
│   ├── api/       # Hono — Node.js locally, Cloudflare Workers in prod (port 3000)
│   └── api-docs/  # Scalar API viewer (port 8788)
├── packages/
│   ├── core/           # Pure domain logic (entities, repos interfaces, value objects) — zero deps
│   ├── infrastructure/ # Drizzle ORM, DB schema, repo implementations, auth (Better Auth)
│   ├── spec/           # TypeSpec → OpenAPI → Orval generates client hooks + server Zod schemas
│   ├── ui/             # Shared React components + Storybook (port 6006)
│   ├── tailwind-config/# Shared Tailwind preset + PostCSS config
│   ├── email/          # React Email templates + Resend
│   ├── i18n/           # Internationalization (EN/JA)
│   └── cdk/            # AWS CDK (optional)
├── turbo.json          # Task pipeline
├── .mise.toml          # Dev task runner (mise)
├── biome.json          # Linter + formatter
└── docker-compose.yml  # Local PostgreSQL
```

## Key Technology Choices

| Layer | Tech |
|---|---|
| Monorepo | Turborepo + pnpm v9 |
| Runtime | Node 22 (managed via mise) |
| Frontend | React 18, Vite, TanStack Router (file-based), TanStack Query |
| Backend | Hono v4 (dual: Node.js + Cloudflare Workers) |
| Database | PostgreSQL + Drizzle ORM |
| API Spec | TypeSpec → OpenAPI 3.0 → Orval code gen |
| Auth | better-auth (OAuth + sessions) |
| Styling | TailwindCSS (shared config) |
| Linting | Biome |
| Deploy | Cloudflare Workers (API+web), Cloudflare Pages (HP) |

## Contract-First API Workflow

This is the template's centerpiece pattern. The API contract drives all code generation.

1. **Define** the API in `packages/spec/src/main.tsp` (TypeSpec)
2. **Generate OpenAPI** — `mise run generate:spec` → `packages/spec/generated/openapi.yaml`
3. **Generate client** — Orval → `packages/spec/generated/client/` (TanStack Query hooks)
4. **Generate server** — Orval → `apps/api/src/generated/` (Hono routes + Zod validators)
5. **Frontend** imports from `@repo/spec/client/*`
6. **Backend** imports Zod schemas from `@repo/spec/hono/zod/*`, implements handlers in `apps/api/src/handlers/`

## Adding a Full-Stack Feature (End-to-End)

Follow this sequence. See [references/feature-workflow.md](references/feature-workflow.md) for detailed steps and examples.

1. Define TypeSpec model + operations in `packages/spec/src/main.tsp`
2. Run `mise run generate` (generates OpenAPI + client + server code)
3. Add domain entity in `packages/core/src/entities/`
4. Add repository interface in `packages/core/src/repositories/`
5. Add DB schema in `packages/infrastructure/database/schema.ts`, run `mise run db:generate`
6. Implement repository in `packages/infrastructure/src/repositories/`
7. Implement API handler in `apps/api/src/handlers/`
8. Mount route in `apps/api/src/app.ts`
9. Build UI using generated TanStack Query hooks from `@repo/spec/client/*`

## Adding a New Package

See [references/new-package.md](references/new-package.md) for the checklist (package.json, tsconfig, turbo pipeline, exports).

## Project Setup

```bash
mise install                          # Install Node/pnpm
pnpm install                          # Install deps
cp .mise.local.toml.example .mise.local.toml  # Configure local secrets
mise run docker:up                    # Start PostgreSQL
mise run db:migrate                   # Run migrations
mise run generate                     # Generate API code
mise run build                        # Build all
mise run dev                          # Start everything
```

## Environment & Secrets

- **Local dev**: `.mise.local.toml` (gitignored) — DATABASE_URL, POSTGRES_PASSWORD, API keys
- **Cloudflare Workers**: `wrangler secret put <KEY>` or `scripts/push-cloudflare-secrets.sh`
- **turbo.json globalEnv**: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, GOOGLE_CLIENT_ID/SECRET, RESEND_API_KEY, RESEND_FROM_EMAIL

## Clean Architecture Layers

```
@repo/core (domain)          → Pure TS, no deps. Entities, value objects, repo interfaces.
@repo/infrastructure (infra) → Drizzle schema, repo implementations, auth config.
@repo/spec (contract)        → TypeSpec source of truth. Generated client + server code.
apps/api (transport)         → Hono handlers wire infra repos to HTTP. Middleware: CORS, rate limiting, auth.
apps/web|hp|mobile (UI)      → Consume generated hooks. Shared @repo/ui components.
```

## Deployment Targets

- **API + Web SPA**: Cloudflare Workers (`wrangler.toml` serves web dist as static assets, routes `/api/*` to worker). Hyperdrive for Postgres connection pooling.
- **HP/Landing**: Cloudflare Pages via `wrangler pages deploy`
- **Mobile**: iOS/Android via Capacitor

## Common mise Tasks

| Task | Description |
|---|---|
| `mise run dev` | Start all services (auto-migrates DB) |
| `mise run dev:api` | API only |
| `mise run build` | Build all packages |
| `mise run generate` | Full code generation pipeline |
| `mise run generate:spec` | TypeSpec → OpenAPI only |
| `mise run generate:client` | Orval client generation only |
| `mise run db:generate` | Drizzle migration from schema changes |
| `mise run db:migrate` | Apply migrations |
| `mise run db:studio` | Open Drizzle Studio |
| `mise run docker:up` | Start local Postgres |
| `mise run deploy:staging` | Deploy to CF Workers staging |
| `mise run deploy:production` | Deploy to CF Workers production |
