import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { createAuthToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // =========================================================
    // BODY
    // =========================================================

    const body: unknown = await req.json();

    if (
      typeof body !== 'object' ||
      body === null ||
      !('cid' in body) ||
      !('password' in body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง',
        },
        { status: 400 },
      );
    }

    const cid = String(body.cid ?? '').replace(/\D/g, '');
    const password = String(body.password ?? '');

    // =========================================================
    // VALIDATE INPUT
    // =========================================================

    if (!cid || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณากรอกเลขบัตรประชาชนและรหัสผ่าน',
        },
        { status: 400 },
      );
    }

    if (cid.length !== 13) {
      return NextResponse.json(
        {
          success: false,
          message: 'เลขบัตรประชาชนต้องมี 13 หลัก',
        },
        { status: 400 },
      );
    }

    // =========================================================
    // FIND USER
    // =========================================================

    const [user] = await db
      .select({
        id: users.id,
        cid: users.cid,
        firstName: users.first_name,
        lastName: users.last_name,
        password: users.password,
        status: users.status,
        statusLevel: users.statusLevel,
        mustChangePassword: users.mustChangePassword,
      })
      .from(users)
      .where(eq(users.cid, cid))
      .limit(1);

    // =========================================================
    // USER NOT FOUND
    // =========================================================

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'เลขบัตรประชาชนหรือรหัสผ่านไม่ถูกต้อง',
        },
        { status: 401 },
      );
    }

    // =========================================================
    // ACCOUNT STATUS
    // =========================================================

    if (user.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          message: 'บัญชีนี้ถูกระงับการใช้งาน',
        },
        { status: 403 },
      );
    }

    // =========================================================
    // VALIDATE DATABASE DATA
    // =========================================================

    if (!user.cid || user.cid.length !== 13) {
      console.error('Invalid CID in database:', {
        userId: user.id,
      });

      return NextResponse.json(
        {
          success: false,
          message: 'ข้อมูลบัญชีผู้ใช้งานไม่สมบูรณ์ กรุณาติดต่อผู้ดูแลระบบ',
        },
        { status: 500 },
      );
    }

    if (
      typeof user.password !== 'string' ||
      user.password.trim().length === 0
    ) {
      console.error('Invalid password in database:', {
        userId: user.id,
        cid: user.cid,
        passwordType: typeof user.password,
      });

      return NextResponse.json(
        {
          success: false,
          message: 'บัญชีนี้ยังไม่ได้กำหนดรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ',
        },
        { status: 500 },
      );
    }

    // =========================================================
    // CHECK PASSWORD
    // =========================================================

    let passwordMatched = false;

    try {
      passwordMatched = await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('bcrypt.compare error:', {
        userId: user.id,
        cid: user.cid,
        passwordType: typeof user.password,
        error,
      });

      return NextResponse.json(
        {
          success: false,
          message: 'ข้อมูลรหัสผ่านไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ',
        },
        { status: 500 },
      );
    }

    if (!passwordMatched) {
      return NextResponse.json(
        {
          success: false,
          message: 'เลขบัตรประชาชนหรือรหัสผ่านไม่ถูกต้อง',
        },
        { status: 401 },
      );
    }

    // =========================================================
    // ROLE
    // =========================================================

    const statusLevel = user.statusLevel ?? 'user';

    /*
     * ค่า boolean จาก Drizzle ควรเป็น boolean อยู่แล้ว
     * === true ทำให้ค่าที่เข้า JWT ชัดเจนว่าเป็น boolean
     */
    const mustChangePassword = user.mustChangePassword === true;

    // =========================================================
    // CREATE JWT
    // =========================================================

    const token = await createAuthToken({
      userId: user.id,
      cid: user.cid,
      statusLevel,
      mustChangePassword,
    });

    // =========================================================
    // RESPONSE
    // =========================================================

    const response = NextResponse.json(
      {
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ',

        mustChangePassword,

        user: {
          id: user.id,
          cid: user.cid,
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          statusLevel,
          mustChangePassword,
        },
      },
      { status: 200 },
    );

    // =========================================================
    // COOKIE
    // =========================================================

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error: unknown) {
    console.error('POST /api/auth/signin error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดภายในระบบ',
      },
      { status: 500 },
    );
  }
}
