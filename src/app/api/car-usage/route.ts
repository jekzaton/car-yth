import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';

import { db } from '@/db';
import {
  car_booking,
  car_usage,
  cars,
  departments,
  users,
  car_brand,
} from '@/db/schema';
import { alias } from 'drizzle-orm/mysql-core';

// แยก users ออกเป็น 2 บทบาท
const booker = alias(users, 'booker');
const driver = alias(users, 'driver');

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const result = await db
      .select({
        // ==========================================
        // BOOKING
        // ==========================================
        bookingId: car_booking.bookingId,

        carCode: car_booking.carCode,

        userCode: car_booking.userCode,

        driverCode: car_booking.cUCode,

        startDate: car_booking.startDate,
        startTime: car_booking.startTime,

        endDate: car_booking.endDate,
        endTime: car_booking.endTime,

        subject: car_booking.subject,

        destination: car_booking.description,

        status: car_booking.status,

        // ==========================================
        // ผู้จอง
        // ==========================================
        userPrefix: booker.prefix,

        userFirstName: booker.first_name,

        userLastName: booker.last_name,

        // ==========================================
        // รถ
        // ==========================================
        carName: cars.car_name,

        carBrandId: cars.car_brand_id,

        // ใช้ชื่อยี่ห้อจากตาราง car_brand
        carBrand: car_brand.car_brand_name,

        licensePlate: cars.license_plate,

        carImage: cars.car_image,

        // ==========================================
        // คนขับ
        // ==========================================
        driverPrefix: driver.prefix,

        driverFirstName: driver.first_name,

        driverLastName: driver.last_name,

        // ==========================================
        // หน่วยงานของผู้จอง
        // ==========================================
        departmentName: departments.dep_name,

        // ==========================================
        // USAGE
        // ==========================================
        usageId: car_usage.id,

        dateGo: car_usage.date_go,

        dateBack: car_usage.date_back,

        kmGo: car_usage.km_go,

        kmBack: car_usage.km_back,
      })

      .from(car_booking)

      // ==========================================
      // รถ
      // ==========================================
      .leftJoin(cars, eq(cars.car_code, car_booking.carCode))

      // ==========================================
      // ยี่ห้อรถ
      // cars.car_brand_id -> car_brand.car_brand_id
      // ==========================================
      .leftJoin(car_brand, eq(car_brand.car_brand_id, cars.car_brand_id))

      // ==========================================
      // ผู้จอง
      // ==========================================
      .leftJoin(booker, eq(booker.user_code, car_booking.userCode))

      // ==========================================
      // หน่วยงานของผู้จอง
      // ==========================================
      .leftJoin(departments, eq(departments.dep_id, booker.dep_id))

      // ==========================================
      // คนขับ
      // ==========================================
      .leftJoin(driver, eq(driver.user_code, car_booking.cUCode))

      // ==========================================
      // ข้อมูลการใช้งาน
      // ==========================================
      .leftJoin(car_usage, eq(car_usage.booking_id, car_booking.bookingId))

      // ==========================================
      // เฉพาะรายการอนุมัติ
      // ==========================================
      .where(eq(car_booking.status, 'approved'))

      .orderBy(desc(car_booking.startDate), desc(car_booking.startTime));

    // ==========================================
    // FORMAT RESPONSE
    // ==========================================
    const data = result.map((item) => {
      const userName = [item.userPrefix, item.userFirstName, item.userLastName]
        .filter(Boolean)
        .join(' ');

      const driverName = [
        item.driverPrefix,
        item.driverFirstName,
        item.driverLastName,
      ]
        .filter(Boolean)
        .join(' ');

      return {
        bookingId: item.bookingId,

        usageId: item.usageId,

        // ========================================
        // รถ
        // ========================================
        carCode: item.carCode,

        carName: item.carName,

        carBrandId: item.carBrandId,

        carBrand: item.carBrand,

        licensePlate: item.licensePlate,

        carImage: item.carImage,

        // ========================================
        // ผู้จอง
        // ========================================
        userCode: item.userCode,

        userName: userName || null,

        // ========================================
        // คนขับ
        // ========================================
        driverCode: item.driverCode,

        driverName: driverName || null,

        // ========================================
        // หน่วยงาน
        // ========================================
        departmentName: item.departmentName ?? null,

        // ========================================
        // BOOKING
        // ========================================
        startDate: item.startDate,

        startTime: item.startTime,

        endDate: item.endDate,

        endTime: item.endTime,

        subject: item.subject,

        destination: item.destination,

        status: item.status,

        // ========================================
        // USAGE
        // ========================================
        dateGo: item.dateGo,

        dateBack: item.dateBack,

        kmGo: item.kmGo ?? 0,

        kmBack: item.kmBack ?? 0,

        hasUsage: item.usageId !== null,
      };
    });

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
    console.error('GET /api/car-usage error:', error);

    return NextResponse.json(
      {
        success: false,

        message: 'ไม่สามารถโหลดรายการใช้งานรถได้',

        data: [],
      },
      {
        status: 500,
      },
    );
  }
}

// =====================================================
// POST
// สร้างข้อมูลการใช้งานรถ
// =====================================================

type CreateUsageBody = {
  bookingId?: unknown;

  dateGo?: unknown;
  dateBack?: unknown;

  kmGo?: unknown;
  kmBack?: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateUsageBody;

    // =====================================================
    // VALIDATE BOOKING ID
    // =====================================================

    const bookingId = Number(body.bookingId);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
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

    // =====================================================
    // GET BOOKING
    // =====================================================

    const bookingResult = await db
      .select({
        bookingId: car_booking.bookingId,

        carCode: car_booking.carCode,

        driverCode: car_booking.cUCode,

        status: car_booking.status,
      })
      .from(car_booking)
      .where(eq(car_booking.bookingId, bookingId))
      .limit(1);

    if (bookingResult.length === 0) {
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

    const booking = bookingResult[0];

    // =====================================================
    // ต้อง approved ก่อน
    // =====================================================

    if (booking.status !== 'approved') {
      return NextResponse.json(
        {
          success: false,
          message: 'รายการจองนี้ยังไม่ได้รับอนุมัติ',
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // ต้องมีรถ
    // =====================================================

    if (!booking.carCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'รายการจองนี้ไม่มีข้อมูลรถ',
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // ต้องมีคนขับ
    // =====================================================

    if (!booking.driverCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาเลือกพนักงานขับรถก่อนลงรายละเอียด',
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // ป้องกัน booking เดียวมี usage ซ้ำ
    // =====================================================

    const existingUsage = await db
      .select({
        id: car_usage.id,
      })
      .from(car_usage)
      .where(eq(car_usage.booking_id, bookingId))
      .limit(1);

    if (existingUsage.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'รายการจองนี้มีข้อมูลการใช้งานรถแล้ว',
        },
        {
          status: 409,
        },
      );
    }

    // =====================================================
    // DATE
    // =====================================================

    const dateGo =
      typeof body.dateGo === 'string' ? new Date(body.dateGo) : null;

    const dateBack =
      typeof body.dateBack === 'string' ? new Date(body.dateBack) : null;

    if (!dateGo || Number.isNaN(dateGo.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: 'วันเวลาเดินทางไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    if (!dateBack || Number.isNaN(dateBack.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: 'วันเวลากลับไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    if (dateBack.getTime() < dateGo.getTime()) {
      return NextResponse.json(
        {
          success: false,
          message: 'วันเวลากลับต้องไม่น้อยกว่าวันเวลาเดินทาง',
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // KM
    // =====================================================

    const kmGo = Number(body.kmGo);
    const kmBack = Number(body.kmBack);

    if (!Number.isFinite(kmGo) || kmGo < 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'เลขไมล์เริ่มไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    if (!Number.isFinite(kmBack) || kmBack < 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'เลขไมล์กลับไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    if (kmBack < kmGo) {
      return NextResponse.json(
        {
          success: false,
          message: 'เลขไมล์กลับต้องไม่น้อยกว่าเลขไมล์เริ่ม',
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // INSERT
    // =====================================================

    const insertResult = await db.insert(car_usage).values({
      booking_id: booking.bookingId,

      car_code: booking.carCode,

      c_u_code: booking.driverCode,

      date_go: dateGo,
      date_back: dateBack,

      km_go: kmGo,
      km_back: kmBack,
    });

    return NextResponse.json(
      {
        success: true,

        message: 'บันทึกข้อมูลการใช้งานรถเรียบร้อยแล้ว',

        data: {
          id: insertResult[0].insertId,

          bookingId: booking.bookingId,

          carCode: booking.carCode,

          driverCode: booking.driverCode,

          dateGo,
          dateBack,

          kmGo,
          kmBack,

          totalKm: Math.max(0, kmBack - kmGo),
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error('POST /api/car-usage error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถบันทึกข้อมูลการใช้งานรถได้',
      },
      {
        status: 500,
      },
    );
  }
}
