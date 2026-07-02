import { NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { verifyToken } from '@/lib/auth';
import { isAdminRole } from '@/lib/roles';

// 관리자 인증
// 1) 로그인 계정의 롤(super_admin/admin/operator) 기반 접근 — 기본 방식
// 2) 마스터 비밀번호(ADMIN_PASSWORD) 세션 — 부트스트랩/비상용 fallback (최고관리자로 취급)

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
  return { token: issuedAt + '.' + sig, maxAge: MAX_AGE_SECONDS };
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

export interface AdminContext {
  ok: boolean;
  role: string | null;
  name: string | null;
  via: 'password' | 'account' | null;
}

// 요청의 관리자 컨텍스트를 해석한다.
export function resolveAdmin(req: NextRequest): AdminContext {
  // 1) 마스터 비밀번호 세션 (부트스트랩/비상용) → 최고관리자로 취급
  const pwToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (verifySessionToken(pwToken)) {
    return { ok: true, role: 'super_admin', name: '마스터', via: 'password' };
  }
  // 2) 로그인 계정의 롤 기반 (nemotong_token)
  const userToken = req.cookies.get('nemotong_token')?.value;
  const payload = userToken ? verifyToken(userToken) : null;
  if (payload && isAdminRole(payload.role)) {
    return { ok: true, role: payload.role ?? null, name: payload.name ?? null, via: 'account' };
  }
  return { ok: false, role: null, name: null, via: null };
}

export function isAdminRequest(req: NextRequest): boolean {
  return resolveAdmin(req).ok;
}

export const ADMIN_COOKIE_MAX_AGE = MAX_AGE_SECONDS;
