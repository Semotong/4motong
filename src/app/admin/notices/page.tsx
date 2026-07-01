'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface NoticeItem {
  id: string;
  type: 'notice' | 'faq';
  category?: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

const FAQ_CATEGORIES = ['요금제', '가입/개통', '결제', '유심/기기', '기타'];

export default function AdminNoticesPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<'notice' | 'faq'>('notice');
  const [items, setItems] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(FAQ_CATEGORIES[0]);
  const [pinned, setPinned] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notices', { cache: 'no-store' });
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
    setContent('');
    setCategory(FAQ_CATEGORIES[0]);
    setPinned(false);
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !content) return;
    setSaving(true);
    try {
      const payload = {
        type: tab,
        title,
        content,
        pinned,
        category: tab === 'faq' ? category : undefined,
      };
      const res = editingId
        ? await fetch('/api/admin/notices', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingId, ...payload }),
          })
        : await fetch('/api/admin/notices', {
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

  function handleEdit(item: NoticeItem) {
    setTab(item.type);
    setTitle(item.title);
    setContent(item.content);
    setCategory(item.category || FAQ_CATEGORIES[0]);
    setPinned(item.pinned);
    setEditingId(item.id);
  }

  async function handleDelete(id: string) {
    if (!confirm('삭제하시겠습니까?')) return;
    const res = await fetch(`/api/admin/notices?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
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
            <h1 className="text-xl font-bold">고객서비스 관리</h1>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
              로그아웃
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            {(['notice', 'faq'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  resetForm();
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  tab === t ? 'text-white' : 'bg-white text-gray-500 border border-gray-200'
                }`}
                style={tab === t ? { backgroundColor: '#17B4E8' } : undefined}
              >
                {t === 'notice' ? '공지사항' : 'FAQ'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="font-semibold mb-4">{editingId ? '수정' : '새로 작성'}</h2>
            <div className="space-y-3">
              {tab === 'faq' && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">카테고리</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full sm:w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {FAQ_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">제목</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder={tab === 'notice' ? '공지 제목' : '질문'}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">내용</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder={tab === 'notice' ? '공지 내용' : '답변'}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
                상단 고정
              </label>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                disabled={saving || !title || !content}
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
              {tab === 'notice' ? '공지사항 목록' : 'FAQ 목록'} ({filtered.length})
            </h2>
            {loading ? (
              <p className="text-sm text-gray-500">불러오는 중...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-500">등록된 항목이 없습니다.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {filtered
                  .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt))
                  .map((item) => (
                    <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          {item.pinned && <span className="text-orange-500">📌</span>}
                          {item.category && (
                            <span className="text-xs text-gray-400">[{item.category}]</span>
                          )}
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.content}</p>
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
