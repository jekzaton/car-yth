import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  varchar,
} from 'drizzle-orm/mysql-core';

export const cars = mysqlTable('cars', {
  id: int('id').autoincrement().primaryKey().notNull(),

  car_code: varchar('car_code', {
    length: 255,
  }).notNull(),

  // รุ่นย่อยของรถ
  car_brand_sub: varchar('car_brand_sub', {
    length: 255,
  }).notNull(),

  license_plate: varchar('license_plate', {
    length: 100,
  }).notNull(),

  car_image: text('car_image'),

  status: mysqlEnum('status', ['active', 'inactive'])
    .default('active')
    .notNull(),

  // เก็บ ID ยี่ห้อรถอย่างเดียว ไม่มี FK
  car_brand_id: int('car_brand_id').notNull(),
});
