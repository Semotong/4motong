'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      router.push(redirect || '/');
    } else {
      setError(result.message || '로그인에 실패했어요');
    }
  };

  return (
    <div className="max-w-sm mx-auto pt-8">
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          <span style={{ color: '#17B4E8' }}>네</span>모통
        </Link>
        <p className="text-sm text-gray-500 mt-1">로그인하고 요금제를 관리하세요</p>
      </div>

      <div className="bg-white rounded-2xl p-6 mb-4">
        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">이메일</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
              placeholder="이메일 주소" required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">비밀번호</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
              placeholder="비밀번호" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full text-sm font-bold text-white py-3.5 rounded-xl mt-1 disabled:opacity-60"
            style={{ backgroundColor: '#17B4E8' }}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <hr className="flex-1 border-gray-100" />
          <span className="text-xs text-gray-400">또는</span>
          <hr className="flex-1 border-gray-100" />
        </div>

        <button className="w-full text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
            type="button"
            onClick={() => { window.location.href = '/api/auth/kakao'; }}
          style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#3C1E1E">
            <path d="M12 3C6.477 3 2 6.477 2 10.889c0 2.833 1.715 5.32 4.33 6.806l-.992 3.705a.25.25 0 00.376.274l4.367-2.914C10.35 18.92 11.165 19 12 19c5.523 0 10-3.477 10-7.778C22 6.477 17.523 3 12 3z" />
          </svg>
          카카오로 시작하기
        </button>
      </div>
        
      <p className="text-center text-sm text-gray-500">
        아직 계정이 없으신가요?{' '}
        <Link href="/auth/signup" style={{ color: '#17B4E8' }} className="font-bold">회원가입</Link>
      </p>
    </div>
  );
}
