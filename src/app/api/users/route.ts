// src/app/api/users/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, position, departments, systems } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { withAdminOrMember } from '@/lib/withAuth';

// ================= GET ADMIN / MEMBER =================
export const GET = withAdminOrMember(async () => {
  try {
    const data = await db
      .select({
        id: users.id,
        cid: users.cid,
        prefix: users.prefix,
        firstName: users.first_name,
        lastName: users.last_name,
        phone: users.phone,

        status: users.status,
        statusLevel: users.statusLevel,

        depId: users.dep_id,
        departmentName: departments.dep_name,

        psId: users.ps_id,
        positionName: position.ps_name,

        systemId: users.system_id,
        systemName: systems.system_name,

        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .leftJoin(departments, eq(users.dep_id, departments.dep_id))
      .leftJoin(position, eq(users.ps_id, position.ps_id))
      .leftJoin(systems, eq(users.system_id, systems.system_id));

    const formattedData = data.map((user) => ({
      ...user,
      fullName: `${user.prefix}${user.firstName} ${user.lastName}`,
    }));

    return NextResponse.json({
      success: true,
      total: formattedData.length,
      data: formattedData,
    });
  } catch (error) {
    console.error('GET /api/users error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้',
      },
      { status: 500 },
    );
  }
});

// ================= CREATE USER =================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      cid,
      prefix,
      first_name,
      last_name,
      password,
      phone,
      dep_id,
      ps_id,
      system_id = 1,
      status = 'active',
      status_level = 'user',
    } = body;

    if (
      !cid ||
      !prefix ||
      !first_name ||
      !last_name ||
      !password ||
      !phone ||
      !dep_id ||
      !ps_id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        },
        { status: 400 },
      );
    }

    const cleanCid = String(cid).replace(/\D/g, '');
    const cleanPhone = String(phone).replace(/\D/g, '');

    if (cleanCid.length !== 13) {
      return NextResponse.json(
        {
          success: false,
          message: 'เลขบัตรประชาชนต้องมี 13 หลัก',
        },
        { status: 400 },
      );
    }

    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        {
          success: false,
          message: 'เบอร์โทรต้องมี 10 หลัก',
        },
        { status: 400 },
      );
    }

    const existing = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.cid, cleanCid))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'เลขบัตรประชาชนนี้มีอยู่ในระบบแล้ว',
        },
        { status: 409 },
      );
    }

    const hashPassword = await bcrypt.hash(String(password), 10);
    const [lastUser] = await db
      .select({
        userCode: users.user_code,
      })
      .from(users)
      .orderBy(desc(users.user_code))
      .limit(1);

    const lastNumber = lastUser?.userCode ? Number(lastUser.userCode) : 0;

    const nextNumber = lastNumber + 1;

    if (nextNumber > 99999) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสผู้ใช้งานเต็มแล้ว',
        },
        { status: 400 },
      );
    }

    const userCode = String(nextNumber).padStart(5, '0');

    await db.insert(users).values({
      user_code: userCode,
      cid: cleanCid,
      prefix: String(prefix).trim(),
      first_name: String(first_name).trim(),
      last_name: String(last_name).trim(),
      password: hashPassword,
      phone: cleanPhone,
      dep_id: Number(dep_id),
      ps_id: Number(ps_id),
      system_id: Number(system_id),
      status: status === 'inactive' ? 'inactive' : 'active',
      statusLevel:
        status_level === 'admin'
          ? 'admin'
          : status_level === 'member'
            ? 'member'
            : 'user',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'เพิ่มผู้ใช้งานเรียบร้อยแล้ว',
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error('POST /api/users error:', error);

    const databaseError = error as {
      code?: string;
      message?: string;
    };

    if (databaseError.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        {
          success: false,
          message: 'เลขบัตรประชาชนซ้ำ',
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดภายในระบบ',
      },
      { status: 500 },
    );
  }
}
