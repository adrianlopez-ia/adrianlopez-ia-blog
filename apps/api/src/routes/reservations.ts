import { db } from '@blog/database';
import { type ReservationStatus, reservationStatus, reservations } from '@blog/database/schema';
import { generateId } from '@blog/utils';
import { zValidator } from '@hono/zod-validator';
import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';

const CreateReservationSchema = z.object({
  scheduledFor: z.string(), // ISO datetime string
  targetHour: z.string(),
  daysAhead: z.string(),
  withLight: z.boolean(),
  twoHours: z.boolean(),
  maxWaitMinutes: z.string(),
});

const UpdateReservationSchema = z.object({
  status: z.enum(reservationStatus).optional(),
  moneyReceived: z.number().optional(), // in cents
});

export const reservationsRoutes = new Hono();

// Helper function to calculate cost
function calculateCost(withLight: boolean, twoHours: boolean): number {
  const hourlyRate = withLight ? 1260 : 890; // in cents
  return twoHours ? hourlyRate * 2 : hourlyRate;
}

// POST /api/reservations - Create scheduled reservation
reservationsRoutes.post(
  '/',
  authMiddleware,
  zValidator('json', CreateReservationSchema),
  async (c) => {
    const { sub } = c.get('user');
    const { scheduledFor, targetHour, daysAhead, withLight, twoHours, maxWaitMinutes } =
      c.req.valid('json');

    const scheduledDate = new Date(scheduledFor);
    if (Number.isNaN(scheduledDate.getTime())) {
      return c.json(
        {
          error: 'Bad Request',
          message: 'Invalid scheduledFor datetime',
          success: false,
          statusCode: 400,
        },
        400,
      );
    }

    const totalCost = calculateCost(withLight, twoHours);

    const id = generateId();
    const [created] = await db
      .insert(reservations)
      .values({
        id,
        userId: sub,
        scheduledFor: scheduledDate,
        targetHour,
        daysAhead: Number.parseInt(daysAhead, 10),
        withLight,
        twoHours,
        maxWaitMinutes: Number.parseInt(maxWaitMinutes, 10),
        status: 'scheduled',
        totalCost,
        moneyReceived: 0,
      })
      .returning();

    return c.json({ success: true, data: created }, 201);
  },
);

// GET /api/reservations - List all reservations with optional filters
reservationsRoutes.get('/', authMiddleware, async (c) => {
  const { sub } = c.get('user');
  const status = c.req.query('status') as ReservationStatus | undefined;
  const month = c.req.query('month'); // format: YYYY-MM
  const limit = Number.parseInt(c.req.query('limit') || '50', 10);

  const conditions = [eq(reservations.userId, sub)];

  if (status) {
    conditions.push(eq(reservations.status, status));
  }

  if (month) {
    const [year, monthNum] = month.split('-').map(Number);
    if (year && monthNum) {
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);
      conditions.push(gte(reservations.scheduledFor, startDate));
      conditions.push(lte(reservations.scheduledFor, endDate));
    }
  }

  const results = await db
    .select()
    .from(reservations)
    .where(and(...conditions))
    .orderBy(desc(reservations.scheduledFor))
    .limit(limit);

  return c.json({ success: true, data: results });
});

// GET /api/reservations/:id - Get single reservation
reservationsRoutes.get('/:id', authMiddleware, async (c) => {
  const { sub } = c.get('user');
  const id = c.req.param('id');

  const [reservation] = await db
    .select()
    .from(reservations)
    .where(and(eq(reservations.id, id), eq(reservations.userId, sub)))
    .limit(1);

  if (!reservation) {
    return c.json(
      { error: 'Not Found', message: 'Reservation not found', success: false, statusCode: 404 },
      404,
    );
  }

  return c.json({ success: true, data: reservation });
});

// PUT /api/reservations/:id - Update reservation
reservationsRoutes.put(
  '/:id',
  authMiddleware,
  zValidator('json', UpdateReservationSchema),
  async (c) => {
    const { sub } = c.get('user');
    const id = c.req.param('id');
    const { status, moneyReceived } = c.req.valid('json');

    const [existing] = await db
      .select()
      .from(reservations)
      .where(and(eq(reservations.id, id), eq(reservations.userId, sub)))
      .limit(1);

    if (!existing) {
      return c.json(
        { error: 'Not Found', message: 'Reservation not found', success: false, statusCode: 404 },
        404,
      );
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (moneyReceived !== undefined) updateData.moneyReceived = moneyReceived;

    const [updated] = await db
      .update(reservations)
      .set(updateData)
      .where(and(eq(reservations.id, id), eq(reservations.userId, sub)))
      .returning();

    return c.json({ success: true, data: updated });
  },
);

// DELETE /api/reservations/:id - Cancel scheduled reservation
reservationsRoutes.delete('/:id', authMiddleware, async (c) => {
  const { sub } = c.get('user');
  const id = c.req.param('id');

  const [existing] = await db
    .select()
    .from(reservations)
    .where(and(eq(reservations.id, id), eq(reservations.userId, sub)))
    .limit(1);

  if (!existing) {
    return c.json(
      { error: 'Not Found', message: 'Reservation not found', success: false, statusCode: 404 },
      404,
    );
  }

  if (existing.status !== 'scheduled') {
    return c.json(
      {
        error: 'Bad Request',
        message: 'Can only cancel scheduled reservations',
        success: false,
        statusCode: 400,
      },
      400,
    );
  }

  await db.delete(reservations).where(and(eq(reservations.id, id), eq(reservations.userId, sub)));

  return c.json({ success: true, message: 'Reservation cancelled' });
});

// GET /api/reservations/stats - Get statistics for charts
reservationsRoutes.get('/stats', authMiddleware, async (c) => {
  const { sub } = c.get('user');
  const month = c.req.query('month'); // format: YYYY-MM

  const conditions = [eq(reservations.userId, sub)];

  if (month) {
    const [year, monthNum] = month.split('-').map(Number);
    if (year && monthNum) {
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);
      conditions.push(gte(reservations.scheduledFor, startDate));
      conditions.push(lte(reservations.scheduledFor, endDate));
    }
  }

  // Get all reservations for the period
  const allReservations = await db
    .select()
    .from(reservations)
    .where(and(...conditions))
    .orderBy(reservations.scheduledFor);

  // Calculate totals
  const totalSpent = allReservations.reduce((sum, r) => sum + r.totalCost, 0);
  const totalReceived = allReservations.reduce((sum, r) => sum + r.moneyReceived, 0);
  const netBalance = totalReceived - totalSpent;

  // Group by day for daily spending chart
  const dailySpending: Record<string, number> = {};
  const dailyReceived: Record<string, number> = {};

  for (const r of allReservations) {
    const dayKey = r.scheduledFor.toISOString().split('T')[0];
    if (!dayKey) continue;
    if (!dailySpending[dayKey]) {
      dailySpending[dayKey] = 0;
      dailyReceived[dayKey] = 0;
    }
    dailySpending[dayKey] += r.totalCost;
    dailyReceived[dayKey] = (dailyReceived[dayKey] ?? 0) + r.moneyReceived;
  }

  const dailyData = Object.entries(dailySpending).map(([date, spent]) => ({
    date,
    spent,
    received: dailyReceived[date] || 0,
  }));

  return c.json({
    success: true,
    data: {
      totalSpent,
      totalReceived,
      netBalance,
      totalReservations: allReservations.length,
      dailyData,
    },
  });
});
