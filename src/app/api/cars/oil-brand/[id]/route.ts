import { NextRequest, NextResponse } from 'next/server';
import { and, eq, ne } from 'drizzle-orm';

import { AuthError, requireAdminOrMember } from '@/lib/auth';
import { db } from '@/db';
import { car_oil, oil_brand } from '@/db/schema';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminOrMember(request);
    const { id } = await context.params;

    const oilId = Number(id);

    if (!Number.isInteger(oilId) || oilId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสประเภทน้ำมันไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const oilName = String(body.oilName ?? '').trim();

    if (!oilName) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุชื่อประเภทน้ำมัน',
        },
        {
          status: 400,
        },
      );
    }

    // ตรวจสอบว่ารายการมีอยู่จริง

    const current = await db
      .select({
        id: oil_brand.oil_id,
        oilName: oil_brand.oil_name,
      })
      .from(oil_brand)
      .where(eq(oil_brand.oil_id, oilId))
      .limit(1);

    if (current.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบประเภทน้ำมันที่ต้องการแก้ไข',
        },
        {
          status: 404,
        },
      );
    }

    // ตรวจชื่อซ้ำ แต่ไม่นับ record ตัวเอง

    const duplicate = await db
      .select({
        id: oil_brand.oil_id,
      })
      .from(oil_brand)
      .where(and(eq(oil_brand.oil_name, oilName), ne(oil_brand.oil_id, oilId)))
      .limit(1);

    if (duplicate.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `มีประเภทน้ำมัน "${oilName}" อยู่แล้ว`,
        },
        {
          status: 409,
        },
      );
    }

    // UPDATE

    await db
      .update(oil_brand)
      .set({
        oil_name: oilName,
      })
      .where(eq(oil_brand.oil_id, oilId));

    return NextResponse.json({
      success: true,
      message: 'แก้ไขประเภทน้ำมันเรียบร้อยแล้ว',
    });
  } catch (error) {
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
    console.error('PUT /api/cars/oil-brand/[id] error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถแก้ไขประเภทน้ำมันได้',
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminOrMember(request);

    const { id } = await context.params;

    const oilId = Number(id);

    if (!Number.isInteger(oilId) || oilId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสประเภทน้ำมันไม่ถูกต้อง',
        },
        { status: 400 },
      );
    }

    // ตรวจสอบว่ามีประเภทน้ำมันนี้หรือไม่
    const existing = await db
      .select({
        id: oil_brand.oil_id,
        oilName: oil_brand.oil_name,
      })
      .from(oil_brand)
      .where(eq(oil_brand.oil_id, oilId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบประเภทน้ำมันที่ต้องการลบ',
        },
        { status: 404 },
      );
    }

    // ตรวจว่าถูกใช้งานในประวัติเติมน้ำมันหรือยัง
    const used = await db
      .select({
        id: car_oil.id,
      })
      .from(car_oil)
      .where(eq(car_oil.oil_type, oilId))
      .limit(1);

    if (used.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `ไม่สามารถลบ "${existing[0].oilName}" ได้ เนื่องจากมีประวัติการเติมน้ำมันที่ใช้ประเภทนี้อยู่`,
        },
        { status: 409 },
      );
    }

    await db.delete(oil_brand).where(eq(oil_brand.oil_id, oilId));

    return NextResponse.json({
      success: true,
      message: 'ลบประเภทน้ำมันเรียบร้อยแล้ว',
    });
  } catch (error) {
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
    console.error('DELETE /api/cars/oil-brand/[id] error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถลบประเภทน้ำมันได้',
      },
      { status: 500 },
    );
  }
}
