'use client';

import { useParams, useRouter } from 'next/navigation';
import { mockPlans, formatData, formatCall, formatSms, formatQos, formatPrice, getJoinUrl, getMnoBadgeStyle } from '@/lib/planUtils';

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const plan = mockPlans.find(p => p.id === Number(params.id));

  if (!plan) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-4xl mb-3">😓</p>
        <p className="font-medium">요금제를 찾을 수 없어요</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-blue-500">← 돌아가기</button>
      </div>
    );
  }

  const mnoBadge = getMnoBadgeStyle(plan.mno);
  const isPromo = plan.promotionPeriodVal && parseInt(plan.promotionPeriodVal) > 0;
  const newUrl = getJoinUrl(plan, 'new');
  const moveUrl = getJoinUrl(plan, 'move');
  const tags = [plan.planTag1, plan.planTag2, plan.planTag3, plan.planTag4, plan.planTag5].filter(Boolean);

  return (
    <>
      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 mb-4"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        요금제 목록
      </button>

      <div className="bg-white rounded-2xl p-5 mb-3">
        {/* 뱃지 */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: mnoBadge.bg, color: mnoBadge.text }}>
            {plan.mno}망
          </span>
          {plan.planType && (
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-500">{plan.planType}</span>
          )}
          {plan.newYn && (
            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#EBF3FB', color: '#2378C3' }}>신규</span>
          )}
        </div>

        <p className="text-sm text-gray-400 mb-1">{plan.hostNm}</p>
        <h1 className="text-xl font-extrabold text-gray-900 mb-4 tracking-tight leading-snug">{plan.planName}</h1>

        {/* 가격 */}
        <div className="mb-5">
          {isPromo && (
            <span className="text-xs font-bold px-2 py-0.5 rounded mb-2 inline-block" style={{ background: '#FEF0EE', color: '#E74C3C' }}>
              {plan.promotionPeriod} 할인
            </span>
          )}
          <div className="flex items-baseline gap-1">
            {isPromo && plan.normalPrice !== plan.salePrice && (
              <span className="text-sm text-gray-300 line-through">{formatPrice(plan.normalPrice)}원</span>
            )}
            <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{formatPrice(plan.salePrice)}</span>
            <span className="text-base text-gray-500">원/월</span>
          </div>
          {isPromo && plan.afterPrice && plan.afterPrice !== plan.salePrice && (
            <p className="text-sm text-gray-400 mt-1">이후 월 {formatPrice(plan.afterPrice)}원</p>
          )}
        </div>

        {/* 가입 버튼 */}
        <div className="flex gap-2 mb-1">
          {newUrl && (
            <a
              href={newUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-sm font-bold text-white py-3 rounded-xl"
              style={{ backgroundColor: '#4A90D9' }}
            >
              신규가입
            </a>
          )}
          {moveUrl && (
            <a
              href={moveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-sm font-bold py-3 rounded-xl border"
              style={{ color: '#4A90D9', borderColor: '#4A90D9' }}
            >
              번호이동
            </a>
          )}
        </div>
      </div>

      {/* 스펙 상세 */}
      <div className="bg-white rounded-2xl p-5 mb-3">
        <h2 className="text-base font-bold text-gray-900 mb-4">요금제 상세</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: '기본 데이터', value: formatData(plan.supDataVal) },
            { label: '매일 추가 데이터', value: plan.dailyData ? formatData(plan.dailyData) : '-' },
            { label: '소진 후 속도', value: formatQos(plan.supQos) },
            { label: '통화', value: formatCall(plan.supCallVal) },
            { label: '문자', value: formatSms(plan.supSmsVal) },
            { label: '망 종류', value: `${plan.mno} ${plan.planType || ''}` },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1 py-2 border-b border-gray-50">
              <span className="text-xs text-gray-400">{item.label}</span>
              <span className="text-sm font-bold text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 사은품 */}
      {tags.length > 0 && (
        <div className="bg-white rounded-2xl p-5 mb-3">
          <h2 className="text-base font-bold text-gray-900 mb-3">사은품 혜택</h2>
          <div className="flex flex-col gap-2">
            {tags.map((tag, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <span style={{ color: '#4A90D9' }}>🎁</span> {tag}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
