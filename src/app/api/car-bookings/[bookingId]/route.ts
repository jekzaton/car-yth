import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/mysql-core';

import { db } from '@/db';
import { car_booking } from '@/db/schema/car_booking';
import { typeCar } from '@/db/schema/type_car';
import { departments } from '@/db/schema/departments';
import { car_brand, cars, users } from '@/db/schema';
import { AuthError, requireAuth } from '@/lib/auth';

type RouteContext = {
  params: Promise<{
    bookingId: string;
  }>;
};

// Alias สำหรับคนขับรถ
// ส่วนผู้จองใช้ตาราง users ปกติ
const driverUser = alias(users, 'driver_user');

function getFullName(...parts: Array<string | null | undefined>): string {
  return parts
    .filter(
      (part): part is string =>
        typeof part === 'string' && part.trim().length > 0,
    )
    .map((part) => part.trim())
    .join(' ');
}

export async function GET(request: Request, context: RouteContext) {
  try {
    // AUTH
    await requireAuth(request);

    // BOOKING ID
    const { bookingId } = await context.params;
    const id = Number(bookingId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสการจองไม่ถูกต้อง',
        },
        { status: 400 },
      );
    }

    // GET BOOKING
    const [item] = await db
      .select({
        // BOOKING
        bookingId: car_booking.bookingId,
        userCode: car_booking.userCode,

        // BOOKING USER
        prefix: users.prefix,
        firstName: users.first_name,
        lastName: users.last_name,

        // DEPARTMENT
        depId: users.dep_id,
        departmentName: departments.dep_name,
        departmentPhone: departments.dep_phone,

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

        // PRIORITY
        levelStatus: car_booking.levelStatus,

        // TRAVEL
        subject: car_booking.subject,
        description: car_booking.description,

        // PASSENGERS
        countPeople: car_booking.countPeople,
        listPeople: car_booking.listPeople,

        // CONTACT
        telDep: car_booking.telDep,
        phone: car_booking.phone,

        // STATUS
        status: car_booking.status,

        // DRIVER
        cUCode: car_booking.cUCode,
        driverPrefix: driverUser.prefix,
        driverFirstName: driverUser.first_name,
        driverLastName: driverUser.last_name,
        driverPhone: driverUser.phone,

        // TIMESTAMPS
        createdAt: car_booking.createdAt,
        updatedAt: car_booking.updatedAt,
      })
      .from(car_booking)

      // CAR
      .leftJoin(cars, eq(cars.car_code, car_booking.carCode))

      // CAR BRAND
      .leftJoin(car_brand, eq(car_brand.car_brand_id, cars.car_brand_id))

      // BOOKING USER
      .leftJoin(users, eq(users.user_code, car_booking.userCode))

      // BOOKING DEPARTMENT
      .leftJoin(departments, eq(departments.dep_id, users.dep_id))

      // DRIVER USER
      .leftJoin(driverUser, eq(driverUser.user_code, car_booking.cUCode))

      // CAR TYPE
      .leftJoin(typeCar, eq(typeCar.typeCarId, car_booking.typeCar))

      .where(eq(car_booking.bookingId, id))
      .limit(1);

    // NOT FOUND
    if (!item) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบรายการจองรถ',
        },
        { status: 404 },
      );
    }

    // BOOKING NAME
    const bookingName =
      getFullName(item.prefix, item.firstName, item.lastName) || item.userCode;

    // DRIVER NAME
    const driverName =
      getFullName(
        item.driverPrefix,
        item.driverFirstName,
        item.driverLastName,
      ) || null;

    // RESPONSE
    return NextResponse.json(
      {
        success: true,
        data: {
          ...item,

          // Compatibility กับ Frontend เดิม
          // รอเปลี่ยนเป็นคอลัมน์รุ่นรถที่ถูกต้อง
          carBrandSub: null,

          bookingName,

          // DEPARTMENT
          departmentName: item.departmentName ?? null,
          departmentPhone: item.departmentPhone ?? null,

          // DRIVER
          driverName,
          driverPhone: item.driverPhone ?? null,

          // FRONTEND FIELD
          destination: item.description,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: error.status,
        },
      );
    }

    console.error('GET /api/car-bookings/[bookingId] error:', error);

    const cause = error instanceof Error ? error.cause : undefined;

    const mysqlError =
      cause && typeof cause === 'object'
        ? (cause as {
            code?: string;
            sqlMessage?: string;
            message?: string;
          })
        : null;

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดรายละเอียดการจองได้',

        ...(process.env.NODE_ENV === 'development'
          ? {
              error: error instanceof Error ? error.message : String(error),
              mysqlCode: mysqlError?.code ?? null,
              mysqlError: mysqlError?.sqlMessage ?? mysqlError?.message ?? null,
            }
          : {}),
      },
      {
        status: 500,
      },
    );
  }
}
