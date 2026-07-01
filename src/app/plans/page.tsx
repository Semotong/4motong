'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PlanCard from '@/components/plan/PlanCard';
import FilterBar, { FilterState } from '@/components/plan/FilterBar';
import { mockPlans } from '@/lib/planUtils';

function PlansContent() {
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState(mockPlans);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(mockPlans.length);
  const [filters, setFilters] = useState<FilterState>({
    mno: searchParams.get('mno') || '',
    sortBy: searchParams.get('sort') || 'recommend',
    priceMax: 99999,
    dataMin: 0,
  });

  const fetchPlans = async (f: FilterState) => {
    setLoading(true);
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchMno: f.mno || undefined,
          searchSalePriceTermTo: f.priceMax < 99999 ? f.priceMax : undefined,
          searchDataTermFrom: f.dataMin > 0 ? f.dataMin : undefined,
          searchOrderType: f.sortBy,
          recordSize: 50,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(filters); }, []);

  const handleFilterChange = (f: FilterState) => {
    setFilters(f);
    fetchPlans(f);
  };

  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">요금제 전체</h1>
        <p className="text-sm text-gray-500 mt-0.5">알뜰폰 요금제를 비교하고 최저가로 가입하세요</p>
      </div>

      <FilterBar onFilterChange={handleFilterChange} />

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-gray-900">{total.toLocaleString()}개</span>의 요금제
        </p>
        {loading && <span className="text-xs text-blue-400">불러오는 중...</span>}
      </div>

      {plans.length > 0 ? (
        <div className="flex flex-col gap-3">
          {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium">조건에 맞는 요금제가 없어요</p>
          <p className="text-sm mt-1">필터를 변경해보세요</p>
        </div>
      )}
    </>
  );
}

export default function PlansPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-gray-400">불러오는 중...</div>}>
      <PlansContent />
    </Suspense>
  );
}
