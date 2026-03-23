// src/utils/productionFilters.ts
// 생산실적 순수 로직 — 탭 필터, 상태 필터, KPI 산출

import type { OrderGroup } from '@/types/production';

/** 공정 탭별 O/N 필터 */
export function filterByProcessTab(
  orders: OrderGroup[],
  tab: 'mech_elec' | 'tm'
): OrderGroup[] {
  if (tab === 'mech_elec') {
    return orders.filter(o =>
      (o.processes?.MECH?.total ?? 0) > 0 || (o.processes?.ELEC?.total ?? 0) > 0
    );
  }
  return orders.filter(o => (o.processes?.TM?.total ?? 0) > 0);
}

/** 상태 필터 */
export function filterByStatus(
  orders: OrderGroup[],
  status: 'all' | 'done' | 'pending'
): OrderGroup[] {
  if (status === 'all') return orders;
  if (status === 'done') {
    return orders.filter(o => {
      const hasAll = (['MECH', 'ELEC'] as const).every(
        pt => (o.confirms ?? []).some(c => c.process_type === pt)
      );
      const tmDone = (o.processes?.TM?.total ?? 0) === 0
        || (o.confirms ?? []).some(c => c.process_type === 'TM');
      return hasAll && tmDone;
    });
  }
  // pending
  return orders.filter(o => {
    const hasAll = (['MECH', 'ELEC'] as const).every(
      pt => (o.confirms ?? []).some(c => c.process_type === pt)
    );
    const tmDone = (o.processes?.TM?.total ?? 0) === 0
      || (o.confirms ?? []).some(c => c.process_type === 'TM');
    return !(hasAll && tmDone);
  });
}

/** KPI 산출 — 탭별 확인 카운트 */
export function calcTabKpi(orders: OrderGroup[], tab: 'mech_elec' | 'tm') {
  if (tab === 'mech_elec') {
    return {
      totalON: orders.length,
      totalSN: orders.reduce((s, o) => s + o.sn_count, 0),
      mechConfirmed: orders.filter(o =>
        (o.confirms ?? []).some(c => c.process_type === 'MECH')).length,
      elecConfirmed: orders.filter(o =>
        (o.confirms ?? []).some(c => c.process_type === 'ELEC')).length,
      mechReady: orders.filter(o => {
        const proc = o.processes?.MECH;
        if (!proc) return false;
        if (proc.mixed && proc.partner_confirms) {
          return proc.partner_confirms.some(pc => pc.confirmable && !pc.confirmed);
        }
        return proc.confirmable && !(o.confirms ?? []).some(c => c.process_type === 'MECH');
      }).length,
      elecReady: orders.filter(o => {
        const proc = o.processes?.ELEC;
        if (!proc) return false;
        if (proc.mixed && proc.partner_confirms) {
          return proc.partner_confirms.some(pc => pc.confirmable && !pc.confirmed);
        }
        return proc.confirmable && !(o.confirms ?? []).some(c => c.process_type === 'ELEC');
      }).length,
    };
  }
  return {
    totalON: orders.length,
    totalSN: orders.reduce((s, o) => s + o.sn_count, 0),
    tmConfirmed: orders.filter(o =>
      (o.confirms ?? []).some(c => c.process_type === 'TM')).length,
    tmReady: orders.filter(o => {
      const proc = o.processes?.TM;
      if (!proc) return false;
      if (proc.mixed && proc.partner_confirms) {
        return proc.partner_confirms.some(pc => pc.confirmable && !pc.confirmed);
      }
      return proc.confirmable && !(o.confirms ?? []).some(c => c.process_type === 'TM');
    }).length,
  };
}

/** 공정 활성화 여부 */
export function isProcessEnabled(
  settings: Record<string, unknown> | undefined,
  processType: string
): boolean {
  const key = `confirm_${processType.toLowerCase()}_enabled`;
  return settings?.[key] !== false;
}
