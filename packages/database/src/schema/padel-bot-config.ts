import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const padelBotConfigs = sqliteTable('padel_bot_configs', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  targetHour: text('target_hour').notNull().default('19:00'),
  daysAhead: integer('days_ahead').notNull().default(5),
  withLight: integer('with_light', { mode: 'boolean' }).notNull().default(true),
  twoHours: integer('two_hours', { mode: 'boolean' }).notNull().default(true),
  maxWaitMinutes: integer('max_wait_minutes').notNull().default(12),
  apiUrl: text('api_url').notNull().default(''),
  headers: text('headers', { mode: 'json' })
    .$type<Array<{ key: string; value: string }>>()
    .notNull()
    .default([]),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const padelBotConfigsRelations = relations(padelBotConfigs, ({ one }) => ({
  user: one(users, {
    fields: [padelBotConfigs.userId],
    references: [users.id],
  }),
}));
