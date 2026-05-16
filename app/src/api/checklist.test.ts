// src/api/checklist.test.ts
// getChecklistStatus — 카테고리 매핑(CAT_MAP) + MECH phase 1+2 합산 + BE 응답 필드 정규화 TC

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({
  default: { get: vi.fn() },
}));

import apiClient from './client';
import { getChecklistStatus, searchSNList } from './checklist';

const mockedGet = vi.mocked(apiClient.get);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getChecklistStatus — CAT_MAP 카테고리 매핑', () => {
  it('ELEC / TMS → 단일 호출 (회귀 0)', async () => {
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

describe('getChecklistStatus — MECH 1차+2차 검수 합산', () => {
  it('MECH → status/detail 각각 phase 1·2 분리 호출 (4건) + summary 합산', async () => {
    mockedGet
      .mockResolvedValueOnce({ data: { total_count: 11, checked_count: 11 } })  // status phase 1
      .mockResolvedValueOnce({ data: { total_count: 73, checked_count: 20 } })  // status phase 2
      .mockResolvedValueOnce({ data: { groups: [] } })                          // detail phase 1
      .mockResolvedValueOnce({ data: { groups: [] } });                         // detail phase 2

    const result = await getChecklistStatus('TEST-1111', 'MECH');

    expect(mockedGet).toHaveBeenCalledTimes(4);
    expect(mockedGet.mock.calls[0][0]).toBe('/api/app/checklist/mech/TEST-1111/status?phase=1');
    expect(mockedGet.mock.calls[1][0]).toBe('/api/app/checklist/mech/TEST-1111/status?phase=2');
    expect(mockedGet.mock.calls[2][0]).toBe('/api/app/checklist/mech/TEST-1111?phase=1');
    expect(mockedGet.mock.calls[3][0]).toBe('/api/app/checklist/mech/TEST-1111?phase=2');

    expect(result.category).toBe('MECH');
    expect(result.summary.total_check).toBe(84);   // 11 + 73
    expect(result.summary.completed).toBe(31);     // 11 + 20
    expect(result.summary.percent).toBe(37);       // 31/84 = 36.9 → 37
  });

  it('MECH items — 1차/2차 항목 병합 + 그룹 접두어 + master_id 충돌 회피', async () => {
    mockedGet
      .mockResolvedValueOnce({ data: { total_count: 1, checked_count: 1 } })
      .mockResolvedValueOnce({ data: { total_count: 1, checked_count: 0 } })
      .mockResolvedValueOnce({
        data: { groups: [{ group_name: '조립', items: [
          { master_id: 5, item_name: 'A', item_type: 'CHECK', check_result: 'PASS', checked_by_name: '홍' },
        ] }] },
      })
      .mockResolvedValueOnce({
        data: { groups: [{ group_name: '조립', items: [
          { master_id: 5, item_name: 'A', item_type: 'CHECK', check_result: null },
        ] }] },
      });

    const result = await getChecklistStatus('TEST-1111', 'MECH');

    expect(result.items).toHaveLength(2);
    // 1차 항목
    expect(result.items[0].master_id).toBe(5);
    expect(result.items[0].item_group).toBe('1차 · 조립');
    expect(result.items[0].record?.status).toBe('PASS');
    // 2차 항목 — 같은 master_id 5 지만 offset 으로 key 충돌 회피
    expect(result.items[1].master_id).not.toBe(result.items[0].master_id);
    expect(result.items[1].item_group).toBe('2차 · 조립');
    expect(result.items[1].record).toBeNull();
  });

  it('MECH — 일부 phase 호출 실패 시 나머지로 degrade', async () => {
    mockedGet
      .mockResolvedValueOnce({ data: { total_count: 11, checked_count: 11 } })
      .mockRejectedValueOnce(new Error('500'))                     // status phase 2 실패
      .mockResolvedValueOnce({ data: { groups: [] } })
      .mockResolvedValueOnce({ data: { groups: [] } });

    const result = await getChecklistStatus('TEST-1111', 'MECH');

    expect(result.summary.total_check).toBe(11);   // phase 1 만 합산
    expect(result.summary.completed).toBe(11);
  });
});

describe('getChecklistStatus — BE 응답 필드 정규화 (ELEC/TM/MECH 공통)', () => {
  it('BE 실제 필드명(master_id/check_result/checked_by_name) → record 정상 매핑', async () => {
    mockedGet
      .mockResolvedValueOnce({ data: { total_count: 2, checked_count: 1 } })
      .mockResolvedValueOnce({
        data: {
          groups: [{ group_name: 'G', items: [
            {
              master_id: 101, item_name: 'A', item_type: 'CHECK', item_group: 'G',
              check_result: 'PASS', checked_by_name: '홍길동', checked_at: '2026-05-15T10:00:00',
            },
            { master_id: 102, item_name: 'B', item_type: 'CHECK', item_group: 'G', check_result: null },
          ] }],
        },
      });

    const result = await getChecklistStatus('TEST-1111', 'ELEC');

    expect(result.items[0].master_id).toBe(101);
    expect(result.items[0].record).not.toBeNull();
    expect(result.items[0].record?.status).toBe('PASS');
    expect(result.items[0].record?.worker_name).toBe('홍길동');
    expect(result.items[1].master_id).toBe(102);
    expect(result.items[1].record).toBeNull();
  });

  it('legacy 필드명(id/status/worker_name) fallback 유지', async () => {
    mockedGet
      .mockResolvedValueOnce({ data: { total_count: 1, checked_count: 1 } })
      .mockResolvedValueOnce({
        data: { items: [
          { id: 5, item_name: 'C', item_type: 'CHECK', item_group: 'G', status: 'NA', worker_name: '김' },
        ] },
      });

    const result = await getChecklistStatus('TEST-1111', 'ELEC');

    expect(result.items[0].master_id).toBe(5);
    expect(result.items[0].record?.status).toBe('NA');
    expect(result.items[0].record?.worker_name).toBe('김');
  });

  it('INPUT / SELECT 항목 + check_result null → record null 유지', async () => {
    mockedGet
      .mockResolvedValueOnce({ data: { total_count: 2, checked_count: 0 } })
      .mockResolvedValueOnce({
        data: { items: [
          { master_id: 201, item_name: '치수', item_type: 'INPUT', item_group: 'G', check_result: null },
          { master_id: 202, item_name: '색상', item_type: 'SELECT', item_group: 'G', check_result: null },
        ] },
      });

    const result = await getChecklistStatus('TEST-1111', 'ELEC');

    expect(result.items[0].item_type).toBe('INPUT');
    expect(result.items[0].record).toBeNull();
    expect(result.items[1].item_type).toBe('SELECT');
    expect(result.items[1].record).toBeNull();
  });

  it('groups[] 평탄화 — item 에 item_group 없으면 group_name 으로 채움', async () => {
    mockedGet
      .mockResolvedValueOnce({ data: { total_count: 1, checked_count: 0 } })
      .mockResolvedValueOnce({
        data: { groups: [{ group_name: '배선', items: [
          { master_id: 9, item_name: 'X', item_type: 'CHECK', check_result: null },
        ] }] },
      });

    const result = await getChecklistStatus('TEST-1111', 'ELEC');

    expect(result.items[0].item_group).toBe('배선');
  });

  it('detail 호출 실패 시 status 만으로 degrade (items 빈 배열)', async () => {
    mockedGet
      .mockResolvedValueOnce({ data: { total_count: 10, checked_count: 4 } })
      .mockRejectedValueOnce(new Error('500'));

    const result = await getChecklistStatus('TEST-1111', 'ELEC');

    expect(result.summary.total_check).toBe(10);
    expect(result.summary.percent).toBe(40);
    expect(result.items).toEqual([]);
  });
});

describe('searchSNList — O/N + S/N 동시 검색', () => {
  it('숫자만 입력해도 sales_order + serial_number 양쪽 파라미터 전송', async () => {
    mockedGet.mockResolvedValueOnce({ data: { sales_order: '1111', products: [] } });

    await searchSNList({ query: '1111' });

    expect(mockedGet.mock.calls[0][0]).toBe('/api/admin/checklist/report/orders');
    expect(mockedGet.mock.calls[0][1]).toEqual({
      params: { sales_order: '1111', serial_number: '1111' },
    });
  });

  it('영문 prefix 포함 S/N 도 양쪽 파라미터 전송 (regex 분기 제거)', async () => {
    mockedGet.mockResolvedValueOnce({ data: { sales_order: null, products: [] } });

    await searchSNList({ query: 'TEST-1111' });

    expect(mockedGet.mock.calls[0][1]).toEqual({
      params: { sales_order: 'TEST-1111', serial_number: 'TEST-1111' },
    });
  });
});
