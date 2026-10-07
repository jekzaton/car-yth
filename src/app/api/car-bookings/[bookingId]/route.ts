import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/mysql-core';

import { db } from '@/db';
import { car_booking } from '@/db/schema/car_booking';
import { typeCar } from '@/db/schema/type_car';
import { car_brand, cars, users } from '@/db/schema';
import { AuthError, requireAuth } from '@/lib/auth';

type RouteContext = {
  params: Promise<{
    bookingId: string;
  }>;
};

// USER ALIAS

// ผู้จอง ใช้ users ปกติ
// คนขับรถ ใช้ alias เพื่อให้ join users ได้อีกครั้ง
const driverUser = alias(users, 'driver_user');

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
        {
          status: 400,
        },
      );
    }

    // GET BOOKING

    const [item] = await db
      .select({
        bookingId: car_booking.bookingId,

        // ผู้จอง

        userCode: car_booking.userCode,

        prefix: users.prefix,
        firstName: users.first_name,
        lastName: users.last_name,

        // รถ

        // รถ

        carCode: car_booking.carCode,

        carBrandSub: cars.car_brand_sub,

        carBrandId: cars.car_brand_id,
        carBrand: car_brand.car_brand_name,

        licensePlate: cars.license_plate,
        carImage: cars.car_image,

        // ประเภทรถ

        typeCarId: car_booking.typeCar,
        typeName: typeCar.typeName,

        // วัน / เวลา

        startDate: car_booking.startDate,
        startTime: car_booking.startTime,

        endDate: car_booking.endDate,
        endTime: car_booking.endTime,

        // ระดับความสำคัญ

        levelStatus: car_booking.levelStatus,

        // รายละเอียด

        subject: car_booking.subject,
        description: car_booking.description,

        // ผู้ร่วมเดินทาง

        countPeople: car_booking.countPeople,
        listPeople: car_booking.listPeople,

        // ติดต่อ

        telDep: car_booking.telDep,
        phone: car_booking.phone,

        // สถานะ

        status: car_booking.status,

        // คนขับรถ

        cUCode: car_booking.cUCode,

        driverPrefix: driverUser.prefix,
        driverFirstName: driverUser.first_name,
        driverLastName: driverUser.last_name,

        // ถ้า field เบอร์โทรใน users ชื่อ phone
        driverPhone: driverUser.phone,

        // timestamps

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

      // DRIVER USER
      // cUCode -> users.user_code

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
        {
          status: 404,
        },
      );
    }

    // BOOKING NAME

    const bookingName =
      [item.prefix, item.firstName, item.lastName]
        .filter(
          (value): value is string =>
            typeof value === 'string' && value.trim().length > 0,
        )
        .join(' ') || item.userCode;

    // DRIVER NAME

    const driverName =
      [item.driverPrefix, item.driverFirstName, item.driverLastName]
        .filter(
          (value): value is string =>
            typeof value === 'string' && value.trim().length > 0,
        )
        .join(' ') || null;

    // RESPONSE

    return NextResponse.json({
      success: true,

      data: {
        ...item,

        bookingName,

        // คนขับรถ
        driverName,
        driverPhone: item.driverPhone ?? null,

        // frontend ใช้ destination
        destination: item.description,
      },
    });
  } catch (error: unknown) {
    // AUTH ERROR

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

    // UNKNOWN ERROR

    console.error('GET /api/car-bookings/[bookingId] error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดรายละเอียดการจองได้',
      },
      {
        status: 500,
      },
    );
  }
}
