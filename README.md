# Splitty - Expense Splitting App

A Splitwise-like expense splitting app. Anonymous (no login) — create groups via shareable links, add members by name + emoji, log expenses, and view balances.

## Tech Stack

- **Build System**: [Turborepo](https://turbo.build/repo) + [pnpm](https://pnpm.io/)
- **Frontend**: React 18 + TanStack Router + TanStack Query + Vite + TailwindCSS
- **Backend**: Hono 4 (Node.js dev / Cloudflare Workers prod)
- **Database**: PostgreSQL + Drizzle ORM (Neon in prod)
- **API Spec**: TypeSpec → OpenAPI → Orval code gen
- **Mobile**: Ionic + Capacitor + React
- **i18n**: English + Japanese

## What's Done

- [x] **Database schema**: groups, members, expenses, expense_splits (migrated to Neon)
- [x] **API spec (TypeSpec)**: All endpoints defined and code generated
- [x] **Core domain layer**: Entity classes (Group, Member, Expense, ExpenseSplit) with repository interfaces
- [x] **Infrastructure layer**: Drizzle repository implementations
- [x] **API handlers**: All 12 handlers (CRUD for groups/members/expenses + balance calculation)
- [x] **i18n**: EN + JA translations for home, groups, expenses, balances
- [x] **Cleanup**: Removed auth (Better Auth), task demo, landing page

## What's Left (TODO)

### Web Frontend (Phase 7)
- [ ] Home page (`apps/web/src/routes/index/route.tsx`) — Create group form with name, currency, member inputs
- [ ] Group page (`apps/web/src/routes/group/$groupId/route.tsx`) — Tabbed layout (Expenses | Balances | Members)
- [ ] Expense list component — Cards with description, amount, payer, category badge
- [ ] Expense form dialog — Add/edit with split type toggle, member selection, category picker
- [ ] Balance summary — Per-member net balance + simplified "who owes whom"
- [ ] Member management — Add/edit/delete members
- [ ] Share link component — Copy-to-clipboard URL
- [ ] Fun & colorful styling (gradients, rounded corners, emoji avatars)
- [ ] Mobile-responsive design

### Mobile App (Phase 8)
- [ ] Home page (`apps/mobile/src/pages/Home.tsx`) — Create group form (Ionic)
- [ ] Group page (`apps/mobile/src/pages/Group.tsx`) — Segment tabs
- [ ] Add expense page (`apps/mobile/src/pages/AddExpense.tsx`)

### Polish
- [ ] Loading states + empty states
- [ ] Error handling (404 groups, validation feedback)
- [ ] End-to-end testing

## Development

```bash
mise install          # Install Node + pnpm
pnpm install          # Install dependencies
docker compose up -d  # Start local PostgreSQL (or use Neon)
pnpm drizzle-kit migrate  # Run migrations
pnpm run dev          # Start all dev servers
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/groups` | Create group with initial members |
| GET | `/api/groups/{groupId}` | Get group with members |
| POST | `/api/groups/{groupId}/members` | Add member |
| PUT | `/api/groups/{groupId}/members/{memberId}` | Update member |
| DELETE | `/api/groups/{groupId}/members/{memberId}` | Remove member |
| GET | `/api/groups/{groupId}/expenses` | List expenses (paginated) |
| POST | `/api/groups/{groupId}/expenses` | Create expense + splits |
| GET | `/api/groups/{groupId}/expenses/{expenseId}` | Get expense |
| PUT | `/api/groups/{groupId}/expenses/{expenseId}` | Update expense |
| DELETE | `/api/groups/{groupId}/expenses/{expenseId}` | Delete expense |
| GET | `/api/groups/{groupId}/balances` | Get balance summary |
| GET | `/api/health` | Health check |
