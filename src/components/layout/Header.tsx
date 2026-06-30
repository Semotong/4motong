'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-screen-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span style={{ color: '#4A90D9' }}>세이브</span>
          <span className="text-gray-900">모바일</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/plans" className="hover:text-blue-500 transition-colors">요금제 전체</Link>
          <Link href="/plans?type=5g" className="hover:text-blue-500 transition-colors">5G</Link>
          <Link href="/plans?type=lte" className="hover:text-blue-500 transition-colors">LTE</Link>
        </nav>

        <div className="flex items-center gap-2">
          {!loading && (
            user ? (
              <>
                <span className="hidden md:block text-sm text-gray-600">
                  <span style={{ color: '#4A90D9' }} className="font-bold">{user.name}</span>님
                </span>
                <button
                  onClick={handleLogout}
                  className="hidden md:block text-sm text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  로그아웃
                </button>
                <Link
                  href="/mypage"
                  className="text-sm font-semibold text-white px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: '#4A90D9' }}
                >
                  마이페이지
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hidden md:block text-sm text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm font-semibold text-white px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: '#4A90D9' }}
                >
                  회원가입
                </Link>
              </>
            )
          )}
          <button
            className="md:hidden p-1.5 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-3 text-sm text-gray-700">
          <Link href="/plans" onClick={() => setMenuOpen(false)}>요금제 전체</Link>
          <Link href="/plans?type=5g" onClick={() => setMenuOpen(false)}>5G 요금제</Link>
          <Link href="/mypage/zzim" onClick={() => setMenuOpen(false)}>찜 목록</Link>
          {user ? (
            <>
              <Link href="/mypage" onClick={() => setMenuOpen(false)}>마이페이지</Link>
              <button onClick={handleLogout} className="text-left text-red-500">로그아웃</button>
            </>
          ) : (
            <Link href="/auth/login" onClick={() => setMenuOpen(false)}>로그인 / 회원가입</Link>
          )}
        </div>
      )}
    </header>
  );
}
