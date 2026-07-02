'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface RoleDef {
  value: string;
  label: string;
  desc: string;
}

interface Member {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
}

export default function AdminMembersPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<RoleDef[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setMembers(data.users);
        setRoles(data.roles);
        setCanManage(data.canManage);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

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
        load();
      } catch {
        router.push('/admin/login');
      }
    })();
  }, [router, load]);

  async function changeRole(id: number, role: string) {
    setSavingId(id);
    setMessage('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role }),
      });
      const data = await res.json();
      if (data.success) {
        setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
        setMessage('권한을 변경했어요. (해당 사용자는 다시 로그인해야 새 권한이 적용됩니다)');
      } else {
        setMessage(data.message || '변경에 실패했어요');
        load();
      }
    } catch {
      setMessage('네트워크 오류가 발생했어요');
    } finally {
      setSavingId(null);
    }
  }

  function roleLabel(v: string) {
    return roles.find((r) => r.value === v)?.label || v;
  }

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">확인 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold mb-2">회원 관리</h1>
          <p className="text-sm text-gray-500 mb-6">
            {canManage
              ? '회원별 권한(롤)을 지정할 수 있어요. 권한 변경은 최고관리자만 가능합니다.'
              : '회원 목록을 볼 수 있어요. 권한 변경은 최고관리자만 가능합니다.'}
          </p>

          {message && (
            <div className="mb-4 rounded-lg p-3 text-sm" style={{ background: '#EBF3FB', color: '#2378C3' }}>
              {message}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {loading ? (
              <p className="text-sm text-gray-500">불러오는 중...</p>
            ) : members.length === 0 ? (
              <p className="text-sm text-gray-500">회원이 없습니다.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200">
                    <th className="py-2">이름</th>
                    <th className="py-2">이메일</th>
                    <th className="py-2">가입일</th>
                    <th className="py-2">권한</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-900">{m.name}</td>
                      <td className="py-2 text-gray-500">{m.email}</td>
                      <td className="py-2 text-gray-500">
                        {new Date(m.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="py-2">
                        {canManage ? (
                          <select
                            value={m.role}
                            disabled={savingId === m.id}
                            onChange={(e) => changeRole(m.id, e.target.value)}
                            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm disabled:opacity-50"
                          >
                            {roles.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-700">{roleLabel(m.role)}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
