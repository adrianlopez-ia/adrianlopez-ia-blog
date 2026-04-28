---
description: Documentation standards with JSDoc for public APIs
activationMode: auto
globs: ['**/*.ts', '**/*.tsx']
---

# Documentation Standards

## JSDoc for Public APIs

Use JSDoc for public API functions with `@param` and `@returns`. Prefer meaningful names over comments for internal code.

```typescript
/**
 * Creates a streaming chat response using the specified provider.
 *
 * @param options - Chat configuration including messages and model settings
 * @param options.messages - Array of chat messages (user/assistant/system)
 * @param options.provider - AI provider (openai | anthropic)
 * @param options.model - Optional model override
 * @returns StreamTextResult from Vercel AI SDK
 *
 * @example
 * const stream = createChatStream({
 *   messages: [{ role: 'user', content: 'Hello' }],
 *   provider: 'openai',
 * });
 * return stream.toDataStreamResponse();
 */
export function createChatStream(options: ChatStreamOptions) {
  // ...
}
```

## README per Package

Each package in `packages/*` should have a README with:

- Purpose and exports
- Usage example
- Link to main docs if applicable

```
packages/
  ai/README.md
  database/README.md
  types/README.md
  ui/README.md
  utils/README.md
```

## When to Document

| Document | Skip |
|----------|------|
| Public functions/classes | Private helpers with obvious names |
| Complex business logic | Simple CRUD, getters/setters |
| Non-obvious algorithms | Self-explanatory code |
| Workarounds (with ticket ref) | Obvious patterns |

## @example in JSDoc

Use `@example` for non-trivial usage.

```typescript
/**
 * Validates and normalizes a slug for blog posts.
 *
 * @param input - Raw string (e.g. blog title)
 * @returns URL-safe slug
 *
 * @example
 * slugify('Hello World!') // 'hello-world'
 * slugify('Node.js & React') // 'nodejs-react'
 */
export function slugify(input: string): string {}
```

## Keep Comments Up to Date

Remove or update comments when code changes. Stale comments are worse than none.

```typescript
// ❌ BAD - Comment says 5min but code says 10min
/** Cache 5min to balance freshness with API rate limits */
@Cacheable({ ttl: 600000 })

// ✅ GOOD - Comment matches code
/** Cache 10min to balance freshness with API rate limits */
@Cacheable({ ttl: 600000 })
```

## Summary

- **Public API**: JSDoc with `@param`, `@returns`, `@example`
- **Packages**: README with purpose and usage
- **Complex logic**: Document the WHY
- **Names**: Prefer clear names over comments
- **Maintain**: Update comments when code changes
