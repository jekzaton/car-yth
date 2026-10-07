import { NextResponse } from 'next/server';
import { and, eq, inArray, sql } from 'drizzle-orm';

import { db } from '@/db';
import { car_brand, cars } from '@/db/schema';
import { car_booking } from '@/db/schema/car_booking';
import { AuthError, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// =========================================================
// TYPES
// =========================================================

type CarStatus = 'active' | 'inactive';

// =========================================================
// VALIDATE DATE / TIME
// =========================================================

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value);
}

function normalizeTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

function createDateTime(date: string, time: string): Date | null {
  if (!isValidDate(date) || !isValidTime(time)) {
    return null;
  }

  const [year, month, day] = date.split('-').map(Number);

  const normalizedTime = normalizeTime(time);

  const [hour, minute, second] = normalizedTime.split(':').map(Number);

  const result = new Date(year, month - 1, day, hour, minute, second, 0);

  if (Number.isNaN(result.getTime())) {
    return null;
  }

  return result;
}

// =========================================================
// GET AVAILABLE CARS
// =========================================================

export async function GET(request: Request) {
  try {
    // =====================================================
    // AUTH
    // user / member / admin ใช้งานได้
    // =====================================================

    await requireAuth(request);

    // =====================================================
    // QUERY PARAMS
    // =====================================================

    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('startDate')?.trim() ?? '';
    const startTime = searchParams.get('startTime')?.trim() ?? '';

    const endDate = searchParams.get('endDate')?.trim() ?? '';
    const endTime = searchParams.get('endTime')?.trim() ?? '';

    // =====================================================
    // REQUIRED
    // =====================================================

    if (!startDate || !startTime || !endDate || !endTime) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุวันและเวลาให้ครบถ้วน',
          data: [],
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // VALIDATE FORMAT
    // =====================================================

    if (
      !isValidDate(startDate) ||
      !isValidTime(startTime) ||
      !isValidDate(endDate) ||
      !isValidTime(endTime)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'รูปแบบวันหรือเวลาไม่ถูกต้อง',
          data: [],
        },
        {
          status: 400,
        },
      );
    }

    const normalizedStartTime = normalizeTime(startTime);
    const normalizedEndTime = normalizeTime(endTime);

    const requestStart = createDateTime(startDate, normalizedStartTime);

    const requestEnd = createDateTime(endDate, normalizedEndTime);

    if (!requestStart || !requestEnd) {
      return NextResponse.json(
        {
          success: false,
          message: 'รูปแบบวันหรือเวลาไม่ถูกต้อง',
          data: [],
        },
        {
          status: 400,
        },
      );
    }

    if (requestEnd <= requestStart) {
      return NextResponse.json(
        {
          success: false,
          message: 'วันและเวลาสิ้นสุดต้องมากกว่าวันและเวลาเริ่มต้น',
          data: [],
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // ACTIVE CARS
    // =====================================================

    const allCars = await db
      .select({
        id: cars.id,

        carCode: cars.car_code,
        carBrandSub: cars.car_brand_sub,

        carBrandId: cars.car_brand_id,
        carBrand: car_brand.car_brand_name,

        licensePlate: cars.license_plate,
        carImage: cars.car_image,

        status: cars.status,
      })
      .from(cars)
      .leftJoin(car_brand, eq(car_brand.car_brand_id, cars.car_brand_id))
      .where(eq(cars.status, 'active'));

    if (allCars.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'ไม่พบรถที่เปิดใช้งานในระบบ',
          data: [],

          meta: {
            totalCars: 0,
            busyCars: 0,
            availableCars: 0,

            requestedPeriod: {
              startDate,
              startTime: normalizedStartTime,
              endDate,
              endTime: normalizedEndTime,
            },

            busyCarCodes: [],
          },
        },
        {
          headers: {
            'Cache-Control': 'no-store',
          },
        },
      );
    }

    // =====================================================
    // BUSY CARS
    // =====================================================
    //
    // overlap:
    //
    // existingStart < requestEnd
    // &&
    // existingEnd > requestStart
    //
    // pending / approved เท่านั้น
    // cancelled ไม่นับ
    //
    // 08:00 - 12:00
    // 12:00 - 14:00 = ไม่ชน
    // =====================================================

    const busyBookings = await db
      .select({
        carCode: car_booking.carCode,
      })
      .from(car_booking)
      .where(
        and(
          inArray(car_booking.status, ['pending', 'approved']),

          // booking เดิมเริ่มก่อนเวลาที่ขอสิ้นสุด
          sql`
            TIMESTAMP(
              ${car_booking.startDate},
              ${car_booking.startTime}
            )
            <
            TIMESTAMP(
              ${endDate},
              ${normalizedEndTime}
            )
          `,

          // booking เดิมสิ้นสุดหลังเวลาที่ขอเริ่ม
          sql`
            TIMESTAMP(
              ${car_booking.endDate},
              ${car_booking.endTime}
            )
            >
            TIMESTAMP(
              ${startDate},
              ${normalizedStartTime}
            )
          `,
        ),
      );

    // =====================================================
    // BUSY CAR CODES
    // =====================================================

    const busyCarCodes = new Set<string>();

    for (const booking of busyBookings) {
      if (booking.carCode) {
        busyCarCodes.add(booking.carCode);
      }
    }

    // =====================================================
    // AVAILABLE CARS
    // =====================================================

    const availableCars = allCars.filter(
      (car) => !busyCarCodes.has(car.carCode),
    );

    // =====================================================
    // RESPONSE
    // =====================================================

    const data = availableCars.map((car) => ({
      id: car.id,

      carCode: car.carCode,

      carBrandSub: car.carBrandSub,

      carBrandId: car.carBrandId,
      carBrand: car.carBrand,

      licensePlate: car.licensePlate,
      carImage: car.carImage,

      status: car.status as CarStatus,
    }));

    return NextResponse.json(
      {
        success: true,

        message:
          data.length > 0
            ? `พบรถว่าง ${data.length.toLocaleString('th-TH')} คัน`
            : 'ไม่พบรถว่างในช่วงเวลาที่เลือก',

        data,

        meta: {
          totalCars: allCars.length,
          busyCars: busyCarCodes.size,
          availableCars: data.length,

          requestedPeriod: {
            startDate,
            startTime: normalizedStartTime,

            endDate,
            endTime: normalizedEndTime,
          },

          busyCarCodes: Array.from(busyCarCodes),
        },
      },
      {
        status: 200,

        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      },
    );
  } catch (error: unknown) {
    // =====================================================
    // AUTH
    // =====================================================

    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          data: [],
        },
        {
          status: error.status,
        },
      );
    }

    // =====================================================
    // UNKNOWN
    // =====================================================

    console.error('GET /api/car-bookings/car-calendar-day error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถตรวจสอบรถว่างได้',
        data: [],
      },
      {
        status: 500,
      },
    );
  }
}
