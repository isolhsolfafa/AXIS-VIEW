// src/hooks/useTaskReactivate.ts
// Task 재활성화 mutation — Sprint 23

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';

interface ReactivateResponse {
  message: string;
  task_id: number;
  serial_number: string;
  task_category: string;
  confirms_invalidated: number;
}

export function useTaskReactivate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskDetailId: number) =>
      apiClient.post<ReactivateResponse>('/api/app/work/reactivate-task', {
        task_detail_id: taskDetailId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sn', 'progress'] });
      queryClient.invalidateQueries({ queryKey: ['sn', 'tasks'] });
    },
  });
}
