import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { profile_img, users } from '@/db/schema';

import { AuthError, requireAuth } from '@/lib/auth';

interface UpdateProfileBody {
  prefix?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  phone?: unknown;

  depId?: unknown;
  systemId?: unknown;
  psId?: unknown;

  password?: unknown;
  confirmPassword?: unknown;
}

// ============================================================
// HELPERS
// ============================================================

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getPositiveInteger(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    return null;
  }

  return number;
}

function handleAuthError(error: unknown) {
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

  return null;
}

// ============================================================
// GET
// GET /api/auth/profile
// ============================================================

export async function GET(req: NextRequest) {
  try {
    // ========================================================
    // AUTH
    // ========================================================

    const authUser = await requireAuth(req);

    // ========================================================
    // USER
    // ========================================================

    const result = await db
      .select({
        id: users.id,

        // ACCOUNT
        cid: users.cid,
        userCode: users.user_code,
        status: users.status,
        statusLevel: users.statusLevel,

        // PERSONAL
        prefix: users.prefix,
        firstName: users.first_name,
        lastName: users.last_name,
        phone: users.phone,

        // ORGANIZATION
        depId: users.dep_id,
        psId: users.ps_id,
        systemId: users.system_id,
        profileImage: profile_img.images,
      })
      .from(users)
      .leftJoin(profile_img, eq(profile_img.cid, users.cid))
      .where(eq(users.id, authUser.userId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลผู้ใช้งาน',
        },
        {
          status: 404,
        },
      );
    }

    const user = result[0];

    return NextResponse.json(
      {
        success: true,

        user: {
          id: user.id,

          cid: user.cid,

          userCode: user.userCode ?? null,

          prefix: user.prefix ?? '',

          firstName: user.firstName ?? '',

          lastName: user.lastName ?? '',

          phone: user.phone ?? '',

          depId: user.depId ?? null,

          psId: user.psId ?? null,

          systemId: user.systemId ?? null,

          status: user.status,

          statusLevel: user.statusLevel,

          // ยังไม่มี column ใน users
          profileImage: null,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    const authResponse = handleAuthError(error);

    if (authResponse) {
      return authResponse;
    }

    console.error('GET /api/auth/profile error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดข้อมูลส่วนตัวได้',
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);

    // ========================================================
    // BODY
    // ========================================================

    let body: UpdateProfileBody;

    try {
      body = (await req.json()) as UpdateProfileBody;
    } catch {
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
    // CURRENT USER
    // ========================================================

    const [currentUser] = await db
      .select({
        id: users.id,
        prefix: users.prefix,
        firstName: users.first_name,
        lastName: users.last_name,
        phone: users.phone,
        depId: users.dep_id,
        systemId: users.system_id,
        psId: users.ps_id,
      })
      .from(users)
      .where(eq(users.id, authUser.userId))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลผู้ใช้งาน',
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // UPDATE DATA
    // ========================================================

    const updateData: Partial<typeof users.$inferInsert> = {};

    // Prefix
    if (body.prefix !== undefined) {
      const prefix = getString(body.prefix);

      if (!['นาย', 'นาง', 'น.ส.'].includes(prefix)) {
        return NextResponse.json(
          {
            success: false,
            message: 'คำนำหน้าไม่ถูกต้อง',
          },
          {
            status: 400,
          },
        );
      }

      if (prefix !== currentUser.prefix) {
        updateData.prefix = prefix;
      }
    }

    // First name
    if (body.firstName !== undefined) {
      const firstName = getString(body.firstName);

      if (!firstName) {
        return NextResponse.json(
          {
            success: false,
            message: 'กรุณากรอกชื่อ',
          },
          {
            status: 400,
          },
        );
      }

      if (firstName !== currentUser.firstName) {
        updateData.first_name = firstName;
      }
    }

    // Last name
    if (body.lastName !== undefined) {
      const lastName = getString(body.lastName);

      if (!lastName) {
        return NextResponse.json(
          {
            success: false,
            message: 'กรุณากรอกนามสกุล',
          },
          {
            status: 400,
          },
        );
      }

      if (lastName !== currentUser.lastName) {
        updateData.last_name = lastName;
      }
    }

    // Phone
    if (body.phone !== undefined) {
      const phone = getString(body.phone).replace(/\D/g, '');

      if (phone && !/^0\d{9}$/.test(phone)) {
        return NextResponse.json(
          {
            success: false,
            message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก',
          },
          {
            status: 400,
          },
        );
      }

      if (phone !== (currentUser.phone ?? '')) {
        updateData.phone = phone;
      }
    }

    // Department
    if (body.depId !== undefined) {
      const depId = Number(body.depId);

      if (!Number.isInteger(depId) || depId <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'แผนกไม่ถูกต้อง',
          },
          {
            status: 400,
          },
        );
      }

      if (depId !== currentUser.depId) {
        updateData.dep_id = depId;
      }
    }

    // System
    if (body.systemId !== undefined) {
      const systemId = Number(body.systemId);

      if (!Number.isInteger(systemId) || systemId <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'ฝ่ายไม่ถูกต้อง',
          },
          {
            status: 400,
          },
        );
      }

      if (systemId !== currentUser.systemId) {
        updateData.system_id = systemId;
      }
    }

    // Position
    if (body.psId !== undefined) {
      const psId = Number(body.psId);

      if (!Number.isInteger(psId) || psId <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'ตำแหน่งไม่ถูกต้อง',
          },
          {
            status: 400,
          },
        );
      }

      if (psId !== currentUser.psId) {
        updateData.ps_id = psId;
      }
    }

    // ========================================================
    // PASSWORD
    // ========================================================

    if (body.password !== undefined) {
      const password = getString(body.password);
      const confirmPassword = getString(body.confirmPassword);

      if (password) {
        if (password.length < 6) {
          return NextResponse.json(
            {
              success: false,
              message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
            },
            {
              status: 400,
            },
          );
        }

        if (password !== confirmPassword) {
          return NextResponse.json(
            {
              success: false,
              message: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน',
            },
            {
              status: 400,
            },
          );
        }

        updateData.password = await bcrypt.hash(password, 10);
      }
    }

    // ========================================================
    // NOTHING CHANGED
    // ========================================================

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        updated: false,
        message: 'ไม่มีข้อมูลที่เปลี่ยนแปลง',
      });
    }

    // ========================================================
    // UPDATE
    // ========================================================

    await db.update(users).set(updateData).where(eq(users.id, authUser.userId));

    return NextResponse.json({
      success: true,
      updated: true,
      message: 'บันทึกข้อมูลเรียบร้อยแล้ว',
    });
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

    console.error('PATCH /api/auth/profile error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถบันทึกข้อมูลได้',
      },
      {
        status: 500,
      },
    );
  }
}
