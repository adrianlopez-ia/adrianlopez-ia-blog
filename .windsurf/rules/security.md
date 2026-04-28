---
description: Security best practices for the monorepo
activationMode: always
---

# Security Guidelines

## Environment & Secrets

- **Never commit `.env` files** — Add to `.gitignore`, use `.env.example` for templates
- **Environment variables** — Access via `process.env` with fallbacks for optional values
- **Never expose API keys to frontend** — Keys stay server-side only (API routes, server components)

```typescript
// ✅ GOOD
const apiKey = process.env.OPENAI_API_KEY ?? '';
if (!apiKey) throw new Error('OPENAI_API_KEY is required');

// ❌ BAD - Exposing to client
return c.json({ apiKey: process.env.OPENAI_API_KEY });
```

## Input Validation

Validate all user input with Zod before processing.

```typescript
// ✅ GOOD
import { z } from 'zod';
const Schema = z.object({ email: z.string().email(), name: z.string().min(1).max(100) });
const valid = Schema.parse(req.body);
```

```typescript
// ❌ BAD - Trusting raw input
const { email } = req.body;
await db.insert(users).values({ email });
```

## CORS

Use CORS middleware on API routes. Configure allowed origins explicitly.

```typescript
// apps/api - CORS middleware applied to all routes
app.use('*', corsMiddleware);
```

## Rate Limiting

Implement rate limiting on sensitive endpoints (auth, AI, mutations).

```typescript
// ✅ GOOD - Rate limit AI and auth routes
app.use('/ai/*', rateLimitMiddleware);
app.use('/auth/*', rateLimitMiddleware);
```

## HTML Sanitization

Sanitize any user-generated HTML before rendering to prevent XSS.

```typescript
// ✅ GOOD - Use sanitizer for user content
import { sanitizeHtml } from '@blog/utils';
<div set:html={sanitizeHtml(userContent)} />
```

```typescript
// ❌ BAD - Raw user HTML
<div set:html={userContent} />
```

## Cookies

Use `httpOnly` and `secure` for session/auth cookies.

```typescript
// ✅ GOOD
c.set('session', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 86400,
});
```

## Dangerous Patterns

- **No `eval()`** — Never use `eval()` or `new Function()` with user input
- **No dynamic require** — Avoid `require(variable)` with unsanitized paths
- **No raw SQL** — Use parameterized queries (Drizzle handles this)

## Checklist

- [ ] `.env` in `.gitignore`
- [ ] All API inputs validated with Zod
- [ ] CORS configured
- [ ] Rate limiting on AI/auth endpoints
- [ ] HTML sanitized before render
- [ ] httpOnly cookies for auth
- [ ] No API keys in frontend bundle
