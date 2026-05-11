// src/hooks/useDebounce.ts
// 단순 debounce hook — Sprint 42 hotfix (v1.43.1, 2026-05-09)
// ChecklistEditModal 의 selectOptionsInput debounce 영역에 사용

import { useEffect, useState } from 'react';

/**
 * value 변경 후 delay ms 동안 변경 없으면 반환.
 * 변경 시 timer reset.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}
