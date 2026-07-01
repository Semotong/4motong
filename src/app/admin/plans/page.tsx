'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface CarrierSummary {
  hostNm: string;
  mno: string;
  updatedAt: string;
  fileName: string;
  planCount: number;
}

const MNO_OPTIONS = ['SKT', 'KT', 'LGU+'];

export default function AdminPlansPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [carriers, setCarriers] = useState<CarrierSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [hostNm, setHostNm] = useState('');
  const [mno, setMno] = useState(MNO_OPTIONS[0]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageOk, setMessageOk] = useState(true);

  const loadCarriers = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/admin/plans', { cache: 'no-store' });
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.success) setCarriers(data.carriers);
    } finally {
      setLoadingList(false);
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
        loadCarriers();
      } catch {
        router.push('/admin/login');
      }
    })();
  }, [router, loadCarriers]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !hostNm) return;
    setUploading(true);
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('hostNm', hostNm);
      fd.append('mno', mno);
      const res = await fetch('/api/admin/plans/upload', { method: 'POST', body: fd });
      const data = await res.json();
      setMessageOk(!!data.success);
      setMessage(data.message || (data.success ? '업로드 완료' : '업로드 실패'));
      if (data.success) {
        setHostNm('');
        setFile(null);
        await loadCarriers();
      }
    } catch {
      setMessageOk(false);
      setMessage('네트워크 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(name: string) {
    if (!confirm(`${name} 요금제 데이터를 삭제할까요?`)) return;
    const res = await fetch(`/api/admin/plans?hostNm=${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (data.success) loadCarriers();
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">확인 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold">세이브모바일 관리자 - 요금제 데이터</h1>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
            로그아웃
          </button>
        </div>

        <form
          onSubmit={handleUpload}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h2 className="font-semibold mb-4">통신사 엑셀 업로드</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">통신사명</label>
              <input
                value={hostNm}
                onChange={(e) => setHostNm(e.target.value)}
                placeholder="예: 세모통"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">망(MNO)</label>
              <select
                value={mno}
                onChange={(e) => setMno(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {MNO_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">엑셀 파일</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
            </div>
          </div>

          {message && (
            <p className={`text-sm mb-3 ${messageOk ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={uploading || !file || !hostNm}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {uploading ? '업로드 중...' : '업로드'}
          </button>
        </form>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">업로드된 통신사 데이터</h2>
          {loadingList ? (
            <p className="text-sm text-gray-500">불러오는 중...</p>
          ) : carriers.length === 0 ? (
            <p className="text-sm text-gray-500">아직 업로드된 데이터가 없습니다.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-2">통신사</th>
                  <th className="py-2">망</th>
                  <th className="py-2">요금제 수</th>
                  <th className="py-2">파일명</th>
                  <th className="py-2">업데이트</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {carriers.map((c) => (
                  <tr key={c.hostNm} className="border-b border-gray-100">
                    <td className="py-2">{c.hostNm}</td>
                    <td className="py-2">{c.mno}</td>
                    <td className="py-2">{c.planCount}</td>
                    <td className="py-2 text-gray-500">{c.fileName}</td>
                    <td className="py-2 text-gray-500">
                      {new Date(c.updatedAt).toLocaleString('ko-KR')}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleDelete(c.hostNm)}
                        className="text-red-500 hover:underline"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
