import { NextResponse } from 'next/server';
import { db } from '@/db';
import { car_booking } from '@/db/schema/car_booking';
import { eq } from 'drizzle-orm';

type BookingStatus = 'pending' | 'approved' | 'cancelled';

const VALID_STATUS: BookingStatus[] = ['pending', 'approved', 'cancelled'];

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      bookingId: string;
    }>;
  },
) {
  try {
    const { bookingId } = await context.params;

    const id = Number(bookingId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'bookingId ไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    const body: unknown = await request.json();

    if (!body || typeof body !== 'object' || !('status' in body)) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุสถานะ',
        },
        {
          status: 400,
        },
      );
    }

    const status = (body as { status?: unknown }).status;

    if (
      typeof status !== 'string' ||
      !VALID_STATUS.includes(status as BookingStatus)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'สถานะไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    await db
      .update(car_booking)
      .set({
        status: status as BookingStatus,
      })
      .where(eq(car_booking.bookingId, id));

    return NextResponse.json({
      success: true,
      message: 'เปลี่ยนสถานะเรียบร้อยแล้ว',
    });
  } catch (error) {
    console.error('PATCH booking status error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถเปลี่ยนสถานะได้',
      },
      {
        status: 500,
      },
    );
  }
}
