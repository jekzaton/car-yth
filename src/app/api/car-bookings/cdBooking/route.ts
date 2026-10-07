import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';

import { db } from '@/db';

import { car_booking } from '@/db/schema/car_booking';
import { typeCar } from '@/db/schema/type_car';
import { cars } from '@/db/schema/cars';
import { users } from '@/db/schema/users';
import { car_brand } from '@/db/schema/car_brand';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  const match = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);

  if (!match) return '';

  const hour = String(Number(match[1])).padStart(2, '0');

  const minute = match[2];
  const second = match[3] ?? '00';

  return `${hour}:${minute}:${second}`;
}

// ============================================================
// GET
// GET /api/car-bookings/cdBooking
// ============================================================

export async function GET() {
  try {
    const result = await db
      .select({
        // ====================================================
        // BOOKING
        // ====================================================

        bookingId: car_booking.bookingId,

        userCode: car_booking.userCode,

        // ====================================================
        // CAR
        // ====================================================

        carCode: car_booking.carCode,

        carBrandSub: cars.car_brand_sub,

        carBrandId: cars.car_brand_id,

        // ชื่อยี่ห้อรถจากตาราง car_brand
        carBrand: car_brand.car_brand_name,

        licensePlate: cars.license_plate,

        carImage: cars.car_image,

        // ====================================================
        // CAR TYPE
        // ====================================================

        typeCarId: car_booking.typeCar,

        typeName: typeCar.typeName,

        // ====================================================
        // DATE / TIME
        // ====================================================

        startDate: car_booking.startDate,
        startTime: car_booking.startTime,

        endDate: car_booking.endDate,
        endTime: car_booking.endTime,

        // ====================================================
        // DETAIL
        // ====================================================

        levelStatus: car_booking.levelStatus,

        subject: car_booking.subject,

        description: car_booking.description,

        countPeople: car_booking.countPeople,

        listPeople: car_booking.listPeople,

        telDep: car_booking.telDep,

        phone: car_booking.phone,

        status: car_booking.status,

        // ====================================================
        // BOOKING USER
        // ====================================================

        prefix: users.prefix,

        firstName: users.first_name,

        lastName: users.last_name,

        // ====================================================
        // CREATED
        // ====================================================

        createdAt: car_booking.createdAt,
      })

      .from(car_booking)

      // ======================================================
      // CAR
      // ======================================================

      .leftJoin(cars, eq(cars.car_code, car_booking.carCode))

      // ======================================================
      // CAR BRAND
      // ======================================================

      .leftJoin(car_brand, eq(car_brand.car_brand_id, cars.car_brand_id))

      // ======================================================
      // BOOKING USER
      // ใช้ userCode ไม่ใช่ cid
      // ======================================================

      .leftJoin(users, eq(users.user_code, car_booking.userCode))

      // ======================================================
      // CAR TYPE
      // ======================================================

      .leftJoin(typeCar, eq(typeCar.typeCarId, car_booking.typeCar))

      // ======================================================
      // APPROVED ONLY
      // Calendar แสดงเฉพาะรายการอนุมัติแล้ว
      // ======================================================

      .where(eq(car_booking.status, 'approved'))

      .orderBy(desc(car_booking.startDate));

    // ========================================================
    // MAP RESPONSE
    // ========================================================

    const data = result.map((item) => ({
      bookingId: item.bookingId,

      // ======================================================
      // BOOKING USER
      // ======================================================

      userCode: item.userCode,

      bookingName:
        [item.prefix, item.firstName, item.lastName]
          .filter(Boolean)
          .join(' ') || 'ไม่ระบุ',

      // ======================================================
      // CAR
      // ======================================================

      carCode: item.carCode,

      carBrandSub: item.carBrandSub,

      carBrandId: item.carBrandId,

      carBrand: item.carBrand,

      licensePlate: item.licensePlate,

      carImage: item.carImage,

      // ======================================================
      // CAR TYPE
      // ======================================================

      typeCar: Number(item.typeCarId ?? 0),

      typeCarId: Number(item.typeCarId ?? 0),

      typeName: item.typeName ?? 'ไม่ระบุประเภท',

      // ======================================================
      // DATE / TIME
      // ======================================================

      startDate: formatDateOnly(item.startDate),

      startTime: formatTimeOnly(item.startTime),

      endDate: formatDateOnly(item.endDate),

      endTime: formatTimeOnly(item.endTime),

      // ======================================================
      // BOOKING DETAIL
      // ======================================================

      levelStatus: item.levelStatus,

      subject: item.subject,

      destination: item.description,

      countPeople: item.countPeople,

      listPeople: item.listPeople,

      telDep: item.telDep,

      phone: item.phone,

      status: item.status,
    }));

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
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      },
    );
  } catch (error) {
    console.error('GET /api/car-bookings/cdBooking error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดข้อมูลปฏิทินการจองรถได้',
        data: [],
      },
      {
        status: 500,
      },
    );
  }
}
