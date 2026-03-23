// src/utils/productionFilters.ts
// 생산실적 순수 로직 — 탭 필터, 상태 필터, KPI 산출

import type { OrderGroup } from '@/types/production';

/** ISO 주차 → 월~다음월 범위 */
export function getISOWeekRange(weekStr: string, year: number): [string, string] {
  const weekNum = parseInt(weekStr.replace(/[Ww]/, ''));
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (weekNum - 1) * 7);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return [fmt(monday), fmt(nextMonday)];
}

/** 공정 탭별 O/N 필터 */
export function filterByProcessTab(
  orders: OrderGroup[],
  tab: 'mech_elec' | 'tm',
  weekStart?: string,
  weekEnd?: string
): OrderGroup[] {
  return orders.filter(o => {
    if (tab === 'mech_elec') {
      const hasMechElec = (o.processes?.MECH?.total ?? 0) > 0 || (o.processes?.ELEC?.total ?? 0) > 0;
      if (!hasMechElec) return false;
      if (weekStart && weekEnd) {
        const mechEnd = o.mech_end;
        const elecEnd = o.elec_end;
        const mechInRange = mechEnd && mechEnd >= weekStart && mechEnd < weekEnd;
        const elecInRange = elecEnd && elecEnd >= weekStart && elecEnd < weekEnd;
        if (!mechInRange && !elecInRange) return false;
      }
      return true;
    } else {
      const hasTM = (o.processes?.TM?.total ?? 0) > 0;
      if (!hasTM) return false;
      if (weekStart && weekEnd) {
        const modEnd = o.module_end;
        if (!modEnd || modEnd < weekStart || modEnd >= weekEnd) return false;
      }
      return true;
    }
  });
}

/** 상태 필터 */
export function filterByStatus(
  orders: OrderGroup[],
  status: 'all' | 'done' | 'pending'
): OrderGroup[] {
  if (status === 'all') return orders;

  const isDone = (o: OrderGroup): boolean => {
    const mechDone = !o.processes?.MECH || (o.processes.MECH.mixed
      ? o.processes.MECH.partner_confirms?.every(pc => pc.all_confirmed) ?? true
      : o.processes.MECH.all_confirmed ?? false);
    const elecDone = !o.processes?.ELEC || (o.processes.ELEC.mixed
      ? o.processes.ELEC.partner_confirms?.every(pc => pc.all_confirmed) ?? true
      : o.processes.ELEC.all_confirmed ?? false);
    const tmDone = (o.processes?.TM?.total ?? 0) === 0 || (o.processes?.TM?.all_confirmed ?? false);
    return mechDone && elecDone && tmDone;
  };

  if (status === 'done') return orders.filter(isDone);
  return orders.filter(o => !isDone(o));
}

/** KPI 산출 — 탭별 확인 카운트 */
export function calcTabKpi(orders: OrderGroup[], tab: 'mech_elec' | 'tm') {
  if (tab === 'mech_elec') {
    return {
      totalON: orders.length,
      totalSN: orders.reduce((s, o) => s + o.sn_count, 0),
      mechConfirmed: orders.filter(o => {
        const proc = o.processes?.MECH;
        if (!proc) return false;
        if (proc.mixed && proc.partner_confirms) return proc.partner_confirms.every(pc => pc.all_confirmed);
        return proc.all_confirmed ?? false;
      }).length,
      elecConfirmed: orders.filter(o => {
        const proc = o.processes?.ELEC;
        if (!proc) return false;
        if (proc.mixed && proc.partner_confirms) return proc.partner_confirms.every(pc => pc.all_confirmed);
        return proc.all_confirmed ?? false;
      }).length,
      mechReady: orders.filter(o => {
        const proc = o.processes?.MECH;
        if (!proc) return false;
        if (proc.mixed && proc.partner_confirms) {
          return proc.partner_confirms.some(pc => pc.sn_confirms.some(sc => sc.confirmable && !sc.confirmed));
        }
        return (proc.sn_confirms ?? []).some(sc => sc.confirmable && !sc.confirmed);
      }).length,
      elecReady: orders.filter(o => {
        const proc = o.processes?.ELEC;
        if (!proc) return false;
        if (proc.mixed && proc.partner_confirms) {
          return proc.partner_confirms.some(pc => pc.sn_confirms.some(sc => sc.confirmable && !sc.confirmed));
        }
        return (proc.sn_confirms ?? []).some(sc => sc.confirmable && !sc.confirmed);
      }).length,
    };
  }
  return {
    totalON: orders.length,
    totalSN: orders.reduce((s, o) => s + o.sn_count, 0),
    tmConfirmed: orders.filter(o => {
      const proc = o.processes?.TM;
      if (!proc) return false;
      if (proc.mixed && proc.partner_confirms) return proc.partner_confirms.every(pc => pc.all_confirmed);
      return proc.all_confirmed ?? false;
    }).length,
    tmReady: orders.filter(o => {
      const proc = o.processes?.TM;
      if (!proc) return false;
      if (proc.mixed && proc.partner_confirms) {
        return proc.partner_confirms.some(pc => pc.sn_confirms.some(sc => sc.confirmable && !sc.confirmed));
      }
      return (proc.sn_confirms ?? []).some(sc => sc.confirmable && !sc.confirmed);
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
