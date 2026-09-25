import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, departments, position, systems } from '@/db/schema';
import { and, eq, ne } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { withAdminOrMember } from '@/lib/withAuth';

type UserStatus = 'active' | 'inactive';
type StatusLevel = 'user' | 'member' | 'admin';

type UpdateUserBody = {
  id?: number | string;
  cid?: string;
  prefix?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  phone?: string;
  dep_id?: number | string;
  ps_id?: number | string;
  system_id?: number | string;
  status?: UserStatus;
  status_level?: StatusLevel;
};

// ================= GET USER FOR EDIT =================
export const GET = withAdminOrMember(async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const userId = Number(requestUrl.searchParams.get('id'));

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสผู้ใช้งานไม่ถูกต้อง',
        },
        { status: 400 },
      );
    }

    const result = await db
      .select({
        id: users.id,
        cid: users.cid,
        prefix: users.prefix,
        firstName: users.first_name,
        lastName: users.last_name,
        phone: users.phone,

        depId: users.dep_id,
        departmentName: departments.dep_name,

        psId: users.ps_id,
        positionName: position.ps_name,

        systemId: users.system_id,
        systemName: systems.system_name,

        status: users.status,
        statusLevel: users.statusLevel,

        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .leftJoin(departments, eq(users.dep_id, departments.dep_id))
      .leftJoin(position, eq(users.ps_id, position.ps_id))
      .leftJoin(systems, eq(users.system_id, systems.system_id))
      .where(eq(users.id, userId))
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

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        fullName: `${user.prefix}${user.firstName} ${user.lastName}`,
      },
    });
  } catch (error) {
    console.error('GET /api/users/edit error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้',
      },
      { status: 500 },
    );
  }
});

// ================= UPDATE USER =================
export const PUT = withAdminOrMember(async (req: Request) => {
  try {
    const body = (await req.json()) as UpdateUserBody;

    const {
      id,
      cid,
      prefix,
      first_name,
      last_name,
      password,
      phone,
      dep_id,
      ps_id,
      system_id,
      status,
      status_level,
    } = body;

    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสผู้ใช้งานไม่ถูกต้อง',
        },
        { status: 400 },
      );
    }

    if (
      !cid ||
      !prefix ||
      !first_name ||
      !last_name ||
      !phone ||
      !dep_id ||
      !ps_id ||
      !system_id ||
      !status ||
      !status_level
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
          message: 'เบอร์โทรศัพท์ต้องมี 10 หลัก',
        },
        { status: 400 },
      );
    }

    const numericDepId = Number(dep_id);
    const numericPsId = Number(ps_id);
    const numericSystemId = Number(system_id);

    if (
      !Number.isInteger(numericDepId) ||
      numericDepId <= 0 ||
      !Number.isInteger(numericPsId) ||
      numericPsId <= 0 ||
      !Number.isInteger(numericSystemId) ||
      numericSystemId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'หน่วยงาน ตำแหน่ง หรือระบบไม่ถูกต้อง',
        },
        { status: 400 },
      );
    }

    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: 'สถานะบัญชีไม่ถูกต้อง',
        },
        { status: 400 },
      );
    }

    if (!['user', 'member', 'admin'].includes(status_level)) {
      return NextResponse.json(
        {
          success: false,
          message: 'ระดับสิทธิ์ไม่ถูกต้อง',
        },
        { status: 400 },
      );
    }

    const existingUser = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลผู้ใช้งาน',
        },
        { status: 404 },
      );
    }

    const duplicateCid = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(and(eq(users.cid, cleanCid), ne(users.id, userId)))
      .limit(1);

    if (duplicateCid.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'เลขบัตรประชาชนนี้มีผู้ใช้งานแล้ว',
        },
        { status: 409 },
      );
    }

    const updateData: {
      cid: string;
      prefix: string;
      first_name: string;
      last_name: string;
      phone: string;
      dep_id: number;
      ps_id: number;
      system_id: number;
      status: UserStatus;
      statusLevel: StatusLevel;
      password?: string;
    } = {
      cid: cleanCid,
      prefix: String(prefix).trim(),
      first_name: String(first_name).trim(),
      last_name: String(last_name).trim(),
      phone: cleanPhone,
      dep_id: numericDepId,
      ps_id: numericPsId,
      system_id: numericSystemId,
      status,
      statusLevel: status_level,
    };

    if (password && String(password).trim() !== '') {
      if (String(password).length < 6) {
        return NextResponse.json(
          {
            success: false,
            message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
          },
          { status: 400 },
        );
      }

      updateData.password = await bcrypt.hash(String(password), 10);
    }

    await db.update(users).set(updateData).where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: 'แก้ไขข้อมูลผู้ใช้งานเรียบร้อยแล้ว',
    });
  } catch (error: unknown) {
    console.error('PUT /api/users/edit error:', error);

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
});
