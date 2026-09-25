import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withAdmin } from '@/lib/withAuth';

type UserStatus = 'active' | 'inactive';

export const PATCH = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();

    const userId = Number(body.id);
    const status = body.status as UserStatus;

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสผู้ใช้งานไม่ถูกต้อง',
        },
        { status: 400 },
      );
    }

    if (status !== 'active' && status !== 'inactive') {
      return NextResponse.json(
        {
          success: false,
          message: 'สถานะผู้ใช้งานไม่ถูกต้อง',
        },
        { status: 400 },
      );
    }

    await db
      .update(users)
      .set({
        status,
      })
      .where(eq(users.id, userId));

    const [updatedUser] = await db
      .select({
        id: users.id,
        status: users.status,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลผู้ใช้งาน',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'อัปเดตสถานะเรียบร้อยแล้ว',
      data: updatedUser,
    });
  } catch (error) {
    console.error('PATCH /api/users/status error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถอัปเดตสถานะได้',
      },
      { status: 500 },
    );
  }
});
