// src/api/snStatus.test.ts
// v1.43.5 HOTFIX-TASKS-BY-ORDER-SCHEMA — getTasksByOrder 두 형식(배열 / {tasks, total}) 호환 TC

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({
  default: { get: vi.fn() },
}));

import apiClient from './client';
import { getTasksByOrder } from './snStatus';
import type { SNTaskDetail } from '@/types/snStatus';

const mockedGet = vi.mocked(apiClient.get);

const mockTask = (overrides: Partial<SNTaskDetail> = {}): SNTaskDetail => ({
  id: 59376,
  serial_number: 'TEST-1112',
  task_category: 'TMS',
  task_id: 'TANK_MODULE',
  task_name: 'Tank Module',
  is_applicable: true,
  workers: [],
  ...overrides,
} as SNTaskDetail);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getTasksByOrder — BE 응답 schema 호환 (v1.43.5)', () => {
  it('BE Sprint 64-BE 현재 응답: { tasks: [...], total: N } 객체 → tasks 배열 추출', async () => {
    const tasks = [mockTask(), mockTask({ id: 59377, serial_number: 'TEST-1113' })];
    mockedGet.mockResolvedValueOnce({
      data: { tasks, total: 2 },
    });

    const result = await getTasksByOrder('1111', {
      taskCategories: ['TMS', 'MECH'],
      taskId: 'TANK_MODULE',
    });

    expect(result).toHaveLength(2);
    expect(result[0].serial_number).toBe('TEST-1112');
    expect(result[1].serial_number).toBe('TEST-1113');
  });

  it('OPS v2.13.1 정정 후 응답: [...] 배열 직접 → 그대로 통과', async () => {
    const tasks = [mockTask()];
    mockedGet.mockResolvedValueOnce({ data: tasks });

    const result = await getTasksByOrder('1111');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(59376);
  });

  it('빈 객체 또는 비정상 응답 → 빈 배열 fallback (회귀 차단)', async () => {
    mockedGet.mockResolvedValueOnce({ data: null });
    expect(await getTasksByOrder('1111')).toEqual([]);

    mockedGet.mockResolvedValueOnce({ data: {} });
    expect(await getTasksByOrder('1111')).toEqual([]);

    mockedGet.mockResolvedValueOnce({ data: { tasks: null, total: 0 } });
    expect(await getTasksByOrder('1111')).toEqual([]);
  });

  it('v1.43.6: BE 응답에 workers 필드 누락 → 빈 배열로 정규화 (TypeError 차단)', async () => {
    // 실측: BE Sprint 64-BE by-order 응답에 workers 필드 자체가 없음
    mockedGet.mockResolvedValueOnce({
      data: {
        tasks: [
          {
            id: 59376,
            serial_number: 'TEST-1112',
            task_id: 'TANK_MODULE',
            task_category: 'TMS',
            task_name: 'Tank Module',
            // workers 필드 없음 ⚠️
          },
        ],
        total: 1,
      },
    });

    const result = await getTasksByOrder('1111');

    expect(result).toHaveLength(1);
    expect(result[0].workers).toEqual([]);  // 정규화 결과: 빈 배열
    // 누락이 아니라 array.find() / .some() / .every() 가 안전하게 호출 가능
    expect(() => result[0].workers.find(w => w.started_at)).not.toThrow();
  });
});
