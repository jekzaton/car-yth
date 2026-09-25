// src/lib/auth.ts

import { SignJWT, jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined');
}

const secretKey = new TextEncoder().encode(jwtSecret);

// TYPES

export type StatusLevel = 'user' | 'member' | 'admin';

export interface AuthTokenPayload {
  userId: number;
  cid: string;
  statusLevel: StatusLevel;
  mustChangePassword: boolean;
}

// AUTH ERROR

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);

    this.name = 'AuthError';
    this.status = status;
  }
}

// CREATE TOKEN

export async function createAuthToken(
  payload: AuthTokenPayload,
): Promise<string> {
  return new SignJWT({
    cid: payload.cid,
    statusLevel: payload.statusLevel,
    mustChangePassword: payload.mustChangePassword,
  })
    .setProtectedHeader({
      alg: 'HS256',
    })
    .setSubject(String(payload.userId))
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secretKey);
}

// VERIFY TOKEN

export async function verifyAuthToken(
  token: string,
): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, secretKey);

  const userId = Number(payload.sub);

  const cid = String(payload.cid ?? '');

  const statusLevel = String(payload.statusLevel ?? '');

  const mustChangePassword = payload.mustChangePassword === true;

  if (
    !Number.isInteger(userId) ||
    userId <= 0 ||
    !cid ||
    !['user', 'member', 'admin'].includes(statusLevel)
  ) {
    throw new Error('Invalid token payload');
  }

  return {
    userId,
    cid,
    statusLevel: statusLevel as StatusLevel,
    mustChangePassword,
  };
}

// GET USER FROM REQUEST

export async function getUserFromRequest(
  req: Request | NextRequest,
): Promise<AuthTokenPayload | null> {
  try {
    let token: string | undefined;

    if ('cookies' in req) {
      token = req.cookies.get('auth_token')?.value;
    } else {
      const cookieHeader = req.headers.get('cookie');

      token = cookieHeader
        ?.split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith('auth_token='))
        ?.slice('auth_token='.length);
    }

    if (!token) {
      return null;
    }

    return await verifyAuthToken(decodeURIComponent(token));
  } catch {
    /*
     * JWT หมดอายุ
     * JWT ไม่ถูกต้อง
     * signature ไม่ผ่าน
     */
    return null;
  }
}

// REQUIRE LOGIN
// admin / member / user

export async function requireAuth(
  req: Request | NextRequest,
): Promise<AuthTokenPayload> {
  const user = await getUserFromRequest(req);

  if (!user) {
    throw new AuthError('กรุณาเข้าสู่ระบบ', 401);
  }

  return user;
}

// REQUIRE ADMIN OR MEMBER

export async function requireAdminOrMember(
  req: Request | NextRequest,
): Promise<AuthTokenPayload> {
  const user = await requireAuth(req);

  // ต้องเปลี่ยนรหัสผ่านก่อนใช้งานระบบ
  if (user.mustChangePassword) {
    throw new AuthError('กรุณาเปลี่ยนรหัสผ่านก่อนใช้งานระบบ', 403);
  }

  if (user.statusLevel !== 'admin' && user.statusLevel !== 'member') {
    throw new AuthError('คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้', 403);
  }

  return user;
}

// REQUIRE LOGIN + PASSWORD ALREADY CHANGED

export async function requireReadyUser(
  req: Request | NextRequest,
): Promise<AuthTokenPayload> {
  const user = await requireAuth(req);

  if (user.mustChangePassword) {
    throw new AuthError('กรุณาเปลี่ยนรหัสผ่านก่อนใช้งานระบบ', 403);
  }

  return user;
}
