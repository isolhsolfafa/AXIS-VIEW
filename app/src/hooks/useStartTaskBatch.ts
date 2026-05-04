// src/hooks/useStartTaskBatch.ts
// Sprint 40 — Tank Module 일괄 시작 (Promise.allSettled fallback + partial-success)

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startTask, startTaskBatch, type BatchResponse } from '@/api/snStatus';

export function useStartTaskBatchMutation(_serialNumber: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskDetailIds: number[]): Promise<BatchResponse> => {
      try {
        return await startTaskBatch(taskDetailIds);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        // BE Sprint 64-BE 미배포 (404) → fallback: Promise.allSettled 순차 호출 + 결과 정규화
        if (status === 404) {
          const settled = await Promise.allSettled(
            taskDetailIds.map(id => startTask(id)),
          );
          const succeeded: BatchResponse['succeeded'] = [];
          const skipped: BatchResponse['skipped'] = [];
          settled.forEach((r, i) => {
            const id = taskDetailIds[i];
            if (r.status === 'fulfilled') {
              succeeded.push({ task_detail_id: id, updated: r.value });
            } else {
              const reasonCode = (r.reason as { response?: { data?: { error?: string } } })?.response?.data?.error;
              const isKnown = reasonCode && ['ALREADY_STARTED', 'ALREADY_COMPLETED', 'NOT_STARTED', 'NOT_FOUND', 'NOT_TANK_MODULE', 'FORBIDDEN_COMPANY'].includes(reasonCode);
              skipped.push({
                task_detail_id: id,
                reason: (isKnown ? reasonCode : 'NOT_FOUND') as BatchResponse['skipped'][number]['reason'],
              });
            }
          });
          return { succeeded, skipped, total: taskDetailIds.length };
        }
        throw err;
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sn', 'progress'] });
      queryClient.invalidateQueries({ queryKey: ['sn', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['sn', 'tasks-by-order'] });
    },
    retry: 1,
  });
}
