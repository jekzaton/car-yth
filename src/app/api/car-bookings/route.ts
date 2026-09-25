import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { car_booking } from '@/db/schema/car_booking';
import { verifyAuthToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    const auth = await verifyAuthToken(token);

    if (!auth?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    // =========================
    // GET USER CODE
    // =========================
    const userResult = await db
      .select({
        userCode: users.user_code,
      })
      .from(users)
      .where(eq(users.id, Number(auth.userId)))
      .limit(1);

    if (!userResult.length || !userResult[0].userCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบรหัสผู้ใช้งานของผู้จอง',
        },
        { status: 400 },
      );
    }

    const userCode = userResult[0].userCode;

    // =========================
    // BODY
    // =========================
    const body = await req.json();

    const {
      carCode,
      startDate,
      startTime,
      endDate,
      endTime,
      typeCar,
      levelStatus,
      subject,
      description,
      countPeople,
      listPeople,
      telDep,
      phone,
    } = body;

    // =========================
    // VALIDATE
    // =========================
    if (
      !carCode ||
      !startDate ||
      !startTime ||
      !endDate ||
      !endTime ||
      !typeCar ||
      !levelStatus ||
      !subject ||
      !description ||
      !telDep
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        },
        { status: 400 },
      );
    }

    // =========================
    // INSERT
    // =========================
    await db.insert(car_booking).values({
      carCode,

      // ผู้จอง
      userCode,

      startDate,
      startTime,
      endDate,
      endTime,

      typeCar: Number(typeCar),

      levelStatus,

      subject: String(subject).trim(),
      description: String(description).trim(),

      countPeople: Number(countPeople) || 1,

      listPeople:
        typeof listPeople === 'string' && listPeople.trim()
          ? listPeople.trim()
          : null,

      status: 'pending',

      telDep: String(telDep).trim(),

      phone: typeof phone === 'string' && phone.trim() ? phone.trim() : null,

      // คนขับยังไม่ได้กำหนด
      cUCode: '',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'บันทึกการจองรถเรียบร้อยแล้ว',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('POST car booking error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถบันทึกการจองรถได้',
      },
      { status: 500 },
    );
  }
}
