// 세모통 API 연동 라이브러리
// b2b/{encUrl}/getPlanlist 구조 기반

const SMT_BASE_URL = process.env.SMT_API_BASE_URL || 'https://www.smtong.co.kr';
const PARTNER_ADMIN_ID = process.env.SMT_PARTNER_ADMIN_ID || '';

// 세모통 파트너 encUrl 생성 (adminUserId를 Base64UrlSafe 인코딩)
export function getPartnerEncUrl(adminUserId?: string): string {
  const id = adminUserId || PARTNER_ADMIN_ID;
  return Buffer.from(id).toString('base64url');
}

// 세모통 요금제 목록 조회
export async function fetchPlansFromSmt(params: {
  searchMno?: string;
  searchNetrok?: string;
  searchSalePriceTermFrom?: number;
  searchSalePriceTermTo?: number;
  searchDataTermFrom?: number;
  searchDataTermTo?: number;
  searchOrderType?: string;
  pageIndex?: number;
  recordSize?: number;
  keyword?: string;
}) {
  const encUrl = getPartnerEncUrl();

  try {
    const res = await fetch(`${SMT_BASE_URL}/b2b/getPlanlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchDispYn: 1,
        searchSaleSp: 'SALE',
        ...params,
        recordSize: params.recordSize || 20,
        pageIndex: params.pageIndex || 1,
      }),
      next: { revalidate: 300 }, // 5분 캐시
    });

    if (!res.ok) throw new Error(`SMT API error: ${res.status}`);
    const data = await res.json();
    return { success: true, data: data.data || [], total: data.totalCount || 0 };
  } catch (e) {
    console.error('세모통 API 연동 실패, Mock 데이터 사용:', e);
    return { success: false, data: [], total: 0 };
  }
}

// 세모통 요금제 상세 조회
export async function fetchPlanDetailFromSmt(planId: number) {
  const encUrl = getPartnerEncUrl();
  try {
    const res = await fetch(
      `${SMT_BASE_URL}/b2b/${encUrl}/planDetail?planid=${planId}&recomSalesId=0`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) throw new Error(`SMT API error: ${res.status}`);
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}
