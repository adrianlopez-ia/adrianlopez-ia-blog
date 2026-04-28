---
description: Global coding conventions for adrianlopez-ia-blog monorepo
activationMode: always
---

# General Conventions

## TypeScript

- **Strict mode**: No `any` types. Use `unknown` when type is truly unknown.
- **Imports**: Named exports only. No barrel files (`index.ts` re-exports). Use absolute paths with `@/` alias.
- **Variables**: Prefer `const` over `let`. Use `let` only when reassignment is required.
- **Patterns**: Functional patterns over class-based. Prefer pure functions and composition.

```typescript
// ✅ Good
import { generateId } from '@blog/utils';
import type { ApiResponse } from '@blog/types';

const items = getItems();
const result = items.map(transformItem);

// ❌ Bad
import * as utils from '@blog/utils';
const any: any = getData();
let count = 0;
count++;
```

## Naming

| Kind | Convention | Example |
|------|------------|---------|
| Variables, functions | camelCase | `userName`, `getPostBySlug` |
| Types, components | PascalCase | `PostCard`, `ApiResponse` |
| Files | kebab-case | `post-card.astro`, `rate-limit.ts` |
| Constants | UPPER_SNAKE_CASE or camelCase | `MAX_ITEMS`, `defaultLimit` |

## Imports

```typescript
// ✅ Good - Named exports, absolute paths
import { db } from '@blog/database';
import { generateId } from '@blog/utils';
import type { CreatePostSchema } from '@blog/types';

// ❌ Bad - Default exports, barrel files
import db from '@blog/database';
import { generateId } from '@blog/utils/index';
```

## Logging

- Avoid `console.log` in production code.
- Use structured logging in API (logger middleware).
- For debugging, remove or replace with proper logger before commit.

```typescript
// ✅ Good
logger.info('Post created', { id, slug });

// ❌ Bad - in production code
console.log('Post created', id);
```

## Functional Patterns

```typescript
// ✅ Good - Pure function, composition
const formatSlug = (title: string) => slugify(title).toLowerCase();
const postsWithAuthor = posts.map((p) => ({ ...p, author: getAuthor(p.authorId) }));

// ❌ Bad - Class for simple logic
class PostFormatter {
  formatSlug(title: string) {
    return slugify(title).toLowerCase();
  }
}
```
