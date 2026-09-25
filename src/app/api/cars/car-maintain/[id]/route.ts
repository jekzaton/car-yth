import { db } from '@/db';
import { car_maintain, cars, users } from '@/db/schema';

import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { AuthError, requireAdminOrMember } from '@/lib/auth';

// TYPES

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type MaintainPayload = {
  carCode?: unknown;
  userCode?: unknown;
  cUCode?: unknown;
  dateMaintain?: unknown;
  detailMaintain?: unknown;
  priceMaintain?: unknown;
};

// HELPERS

function parseId(value: string): number | null {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function parseDateTime(value: unknown): Date | null {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  const raw = value.trim();

  // รองรับ
  // 2026-09-16T10:30
  // 2026-09-16T10:30:00
  // 2026-09-16 10:30
  // 2026-09-16 10:30:00

  const normalized = raw.replace(' ', 'T');

  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/,
  );

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? 0);

  const date = new Date(year, month - 1, day, hour, minute, second);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  // ป้องกันวันที่ผิด เช่น 2026-02-31
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute
  ) {
    return null;
  }

  return date;
}

function parsePrice(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const raw = String(value).replace(/,/g, '').trim();

  if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    return null;
  }

  const price = Number(raw);

  if (!Number.isFinite(price) || price < 0) {
    return null;
  }

  // decimal(10,2)
  if (price > 99_999_999.99) {
    return null;
  }

  return price;
}

// PATCH
// PATCH /api/cars/car-maintain/[id]

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminOrMember(req);
    const { id: idParam } = await params;

    const id = parseId(idParam);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสรายการซ่อมบำรุงไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    // CHECK EXISTING

    const existing = await db
      .select({
        id: car_maintain.id,
      })
      .from(car_maintain)
      .where(eq(car_maintain.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบรายการซ่อมบำรุง',
        },
        {
          status: 404,
        },
      );
    }

    // BODY

    const body = (await req.json()) as MaintainPayload;

    const carCode = typeof body.carCode === 'string' ? body.carCode.trim() : '';

    const userCodeRaw = body.userCode ?? body.cUCode;

    const userCode = typeof userCodeRaw === 'string' ? userCodeRaw.trim() : '';

    const detailMaintain =
      typeof body.detailMaintain === 'string' ? body.detailMaintain.trim() : '';

    const dateMaintain = parseDateTime(body.dateMaintain);

    const priceMaintain = parsePrice(body.priceMaintain);

    // VALIDATE

    if (!carCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาเลือกรถยนต์',
        },
        {
          status: 400,
        },
      );
    }

    if (!userCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาเลือกผู้ดำเนินการ',
        },
        {
          status: 400,
        },
      );
    }

    if (!dateMaintain) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุวันที่และเวลาซ่อมให้ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    if (!detailMaintain) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุรายละเอียดการซ่อมบำรุง',
        },
        {
          status: 400,
        },
      );
    }

    if (priceMaintain === null) {
      return NextResponse.json(
        {
          success: false,
          message: 'ค่าใช้จ่ายไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    // CHECK CAR

    const carResult = await db
      .select({
        id: cars.id,
        carCode: cars.car_code,
      })
      .from(cars)
      .where(eq(cars.car_code, carCode))
      .limit(1);

    if (carResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบรถยนต์ที่เลือก',
        },
        {
          status: 404,
        },
      );
    }

    // CHECK USER

    const userResult = await db
      .select({
        id: users.id,
        userCode: users.user_code,
      })
      .from(users)
      .where(eq(users.user_code, userCode))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบผู้ดำเนินการที่เลือก',
        },
        {
          status: 404,
        },
      );
    }

    // UPDATE

    await db
      .update(car_maintain)
      .set({
        car_code: carCode,

        c_u_code: userCode,

        date_maintain: dateMaintain,

        detail_maintain: detailMaintain,

        // Drizzle decimal ต้องส่ง string
        price_maintain: priceMaintain.toFixed(2),
      })
      .where(eq(car_maintain.id, id));

    // RESPONSE

    return NextResponse.json({
      success: true,

      message: 'แก้ไขข้อมูลซ่อมบำรุงเรียบร้อยแล้ว',

      data: {
        id,
        carCode,
        userCode,

        dateMaintain: body.dateMaintain,

        detailMaintain,

        priceMaintain,
      },
    });
  } catch (error) {
    // AUTH ERROR

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

    console.error('PATCH /api/cars/car-maintain/[id] error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถแก้ไขข้อมูลซ่อมบำรุงได้',
      },
      {
        status: 500,
      },
    );
  }
}

// DELETE
// DELETE /api/cars/car-maintain/[id]

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminOrMember(req);
    const { id: idParam } = await params;

    const id = parseId(idParam);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสรายการซ่อมบำรุงไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    // CHECK EXISTING

    const existing = await db
      .select({
        id: car_maintain.id,
      })
      .from(car_maintain)
      .where(eq(car_maintain.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบรายการซ่อมบำรุง',
        },
        {
          status: 404,
        },
      );
    }

    // DELETE

    await db.delete(car_maintain).where(eq(car_maintain.id, id));

    return NextResponse.json({
      success: true,

      message: 'ลบข้อมูลซ่อมบำรุงเรียบร้อยแล้ว',

      data: {
        id,
      },
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
    console.error('DELETE /api/cars/car-maintain/[id] error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถลบข้อมูลซ่อมบำรุงได้',
      },
      {
        status: 500,
      },
    );
  }
}
