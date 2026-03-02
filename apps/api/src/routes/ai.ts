import { ChatRequestSchema } from '@blog/types';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { streamText } from 'hono/streaming';

export const aiRoutes = new Hono();

aiRoutes.post('/chat', zValidator('json', ChatRequestSchema), async (c) => {
  const { messages, provider, model, temperature, maxTokens } = c.req.valid('json');

  return streamText(c, async (stream) => {
    await stream.write(`data: {"provider":"${provider}","model":"${model ?? 'default'}"}\n\n`);

    for (const msg of messages) {
      await stream.write(
        `data: ${JSON.stringify({ role: 'assistant', content: `Echo (${provider}): ${msg.content}` })}\n\n`,
      );
    }

    await stream.write(
      `data: ${JSON.stringify({ content: `[Placeholder: Connect ${provider} with temperature=${temperature}, maxTokens=${maxTokens}]`, done: true })}\n\n`,
    );
  });
});

aiRoutes.get('/providers', (c) =>
  c.json({
    data: [
      { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini'] },
      { id: 'anthropic', name: 'Anthropic', models: ['claude-4-sonnet', 'claude-4-haiku'] },
    ],
    success: true,
  }),
);
