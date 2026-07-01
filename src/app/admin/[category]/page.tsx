'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

const CATEGORY_INFO: Record<string, { label: string; desc: string; icon: string }> = {
  members: {
    label: '회원 관리',
    desc: '관리자 계정, 회사 정보, 사용자 목록을 관리하는 기능입니다.',
    icon: '👤',
  },
  orders: {
    label: '주문 관리',
    desc: '요금제 주문 내역과 일련번호를 관리하는 기능입니다.',
    icon: '🧾',
  },
  points: {
    label: '포인트',
    desc: '적립, 현금전환, 네이버페이 연동 포인트 기능입니다.',
    icon: '💰',
  },
  settlement: {
    label: '정산',
    desc: '파트너/제휴사 정산 및 수익 리포트 기능입니다.',
    icon: '📊',
  },
  messaging: {
    label: '카카오톡 / SMS 메시징',
    desc: '카카오톡 알림톡, SMS 발송 관리 기능입니다.',
    icon: '💬',
  },
  kakao: {
    label: '카카오 로그인 연동',
    desc: '카카오 소셜 로그인 REST API 키 연동 상태를 관리하는 화면입니다.',
    icon: '🟡',
  },
};

export default function AdminCategoryStubPage() {
  const router = useRouter();
  const params = useParams<{ category: string }>();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/me', { cache: 'no-store' });
        const data = await res.json();
        if (!data.authenticated) {
          router.push('/admin/login');
          return;
        }
        setChecking(false);
      } catch {
        router.push('/admin/login');
      }
    })();
  }, [router]);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">확인 중...</div>;
  }

  const info = CATEGORY_INFO[params.category] || {
    label: params.category,
    desc: '준비 중인 기능입니다.',
    icon: '⚙️',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold mb-6">{info.label}</h1>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center text-center">
            <div className="text-5xl mb-4">{info.icon}</div>
            <p className="text-lg font-semibold text-gray-700 mb-2">준비 중인 기능입니다</p>
            <p className="text-sm text-gray-400 max-w-sm">{info.desc}</p>
            <span
              className="mt-6 text-xs px-3 py-1 rounded-full font-medium"
              style={{ backgroundColor: '#EAF8FD', color: '#17B4E8' }}
            >
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
