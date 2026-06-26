import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, signToken } from '@/lib/auth';
import { createUser, getUserByEmail } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone, agreeMarketing } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, message: '필수 정보를 입력해주세요' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, message: '비밀번호는 8자 이상이어야 해요' }, { status: 400 });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ success: false, message: '이미 사용 중인 이메일이에요' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ email, passwordHash, name, phone, agreeMarketing: !!agreeMarketing });

    const token = signToken({ id: user.id, email: user.email, name: user.name });

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });

    res.cookies.set('nemotong_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return res;
  } catch (e: unknown) {
    console.error('Signup error:', e);
    return NextResponse.json({ success: false, message: '서버 오류가 발생했어요' }, { status: 500 });
  }
}
