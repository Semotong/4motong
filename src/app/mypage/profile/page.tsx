'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user, loading, refresh } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  if (loading) return <div className="text-center py-10 text-gray-400">불러오는 중...</div>;

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">👤</p>
        <h2 className="text-lg font-bold text-gray-900 mb-2">로그인이 필요해요</h2>
        <Link href="/auth/login"
          className="text-sm font-bold text-white px-6 py-3 rounded-xl inline-block mt-2"
          style={{ backgroundColor: '#17B4E8' }}>
          로그인
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (data.success) {
        await refresh();
        setIsError(false);
        setMessage('저장되었어요');
      } else {
        setIsError(true);
        setMessage(data.message || '저장에 실패했어요');
      }
    } catch {
      setIsError(true);
      setMessage('저장에 실패했어요');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4">
        <Link href="/mypage" className="text-gray-400 text-sm">← 마이페이지</Link>
      </div>
      <h1 className="text-xl font-extrabold text-gray-900 tracking-tight mb-4">내 정보 수정</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">이메일</label>
          <input value={user.email} disabled
            className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">이름</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
            placeholder="이름" required />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">휴대폰 번호</label>
          <input value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
            placeholder="010-0000-0000" />
        </div>

        {message && (
          <p className="text-sm text-center" style={{ color: isError ? '#E74C3C' : '#17B4E8' }}>{message}</p>
        )}

        <button type="submit" disabled={saving}
          className="w-full text-sm font-bold text-white py-3.5 rounded-xl disabled:opacity-60"
          style={{ backgroundColor: '#17B4E8' }}>
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </form>
    </div>
  );
}
