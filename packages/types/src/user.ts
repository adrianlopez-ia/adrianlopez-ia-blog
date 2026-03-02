import { z } from 'zod';

export const UserRoleSchema = z.enum(['admin', 'author', 'reader']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  role: UserRoleSchema.default('reader'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
