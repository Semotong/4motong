'use client';

import { useState } from 'react';

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  mno: string;
  sortBy: string;
  priceMax: number;
  dataMin: number;
}

const MNO_FILTERS = [
  { label: '전체', value: '' },
  { label: 'SKT망', value: 'SKT' },
  { label: 'KT망', value: 'KT' },
  { label: 'LGU+망', value: 'LGU+' },
];

const PRICE_FILTERS = [
  { label: '가격 무관', value: 99999 },
  { label: '1만원 이하', value: 10000 },
  { label: '2만원 이하', value: 20000 },
  { label: '3만원 이하', value: 30000 },
];

const DATA_FILTERS = [
  { label: '용량 무관', value: 0 },
  { label: '10GB+', value: 10240 },
  { label: '50GB+', value: 51200 },
  { label: '무제한', value: 10238976 },
];

const SORT_OPTIONS = [
  { label: '추천순', value: 'recommend' },
  { label: '낮은가격', value: 'price_asc' },
  { label: '데이터많은순', value: 'data_desc' },
  { label: '12개월합산', value: 'price12' },
];

const UNSELECTED = { background: '#F9FAFB', color: '#9CA3AF', border: '1px solid #E5E7EB' };
const PRICE_SELECTED = { background: '#EBF3FB', color: '#2378C3', border: '1px solid #17B4E8' };
const DATA_SELECTED = { background: '#E7F7EF', color: '#159A67', border: '1px solid #22B573' };

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    mno: '',
    sortBy: 'recommend',
    priceMax: 99999,
    dataMin: 0,
  });

  const update = (key: keyof FilterState, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-2xl p-4 mb-3">

      {/* 통신사 필터 */}
      <div className="flex flex-wrap gap-2 mb-3">
        {MNO_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => update('mno', f.value)}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={
              filters.mno === f.value
                ? { background: '#17B4E8', color: '#fff', border: '1px solid #17B4E8' }
                : { background: '#F3F4F6', color: '#6B7280', border: '1px solid transparent' }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="border-t border-gray-100 my-3" />

      {/* 가격 필터 */}
      <div className="flex gap-2 mb-2.5">
        <span className="text-xs font-bold text-gray-400 pt-1.5 w-9 shrink-0">가격</span>
        <div className="flex flex-wrap gap-2">
          {PRICE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => update('priceMax', f.value)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={filters.priceMax === f.value ? PRICE_SELECTED : UNSELECTED}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 데이터 필터 */}
      <div className="flex gap-2 mb-3">
        <span className="text-xs font-bold text-gray-400 pt-1.5 w-9 shrink-0">데이터</span>
        <div className="flex flex-wrap gap-2">
          {DATA_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => update('dataMin', f.value)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={filters.dataMin === f.value ? DATA_SELECTED : UNSELECTED}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 my-3" />

      {/* 정렬 */}
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {SORT_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => update('sortBy', s.value)}
            className="px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
            style={
              filters.sortBy === s.value
                ? { color: '#2378C3', background: '#EBF3FB', border: '1px solid #17B4E8' }
                : { color: '#9CA3AF', background: 'transparent', border: '1px solid #E5E7EB' }
            }
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
