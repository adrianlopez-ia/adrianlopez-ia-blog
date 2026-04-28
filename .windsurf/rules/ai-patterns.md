---
description: AI development patterns with Vercel AI SDK and @blog/ai
activationMode: glob
globs: ['packages/ai/**/*.ts', 'apps/api/src/routes/ai.ts', '**/*ai*', '**/*chat*']
---

# AI Development Patterns

## Streaming with Vercel AI SDK

Use `streamText()` from Vercel AI SDK for all AI chat endpoints. Prefer streaming over full responses for better UX and lower time-to-first-token.

```typescript
// ✅ GOOD - Use streamText from ai package
import { streamText } from 'ai';
import { getModel } from './providers';

export function createChatStream({ messages, provider, model }: ChatStreamOptions) {
  const aiModel = getModel(provider, model);
  return streamText({
    model: aiModel,
    messages,
    temperature: 0.7,
    maxTokens: 1024,
  });
}
```

```typescript
// ❌ BAD - Full response blocks until complete
const response = await generateText({ model, messages });
return response.text;
```

## Use @blog/ai Package

Centralize AI logic in `packages/ai`. Route handlers should delegate to the package.

```typescript
// apps/api/src/routes/ai.ts - ✅ GOOD
import { createChatStream } from '@blog/ai';
import { ChatRequestSchema } from '@blog/types';

aiRoutes.post('/chat', zValidator('json', ChatRequestSchema), async (c) => {
  const { messages, provider, model } = c.req.valid('json');
  const stream = createChatStream({ messages, provider, model });
  return stream.toDataStreamResponse();
});
```

## API Key Handling

Always handle missing API keys gracefully. Never expose keys to the frontend.

```typescript
// ✅ GOOD - Graceful fallback
function getModel(provider: AiProvider, model?: string) {
  const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`] ?? '';
  if (!apiKey) {
    throw new Error(`Missing ${provider} API key. Set ${provider.toUpperCase()}_API_KEY in .env`);
  }
  return createOpenAI({ apiKey });
}
```

```typescript
// ❌ BAD - Silent failure or frontend exposure
const apiKey = process.env.OPENAI_API_KEY || ''; // No error message
// or: passing apiKey from client request
```

## Rate Limiting

Apply rate limiting to all AI endpoints.

```typescript
// apps/api/src/app.ts - ✅ GOOD
app.use('/ai/*', rateLimitMiddleware);
app.route('/ai', aiRoutes);
```

## Request Validation with Zod

Validate all chat requests with Zod schemas from `@blog/types`.

```typescript
// ✅ GOOD - Zod validation
import { zValidator } from '@hono/zod-validator';
import { ChatRequestSchema } from '@blog/types';

aiRoutes.post('/chat', zValidator('json', ChatRequestSchema), async (c) => {
  const valid = c.req.valid('json');
  // valid is typed and sanitized
});
```

## Streaming vs Full Response

| Use Case | Prefer |
|----------|--------|
| Chat UI | Streaming |
| One-shot completions | Streaming (faster TTFB) |
| Batch processing | Full response acceptable |
| Real-time feedback | Streaming |
