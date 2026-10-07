// src/app/api/cars/car-brand/route.ts

import { asc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { car_brand } from '@/db/schema/car_brand';
import { cars } from '@/db/schema/cars';

import { AuthError, requireAdminOrMember, requireAuth } from '@/lib/auth';

// AUTH ERROR RESPONSE

function handleAuthError(error: unknown) {
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

  return null;
}

// GET
// user / member / admin
// ดึงรายการยี่ห้อรถทั้งหมด

export async function GET(request: NextRequest) {
  try {
    // ต้อง Login ก่อน
    await requireAuth(request);

    const data = await db
      .select({
        id: car_brand.car_brand_id,
        carBrandName: car_brand.car_brand_name,
      })
      .from(car_brand)
      .orderBy(asc(car_brand.car_brand_name));

    return NextResponse.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    const authResponse = handleAuthError(error);

    if (authResponse) {
      return authResponse;
    }

    console.error('GET /api/cars/car-brand error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดข้อมูลยี่ห้อรถยนต์ได้',
      },
      {
        status: 500,
      },
    );
  }
}

// POST
// admin / member เท่านั้น
// เพิ่มยี่ห้อรถ

export async function POST(request: NextRequest) {
  try {
    // เฉพาะ admin / member
    await requireAdminOrMember(request);

    const body = await request.json();

    const carBrandName = String(body.carBrandName ?? '').trim();

    if (!carBrandName) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุชื่อยี่ห้อรถยนต์',
        },
        {
          status: 400,
        },
      );
    }

    if (carBrandName.length > 255) {
      return NextResponse.json(
        {
          success: false,
          message: 'ชื่อยี่ห้อรถยนต์ต้องไม่เกิน 255 ตัวอักษร',
        },
        {
          status: 400,
        },
      );
    }

    // ตรวจชื่อซ้ำ

    const duplicate = await db
      .select({
        id: car_brand.car_brand_id,
      })
      .from(car_brand)
      .where(eq(car_brand.car_brand_name, carBrandName))
      .limit(1);

    if (duplicate.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `มียี่ห้อรถยนต์ "${carBrandName}" อยู่แล้ว`,
        },
        {
          status: 409,
        },
      );
    }

    // INSERT

    await db.insert(car_brand).values({
      car_brand_name: carBrandName,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'เพิ่มยี่ห้อรถยนต์เรียบร้อยแล้ว',
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    const authResponse = handleAuthError(error);

    if (authResponse) {
      return authResponse;
    }

    console.error('POST /api/cars/car-brand error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถเพิ่มยี่ห้อรถยนต์ได้',
      },
      {
        status: 500,
      },
    );
  }
}

// PATCH
// admin / member เท่านั้น
//
// body:
// {
//   id: 1,
//   carBrandName: "Honda"
// }

export async function PATCH(request: NextRequest) {
  try {
    // เฉพาะ admin / member
    await requireAdminOrMember(request);

    const body = await request.json();

    const id = Number(body.id);

    const carBrandName = String(body.carBrandName ?? '').trim();

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสยี่ห้อรถยนต์ไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    if (!carBrandName) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุชื่อยี่ห้อรถยนต์',
        },
        {
          status: 400,
        },
      );
    }

    if (carBrandName.length > 255) {
      return NextResponse.json(
        {
          success: false,
          message: 'ชื่อยี่ห้อรถยนต์ต้องไม่เกิน 255 ตัวอักษร',
        },
        {
          status: 400,
        },
      );
    }

    // ตรวจว่ารายการมีจริง

    const existing = await db
      .select({
        id: car_brand.car_brand_id,
        carBrandName: car_brand.car_brand_name,
      })
      .from(car_brand)
      .where(eq(car_brand.car_brand_id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบยี่ห้อรถยนต์ที่ต้องการแก้ไข',
        },
        {
          status: 404,
        },
      );
    }

    // ตรวจชื่อซ้ำ

    const duplicate = await db
      .select({
        id: car_brand.car_brand_id,
      })
      .from(car_brand)
      .where(eq(car_brand.car_brand_name, carBrandName))
      .limit(1);

    if (duplicate.length > 0 && duplicate[0].id !== id) {
      return NextResponse.json(
        {
          success: false,
          message: `มียี่ห้อรถยนต์ "${carBrandName}" อยู่แล้ว`,
        },
        {
          status: 409,
        },
      );
    }

    // UPDATE

    await db
      .update(car_brand)
      .set({
        car_brand_name: carBrandName,
      })
      .where(eq(car_brand.car_brand_id, id));

    return NextResponse.json({
      success: true,
      message: 'แก้ไขยี่ห้อรถยนต์เรียบร้อยแล้ว',
    });
  } catch (error) {
    const authResponse = handleAuthError(error);

    if (authResponse) {
      return authResponse;
    }

    console.error('PATCH /api/cars/car-brand error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถแก้ไขยี่ห้อรถยนต์ได้',
      },
      {
        status: 500,
      },
    );
  }
}

// DELETE
// admin / member เท่านั้น
//
// /api/cars/car-brand?id=1

export async function DELETE(request: NextRequest) {
  try {
    // เฉพาะ admin / member
    await requireAdminOrMember(request);

    const { searchParams } = new URL(request.url);

    const id = Number(searchParams.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสยี่ห้อรถยนต์ไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    // ตรวจว่ามียี่ห้อนี้หรือไม่

    const existing = await db
      .select({
        id: car_brand.car_brand_id,
        carBrandName: car_brand.car_brand_name,
      })
      .from(car_brand)
      .where(eq(car_brand.car_brand_id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบยี่ห้อรถยนต์ที่ต้องการลบ',
        },
        {
          status: 404,
        },
      );
    }

    // ตรวจว่ามีรถใช้ยี่ห้อนี้หรือไม่

    const usedByCar = await db
      .select({
        id: cars.id,
        carCode: cars.car_code,
        carBrandSub: cars.car_brand_sub,
      })
      .from(cars)
      .where(eq(cars.car_brand_id, id))
      .limit(1);

    if (usedByCar.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `ไม่สามารถลบ "${existing[0].carBrandName}" ได้ เนื่องจากมีรถยนต์ใช้ยี่ห้อนี้อยู่`,
        },
        {
          status: 409,
        },
      );
    }

    // DELETE

    await db.delete(car_brand).where(eq(car_brand.car_brand_id, id));

    return NextResponse.json({
      success: true,
      message: 'ลบยี่ห้อรถยนต์เรียบร้อยแล้ว',
    });
  } catch (error) {
    const authResponse = handleAuthError(error);

    if (authResponse) {
      return authResponse;
    }

    console.error('DELETE /api/cars/car-brand error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถลบยี่ห้อรถยนต์ได้',
      },
      {
        status: 500,
      },
    );
  }
}
