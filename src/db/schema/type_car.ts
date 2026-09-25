import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const typeCar = mysqlTable('type_car', {
  typeCarId: int('type_car_id').autoincrement().primaryKey(),
  typeName: varchar('type_name', { length: 255 }).notNull(),
});
