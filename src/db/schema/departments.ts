import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const departments = mysqlTable('departments', {
  dep_id: int('dep_id').autoincrement().primaryKey().notNull(),
  dep_name: varchar('dep_name', { length: 255 }).notNull(),
  dep_phone: varchar('dep_phone', { length: 255 }),
});
