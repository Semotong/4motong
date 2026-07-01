'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    email: '', password: '', passwordConfirm: '', name: '', phone: '',
    agreeAll: false, agreeService: false, agreePrivacy: false, agreeMarketing: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAgreeAll = (checked: boolean) => {
    setForm({ ...form, agreeAll: checked, agreeService: checked, agreePrivacy: checked, agreeMarketing: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) { setError('비밀번호가 일치하지 않아요'); return; }
    if (!form.agreeService || !form.agreePrivacy) { setError('필수 약관에 동의해주세요'); return; }
    setLoading(true);
    setError('');
    const result = await signup({
      email: form.email, password: form.password, name: form.name,
      phone: form.phone, agreeMarketing: form.agreeMarketing,
    });
    setLoading(false);
    if (result.success) router.push('/');
    else setError(result.message || '회원가입에 실패했어요');
  };

  const handleKakaoSignup = () => {
    window.location.href = '/api/auth/kakao';
  };

  return (
    <div className="max-w-sm mx-auto pt-8">
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          <span style={{ color: '#17B4E8' }}>세이브</span>모바일 회원가입
        </Link>
        <p className="text-sm text-gray-500 mt-1">가입하고 요금제를 찜해보세요</p>
      </div>

      <button
        type="button"
        onClick={handleKakaoSignup}
        className="w-full flex items-center justify-center gap-2 text-sm font-bold py-3.5 rounded-xl mb-4"
        style={{ backgroundColor: '#FEE500', color: '#191600' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7-.2.7-.8 2.9-.9 3.4-.1.5.2.5.4.4.2-.1 2.8-1.9 3.9-2.7.6.1 1.2.1 1.9.1 5.5 0 10-3.6 10-8 0-4.4-4.5-8-10-8z" />
        </svg>
        카카오로 시작하기
      </button>

      <div className="flex items-center gap-3 mb-4">
        <hr className="flex-1 border-gray-200" />
        <span className="text-xs text-gray-400">또는 이메일로 가입</span>
        <hr className="flex-1 border-gray-200" />
      </div>

      <div className="bg-white rounded-2xl p-6 mb-4">
        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {[
            { key: 'name', label: '이름', type: 'text', placeholder: '이름' },
            { key: 'email', label: '이메일', type: 'email', placeholder: '이메일 주소' },
            { key: 'phone', label: '휴대폰 번호', type: 'tel', placeholder: '010-0000-0000' },
            { key: 'password', label: '비밀번호', type: 'password', placeholder: '8자 이상' },
            { key: 'passwordConfirm', label: '비밀번호 확인', type: 'password', placeholder: '비밀번호 재입력' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-gray-500 mb-1 block">{f.label}</label>
              <input type={f.type}
                value={form[f.key as keyof typeof form] as string}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
                placeholder={f.placeholder}
                required={f.key !== 'phone'}
                minLength={f.key === 'password' ? 8 : undefined}
              />
            </div>
          ))}

          <div className="mt-2 p-4 bg-gray-50 rounded-xl flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.agreeAll}
                onChange={e => handleAgreeAll(e.target.checked)} className="w-4 h-4 accent-blue-500" />
              <span className="text-sm font-bold text-gray-900">전체 동의</span>
            </label>
            <hr className="border-gray-200" />
            {[
              { key: 'agreeService', label: '서비스 이용약관 (필수)' },
              { key: 'agreePrivacy', label: '개인정보 처리방침 (필수)' },
              { key: 'agreeMarketing', label: '마케팅 정보 수신 (선택)' },
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[item.key as keyof typeof form] as boolean}
                  onChange={e => setForm({ ...form, [item.key]: e.target.checked })}
                  className="w-4 h-4 accent-blue-500" />
                <span className="text-xs text-gray-600">{item.label}</span>
              </label>
            ))}
          </div>

          <button type="submit" disabled={loading}
            className="w-full text-sm font-bold text-white py-3.5 rounded-xl mt-1 disabled:opacity-60"
            style={{ backgroundColor: '#17B4E8' }}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link href="/auth/login" style={{ color: '#17B4E8' }} className="font-bold">로그인</Link>
      </p>
    </div>
  );
}
