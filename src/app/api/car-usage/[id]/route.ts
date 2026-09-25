import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { car_usage } from '@/db/schema';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const usageId = Number(id);

    if (!Number.isInteger(usageId) || usageId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสข้อมูลการใช้งานรถไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const dateGo = String(body.dateGo || '').trim();
    const dateBack = String(body.dateBack || '').trim();

    const kmGo = Number(body.kmGo);
    const kmBack = Number(body.kmBack);

    if (!dateGo || !dateBack) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุวันเวลาเดินทางและวันเวลากลับ',
        },
        {
          status: 400,
        },
      );
    }

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

    if (!Number.isFinite(kmBack) || kmBack < kmGo) {
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

    const existing = await db
      .select({
        id: car_usage.id,
      })
      .from(car_usage)
      .where(eq(car_usage.id, usageId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลการใช้งานรถ',
        },
        {
          status: 404,
        },
      );
    }

    await db
      .update(car_usage)
      .set({
        date_go: new Date(dateGo),
        date_back: new Date(dateBack),

        km_go: kmGo,
        km_back: kmBack,
      })
      .where(eq(car_usage.id, usageId));

    return NextResponse.json({
      success: true,
      message: 'แก้ไขข้อมูลการใช้งานรถเรียบร้อยแล้ว',
    });
  } catch (error) {
    console.error('PUT /api/car-usage/[id] error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถแก้ไขข้อมูลการใช้งานรถได้',
      },
      {
        status: 500,
      },
    );
  }
}
