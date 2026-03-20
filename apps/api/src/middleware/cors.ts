import { cors } from 'hono/cors';

const allowedOrigins = [
  'http://localhost:4321',
  'http://localhost:3000',
  'https://adrianlopez-ia-blog.vercel.app',
  process.env.PUBLIC_SITE_URL ?? '',
].filter(Boolean);

export const corsMiddleware = cors({
  origin: allowedOrigins,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
});
