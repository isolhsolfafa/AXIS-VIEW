// src/hooks/useCompleteTask.ts
// Sprint 40 — Tank Module 단일 종료 (Optimistic + retry: 1)

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { completeTask } from '@/api/snStatus';
import type { SNTaskDetail } from '@/types/snStatus';

export function useCompleteTaskMutation(serialNumber: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskDetailId: number) => completeTask(taskDetailId),
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
                workers: t.workers.map(w =>
                  w.started_at && !w.completed_at
                    ? { ...w, completed_at: now, status: 'completed' as const }
                    : w,
                ),
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
