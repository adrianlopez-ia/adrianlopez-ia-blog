import { Hono } from 'hono';
import { corsMiddleware } from './middleware/cors';
import { loggerMiddleware } from './middleware/logger';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { aiRoutes } from './routes/ai';
import { authRoutes } from './routes/auth';
import { commentsRoutes } from './routes/comments';
import { healthRoutes } from './routes/health';
import { postsRoutes } from './routes/posts';
import { tagsRoutes } from './routes/tags';

export const app = new Hono().basePath('/api');

app.use('*', loggerMiddleware);
app.use('*', corsMiddleware);
app.use('/ai/*', rateLimitMiddleware);
app.use('/auth/*', rateLimitMiddleware);

app.route('/', healthRoutes);
app.route('/auth', authRoutes);
app.route('/posts', postsRoutes);
app.route('/comments', commentsRoutes);
app.route('/tags', tagsRoutes);
app.route('/ai', aiRoutes);

app.notFound((c) =>
  c.json({ error: 'Not Found', message: 'Route not found', success: false, statusCode: 404 }, 404),
);

app.onError((err, c) => {
  console.error(err);
  return c.json(
    { error: 'Internal Server Error', message: err.message, success: false, statusCode: 500 },
    500,
  );
});
