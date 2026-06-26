export interface Plan {
  id: number;
  uuid?: string;
  planCode?: string;
  planName: string;
  planNameSmt?: string;
  planNameSmtSub?: string;
  mno: string; // SKT, KT, LGU+
  host?: number;
  hostNm: string; // 통신사명 (헬로모바일 등)
  planType?: string; // LTE, 5G
  supDataVal: number; // MB 단위
  supQos: number; // Kbps
  supCallVal: number; // 분 (9999 = 무제한)
  supSmsVal: number; // 건 (9999 = 무제한)
  dailyData?: number; // 매일 추가 데이터 MB
  normalPrice: number;
  salePrice: number;
  afterPrice?: number;
  promotionPeriod?: string;
  promotionPeriodVal?: string;
  linkUrl?: string;
  urlSmt?: string;
  newNumReqUrl?: string;
  numMoveReqUrl?: string;
  pcUrl?: string;
  moUrl?: string;
  saleStatus?: boolean;
  newYn?: boolean;
  dispYn?: boolean;
  imageBadgeSpecial?: boolean;
  imageBadgeLowest?: boolean;
  planLogoImg?: string;
  benefit?: string;
  freebies?: string;
  planZzimCnt?: number;
  reviewAvg?: number;
  planTag1?: string;
  planTag2?: string;
  planTag3?: string;
  planTag4?: string;
  planTag5?: string;
  pointPlanYn?: number;
  m12Price?: number;
  m24Price?: number;
}

export interface PlanSearchParams {
  searchType?: string;
  searchMno?: string; // SKT, KT, LGU+
  searchDataMin?: number;
  searchDataMax?: number;
  searchPriceMin?: number;
  searchPriceMax?: number;
  searchOrderType?: string; // recommend, price_asc, data_desc
  pageIndex?: number;
  recordSize?: number;
  searchKeyword?: string;
}

export interface PlanListResponse {
  resultCode: string;
  resultMsg: string;
  totalCount: number;
  data: Plan[];
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  kakaoUserId?: string;
  naverUserId?: string;
  createdAt?: string;
}
