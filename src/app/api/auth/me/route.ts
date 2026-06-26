import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { getUserById } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = getTokenFromCookie(req.headers.get('cookie'));
  if (!token) return NextResponse.json({ success: false, user: null });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ success: false, user: null });

  const user = await getUserById(payload.id);
  if (!user) return NextResponse.json({ success: false, user: null });

  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, phone: user.phone },
  });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set('nemotong_token', '', { maxAge: 0, path: '/' });
  return res;
}
