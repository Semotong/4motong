import { put, head } from '@vercel/blob';

// 고객서비스(공지사항/FAQ) 데이터를 Vercel Blob에 영속 저장.
// planStore.ts와 동일한 단일 JSON 블롭 패턴을 사용한다.

const STORE_PATH = 'data/notices-data.json';

export type NoticeType = 'notice' | 'faq';

export interface NoticeItem {
  id: string;
  type: NoticeType;
  category?: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeStoreData {
  updatedAt: string;
  items: NoticeItem[];
}

export async function loadNoticeStore(): Promise<NoticeStoreData> {
  try {
    const meta = await head(STORE_PATH);
    const res = await fetch(meta.url, { cache: 'no-store' });
    if (!res.ok) return { updatedAt: new Date().toISOString(), items: [] };
    const data = (await res.json()) as NoticeStoreData;
    if (!data || !Array.isArray(data.items)) return { updatedAt: new Date().toISOString(), items: [] };
    return data;
  } catch {
    return { updatedAt: new Date().toISOString(), items: [] };
  }
}

async function persist(items: NoticeItem[]): Promise<NoticeStoreData> {
  const updated: NoticeStoreData = { updatedAt: new Date().toISOString(), items };
  await put(STORE_PATH, JSON.stringify(updated), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });
  return updated;
}

export async function createNotice(input: Omit<NoticeItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<NoticeStoreData> {
  const store = await loadNoticeStore();
  const now = new Date().toISOString();
  const item: NoticeItem = {
    ...input,
    id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    createdAt: now,
    updatedAt: now,
  };
  return persist([item, ...store.items]);
}

export async function updateNotice(id: string, patch: Partial<Omit<NoticeItem, 'id' | 'createdAt'>>): Promise<NoticeStoreData> {
  const store = await loadNoticeStore();
  const items = store.items.map((it) =>
    it.id === id ? { ...it, ...patch, updatedAt: new Date().toISOString() } : it
  );
  return persist(items);
}

export async function deleteNotice(id: string): Promise<NoticeStoreData> {
  const store = await loadNoticeStore();
  return persist(store.items.filter((it) => it.id !== id));
}
