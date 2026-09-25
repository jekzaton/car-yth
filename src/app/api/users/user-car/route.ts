import { NextRequest, NextResponse } from 'next/server';
import { and, asc, eq, ne, notExists, or, sql } from 'drizzle-orm';

import { db } from '@/db';
import {
  car_booking,
  departments,
  position,
  systems,
  users,
} from '@/db/schema';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type UserStatus = 'active' | 'inactive';

// =====================================================
// GET /api/users/user-car
//
// ใช้ได้ 2 กรณี:
//
// 1. TableUserCar
//    /api/users/user-car?status=all
//
// 2. DriverSelect
//    /api/users/user-car
//      ?status=active
//      &bookingId=1
//      &startDate=2026-09-08
//      &startTime=08:00
//      &endDate=2026-09-08
//      &endTime=12:00
//
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const statusParam = searchParams.get('status') ?? 'all';

    const bookingId = Number(searchParams.get('bookingId') ?? 0);

    const startDate = searchParams.get('startDate')?.trim() ?? '';
    const startTime = searchParams.get('startTime')?.trim() ?? '';

    const endDate = searchParams.get('endDate')?.trim() ?? '';
    const endTime = searchParams.get('endTime')?.trim() ?? '';

    // =====================================================
    // ตรวจว่า request นี้มาจาก DriverSelect หรือไม่
    // =====================================================

    const isDriverAvailabilityRequest =
      bookingId > 0 && !!startDate && !!startTime && !!endDate && !!endTime;

    // =====================================================
    // หาคนขับปัจจุบันของ booking
    //
    // สำคัญ:
    // คนขับที่เลือกอยู่แล้วต้องยังแสดงใน dropdown
    // =====================================================

    let currentDriverCode = '';

    if (bookingId > 0) {
      const currentBooking = await db
        .select({
          cUCode: car_booking.cUCode,
        })
        .from(car_booking)
        .where(eq(car_booking.bookingId, bookingId))
        .limit(1);

      currentDriverCode = currentBooking[0]?.cUCode?.trim() ?? '';
    }

    // =====================================================
    // BASE CONDITIONS
    // =====================================================

    const conditions = [
      // ระบบรถยนต์เท่านั้น
      eq(users.system_id, 2),
    ];

    // =====================================================
    // STATUS
    // =====================================================

    if (statusParam === 'active') {
      /*
       * ถ้าเป็น DriverSelect
       *
       * ปกติเอาเฉพาะ active
       * แต่ถ้าคนขับปัจจุบัน inactive ไปแล้ว
       * ยังให้แสดงชื่อเดิมได้
       */

      if (currentDriverCode) {
        conditions.push(
          or(
            eq(users.status, 'active'),
            eq(users.user_code, currentDriverCode),
          )!,
        );
      } else {
        conditions.push(eq(users.status, 'active'));
      }
    }

    if (statusParam === 'inactive') {
      conditions.push(eq(users.status, 'inactive'));
    }

    // =====================================================
    // DRIVER AVAILABILITY
    //
    // ตรวจเฉพาะตอน DriverSelect ส่งวันเวลามาครบ
    // =====================================================

    if (isDriverAvailabilityRequest) {
      conditions.push(
        notExists(
          db
            .select({
              bookingId: car_booking.bookingId,
            })
            .from(car_booking)
            .where(
              and(
                // -------------------------------------------------
                // booking ต้องเป็นของคนขับคนนี้
                // -------------------------------------------------

                eq(car_booking.cUCode, users.user_code),

                // -------------------------------------------------
                // ไม่เอา booking ปัจจุบันมาชนกับตัวเอง
                // -------------------------------------------------

                ne(car_booking.bookingId, bookingId),

                // -------------------------------------------------
                // cancelled = ถือว่าว่าง
                // -------------------------------------------------

                ne(car_booking.status, 'cancelled'),

                // -------------------------------------------------
                // ตรวจช่วงเวลาทับซ้อน
                //
                // existingStart < newEnd
                // AND
                // existingEnd > newStart
                //
                // -------------------------------------------------

                sql`
                  TIMESTAMP(
                    ${car_booking.startDate},
                    ${car_booking.startTime}
                  )
                  <
                  TIMESTAMP(
                    ${endDate},
                    ${endTime}
                  )
                `,

                sql`
                  TIMESTAMP(
                    ${car_booking.endDate},
                    ${car_booking.endTime}
                  )
                  >
                  TIMESTAMP(
                    ${startDate},
                    ${startTime}
                  )
                `,
              ),
            ),
        ),
      );
    }

    // =====================================================
    // QUERY USERS
    // =====================================================

    const result = await db
      .select({
        // USER
        id: users.id,

        userCode: users.user_code,

        cid: users.cid,

        prefix: users.prefix,
        firstName: users.first_name,
        lastName: users.last_name,

        phone: users.phone,

        // DEPARTMENT
        depId: users.dep_id,
        departmentName: departments.dep_name,

        // POSITION
        psId: users.ps_id,
        positionName: position.ps_name,

        // STATUS
        status: users.status,
        statusLevel: users.statusLevel,

        // SYSTEM
        systemId: users.system_id,
        systemName: systems.system_name,

        // DATE
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })

      .from(users)

      // ===================================================
      // POSITION
      // ===================================================

      .leftJoin(position, eq(position.ps_id, users.ps_id))

      // ===================================================
      // DEPARTMENT
      // ===================================================

      .leftJoin(departments, eq(departments.dep_id, users.dep_id))

      // ===================================================
      // SYSTEM
      // ===================================================

      .leftJoin(systems, eq(systems.system_id, users.system_id))

      // ===================================================
      // CONDITIONS
      // ===================================================

      .where(and(...conditions))

      // ===================================================
      // SORT
      // ===================================================

      .orderBy(asc(users.first_name), asc(users.last_name));

    // =====================================================
    // FORMAT DATA
    // =====================================================

    const data = result.map((user) => {
      const fullName = [user.prefix, user.firstName, user.lastName]
        .filter(Boolean)
        .join(' ');

      return {
        id: user.id,

        userCode: user.userCode,

        cid: user.cid,

        prefix: user.prefix,
        firstName: user.firstName,
        lastName: user.lastName,

        fullName,

        phone: user.phone,

        depId: user.depId,
        departmentName: user.departmentName ?? null,

        psId: user.psId,
        positionName: user.positionName ?? null,

        status: user.status as UserStatus,
        statusLevel: user.statusLevel,

        systemId: user.systemId,
        systemName: user.systemName ?? null,

        createdAt: user.createdAt,
        updatedAt: user.updatedAt,

        // บอก frontend ว่าคนนี้คือคนขับที่เลือกอยู่
        isCurrentDriver:
          !!currentDriverCode && user.userCode === currentDriverCode,
      };
    });

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json(
      {
        success: true,

        total: data.length,

        data,
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
    console.error('GET /api/users/user-car error:', error);

    return NextResponse.json(
      {
        success: false,

        message: 'ไม่สามารถโหลดข้อมูลผู้ใช้งานรถได้',

        total: 0,

        data: [],
      },
      {
        status: 500,
      },
    );
  }
}
