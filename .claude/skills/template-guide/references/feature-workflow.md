# Adding a Full-Stack Feature — Detailed Workflow

This guide walks through adding a complete feature end-to-end using the template's conventions.

## Table of Contents
- [1. TypeSpec Definition](#1-typespec-definition)
- [2. Code Generation](#2-code-generation)
- [3. Domain Layer](#3-domain-layer)
- [4. Database Schema](#4-database-schema)
- [5. Repository Implementation](#5-repository-implementation)
- [6. API Handler](#6-api-handler)
- [7. Frontend Integration](#7-frontend-integration)
- [8. Example: Adding a "Reviews" Feature](#8-example-adding-a-reviews-feature)

## 1. TypeSpec Definition

Edit `packages/spec/src/main.tsp`. TypeSpec compiles to OpenAPI.

```typespec
// Define a model
model Review {
  id: int32;
  perfumeId: int32;
  userId: string;
  rating: float32;
  comment: string;
  createdAt: utcDateTime;
}

// Define operations
@route("/api/reviews")
namespace Reviews {
  @get op list(@query perfumeId: int32): Review[];
  @post op create(@body body: ReviewCreate): Review;
}
```

Key conventions:
- All routes start with `/api/`
- Use `@query` for query params, `@body` for request bodies
- Define separate Create/Update models without auto-generated fields (id, createdAt)

## 2. Code Generation

```bash
mise run generate          # Full pipeline: TypeSpec → OpenAPI → client + server
# Or individually:
mise run generate:spec     # TypeSpec → OpenAPI YAML only
mise run generate:client   # Orval → TanStack Query hooks + Hono Zod schemas
```

This produces:
- `packages/spec/generated/openapi.yaml` — OpenAPI schema
- `packages/spec/generated/client/` — TanStack Query hooks (e.g., `useListReviews`, `useCreateReview`)
- `apps/api/src/generated/` — Hono Zod validators for request/response

## 3. Domain Layer

### Entity in `packages/core/src/entities/`

```typescript
// packages/core/src/entities/review.ts
export interface Review {
  id: number;
  perfumeId: number;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
```

### Repository Interface in `packages/core/src/repositories/`

```typescript
// packages/core/src/repositories/review-repository.ts
import type { Review } from "../entities/review";

export interface IReviewRepository {
  findByPerfumeId(perfumeId: number): Promise<Review[]>;
  create(review: Omit<Review, "id" | "createdAt">): Promise<Review>;
}
```

Export from `packages/core/src/index.ts`.

## 4. Database Schema

### Add table in `packages/infrastructure/database/schema.ts`

```typescript
import { pgTable, serial, integer, text, real, timestamp } from "drizzle-orm/pg-core";

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  perfumeId: integer("perfume_id").notNull(),
  userId: text("user_id").notNull(),
  rating: real("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Generate and run migration

```bash
mise run db:generate   # Creates SQL migration file in packages/infrastructure/drizzle/
mise run db:migrate    # Applies it to local Postgres
```

## 5. Repository Implementation

In `packages/infrastructure/src/repositories/`:

```typescript
// review-repository.ts
import { eq } from "drizzle-orm";
import type { IReviewRepository } from "@repo/core";
import { reviews } from "../database/schema";
import type { DrizzleClient } from "../database/drizzle";

export class ReviewRepository implements IReviewRepository {
  constructor(private db: DrizzleClient) {}

  async findByPerfumeId(perfumeId: number) {
    return this.db.select().from(reviews).where(eq(reviews.perfumeId, perfumeId));
  }

  async create(review: Omit<Review, "id" | "createdAt">) {
    const [result] = await this.db.insert(reviews).values(review).returning();
    return result;
  }
}
```

Export from `packages/infrastructure/src/index.ts`.

## 6. API Handler

In `apps/api/src/handlers/`:

```typescript
// review-handler.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
// Import generated Zod schemas
import { listReviewsQueryParams, createReviewBody } from "../generated/zod/reviews";

const app = new Hono();

app.get("/api/reviews", zValidator("query", listReviewsQueryParams), async (c) => {
  const { perfumeId } = c.req.valid("query");
  const db = c.get("db"); // injected by middleware
  const repo = new ReviewRepository(db);
  const reviews = await repo.findByPerfumeId(perfumeId);
  return c.json(reviews);
});

app.post("/api/reviews", zValidator("json", createReviewBody), async (c) => {
  const body = c.req.valid("json");
  const db = c.get("db");
  const repo = new ReviewRepository(db);
  const review = await repo.create(body);
  return c.json(review, 201);
});

export default app;
```

Mount in `apps/api/src/app.ts`:
```typescript
import reviews from "./handlers/review-handler";
app.route("/", reviews);
```

### Rate Limiting

For AI-powered or expensive endpoints, add rate limiting middleware:

```typescript
import { rateLimiter } from "../middleware/rate-limiter";

app.use("/api/reviews", rateLimiter({ maxTokens: 60, refillRate: 1 })); // 60 req/min
```

## 7. Frontend Integration

In `apps/web/` (or `apps/mobile/`), use the auto-generated TanStack Query hooks:

```tsx
import { useListReviews, useCreateReview } from "@repo/spec/client/reviews";

function ReviewList({ perfumeId }: { perfumeId: number }) {
  const { data: reviews, isLoading } = useListReviews({ perfumeId });
  const createReview = useCreateReview();

  if (isLoading) return <Spinner />;

  return (
    <div>
      {reviews?.map((r) => <ReviewCard key={r.id} review={r} />)}
      <ReviewForm onSubmit={(data) => createReview.mutate(data)} />
    </div>
  );
}
```

The hooks handle caching, loading states, and error handling via TanStack Query.

## 8. Example: Adding a "Reviews" Feature

Summary checklist:

- [ ] `packages/spec/src/main.tsp` — Add Review model + CRUD operations
- [ ] `mise run generate` — Generate all code
- [ ] `packages/core/src/entities/review.ts` — Domain entity
- [ ] `packages/core/src/repositories/review-repository.ts` — Interface
- [ ] `packages/core/src/index.ts` — Export new entity + repo
- [ ] `packages/infrastructure/database/schema.ts` — Drizzle table
- [ ] `mise run db:generate && mise run db:migrate` — Migration
- [ ] `packages/infrastructure/src/repositories/review-repository.ts` — Implementation
- [ ] `packages/infrastructure/src/index.ts` — Export
- [ ] `apps/api/src/handlers/review-handler.ts` — Hono routes
- [ ] `apps/api/src/app.ts` — Mount handler
- [ ] `apps/web/src/routes/` — UI pages using generated hooks
