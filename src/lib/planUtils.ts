import { Plan, PlanListResponse, PlanSearchParams } from '@/types/plan';

// 세모통 API base URL (환경변수로 관리)
const SMT_API_BASE = process.env.NEXT_PUBLIC_SMT_API_URL || 'https://api.smtong.co.kr';
const PARTNER_ID = process.env.NEXT_PUBLIC_PARTNER_ID || '';

// 데이터 단위 변환 (MB → 표시용)
export function formatData(mb: number): string {
  if (mb >= 10238976) return '무제한';
  if (mb >= 1024) return `${(mb / 1024).toFixed(0)}GB`;
  return `${mb}MB`;
}

// 통화 단위 변환
export function formatCall(val: number): string {
  if (val >= 9999) return '무제한';
  return `${val}분`;
}

// 문자 단위 변환
export function formatSms(val: number): string {
  if (val >= 9999) return '무제한';
  return `${val}건`;
}

// QOS 속도 변환
export function formatQos(kbps: number): string {
  if (kbps <= 0) return '-';
  if (kbps >= 1024) return `${(kbps / 1024).toFixed(0)}Mbps`;
  return `${kbps}Kbps`;
}

// 가격 포맷 (1000단위 콤마)
export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

// 가입 링크 생성 (파트너 코드 추가)
export function getJoinUrl(plan: Plan, type: 'new' | 'move' = 'new'): string {
  let url = '';
  if (type === 'new' && plan.newNumReqUrl) {
    url = plan.newNumReqUrl;
  } else if (type === 'move' && plan.numMoveReqUrl) {
    url = plan.numMoveReqUrl;
  } else if (plan.urlSmt) {
    url = plan.urlSmt;
  } else if (plan.pcUrl) {
    url = plan.pcUrl;
  } else if (plan.linkUrl) {
    url = plan.linkUrl;
  }

  // 파트너 코드 추가 (세모통과 협의된 파라미터명으로 변경 필요)
  if (url && PARTNER_ID) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}partner=${PARTNER_ID}`;
  }

  return url;
}

// MNO 뱃지 색상
export function getMnoBadgeStyle(mno: string): { bg: string; text: string } {
  switch (mno?.toUpperCase()) {
    case 'SKT': return { bg: '#FFF0F0', text: '#C0392B' };
    case 'KT':  return { bg: '#FFF8E7', text: '#B7771A' };
    case 'LGU+': case 'LG': return { bg: '#F0EEFF', text: '#5B4FCF' };
    default: return { bg: '#F0F0F0', text: '#666' };
  }
}

// Mock 데이터 (세모통 API 연동 전 개발용)
export const mockPlans: Plan[] = [
  {
    id: 1,
    planName: 'LTE 100GB + 매일 2GB · 5Mbps',
    hostNm: '헬로모바일',
    mno: 'SKT',
    planType: 'LTE',
    supDataVal: 102400,
    dailyData: 2048,
    supQos: 5120,
    supCallVal: 9999,
    supSmsVal: 9999,
    normalPrice: 19800,
    salePrice: 9900,
    afterPrice: 19800,
    promotionPeriod: '4개월',
    promotionPeriodVal: '4',
    newNumReqUrl: 'https://www.smtong.co.kr/order/new/1',
    numMoveReqUrl: 'https://www.smtong.co.kr/order/move/1',
    newYn: true,
    planTag1: '네이버페이 10,000P',
    planTag2: 'CU 20% 할인',
  },
  {
    id: 2,
    planName: '5G 데이터 무제한 · 5Mbps',
    hostNm: 'KT M모바일',
    mno: 'KT',
    planType: '5G',
    supDataVal: 10238976,
    supQos: 5120,
    supCallVal: 9999,
    supSmsVal: 9999,
    normalPrice: 22000,
    salePrice: 22000,
    newNumReqUrl: 'https://www.smtong.co.kr/order/new/2',
    numMoveReqUrl: 'https://www.smtong.co.kr/order/move/2',
  },
  {
    id: 3,
    planName: 'LTE 125GB · 5Mbps',
    hostNm: 'U+알뜰모바일',
    mno: 'LGU+',
    planType: 'LTE',
    supDataVal: 128000,
    supQos: 5120,
    supCallVal: 9999,
    supSmsVal: 9999,
    normalPrice: 16500,
    salePrice: 8800,
    afterPrice: 16500,
    promotionPeriod: '6개월',
    promotionPeriodVal: '6',
    newNumReqUrl: 'https://www.smtong.co.kr/order/new/3',
    numMoveReqUrl: 'https://www.smtong.co.kr/order/move/3',
    planTag1: '네이버페이 5,000P',
  },
  {
    id: 4,
    planName: 'LTE 11GB + 매일 2GB · 3Mbps',
    hostNm: 'SK세븐모바일',
    mno: 'SKT',
    planType: 'LTE',
    supDataVal: 11264,
    dailyData: 2048,
    supQos: 3072,
    supCallVal: 9999,
    supSmsVal: 9999,
    normalPrice: 18000,
    salePrice: 18000,
    newNumReqUrl: 'https://www.smtong.co.kr/order/new/4',
    numMoveReqUrl: 'https://www.smtong.co.kr/order/move/4',
    imageBadgeLowest: true,
  },
  {
    id: 5,
    planName: '5G 무제한 · 1Mbps',
    hostNm: 'KT엠모바일',
    mno: 'KT',
    planType: '5G',
    supDataVal: 10238976,
    supQos: 1024,
    supCallVal: 9999,
    supSmsVal: 9999,
    normalPrice: 33000,
    salePrice: 15000,
    afterPrice: 33000,
    promotionPeriod: '3개월',
    promotionPeriodVal: '3',
    newNumReqUrl: 'https://www.smtong.co.kr/order/new/5',
    numMoveReqUrl: 'https://www.smtong.co.kr/order/move/5',
    planTag1: '마트상품권 2만원',
  },
  {
    id: 6,
    planName: 'LTE 6GB · 400Kbps',
    hostNm: '이지모바일',
    mno: 'LGU+',
    planType: 'LTE',
    supDataVal: 6144,
    supQos: 400,
    supCallVal: 9999,
    supSmsVal: 9999,
    normalPrice: 9900,
    salePrice: 4900,
    afterPrice: 9900,
    promotionPeriod: '6개월',
    promotionPeriodVal: '6',
    newNumReqUrl: 'https://www.smtong.co.kr/order/new/6',
    numMoveReqUrl: 'https://www.smtong.co.kr/order/move/6',
    imageBadgeSpecial: true,
  },
];
