// src/pages/factory/components/CustomerDonutCard.test.ts
// buildDonutSlices — 월간 고객사 도넛 변환 (TEST 제외 / Top5+기타 / 빈값 정규화) TC

import { describe, it, expect } from 'vitest';
import { buildDonutSlices } from './CustomerDonutCard';
import type { CustomerCount } from '@/api/factory';

describe('buildDonutSlices', () => {
  it('6개 이상 → Top5 + 기타 합산 (실측 2026-05 기준)', () => {
    const input: CustomerCount[] = [
      { customer: 'MICRON', count: 69 },
      { customer: 'SEC', count: 52 },
      { customer: 'SK-HYNIX', count: 11 },
      { customer: 'SAS', count: 11 },
      { customer: 'SCS', count: 8 },
      { customer: 'PST', count: 5 },
      { customer: 'TEST CUSTOMER', count: 5 },
      { customer: 'PV', count: 3 },
      { customer: 'YMTC', count: 2 },
      { customer: 'SEUL', count: 2 },
      { customer: 'SGS', count: 1 },
    ];

    const { slices, total } = buildDonutSlices(input);

    // TEST CUSTOMER 제외 후 10개 → Top5 + 기타 = 6조각
    expect(slices).toHaveLength(6);
    expect(slices.slice(0, 5).map(s => s.customer)).toEqual(['MICRON', 'SEC', 'SK-HYNIX', 'SAS', 'SCS']);
    // 기타 = PST5 + PV3 + YMTC2 + SEUL2 + SGS1 = 13
    expect(slices[5]).toEqual({ customer: '기타', count: 13, isEtc: true });
    // total = TEST 제외 후 합 = 169 - 5 = 164
    expect(total).toBe(164);
  });

  it('TEST CUSTOMER 는 Top5 추출 전에 제외 (Top5 에 안 낌)', () => {
    const input: CustomerCount[] = [
      { customer: 'TEST CUSTOMER', count: 100 },  // count 최상위지만 제외 대상
      { customer: 'A', count: 9 },
      { customer: 'B', count: 8 },
      { customer: 'C', count: 7 },
      { customer: 'D', count: 6 },
      { customer: 'E', count: 5 },
      { customer: 'F', count: 4 },
    ];

    const { slices, total } = buildDonutSlices(input);

    // TEST 제외 → 6개 → Top5(A~E) + 기타(F)
    expect(slices.map(s => s.customer)).toEqual(['A', 'B', 'C', 'D', 'E', '기타']);
    expect(slices.find(s => s.customer === 'TEST CUSTOMER')).toBeUndefined();
    expect(total).toBe(39);  // 9+8+7+6+5+4
  });

  it('고객사 5개 이하 → 기타 미생성', () => {
    const input: CustomerCount[] = [
      { customer: 'A', count: 10 },
      { customer: 'B', count: 8 },
      { customer: 'C', count: 5 },
    ];

    const { slices, total } = buildDonutSlices(input);

    expect(slices).toHaveLength(3);
    expect(slices.every(s => !s.isEtc)).toBe(true);
    expect(total).toBe(23);
  });

  it('정확히 5개 → 기타 미생성', () => {
    const input: CustomerCount[] = [
      { customer: 'A', count: 5 }, { customer: 'B', count: 4 },
      { customer: 'C', count: 3 }, { customer: 'D', count: 2 },
      { customer: 'E', count: 1 },
    ];
    const { slices } = buildDonutSlices(input);
    expect(slices).toHaveLength(5);
    expect(slices.some(s => s.isEtc)).toBe(false);
  });

  it('customer 빈값/공백 → "(미지정)"', () => {
    const input: CustomerCount[] = [
      { customer: '', count: 7 },
      { customer: '   ', count: 3 },
    ];
    const { slices } = buildDonutSlices(input);
    expect(slices[0].customer).toBe('(미지정)');
    expect(slices[1].customer).toBe('(미지정)');
  });

  it('빈 배열 → slices [] / total 0', () => {
    expect(buildDonutSlices([])).toEqual({ slices: [], total: 0 });
  });

  it('TEST CUSTOMER 만 존재 → slices [] / total 0', () => {
    const { slices, total } = buildDonutSlices([{ customer: 'TEST CUSTOMER', count: 5 }]);
    expect(slices).toEqual([]);
    expect(total).toBe(0);
  });

  it('BE count DESC 순서 유지 — 재정렬 안 함', () => {
    const input: CustomerCount[] = [
      { customer: 'X', count: 30 },
      { customer: 'Y', count: 20 },
      { customer: 'Z', count: 10 },
    ];
    const { slices } = buildDonutSlices(input);
    expect(slices.map(s => s.customer)).toEqual(['X', 'Y', 'Z']);
  });
});
