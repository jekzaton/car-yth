import {
  datetime,
  decimal,
  float,
  int,
  mysqlTable,
  text,
  varchar,
} from 'drizzle-orm/mysql-core';

export const car_maintain = mysqlTable('car_maintain', {
  id: int('id').autoincrement().primaryKey().notNull(),

  car_code: varchar('car_code', { length: 255 }).notNull(),

  c_u_code: varchar('c_u_code', { length: 255 }).notNull(),

  date_maintain: datetime('date_maintain').notNull(),

  detail_maintain: text('detail_maintain').notNull(),
  price_maintain: decimal('price_maintain', {
    precision: 10,
    scale: 2,
  }).notNull(),
});
