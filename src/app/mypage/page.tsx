'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useZzim } from '@/contexts/ZzimContext';
import { useRouter } from 'next/navigation';

const menuItems = [
  { label: '찜한 요금제', href: '/mypage/zzim', icon: '❤️', desc: '관심 요금제 모아보기' },
  { label: '가입 신청 내역', href: '/mypage/orders', icon: '📋', desc: '신청한 요금제 확인' },
  { label: '내 정보 수정', href: '/mypage/profile', icon: '👤', desc: '이름, 연락처 변경' },
  { label: '고객센터', href: '/mypage/support', icon: '💬', desc: '문의 및 도움말' },
];

export default function MyPage() {
  const { user, logout, loading } = useAuth();
  const { zzimIds } = useZzim();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) return <div className="text-center py-10 text-gray-400">불러오는 중...</div>;

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">👤</p>
        <h2 className="text-lg font-bold text-gray-900 mb-2">로그인이 필요해요</h2>
        <p className="text-sm text-gray-500 mb-6">로그인하고 요금제를 관리하세요</p>
        <div className="flex gap-2 justify-center">
          <Link href="/auth/login"
            className="text-sm font-bold text-white px-6 py-3 rounded-xl"
            style={{ backgroundColor: '#4A90D9' }}>
            로그인
          </Link>
          <Link href="/auth/signup"
            className="text-sm font-bold px-6 py-3 rounded-xl border"
            style={{ color: '#4A90D9', borderColor: '#4A90D9' }}>
            회원가입
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 프로필 카드 */}
      <div className="bg-white rounded-2xl p-5 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: '#4A90D9' }}>
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Link href="/mypage/zzim" className="bg-white rounded-2xl p-4 text-center border border-gray-100 hover:border-blue-200 transition-colors">
          <p className="text-2xl font-extrabold" style={{ color: '#4A90D9' }}>{zzimIds.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">찜한 요금제</p>
        </Link>
        <Link href="/mypage/orders" className="bg-white rounded-2xl p-4 text-center border border-gray-100 hover:border-blue-200 transition-colors">
          <p className="text-2xl font-extrabold text-gray-900">0</p>
          <p className="text-xs text-gray-500 mt-0.5">신청 내역</p>
        </Link>
      </div>

      {/* 메뉴 */}
      <div className="bg-white rounded-2xl overflow-hidden mb-3">
        {menuItems.map((item, i) => (
          <Link key={item.href} href={item.href}
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            style={{ borderTop: i > 0 ? '1px solid #F3F4F6' : undefined }}>
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        ))}
      </div>

      <button onClick={handleLogout}
        className="w-full py-3 rounded-2xl bg-white text-sm text-red-400 font-medium border border-gray-100 hover:bg-red-50 transition-colors">
        로그아웃
      </button>
    </>
  );
}
