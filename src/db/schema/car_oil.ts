import {
  datetime,
  float,
  int,
  mysqlTable,
  varchar,
} from 'drizzle-orm/mysql-core';

import { oil_brand } from './oil_brand';

export const car_oil = mysqlTable('car_oil', {
  id: int('id').autoincrement().primaryKey().notNull(),

  car_code: varchar('car_code', {
    length: 255,
  }).notNull(),

  c_u_code: varchar('c_u_code', {
    length: 255,
  }).notNull(),

  date_oil: datetime('date_oil').notNull(),

  km_detail: float('km_detail').notNull(),

  liter_oil: float('liter_oil').notNull(),

  price_oil: float('price_oil').notNull(),

  oil_type: int('oil_type').references(() => oil_brand.oil_id, {
    onDelete: 'restrict',
    onUpdate: 'cascade',
  }),
});
