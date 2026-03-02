---
name: create-api-route
description: Step-by-step guide to create a new Hono API route with Zod validation, error handling, database queries, and registration in the app. Use when adding new API endpoints, REST routes, or backend features.
---

# Create API Route

Step-by-step guide to add a new Hono API route in `apps/api/`.

## 1. Define Types and Schemas

Add Zod schemas in `packages/types/src/`:

```typescript
// packages/types/src/resource.ts
import { z } from 'zod';

export const CreateResourceSchema = z.object({
  name: z.string().min(1),
  // ...
});

export const UpdateResourceSchema = CreateResourceSchema.partial();

export const ResourceIdSchema = z.object({ id: z.string().uuid() });
```

Export from `packages/types/src/index.ts`.

## 2. Create Route File

Path: `apps/api/src/routes/[resource-name].ts`

```typescript
import { zValidator } from '@hono/zod-validator';
import { db } from '@blog/database';
import { resourceTable } from '@blog/database/schema';
import { CreateResourceSchema, UpdateResourceSchema, PaginationSchema } from '@blog/types';
import { eq, desc, sql } from 'drizzle-orm';
import { Hono } from 'hono';

export const resourceRoutes = new Hono();

// GET /api/resource
resourceRoutes.get('/', zValidator('query', PaginationSchema), async (c) => {
  const { page, limit } = c.req.valid('query');
  const offset = (page - 1) * limit;

  const [data, countResult] = await Promise.all([
    db.select().from(resourceTable).orderBy(desc(resourceTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(resourceTable),
  ]);

  const total = countResult[0]?.count ?? 0;

  return c.json({
    data,
    success: true,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/resource/:id
resourceRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const [item] = await db.select().from(resourceTable).where(eq(resourceTable.id, id)).limit(1);

  if (!item) {
    return c.json({ error: 'Not Found', message: 'Resource not found', success: false, statusCode: 404 }, 404);
  }

  return c.json({ data: item, success: true });
});

// POST /api/resource
resourceRoutes.post('/', zValidator('json', CreateResourceSchema), async (c) => {
  const input = c.req.valid('json');
  const [created] = await db.insert(resourceTable).values(input).returning();

  return c.json({ data: created, success: true }, 201);
});

// PUT /api/resource/:id
resourceRoutes.put('/:id', zValidator('json', UpdateResourceSchema), async (c) => {
  const id = c.req.param('id');
  const input = c.req.valid('json');
  const [updated] = await db.update(resourceTable).set(input).where(eq(resourceTable.id, id)).returning();

  if (!updated) {
    return c.json({ error: 'Not Found', message: 'Resource not found', success: false, statusCode: 404 }, 404);
  }

  return c.json({ data: updated, success: true });
});

// DELETE /api/resource/:id
resourceRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const [deleted] = await db.delete(resourceTable).where(eq(resourceTable.id, id)).returning();

  if (!deleted) {
    return c.json({ error: 'Not Found', message: 'Resource not found', success: false, statusCode: 404 }, 404);
  }

  return c.json({ data: deleted, success: true });
});
```

## 3. Register Route in App

In `apps/api/src/app.ts`:

```typescript
import { resourceRoutes } from './routes/resource-name';

app.route('/resource-name', resourceRoutes);
```

## 4. Add Database Schema (if new resource)

In `packages/database/src/schema/`:

- Create `resource.ts` with Drizzle schema
- Export from `packages/database/src/schema/index.ts`
- Run migrations: `pnpm db:generate` and `pnpm db:migrate`

## 5. Checklist

- [ ] Zod schemas in `@blog/types`
- [ ] `zValidator` for query, json, param
- [ ] Success: `{ data, success: true }`
- [ ] Error: `{ error, message, success: false, statusCode }`
- [ ] 201 for POST create, 404 for not-found
- [ ] Route registered in `app.ts`
- [ ] Drizzle for DB access

## Reference

- App: `apps/api/src/app.ts`
- Example: `apps/api/src/routes/posts.ts`
- Types: `packages/types/src/api.ts`, `packages/types/src/post.ts`
