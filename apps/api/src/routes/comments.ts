import { db } from '@blog/database';
import { comments } from '@blog/database/schema';
import { CreateCommentSchema } from '@blog/types';
import { generateId } from '@blog/utils';
import { zValidator } from '@hono/zod-validator';
import { desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';

export const commentsRoutes = new Hono();

commentsRoutes.get('/post/:postId', async (c) => {
  const postId = c.req.param('postId');
  const data = await db
    .select()
    .from(comments)
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.createdAt));

  return c.json({ data, success: true });
});

commentsRoutes.post('/', zValidator('json', CreateCommentSchema), async (c) => {
  const input = c.req.valid('json');

  const [created] = await db
    .insert(comments)
    .values({ ...input, id: generateId() })
    .returning();

  return c.json({ data: created, success: true }, 201);
});

commentsRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const [deleted] = await db.delete(comments).where(eq(comments.id, id)).returning();

  if (!deleted) {
    return c.json(
      { error: 'Not Found', message: 'Comment not found', success: false, statusCode: 404 },
      404,
    );
  }

  return c.json({ data: deleted, success: true });
});
