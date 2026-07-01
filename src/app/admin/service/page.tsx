'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface SvcItem {
  id: string;
  type: 'banner' | 'popup' | 'event';
  title: string;
  imageUrl?: string;
  linkUrl?: string;
  active: boolean;
  startAt?: string;
  endAt?: string;
  createdAt: string;
  updatedAt: string;
}

const TABS = [
  { key: 'banner', label: '배너' },
  { key: 'popup', label: '팝업' },
  { key: 'event', label: '이벤트' },
] as const;

export default function AdminServicePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<'banner' | 'popup' | 'event'>('banner');
  const [items, setItems] = useState<SvcItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [active, setActive] = useState(true);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/service', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setItems(data.items);
    } finally {
      setLoading(false);
    }
  }, []);

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
        loadItems();
      } catch {
        router.push('/admin/login');
      }
    })();
  }, [router, loadItems]);

  function resetForm() {
    setTitle('');
    setImageUrl('');
    setLinkUrl('');
    setActive(true);
    setStartAt('');
    setEndAt('');
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    setSaving(true);
    try {
      const payload = { type: tab, title, imageUrl, linkUrl, active, startAt, endAt };
      const res = editingId
        ? await fetch('/api/admin/service', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingId, ...payload }),
          })
        : await fetch('/api/admin/service', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        resetForm();
      }
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item: SvcItem) {
    setTab(item.type);
    setTitle(item.title);
    setImageUrl(item.imageUrl || '');
    setLinkUrl(item.linkUrl || '');
    setActive(item.active);
    setStartAt(item.startAt || '');
    setEndAt(item.endAt || '');
    setEditingId(item.id);
  }

  async function handleDelete(id: string) {
    if (!confirm('삭제하시겠습니까?')) return;
    const res = await fetch(`/api/admin/service?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) setItems(data.items);
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">확인 중...</div>;
  }

  const filtered = items.filter((it) => it.type === tab);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">서비스 관리</h1>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
              로그아웃
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  resetForm();
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  tab === t.key ? 'text-white' : 'bg-white text-gray-500 border border-gray-200'
                }`}
                style={tab === t.key ? { backgroundColor: '#17B4E8' } : undefined}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="font-semibold mb-4">{editingId ? '수정' : '새로 작성'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">제목</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">이미지 URL</label>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">연결 URL</label>
                <input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">시작일</label>
                <input
                  type="date"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">종료일</label>
                <input
                  type="date"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 mt-3">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              노출 활성화
            </label>

            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                disabled={saving || !title}
                className="text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: '#17B4E8' }}
              >
                {saving ? '저장 중...' : editingId ? '수정 완료' : '등록'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm text-gray-500 px-4 py-2 rounded-lg border border-gray-200"
                >
                  취소
                </button>
              )}
            </div>
          </form>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold mb-4">
              {TABS.find((t) => t.key === tab)?.label} 목록 ({filtered.length})
            </h2>
            {loading ? (
              <p className="text-sm text-gray-500">불러오는 중...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-500">등록된 항목이 없습니다.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            item.active ? 'bg-green-400' : 'bg-gray-300'
                          }`}
                        />
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {item.startAt || '-'} ~ {item.endAt || '-'}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0 text-xs">
                      <button onClick={() => handleEdit(item)} className="text-blue-500 hover:underline">
                        수정
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline">
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
