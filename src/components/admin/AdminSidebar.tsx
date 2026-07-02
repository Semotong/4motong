'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: string;
  status?: 'live' | 'soon';
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: '회원',
    items: [{ key: 'members', label: '회원 관리', href: '/admin/members', icon: '👤', status: 'live' }],
  },
  {
    title: '고객서비스',
    items: [{ key: 'notices', label: '공지사항 / FAQ', href: '/admin/notices', icon: '📢', status: 'live' }],
  },
  {
    title: '요금제',
    items: [{ key: 'plans', label: '요금제 관리', href: '/admin/plans', icon: '📶', status: 'live' }],
  },
  {
    title: '주문 / 포인트 / 정산',
    items: [
      { key: 'orders', label: '주문 관리', href: '/admin/orders', icon: '🧾', status: 'soon' },
      { key: 'points', label: '포인트', href: '/admin/points', icon: '💰', status: 'soon' },
      { key: 'settlement', label: '정산', href: '/admin/settlement', icon: '📊', status: 'soon' },
    ],
  },
  {
    title: '서비스',
    items: [{ key: 'service', label: '배너 / 팝업 / 이벤트', href: '/admin/service', icon: '🎯', status: 'live' }],
  },
  {
    title: '연동',
    items: [
      { key: 'messaging', label: '카카오톡 / SMS 메시징', href: '/admin/messaging', icon: '💬', status: 'soon' },
      { key: 'kakao', label: '카카오 로그인 연동', href: '/admin/kakao', icon: '🟡', status: 'soon' },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 min-h-screen sticky top-0 hidden md:flex md:flex-col">
      <div className="h-14 flex items-center px-5 border-b border-gray-100">
        <span className="font-bold tracking-tight">
          <span style={{ color: '#17B4E8' }}>세이브</span>
          <span className="text-gray-900">모바일</span>
        </span>
        <span className="ml-2 text-xs text-gray-400 font-medium">Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="px-2 mb-1.5 text-[11px] font-semibold text-gray-400 tracking-wide uppercase">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    style={active ? { color: '#17B4E8', backgroundColor: '#EAF8FD' } : undefined}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none">{item.icon}</span>
                      {item.label}
                    </span>
                    {item.status === 'soon' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium">
                        준비중
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <Link
          href="/"
          className="block text-center text-xs text-gray-400 hover:text-gray-600 py-2"
        >
          ← 사이트로 돌아가기
        </Link>
      </div>
    </aside>
  );
}
