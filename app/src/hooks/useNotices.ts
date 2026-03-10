// src/hooks/useNotices.ts
// 공지사항 TanStack Query 훅

import { useQuery } from '@tanstack/react-query';
import { getNotices } from '@/api/notices';
import type { NoticeListParams } from '@/api/notices';

export function useNotices(params: NoticeListParams = {}) {
  return useQuery({
    queryKey: ['notices', params],
    queryFn: () => getNotices(params),
    staleTime: 60_000, // 1분 캐시
  });
}
