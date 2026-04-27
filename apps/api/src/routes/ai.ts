import { getAvailableProviders } from '@blog/ai';
import { ChatRequestSchema } from '@blog/types';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { streamText } from 'hono/streaming';
import { authMiddleware } from '../middleware/auth';

export const aiRoutes = new Hono();

aiRoutes.post('/chat', authMiddleware, zValidator('json', ChatRequestSchema), async (c) => {
  const {
    messages,
    provider: preferredProvider,
    model,
    temperature,
    maxTokens,
    useLangChain,
  } = c.req.valid('json');
  console.info(`[AI] Pool Chat request: ${preferredProvider} (LangChain: ${useLangChain})`);

  return streamText(c, async (stream) => {
    try {
      const { createPoolChatStream } = await import('@blog/ai');

      const poolStream = createPoolChatStream({
        messages,
        provider: preferredProvider,
        model,
        temperature,
        maxTokens,
        useLangChain,
      });

      for await (const chunk of poolStream) {
        if (chunk.type === 'meta') {
          await stream.write(
            `data: ${JSON.stringify({ provider: chunk.provider, model: chunk.model, type: 'start' })}\n\n`,
          );
        } else {
          await stream.write(
            `data: ${JSON.stringify({ content: chunk.content, done: false })}\n\n`,
          );
        }
      }

      console.info('[AI] Pool Chat completed');
      await stream.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`);
    } catch (err) {
      console.error('[AI Pool Error]', err);
      const message = err instanceof Error ? err.message : 'All AI providers failed';
      await stream.write(`data: ${JSON.stringify({ error: message, done: true })}\n\n`);
    }
  });
});

aiRoutes.get('/providers', (c) => {
  const providers = getAvailableProviders();
  return c.json({ success: true, data: providers });
});
