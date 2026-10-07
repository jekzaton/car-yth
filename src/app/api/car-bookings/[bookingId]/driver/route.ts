import { NextResponse } from 'next/server';
import { and, eq, ne, sql } from 'drizzle-orm';

import { db } from '@/db';
import { car_booking } from '@/db/schema/car_booking';
import { users } from '@/db/schema';
import { AuthError, requireAdminOrMember } from '@/lib/auth';

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
    // =====================================================
    // AUTH
    // admin / member เท่านั้น
    // =====================================================

    await requireAdminOrMember(request);

    // =====================================================
    // BOOKING ID
    // =====================================================

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

    // =====================================================
    // BODY
    // =====================================================

    let body: UpdateDriverBody;

    try {
      body = (await request.json()) as UpdateDriverBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'รูปแบบข้อมูลไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    const cUCode = typeof body.cUCode === 'string' ? body.cUCode.trim() : '';

    // =====================================================
    // CURRENT BOOKING
    // =====================================================

    const [currentBooking] = await db
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

    if (!currentBooking) {
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

    // =====================================================
    // CANCEL DRIVER
    // =====================================================

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

    // =====================================================
    // FIND DRIVER
    // =====================================================

    const [selectedDriver] = await db
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

          // system_id = 2 = คนขับรถ
          eq(users.system_id, 2),

          // ต้องเป็นบัญชีที่เปิดใช้งาน
          eq(users.status, 'active'),
        ),
      )
      .limit(1);

    if (!selectedDriver) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลคนขับรถ หรือบัญชีไม่ได้เปิดใช้งาน',
        },
        {
          status: 404,
        },
      );
    }

    // user_code ใน users เป็น nullable
    // ต้องตรวจให้เป็น string ก่อนใช้ต่อ
    if (!selectedDriver.userCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'ข้อมูลคนขับรถไม่มีรหัสผู้ใช้งาน',
        },
        {
          status: 400,
        },
      );
    }

    const driverUserCode = selectedDriver.userCode;

    const driverName =
      [selectedDriver.prefix, selectedDriver.firstName, selectedDriver.lastName]
        .filter(
          (value): value is string =>
            typeof value === 'string' && value.trim().length > 0,
        )
        .join(' ') || driverUserCode;

    // =====================================================
    // CHECK DRIVER TIME CONFLICT
    // =====================================================

    /*
     * overlap:
     *
     * existingStart < currentEnd
     * &&
     * existingEnd > currentStart
     *
     * เช่น
     *
     * Booking A: 08:00 - 10:00
     * Booking B: 10:00 - 12:00
     *
     * ไม่ถือว่าชนกัน
     */

    const [conflict] = await db
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
          // คนขับคนเดียวกัน
          eq(car_booking.cUCode, driverUserCode),

          // ไม่ตรวจ booking ปัจจุบันกับตัวเอง
          ne(car_booking.bookingId, id),

          // ยกเลิกแล้วไม่นับ
          ne(car_booking.status, 'cancelled'),

          // existingStart < currentEnd
          sql`
            TIMESTAMP(
              ${car_booking.startDate},
              ${car_booking.startTime}
            ) <
            TIMESTAMP(
              ${currentBooking.endDate},
              ${currentBooking.endTime}
            )
          `,

          // existingEnd > currentStart
          sql`
            TIMESTAMP(
              ${car_booking.endDate},
              ${car_booking.endTime}
            ) >
            TIMESTAMP(
              ${currentBooking.startDate},
              ${currentBooking.startTime}
            )
          `,
        ),
      )
      .limit(1);

    // =====================================================
    // DRIVER CONFLICT
    // =====================================================

    if (conflict) {
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
        {
          status: 409,
        },
      );
    }

    // =====================================================
    // UPDATE DRIVER
    // =====================================================

    await db
      .update(car_booking)
      .set({
        cUCode: driverUserCode,
      })
      .where(eq(car_booking.bookingId, id));

    // =====================================================
    // SUCCESS
    // =====================================================

    return NextResponse.json({
      success: true,

      message: 'บันทึกคนขับรถเรียบร้อยแล้ว',

      data: {
        bookingId: id,

        cUCode: driverUserCode,

        driver: {
          id: selectedDriver.id,
          userCode: driverUserCode,
          name: driverName,
          phone: selectedDriver.phone,
        },
      },
    });
  } catch (error: unknown) {
    // =====================================================
    // AUTH ERROR
    // =====================================================

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

    // =====================================================
    // UNKNOWN ERROR
    // =====================================================

    console.error('PATCH /api/car-bookings/[bookingId]/driver error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถบันทึกคนขับรถได้',
      },
      {
        status: 500,
      },
    );
  }
}
