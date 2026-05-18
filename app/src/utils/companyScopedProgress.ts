// src/utils/companyScopedProgress.ts
// Sprint 41 — 협력사별 진행률 view (BIZ-COMPANY-PROGRESS-01)
// Sprint 45 — GST 자체공정(PI/QI/SI) role 스코프: is_manager 만 전체, 일반 GST 작업자는 자기 공정만

import type { SNProduct } from '@/types/snStatus';
import type { User } from '@/types/auth';
import { PROCESS_ORDER } from '@/components/sn-status/constants';

export interface UserScope {
  company?: string;
  isAdmin: boolean;
  isManager?: boolean;   // Sprint 45 — GST 는 manager 만 전체 view
  role?: string;         // Sprint 45 — GST 작업자 담당 공정 (PI/QI/SI)
}

// readonly 튜플 → string[] 비교용 (role ∈ PROCESS_ORDER 체크)
const PROCESS_ORDER_SET: readonly string[] = PROCESS_ORDER;

// User → UserScope 변환 (호출처 5곳 중복 제거 — Codex A-3)
export function userToScope(user: User | null | undefined): UserScope {
  return {
    company: user?.company,
    isAdmin: user?.is_admin ?? false,
    isManager: user?.is_manager ?? false,
    role: user?.role,
  };
}

// 카테고리 ↔ partner 필드 매핑 (코드 키 'TMS' = UI 라벨 'TM')
// PI/QI/SI 는 GST 직속 — partner 필드 없음
const PARTNER_FIELD_MAP: Record<string, keyof SNProduct> = {
  MECH: 'mech_partner',
  ELEC: 'elec_partner',
  TMS: 'module_outsourcing',
};

// Codex M5: 카테고리별 alias — DB 실측 (2026-05-06) 기반
// DB 모든 partner 필드 'TMS' 단축 표기 (TMS(M)/TMS(E) 구분 X)
// user.company 측 부서 구분 ('TMS(M)'=모듈, 'TMS(E)'=전장)
// → 카테고리별 alias 분리 (MECH/TMS = TMS(M), ELEC = TMS(E))
const PARTNER_FIELD_ALIASES: Record<string, Record<string, string>> = {
  MECH: { 'TMS(M)': 'TMS' },
  TMS: { 'TMS(M)': 'TMS' },
  ELEC: { 'TMS(E)': 'TMS' },
};

/**
 * 사용자가 담당하는 카테고리 목록 반환
 * - admin → PROCESS_ORDER 전부
 * - GST + is_manager → PROCESS_ORDER 전부
 * - GST + 작업자(non-manager) → role(PI/QI/SI) 공정만. role 미일치 → [] (전체 fallback 금지)
 * - 협력사 → product.{partner_field} === alias 적용 user.company 인 카테고리만
 * - DB 빈 문자열 (146건 / 11.6%) 은 매칭 실패로 처리
 */
export function getCompanyScopedCategories(
  product: SNProduct,
  user: UserScope,
): string[] {
  if (user.isAdmin) {
    return [...PROCESS_ORDER];
  }
  // Sprint 45: GST — manager 만 전체, 작업자는 자기 공정만
  if (user.company === 'GST') {
    if (user.isManager) return [...PROCESS_ORDER];
    return user.role && PROCESS_ORDER_SET.includes(user.role) ? [user.role] : [];
  }
  if (!user.company) return [];
  const userCompany = user.company;

  return Object.entries(PARTNER_FIELD_MAP)
    .filter(([cat, field]) => {
      const dbValue = product[field];
      if (!dbValue) return false;

      const aliasMap = PARTNER_FIELD_ALIASES[cat];
      const targetCompany = aliasMap?.[userCompany] ?? userCompany;
      return dbValue === targetCompany;
    })
    .map(([cat]) => cat);
}

/**
 * 회사 분기된 진행률 반환 — 카테고리 산술평균 (BE overall_percent 동일 방식)
 * - admin → product.overall_percent 그대로
 * - GST + is_manager → product.overall_percent 그대로
 * - GST 작업자 + 협력사 → matched 카테고리 percent 평균
 * - 0매칭 또는 모든 categories[cat] undefined → null (UI '—' 처리, 정렬 rank 3)
 */
export function getCompanyScopedPercent(
  product: SNProduct,
  user: UserScope,
): number | null {
  if (user.isAdmin) {
    return product.overall_percent;
  }
  // Sprint 45: GST manager 만 전체 진행률
  if (user.company === 'GST' && user.isManager) {
    return product.overall_percent;
  }

  const matched = getCompanyScopedCategories(product, user);
  if (matched.length === 0) return null;

  const percents = matched
    .map(cat => product.categories[cat]?.percent)
    .filter((p): p is number => typeof p === 'number');

  if (percents.length === 0) return null;
  return Math.round(percents.reduce((s, p) => s + p, 0) / percents.length);
}
