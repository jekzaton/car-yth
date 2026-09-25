import {
  date,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  time,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

export const car_booking = mysqlTable('car_booking', {
  bookingId: int('booking_id').autoincrement().primaryKey(),
  carCode: varchar('car_code', { length: 255 }).notNull(),
  // ผู้จอง
  userCode: varchar('user_code', { length: 5 }).notNull(),
  startDate: date('start_date').notNull(),
  startTime: time('start_time').notNull(),
  endDate: date('end_date').notNull(),
  endTime: time('end_time').notNull(),
  levelStatus: varchar('level_status', { length: 255 }).notNull(),
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  countPeople: int('count_people').default(1).notNull(),
  listPeople: text('list_people'),
  typeCar: int('type_car').default(1).notNull(),
  status: mysqlEnum('status', [
    'pending', // รอดำเนินการ
    'approved', // อนุมัติ / ดำเนินการ
    'cancelled', // ยกเลิก
  ])
    .default('pending')
    .notNull(),
  telDep: varchar('tel_dep', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 10 }),
  // คนขับรถ
  cUCode: varchar('c_u_code', { length: 5 }).default('').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),

  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
