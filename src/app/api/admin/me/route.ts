import { NextRequest, NextResponse } from 'next/server';
import { resolveAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const ctx = resolveAdmin(req);
  return NextResponse.json({
    authenticated: ctx.ok,
    role: ctx.role,
    name: ctx.name,
    via: ctx.via,
  });
}
