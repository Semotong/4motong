'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        router.push('/admin/plans');
      } else {
        setError(data.message || '로그인에 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 p-8"
      >
        <h1 className="text-lg font-bold mb-1">세이브모바일 관리자</h1>
        <p className="text-sm text-gray-500 mb-6">요금제 데이터 관리 페이지</p>

        <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium disabled:opacity-50"
        >
          {loading ? '확인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
