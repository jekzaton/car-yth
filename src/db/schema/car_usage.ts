import {
  datetime,
  float,
  int,
  mysqlTable,
  varchar,
} from 'drizzle-orm/mysql-core';

import { relations } from 'drizzle-orm';
import { car_booking } from './car_booking';

export const car_usage = mysqlTable('car_usage', {
  id: int('id').autoincrement().primaryKey().notNull(),

  car_code: varchar('car_code', { length: 255 }).notNull(),

  c_u_code: varchar('c_u_code', { length: 255 }).notNull(),

  date_go: datetime('date_go').notNull(),

  date_back: datetime('date_back').notNull(),

  km_go: float('km_go').notNull(),

  km_back: float('km_back').notNull(),

  booking_id: int('booking_id')
    .notNull()
    .references(() => car_booking.bookingId, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
});

export const carUsageRelations = relations(car_usage, ({ one }) => ({
  booking: one(car_booking, {
    fields: [car_usage.booking_id],
    references: [car_booking.bookingId],
  }),
}));
