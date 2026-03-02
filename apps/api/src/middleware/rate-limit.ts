import type { MiddlewareHandler } from 'hono';

const windowMs = 60 * 1000;
const maxRequests = 20;
const store = new Map<string, { count: number; resetAt: number }>();

export const rateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  const ip = c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? 'unknown';
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    await next();
    return;
  }

  if (record.count >= maxRequests) {
    return c.json(
      {
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil((record.resetAt - now) / 1000)}s`,
        success: false,
        statusCode: 429,
      },
      429,
    );
  }

  record.count++;
  await next();
};
