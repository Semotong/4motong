'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function OrdersPage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center py-10 text-gray-400">불러오는 중...</div>;

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">📋</p>
        <h2 className="text-lg font-bold text-gray-900 mb-2">로그인이 필요해요</h2>
        <Link href="/auth/login"
          className="text-sm font-bold text-white px-6 py-3 rounded-xl inline-block mt-2"
          style={{ backgroundColor: '#17B4E8' }}>
          로그인
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4">
        <Link href="/mypage" className="text-gray-400 text-sm">← 마이페이지</Link>
      </div>
      <h1 className="text-xl font-extrabold text-gray-900 tracking-tight mb-4">가입 신청 내역</h1>

      <div className="text-center py-16 bg-white rounded-2xl">
        <p className="text-4xl mb-3">📋</p>
        <p className="font-medium text-gray-900">아직 신청 내역이 없어요</p>
        <p className="text-sm text-gray-500 mt-1 mb-6">요금제 신청은 각 통신사 페이지에서 진행돼요</p>
        <Link href="/plans"
          className="text-sm font-bold text-white px-6 py-3 rounded-xl inline-block"
          style={{ backgroundColor: '#17B4E8' }}>
          요금제 보러가기
        </Link>
      </div>
    </div>
  );
}
