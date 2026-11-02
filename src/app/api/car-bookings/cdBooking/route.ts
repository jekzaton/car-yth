import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';

import { db } from '@/db';

import { car_booking } from '@/db/schema/car_booking';
import { typeCar } from '@/db/schema/type_car';
import { cars } from '@/db/schema/cars';
import { users } from '@/db/schema/users';
import { car_brand } from '@/db/schema/car_brand';
import { departments } from '@/db/schema/departments';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatDateOnly(value: unknown): string {
  if (!value) return '';

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const raw = String(value).trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  return '';
}

function formatTimeOnly(value: unknown): string {
  if (!value) return '';

  const raw = String(value).trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);

  if (!match) return '';

  const hour = String(Number(match[1])).padStart(2, '0');
  const minute = match[2];
  const second = match[3] ?? '00';

  return `${hour}:${minute}:${second}`;
}

function formatFullName(
  prefix?: string | null,
  firstName?: string | null,
  lastName?: string | null,
): string {
  const fullName = [prefix, firstName, lastName]
    .filter(
      (value): value is string =>
        typeof value === 'string' && value.trim().length > 0,
    )
    .map((value) => value.trim())
    .join(' ');

  return fullName || 'ไม่ระบุ';
}

// ============================================================
// GET /api/car-bookings/cdBooking
// ============================================================

export async function GET() {
  try {
    const result = await db
      .select({
        bookingId: car_booking.bookingId,
        userCode: car_booking.userCode,

        carCode: car_booking.carCode,
        carBrandId: cars.car_brand_id,
        carBrand: car_brand.car_brand_name,
        licensePlate: cars.license_plate,
        carImage: cars.car_image,

        typeCarId: car_booking.typeCar,
        typeName: typeCar.typeName,

        startDate: car_booking.startDate,
        startTime: car_booking.startTime,
        endDate: car_booking.endDate,
        endTime: car_booking.endTime,

        levelStatus: car_booking.levelStatus,
        subject: car_booking.subject,
        description: car_booking.description,
        countPeople: car_booking.countPeople,
        listPeople: car_booking.listPeople,
        telDep: car_booking.telDep,
        phone: car_booking.phone,
        status: car_booking.status,

        prefix: users.prefix,
        firstName: users.first_name,
        lastName: users.last_name,
        depId: users.dep_id,

        departmentName: departments.dep_name,
        departmentPhone: departments.dep_phone,

        createdAt: car_booking.createdAt,
      })

      .from(car_booking)

      // CAR
      .leftJoin(cars, eq(cars.car_code, car_booking.carCode))

      // CAR BRAND
      .leftJoin(car_brand, eq(car_brand.car_brand_id, cars.car_brand_id))

      // BOOKING USER
      .leftJoin(users, eq(users.user_code, car_booking.userCode))

      // DEPARTMENT OF BOOKING USER
      .leftJoin(departments, eq(departments.dep_id, users.dep_id))

      // CAR TYPE
      .leftJoin(typeCar, eq(typeCar.typeCarId, car_booking.typeCar))

      // CALENDAR: APPROVED ONLY
      .where(eq(car_booking.status, 'approved'))

      .orderBy(desc(car_booking.startDate), desc(car_booking.bookingId));

    const data = result.map((item) => {
      const bookingName = formatFullName(
        item.prefix,
        item.firstName,
        item.lastName,
      );

      return {
        // BOOKING
        bookingId: item.bookingId,

        // BOOKING USER
        userCode: item.userCode,
        bookingName,

        // DEPARTMENT
        depId: item.depId,
        departmentName: item.departmentName ?? null,
        departmentPhone: item.departmentPhone ?? null,

        // CAR
        carCode: item.carCode,
        carBrandSub: null,
        carBrandId: item.carBrandId,
        carBrand: item.carBrand,
        licensePlate: item.licensePlate,
        carImage: item.carImage,

        // CAR TYPE
        typeCar: Number(item.typeCarId ?? 0),
        typeCarId: Number(item.typeCarId ?? 0),
        typeName: item.typeName ?? 'ไม่ระบุประเภท',

        // DATE / TIME
        startDate: formatDateOnly(item.startDate),
        startTime: formatTimeOnly(item.startTime),
        endDate: formatDateOnly(item.endDate),
        endTime: formatTimeOnly(item.endTime),

        // BOOKING DETAILS
        levelStatus: item.levelStatus,
        subject: item.subject,
        destination: item.description,
        countPeople: item.countPeople,
        listPeople: item.listPeople,
        telDep: item.telDep,
        phone: item.phone,
        status: item.status,

        // TIMESTAMP
        createdAt: item.createdAt,
      };
    });

    return NextResponse.json(
      {
        success: true,
        total: data.length,
        data,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      },
    );
  } catch (error: unknown) {
    console.error('========== CD BOOKING API ERROR ==========');
    console.error(error);

    const cause = error instanceof Error ? error.cause : undefined;

    const mysqlError =
      cause && typeof cause === 'object'
        ? (cause as {
            code?: string;
            errno?: number;
            sqlMessage?: string;
            message?: string;
          })
        : null;

    const message = error instanceof Error ? error.message : String(error);

    console.error('ERROR MESSAGE:', message);
    console.error('MYSQL CODE:', mysqlError?.code);
    console.error('MYSQL MESSAGE:', mysqlError?.sqlMessage);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดข้อมูลปฏิทินการจองรถได้',
        data: [],
        ...(process.env.NODE_ENV === 'development'
          ? {
              error: message,
              mysqlCode: mysqlError?.code ?? null,
              mysqlError: mysqlError?.sqlMessage ?? mysqlError?.message ?? null,
            }
          : {}),
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  }
}
