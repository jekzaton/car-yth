// src/app/api/auth/change-password/route.ts

import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { AuthError, createAuthToken, requireAuth } from '@/lib/auth';

interface ChangePasswordBody {
  password?: unknown;
  confirmPassword?: unknown;
}

export async function PATCH(request: NextRequest) {
  try {
    // ========================================================
    // AUTH
    // ========================================================

    // ต้องใช้ requireAuth()
    // ห้ามใช้ requireReadyUser()
    // เพราะผู้ใช้ที่ยังไม่ได้เปลี่ยนรหัสต้องเข้า API นี้ได้
    const authUser = await requireAuth(request);

    // ========================================================
    // BODY
    // ========================================================

    let body: ChangePasswordBody;

    try {
      body = (await request.json()) as ChangePasswordBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'รูปแบบข้อมูลไม่ถูกต้อง',
        },
        { status: 400 },
      );
    }

    const password = typeof body.password === 'string' ? body.password : '';

    const confirmPassword =
      typeof body.confirmPassword === 'string' ? body.confirmPassword : '';

    // ========================================================
    // VALIDATE
    // ========================================================

    if (!password || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณากรอกรหัสผ่านใหม่และยืนยันรหัสผ่าน',
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
        },
        { status: 400 },
      );
    }

    // bcrypt ใช้ input สูงสุด 72 bytes
    if (Buffer.byteLength(password, 'utf8') > 72) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสผ่านยาวเกินกว่าที่ระบบรองรับ',
        },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน',
        },
        { status: 400 },
      );
    }

    // ========================================================
    // GET CURRENT USER
    // ========================================================

    const result = await db
      .select({
        id: users.id,
        cid: users.cid,
        password: users.password,
        status: users.status,
        statusLevel: users.statusLevel,
      })
      .from(users)
      .where(eq(users.id, authUser.userId))
      .limit(1);

    const user = result[0];

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลผู้ใช้งาน',
        },
        { status: 404 },
      );
    }

    // ป้องกัน token ที่ข้อมูลไม่ตรงกับ user ปัจจุบัน
    if (user.cid !== authUser.cid) {
      return NextResponse.json(
        {
          success: false,
          message: 'ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง',
        },
        { status: 401 },
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          message: 'บัญชีนี้ถูกระงับการใช้งาน',
        },
        { status: 403 },
      );
    }

    // ========================================================
    // ห้ามใช้ CID เป็น PASSWORD
    // ========================================================

    if (password === user.cid) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสผ่านใหม่ต้องไม่เหมือนเลขบัตรประชาชน',
        },
        { status: 400 },
      );
    }

    // ========================================================
    // ห้ามใช้ PASSWORD เดิม
    // ========================================================

    const sameAsOldPassword = await bcrypt.compare(password, user.password);

    if (sameAsOldPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสผ่านใหม่ต้องไม่เหมือนรหัสผ่านเดิม',
        },
        { status: 400 },
      );
    }

    // ========================================================
    // HASH
    // ========================================================

    const hashedPassword = await bcrypt.hash(password, 12);

    // ========================================================
    // UPDATE
    // ========================================================

    await db
      .update(users)
      .set({
        password: hashedPassword,
        mustChangePassword: false,
      })
      .where(eq(users.id, user.id));

    // ========================================================
    // CREATE NEW TOKEN
    // ========================================================

    const newToken = await createAuthToken({
      userId: user.id,
      cid: user.cid,
      statusLevel: user.statusLevel,
      mustChangePassword: false,
    });

    // ========================================================
    // RESPONSE
    // ========================================================

    const response = NextResponse.json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ',
      user: {
        id: user.id,
        cid: user.cid,
        statusLevel: user.statusLevel,
        mustChangePassword: false,
      },
    });

    // ========================================================
    // COOKIE
    // ========================================================

    const requestUrl = new URL(request.url);

    const forwardedProto = request.headers
      .get('x-forwarded-proto')
      ?.split(',')[0]
      ?.trim()
      .toLowerCase();

    const isHttps =
      requestUrl.protocol === 'https:' || forwardedProto === 'https';

    // แทน JWT เก่าที่ mustChangePassword=true
    response.cookies.set({
      name: 'auth_token',
      value: newToken,
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.status },
      );
    }

    console.error('PATCH /api/auth/change-password error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดภายในระบบ',
      },
      { status: 500 },
    );
  }
}
