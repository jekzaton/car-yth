import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withAdmin } from '@/lib/withAuth';

export const DELETE = withAdmin(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get('id'));

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสผู้ใช้งานไม่ถูกต้อง',
        },
        { status: 400 },
      );
    }

    const existing = await db
      .select({
        id: users.id,
        cid: users.cid,
        firstName: users.first_name,
        lastName: users.last_name,
        statusLevel: users.statusLevel,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลผู้ใช้งาน',
        },
        { status: 404 },
      );
    }

    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: 'ลบข้อมูลผู้ใช้งานเรียบร้อยแล้ว',
      data: {
        id: existing[0].id,
        cid: existing[0].cid,
        fullName: `${existing[0].firstName} ${existing[0].lastName}`,
      },
    });
  } catch (error) {
    console.error('DELETE /api/users/del error:', error);

    const databaseError = error as {
      code?: string;
      message?: string;
    };

    if (databaseError.code === 'ER_ROW_IS_REFERENCED_2') {
      return NextResponse.json(
        {
          success: false,
          message:
            'ไม่สามารถลบผู้ใช้งานนี้ได้ เนื่องจากมีข้อมูลอื่นอ้างอิงอยู่',
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดระหว่างลบข้อมูลผู้ใช้งาน',
      },
      { status: 500 },
    );
  }
});
