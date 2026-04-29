import { db } from '@blog/database';
import { padelBotConfigs } from '@blog/database/schema';
import { generateId } from '@blog/utils';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';

const SaveConfigSchema = z
  .object({
    targetHour: z.string().default('19:00'),
    daysAhead: z.number().default(5),
    withLight: z.boolean().default(true),
    twoHours: z.boolean().default(true),
    maxWaitMinutes: z.number().default(12),
    apiUrl: z.string().default(''),
    headers: z.array(z.object({ key: z.string(), value: z.string() })).default([]),
  })
  .passthrough();

export const padelBotConfigRoutes = new Hono();

// GET /api/padel-bot/config - Get user's Padel Bot config
padelBotConfigRoutes.get('/config', authMiddleware, async (c) => {
  const { sub } = c.get('user');

  const [config] = await db
    .select()
    .from(padelBotConfigs)
    .where(eq(padelBotConfigs.userId, sub))
    .limit(1);

  if (!config) {
    // Return default config if none exists
    return c.json({
      success: true,
      data: {
        targetHour: '19:00',
        daysAhead: 5,
        withLight: true,
        twoHours: true,
        maxWaitMinutes: 12,
        apiUrl: '',
        headers: [],
      },
    });
  }

  return c.json({ success: true, data: config });
});

// POST /api/padel-bot/config - Save user's Padel Bot config
padelBotConfigRoutes.post(
  '/config',
  authMiddleware,
  zValidator('json', SaveConfigSchema),
  async (c) => {
    const { sub } = c.get('user');
    const { targetHour, daysAhead, withLight, twoHours, maxWaitMinutes, apiUrl, headers } =
      c.req.valid('json');

    // Check if config already exists
    const [existing] = await db
      .select()
      .from(padelBotConfigs)
      .where(eq(padelBotConfigs.userId, sub))
      .limit(1);

    if (existing) {
      // Update existing config
      const [updated] = await db
        .update(padelBotConfigs)
        .set({
          targetHour,
          daysAhead,
          withLight,
          twoHours,
          maxWaitMinutes,
          apiUrl,
          headers,
          updatedAt: new Date(),
        })
        .where(eq(padelBotConfigs.userId, sub))
        .returning();

      return c.json({ success: true, data: updated });
    }

    // Create new config
    const id = generateId();
    const [created] = await db
      .insert(padelBotConfigs)
      .values({
        id,
        userId: sub,
        targetHour,
        daysAhead,
        withLight,
        twoHours,
        maxWaitMinutes,
        apiUrl,
        headers,
      })
      .returning();

    return c.json({ success: true, data: created }, 201);
  },
);
