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

/** 공정 탭별 O/N 필터 — end 날짜는 sns[] 순회 */
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
      // sns[] 순회 — any SN의 end가 주간 범위에 있으면 통과
      if (weekStart && weekEnd && o.sns?.length > 0) {
        const hasAnyEnd = o.sns.some(sn => sn.mech_end || sn.elec_end);
        if (hasAnyEnd) {
          const anyInRange = o.sns.some(sn => {
            const mechOk = sn.mech_end && sn.mech_end >= weekStart && sn.mech_end < weekEnd;
            const elecOk = sn.elec_end && sn.elec_end >= weekStart && sn.elec_end < weekEnd;
            return mechOk || elecOk;
          });
          if (!anyInRange) return false;
        }
      }
      return true;
    } else {
      const hasTM = (o.processes?.TM?.total ?? 0) > 0;
      if (!hasTM) return false;
      if (weekStart && weekEnd && o.sns?.length > 0) {
        const hasAnyEnd = o.sns.some(sn => sn.module_end);
        if (hasAnyEnd) {
          const anyInRange = o.sns.some(sn =>
            sn.module_end && sn.module_end >= weekStart && sn.module_end < weekEnd
          );
          if (!anyInRange) return false;
        }
      }
      return true;
    }
  });
}

/** 공정 confirmed 판정 (all_confirmed → confirmed fallback) */
function isProcConfirmed(proc: OrderGroup['processes'][string] | undefined): boolean {
  if (!proc) return false;
  if (proc.mixed && proc.partner_confirms) return proc.partner_confirms.every(pc => pc.all_confirmed);
  if (proc.all_confirmed !== undefined) return proc.all_confirmed;
  return proc.confirmed ?? false;
}

/** 공정 ready 판정 (sn_confirms → confirmable fallback) */
function isProcReady(proc: OrderGroup['processes'][string] | undefined): boolean {
  if (!proc) return false;
  if (proc.mixed && proc.partner_confirms) {
    return proc.partner_confirms.some(pc => pc.sn_confirms.some(sc => sc.confirmable && !sc.confirmed));
  }
  if (proc.sn_confirms && proc.sn_confirms.length > 0) {
    return proc.sn_confirms.some(sc => sc.confirmable && !sc.confirmed);
  }
  return (proc.confirmable ?? false) && !isProcConfirmed(proc);
}

/** O/N 전체 완료 판정 — 테이블 행 배경색 등에 사용 */
export function isOrderDone(o: OrderGroup): boolean {
  const mechDone = !o.processes?.MECH || isProcConfirmed(o.processes.MECH);
  const elecDone = !o.processes?.ELEC || isProcConfirmed(o.processes.ELEC);
  const tmDone = (o.processes?.TM?.total ?? 0) === 0 || isProcConfirmed(o.processes.TM);
  return mechDone && elecDone && tmDone;
}

/** 상태 필터 */
export function filterByStatus(
  orders: OrderGroup[],
  status: 'all' | 'done' | 'pending'
): OrderGroup[] {
  if (status === 'all') return orders;
  if (status === 'done') return orders.filter(isOrderDone);
  return orders.filter(o => !isOrderDone(o));
}

/** KPI 산출 — 탭별 확인 카운트 */
export function calcTabKpi(orders: OrderGroup[], tab: 'mech_elec' | 'tm') {
  if (tab === 'mech_elec') {
    return {
      totalON: orders.length,
      totalSN: orders.reduce((s, o) => s + o.sn_count, 0),
      mechConfirmed: orders.filter(o => isProcConfirmed(o.processes?.MECH)).length,
      elecConfirmed: orders.filter(o => isProcConfirmed(o.processes?.ELEC)).length,
      mechReady: orders.filter(o => isProcReady(o.processes?.MECH)).length,
      elecReady: orders.filter(o => isProcReady(o.processes?.ELEC)).length,
    };
  }
  return {
    totalON: orders.length,
    totalSN: orders.reduce((s, o) => s + o.sn_count, 0),
    tmConfirmed: orders.filter(o => isProcConfirmed(o.processes?.TM)).length,
    tmReady: orders.filter(o => isProcReady(o.processes?.TM)).length,
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
