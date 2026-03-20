import { cors } from 'hono/cors';

export const corsMiddleware = cors({
  origin: [
    'http://localhost:4321',
    'http://localhost:3000',
    process.env.PUBLIC_SITE_URL ?? '',
  ].filter(Boolean),
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
});
