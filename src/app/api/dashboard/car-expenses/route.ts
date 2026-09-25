import { NextRequest, NextResponse } from 'next/server';
import { and, gte, lte, SQL, sql } from 'drizzle-orm';

import { db } from '@/db';
import { car_maintain, car_oil } from '@/db/schema';

function isValidDate(value: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // FILTERS

    const maintainConditions: SQL[] = [];
    const oilConditions: SQL[] = [];

    if (isValidDate(startDate)) {
      const start = new Date(`${startDate}T00:00:00`);

      maintainConditions.push(gte(car_maintain.date_maintain, start));

      oilConditions.push(gte(car_oil.date_oil, start));
    }

    if (isValidDate(endDate)) {
      const end = new Date(`${endDate}T23:59:59`);

      maintainConditions.push(lte(car_maintain.date_maintain, end));

      oilConditions.push(lte(car_oil.date_oil, end));
    }

    // TOTAL MAINTAIN

    const maintainSummary = await db
      .select({
        total: sql<string>`
      COALESCE(
        SUM(${car_maintain.price_maintain}),
        0
      )
    `,
        count: sql<number>`
      COUNT(*)
    `,
      })
      .from(car_maintain)
      .where(
        maintainConditions.length > 0 ? and(...maintainConditions) : undefined,
      );

    // TOTAL OIL

    const oilSummary = await db
      .select({
        total: sql<string>`
      COALESCE(
        SUM(${car_oil.price_oil}),
        0
      )
    `,
        count: sql<number>`
      COUNT(*)
    `,
      })
      .from(car_oil)
      .where(oilConditions.length > 0 ? and(...oilConditions) : undefined);

    // MAINTAIN BY MONTH

    const maintainMonthly = await db
      .select({
        month: sql<string>`
          DATE_FORMAT(
            ${car_maintain.date_maintain},
            '%Y-%m'
          )
        `,
        amount: sql<string>`
          COALESCE(
            SUM(${car_maintain.price_maintain}),
            0
          )
        `,
      })
      .from(car_maintain)
      .where(maintainConditions.length ? and(...maintainConditions) : undefined)
      .groupBy(
        sql`
          DATE_FORMAT(
            ${car_maintain.date_maintain},
            '%Y-%m'
          )
        `,
      );

    // OIL BY MONTH

    const oilMonthly = await db
      .select({
        month: sql<string>`
      DATE_FORMAT(
        ${car_oil.date_oil},
        '%Y-%m'
      )
    `,

        amount: sql<string>`
      COALESCE(
        SUM(${car_oil.price_oil}),
        0
      )
    `,
      })
      .from(car_oil)
      .where(oilConditions.length ? and(...oilConditions) : undefined)
      .groupBy(
        sql`
      DATE_FORMAT(
        ${car_oil.date_oil},
        '%Y-%m'
      )
    `,
      )
      .orderBy(
        sql`
      DATE_FORMAT(
        ${car_oil.date_oil},
        '%Y-%m'
      )
    `,
      );

    // MERGE MONTHS

    const monthlyMap = new Map<
      string,
      {
        month: string;
        oil: number;
        maintain: number;
      }
    >();

    for (const item of oilMonthly) {
      monthlyMap.set(item.month, {
        month: item.month,
        oil: Number(item.amount) || 0,
        maintain: 0,
      });
    }

    for (const item of maintainMonthly) {
      const current = monthlyMap.get(item.month);

      if (current) {
        current.maintain = Number(item.amount) || 0;
      } else {
        monthlyMap.set(item.month, {
          month: item.month,
          oil: 0,
          maintain: Number(item.amount) || 0,
        });
      }
    }

    const monthly = Array.from(monthlyMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month),
    );

    const totalOil = Number(oilSummary[0]?.total) || 0;

    const oilCount = Number(oilSummary[0]?.count) || 0;

    const totalMaintain = Number(maintainSummary[0]?.total) || 0;

    const maintainCount = Number(maintainSummary[0]?.count) || 0;

    return NextResponse.json({
      success: true,

      summary: {
        totalOil,
        totalMaintain,

        grandTotal: totalOil + totalMaintain,

        oilCount,
        maintainCount,
      },

      monthly,
    });
  } catch (error) {
    console.error('GET /api/dashboard/car-expenses error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดข้อมูล Dashboard ได้',
      },
      {
        status: 500,
      },
    );
  }
}
