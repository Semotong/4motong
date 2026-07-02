'use client';

import Link from 'next/link';
import { Plan } from '@/types/plan';
import { formatData, formatCall, formatSms, formatQos, formatPrice, getJoinUrl, getMnoBadgeStyle } from '@/lib/planUtils';
import { useZzim } from '@/contexts/ZzimContext';

interface PlanCardProps {
  plan: Plan;
}

export default function PlanCard({ plan }: PlanCardProps) {
  const { isZzim, toggle } = useZzim();
  const zzimed = isZzim(plan.id);
  const mnoBadge = getMnoBadgeStyle(plan.mno);
  const isPromo = plan.promotionPeriodVal && parseInt(plan.promotionPeriodVal) > 0;
  const isHot = plan.newYn || plan.imageBadgeSpecial;
  const joinUrl = getJoinUrl(plan, 'new');
  const moveUrl = getJoinUrl(plan, 'move');
  const tags = [plan.planTag1, plan.planTag2, plan.planTag3].filter(Boolean);

  return (
    <div
      className="bg-white rounded-2xl p-4 transition-all duration-150"
      style={{ border: isHot ? '1.5px solid #17B4E8' : '1px solid #E5E7EB' }}
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex flex-wrap gap-1.5">
          {isHot && (
            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#EBF3FB', color: '#2378C3' }}>인기</span>
          )}
          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: mnoBadge.bg, color: mnoBadge.text }}>
            {plan.mno}망
          </span>
          {plan.planType && (
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-500">{plan.planType}</span>
          )}
          {plan.imageBadgeLowest && (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-50 text-green-700">최저가</span>
          )}
        </div>
        <button
          onClick={() => toggle(plan.id)}
          className="p-0.5 transition-transform active:scale-110"
          aria-label={zzimed ? '찜 취소' : '찜하기'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24"
            fill={zzimed ? '#17B4E8' : 'none'}
            stroke={zzimed ? '#17B4E8' : '#D1D5DB'}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>

      <Link href={`/plans/${plan.id}`}>
        <p className="text-xs text-gray-400 mb-0.5">{plan.hostNm}</p>
        <h3 className="text-sm font-bold text-gray-900 mb-3 leading-snug hover:underline">{plan.planName}</h3>
      </Link>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: '데이터', value: formatData(plan.supDataVal) + (plan.dailyData ? `+매일${formatData(plan.dailyData)}` : '') },
          { label: '통화', value: formatCall(plan.supCallVal) },
          { label: '문자', value: formatSms(plan.supSmsVal) },
          { label: '소진 후', value: formatQos(plan.supQos) },
        ].map(spec => (
          <div key={spec.label} className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400">{spec.label}</span>
            <span className="text-xs font-bold text-gray-800 leading-tight">{spec.value}</span>
          </div>
        ))}
      </div>

      <hr className="border-gray-100 mb-3" />

      <div className="flex items-end justify-between">
        <div>
          {isPromo && (
            <span className="text-xs font-bold px-2 py-0.5 rounded mb-1 inline-block" style={{ background: '#FEF0EE', color: '#E74C3C' }}>
              {plan.promotionPeriod} 할인
            </span>
          )}
          <div className="flex items-baseline gap-1">
            {isPromo && plan.normalPrice !== plan.salePrice && (
              <span className="text-xs text-gray-300 line-through">{formatPrice(plan.normalPrice)}원</span>
            )}
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">{formatPrice(plan.salePrice)}</span>
            <span className="text-sm text-gray-500">원/월</span>
          </div>
          {isPromo && plan.afterPrice && plan.afterPrice !== plan.salePrice && (
            <p className="text-xs text-gray-400 mt-0.5">이후 월 {formatPrice(plan.afterPrice)}원</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          {joinUrl && (
            <a href={joinUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs font-bold text-white px-4 py-2 rounded-xl text-center"
              style={{ backgroundColor: '#17B4E8' }}
            >
              신규가입
            </a>
          )}
          {moveUrl && moveUrl !== joinUrl && (
            <a href={moveUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs font-bold px-4 py-2 rounded-xl text-center border"
              style={{ color: '#17B4E8', borderColor: '#17B4E8' }}
            >
              번호이동
            </a>
          )}
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
          {tags.map((tag, i) => (
            <span key={i} className="text-xs text-gray-500 flex items-center gap-1">
              <span style={{ color: '#17B4E8' }}>🎁</span> {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
