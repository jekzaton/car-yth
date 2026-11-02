import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/mysql-core';

import { db } from '@/db';

import { car_booking } from '@/db/schema/car_booking';
import { typeCar } from '@/db/schema/type_car';
import { cars } from '@/db/schema/cars';
import { users } from '@/db/schema/users';
import { car_brand } from '@/db/schema/car_brand';
import { departments } from '@/db/schema/departments';

import { AuthError, requireAdminOrMember } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ============================================================
// TABLE ALIAS
// ============================================================

const bookingUser = alias(users, 'booking_user');
const driverUser = alias(users, 'driver_user');

// ============================================================
// FORMAT DATE
// ============================================================

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

// ============================================================
// FORMAT TIME
// ============================================================

function formatTimeOnly(value: unknown): string {
  if (!value) return '';

  const raw = String(value).trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})/);

  if (!match) return '';

  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

// ============================================================
// FORMAT FULL NAME
// ============================================================

function formatFullName(
  prefix?: string | null,
  firstName?: string | null,
  lastName?: string | null,
): string | null {
  const name = [prefix, firstName, lastName]
    .filter(
      (value): value is string =>
        typeof value === 'string' && value.trim().length > 0,
    )
    .map((value) => value.trim())
    .join(' ');

  return name || null;
}

// ============================================================
// GET /api/car-bookings/list
// ============================================================

export async function GET(request: Request) {
  try {
    // ตรวจสอบสิทธิ์ admin / member
    await requireAdminOrMember(request);

    // ========================================================
    // QUERY
    // ========================================================

    const result = await db
      .select({
        // BOOKING
        bookingId: car_booking.bookingId,
        userCode: car_booking.userCode,

        // CAR
        carCode: car_booking.carCode,
        carBrandId: cars.car_brand_id,
        carBrand: car_brand.car_brand_name,
        licensePlate: cars.license_plate,
        carImage: cars.car_image,

        // CAR TYPE
        typeCarId: car_booking.typeCar,
        typeName: typeCar.typeName,

        // DATE / TIME
        startDate: car_booking.startDate,
        startTime: car_booking.startTime,
        endDate: car_booking.endDate,
        endTime: car_booking.endTime,

        // BOOKING DETAILS
        levelStatus: car_booking.levelStatus,
        subject: car_booking.subject,
        description: car_booking.description,
        countPeople: car_booking.countPeople,
        listPeople: car_booking.listPeople,
        telDep: car_booking.telDep,
        phone: car_booking.phone,
        status: car_booking.status,

        // BOOKING USER
        bookingPrefix: bookingUser.prefix,
        bookingFirstName: bookingUser.first_name,
        bookingLastName: bookingUser.last_name,
        depId: bookingUser.dep_id,

        // DEPARTMENT
        departmentName: departments.dep_name,
        departmentPhone: departments.dep_phone,

        // DRIVER
        cUCode: car_booking.cUCode,
        driverPrefix: driverUser.prefix,
        driverFirstName: driverUser.first_name,
        driverLastName: driverUser.last_name,
        driverPhone: driverUser.phone,

        // TIMESTAMP
        createdAt: car_booking.createdAt,
      })
      .from(car_booking)

      // CAR
      .leftJoin(cars, eq(cars.car_code, car_booking.carCode))

      // CAR BRAND
      .leftJoin(car_brand, eq(car_brand.car_brand_id, cars.car_brand_id))

      // BOOKING USER
      .leftJoin(bookingUser, eq(bookingUser.user_code, car_booking.userCode))

      // DEPARTMENT
      .leftJoin(departments, eq(departments.dep_id, bookingUser.dep_id))

      // DRIVER
      .leftJoin(driverUser, eq(driverUser.user_code, car_booking.cUCode))

      // CAR TYPE
      .leftJoin(typeCar, eq(typeCar.typeCarId, car_booking.typeCar))

      .orderBy(desc(car_booking.createdAt), desc(car_booking.bookingId));

    // ========================================================
    // MAP RESPONSE
    // ========================================================

    const data = result.map((item) => {
      const bookingName = formatFullName(
        item.bookingPrefix,
        item.bookingFirstName,
        item.bookingLastName,
      );

      const driverName = formatFullName(
        item.driverPrefix,
        item.driverFirstName,
        item.driverLastName,
      );

      return {
        // BOOKING
        bookingId: item.bookingId,

        // BOOKER
        userCode: item.userCode,
        bookingName: bookingName || 'ไม่ระบุ',

        // DEPARTMENT
        depId: item.depId,
        departmentName: item.departmentName,
        departmentPhone: item.departmentPhone,

        // CAR
        carCode: item.carCode,

        carBrandSub: null,
        carBrandId: item.carBrandId,
        carBrand: item.carBrand,
        licensePlate: item.licensePlate,
        carImage: item.carImage,

        // CAR TYPE
        typeCarId: item.typeCarId,
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

        // DRIVER
        cUCode: item.cUCode,
        driverName,
        driverPhone: item.driverPhone,

        // TIMESTAMP
        createdAt: item.createdAt,
      };
    });

    // ========================================================
    // RESPONSE
    // ========================================================

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
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          data: [],
        },
        { status: error.status },
      );
    }

    console.error('GET /api/car-bookings/list error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดรายการจองรถได้',
        data: [],
      },
      { status: 500 },
    );
  }
}
