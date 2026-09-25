import { db } from '@/db';
import { typeCar } from '@/db/schema/type_car';
import { NextResponse } from 'next/server';
import { and, eq, ne } from 'drizzle-orm';

import { AuthError, requireAdminOrMember } from '@/lib/auth';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

// ================= UPDATE =================
export async function PUT(req: Request, { params }: Props) {
  try {
    await requireAdminOrMember(req);

    const { id } = await params;
    const typeCarId = Number(id);

    if (!Number.isInteger(typeCarId) || typeCarId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสประเภทรถไม่ถูกต้อง',
        },
        { status: 400 },
      );
    }

    const body = await req.json();

    const typeName = String(body.typeName ?? '').trim();

    if (!typeName) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณากรอกชื่อประเภทรถ',
        },
        { status: 400 },
      );
    }

    // ตรวจสอบว่ามี record นี้จริง
    const existing = await db
      .select()
      .from(typeCar)
      .where(eq(typeCar.typeCarId, typeCarId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลประเภทรถ',
        },
        { status: 404 },
      );
    }

    // ตรวจชื่อซ้ำ แต่ไม่รวม record ตัวเอง
    const duplicate = await db
      .select()
      .from(typeCar)
      .where(
        and(ne(typeCar.typeCarId, typeCarId), eq(typeCar.typeName, typeName)),
      )
      .limit(1);

    if (duplicate.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ชื่อประเภทรถนี้มีอยู่ในระบบแล้ว',
        },
        { status: 400 },
      );
    }

    await db
      .update(typeCar)
      .set({
        typeName,
      })
      .where(eq(typeCar.typeCarId, typeCarId));

    return NextResponse.json({
      success: true,
      message: 'แก้ไขประเภทรถสำเร็จ',
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
    console.error('PUT car type error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถแก้ไขประเภทรถได้',
      },
      { status: 500 },
    );
  }
}

// ================= DELETE =================
export async function DELETE(_req: Request, { params }: Props) {
  try {
    await requireAdminOrMember(_req);

    const { id } = await params;
    const typeCarId = Number(id);

    if (!Number.isInteger(typeCarId) || typeCarId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสประเภทรถไม่ถูกต้อง',
        },
        { status: 400 },
      );
    }

    const existing = await db
      .select()
      .from(typeCar)
      .where(eq(typeCar.typeCarId, typeCarId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลประเภทรถ',
        },
        { status: 404 },
      );
    }

    await db.delete(typeCar).where(eq(typeCar.typeCarId, typeCarId));

    return NextResponse.json({
      success: true,
      message: 'ลบประเภทรถสำเร็จ',
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
    console.error('DELETE car type error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถลบประเภทรถได้',
      },
      { status: 500 },
    );
  }
}
