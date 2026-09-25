import { db } from '@/db';
import { position } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const positionList = await db.select().from(position);

    return NextResponse.json({ success: true, data: positionList });
  } catch (error) {
    console.error('Error fetching  Positions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch positions' },
      { status: 500 },
    );
  }
}
