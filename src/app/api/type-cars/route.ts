import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';

import { db } from '@/db';
import { typeCar } from '@/db/schema/type_car';
import { AuthError, requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // อนุญาต user / member / admin
    // แต่ต้อง Login แล้วเท่านั้น
    await requireAuth(request);

    const data = await db
      .select({
        typeCarId: typeCar.typeCarId,
        typeName: typeCar.typeName,
      })
      .from(typeCar)
      .orderBy(asc(typeCar.typeName));

    return NextResponse.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    // Authentication error
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

    console.error('GET /api/type-cars error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดข้อมูลประเภทรถได้',
      },
      {
        status: 500,
      },
    );
  }
}
