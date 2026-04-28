import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const reservationStatus = ['scheduled', 'launched', 'completed', 'failed'] as const;
export type ReservationStatus = (typeof reservationStatus)[number];

export const reservations = sqliteTable('reservations', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  scheduledFor: integer('scheduled_for', { mode: 'timestamp' }).notNull(),
  launchedAt: integer('launched_at', { mode: 'timestamp' }),
  targetHour: text('target_hour').notNull(),
  daysAhead: integer('days_ahead').notNull(),
  withLight: integer('with_light', { mode: 'boolean' }).notNull().default(false),
  twoHours: integer('two_hours', { mode: 'boolean' }).notNull().default(false),
  maxWaitMinutes: integer('max_wait_minutes').notNull(),
  status: text('status', { enum: reservationStatus }).notNull().default('scheduled'),
  totalCost: integer('total_cost').notNull(), // in cents (e.g., 890 = 8.90€)
  moneyReceived: integer('money_received').notNull().default(0), // in cents
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const reservationsRelations = relations(reservations, ({ one }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id],
  }),
}));
