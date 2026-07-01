import { NextRequest, NextResponse } from 'next/server';

// 카카오 로그인 시작점: 카카오 OAuth 인가 코드 요청 페이지로 리다이렉트한다.
// 실제 동작을 위해서는 Vercel 프로젝트 환경변수에 아래 두 값을 등록해야 한다.
//   KAKAO_REST_API_KEY   - 카카오 디벨로퍼스에서 발급받은 REST API 키
//   KAKAO_REDIRECT_URI   - 예: https://www.savemobile.co.kr/api/auth/kakao/callback
// 키가 아직 등록되지 않은 경우, 안내 메시지와 함께 회원가입 페이지로 되돌려보낸다.

export async function GET(req: NextRequest) {
  const restApiKey = process.env.KAKAO_REST_API_KEY;
  const redirectUri =
    process.env.KAKAO_REDIRECT_URI || `${req.nextUrl.origin}/api/auth/kakao/callback`;

  if (!restApiKey) {
    const url = new URL('/auth/signup', req.nextUrl.origin);
    url.searchParams.set('kakao', 'not_configured');
    return NextResponse.redirect(url);
  }

  const authorizeUrl = new URL('https://kauth.kakao.com/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', restApiKey);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('response_type', 'code');

  return NextResponse.redirect(authorizeUrl.toString());
}
