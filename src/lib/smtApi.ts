// 세모통 API 연동 라이브러리
// 실제 브라우저 Network 탭에서 재검증한 구조 (2026-07-01):
// POST /pbm/plan/getPlanlist body: { keyword, searchSaleSp, searchOrderType, page, recordSize,
//   searchSection, searchSalePriceTermFrom, searchSalePriceTermTo, searchMno, searchNetrok,
//   searchCombination, searchCompanyList, searchPlanTag }
// 응답: { code, status, message, totalCnt, data: [...] } - 실제 2,500개+ 요금제 반환 확인됨
// 주의: 이전에 사용하던 /b2b/getPlanlist 는 파트너 전용 라우트로 실제로 존재하지 않으며
// 항상 홈페이지 HTML을 반환한다 (searchSalesId 유무와 무관). 공개 요금제 목록은
// 반드시 /pbm/plan/getPlanlist 를 사용해야 한다.

const SMT_BASE_URL = process.env.SMT_API_BASE_URL || 'https://www.smtong.co.kr';
const PARTNER_ADMIN_ID = process.env.SMT_PARTNER_ADMIN_ID || '';
const SALES_ID = process.env.SMT_SALES_ID || '50';

export function getPartnerEncUrl(adminUserId?: string): string {
        const id = adminUserId || PARTNER_ADMIN_ID;
        return Buffer.from(id).toString('base64url');
}

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
        try {
                  const res = await fetch(`${SMT_BASE_URL}/pbm/plan/getPlanlist`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                            keyword: params.keyword || '',
                                            searchSaleSp: 'SALE',
                                            searchOrderType: params.searchOrderType || 'RE',
                                            page: params.pageIndex || 1,
                                            recordSize: params.recordSize || 20,
                                            searchSection: 'mvno',
                                            searchSalePriceTermFrom: String(params.searchSalePriceTermFrom ?? 0),
                                            searchSalePriceTermTo: String(params.searchSalePriceTermTo ?? 200000),
                                            searchMno: params.searchMno || '',
                                            searchNetrok: params.searchNetrok || '',
                                            searchCombination: '',
                                            searchCompanyList: '',
                                            searchPlanTag: '',
                              }),
                              next: { revalidate: 300 },
                  });

          if (!res.ok) throw new Error(`SMT API error: ${res.status}`);
                  const data = await res.json();
                  return { success: true, data: data.data || [], total: data.totalCnt ?? data.totalCount ?? 0 };
        } catch (e) {
                  console.error('세모통 API 연동 실패, Mock 데이터 사용:', e);
                  return { success: false, data: [], total: 0 };
        }
}

export async function fetchPlanDetailFromSmt(planId: number) {
        const encUrl = getPartnerEncUrl();
        try {
                  const res = await fetch(
                              `${SMT_BASE_URL}/b2b/${encUrl}/planDetail?planid=${planId}&recomSalesId=${SALES_ID}`,
                        { next: { revalidate: 300 } }
                            );
                  if (!res.ok) throw new Error(`SMT API error: ${res.status}`);
                  return { success: true };
        } catch (e) {
                  return { success: false };
        }
}
