import { z } from 'zod';

export const CommentSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(2000),
  postId: z.string().uuid(),
  authorId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Comment = z.infer<typeof CommentSchema>;

export const CreateCommentSchema = CommentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
