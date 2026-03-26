// src/api/snStatus.ts
// S/N 작업 현황 API — Sprint 18
// getSNTasks: 실 API 호출 → 실패 시 목업 fallback (Sprint 38 BE 미구현)

import apiClient from './client';
import type { SNProgressResponse, SNTaskDetail } from '@/types/snStatus';

export async function getSNProgress(): Promise<SNProgressResponse> {
  const { data } = await apiClient.get<SNProgressResponse>('/api/app/product/progress');
  return data;
}

export async function getSNTasks(serialNumber: string): Promise<SNTaskDetail[]> {
  try {
    const { data } = await apiClient.get<SNTaskDetail[]>(
      `/tasks/${serialNumber}?all=true`,
    );
    // 응답이 배열이고 workers 필드가 있으면 실 데이터
    if (Array.isArray(data) && data.length > 0 && 'workers' in data[0]) {
      return data;
    }
  } catch {
    // API 미구현 → 목업 fallback
  }
  return getMockTasks();
}

// ── 목업 데이터 (Sprint 38 BE 구현 후 제거) ──

function getMockTasks(): SNTaskDetail[] {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  return [
    {
      task_category: 'MECH',
      workers: [
        { worker_id: 42, worker_name: '김태영', started_at: `${today}T09:00:12+09:00`, completed_at: `${today}T10:32:45+09:00`, duration_minutes: 92, status: 'completed' },
        { worker_id: 55, worker_name: '박준호', started_at: `${today}T09:05:00+09:00`, completed_at: `${today}T10:30:00+09:00`, duration_minutes: 85, status: 'completed' },
      ],
      my_status: 'not_started',
    },
    {
      task_category: 'ELEC',
      workers: [
        { worker_id: 33, worker_name: '이수진', started_at: `${today}T10:45:00+09:00`, completed_at: `${today}T12:10:00+09:00`, duration_minutes: 85, status: 'completed' },
      ],
      my_status: 'not_started',
    },
    {
      task_category: 'TMS',
      workers: [
        { worker_id: 28, worker_name: '정민수', started_at: `${today}T13:00:00+09:00`, completed_at: null, duration_minutes: null, status: 'in_progress' },
      ],
      my_status: 'not_started',
    },
    {
      task_category: 'PI',
      workers: [],
      my_status: 'not_started',
    },
    {
      task_category: 'QI',
      workers: [],
      my_status: 'not_started',
    },
    {
      task_category: 'SI',
      workers: [],
      my_status: 'not_started',
    },
  ];
}
