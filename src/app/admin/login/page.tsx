'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminRole } from '@/lib/roles';

interface AccountInfo {
  name: string;
  role: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [account, setAccount] = useState<AccountInfo | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/me', { cache: 'no-store' });
        const data = await res.json();
        if (data.authenticated) {
          router.replace('/admin/plans');
          return;
        }
        const me = await fetch('/api/auth/me', { cache: 'no-store' });
        const meData = await me.json();
        if (meData.success && meData.user) {
          setAccount({ name: meData.user.name, role: meData.user.role || 'user' });
        }
      } catch {
        // ignore
      }
      setChecking(false);
    })();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        router.replace('/admin/plans');
      } else {
        setError(data.message || '로그인에 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const accountIsAdmin = account ? isAdminRole(account.role) : false;

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">확인 중...</div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-lg font-bold mb-1">세이브모바일 관리자</h1>
        <p className="text-sm text-gray-500 mb-6">요금제 · 콘텐츠 관리 페이지</p>

        {accountIsAdmin ? (
          <>
            <div className="mb-3 rounded-lg p-3 text-sm" style={{ background: '#E7F7EF', color: '#159A67' }}>
              <b>{account?.name}</b>님은 관리자 계정입니다. 보안을 위해 다시 로그인하면 관리자 페이지로 들어갈 수 있어요.
            </div>
            <a
              href="/auth/login?redirect=/admin/plans"
              className="block w-full text-center text-white rounded-lg py-2.5 font-medium mb-5"
              style={{ backgroundColor: '#17B4E8' }}
            >
              관리자로 다시 로그인
            </a>
          </>
        ) : account ? (
          <div className="mb-5 rounded-lg p-3 text-sm" style={{ background: '#FEF3F2', color: '#B42318' }}>
            현재 <b>{account.name}</b>님으로 로그인되어 있지만 관리자 권한이 없습니다. 관리자 계정으로 다시 로그인해주세요.
          </div>
        ) : (
          <a
            href="/auth/login?redirect=/admin/plans"
            className="block w-full text-center text-white rounded-lg py-2.5 font-medium mb-5"
            style={{ backgroundColor: '#17B4E8' }}
          >
            관리자 계정으로 로그인
          </a>
        )}

        <div className="flex items-center gap-2 my-4 text-xs text-gray-400">
          <span className="flex-1 border-t border-gray-200" />
          또는 마스터 비밀번호
          <span className="flex-1 border-t border-gray-200" />
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-1">마스터 비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none"
          />

          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full text-white rounded-lg py-2.5 font-medium disabled:opacity-50"
            style={{ backgroundColor: '#17B4E8' }}
          >
            {loading ? '확인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
