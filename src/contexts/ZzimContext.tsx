'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface ZzimContextType {
  zzimIds: number[];
  loading: boolean;
  toggle: (planId: number) => Promise<void>;
  isZzim: (planId: number) => boolean;
}

const ZzimContext = createContext<ZzimContextType | null>(null);

export function ZzimProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [zzimIds, setZzimIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchZzims = useCallback(async () => {
    if (!user) { setZzimIds([]); return; }
    try {
      const res = await fetch('/api/zzim');
      const data = await res.json();
      if (data.success) setZzimIds(data.ids || []);
    } catch {
      // 비로그인 상태면 localStorage 사용
      const stored = localStorage.getItem('zzim_ids');
      if (stored) setZzimIds(JSON.parse(stored));
    }
  }, [user]);

  useEffect(() => { fetchZzims(); }, [fetchZzims]);

  const toggle = async (planId: number) => {
    if (!user) {
      // 비로그인: localStorage에 저장
      const newIds = zzimIds.includes(planId)
        ? zzimIds.filter(id => id !== planId)
        : [...zzimIds, planId];
      setZzimIds(newIds);
      localStorage.setItem('zzim_ids', JSON.stringify(newIds));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/zzim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.success) {
        setZzimIds(prev =>
          data.action === 'added'
            ? [...prev, planId]
            : prev.filter(id => id !== planId)
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const isZzim = (planId: number) => zzimIds.includes(planId);

  return (
    <ZzimContext.Provider value={{ zzimIds, loading, toggle, isZzim }}>
      {children}
    </ZzimContext.Provider>
  );
}

export function useZzim() {
  const ctx = useContext(ZzimContext);
  if (!ctx) throw new Error('useZzim must be used within ZzimProvider');
  return ctx;
}
