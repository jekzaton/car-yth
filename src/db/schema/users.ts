import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey().notNull(),

  // รหัสผู้ใช้งาน เช่น 00001, 00002, 00003
  user_code: varchar('user_code', {
    length: 5,
  }).unique(),

  cid: varchar('cid', { length: 13 }).notNull().unique(),

  prefix: varchar('prefix', { length: 50 }),

  first_name: varchar('first_name', {
    length: 255,
  }),

  last_name: varchar('last_name', {
    length: 255,
  }),

  password: varchar('password', {
    length: 255,
  }).notNull(),

  phone: varchar('phone', {
    length: 10,
  }),

  dep_id: int('dep_id'),

  ps_id: int('ps_id'),

  status: mysqlEnum('status', ['active', 'inactive'])
    .default('active')
    .notNull(),

  statusLevel: mysqlEnum('status_level', ['user', 'member', 'admin'])
    .default('user')
    .notNull(),

  system_id: int('system_id').default(1),

  mustChangePassword: boolean('must_change_password').default(true).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),

  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
