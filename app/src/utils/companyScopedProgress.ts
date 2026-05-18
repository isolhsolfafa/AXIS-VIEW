// src/utils/companyScopedProgress.ts
// Sprint 41 — 협력사별 진행률 view (BIZ-COMPANY-PROGRESS-01)
// admin/GST → 현행 그대로, 협력사 → 자기 담당 카테고리(MECH/ELEC/TMS)만 평균

import type { SNProduct } from '@/types/snStatus';
import { PROCESS_ORDER } from '@/components/sn-status/constants';

interface UserScope {
  company?: string;
  isAdmin: boolean;
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
 * - admin / GST → PROCESS_ORDER 전부
 * - 협력사 → product.{partner_field} === alias 적용 user.company 인 카테고리만
 * - DB 빈 문자열 (146건 / 11.6%) 은 매칭 실패로 처리
 */
export function getCompanyScopedCategories(
  product: SNProduct,
  user: UserScope,
): string[] {
  if (user.isAdmin || user.company === 'GST') {
    return [...PROCESS_ORDER];
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
 * - admin / GST → product.overall_percent 그대로
 * - 협력사 → matched 카테고리 percent 평균
 * - 0매칭 또는 모든 categories[cat] undefined → null (UI '—' 처리)
 */
export function getCompanyScopedPercent(
  product: SNProduct,
  user: UserScope,
): number | null {
  if (user.isAdmin || user.company === 'GST') {
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
