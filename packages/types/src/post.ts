import { z } from 'zod';

export const PostStatusSchema = z.enum(['draft', 'published', 'archived']);
export type PostStatus = z.infer<typeof PostStatusSchema>;

export const PostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string(),
  coverImage: z.string().url().optional(),
  status: PostStatusSchema.default('draft'),
  authorId: z.string().uuid(),
  readingTime: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
  publishedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Post = z.infer<typeof PostSchema>;

export const CreatePostSchema = PostSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  readingTime: true,
});

export const UpdatePostSchema = CreatePostSchema.partial();

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
