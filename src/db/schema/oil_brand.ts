import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const oil_brand = mysqlTable('oil_brand', {
  oil_id: int('id').autoincrement().primaryKey().notNull(),

  oil_name: varchar('oil_name', {
    length: 255,
  })
    .notNull()
    .unique(),
});
