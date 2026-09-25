import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const car_brand = mysqlTable('car_brand', {
  car_brand_id: int('car_brand_id').autoincrement().primaryKey().notNull(),

  car_brand_name: varchar('car_brand_name', {
    length: 255,
  })
    .notNull()
    .unique(),
});
