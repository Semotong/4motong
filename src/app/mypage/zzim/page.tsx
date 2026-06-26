'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useZzim } from '@/contexts/ZzimContext';
import PlanCard from '@/components/plan/PlanCard';
import Link from 'next/link';
import { Plan } from '@/types/plan';
import { mockPlans } from '@/lib/planUtils';

export default function ZzimPage() {
  const { user, loading: authLoading } = useAuth();
  const { zzimIds } = useZzim();
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    // zzimIds에 해당하는 요금제 조회
    const found = mockPlans.filter(p => zzimIds.includes(p.id));
    setPlans(found);
  }, [zzimIds]);

  if (authLoading) return <div className="text-center py-10 text-gray-400">불러오는 중...</div>;

  if (!user && zzimIds.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">❤️</p>
        <h2 className="text-lg font-bold text-gray-900 mb-2">찜한 요금제가 없어요</h2>
        <p className="text-sm text-gray-500 mb-6">마음에 드는 요금제를 찜해보세요</p>
        <Link href="/plans"
          className="text-sm font-bold text-white px-6 py-3 rounded-xl"
          style={{ backgroundColor: '#4A90D9' }}>
          요금제 보러가기
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">찜한 요금제</h1>
        <p className="text-sm text-gray-500 mt-0.5">{plans.length}개의 요금제를 찜했어요</p>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">❤️</p>
          <p className="font-medium">찜한 요금제가 없어요</p>
          <Link href="/plans" className="text-sm mt-4 inline-block" style={{ color: '#4A90D9' }}>
            요금제 보러가기 →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
        </div>
      )}
    </>
  );
}
