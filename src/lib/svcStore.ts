import { put, head } from '@vercel/blob';

// 서비스(배너/팝업/이벤트) 데이터를 Vercel Blob에 영속 저장.

const STORE_PATH = 'data/service-data.json';

export type SvcType = 'banner' | 'popup' | 'event';

export interface SvcItem {
  id: string;
  type: SvcType;
  title: string;
  imageUrl?: string;
  linkUrl?: string;
  active: boolean;
  startAt?: string;
  endAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SvcStoreData {
  updatedAt: string;
  items: SvcItem[];
}

export async function loadSvcStore(): Promise<SvcStoreData> {
  try {
    const meta = await head(STORE_PATH);
    const res = await fetch(meta.url, { cache: 'no-store' });
    if (!res.ok) return { updatedAt: new Date().toISOString(), items: [] };
    const data = (await res.json()) as SvcStoreData;
    if (!data || !Array.isArray(data.items)) return { updatedAt: new Date().toISOString(), items: [] };
    return data;
  } catch {
    return { updatedAt: new Date().toISOString(), items: [] };
  }
}

async function persist(items: SvcItem[]): Promise<SvcStoreData> {
  const updated: SvcStoreData = { updatedAt: new Date().toISOString(), items };
  await put(STORE_PATH, JSON.stringify(updated), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });
  return updated;
}

export async function createSvcItem(input: Omit<SvcItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<SvcStoreData> {
  const store = await loadSvcStore();
  const now = new Date().toISOString();
  const item: SvcItem = {
    ...input,
    id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    createdAt: now,
    updatedAt: now,
  };
  return persist([item, ...store.items]);
}

export async function updateSvcItem(id: string, patch: Partial<Omit<SvcItem, 'id' | 'createdAt'>>): Promise<SvcStoreData> {
  const store = await loadSvcStore();
  const items = store.items.map((it) =>
    it.id === id ? { ...it, ...patch, updatedAt: new Date().toISOString() } : it
  );
  return persist(items);
}

export async function deleteSvcItem(id: string): Promise<SvcStoreData> {
  const store = await loadSvcStore();
  return persist(store.items.filter((it) => it.id !== id));
}
