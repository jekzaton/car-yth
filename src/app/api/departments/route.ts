import { db } from '@/db';
import { departments } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const departmentList = await db.select().from(departments);

    return NextResponse.json({ success: true, data: departmentList });
  } catch (error) {
    console.error('Error fetching  Departments:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch departments' },
      { status: 500 },
    );
  }
}
