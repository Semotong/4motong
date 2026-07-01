import { NextRequest, NextResponse } from 'next/server';

// 카카오 로그인 콜백 스캐폴딩.
// TODO: KAKAO_REST_API_KEY 발급 후, 아래 흐름을 실제 회원가입/로그인 로직(@/lib/auth, AuthContext)과 연결할 것.
//   1) 인가 코드(code) -> 액세스 토큰 교환 (카카오 /oauth/token)
//   2) 액세스 토큰으로 카카오 사용자 정보 조회 (카카오 /v2/user/me)
//   3) 이메일/닉네임 기준으로 기존 회원 조회 -> 없으면 자동 가입, 있으면 로그인 처리
//   4) 기존 이메일/비밀번호 로그인과 동일한 세션 쿠키 발급 후 홈으로 리다이렉트

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const errorParam = req.nextUrl.searchParams.get('error');

  const restApiKey = process.env.KAKAO_REST_API_KEY;
  const redirectUri =
    process.env.KAKAO_REDIRECT_URI || `${req.nextUrl.origin}/api/auth/kakao/callback`;

  if (errorParam || !code || !restApiKey) {
    const url = new URL('/auth/login', req.nextUrl.origin);
    url.searchParams.set('kakao', 'failed');
    return NextResponse.redirect(url);
  }

  try {
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: restApiKey,
        redirect_uri: redirectUri,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error('카카오 토큰 발급 실패');
    }

    const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();
    void profile; // TODO: profile.kakao_account?.email / profile.properties?.nickname 을 회원가입/로그인 로직에 연결

    // 아직 실제 세션 발급/회원 매칭 로직이 연결되지 않았습니다 (KAKAO_REST_API_KEY 발급 및 후속 작업 대기 중).
    const url = new URL('/auth/login', req.nextUrl.origin);
    url.searchParams.set('kakao', 'not_wired');
    return NextResponse.redirect(url);
  } catch {
    const url = new URL('/auth/login', req.nextUrl.origin);
    url.searchParams.set('kakao', 'failed');
    return NextResponse.redirect(url);
  }
}
