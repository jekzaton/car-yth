import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  varchar,
} from 'drizzle-orm/mysql-core';
import { car_brand } from './car_brand';

export const cars = mysqlTable('cars', {
  id: int('id').autoincrement().primaryKey().notNull(),

  car_code: varchar('car_code', { length: 255 }).notNull(),
  car_name: varchar('car_name', { length: 255 }).notNull(),
  car_brand_id: int('car_brand_id')
    .notNull()
    .references(() => car_brand.car_brand_id, {
      onUpdate: 'cascade',
      onDelete: 'restrict',
    }),
  license_plate: varchar('license_plate', { length: 100 }).notNull(),
  car_image: text('car_image'),
  status: mysqlEnum('status', ['active', 'inactive'])
    .default('active')
    .notNull(),
});
