import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

type StatusLevel = 'user' | 'member' | 'admin';

interface AuthTokenPayload {
  userId: number;
  cid: string;
  statusLevel: StatusLevel;
  mustChangePassword: boolean;
}

const BASE_PATH = '/ythcar';
const SIGNIN_PATH = `${BASE_PATH}/signin`;

const authRoutes = [`${BASE_PATH}/signin`, `${BASE_PATH}/signup`];

const CHANGE_PASSWORD_ROUTE = `${BASE_PATH}/change-password`;

const userAllowedRoutes = [
  `${BASE_PATH}/bookingCar`,
  `${BASE_PATH}/calendar`,
  `${BASE_PATH}/profile`,
];

const USER_HOME = `${BASE_PATH}/calendar`;
const STAFF_HOME = `${BASE_PATH}/dashboard`;

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET is not defined');
}

const secretKey = new TextEncoder().encode(secret);

// ============================================================
// VERIFY JWT
// ============================================================

async function getAuthPayload(
  token?: string,
): Promise<AuthTokenPayload | null> {
  if (!token) return null;

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
// HOME BY ROLE
// ============================================================

function getHome(statusLevel: StatusLevel) {
  return statusLevel === 'user' ? USER_HOME : STAFF_HOME;
}

// ============================================================
// REDIRECT SIGNIN
// ============================================================

function redirectToSignin(request: NextRequest, deleteCookie = false) {
  const signinUrl = new URL(SIGNIN_PATH, request.url);

  const { pathname, search } = request.nextUrl;

  if (pathname !== SIGNIN_PATH) {
    signinUrl.searchParams.set('callbackUrl', `${pathname}${search}`);
  }

  const response = NextResponse.redirect(signinUrl);

  if (deleteCookie) {
    response.cookies.delete({
      name: 'auth_token',
      path: BASE_PATH,
    });
  }

  return response;
}

// ============================================================
// PROXY
// ============================================================

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ทำงานเฉพาะระบบ car-yth
  if (pathname !== BASE_PATH && !pathname.startsWith(`${BASE_PATH}/`)) {
    return NextResponse.next();
  }

  // อนุญาตไฟล์ Static และรูปภาพ
  if (
    pathname.startsWith(`${BASE_PATH}/images/`) ||
    pathname.startsWith(`${BASE_PATH}/_next/`) ||
    pathname === `${BASE_PATH}/favicon.ico`
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;
  const authUser = await getAuthPayload(token);

  const isAuthRoute = matchesRoute(pathname, authRoutes);

  const isChangePasswordRoute =
    pathname === CHANGE_PASSWORD_ROUTE ||
    pathname.startsWith(`${CHANGE_PASSWORD_ROUTE}/`);

  // ==========================================================
  // 1. ไม่มี SESSION หรือ SESSION หมดอายุ
  // ==========================================================

  if (!authUser) {
    // ลบ Cookie เก่าที่หมดอายุหรือไม่ถูกต้อง
    if (token) {
      return redirectToSignin(request, true);
    }

    // ไม่มี Session แต่เข้า Signin / Signup ได้
    if (isAuthRoute) {
      return NextResponse.next();
    }

    // ทุกหน้าอื่นต้อง Login ก่อน
    return redirectToSignin(request);
  }

  // ==========================================================
  // 2. มี SESSION แล้ว ห้ามเข้า SIGNIN / SIGNUP
  // ==========================================================

  if (isAuthRoute) {
    return NextResponse.redirect(
      new URL(getHome(authUser.statusLevel), request.url),
    );
  }

  // ==========================================================
  // 3. บังคับเปลี่ยน PASSWORD
  // ==========================================================

  if (authUser.mustChangePassword) {
    if (isChangePasswordRoute) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(CHANGE_PASSWORD_ROUTE, request.url));
  }

  // ==========================================================
  // 4. เปลี่ยน PASSWORD แล้ว
  // ==========================================================

  if (isChangePasswordRoute) {
    return NextResponse.redirect(
      new URL(getHome(authUser.statusLevel), request.url),
    );
  }

  // ==========================================================
  // 5. UNAUTHORIZED
  // ==========================================================

  if (pathname === `${BASE_PATH}/unauthorized`) {
    return NextResponse.next();
  }

  // ==========================================================
  // 6. ROOT
  // ==========================================================

  if (pathname === BASE_PATH || pathname === `${BASE_PATH}/`) {
    return NextResponse.redirect(
      new URL(getHome(authUser.statusLevel), request.url),
    );
  }

  // ==========================================================
  // 7. ADMIN / MEMBER
  // ==========================================================

  if (authUser.statusLevel === 'admin' || authUser.statusLevel === 'member') {
    return NextResponse.next();
  }

  // ==========================================================
  // 8. USER
  // ==========================================================

  if (authUser.statusLevel === 'user') {
    if (matchesRoute(pathname, userAllowedRoutes)) {
      return NextResponse.next();
    }

    if (pathname === STAFF_HOME) {
      return NextResponse.redirect(new URL(USER_HOME, request.url));
    }

    return NextResponse.redirect(
      new URL(`${BASE_PATH}/unauthorized`, request.url),
    );
  }

  return redirectToSignin(request, true);
}

// ============================================================
// MATCHER
// ============================================================

export const config = {
  matcher: [
    '/ythcar',
    '/ythcar/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
