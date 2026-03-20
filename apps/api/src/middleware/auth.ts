import type { MiddlewareHandler } from 'hono';
import { verifyJwt } from '../lib/auth';
import type { JwtPayload } from '../lib/auth';

declare module 'hono' {
  interface ContextVariableMap {
    user: JwtPayload;
  }
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return c.json(
      {
        error: 'Unauthorized',
        message: 'Missing or invalid token',
        success: false,
        statusCode: 401,
      },
      401,
    );
  }

  const token = header.slice(7);
  const payload = await verifyJwt(token);

  if (!payload) {
    return c.json(
      {
        error: 'Unauthorized',
        message: 'Invalid or expired token',
        success: false,
        statusCode: 401,
      },
      401,
    );
  }

  c.set('user', payload);
  await next();
};
