import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';

import { db } from '@/db';

import { car_maintain } from '@/db/schema/car_maintain';
import { cars } from '@/db/schema/cars';
import { car_brand } from '@/db/schema/car_brand';
import { users } from '@/db/schema/users';

import { AuthError, requireAdminOrMember } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ============================================================
// HELPERS
// ============================================================

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(object: Record<string, unknown>, key: string): string {
  const value = object[key];

  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function getNumber(
  object: Record<string, unknown>,
  key: string,
): number | null {
  const value = object[key];

  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function parseDateTime(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const raw = value.trim();

  const match = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?$/,
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

  const date = new Date(year, month - 1, day, hour, minute, second, 0);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  // ป้องกันวันที่ เช่น 2026-02-31
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

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrMember(request);
    const result = await db
      .select({
        id: car_maintain.id,

        carCode: car_maintain.car_code,

        userCode: car_maintain.c_u_code,

        dateMaintain: car_maintain.date_maintain,

        detailMaintain: car_maintain.detail_maintain,

        priceMaintain: car_maintain.price_maintain,

        carBrandSub: cars.car_brand_sub,

        carBrandId: cars.car_brand_id,

        carBrand: car_brand.car_brand_name,

        licensePlate: cars.license_plate,

        carImage: cars.car_image,

        // USER

        prefix: users.prefix,

        firstName: users.first_name,

        lastName: users.last_name,
      })

      .from(car_maintain)

      // CAR

      .leftJoin(cars, eq(cars.car_code, car_maintain.car_code))

      // CAR BRAND

      .leftJoin(car_brand, eq(car_brand.car_brand_id, cars.car_brand_id))

      // USER
      // car_maintain.c_u_code -> users.user_code

      .leftJoin(users, eq(users.user_code, car_maintain.c_u_code))

      // ล่าสุดก่อน
      .orderBy(desc(car_maintain.date_maintain), desc(car_maintain.id));

    // FORMAT RESPONSE

    const data = result.map((item) => {
      const userName = [item.prefix, item.firstName, item.lastName]
        .filter(Boolean)
        .join(' ');

      return {
        id: item.id,

        // CAR

        carCode: item.carCode,

        carBrandSub: item.carBrandSub ?? null,

        carBrandId: item.carBrandId ?? null,

        carBrand: item.carBrand ?? null,

        licensePlate: item.licensePlate ?? null,

        carImage: item.carImage ?? null,

        // USER

        userCode: item.userCode,

        userName: userName || null,

        // MAINTAIN

        dateMaintain: item.dateMaintain,

        detailMaintain: item.detailMaintain,

        // decimal จาก MySQL/Drizzle
        // อาจได้เป็น string จึงแปลงเป็น number
        priceMaintain: Number(item.priceMaintain ?? 0),
      };
    });

    return NextResponse.json(
      {
        success: true,
        total: data.length,
        data,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          data: [],
        },
        {
          status: error.status,
        },
      );
    }
    console.error('GET /api/cars/car-maintain error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดข้อมูลการซ่อมบำรุงรถได้',
        data: [],
      },
      {
        status: 500,
      },
    );
  }
}

// POST
// POST /api/cars/car-maintain

export async function POST(request: NextRequest) {
  try {
    await requireAdminOrMember(request);
    const rawBody = (await request.json()) as unknown;

    if (!isObject(rawBody)) {
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

    // ========================================================

    const carCode = getString(rawBody, 'carCode');

    // รองรับทั้ง userCode และ cUCode
    const userCode =
      getString(rawBody, 'userCode') || getString(rawBody, 'cUCode');

    const dateMaintain = parseDateTime(rawBody.dateMaintain);

    const detailMaintain = getString(rawBody, 'detailMaintain');

    const priceMaintain = getNumber(rawBody, 'priceMaintain');

    // VALIDATE CAR

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

    // VALIDATE USER

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

    // VALIDATE DATE

    if (!dateMaintain) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุวันที่และเวลาซ่อมบำรุง',
        },
        {
          status: 400,
        },
      );
    }

    // VALIDATE DETAIL

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

    // VALIDATE PRICE

    if (priceMaintain === null || priceMaintain < 0) {
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
          message: 'ไม่พบข้อมูลผู้ดำเนินการ',
        },
        {
          status: 404,
        },
      );
    }

    // INSERT

    const insertResult = await db.insert(car_maintain).values({
      car_code: carCode,

      c_u_code: userCode,

      date_maintain: dateMaintain,

      detail_maintain: detailMaintain,

      // decimal ของ Drizzle MySQL รับ string
      price_maintain: priceMaintain.toFixed(2),
    });

    // RESPONSE

    return NextResponse.json(
      {
        success: true,

        message: 'เพิ่มข้อมูลการซ่อมบำรุงเรียบร้อยแล้ว',

        data: {
          id: insertResult[0]?.insertId ?? null,

          carCode,

          userCode,

          dateMaintain,

          detailMaintain,

          priceMaintain,
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
    console.error('POST /api/cars/car-maintain error:', error);

    return NextResponse.json(
      {
        success: false,

        message: 'ไม่สามารถเพิ่มข้อมูลการซ่อมบำรุงได้',
      },
      {
        status: 500,
      },
    );
  }
}
