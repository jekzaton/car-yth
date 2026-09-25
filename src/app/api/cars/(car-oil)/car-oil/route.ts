import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';

import { db } from '@/db';
import { car_oil } from '@/db/schema/car_oil';
import { cars } from '@/db/schema/cars';
import { car_brand } from '@/db/schema/car_brand';
import { oil_brand } from '@/db/schema/oil_brand';
import { users } from '@/db/schema/users';
import { AuthError, requireAdminOrMember } from '@/lib/auth';

// ============================================================
// GET
// /api/cars/car-oil
// ============================================================

export async function GET(req: NextRequest) {
  try {
    await requireAdminOrMember(req);
    const rows = await db
      .select({
        id: car_oil.id,

        // =========================
        // CAR
        // =========================
        carCode: car_oil.car_code,
        carName: cars.car_name,
        carBrand: car_brand.car_brand_name,
        licensePlate: cars.license_plate,

        // =========================
        // DRIVER
        // =========================
        driverCode: car_oil.c_u_code,
        driverPrefix: users.prefix,
        driverFirstName: users.first_name,
        driverLastName: users.last_name,

        // =========================
        // OIL
        // =========================
        dateOil: car_oil.date_oil,
        kmDetail: car_oil.km_detail,
        literOil: car_oil.liter_oil,
        priceOil: car_oil.price_oil,

        oilTypeId: car_oil.oil_type,
        oilName: oil_brand.oil_name,
      })
      .from(car_oil)

      // รถ
      .leftJoin(cars, eq(cars.car_code, car_oil.car_code))

      // ยี่ห้อรถ
      .leftJoin(car_brand, eq(car_brand.car_brand_id, cars.car_brand_id))

      // คนขับรถ
      .leftJoin(users, eq(users.user_code, car_oil.c_u_code))

      // ประเภทน้ำมัน
      .leftJoin(oil_brand, eq(oil_brand.oil_id, car_oil.oil_type))

      .orderBy(desc(car_oil.date_oil), desc(car_oil.id));

    const data = rows.map((item) => {
      const driverName = [
        item.driverPrefix,
        item.driverFirstName,
        item.driverLastName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

      return {
        id: item.id,

        // CAR
        carCode: item.carCode,
        carName: item.carName ?? null,
        carBrand: item.carBrand ?? null,
        licensePlate: item.licensePlate ?? null,

        // DRIVER
        driverCode: item.driverCode,
        driverName: driverName || null,

        // OIL
        dateOil: item.dateOil,
        kmDetail: Number(item.kmDetail ?? 0),
        literOil: Number(item.literOil ?? 0),
        priceOil: Number(item.priceOil ?? 0),

        oilTypeId: item.oilTypeId ?? null,
        oilName: item.oilName ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      total: data.length,
      data,
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
    console.error('GET /api/cars/car-oil error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดข้อมูลการเติมน้ำมันได้',
        data: [],
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// POST
// /api/cars/car-oil
// ============================================================

export async function POST(request: NextRequest) {
  try {
    await requireAdminOrMember(request);
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

    const carCode = getString(body.carCode);
    const driverCode = getString(body.driverCode ?? body.cUCode);
    const dateOil = getString(body.dateOil);

    const kmDetail = getNumber(body.kmDetail);
    const literOil = getNumber(body.literOil);
    const priceOil = getNumber(body.priceOil);
    const oilTypeId = getInteger(body.oilTypeId ?? body.oilType);

    // ========================================================
    // VALIDATE REQUIRED
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

    if (!driverCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาเลือกพนักงานขับรถ',
        },
        {
          status: 400,
        },
      );
    }

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

    if (kmDetail === null || kmDetail < 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'เลขไมล์ไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    if (literOil === null || literOil <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุจำนวนลิตรให้ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    if (priceOil === null || priceOil < 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ราคาน้ำมันไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

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
    // VALIDATE DATE
    // ========================================================

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
    // CHECK CAR
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
    // CHECK DRIVER
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
          message: 'ไม่พบข้อมูลพนักงานขับรถ',
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // CHECK OIL TYPE
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
    // INSERT
    // ========================================================

    const result = await db.insert(car_oil).values({
      car_code: carCode,
      c_u_code: driverCode,
      date_oil: parsedDateOil,

      km_detail: kmDetail,
      liter_oil: literOil,
      price_oil: priceOil,

      oil_type: oilTypeId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'เพิ่มข้อมูลการเติมน้ำมันเรียบร้อยแล้ว',

        data: {
          insertId: Number(result[0].insertId),
        },
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
    console.error('POST /api/cars/car-oil error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถเพิ่มข้อมูลการเติมน้ำมันได้',
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
 * รองรับ:
 * 2026-09-15T09:30
 * 2026-09-15T09:30:00
 * 2026-09-15 09:30
 * 2026-09-15 09:30:00
 */
function parseDateTime(value: string): Date | null {
  if (!value) {
    return null;
  }

  const normalized = value.includes('T') ? value : value.replace(' ', 'T');

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}
