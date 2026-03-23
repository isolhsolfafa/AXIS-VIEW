// src/utils/productionFilters.test.ts
import { describe, it, expect } from 'vitest';
import { filterByProcessTab, filterByStatus, calcTabKpi, isProcessEnabled } from './productionFilters';
import type { OrderGroup } from '@/types/production';

// mock 데이터
const mockOrders: OrderGroup[] = [
  {
    sales_order: '6400', model: 'GAIA-L', sn_count: 3,
    sns: [], sn_summary: '6855~6857',
    partner_info: { mech: 'A사', elec: 'B사', mixed: false },
    processes: {
      MECH: { ready: 3, total: 3, confirmable: true },
      ELEC: { ready: 3, total: 3, confirmable: true },
      TM:   { ready: 2, total: 3, confirmable: false },
    },
    confirms: [{ id: 1, process_type: 'MECH', confirmed_week: 'W12', confirmed_by: 'admin', confirmed_at: '2026-03-23' }],
  },
  {
    sales_order: '6500', model: 'SWS-JP', sn_count: 2,
    sns: [], sn_summary: '6900~6901',
    partner_info: { mech: 'C사', elec: 'D사', mixed: false },
    processes: {
      MECH: { ready: 2, total: 2, confirmable: true },
      ELEC: { ready: 2, total: 2, confirmable: false },
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
});

describe('filterByStatus', () => {
  it('all: 전체 반환', () => {
    expect(filterByStatus(mockOrders, 'all')).toHaveLength(2);
  });

  it('pending: 미완료 포함 O/N만', () => {
    const result = filterByStatus(mockOrders, 'pending');
    expect(result).toHaveLength(2);
  });

  it('done: 전체 확인 완료된 O/N만', () => {
    const doneOrders: OrderGroup[] = [{
      ...mockOrders[0],
      processes: {
        MECH: { ready: 3, total: 3, confirmable: true },
        ELEC: { ready: 3, total: 3, confirmable: true },
        TM:   { ready: 3, total: 3, confirmable: true },
      },
      confirms: [
        { id: 1, process_type: 'MECH', confirmed_week: 'W12', confirmed_by: 'admin', confirmed_at: '2026-03-23' },
        { id: 2, process_type: 'ELEC', confirmed_week: 'W12', confirmed_by: 'admin', confirmed_at: '2026-03-23' },
        { id: 3, process_type: 'TM', confirmed_week: 'W12', confirmed_by: 'admin', confirmed_at: '2026-03-23' },
      ],
    }];
    expect(filterByStatus(doneOrders, 'done')).toHaveLength(1);
  });

  it('done: TM 없는 O/N도 MECH+ELEC 완료면 done', () => {
    const noTmDone: OrderGroup[] = [{
      ...mockOrders[1],
      confirms: [
        { id: 1, process_type: 'MECH', confirmed_week: 'W12', confirmed_by: 'admin', confirmed_at: '2026-03-23' },
        { id: 2, process_type: 'ELEC', confirmed_week: 'W12', confirmed_by: 'admin', confirmed_at: '2026-03-23' },
      ],
    }];
    expect(filterByStatus(noTmDone, 'done')).toHaveLength(1);
  });
});

describe('calcTabKpi', () => {
  it('mech_elec 탭: 기구/전장 확인 카운트', () => {
    const kpi = calcTabKpi(mockOrders, 'mech_elec') as any;
    expect(kpi.totalON).toBe(2);
    expect(kpi.totalSN).toBe(5);
    expect(kpi.mechConfirmed).toBe(1);
    expect(kpi.elecConfirmed).toBe(0);
    expect(kpi.mechReady).toBe(1); // 6500 MECH confirmable + no confirm
    expect(kpi.elecReady).toBe(1); // 6400 ELEC confirmable + no confirm
  });

  it('tm 탭: TM 확인 카운트', () => {
    const tmOrders = filterByProcessTab(mockOrders, 'tm');
    const kpi = calcTabKpi(tmOrders, 'tm') as any;
    expect(kpi.totalON).toBe(1);
    expect(kpi.tmConfirmed).toBe(0);
    expect(kpi.tmReady).toBe(0); // TM confirmable=false
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
          { partner: 'TMS', sn_count: 1, total: 1, completed: 1, confirmable: true, confirmed: false, confirmed_at: null, confirm_id: null },
          { partner: 'FNI', sn_count: 4, total: 4, completed: 4, confirmable: true, confirmed: true, confirmed_at: '2026-03-23', confirm_id: 10 },
        ],
      },
      ELEC: { ready: 5, total: 5, confirmable: true },
    },
    confirms: [],
  }];

  it('혼재 MECH: partner 중 하나라도 confirmable+미확인이면 mechReady 카운트', () => {
    const kpi = calcTabKpi(mixedOrders, 'mech_elec') as any;
    expect(kpi.mechReady).toBe(1); // TMS confirmable + not confirmed
  });

  it('혼재 MECH: 모든 partner confirmed이면 mechReady=0', () => {
    const allConfirmed: OrderGroup[] = [{
      ...mixedOrders[0],
      processes: {
        ...mixedOrders[0].processes,
        MECH: {
          ready: 5, total: 5, confirmable: false, mixed: true,
          partner_confirms: [
            { partner: 'TMS', sn_count: 1, total: 1, completed: 1, confirmable: true, confirmed: true, confirmed_at: '2026-03-23', confirm_id: 11 },
            { partner: 'FNI', sn_count: 4, total: 4, completed: 4, confirmable: true, confirmed: true, confirmed_at: '2026-03-23', confirm_id: 10 },
          ],
        },
      },
    }];
    const kpi = calcTabKpi(allConfirmed, 'mech_elec') as any;
    expect(kpi.mechReady).toBe(0);
  });

  it('비혼재: partner_confirms=null이면 기존 로직 사용', () => {
    const kpi = calcTabKpi(mockOrders, 'mech_elec') as any;
    expect(kpi.mechReady).toBe(1); // 6500 MECH confirmable
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
});
