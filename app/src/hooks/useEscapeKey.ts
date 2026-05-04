// src/hooks/useEscapeKey.ts
// Sprint 40 (A12 β) — ESC 키 closure 훅. 모달 컴포넌트 재사용 가능.

import { useEffect } from 'react';

export function useEscapeKey(enabled: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [enabled, onEscape]);
}
