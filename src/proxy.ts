// src/proxy.ts

import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

type StatusLevel = 'user' | 'member' | 'admin';

interface AuthTokenPayload {
  userId: number;
  cid: string;
  statusLevel: StatusLevel;
  mustChangePassword: boolean;
}

// ============================================================
// ROUTES
// ============================================================

// หน้า Login / สมัครสมาชิก
const authRoutes = ['/signin', '/signup'];

// หน้าที่ไม่ต้อง Login
const publicRoutes = ['/signin', '/signup', '/unauthorized'];

// หน้าบังคับเปลี่ยนรหัสผ่าน
const CHANGE_PASSWORD_ROUTE = '/change-password';

// USER ทั่วไปเข้าได้
const userAllowedRoutes = ['/bookingCar', '/calendar', '/profile'];

// หน้าเริ่มต้นตาม Role
const USER_HOME = '/calendar';
const STAFF_HOME = '/dashboard';

// ============================================================
// JWT
// ============================================================

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET is not defined');
}

const secretKey = new TextEncoder().encode(secret);

// ============================================================
// VERIFY TOKEN
// ============================================================

async function getAuthPayload(
  token?: string,
): Promise<AuthTokenPayload | null> {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);

    const userId = Number(payload.sub);

    const cid = String(payload.cid ?? '');

    const statusLevel = String(payload.statusLevel ?? '');

    /*
     * รองรับ Token เก่าที่สร้างก่อนมี
     * mustChangePassword
     *
     * ถ้าไม่มี field นี้ ให้ถือว่า false
     */
    const mustChangePassword = payload.mustChangePassword === true;

    if (
      !Number.isInteger(userId) ||
      userId <= 0 ||
      !cid ||
      !['user', 'member', 'admin'].includes(statusLevel)
    ) {
      return null;
    }

    return {
      userId,
      cid,
      statusLevel: statusLevel as StatusLevel,
      mustChangePassword,
    };
  } catch {
    return null;
  }
}

// ============================================================
// ROUTE MATCH
// ============================================================

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

// ============================================================
// REDIRECT -> SIGNIN
// ============================================================

function redirectToSignin(request: NextRequest, deleteCookie = false) {
  const { pathname, search } = request.nextUrl;

  const signinUrl = new URL('/signin', request.url);

  if (pathname !== '/signin') {
    signinUrl.searchParams.set('callbackUrl', `${pathname}${search}`);
  }

  const response = NextResponse.redirect(signinUrl);

  if (deleteCookie) {
    response.cookies.delete('auth_token');
  }

  return response;
}

// ============================================================
// PROXY
// ============================================================

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ==========================================================
  // TOKEN
  // ==========================================================

  const token = request.cookies.get('auth_token')?.value;

  const authUser = await getAuthPayload(token);

  const isAuthRoute = matchesRoute(pathname, authRoutes);

  const isPublicRoute = matchesRoute(pathname, publicRoutes);

  const isChangePasswordRoute =
    pathname === CHANGE_PASSWORD_ROUTE ||
    pathname.startsWith(`${CHANGE_PASSWORD_ROUTE}/`);

  // ==========================================================
  // 1. COOKIE มี แต่ TOKEN หมดอายุ / เสีย
  // ==========================================================

  if (token && !authUser) {
    if (isAuthRoute) {
      const response = NextResponse.next();

      response.cookies.delete('auth_token');

      return response;
    }

    return redirectToSignin(request, true);
  }

  // ==========================================================
  // 2. PUBLIC ROUTE + ยังไม่ได้ LOGIN
  // ==========================================================

  if (isPublicRoute && !authUser) {
    return NextResponse.next();
  }

  // ==========================================================
  // 3. ยังไม่ได้ LOGIN
  // ==========================================================

  if (!authUser) {
    return redirectToSignin(request);
  }

  // ==========================================================
  // 4. บังคับเปลี่ยน PASSWORD
  // ==========================================================

  /*
   * สำคัญ:
   *
   * เมื่อ mustChangePassword = true
   * ผู้ใช้เข้าได้เฉพาะ /change-password
   *
   * ต่อให้พิมพ์:
   * /bookingCar
   * /calendar
   * /profile
   * /dashboard
   *
   * ก็จะถูกส่งกลับมาหน้านี้
   */

  if (authUser.mustChangePassword) {
    if (isChangePasswordRoute) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(CHANGE_PASSWORD_ROUTE, request.url));
  }

  // ==========================================================
  // 5. เปลี่ยน PASSWORD แล้ว
  //    ไม่ควรกลับเข้า /change-password
  // ==========================================================

  if (isChangePasswordRoute) {
    const home = authUser.statusLevel === 'user' ? USER_HOME : STAFF_HOME;

    return NextResponse.redirect(new URL(home, request.url));
  }

  // ==========================================================
  // 6. LOGIN แล้ว แต่เข้า SIGNIN / SIGNUP
  // ==========================================================

  if (isAuthRoute) {
    const home = authUser.statusLevel === 'user' ? USER_HOME : STAFF_HOME;

    return NextResponse.redirect(new URL(home, request.url));
  }

  // ==========================================================
  // 7. UNAUTHORIZED
  // ==========================================================

  if (pathname === '/unauthorized') {
    return NextResponse.next();
  }

  // ==========================================================
  // 8. ADMIN / MEMBER
  // ==========================================================

  if (authUser.statusLevel === 'admin' || authUser.statusLevel === 'member') {
    return NextResponse.next();
  }

  // ==========================================================
  // 9. USER
  // ==========================================================

  if (authUser.statusLevel === 'user') {
    // route ที่ USER เข้าได้
    if (matchesRoute(pathname, userAllowedRoutes)) {
      return NextResponse.next();
    }

    // root/dashboard
    // ส่งกลับหน้าจองรถ
    if (pathname === '/' || pathname === '/dashboard') {
      return NextResponse.redirect(new URL(USER_HOME, request.url));
    }

    // ไม่มีสิทธิ์
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // ==========================================================
  // FALLBACK
  // ==========================================================

  return redirectToSignin(request, true);
}

// ============================================================
// MATCHER
// ============================================================

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
