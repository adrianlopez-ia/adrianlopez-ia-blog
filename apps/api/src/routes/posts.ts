import { zValidator } from '@hono/zod-validator';
import { db } from '@blog/database';
import { posts } from '@blog/database/schema';
import { CreatePostSchema, PaginationSchema, UpdatePostSchema } from '@blog/types';
import { estimateReadingTime, generateId, slugify } from '@blog/utils';
import { eq, desc, sql } from 'drizzle-orm';
import { Hono } from 'hono';

export const postsRoutes = new Hono();

postsRoutes.get('/', zValidator('query', PaginationSchema), async (c) => {
  const { page, limit } = c.req.valid('query');
  const offset = (page - 1) * limit;

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(posts)
      .where(eq(posts.status, 'published'))
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(eq(posts.status, 'published')),
  ]);

  const total = countResult[0]?.count ?? 0;

  return c.json({
    data,
    success: true,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

postsRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const post = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);

  if (!post[0]) {
    return c.json({ error: 'Not Found', message: 'Post not found', success: false, statusCode: 404 }, 404);
  }

  return c.json({ data: post[0], success: true });
});

postsRoutes.post('/', zValidator('json', CreatePostSchema), async (c) => {
  const input = c.req.valid('json');
  const id = generateId();
  const slug = input.slug || slugify(input.title);
  const readingTime = estimateReadingTime(input.content);

  const [created] = await db
    .insert(posts)
    .values({
      ...input,
      id,
      slug,
      readingTime,
      publishedAt: input.status === 'published' ? new Date() : undefined,
    })
    .returning();

  return c.json({ data: created, success: true }, 201);
});

postsRoutes.put('/:id', zValidator('json', UpdatePostSchema), async (c) => {
  const id = c.req.param('id');
  const input = c.req.valid('json');

  const updates: Record<string, unknown> = { ...input, updatedAt: new Date() };
  if (input.content) updates.readingTime = estimateReadingTime(input.content);
  if (input.title && !input.slug) updates.slug = slugify(input.title);

  const [updated] = await db.update(posts).set(updates).where(eq(posts.id, id)).returning();

  if (!updated) {
    return c.json({ error: 'Not Found', message: 'Post not found', success: false, statusCode: 404 }, 404);
  }

  return c.json({ data: updated, success: true });
});

postsRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const [deleted] = await db.delete(posts).where(eq(posts.id, id)).returning();

  if (!deleted) {
    return c.json({ error: 'Not Found', message: 'Post not found', success: false, statusCode: 404 }, 404);
  }

  return c.json({ data: deleted, success: true });
});
