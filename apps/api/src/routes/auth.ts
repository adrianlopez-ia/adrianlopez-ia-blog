import { db } from '@blog/database';
import { users } from '@blog/database/schema';
import { generateId } from '@blog/utils';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { hashPassword, signJwt, verifyPassword } from '../lib/auth';
import { authMiddleware } from '../middleware/auth';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRoutes = new Hono();

authRoutes.post('/register', zValidator('json', RegisterSchema), async (c) => {
  const { email, password, name } = c.req.valid('json');

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    return c.json(
      { error: 'Conflict', message: 'Email already registered', success: false, statusCode: 409 },
      409,
    );
  }

  const id = generateId();
  const passwordHash = await hashPassword(password);

  const [created] = await db
    .insert(users)
    .values({ id, email, passwordHash, name, role: 'reader' })
    .returning({ id: users.id, email: users.email, name: users.name, role: users.role });

  const token = await signJwt({ sub: id, email, role: 'reader' });

  return c.json(
    {
      success: true,
      data: { user: created, token },
    },
    201,
  );
});

authRoutes.post('/login', zValidator('json', LoginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user?.passwordHash) {
    return c.json(
      {
        error: 'Unauthorized',
        message: 'Invalid email or password',
        success: false,
        statusCode: 401,
      },
      401,
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return c.json(
      {
        error: 'Unauthorized',
        message: 'Invalid email or password',
        success: false,
        statusCode: 401,
      },
      401,
    );
  }

  const token = await signJwt({ sub: user.id, email: user.email, role: user.role });

  return c.json({
    success: true,
    data: {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    },
  });
});

authRoutes.get('/me', authMiddleware, async (c) => {
  const { sub } = c.get('user');

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      avatar: users.avatar,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, sub))
    .limit(1);

  if (!user) {
    return c.json(
      { error: 'Not Found', message: 'User not found', success: false, statusCode: 404 },
      404,
    );
  }

  return c.json({ success: true, data: user });
});
