# Splitty — Project Status

## What's Done

### Backend (fully built)
- **Database schema** — 4 tables: `groups`, `members`, `expenses`, `expense_splits` (Drizzle ORM)
- **API spec** — TypeSpec with 12 endpoints, Orval code-gen for both server (Hono routes + Zod) and client (TanStack Query hooks)
- **Domain layer** — Entity classes (`Group`, `Member`, `Expense`, `ExpenseSplit`) with repository interfaces in `packages/core`
- **Infrastructure** — Drizzle repository implementations in `packages/infrastructure`
- **API handlers** — All 12 handlers working: groups CRUD, members CRUD, expenses CRUD, balance calculation with debt simplification
- **i18n** — EN + JA translations for home, groups, expenses, balances

### Frontend (built, needs fixes)
- **Root layout** — Neo-brutalist header with yellow bar, Archivo Black + Space Mono typography
- **Home page** — Create group form with name, currency, member inputs, emoji picker
- **Group page** — Tabbed layout (Expenses | Balances | Members), share link
- **Expense list** — Receipt-style cards with category colors, edit/delete
- **Expense form dialog** — Add/edit with split type toggle, category picker, member selection
- **Balance summary** — Per-member net balance, simplified debt arrows
- **Member management** — Add/edit/delete with emoji picker
- **Share link** — Copy-to-clipboard component

### Deployment (partially set up)
- **GitHub repo**: https://github.com/grgward108/splitty-expenses (branch: `develop`)
- **Cloudflare** — Account ID + API token in `.mise.local.toml`, wrangler config exists
- **Neon DB** — Connection strings in `.mise.local.toml` but currently timing out (project may be suspended)

---

## What's Broken / Needs Fixing

### P0 — Blocking

1. **Neon DB connection timeout** — Both pooled and unpooled endpoints timing out. Need to either:
   - Wake up the Neon project (check Neon dashboard)
   - Or use local Postgres via Docker for dev (existing `matching-postgres-dev` container on port 5432 could be reused — needs a `splitty_dev` database created)

2. **`.mise.local.toml` DATABASE_URL** — Currently set to unpooled Neon URL. Revert to pooled for prod, or switch to local for dev.

### P1 — User-requested changes

3. **Remove "Split bills, not friendships" tagline** — Delete from home page (`apps/web/src/routes/index/route.tsx`)

4. **Currency selector → searchable dropdown** — Current chip buttons don't scale. Replace with a searchable dropdown (combobox) that includes all world currencies. File: `apps/web/src/routes/index/route.tsx`

5. **Auto-copy link after group creation** — When a group is created, auto-copy the shareable URL to clipboard and show a toast/notification. Currently it just navigates to the group page. File: `apps/web/src/routes/index/route.tsx` (onSuccess handler)

6. **White background** — User noticed it's white. The neo-brutalist design intentionally uses white (`var(--white)`) as background. If the user wants a different base color, update `--white` in `globals.css` or change body background.

### P2 — Known issues

7. **TypeScript build errors** — `tsc` fails due to module resolution (`@repo/spec/client/model`, `@repo/ui`, `@repo/i18n`). Vite dev works fine but production build (`pnpm build`) fails. Fix: ensure `tsconfig.json` paths match package.json exports, or add a pre-build step.

8. **Emoji picker Unicode escapes** — Emojis are stored as `\ud83d\ude00` escape sequences. They render correctly in-browser via Vite, but display as raw escapes in some editors. Not a runtime bug.

9. **CORS for deployment** — `apps/api/src/middleware/app-cors.ts` needs to include the production domain once deployed.

---

## What's Left to Build

### Frontend fixes (from user feedback)
- [ ] Remove cringe tagline
- [ ] Searchable currency dropdown (combobox with all currencies)
- [ ] Auto-copy group link on creation + toast feedback
- [ ] Verify background color is intentional or change it

### Deployment
- [ ] Fix Neon DB connection (check dashboard, wake project)
- [ ] Run `drizzle-kit migrate` against working DB
- [ ] Deploy API to Cloudflare Workers (`wrangler deploy`)
- [ ] Set Worker secrets (DATABASE_URL, etc.) via `wrangler secret put`
- [ ] Deploy web as Worker static assets (already configured in `wrangler.toml`)
- [ ] Test full flow on deployed URL

### Mobile App (Phase 8 — not started)
- [ ] `apps/mobile/src/pages/Home.tsx` — Create group form (Ionic)
- [ ] `apps/mobile/src/pages/Group.tsx` — Group view with segment tabs
- [ ] `apps/mobile/src/pages/AddExpense.tsx` — Full-screen expense form
- Currently `apps/mobile/src/App.tsx` has the routes defined but pages are empty stubs

### Polish
- [ ] Loading states + empty states on all pages
- [ ] Error handling (network errors, validation feedback)
- [ ] Fix TypeScript strict build
- [ ] End-to-end testing

---

## Architecture Quick Reference

```
apps/
  api/          — Hono backend (Node.js dev / Cloudflare Workers prod)
  web/          — React SPA (Vite + TanStack Router)
  mobile/       — Ionic + Capacitor (stubs only)
  
packages/
  core/         — Domain entities + repository interfaces
  infrastructure/ — Drizzle ORM implementations + schema
  spec/         — TypeSpec API definition + generated client/server code
  ui/           — Shared React components (shadcn-style)
  i18n/         — i18next translations (EN + JA)
  email/        — Resend + React Email (not used yet)
  tailwind-config/ — Shared Tailwind config
```

### Key commands
```bash
eval "$(mise activate bash)"     # Activate mise environment
pnpm install                      # Install dependencies
pnpm --filter @repo/api run dev   # Start API on :3000
pnpm --filter web run dev         # Start web on :5173
pnpm --filter @repo/spec run generate  # Regenerate from TypeSpec
pnpm --filter @repo/core run build     # Build core package
pnpm --filter @repo/infrastructure run build  # Build infra package
cd packages/infrastructure && pnpm drizzle-kit migrate  # Run DB migrations
```
