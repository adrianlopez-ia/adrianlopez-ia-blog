import { db } from '@blog/database';
import { users } from '@blog/database/schema';
import { generateId } from '@blog/utils';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import {
  exchangeGoogleCode,
  getGoogleAuthUrl,
  getGoogleUserInfo,
  hashPassword,
  signJwt,
  verifyPassword,
} from '../lib/auth';
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

// ---------------------------------------------------------------------------
// Google OAuth
// ---------------------------------------------------------------------------

authRoutes.get('/google', (c) => {
  const redirectUri = `${c.req.url.split('/api/')[0]}/api/auth/google/callback`;

  try {
    const url = getGoogleAuthUrl(redirectUri);
    return c.redirect(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Google OAuth not configured';
    return c.json({ error: 'Configuration Error', message, success: false, statusCode: 500 }, 500);
  }
});

authRoutes.get('/google/callback', async (c) => {
  const code = c.req.query('code');
  const error = c.req.query('error');
  const siteUrl = process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321';

  if (error || !code) {
    return c.redirect(`${siteUrl}/login?error=google_denied`);
  }

  try {
    const redirectUri = `${c.req.url.split('/callback')[0]}/callback`;
    const tokens = await exchangeGoogleCode(code, redirectUri);
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    if (!googleUser.verified_email) {
      return c.redirect(`${siteUrl}/login?error=email_not_verified`);
    }

    // Upsert user: find by email or create
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, googleUser.email))
      .limit(1);

    let userId: string;
    let userRole: string;

    if (existing) {
      // Update avatar if changed
      if (googleUser.picture && existing.avatar !== googleUser.picture) {
        await db
          .update(users)
          .set({ avatar: googleUser.picture, updatedAt: new Date() })
          .where(eq(users.id, existing.id));
      }
      userId = existing.id;
      userRole = existing.role;
    } else {
      // Create new user — no password (Google-only account)
      const id = generateId();
      await db.insert(users).values({
        id,
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.picture ?? null,
        passwordHash: null,
        role: 'reader',
      });
      userId = id;
      userRole = 'reader';
    }

    const jwtToken = await signJwt({ sub: userId, email: googleUser.email, role: userRole });

    // Redirect back to the frontend with the JWT token as query param
    return c.redirect(`${siteUrl}/auth/callback?token=${jwtToken}`);
  } catch (err) {
    console.error('[Google OAuth callback error]', err);
    return c.redirect(`${siteUrl}/login?error=google_error`);
  }
});

// ---------------------------------------------------------------------------
// Classic email/password (kept for admin use)
// ---------------------------------------------------------------------------

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
