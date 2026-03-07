// src/hooks/useQr.ts
// QR 목록 TanStack Query 훅

import { useQuery } from '@tanstack/react-query';
import { getQrList } from '@/api/qr';
import type { QrListParams } from '@/types/qr';

export function useQrList(params: QrListParams = {}) {
  return useQuery({
    queryKey: ['qr-list', params],
    queryFn: () => getQrList(params),
    staleTime: 30_000, // 30초 캐시
  });
}
