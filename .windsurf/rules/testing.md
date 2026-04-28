---
description: Testing standards (Vitest, Playwright, mocks, coverage)
activationMode: glob
globs: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts']
---

# Testing Standards

## Strategy

- **Vitest** for unit and integration tests.
- **Playwright** for E2E tests.
- Use `describe` / `it` pattern.
- Test file next to source: `file.test.ts` or `file.spec.ts`.

## Structure

```typescript
describe('ComponentOrFeature', () => {
  it('should do expected behavior', () => {
    // Arrange
    const input = { a: 1, b: 2 };

    // Act
    const result = process(input);

    // Assert
    expect(result).toEqual({ sum: 3 });
  });
});
```

## Mocks

- Use `vi.fn()` for mocks.
- Mock external services (API, DB) in unit tests.

```typescript
import { vi } from 'vitest';

const mockFetch = vi.fn().mockResolvedValue({ data: [] });
vi.stubGlobal('fetch', mockFetch);
```

## Coverage

- Target minimum **80%** coverage for new code.
- Test edge cases and error paths, not just happy path.

```typescript
// ✅ Good - Edge cases
it('should return 404 when post not found', async () => {
  const res = await app.request('/posts/nonexistent');
  expect(res.status).toBe(404);
});

it('should throw when validation fails', () => {
  expect(() => validate({ slug: '' })).toThrow();
});
```

## Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { generateId, slugify } from '@blog/utils';

describe('generateId', () => {
  it('should return a UUID string', () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('slugify', () => {
  it('should convert title to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });
});
```

## Integration Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { app } from '../app';

describe('POST /api/posts', () => {
  it('should create post and return 201', async () => {
    const res = await app.request('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test',
        content: 'Content',
        excerpt: 'Excerpt',
        status: 'draft',
      }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty('id');
  });
});
```

## Running Tests

```bash
pnpm test
pnpm test:coverage
pnpm test:e2e  # Playwright
```
