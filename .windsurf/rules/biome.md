---
description: Biome linting and formatting rules
activationMode: auto
globs: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.json']
---

# Biome Rules

## Before Committing

Run `biome check` before committing. Use `biome check --write` for auto-fix.

```bash
# Check only (CI)
pnpm exec biome check .

# Auto-fix
pnpm exec biome check --write .
# or
pnpm check
```

## Formatting (from biome.json)

| Setting | Value |
|---------|-------|
| Quotes | Single `'` |
| Trailing commas | All |
| Indent | 2 spaces |
| Line width | 100 chars |

## Import Sorting

Biome organizes imports automatically:

1. Built-in (node, etc.)
2. External packages
3. Internal aliases (@blog/*)
4. Relative imports

```typescript
// ✅ GOOD - Biome auto-sorts
import { z } from 'zod';
import { createChatStream } from '@blog/ai';
import type { ChatMessage } from '@blog/types';
import { getModel } from './providers';
```

## Linter Rules

- **noUnusedImports** — error
- **noUnusedVariables** — error
- **noExplicitAny** — error
- **noConsoleLog** — warn (use logger in production)

## Quick Fix

```bash
# Format + lint + fix
pnpm check
```

## Lefthook

Pre-commit hooks run `biome check` via lefthook. Ensure changes pass before pushing.
