import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logout success',
  });

  response.cookies.set({
    name: 'auth_token',
    value: '',
    path: '/',
    httpOnly: true,
    expires: new Date(0), // ลบ cookie
  });

  return response;
}
