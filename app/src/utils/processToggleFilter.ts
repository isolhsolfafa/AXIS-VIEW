// src/utils/processToggleFilter.ts
// Sprint 46 — 생산현황 PI/QI/SI 공정 토글 편의 필터 (FEAT-SNSTATUS-PROCESS-TOGGLE-FILTER)
// 표시 조건은 BE progress_service 신호(started / done·total / completed_today) 기반.

import type { SNProduct, CategoryProgress } from '@/types/snStatus';

export interface ProcessToggles {
  PI: boolean;
  QI: boolean;
  SI: boolean;
}

export const NO_PROCESS_TOGGLE: ProcessToggles = { PI: false, QI: false, SI: false };

// PI/QI 표시 조건 (영역 4/9): 태깅됨(work_start_log) AND (미완료 OR 완료일=오늘)
// → 완료 후 익일 자동 제거 (done==total && !completed_today → false)
function piqiVisible(cat: CategoryProgress | undefined): boolean {
  if (!cat || !cat.started) return false;
  return cat.done < cat.total || !!cat.completed_today;
}

// SI 표시 조건 (영역 4/9): SI task 중 하나라도 미완료 (전부 완료 → 출하 완료로 제거)
// task 1개/2개 무관 — done < total 로 일반화
function siVisible(cat: CategoryProgress | undefined): boolean {
  if (!cat || cat.total <= 0) return false;
  return cat.done < cat.total;
}

/**
 * 공정 토글 필터 — 켜진 토글들의 OR 합집합.
 * - 전부 OFF → 전체보기 (true)
 * - 하나라도 ON → 해당 공정 표시 조건 중 하나라도 만족 시 true
 */
export function isVisibleForProcessToggle(product: SNProduct, toggles: ProcessToggles): boolean {
  if (!toggles.PI && !toggles.QI && !toggles.SI) return true;
  if (toggles.PI && piqiVisible(product.categories.PI)) return true;
  if (toggles.QI && piqiVisible(product.categories.QI)) return true;
  if (toggles.SI && siVisible(product.categories.SI)) return true;
  return false;
}
