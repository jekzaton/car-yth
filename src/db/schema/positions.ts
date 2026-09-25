import { int, mysqlTable, tinyint, varchar } from 'drizzle-orm/mysql-core';

export const position = mysqlTable('position', {
  ps_id: int('ps_id').autoincrement().primaryKey().notNull(),
  ps_name: varchar('ps_name', { length: 255 }).notNull(),
  ps_sub_name: varchar('ps_sub_name', { length: 255 }).notNull(),
  is_staff: tinyint('is_staff').default(0).notNull(),
  ps_official_name: varchar('ps_official_name', { length: 255 }).notNull(),
});
