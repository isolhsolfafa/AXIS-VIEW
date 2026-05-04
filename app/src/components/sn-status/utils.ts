// src/components/sn-status/utils.ts
// Sprint 40 — Tank Module 시작/종료 헬퍼 (P2 다중 카테고리 화이트리스트)

import type { SNTaskDetail, SNProduct } from '@/types/snStatus';

// Codex P2: TMS=GAIA/iVAS, MECH=DRAGON/SWS/GALLANT
export const TANK_MODULE_CATEGORIES = ['TMS', 'MECH'] as const;

export const isTankModule = (t: SNTaskDetail): boolean =>
  t.task_id === 'TANK_MODULE' &&
  (TANK_MODULE_CATEGORIES as readonly string[]).includes(t.task_category);

// Codex M6: 카테고리별 회사 매핑
// 시작된 task → worker.company / 미시작 + TMS → product.module_outsourcing / 미시작 + MECH → product.mech_partner
export function getTaskCompany(
  task: SNTaskDetail,
  orderProducts: SNProduct[],
): string | null {
  const started = task.workers.find(w => w.started_at && w.company);
  if (started) return started.company ?? null;
  if (!task.serial_number) return null;
  const product = orderProducts.find(p => p.serial_number === task.serial_number);
  if (!product) return null;
  if (task.task_category === 'TMS') return product.module_outsourcing ?? null;
  if (task.task_category === 'MECH') return product.mech_partner ?? null;
  return null;
}

interface FilterArgs {
  orderTasks: SNTaskDetail[] | undefined;
  orderProducts: SNProduct[];
  currentSn: string;
  isAdmin: boolean;
  currentUserCompany?: string;
}

export function getOtherSNsTankStartable(args: FilterArgs): SNTaskDetail[] {
  const { orderTasks, orderProducts, currentSn, isAdmin, currentUserCompany } = args;
  return (orderTasks ?? [])
    .filter(t => isTankModule(t))
    .filter(t => t.serial_number !== currentSn)
    .filter(t => t.workers.every(w => !w.started_at))
    .filter(t => {
      if (isAdmin) return true;
      const company = getTaskCompany(t, orderProducts);
      return company !== null && company === currentUserCompany;
    });
}

export function getOtherSNsTankCompletable(args: FilterArgs): SNTaskDetail[] {
  const { orderTasks, orderProducts, currentSn, isAdmin, currentUserCompany } = args;
  return (orderTasks ?? [])
    .filter(t => isTankModule(t))
    .filter(t => t.serial_number !== currentSn)
    .filter(t => t.workers.some(w => w.started_at && !w.completed_at))
    .filter(t => {
      if (isAdmin) return true;
      const company = getTaskCompany(t, orderProducts);
      return company !== null && company === currentUserCompany;
    });
}

// skipped reason 한국어 매핑 (Codex I6)
export const SKIPPED_REASON_LABEL: Record<string, string> = {
  ALREADY_STARTED: '이미 시작됨',
  ALREADY_COMPLETED: '이미 종료됨',
  NOT_STARTED: '아직 시작 안 됨 (종료 불가)',
  NOT_FOUND: 'task ID 조회 실패',
  NOT_TANK_MODULE: 'Tank Module 이 아님',
  FORBIDDEN_COMPANY: '권한 범위 밖 (다른 회사 task)',
};
