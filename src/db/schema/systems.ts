import {
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

export const systems = mysqlTable('systems', {
  id: int('id').autoincrement().primaryKey().notNull(),
  system_id: int('system_id').default(1).notNull(),
  system_name: varchar('system_name', { length: 255 }).notNull(),
});
