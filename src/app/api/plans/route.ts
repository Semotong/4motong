import { NextRequest, NextResponse } from 'next/server';
import { fetchPlansFromSmt } from '@/lib/smtApi';
import { mockPlans } from '@/lib/planUtils';

export async function POST(req: NextRequest) {
  try {
    const params = await req.json();
    const result = await fetchPlansFromSmt(params);

    if (result.success && result.data.length > 0) {
      return NextResponse.json({ success: true, data: result.data, total: result.total });
    }

    // 세모통 API 미연동 시 Mock 데이터 사용
    let plans = [...mockPlans];
    if (params.searchMno) plans = plans.filter(p => p.mno === params.searchMno);
    if (params.searchSalePriceTermTo) plans = plans.filter(p => p.salePrice <= params.searchSalePriceTermTo);
    if (params.searchDataTermFrom) plans = plans.filter(p => p.supDataVal >= params.searchDataTermFrom);
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      plans = plans.filter(p => p.planName.toLowerCase().includes(kw) || p.hostNm.toLowerCase().includes(kw));
    }
    if (params.searchOrderType === 'price_asc') plans.sort((a, b) => a.salePrice - b.salePrice);
    else if (params.searchOrderType === 'data_desc') plans.sort((a, b) => b.supDataVal - a.supDataVal);

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
  if (id) {
    const plan = mockPlans.find(p => p.id === Number(id));
    if (!plan) return NextResponse.json({ success: false }, { status: 404 });
    return NextResponse.json({ success: true, data: plan });
  }
  return NextResponse.json({ success: true, data: mockPlans, total: mockPlans.length });
}
