'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
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
  // 동일 요금제에 대한 중복 요청(더블클릭) 방지용
  const pendingRef = useRef<Set<number>>(new Set());

  const fetchZzims = useCallback(async () => {
    if (!user) {
      // 비로그인 상태면 localStorage 사용
      try {
        const stored = localStorage.getItem('zzim_ids');
        setZzimIds(stored ? Array.from(new Set<number>(JSON.parse(stored))) : []);
      } catch {
        setZzimIds([]);
      }
      return;
    }
    try {
      const res = await fetch('/api/zzim');
      const data = await res.json();
      if (data.success) setZzimIds(Array.from(new Set<number>(data.ids || [])));
    } catch {
      setZzimIds([]);
    }
  }, [user]);

  useEffect(() => { fetchZzims(); }, [fetchZzims]);

  const toggle = async (planId: number) => {
    if (!user) {
      // 비로그인: localStorage에 저장
      setZzimIds(prev => {
        const next = prev.includes(planId)
          ? prev.filter(id => id !== planId)
          : [...prev, planId];
        localStorage.setItem('zzim_ids', JSON.stringify(next));
        return next;
      });
      return;
    }

    // 이미 처리 중인 요청이면 무시 (더블클릭 시 중복 저장 방지)
    if (pendingRef.current.has(planId)) return;
    pendingRef.current.add(planId);

    const wasZzimed = zzimIds.includes(planId);
    // 낙관적 업데이트: 클릭 즉시 하트 반영
    setZzimIds(prev => {
      const set = new Set(prev);
      if (wasZzimed) set.delete(planId); else set.add(planId);
      return Array.from(set);
    });

    setLoading(true);
    try {
      const res = await fetch('/api/zzim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.success) {
        // 서버 실제 상태에 맞춰 동기화
        setZzimIds(prev => {
          const set = new Set(prev);
          if (data.action === 'added') set.add(planId); else set.delete(planId);
          return Array.from(set);
        });
      } else {
        // 실패 시 롤백
        setZzimIds(prev => {
          const set = new Set(prev);
          if (wasZzimed) set.add(planId); else set.delete(planId);
          return Array.from(set);
        });
      }
    } catch {
      // 네트워크 오류 시 롤백
      setZzimIds(prev => {
        const set = new Set(prev);
        if (wasZzimed) set.add(planId); else set.delete(planId);
        return Array.from(set);
      });
    } finally {
      pendingRef.current.delete(planId);
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
