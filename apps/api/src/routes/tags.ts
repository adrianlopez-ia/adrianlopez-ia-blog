import { zValidator } from '@hono/zod-validator';
import { db } from '@blog/database';
import { tags } from '@blog/database/schema';
import { CreateTagSchema } from '@blog/types';
import { generateId } from '@blog/utils';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';

export const tagsRoutes = new Hono();

tagsRoutes.get('/', async (c) => {
  const data = await db.select().from(tags);
  return c.json({ data, success: true });
});

tagsRoutes.post('/', zValidator('json', CreateTagSchema), async (c) => {
  const input = c.req.valid('json');
  const [created] = await db
    .insert(tags)
    .values({ ...input, id: generateId() })
    .returning();

  return c.json({ data: created, success: true }, 201);
});

tagsRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const [deleted] = await db.delete(tags).where(eq(tags.id, id)).returning();

  if (!deleted) {
    return c.json({ error: 'Not Found', message: 'Tag not found', success: false, statusCode: 404 }, 404);
  }

  return c.json({ data: deleted, success: true });
});
