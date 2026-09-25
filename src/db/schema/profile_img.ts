import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const profile_img = mysqlTable('profile_img', {
  id: int('id').autoincrement().primaryKey().notNull(),

  cid: varchar('cid', {
    length: 13,
  })
    .notNull()
    .unique(),

  images: varchar('images', {
    length: 500,
  }).notNull(),
});

export type ProfileImage = typeof profile_img.$inferSelect;
export type NewProfileImage = typeof profile_img.$inferInsert;
