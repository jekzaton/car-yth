import { db } from '@/db';
import { typeCar } from '@/db/schema/type_car';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { AuthError, requireAdminOrMember } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ================= GET ALL CAR TYPES =================
export async function GET() {
  try {
    const result = await db.select().from(typeCar);

    const data = result.map((item) => ({
      typeCarId: item.typeCarId,
      typeName: item.typeName,
    }));

    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      },
    );
  } catch (error) {
    console.error('GET car type error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดข้อมูลประเภทรถได้',
        data: [],
      },
      { status: 500 },
    );
  }
}

// ================= CREATE CAR TYPE =================
export async function POST(req: Request) {
  try {
    await requireAdminOrMember(req);

    const body = await req.json();

    const typeName = String(body.typeName ?? '').trim();

    // ================= VALIDATE =================
    if (!typeName) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณากรอกชื่อประเภทรถ',
        },
        { status: 400 },
      );
    }

    // ================= CHECK DUPLICATE =================
    const duplicate = await db
      .select()
      .from(typeCar)
      .where(eq(typeCar.typeName, typeName))
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

    // ================= INSERT =================
    const result = await db.insert(typeCar).values({
      typeName,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'เพิ่มประเภทรถสำเร็จ',
        data: result,
      },
      { status: 201 },
    );
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
    console.error('POST car type error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถเพิ่มประเภทรถได้',
      },
      { status: 500 },
    );
  }
}
