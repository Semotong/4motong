import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { parseCarrierExcel } from '@/lib/excelParser';
import { saveCarrierPlans } from '@/lib/planStore';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ success: false, message: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const hostNm = String(formData.get('hostNm') || '').trim();
    const mno = String(formData.get('mno') || '').trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: '파일이 필요합니다.' }, { status: 400 });
    }
    if (!hostNm || !mno) {
      return NextResponse.json(
        { success: false, message: '통신사명과 망(SKT/KT/LGU+)을 입력해주세요.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const plans = await parseCarrierExcel(buffer, hostNm, mno);
    const store = await saveCarrierPlans(hostNm, mno, plans, file.name);

    return NextResponse.json({
      success: true,
      message: `${hostNm} 요금제 ${plans.length}건 업로드 완료`,
      carrierCount: store.carriers.length,
      planCount: plans.length,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : '업로드 처리 중 오류가 발생했습니다.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
