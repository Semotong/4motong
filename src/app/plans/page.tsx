'use client';

import { useState, useEffect } from 'react';
import PlanCard from '@/components/plan/PlanCard';
import FilterBar, { FilterState } from '@/components/plan/FilterBar';
import { mockPlans } from '@/lib/planUtils';
import { Plan } from '@/types/plan';
import Link from 'next/link';

export default function HomePage() {
  const [plans, setPlans] = useState<Plan[]>(mockPlans);
  const [total, setTotal] = useState(mockPlans.length);
  const [loading, setLoading] = useState(false);

  const fetchPlans = async (filters?: FilterState) => {
    setLoading(true);
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchMno: filters?.mno || undefined,
          searchSalePriceTermTo: filters?.priceMax && filters.priceMax < 99999 ? filters.priceMax : undefined,
          searchDataTermFrom: filters?.dataMin && filters.dataMin > 0 ? filters.dataMin : undefined,
          searchOrderType: filters?.sortBy || 'recommend',
          recordSize: 20,
        }),
      });
      const data = await res.json();
      if (data.success) { setPlans(data.data); setTotal(data.total); }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  return (
    <>
      {/* 히어로 */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: 'linear-gradient(135deg, #EBF3FB 0%, #F0F6FD 100%)' }}>
        <p className="text-xs font-bold mb-1" style={{ color: '#17B4E8' }}>알뜰폰 요금제 비교</p>
        <h1 className="text-xl font-extrabold text-gray-900 mb-1 tracking-tight">통신비, 이제 제대로 줄여요</h1>
        <p className="text-sm text-gray-500 mb-4">2,300개 이상 요금제 · 매일 업데이트</p>
        <div className="flex gap-2 flex-wrap">
          <Link href="/plans"
            className="text-sm font-bold text-white px-4 py-2 rounded-xl"
            style={{ backgroundColor: '#17B4E8' }}>
            요금제 전체보기
          </Link>
          <Link href="/plans?sort=price_asc"
            className="text-sm font-bold px-4 py-2 rounded-xl border bg-white"
            style={{ color: '#17B4E8', borderColor: '#17B4E8' }}>
            최저가 찾기
          </Link>
          
            href="http://b2b.alancorp.net/b2b/NG1vdG9uZy8x"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold text-white px-4 py-2 rounded-xl"
            style={{ backgroundColor: '#E8703A' }}>
            B2B 영업페이지
          </a>
        </div>
      </div>

      <FilterBar onFilterChange={fetchPlans} />

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-gray-900">{total.toLocaleString()}개</span>의 요금제
        </p>
        {loading && <span className="text-xs" style={{ color: '#17B4E8' }}>불러오는 중...</span>}
      </div>

      {plans.length > 0 ? (
        <div className="flex flex-col gap-3">
          {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium">조건에 맞는 요금제가 없어요</p>
        </div>
      )}
    </>
  );
}
