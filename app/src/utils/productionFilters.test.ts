// src/utils/productionFilters.test.ts
import { describe, it, expect } from 'vitest';
import { filterByProcessTab, filterByStatus, calcTabKpi, isProcessEnabled, getISOWeekRange } from './productionFilters';
import type { OrderGroup } from '@/types/production';

// mock 데이터 — sn_confirms/all_confirmed 기반
const mockOrders: OrderGroup[] = [
  {
    sales_order: '6400', model: 'GAIA-L', sn_count: 3,
    sns: [], sn_summary: '6855~6857',
    partner_info: { mech: 'A사', elec: 'B사', mixed: false },
    processes: {
      MECH: {
        ready: 3, total: 3, confirmable: true,
        all_confirmed: true, all_confirmable: true,
        sn_confirms: [
          { serial_number: 'SN6855', total: 10, completed: 10, pct: 100, confirmable: true, confirmed: true, confirmed_at: '2026-03-23', confirm_id: 1 },
          { serial_number: 'SN6856', total: 10, completed: 10, pct: 100, confirmable: true, confirmed: true, confirmed_at: '2026-03-23', confirm_id: 2 },
          { serial_number: 'SN6857', total: 10, completed: 10, pct: 100, confirmable: true, confirmed: true, confirmed_at: '2026-03-23', confirm_id: 3 },
        ],
      },
      ELEC: {
        ready: 3, total: 3, confirmable: true,
        all_confirmed: false, all_confirmable: true,
        sn_confirms: [
          { serial_number: 'SN6855', total: 10, completed: 10, pct: 100, confirmable: true, confirmed: false, confirmed_at: null, confirm_id: null },
          { serial_number: 'SN6856', total: 10, completed: 10, pct: 100, confirmable: true, confirmed: false, confirmed_at: null, confirm_id: null },
          { serial_number: 'SN6857', total: 10, completed: 10, pct: 100, confirmable: true, confirmed: false, confirmed_at: null, confirm_id: null },
        ],
      },
      TM: { ready: 2, total: 3, confirmable: false, all_confirmed: false },
    },
    confirms: [],
  },
  {
    sales_order: '6500', model: 'SWS-JP', sn_count: 2,
    sns: [], sn_summary: '6900~6901',
    partner_info: { mech: 'C사', elec: 'D사', mixed: false },
    processes: {
      MECH: {
        ready: 2, total: 2, confirmable: true,
        all_confirmed: false, all_confirmable: true,
        sn_confirms: [
          { serial_number: 'SN6900', total: 10, completed: 10, pct: 100, confirmable: true, confirmed: false, confirmed_at: null, confirm_id: null },
          { serial_number: 'SN6901', total: 10, completed: 10, pct: 100, confirmable: true, confirmed: false, confirmed_at: null, confirm_id: null },
        ],
      },
      ELEC: { ready: 2, total: 2, confirmable: false, all_confirmed: false },
    },
    confirms: [],
  },
];

describe('filterByProcessTab', () => {
  it('mech_elec 탭: MECH 또는 ELEC가 있는 O/N만 반환', () => {
    const result = filterByProcessTab(mockOrders, 'mech_elec');
    expect(result).toHaveLength(2);
  });

  it('tm 탭: TM task가 있는 O/N만 반환', () => {
    const result = filterByProcessTab(mockOrders, 'tm');
    expect(result).toHaveLength(1);
    expect(result[0].sales_order).toBe('6400');
  });

  it('tm 탭: TM total=0이면 제외', () => {
    const noTmOrders: OrderGroup[] = [{
      ...mockOrders[1],
      processes: { ...mockOrders[1].processes, TM: { ready: 0, total: 0, confirmable: false } },
    }];
    expect(filterByProcessTab(noTmOrders, 'tm')).toHaveLength(0);
  });

  it('end date 범위 필터: mech_elec (sns 기반)', () => {
    const ordersWithEnd: OrderGroup[] = [{
      ...mockOrders[0],
      sns: [
        { serial_number: 'SN1', mech_partner: 'A', elec_partner: 'B', mech_end: '2026-03-23', elec_end: '2026-03-24', progress: {}, checklist: { MECH: { completed: false, completed_at: null }, ELEC: { completed: false, completed_at: null } } },
      ],
    }];
    // in range
    expect(filterByProcessTab(ordersWithEnd, 'mech_elec', '2026-03-22', '2026-03-29')).toHaveLength(1);
    // out of range
    expect(filterByProcessTab(ordersWithEnd, 'mech_elec', '2026-03-30', '2026-04-06')).toHaveLength(0);
  });

  it('end date 범위 필터: tm (sns 기반)', () => {
    const ordersWithEnd: OrderGroup[] = [{
      ...mockOrders[0],
      sns: [
        { serial_number: 'SN1', mech_partner: 'A', elec_partner: 'B', module_end: '2026-03-25', progress: {}, checklist: { MECH: { completed: false, completed_at: null }, ELEC: { completed: false, completed_at: null } } },
      ],
    }];
    expect(filterByProcessTab(ordersWithEnd, 'tm', '2026-03-22', '2026-03-29')).toHaveLength(1);
    expect(filterByProcessTab(ordersWithEnd, 'tm', '2026-03-30', '2026-04-06')).toHaveLength(0);
  });

  it('end 데이터 없는 SN → 필터 건너뜀 (전체 표시)', () => {
    // sns가 있지만 end 필드가 없음
    const ordersNoEnd: OrderGroup[] = [{
      ...mockOrders[0],
      sns: [
        { serial_number: 'SN1', mech_partner: 'A', elec_partner: 'B', progress: {}, checklist: { MECH: { completed: false, completed_at: null }, ELEC: { completed: false, completed_at: null } } },
      ],
    }];
    expect(filterByProcessTab(ordersNoEnd, 'mech_elec', '2026-03-22', '2026-03-29')).toHaveLength(1);
  });

  it('SN 2대 (W13 + W14) → W13 조회 시 표시', () => {
    const ordersMultiSN: OrderGroup[] = [{
      ...mockOrders[0],
      sns: [
        { serial_number: 'SN1', mech_partner: 'A', elec_partner: 'B', mech_end: '2026-03-23', progress: {}, checklist: { MECH: { completed: false, completed_at: null }, ELEC: { completed: false, completed_at: null } } },
        { serial_number: 'SN2', mech_partner: 'A', elec_partner: 'B', mech_end: '2026-03-30', progress: {}, checklist: { MECH: { completed: false, completed_at: null }, ELEC: { completed: false, completed_at: null } } },
      ],
    }];
    // W13 (03-22~03-29): SN1의 mech_end가 범위 내 → 표시
    expect(filterByProcessTab(ordersMultiSN, 'mech_elec', '2026-03-22', '2026-03-29')).toHaveLength(1);
  });
});

describe('filterByStatus', () => {
  it('all: 전체 반환', () => {
    expect(filterByStatus(mockOrders, 'all')).toHaveLength(2);
  });

  it('pending: 미완료 포함 O/N만', () => {
    const result = filterByStatus(mockOrders, 'pending');
    expect(result).toHaveLength(2);
  });

  it('done: 전체 확인 완료된 O/N만 (all_confirmed 기반)', () => {
    const doneOrders: OrderGroup[] = [{
      ...mockOrders[0],
      processes: {
        MECH: { ready: 3, total: 3, confirmable: true, all_confirmed: true },
        ELEC: { ready: 3, total: 3, confirmable: true, all_confirmed: true },
        TM:   { ready: 3, total: 3, confirmable: true, all_confirmed: true },
      },
    }];
    expect(filterByStatus(doneOrders, 'done')).toHaveLength(1);
  });

  it('done: TM 없는 O/N도 MECH+ELEC all_confirmed이면 done', () => {
    const noTmDone: OrderGroup[] = [{
      ...mockOrders[1],
      processes: {
        MECH: { ready: 2, total: 2, confirmable: true, all_confirmed: true },
        ELEC: { ready: 2, total: 2, confirmable: true, all_confirmed: true },
      },
    }];
    expect(filterByStatus(noTmDone, 'done')).toHaveLength(1);
  });

  it('done: 혼재 partner_confirms all_confirmed 기반', () => {
    const mixedDone: OrderGroup[] = [{
      ...mockOrders[0],
      processes: {
        MECH: {
          ready: 3, total: 3, confirmable: false, mixed: true,
          partner_confirms: [
            { partner: 'A', sn_confirms: [], all_confirmable: true, all_confirmed: true },
            { partner: 'B', sn_confirms: [], all_confirmable: true, all_confirmed: true },
          ],
        },
        ELEC: { ready: 3, total: 3, confirmable: true, all_confirmed: true },
      },
    }];
    expect(filterByStatus(mixedDone, 'done')).toHaveLength(1);
  });
});

describe('calcTabKpi', () => {
  it('mech_elec 탭: 기구/전장 확인 카운트 (all_confirmed 기반)', () => {
    const kpi = calcTabKpi(mockOrders, 'mech_elec') as any;
    expect(kpi.totalON).toBe(2);
    expect(kpi.totalSN).toBe(5);
    expect(kpi.mechConfirmed).toBe(1); // 6400 MECH all_confirmed=true
    expect(kpi.elecConfirmed).toBe(0);
    expect(kpi.mechReady).toBe(1); // 6500 has sn_confirms with confirmable+!confirmed
    expect(kpi.elecReady).toBe(1); // 6400 ELEC has sn_confirms with confirmable+!confirmed
  });

  it('tm 탭: TM 확인 카운트', () => {
    const tmOrders = filterByProcessTab(mockOrders, 'tm');
    const kpi = calcTabKpi(tmOrders, 'tm') as any;
    expect(kpi.totalON).toBe(1);
    expect(kpi.tmConfirmed).toBe(0);
    expect(kpi.tmReady).toBe(0); // TM has no sn_confirms
  });
});

describe('calcTabKpi — 혼재 partner_confirms', () => {
  const mixedOrders: OrderGroup[] = [{
    sales_order: '6520', model: 'GAIA-I', sn_count: 5,
    sns: [], sn_summary: '6700~6704',
    partner_info: { mech: 'TMS', elec: 'P&S', mixed: true },
    processes: {
      MECH: {
        ready: 5, total: 5, confirmable: false,
        mixed: true,
        partner_confirms: [
          {
            partner: 'TMS', all_confirmable: true, all_confirmed: false,
            sn_confirms: [
              { serial_number: 'SN6700', total: 10, completed: 10, pct: 100, confirmable: true, confirmed: false, confirmed_at: null, confirm_id: null },
            ],
          },
          {
            partner: 'FNI', all_confirmable: true, all_confirmed: true,
            sn_confirms: [
              { serial_number: 'SN6701', total: 10, completed: 10, pct: 100, confirmable: true, confirmed: true, confirmed_at: '2026-03-23', confirm_id: 10 },
              { serial_number: 'SN6702', total: 10, completed: 10, pct: 100, confirmable: true, confirmed: true, confirmed_at: '2026-03-23', confirm_id: 11 },
              { serial_number: 'SN6703', total: 10, completed: 10, pct: 100, confirmable: true, confirmed: true, confirmed_at: '2026-03-23', confirm_id: 12 },
              { serial_number: 'SN6704', total: 10, completed: 10, pct: 100, confirmable: true, confirmed: true, confirmed_at: '2026-03-23', confirm_id: 13 },
            ],
          },
        ],
      },
      ELEC: {
        ready: 5, total: 5, confirmable: true,
        all_confirmed: false,
        sn_confirms: [
          { serial_number: 'SN6700', total: 10, completed: 10, pct: 100, confirmable: true, confirmed: false, confirmed_at: null, confirm_id: null },
        ],
      },
    },
    confirms: [],
  }];

  it('혼재 MECH: partner 중 하나라도 sn_confirms에 미확인이면 mechReady 카운트', () => {
    const kpi = calcTabKpi(mixedOrders, 'mech_elec') as any;
    expect(kpi.mechReady).toBe(1); // TMS has sn with confirmable+!confirmed
  });

  it('혼재 MECH: 모든 partner all_confirmed이면 mechReady=0', () => {
    const allConfirmed: OrderGroup[] = [{
      ...mixedOrders[0],
      processes: {
        ...mixedOrders[0].processes,
        MECH: {
          ready: 5, total: 5, confirmable: false, mixed: true,
          partner_confirms: [
            {
              partner: 'TMS', all_confirmable: true, all_confirmed: true,
              sn_confirms: [
                { serial_number: 'SN6700', total: 10, completed: 10, pct: 100, confirmable: true, confirmed: true, confirmed_at: '2026-03-23', confirm_id: 14 },
              ],
            },
            {
              partner: 'FNI', all_confirmable: true, all_confirmed: true,
              sn_confirms: [
                { serial_number: 'SN6701', total: 10, completed: 10, pct: 100, confirmable: true, confirmed: true, confirmed_at: '2026-03-23', confirm_id: 10 },
              ],
            },
          ],
        },
      },
    }];
    const kpi = calcTabKpi(allConfirmed, 'mech_elec') as any;
    expect(kpi.mechReady).toBe(0);
  });

  it('비혼재: sn_confirms 기반 ready 체크', () => {
    const kpi = calcTabKpi(mockOrders, 'mech_elec') as any;
    expect(kpi.mechReady).toBe(1); // 6500 MECH has sn_confirms with confirmable
  });
});

describe('getISOWeekRange', () => {
  it('W13 of 2026 returns correct Mon-Mon range', () => {
    const [start, end] = getISOWeekRange('W13', 2026);
    expect(start).toBe('2026-03-22');
    expect(end).toBe('2026-03-29');
  });

  it('W1 of 2026 returns correct range', () => {
    const [start, end] = getISOWeekRange('W1', 2026);
    expect(start).toBe('2025-12-28');
    expect(end).toBe('2026-01-04');
  });

  it('range spans exactly 7 days', () => {
    const [start, end] = getISOWeekRange('W10', 2026);
    const s = new Date(start);
    const e = new Date(end);
    expect(e.getTime() - s.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
  });
});

describe('isProcessEnabled', () => {
  it('설정 ON -> true', () => {
    expect(isProcessEnabled({ confirm_mech_enabled: true }, 'MECH')).toBe(true);
  });

  it('설정 OFF -> false', () => {
    expect(isProcessEnabled({ confirm_tm_enabled: false }, 'TM')).toBe(false);
  });

  it('설정 없음(undefined) -> true (default)', () => {
    expect(isProcessEnabled(undefined, 'MECH')).toBe(true);
  });

  it('키 없음 -> true (default)', () => {
    expect(isProcessEnabled({}, 'ELEC')).toBe(true);
  });

  it('tm_pressure_test_required ON -> true', () => {
    expect(isProcessEnabled({ tm_pressure_test_required: true }, 'TM_PRESSURE_TEST')).toBe(true);
  });

  it('tm_pressure_test_required는 isProcessEnabled과 별개 키', () => {
    const settings = { confirm_tm_enabled: true, tm_pressure_test_required: false };
    expect(isProcessEnabled(settings, 'TM')).toBe(true);
  });
});
