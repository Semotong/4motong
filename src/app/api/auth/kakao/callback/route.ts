import { NextRequest, NextResponse } from 'next/server';
import { signToken, hashPassword } from '@/lib/auth';
import { createUser, getUserByEmail } from '@/lib/db';

// 카카오 로그인 콜백 처리
// 1) 인가 코드(code) -> 액세스 토큰 교환 (카카오 /oauth/token, client_secret 포함)
// 2) 액세스 토큰으로 카카오 사용자 정보 조회 (카카오 /v2/user/me)
// 3) 이메일 기준으로 기존 회원 조회 -> 없으면 자동 가입, 있으면 로그인 처리
// 4) 기존 이메일/비밀번호 로그인과 동일한 세션 쿠키(nemotong_token) 발급 후 홈으로 리다이렉트

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const errorParam = req.nextUrl.searchParams.get('error');

const restApiKey = process.env.KAKAO_REST_API_KEY;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;
  const redirectUri =
    process.env.KAKAO_REDIRECT_URI || `${req.nextUrl.origin}/api/auth/kakao/callback`;

if (errorParam || !code || !restApiKey) {
  const url = new URL('/auth/login', req.nextUrl.origin);
  url.searchParams.set('kakao', 'failed');
  return NextResponse.redirect(url);
}

try {
  const tokenParams: Record<string, string> = {
    grant_type: 'authorization_code',
    client_id: restApiKey,
    redirect_uri: redirectUri,
    code,
  };
  if (clientSecret) {
    tokenParams.client_secret = clientSecret;
  }

  const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(tokenParams),
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error('카카오 토큰 발급 실패');
  }

  const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = await profileRes.json();

  const email: string | undefined = profile?.kakao_account?.email;
  const nickname: string =
    profile?.kakao_account?.profile?.nickname || profile?.properties?.nickname || '카카오사용자';

  if (!email) {
    // 카카오 계정에 이메일 제공 동의가 없으면 이메일 기준 계정 매칭이 불가능함
  const url = new URL('/auth/login', req.nextUrl.origin);
    url.searchParams.set('kakao', 'no_email');
    return NextResponse.redirect(url);
  }

  let user = await getUserByEmail(email);
  if (!user) {
    // 카카오 최초 로그인 -> 자동 회원가입 (비밀번호는 사용하지 않으므로 임의 값으로 채움)
  const randomPassword = `kakao_${crypto.randomUUID()}_${Date.now()}`;
    const passwordHash = await hashPassword(randomPassword);
    user = await createUser({
      email,
      passwordHash,
      name: nickname,
      agreeMarketing: false,
    });
  }

  const token = signToken({ id: user.id, email: user.email, name: user.name });

  const res = NextResponse.redirect(new URL('/', req.nextUrl.origin));
  res.cookies.set('nemotong_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
} catch (e) {
  console.error('Kakao login error:', e);
  const url = new URL('/auth/login', req.nextUrl.origin);
  url.searchParams.set('kakao', 'failed');
  return NextResponse.redirect(url);
}
}
