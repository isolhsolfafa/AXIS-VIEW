// src/api/checklist.test.ts
// getChecklistStatus — 카테고리 매핑(CAT_MAP) + BE 응답 필드 정규화 TC
// MECH 매핑 누락 fix + BE 실제 필드명(master_id/check_result/checked_by_name) 정합 fix

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({
  default: { get: vi.fn() },
}));

import apiClient from './client';
import { getChecklistStatus } from './checklist';

const mockedGet = vi.mocked(apiClient.get);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getChecklistStatus — CAT_MAP 카테고리 매핑', () => {
  it('MECH → /api/app/checklist/mech/... 호출 (빈 응답 early-return 안 함)', async () => {
    mockedGet
      .mockResolvedValueOnce({ data: { total_count: 19, checked_count: 12 } })
      .mockResolvedValueOnce({ data: { groups: [{ group_name: '기구 조립', items: [] }] } });

    const result = await getChecklistStatus('TEST-1111', 'MECH');

    expect(mockedGet).toHaveBeenCalledTimes(2);
    expect(mockedGet.mock.calls[0][0]).toBe('/api/app/checklist/mech/TEST-1111/status');
    expect(mockedGet.mock.calls[1][0]).toBe('/api/app/checklist/mech/TEST-1111');
    expect(result.category).toBe('MECH');
    expect(result.summary.total_check).toBe(19);
    expect(result.summary.completed).toBe(12);
    expect(result.summary.percent).toBe(63);
  });

  it('ELEC / TMS 도 동일하게 매핑 (회귀 0)', async () => {
    mockedGet.mockResolvedValue({ data: { total_count: 0, checked_count: 0 } });
    await getChecklistStatus('TEST-1111', 'ELEC');
    expect(mockedGet.mock.calls[0][0]).toBe('/api/app/checklist/elec/TEST-1111/status');

    vi.clearAllMocks();
    mockedGet.mockResolvedValue({ data: { total_count: 0, checked_count: 0 } });
    await getChecklistStatus('TEST-1111', 'TMS');
    expect(mockedGet.mock.calls[0][0]).toBe('/api/app/checklist/tm/TEST-1111/status');
  });

  it('미매핑 카테고리(PI 등) → API 호출 없이 빈 응답', async () => {
    const result = await getChecklistStatus('TEST-1111', 'PI');
    expect(mockedGet).not.toHaveBeenCalled();
    expect(result.category).toBe('PI');
    expect(result.summary.total_check).toBe(0);
    expect(result.items).toEqual([]);
  });
});

describe('getChecklistStatus — BE 응답 필드 정규화', () => {
  it('BE 실제 필드명(master_id/check_result/checked_by_name) → record 정상 매핑', async () => {
    mockedGet
      .mockResolvedValueOnce({ data: { total_count: 2, checked_count: 1 } })
      .mockResolvedValueOnce({
        data: {
          groups: [
            {
              group_name: '기구 조립',
              items: [
                {
                  master_id: 101, item_name: 'A', item_type: 'CHECK', item_group: '기구 조립',
                  check_result: 'PASS', checked_by_name: '홍길동', checked_at: '2026-05-15T10:00:00',
                },
                {
                  master_id: 102, item_name: 'B', item_type: 'CHECK', item_group: '기구 조립',
                  check_result: null,
                },
              ],
            },
          ],
        },
      });

    const result = await getChecklistStatus('TEST-1111', 'MECH');

    expect(result.items).toHaveLength(2);
    // 완료 항목: master_id 보존 + record 채워짐 (배열 index 로 대체되지 않음)
    expect(result.items[0].master_id).toBe(101);
    expect(result.items[0].record).not.toBeNull();
    expect(result.items[0].record?.status).toBe('PASS');
    expect(result.items[0].record?.worker_name).toBe('홍길동');
    // 미완료 항목: record null
    expect(result.items[1].master_id).toBe(102);
    expect(result.items[1].record).toBeNull();
  });

  it('legacy 필드명(id/status/worker_name) fallback 유지', async () => {
    mockedGet
      .mockResolvedValueOnce({ data: { total_count: 1, checked_count: 1 } })
      .mockResolvedValueOnce({
        data: {
          items: [
            { id: 5, item_name: 'C', item_type: 'CHECK', item_group: 'G', status: 'NA', worker_name: '김' },
          ],
        },
      });

    const result = await getChecklistStatus('TEST-1111', 'ELEC');

    expect(result.items[0].master_id).toBe(5);
    expect(result.items[0].record?.status).toBe('NA');
    expect(result.items[0].record?.worker_name).toBe('김');
  });

  it('INPUT / SELECT 항목 + check_result null → record null 유지 (비의도 record 생성 차단)', async () => {
    mockedGet
      .mockResolvedValueOnce({ data: { total_count: 2, checked_count: 0 } })
      .mockResolvedValueOnce({
        data: {
          items: [
            { master_id: 201, item_name: '치수', item_type: 'INPUT', item_group: 'G', check_result: null },
            { master_id: 202, item_name: '색상', item_type: 'SELECT', item_group: 'G', check_result: null },
          ],
        },
      });

    const result = await getChecklistStatus('TEST-1111', 'MECH');

    expect(result.items[0].item_type).toBe('INPUT');
    expect(result.items[0].record).toBeNull();
    expect(result.items[1].item_type).toBe('SELECT');
    expect(result.items[1].record).toBeNull();
  });

  it('detail 호출 실패 시 status 만으로 degrade (partial — items 빈 배열)', async () => {
    mockedGet
      .mockResolvedValueOnce({ data: { total_count: 10, checked_count: 4 } })
      .mockRejectedValueOnce(new Error('500'));

    const result = await getChecklistStatus('TEST-1111', 'MECH');

    expect(result.summary.total_check).toBe(10);
    expect(result.summary.percent).toBe(40);
    expect(result.items).toEqual([]);
  });
});
