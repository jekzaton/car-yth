import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { car_booking } from '@/db/schema/car_booking';
import { typeCar } from '@/db/schema/type_car';
import { cars, users } from '@/db/schema';

type RouteContext = {
  params: Promise<{
    bookingId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
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

    const result = await db
      .select({
        bookingId: car_booking.bookingId,

        userCode: car_booking.userCode,

        prefix: users.prefix,
        firstName: users.first_name,
        lastName: users.last_name,

        carCode: car_booking.carCode,
        carName: cars.car_name,
        carBrand: cars.car_brand,
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

        cUCode: car_booking.cUCode,

        createdAt: car_booking.createdAt,
        updatedAt: car_booking.updatedAt,
      })
      .from(car_booking)

      .leftJoin(cars, eq(cars.car_code, car_booking.carCode))

      .leftJoin(users, eq(users.user_code, car_booking.userCode))

      .leftJoin(typeCar, eq(typeCar.typeCarId, car_booking.typeCar))

      .where(eq(car_booking.bookingId, id))

      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบรายการจองรถ',
        },
        { status: 404 },
      );
    }

    const item = result[0];

    const bookingName = [item.prefix, item.firstName, item.lastName]
      .filter(Boolean)
      .join(' ');

    return NextResponse.json({
      success: true,

      data: {
        ...item,

        bookingName,

        destination: item.description,
      },
    });
  } catch (error) {
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
