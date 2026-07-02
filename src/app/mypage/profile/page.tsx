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
  const [verifyOpen, setVerifyOpen] = useState(false);

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
          <input value={name} disabled
            className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-500" />
          <p className="text-xs text-gray-400 mt-1">카카오 또는 본인인증으로 확인된 이름이라 변경할 수 없어요.</p>
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

      {/* 본인인증 */}
      <div className="bg-white rounded-2xl p-6 mt-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900">휴대폰 본인인증</p>
            <p className="text-xs text-gray-400 mt-0.5">통신사 문자로 실명을 확인해요</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: '#F3F4F6', color: '#9CA3AF' }}>미인증</span>
        </div>

        <button type="button" onClick={() => setVerifyOpen(true)}
          className="w-full text-sm font-bold py-3 rounded-xl mt-4 border"
          style={{ color: '#17B4E8', borderColor: '#17B4E8', background: '#fff' }}>
          휴대폰 본인인증하기
        </button>

        {verifyOpen && (
          <div className="mt-3 rounded-xl p-3 text-sm text-center" style={{ background: '#EBF3FB', color: '#2378C3' }}>
            본인인증 기능은 준비 중이에요. 곧 제공될 예정입니다.
          </div>
        )}
      </div>
    </div>
  );
}
