import { db } from '@/db';
import { cars } from '@/db/schema';
import { car_booking } from '@/db/schema/car_booking';
import { NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// =========================
// CONVERT DATE + TIME
// =========================
function createDateTime(date: unknown, time: unknown) {
  const dateValue =
    date instanceof Date
      ? date.toISOString().slice(0, 10)
      : String(date ?? '').slice(0, 10);

  const timeValue = String(time ?? '').slice(0, 8);

  const value = new Date(`${dateValue}T${timeValue}`);

  return value;
}

// =========================
// GET AVAILABLE CARS
// =========================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get('startDate');
    const startTime = searchParams.get('startTime');

    const endDate = searchParams.get('endDate');
    const endTime = searchParams.get('endTime');

    // ================= VALIDATE =================
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

    // ================= REQUEST DATETIME =================
    const requestStart = createDateTime(startDate, startTime);

    const requestEnd = createDateTime(endDate, endTime);

    if (
      Number.isNaN(requestStart.getTime()) ||
      Number.isNaN(requestEnd.getTime())
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

    // ========================================
    // GET ACTIVE CARS
    // ========================================
    const allCars = await db
      .select()
      .from(cars)
      .where(eq(cars.status, 'active'));

    if (allCars.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'ไม่พบรถที่เปิดใช้งานในระบบ',
        data: [],
        meta: {
          totalCars: 0,
          busyCars: 0,
          availableCars: 0,
        },
      });
    }

    // ========================================
    // GET ACTIVE BOOKINGS
    //
    // pending  = รออนุมัติ
    // approved = อนุมัติแล้ว
    //
    // cancelled ไม่ต้องนำมาคำนวณ
    // ========================================
    const bookings = await db
      .select({
        bookingId: car_booking.bookingId,
        carCode: car_booking.carCode,

        startDate: car_booking.startDate,
        startTime: car_booking.startTime,

        endDate: car_booking.endDate,
        endTime: car_booking.endTime,

        status: car_booking.status,
      })
      .from(car_booking)
      .where(inArray(car_booking.status, ['pending', 'approved']));

    // ========================================
    // FIND BUSY CARS
    // ========================================
    const busyCarCodes = new Set<string>();

    for (const booking of bookings) {
      if (!booking.carCode) {
        continue;
      }

      const bookingStart = createDateTime(booking.startDate, booking.startTime);

      const bookingEnd = createDateTime(booking.endDate, booking.endTime);

      if (
        Number.isNaN(bookingStart.getTime()) ||
        Number.isNaN(bookingEnd.getTime())
      ) {
        console.warn(
          `Invalid booking datetime: bookingId=${booking.bookingId}`,
        );

        continue;
      }

      /*
       * เวลา overlap เมื่อ:
       *
       * เวลาที่ขอเริ่ม < booking เดิมสิ้นสุด
       * &&
       * เวลาที่ขอสิ้นสุด > booking เดิมเริ่ม
       *
       * ตัวอย่าง:
       *
       * Booking เดิม:
       * 08:00 - 12:00
       *
       * 09:00 - 10:00 = ชน ❌
       * 11:30 - 13:00 = ชน ❌
       * 07:00 - 09:00 = ชน ❌
       *
       * 12:00 - 14:00 = ไม่ชน ✅
       * 06:00 - 08:00 = ไม่ชน ✅
       */
      const overlap = requestStart < bookingEnd && requestEnd > bookingStart;

      if (overlap) {
        busyCarCodes.add(booking.carCode);
      }
    }

    // ========================================
    // AVAILABLE CARS
    // ========================================
    const availableCars = allCars.filter(
      (car) => !busyCarCodes.has(car.car_code),
    );

    // ========================================
    // RESPONSE
    // ========================================
    const data = availableCars.map((car) => ({
      id: car.id,
      carCode: car.car_code,
      carName: car.car_name,
      carBrand: car.car_brand,
      licensePlate: car.license_plate,
      carImage: car.car_image,
      status: car.status,
    }));

    return NextResponse.json(
      {
        success: true,

        message:
          data.length > 0
            ? `พบรถว่าง ${data.length} คัน`
            : 'ไม่พบรถว่างในช่วงเวลาที่เลือก',

        data,

        meta: {
          totalCars: allCars.length,
          busyCars: busyCarCodes.size,
          availableCars: data.length,

          requestedPeriod: {
            startDate,
            startTime,
            endDate,
            endTime,
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
  } catch (error) {
    console.error('GET car-calendar-day error:', error);

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
