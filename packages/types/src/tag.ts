import { z } from 'zod';

export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export type Tag = z.infer<typeof TagSchema>;

export const CreateTagSchema = TagSchema.omit({ id: true });
export type CreateTagInput = z.infer<typeof CreateTagSchema>;
