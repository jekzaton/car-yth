import { NextRequest, NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';

import { db } from '@/db';
import { oil_brand } from '@/db/schema';

import { AuthError, requireAdminOrMember } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// =====================================================
// GET /api/cars/oil-brand
// =====================================================

export async function GET() {
  try {
    const result = await db
      .select({
        id: oil_brand.oil_id,
        oilName: oil_brand.oil_name,
      })
      .from(oil_brand)
      .orderBy(asc(oil_brand.oil_name));

    return NextResponse.json(
      {
        success: true,
        total: result.length,
        data: result,
      },
      {
        status: 200,
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    );
  } catch (error) {
    console.error('GET /api/cars/oil-brand error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดข้อมูลยี่ห้อน้ำมันได้',
        total: 0,
        data: [],
      },
      {
        status: 500,
      },
    );
  }
}

// POST /api/cars/oil-brand

export async function POST(request: NextRequest) {
  try {
    await requireAdminOrMember(request);

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

    if (oilName.length > 255) {
      return NextResponse.json(
        {
          success: false,
          message: 'ชื่อประเภทน้ำมันยาวเกิน 255 ตัวอักษร',
        },
        {
          status: 400,
        },
      );
    }

    // ==========================================
    // CHECK DUPLICATE
    // ==========================================

    const existing = await db
      .select({
        id: oil_brand.oil_id,
        oilName: oil_brand.oil_name,
      })
      .from(oil_brand)
      .where(eq(oil_brand.oil_name, oilName))
      .limit(1);

    if (existing.length > 0) {
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

    // ==========================================
    // INSERT
    // ==========================================

    await db.insert(oil_brand).values({
      oil_name: oilName,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'เพิ่มประเภทน้ำมันเรียบร้อยแล้ว',
      },
      {
        status: 201,
      },
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
    console.error('POST /api/cars/oil-brand error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถเพิ่มประเภทน้ำมันได้',
      },
      {
        status: 500,
      },
    );
  }
}
