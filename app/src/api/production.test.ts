// src/api/production.test.ts
// BE->FE 변환 로직 테스트 (API 호출 mock)
import { describe, it, expect, vi, beforeEach } from 'vitest';

// apiClient mock
vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
  },
}));

import apiClient from './client';
import { getPerformance } from './production';

const mockedGet = vi.mocked(apiClient.get);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getPerformance — BE->FE 변환', () => {
  it('partner_info 변환: BE flat -> FE 객체', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        week: 'W12', month: '2026-03',
        orders: [{
          sales_order: '6400', model: 'GAIA-L', sn_count: 1,
          sns: [{ serial_number: '6855', mech_partner: 'FNI', elec_partner: 'TMS(E)', progress: {}, checklist: { MECH: { completed: false, completed_at: null }, ELEC: { completed: false, completed_at: null } } }],
          sn_summary: '6855',
          mech_partner: 'FNI', elec_partner: 'TMS(E)',
          processes: { MECH: { ready: 1, total: 1, confirmable: false } },
          confirms: [],
        }],
        summary: { total_orders: 1, mech_confirmable: 0, elec_confirmable: 0, tm_confirmable: 0 },
      } as any,
    });

    const result = await getPerformance('W12');
    expect(result.orders[0].partner_info).toEqual({
      mech: 'FNI', elec: 'TMS(E)', mixed: false,
    });
  });

  it('mixed 판정: S/N 2대, 기구 협력사 다름 -> mixed: true', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        week: 'W12', month: '2026-03',
        orders: [{
          sales_order: '6401', model: 'GAIA-L', sn_count: 2,
          sns: [
            { serial_number: '6855', mech_partner: 'FNI', elec_partner: 'TMS(E)', progress: {}, checklist: { MECH: { completed: false, completed_at: null }, ELEC: { completed: false, completed_at: null } } },
            { serial_number: '6856', mech_partner: 'BAT', elec_partner: 'TMS(E)', progress: {}, checklist: { MECH: { completed: false, completed_at: null }, ELEC: { completed: false, completed_at: null } } },
          ],
          sn_summary: '6855~6856',
          mech_partner: 'FNI', elec_partner: 'TMS(E)',
          processes: { MECH: { ready: 2, total: 2, confirmable: false } },
          confirms: [],
        }],
        summary: { total_orders: 1, mech_confirmable: 0, elec_confirmable: 0, tm_confirmable: 0 },
      } as any,
    });

    const result = await getPerformance('W12');
    expect(result.orders[0].partner_info.mixed).toBe(true);
  });

  it('mixed 판정: S/N 1대 -> mixed: false', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        week: 'W12', month: '2026-03',
        orders: [{
          sales_order: '6402', model: 'GAIA-L', sn_count: 1,
          sns: [{ serial_number: '6855', mech_partner: 'FNI', elec_partner: 'TMS(E)', progress: {}, checklist: { MECH: { completed: false, completed_at: null }, ELEC: { completed: false, completed_at: null } } }],
          sn_summary: '6855',
          mech_partner: 'FNI', elec_partner: 'TMS(E)',
          processes: { MECH: { ready: 1, total: 1, confirmable: false } },
          confirms: [],
        }],
        summary: { total_orders: 1, mech_confirmable: 0, elec_confirmable: 0, tm_confirmable: 0 },
      } as any,
    });

    const result = await getPerformance('W12');
    expect(result.orders[0].partner_info.mixed).toBe(false);
  });

  it('confirms 변환: processes 내 confirmed -> ConfirmRecord[]', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        week: 'W12', month: '2026-03',
        orders: [{
          sales_order: '6403', model: 'SWS', sn_count: 1,
          sns: [],
          sn_summary: '7000',
          partner_info: { mech: 'FNI', elec: 'P&S', mixed: false },
          processes: {
            MECH: { ready: 1, total: 1, confirmable: false, confirmed: true, confirm_id: 10, confirmed_by: 'admin', confirmed_at: '2026-03-22T10:00:00' },
            ELEC: { ready: 1, total: 1, confirmable: false, confirmed: false },
          },
          confirms: [],
        }],
        summary: { total_orders: 1, mech_confirmable: 0, elec_confirmable: 0, tm_confirmable: 0 },
      } as any,
    });

    const result = await getPerformance('W12');
    const confirms = result.orders[0].confirms;
    expect(confirms).toHaveLength(1);
    expect(confirms[0].process_type).toBe('MECH');
    expect(confirms[0].id).toBe(10);
    expect(confirms[0].confirmed_by).toBe('admin');
  });
});
