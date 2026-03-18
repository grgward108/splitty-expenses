# Deployment Guide

This template deploys to **Cloudflare Workers** with **Neon PostgreSQL** as the database.

A single Worker serves both the React SPA (static assets) and the Hono API.

## Environments

| Environment | Worker Name | Branch | URL |
|---|---|---|---|
| Staging | `monorepo-app-staging` | `develop` | `https://monorepo-app-staging.<your-account>.workers.dev` |
| Production | `monorepo-app-production` | `main` | `https://monorepo-app-production.<your-account>.workers.dev` |

Both environments live under the same Cloudflare account — no separate projects needed.

---

## Step 1: Create a Cloudflare Account

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) and sign up
2. Navigate to **Workers & Pages** in the left sidebar
3. Copy your **Account ID** from the right sidebar

## Step 2: Create a Cloudflare API Token

1. Click your profile icon (top right) → **My Profile**
2. Click **API Tokens** in the left sidebar
3. Click **Create Token**
4. Use the **"Edit Cloudflare Workers"** template
5. Review permissions — it needs:
   - Account > Workers Scripts > **Edit**
   - Account > Account Settings > **Read**
6. Click **Continue to summary** → **Create Token**
7. Copy the token immediately (you won't see it again)

> **Note:** You need an **API Token**, not a Global API Key. They are different.

## Step 3: Save Cloudflare Credentials Locally

Copy the secrets template and fill in your values:

```bash
cp .mise.local.toml.example .mise.local.toml
```

Set these values in `.mise.local.toml`:

```toml
CLOUDFLARE_API_TOKEN = "your-api-token"
CLOUDFLARE_ACCOUNT_ID = "your-account-id"
```

This file is gitignored and will not be committed.

## Step 4: Create a Neon Database (via Vercel)

1. Go to the [Neon integration on the Vercel Marketplace](https://vercel.com/marketplace/neon) and click **Install**
2. In the install flow, choose **Create New Neon Account** (or link an existing one) and click **Continue**
3. Accept the terms, pick the region closest to your users (e.g., `us-east-1`), choose a plan (free tier works), and name the database (e.g., `monorepo-app-staging`)
4. After creation, open your project in Vercel → **Storage** tab. Select the Neon database and copy the **pooled connection string** — it looks like:
   ```
   postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```

> For production, create a separate Neon database via Vercel (e.g., `monorepo-app-production`) or add another Storage database and use its connection string.

## Step 5: Run Database Migrations

Run the Drizzle migrations against your Neon database:

```bash
DATABASE_URL="your-neon-connection-string" pnpm --filter @repo/infrastructure db:migrate
```

You should see: `Migrations completed`

## Step 6: Set Cloudflare Worker Secrets

These are runtime secrets that the Worker reads from `c.env`. Set them from the `apps/api/` directory:

```bash
cd apps/api

# Database
pnpm wrangler secret put DATABASE_URL --env staging
# Paste your Neon pooled connection string

# Auth secret (generate with: openssl rand -base64 32)
pnpm wrangler secret put BETTER_AUTH_SECRET --env staging

# Google OAuth (if using Google sign-in)
pnpm wrangler secret put GOOGLE_CLIENT_ID --env staging
pnpm wrangler secret put GOOGLE_CLIENT_SECRET --env staging
```

Repeat with `--env production` for production secrets.

## Step 7: Build & Deploy

### Manual deploy

```bash
# Build all packages
pnpm run build

# Deploy to staging
cd apps/api && pnpm wrangler deploy --env staging

# Deploy to production
cd apps/api && pnpm wrangler deploy --env production
```

Or use mise tasks (loads env vars automatically):

```bash
mise run deploy:staging
mise run deploy:production
```

### Local Workers dev server

Test with the Cloudflare Workers runtime locally:

```bash
mise run deploy:dev
# or: cd apps/api && pnpm wrangler dev
```

## Step 8: Set Up CI/CD (GitHub Actions)

The workflow at `.github/workflows/deploy.yml` auto-deploys on push:

- Push to `develop` → deploys to **staging**
- Push to `main` → deploys to **production**

Add these as **GitHub repository secrets** (Settings → Secrets and variables → Actions):

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

---

## Architecture

```
Browser ──→ Cloudflare Worker
                │
                ├── /*        ──→ Static assets (apps/web/dist SPA)
                │
                └── /api/*    ──→ Hono app.ts
                                      │
                                  postgres (TCP + SSL)
                                      │
                                  Neon PostgreSQL
```

### Key files

| File | Purpose |
|------|---------|
| `apps/api/src/worker.ts` | Cloudflare Workers entry point |
| `apps/api/src/index.ts` | Node.js entry point (local dev) |
| `apps/api/src/app.ts` | Shared Hono app (both runtimes) |
| `apps/api/wrangler.toml` | Worker config (envs, assets) |
| `.github/workflows/deploy.yml` | CI/CD pipeline |
| `.mise.local.toml` | Local secrets (gitignored) |

### How the app reads config

The middleware in `app.ts` checks for environment variables in this order:

1. `c.env.HYPERDRIVE?.connectionString` — Cloudflare Hyperdrive binding (if configured)
2. `c.env.DATABASE_URL` — Cloudflare Worker secret
3. `process.env.DATABASE_URL` — Node.js environment (local dev)

---

## Secrets Reference

| Secret | Where to set | Purpose |
|--------|-------------|---------|
| `CLOUDFLARE_API_TOKEN` | `.mise.local.toml` + GitHub Secrets | Deploy authentication |
| `CLOUDFLARE_ACCOUNT_ID` | `.mise.local.toml` + GitHub Secrets | Deploy target account |
| `DATABASE_URL` | `wrangler secret put` | Neon connection string |
| `BETTER_AUTH_SECRET` | `wrangler secret put` | Session encryption (32+ chars) |
| `GOOGLE_CLIENT_ID` | `wrangler secret put` | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | `wrangler secret put` | Google OAuth |

## Troubleshooting

### "Failed to fetch" in the browser
The web app loaded but can't reach the API. Check:
- `DATABASE_URL` secret is set on the Worker (`wrangler secret list --env staging`)
- Migrations have been run on the Neon database
- Check Worker logs: `cd apps/api && pnpm wrangler tail --env staging`

### "Authentication failed" on deploy
- Make sure you're using an **API Token** (not a Global API Key)
- Token needs **"Edit Cloudflare Workers"** permissions
- Check that `CLOUDFLARE_ACCOUNT_ID` matches your account

### Build fails
- Run `pnpm install` first
- Make sure Node.js 22 and pnpm 9 are installed (`mise install`)
