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

const authRoutes = ['/signin', '/signup'];

// public จริง ๆ
const publicRoutes = [...authRoutes];

const CHANGE_PASSWORD_ROUTE = '/change-password';

const userAllowedRoutes = ['/bookingCar', '/calendar', '/profile'];

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

    const mustChangePassword =
      payload.mustChangePassword === true ||
      payload.mustChangePassword === 'true';

    if (
      !Number.isInteger(userId) ||
      userId <= 0 ||
      cid.length !== 13 ||
      !['user', 'member', 'admin'].includes(statusLevel)
    ) {
      console.error('Invalid auth token payload:', {
        sub: payload.sub,
        cid: payload.cid,
        statusLevel: payload.statusLevel,
        mustChangePassword: payload.mustChangePassword,
      });

      return null;
    }

    return {
      userId,
      cid,
      statusLevel: statusLevel as StatusLevel,
      mustChangePassword,
    };
  } catch (error) {
    console.error('JWT verify failed:', error);
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

  const token = request.cookies.get('auth_token')?.value;

  const authUser = await getAuthPayload(token);

  const isAuthRoute = matchesRoute(pathname, authRoutes);

  const isPublicRoute = matchesRoute(pathname, publicRoutes);

  const isChangePasswordRoute =
    pathname === CHANGE_PASSWORD_ROUTE ||
    pathname.startsWith(`${CHANGE_PASSWORD_ROUTE}/`);

  // ==========================================================
  // 1. COOKIE มี แต่ TOKEN ใช้ไม่ได้
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

  if (authUser.mustChangePassword) {
    if (isChangePasswordRoute) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(CHANGE_PASSWORD_ROUTE, request.url));
  }

  // ==========================================================
  // 5. เปลี่ยน PASSWORD แล้ว ไม่ให้กลับ /change-password
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
  // 8. ROOT
  // ==========================================================

  if (pathname === '/') {
    const home = authUser.statusLevel === 'user' ? USER_HOME : STAFF_HOME;

    return NextResponse.redirect(new URL(home, request.url));
  }

  // ==========================================================
  // 9. ADMIN / MEMBER
  // ==========================================================

  if (authUser.statusLevel === 'admin' || authUser.statusLevel === 'member') {
    return NextResponse.next();
  }

  // ==========================================================
  // 10. USER
  // ==========================================================

  if (authUser.statusLevel === 'user') {
    if (matchesRoute(pathname, userAllowedRoutes)) {
      return NextResponse.next();
    }

    if (pathname === '/dashboard') {
      return NextResponse.redirect(new URL(USER_HOME, request.url));
    }

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
