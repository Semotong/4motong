// 세모통 API 연동 라이브러리
// 실제 브라우저 Network 탭에서 확인한 구조:
// POST /b2b/getPlanlist  body: { page, recordSize, searchSalesId }
// searchSalesId = 영업상품 관리에서 발급받은 영업상품 ID (예: "50")

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
              const res = await fetch(`${SMT_BASE_URL}/b2b/getPlanlist`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                                    page: params.pageIndex || 1,
                                    recordSize: params.recordSize || 20,
                                    searchSalesId: SALES_ID,
                                    searchMno: params.searchMno,
                                    searchNetrok: params.searchNetrok,
                                    searchSalePriceTermFrom: params.searchSalePriceTermFrom,
                                    searchSalePriceTermTo: params.searchSalePriceTermTo,
                                    searchDataTermFrom: params.searchDataTermFrom,
                                    searchDataTermTo: params.searchDataTermTo,
                                    searchOrderType: params.searchOrderType,
                                    keyword: params.keyword,
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
