import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookie, signToken } from '@/lib/auth';
import { getUserById, updateUser } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = getTokenFromCookie(req.headers.get('cookie'));
  if (!token) return NextResponse.json({ success: false, user: null });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ success: false, user: null });

  const user = await getUserById(payload.id);
  if (!user) return NextResponse.json({ success: false, user: null });

  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role },
  });
}

export async function PATCH(req: NextRequest) {
  const token = getTokenFromCookie(req.headers.get('cookie'));
  if (!token) return NextResponse.json({ success: false, message: '로그인이 필요해요' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ success: false, message: '로그인이 필요해요' }, { status: 401 });

  const body = await req.json();
  const name = typeof body.name === 'string' ? body.name.trim() : undefined;
  const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined;

  if (!name) return NextResponse.json({ success: false, message: '이름을 입력해주세요' }, { status: 400 });

  const updated = await updateUser(payload.id, { name, phone });
  if (!updated) return NextResponse.json({ success: false, message: '수정에 실패했어요' }, { status: 500 });

  // 이름이 바뀌었으니 세션 토큰도 새 이름으로 갱신
  const newToken = signToken({ id: updated.id, email: updated.email, name: updated.name, role: updated.role });
  const res = NextResponse.json({
    success: true,
    user: { id: updated.id, email: updated.email, name: updated.name, phone: updated.phone },
  });
  res.cookies.set('nemotong_token', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set('nemotong_token', '', { maxAge: 0, path: '/' });
  return res;
}
