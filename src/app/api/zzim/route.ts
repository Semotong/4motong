import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { getZzimsByUser, addZzim, removeZzim } from '@/lib/db';
import { mockPlans } from '@/lib/planUtils';

function getUser(req: NextRequest) {
  const token = getTokenFromCookie(req.headers.get('cookie'));
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ success: false, message: '로그인 필요' }, { status: 401 });

  const zzims = await getZzimsByUser(user.id);
  const planIds = zzims.map(z => z.plan_id);
  const plans = mockPlans.filter(p => planIds.includes(p.id));

  return NextResponse.json({ success: true, data: plans, ids: planIds });
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ success: false, message: '로그인 필요' }, { status: 401 });

  const { planId } = await req.json();
  if (!planId) return NextResponse.json({ success: false, message: 'planId 필요' }, { status: 400 });

  const zzims = await getZzimsByUser(user.id);
  const exists = zzims.find(z => z.plan_id === planId);

  if (exists) {
    await removeZzim(user.id, planId);
    return NextResponse.json({ success: true, action: 'removed', planId });
  } else {
    await addZzim(user.id, planId);
    return NextResponse.json({ success: true, action: 'added', planId });
  }
}
