import { NextResponse } from 'next/server';
import { db } from '@/db';
import { systems } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { withAdminOrMember } from '@/lib/withAuth';

export const GET = withAdminOrMember(async () => {
  try {
    const data = await db
      .select({
        id: systems.id,
        systemId: systems.system_id,
        systemName: systems.system_name,
      })
      .from(systems)
      .orderBy(asc(systems.system_name));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('GET /api/systems error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดข้อมูลระบบได้',
      },
      { status: 500 },
    );
  }
});
