// src/hooks/useForceClose.ts
// Task 강제 종료 mutation — Sprint 33

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';

interface ForceClosePayload {
  taskId: number;
  reason: string;
  completedAt?: string;
}

interface ForceCloseResponse {
  message: string;
  task_id: number;
}

export function useForceClose() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, reason, completedAt }: ForceClosePayload) =>
      apiClient.put<ForceCloseResponse>(`/api/admin/tasks/${taskId}/force-close`, {
        reason,
        completed_at: completedAt,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sn', 'progress'] });
      queryClient.invalidateQueries({ queryKey: ['sn', 'tasks'] });
    },
  });
}
