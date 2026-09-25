import { NextResponse } from 'next/server';
import { and, eq, ne, sql } from 'drizzle-orm';

import { db } from '@/db';
import { car_booking } from '@/db/schema/car_booking';
import { users } from '@/db/schema';

type RouteContext = {
  params: Promise<{
    bookingId: string;
  }>;
};

type UpdateDriverBody = {
  cUCode?: unknown;
};

export async function PATCH(request: Request, context: RouteContext) {
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

    const body = (await request.json()) as UpdateDriverBody;

    const cUCode = typeof body.cUCode === 'string' ? body.cUCode.trim() : '';

    const bookingResult = await db
      .select({
        bookingId: car_booking.bookingId,
        cUCode: car_booking.cUCode,

        startDate: car_booking.startDate,
        startTime: car_booking.startTime,

        endDate: car_booking.endDate,
        endTime: car_booking.endTime,

        status: car_booking.status,
      })
      .from(car_booking)
      .where(eq(car_booking.bookingId, id))
      .limit(1);

    if (bookingResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบรายการจองรถ',
        },
        { status: 404 },
      );
    }

    const currentBooking = bookingResult[0];

    // ยกเลิกคนขับ
    if (!cUCode) {
      await db
        .update(car_booking)
        .set({
          cUCode: '',
        })
        .where(eq(car_booking.bookingId, id));

      return NextResponse.json({
        success: true,
        message: 'ยกเลิกคนขับรถเรียบร้อยแล้ว',
        data: {
          bookingId: id,
          cUCode: '',
          driver: null,
        },
      });
    }

    // ตรวจคนขับ
    const driverResult = await db
      .select({
        id: users.id,
        userCode: users.user_code,

        prefix: users.prefix,
        firstName: users.first_name,
        lastName: users.last_name,

        phone: users.phone,
      })
      .from(users)
      .where(
        and(
          eq(users.user_code, cUCode),
          eq(users.system_id, 2),
          eq(users.status, 'active'),
        ),
      )
      .limit(1);

    if (driverResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลคนขับรถ หรือบัญชีไม่ได้เปิดใช้งาน',
        },
        { status: 404 },
      );
    }

    const selectedDriver = driverResult[0];

    // ตรวจเวลาชน
    const conflictResult = await db
      .select({
        bookingId: car_booking.bookingId,

        startDate: car_booking.startDate,
        startTime: car_booking.startTime,

        endDate: car_booking.endDate,
        endTime: car_booking.endTime,

        subject: car_booking.subject,
        description: car_booking.description,

        status: car_booking.status,
      })
      .from(car_booking)
      .where(
        and(
          eq(car_booking.cUCode, selectedDriver.userCode),

          // ไม่เทียบกับ booking ตัวเอง
          ne(car_booking.bookingId, id),

          // cancelled ไม่นับ
          ne(car_booking.status, 'cancelled'),

          // booking เดิมเริ่มก่อน booking ใหม่จบ
          sql`
            TIMESTAMP(
              ${car_booking.startDate},
              ${car_booking.startTime}
            )
            <
            TIMESTAMP(
              ${currentBooking.endDate},
              ${currentBooking.endTime}
            )
          `,

          // booking เดิมจบหลัง booking ใหม่เริ่ม
          sql`
            TIMESTAMP(
              ${car_booking.endDate},
              ${car_booking.endTime}
            )
            >
            TIMESTAMP(
              ${currentBooking.startDate},
              ${currentBooking.startTime}
            )
          `,
        ),
      )
      .limit(1);

    if (conflictResult.length > 0) {
      const conflict = conflictResult[0];

      const driverName = [
        selectedDriver.prefix,
        selectedDriver.firstName,
        selectedDriver.lastName,
      ]
        .filter(Boolean)
        .join(' ');

      return NextResponse.json(
        {
          success: false,
          code: 'DRIVER_TIME_CONFLICT',

          message: `${driverName} มีรายการเดินทางในช่วงเวลานี้แล้ว`,

          conflict: {
            bookingId: conflict.bookingId,

            startDate: conflict.startDate,
            startTime: conflict.startTime,

            endDate: conflict.endDate,
            endTime: conflict.endTime,

            subject: conflict.subject,
            destination: conflict.description,
          },
        },
        { status: 409 },
      );
    }

    // บันทึกคนขับ
    await db
      .update(car_booking)
      .set({
        cUCode: selectedDriver.userCode,
      })
      .where(eq(car_booking.bookingId, id));

    const driverName = [
      selectedDriver.prefix,
      selectedDriver.firstName,
      selectedDriver.lastName,
    ]
      .filter(Boolean)
      .join(' ');

    return NextResponse.json({
      success: true,
      message: 'บันทึกคนขับรถเรียบร้อยแล้ว',

      data: {
        bookingId: id,
        cUCode: selectedDriver.userCode,

        driver: {
          id: selectedDriver.id,
          userCode: selectedDriver.userCode,
          name: driverName,
          phone: selectedDriver.phone,
        },
      },
    });
  } catch (error) {
    console.error('PATCH /api/car-bookings/[bookingId]/driver error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถบันทึกคนขับรถได้',
      },
      { status: 500 },
    );
  }
}
