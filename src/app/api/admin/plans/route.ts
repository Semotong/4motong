import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { loadPlanStore, deleteCarrierPlans } from '@/lib/planStore';

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ success: false, message: '인증이 필요합니다.' }, { status: 401 });
  }

  const store = await loadPlanStore();
  const carriers = (store?.carriers || []).map((c) => ({
    hostNm: c.hostNm,
    mno: c.mno,
    updatedAt: c.updatedAt,
    fileName: c.fileName,
    planCount: c.plans.length,
  }));

  return NextResponse.json({ success: true, carriers, updatedAt: store?.updatedAt || null });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ success: false, message: '인증이 필요합니다.' }, { status: 401 });
  }

  const hostNm = req.nextUrl.searchParams.get('hostNm');
  if (!hostNm) {
    return NextResponse.json(
      { success: false, message: 'hostNm 파라미터가 필요합니다.' },
      { status: 400 }
    );
  }

  const store = await deleteCarrierPlans(hostNm);
  return NextResponse.json({ success: true, carrierCount: store.carriers.length });
}
