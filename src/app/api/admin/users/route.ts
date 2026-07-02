import { NextRequest, NextResponse } from 'next/server';
import { resolveAdmin } from '@/lib/adminAuth';
import { getAllUsers, updateUserRole } from '@/lib/db';
import { canManageRoles, isValidRole, ROLES } from '@/lib/roles';

// 회원 목록 조회 — 관리자(super_admin/admin/operator) 접근 가능
export async function GET(req: NextRequest) {
  const ctx = resolveAdmin(req);
  if (!ctx.ok) {
    return NextResponse.json({ success: false, message: '인증이 필요합니다.' }, { status: 401 });
  }
  const users = await getAllUsers();
  return NextResponse.json({
    success: true,
    canManage: canManageRoles(ctx.role),
    roles: ROLES,
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone || '',
      role: u.role || 'user',
      createdAt: u.created_at,
    })),
  });
}

// 회원 권한(롤) 변경 — 최고관리자 전용
export async function PATCH(req: NextRequest) {
  const ctx = resolveAdmin(req);
  if (!ctx.ok) {
    return NextResponse.json({ success: false, message: '인증이 필요합니다.' }, { status: 401 });
  }
  if (!canManageRoles(ctx.role)) {
    return NextResponse.json(
      { success: false, message: '권한(롤)을 변경할 권한이 없습니다. (최고관리자 전용)' },
      { status: 403 }
    );
  }
  const body = await req.json();
  const id = Number(body.id);
  const role = body.role;
  if (!id || !isValidRole(role)) {
    return NextResponse.json({ success: false, message: '잘못된 요청입니다.' }, { status: 400 });
  }
  const updated = await updateUserRole(id, role);
  if (!updated) {
    return NextResponse.json({ success: false, message: '변경에 실패했습니다.' }, { status: 500 });
  }
  return NextResponse.json({ success: true, user: { id: updated.id, role: updated.role } });
}
