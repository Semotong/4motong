import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createSessionToken, ADMIN_COOKIE_NAME } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (typeof password !== 'string' || !verifyPassword(password)) {
      return NextResponse.json(
        { success: false, message: '비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    const { token, maxAge } = createSessionToken();
    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });
    return res;
  } catch {
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}
