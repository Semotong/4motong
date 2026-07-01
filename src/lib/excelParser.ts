import ExcelJS from 'exceljs';
import { Plan } from '@/types/plan';

// 세모통이 파트너사(요금닷컴 등)에 제공하는 것과 동일한 형식의
// 통신사별 요금제 엑셀 파일을 파싱한다.
// 헤더 텍스트로 컬럼을 찾기 때문에 통신사마다 컬럼 순서가 달라도 대응 가능.

type CellLike = ExcelJS.CellValue;

function cellToText(value: CellLike): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    const v = value as { text?: unknown; result?: unknown; hyperlink?: unknown };
    if (typeof v.text === 'string') return v.text.trim();
    if (v.result !== undefined && v.result !== null) return String(v.result).trim();
    if (typeof v.hyperlink === 'string') return v.hyperlink.trim();
  }
  return String(value).trim();
}

function parseDataToMB(text: string): number {
  if (!text) return 0;
  if (text.includes('무蠜한')) return 10238976;
  const match = text.match(/([0-9]+(?:\.[0-9]+)?)\s*(GB|MB)/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  return unit === 'GB' ? Math.round(value * 1024) : Math.round(value);
}

function parseCountValue(text: string): number {
  if (!text) return 0;
  if (text.includes('무제한')) return 9999;
  const match = text.match(/([0-9]+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function parseNumber(text: string): number {
  const raw = text.replace(/[^0-9.-]/g, '');
  return raw ? Number(raw) : 0;
}

// 문자열 해시 → 안정적인 숫자 id 생성 (통신사+요금제코드 기준, 재업로드해도 동일 id 유지)
function hashToId(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash) % 2147483647;
}

function findColumn(headerMap: Record<string, number>, keywords: string[]): number | undefined {
  for (const [header, col] of Object.entries(headerMap)) {
    if (keywords.some((k) => header.includes(k))) return col;
  }
  return undefined;
}

export async function parseCarrierExcel(
  buffer: Buffer,
  hostNm: string,
  mno: string
): Promise<Plan[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    throw new Error('엑셀 파일에서 시트를 찾을 수 없습니다.');
  }

  const headerMap: Record<string, number> = {};
  sheet.getRow(1).eachCell((cell, colNumber) => {
    const text = cellToText(cell.value);
    if (text) headerMap[text] = colNumber;
  });

  const colCode = findColumn(headerMap, ['자체요금제코드', '요금제코드', '코드']);
  const colName = findColumn(headerMap, ['요금제명', '상품명']);
  const colDiscountPeriod = findColumn(headerMap, ['기간할인', '할인기간']);
  const colData = findColumn(headerMap, ['데이터']);
  const colVoice = findColumn(headerMap, ['음성']);
  const colSms = findColumn(headerMap, ['문자']);
  const colBasePrice = findColumn(headerMap, ['기본료']);
  const colSalePrice = findColumn(headerMap, ['할인가']);
  const colLifetimePrice = findColumn(headerMap, ['평생가']);
  const colPromotion = findColumn(headerMap, ['프로모션']);
  const colBenefit = findColumn(headerMap, ['바로배송', '바로유심', '혜택']);
  const colUrl = findColumn(headerMap, ['URL', 'url']);

  if (!colName || !colUrl) {
    throw new Error(
      '필수 컬럼(요금제명, URL)을 엑셀 헤더에서 찾지 못했습니다. 1행이 헤더인지 확인해주세요.'
    );
  }

  const plans: Plan[] = [];
  const rowCount = sheet.rowCount;

  for (let r = 2; r <= rowCount; r++) {
    const row = sheet.getRow(r);
    const get = (col?: number) => (col ? cellToText(row.getCell(col).value) : '');

    const planName = get(colName);
    const url = get(colUrl);
    if (!planName || !url) continue; // 빈 행 스킵

    const planCode = get(colCode) || `${hostNm}-${r}`;
    const promotionPeriod = get(colDiscountPeriod);
    const planType = /5G/i.test(planName) ? '5G' : 'LTE';
    const basePrice = parseNumber(get(colBasePrice));
    const salePriceText = get(colSalePrice);

    plans.push({
      id: hashToId(`${hostNm}:${planCode}`),
      planCode,
      planName,
      hostNm,
      mno,
      planType,
      supDataVal: parseDataToMB(get(colData)),
      supQos: 0,
      supCallVal: parseCountValue(get(colVoice)),
      supSmsVal: parseCountValue(get(colSms)),
      normalPrice: basePrice,
      salePrice: salePriceText ? parseNumber(salePriceText) : basePrice,
      afterPrice: colLifetimePrice ? parseNumber(get(colLifetimePrice)) : undefined,
      promotionPeriod: promotionPeriod || undefined,
      promotionPeriodVal: promotionPeriod ? promotionPeriod.replace(/[^0-9]/g, '') : undefined,
      linkUrl: url,
      urlSmt: url,
      newNumReqUrl: url,
      numMoveReqUrl: url,
      benefit: get(colBenefit) || undefined,
      planTag1: get(colPromotion) || undefined,
      saleStatus: true,
      dispYn: true,
    });
  }

  if (plans.length === 0) {
    throw new Error('파싱된 요금제가 없습니다. 엑셀 내용과 헤더 구성을 확인해주세요.');
  }

  return plans;
}
