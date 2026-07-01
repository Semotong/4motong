import { NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

// 관리자 페이지 보호용 심플 비밀번호 게이트
// Vercel 환경변수 ADMIN_PASSWORD 하나만 설정하면 됨 (DB/Supabase 불필요)

export const ADMIN_COOKIE_NAME = 'sm_admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7일

function getSecret(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) {
    throw new Error('ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.');
  }
  return pw;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || !input) return false;
  return safeEqual(input, pw);
}

export function createSessionToken(): { token: string; maxAge: number } {
  const issuedAt = Date.now().toString();
  const sig = sign(issuedAt);
  return { token: `${issuedAt}.${sig}`, maxAge: MAX_AGE_SECONDS };
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [issuedAt, sig] = parts;
  if (!issuedAt || !sig) return false;

let expected: string;
  try {
    expected = sign(issuedAt);
  } catch {
    return false;
  }
  if (!safeEqual(expected, sig)) return false;

const age = Date.now() - Number(issuedAt);
  return age >= 0 && age <= MAX_AGE_SECONDS * 1000;
}

export function isAdminRequest(req: NextRequest): boolean {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export const ADMIN_COOKIE_MAX_AGE = MAX_AGE_SECONDS;
