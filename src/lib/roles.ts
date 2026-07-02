// 사용자 권한(롤) 정의 — 세모통 admin 권한 체계를 참조한 4단계 구조.
// 롤 추가/수정은 이 파일만 바꾸면 전체에 반영됩니다.

export type Role = 'super_admin' | 'admin' | 'operator' | 'user';

export interface RoleDef {
  value: Role;
  label: string;
  desc: string;
}

// 상위 권한 → 하위 권한 순서
export const ROLES: RoleDef[] = [
  { value: 'super_admin', label: '최고관리자', desc: '모든 권한 + 회원 권한(롤) 관리' },
  { value: 'admin', label: '관리자', desc: '요금제 · 공지 · 배너 등 콘텐츠 관리' },
  { value: 'operator', label: '운영자', desc: '공지 / 고객서비스 등 제한적 관리' },
  { value: 'user', label: '일반회원', desc: '관리자 페이지 접근 불가' },
];

// 관리자 페이지에 접근 가능한 롤
export const ADMIN_ROLES: Role[] = ['super_admin', 'admin', 'operator'];

export function isAdminRole(role?: string | null): boolean {
  return !!role && (ADMIN_ROLES as string[]).includes(role);
}

// 회원 권한(롤)을 변경할 수 있는 롤 — 최고관리자 전용
export function canManageRoles(role?: string | null): boolean {
  return role === 'super_admin';
}

export function roleLabel(role?: string | null): string {
  return ROLES.find((r) => r.value === role)?.label ?? '일반회원';
}

export function isValidRole(role: unknown): role is Role {
  return typeof role === 'string' && ROLES.some((r) => r.value === role);
}
