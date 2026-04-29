import { Hono } from 'hono';
import { corsMiddleware } from './middleware/cors';
import { loggerMiddleware } from './middleware/logger';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { aiRoutes } from './routes/ai';
import { authRoutes } from './routes/auth';
import { commentsRoutes } from './routes/comments';
import { healthRoutes } from './routes/health';
import { padelBotConfigRoutes } from './routes/padel-bot-config';
import { postsRoutes } from './routes/posts';
import { reservationsRoutes } from './routes/reservations';
import { tagsRoutes } from './routes/tags';

export const app = new Hono();

app.use('*', loggerMiddleware);
app.use('*', corsMiddleware);
app.use('/api/ai/*', rateLimitMiddleware);
app.use('/api/auth/*', rateLimitMiddleware);

app.route('/api', healthRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/posts', postsRoutes);
app.route('/api/comments', commentsRoutes);
app.route('/api/tags', tagsRoutes);
app.route('/api/ai', aiRoutes);
app.route('/api/reservations', reservationsRoutes);
app.route('/api/padel-bot', padelBotConfigRoutes);

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
