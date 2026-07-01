import { put, head } from '@vercel/blob';
import { Plan } from '@/types/plan';

// Persist admin-uploaded carrier plan data to Vercel Blob storage.
// Each carrier (hostNm) is stored/replaced independently.

const STORE_PATH = 'data/plans-data.json';

export interface StoredCarrierPlans {
  hostNm: string;
  mno: string;
  updatedAt: string;
  fileName?: string;
  plans: Plan[];
}

export interface PlanStoreData {
  updatedAt: string;
  carriers: StoredCarrierPlans[];
}

export async function loadPlanStore(): Promise<PlanStoreData | null> {
  try {
    const meta = await head(STORE_PATH);
    const res = await fetch(meta.url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as PlanStoreData;
    if (!data || !Array.isArray(data.carriers)) return null;
    return data;
  } catch {
    return null;
  }
}

export async function saveCarrierPlans(
  hostNm: string,
  mno: string,
  plans: Plan[],
  fileName?: string
  ): Promise<PlanStoreData> {
  const existing = (await loadPlanStore()) || { updatedAt: new Date().toISOString(), carriers: [] };
  const filtered = existing.carriers.filter((c) => c.hostNm !== hostNm);

const updated: PlanStoreData = {
  updatedAt: new Date().toISOString(),
  carriers: [
    ...filtered,
    { hostNm, mno, updatedAt: new Date().toISOString(), fileName, plans },
    ],
};

await put(STORE_PATH, JSON.stringify(updated), {
  access: 'public',
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: 'application/json',
});

return updated;
}

export async function deleteCarrierPlans(hostNm: string): Promise<PlanStoreData> {
  const existing = (await loadPlanStore()) || { updatedAt: new Date().toISOString(), carriers: [] };

const updated: PlanStoreData = {
  updatedAt: new Date().toISOString(),
  carriers: existing.carriers.filter((c) => c.hostNm !== hostNm),
};

await put(STORE_PATH, JSON.stringify(updated), {
  access: 'public',
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: 'application/json',
});

return updated;
}

export function getAllStoredPlans(store: PlanStoreData | null): Plan[] {
  if (!store) return [];
  return store.carriers.flatMap((c) => c.plans);
}
