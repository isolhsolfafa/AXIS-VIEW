// src/hooks/useStartTask.ts
// Sprint 40 — Tank Module 단일 시작 (Optimistic + retry: 1)

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startTask } from '@/api/snStatus';
import type { SNTaskDetail } from '@/types/snStatus';

export function useStartTaskMutation(serialNumber: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskDetailId: number) => startTask(taskDetailId),
    onMutate: async (taskDetailId) => {
      const key = ['sn', 'tasks', serialNumber];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<SNTaskDetail[]>(key);
      if (previous) {
        const now = new Date().toISOString();
        queryClient.setQueryData<SNTaskDetail[]>(key, previous.map(t =>
          t.id === taskDetailId
            ? {
                ...t,
                workers: t.workers.length > 0
                  ? t.workers.map(w => w.started_at ? w : { ...w, started_at: now, status: 'in_progress' as const })
                  : t.workers,
              }
            : t,
        ));
      }
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['sn', 'tasks', serialNumber], ctx.previous);
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
