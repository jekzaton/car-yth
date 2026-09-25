import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { car_oil } from '@/db/schema/car_oil';
import { cars } from '@/db/schema/cars';
import { users } from '@/db/schema/users';
import { oil_brand } from '@/db/schema/oil_brand';
import { AuthError, requireAdminOrMember } from '@/lib/auth';

// ============================================================
// NEXT.JS 16
// ============================================================

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// ============================================================
// PATCH
// PATCH /api/cars/car-oil/:id
// ============================================================

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminOrMember(request);
    // ========================================================
    // ID
    // ========================================================

    const { id } = await context.params;

    const oilId = Number(id);

    if (!Number.isInteger(oilId) || oilId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสรายการเติมน้ำมันไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // CHECK EXISTING
    // ========================================================

    const [existing] = await db
      .select({
        id: car_oil.id,
      })
      .from(car_oil)
      .where(eq(car_oil.id, oilId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลการเติมน้ำมันที่ต้องการแก้ไข',
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // BODY
    // ========================================================

    const body: unknown = await request.json();

    if (!isObject(body)) {
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

    /*
     * รองรับ payload จาก CarOilModal:
     *
     * {
     *   carCode,
     *   cUCode,
     *   dateOil,
     *   kmDetail,
     *   literOil,
     *   priceOil,
     *   oilType
     * }
     */

    const carCode = getString(body.carCode);

    const driverCode = getString(body.cUCode ?? body.driverCode);

    const dateOil = getString(body.dateOil);

    const kmDetail = getNumber(body.kmDetail);
    const literOil = getNumber(body.literOil);
    const priceOil = getNumber(body.priceOil);

    const oilTypeId = getInteger(body.oilType ?? body.oilTypeId);

    // ========================================================
    // VALIDATE CAR
    // ========================================================

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

    // ========================================================
    // VALIDATE DRIVER
    // ========================================================

    if (!driverCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาเลือกคนขับรถ',
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // VALIDATE DATE
    // ========================================================

    if (!dateOil) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุวันที่เติมน้ำมัน',
        },
        {
          status: 400,
        },
      );
    }

    const parsedDateOil = parseDateTime(dateOil);

    if (!parsedDateOil) {
      return NextResponse.json(
        {
          success: false,
          message: 'วันที่หรือเวลาเติมน้ำมันไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // VALIDATE KM
    // ========================================================

    if (kmDetail === null || kmDetail < 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุเลขไมล์ให้ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // VALIDATE LITER
    // ========================================================

    if (literOil === null || literOil <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุจำนวนลิตรให้มากกว่า 0',
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // VALIDATE PRICE
    // ========================================================

    if (priceOil === null || priceOil <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุค่าใช้จ่ายให้มากกว่า 0',
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // VALIDATE OIL TYPE
    // ========================================================

    if (oilTypeId === null || oilTypeId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาเลือกประเภทน้ำมัน',
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // CHECK CAR EXISTS
    // ========================================================

    const [car] = await db
      .select({
        id: cars.id,
        carCode: cars.car_code,
      })
      .from(cars)
      .where(eq(cars.car_code, carCode))
      .limit(1);

    if (!car) {
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

    // ========================================================
    // CHECK DRIVER EXISTS
    // ========================================================

    const [driver] = await db
      .select({
        id: users.id,
        userCode: users.user_code,
      })
      .from(users)
      .where(eq(users.user_code, driverCode))
      .limit(1);

    if (!driver) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลคนขับรถที่เลือก',
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // CHECK OIL BRAND EXISTS
    // ========================================================

    const [oilBrand] = await db
      .select({
        id: oil_brand.oil_id,
        oilName: oil_brand.oil_name,
      })
      .from(oil_brand)
      .where(eq(oil_brand.oil_id, oilTypeId))
      .limit(1);

    if (!oilBrand) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบประเภทน้ำมันที่เลือก',
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // UPDATE
    // ========================================================

    await db
      .update(car_oil)
      .set({
        car_code: carCode,
        c_u_code: driverCode,

        date_oil: parsedDateOil,

        km_detail: kmDetail,
        liter_oil: literOil,
        price_oil: priceOil,

        oil_type: oilTypeId,
      })
      .where(eq(car_oil.id, oilId));

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json({
      success: true,
      message: 'แก้ไขข้อมูลการเติมน้ำมันเรียบร้อยแล้ว',

      data: {
        id: oilId,

        carCode,
        driverCode,

        dateOil: parsedDateOil,

        kmDetail,
        literOil,
        priceOil,

        oilTypeId,
        oilName: oilBrand.oilName,
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
    console.error('PATCH /api/cars/car-oil/[id] error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถแก้ไขข้อมูลการเติมน้ำมันได้',
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// DELETE
// DELETE /api/cars/car-oil/:id
// ============================================================

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireAdminOrMember(_request);
    const { id } = await context.params;

    const oilId = Number(id);

    if (!Number.isInteger(oilId) || oilId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสรายการเติมน้ำมันไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // CHECK EXISTING
    // ========================================================

    const [existing] = await db
      .select({
        id: car_oil.id,
      })
      .from(car_oil)
      .where(eq(car_oil.id, oilId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลการเติมน้ำมันที่ต้องการลบ',
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // DELETE
    // ========================================================

    await db.delete(car_oil).where(eq(car_oil.id, oilId));

    return NextResponse.json({
      success: true,
      message: 'ลบข้อมูลการเติมน้ำมันเรียบร้อยแล้ว',
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
    console.error('DELETE /api/cars/car-oil/[id] error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถลบข้อมูลการเติมน้ำมันได้',
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// HELPERS
// ============================================================

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getString(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function getNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
}

function getInteger(value: unknown): number | null {
  const number = getNumber(value);

  if (number === null || !Number.isInteger(number)) {
    return null;
  }

  return number;
}

/**
 * รองรับค่าจาก <input type="datetime-local">
 *
 * 2026-09-15T09:30
 * 2026-09-15T09:30:00
 * 2026-09-15 09:30
 * 2026-09-15 09:30:00
 */
function parseDateTime(value: string): Date | null {
  const normalized = value.trim().replace(' ', 'T');

  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
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

  /*
   * ป้องกันวันที่ที่ JS normalize เอง เช่น
   * 2026-02-31 -> มีนาคม
   */
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute ||
    date.getSeconds() !== second
  ) {
    return null;
  }

  return date;
}
