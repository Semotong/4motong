import { NextRequest, NextResponse } from 'next/server';
import { fetchPlansFromSmt } from '@/lib/smtApi';
import { mockPlans } from '@/lib/planUtils';
import { loadPlanStore, getAllStoredPlans } from '@/lib/planStore';
import { Plan } from '@/types/plan';

interface PlanQueryParams {
  searchMno?: string;
  searchSalePriceTermTo?: number;
  searchDataTermFrom?: number;
  keyword?: string;
  searchOrderType?: string;
  pageIndex?: number;
  recordSize?: number;
  [key: string]: unknown;
}

function filterAndSort(plans: Plan[], params: PlanQueryParams): Plan[] {
  let result = [...plans];
  if (params.searchMno) result = result.filter((p) => p.mno === params.searchMno);
  if (params.searchSalePriceTermTo)
    result = result.filter((p) => p.salePrice <= params.searchSalePriceTermTo!);
  if (params.searchDataTermFrom)
    result = result.filter((p) => p.supDataVal >= params.searchDataTermFrom!);
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    result = result.filter(
      (p) => p.planName.toLowerCase().includes(kw) || p.hostNm.toLowerCase().includes(kw)
    );
  }
  if (params.searchOrderType === 'price_asc') result.sort((a, b) => a.salePrice - b.salePrice);
  else if (params.searchOrderType === 'data_desc')
    result.sort((a, b) => b.supDataVal - a.supDataVal);
  return result;
}

// 데이터 우선순위: 세모통 실시간 API 연동 성공 > 관리자 엑셀 업로드 데이터 > Mock 데이터
async function getFallbackSource(): Promise<Plan[]> {
  const store = await loadPlanStore();
  const uploaded = getAllStoredPlans(store);
  return uploaded.length > 0 ? uploaded : mockPlans;
}

export async function POST(req: NextRequest) {
  try {
    const params = await req.json();
    const result = await fetchPlansFromSmt(params);

    if (result.success && result.data.length > 0) {
      return NextResponse.json({ success: true, data: result.data, total: result.total });
    }

    const source = await getFallbackSource();
    const plans = filterAndSort(source, params);

    const page = params.pageIndex || 1;
    const size = params.recordSize || 20;
    const start = (page - 1) * size;
    const paged = plans.slice(start, start + size);

    return NextResponse.json({ success: true, data: paged, total: plans.length });
  } catch {
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const source = await getFallbackSource();

  if (id) {
    const plan = source.find((p) => p.id === Number(id));
    if (!plan) return NextResponse.json({ success: false }, { status: 404 });
    return NextResponse.json({ success: true, data: plan });
  }
  return NextResponse.json({ success: true, data: source, total: source.length });
}
