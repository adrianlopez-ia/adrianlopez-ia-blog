---
description: Hono API patterns (validation, error handling, response types)
activationMode: glob
globs: ['apps/api/**/*.ts']
---

# Hono API Patterns

## Input Validation

- Use `zValidator` from `@hono/zod-validator` for all inputs (query, body, params).
- Define Zod schemas in `@blog/types` and import them.

```typescript
import { zValidator } from '@hono/zod-validator';
import { PaginationSchema, CreatePostSchema } from '@blog/types';

// Query params
postsRoutes.get('/', zValidator('query', PaginationSchema), async (c) => {
  const { page, limit } = c.req.valid('query');
  // ...
});

// JSON body
postsRoutes.post('/', zValidator('json', CreatePostSchema), async (c) => {
  const input = c.req.valid('json');
  // ...
});
```

## Response Types

- Return consistent `ApiResponse` / `ApiErrorResponse` shapes from `@blog/types`.
- Success: `{ data, success: true }` or `{ data, success: true, meta }` for paginated.
- Error: `{ error, message, success: false, statusCode }`.

```typescript
import type { ApiResponse, ApiErrorResponse } from '@blog/types';

// ✅ Success
return c.json({ data: post, success: true });

// ✅ Paginated
return c.json({
  data,
  success: true,
  meta: { page, limit, total, totalPages },
});

// ✅ Error
return c.json(
  { error: 'Not Found', message: 'Post not found', success: false, statusCode: 404 },
  404,
);
```

## Middleware Pattern

- Apply middleware in order: logger → cors → rateLimit (where needed).
- Use `app.use('*', ...)` for global or `app.use('/path/*', ...)` for scoped.

```typescript
app.use('*', loggerMiddleware);
app.use('*', corsMiddleware);
app.use('/ai/*', rateLimitMiddleware);
```

## Error Handling

- Use `app.onError` for global error handling.
- Return structured error responses in handlers.

```typescript
app.onError((err, c) => {
  console.error(err);
  return c.json(
    { error: 'Internal Server Error', message: err.message, success: false, statusCode: 500 },
    500,
  );
});

app.notFound((c) =>
  c.json({ error: 'Not Found', message: 'Route not found', success: false, statusCode: 404 }, 404),
);
```

## Database & Utils

- Use `@blog/database` for DB access (e.g. `db` from `@blog/database`).
- Use `@blog/utils` for IDs (`generateId`), slugify, reading time, etc.

```typescript
import { db } from '@blog/database';
import { posts } from '@blog/database/schema';
import { generateId, slugify, estimateReadingTime } from '@blog/utils';
```
