// src/utils/companyScopedProgress.test.ts
// Sprint 41 — admin / 협력사 매칭 / alias / null
// Sprint 45 — GST manager 전체 / GST 작업자 role 스코프(PI/QI/SI) / role 미일치 edge / userToScope

import { describe, it, expect } from 'vitest';
import { getCompanyScopedPercent, getCompanyScopedCategories, userToScope } from './companyScopedProgress';
import type { SNProduct } from '@/types/snStatus';
import type { User } from '@/types/auth';

const baseProduct: SNProduct = {
  serial_number: 'SN0001',
  model: 'GAIA-L',
  customer: 'TEST',
  ship_plan_date: null,
  sales_order: 'O0001',
  all_completed: false,
  all_completed_at: null,
  overall_percent: 38,
  categories: {
    MECH: { total: 10, done: 10, percent: 100 },
    ELEC: { total: 10, done: 5, percent: 50 },
    TMS: { total: 10, done: 8, percent: 80 },
    PI: { total: 5, done: 3, percent: 60 },
    QI: { total: 5, done: 0, percent: 0 },
    SI: { total: 5, done: 0, percent: 0 },
  },
  my_category: null,
  last_worker: null,
  last_activity_at: null,
  last_task_name: null,
  last_task_category: null,
  mech_partner: 'FNI',
  elec_partner: 'TMS',
  module_outsourcing: 'TMS',
  line: null,
};

describe('getCompanyScopedPercent — admin / 협력사 (Sprint 41)', () => {
  it('admin → overall_percent 그대로', () => {
    expect(getCompanyScopedPercent(baseProduct, { isAdmin: true })).toBe(38);
  });

  it('FNI 매니저 (MECH 직접 매칭) → 100%', () => {
    expect(getCompanyScopedPercent(baseProduct, { company: 'FNI', isAdmin: false })).toBe(100);
  });

  it('TMS(M) alias → MECH(100) + TMS(80) 평균 = 90', () => {
    const result = getCompanyScopedPercent(
      { ...baseProduct, mech_partner: 'TMS' },
      { company: 'TMS(M)', isAdmin: false },
    );
    expect(result).toBe(90);
  });

  it('TMS(E) alias → ELEC 단일 = 50%', () => {
    expect(getCompanyScopedPercent(baseProduct, { company: 'TMS(E)', isAdmin: false })).toBe(50);
  });

  it('partner=NULL/빈 문자열 → null', () => {
    const product = { ...baseProduct, mech_partner: null, elec_partner: '', module_outsourcing: '' };
    expect(getCompanyScopedPercent(product, { company: 'FNI', isAdmin: false })).toBeNull();
  });
});

describe('getCompanyScopedPercent — GST manager / 작업자 (Sprint 45)', () => {
  it('GST + is_manager → overall_percent 전체', () => {
    expect(getCompanyScopedPercent(baseProduct, { company: 'GST', isAdmin: false, isManager: true })).toBe(38);
  });

  it('GST 작업자(role=PI) → PI 공정만 (60%)', () => {
    expect(getCompanyScopedPercent(baseProduct, { company: 'GST', isAdmin: false, isManager: false, role: 'PI' })).toBe(60);
  });

  it('GST 작업자(role=QI) → QI 공정만 (0%)', () => {
    expect(getCompanyScopedPercent(baseProduct, { company: 'GST', isAdmin: false, isManager: false, role: 'QI' })).toBe(0);
  });

  it('GST 작업자 role 미설정 → null (전체 fallback 금지)', () => {
    expect(getCompanyScopedPercent(baseProduct, { company: 'GST', isAdmin: false, isManager: false })).toBeNull();
  });

  it('GST 작업자 role=TM (misconfig — TMS 아님) → null', () => {
    expect(getCompanyScopedPercent(baseProduct, { company: 'GST', isAdmin: false, isManager: false, role: 'TM' })).toBeNull();
  });

  it('GST 작업자(role=SI) 인데 해당 공정 카테고리 없는 S/N → null', () => {
    const noSI = { ...baseProduct, categories: { MECH: baseProduct.categories.MECH } };
    expect(getCompanyScopedPercent(noSI, { company: 'GST', isAdmin: false, isManager: false, role: 'SI' })).toBeNull();
  });
});

describe('getCompanyScopedCategories', () => {
  it('admin → PROCESS_ORDER 전부', () => {
    expect(getCompanyScopedCategories(baseProduct, { isAdmin: true })).toEqual(['MECH', 'ELEC', 'TMS', 'PI', 'QI', 'SI']);
  });

  it('GST + is_manager → PROCESS_ORDER 전부', () => {
    expect(getCompanyScopedCategories(baseProduct, { company: 'GST', isAdmin: false, isManager: true }))
      .toEqual(['MECH', 'ELEC', 'TMS', 'PI', 'QI', 'SI']);
  });

  it('GST 작업자(role=PI) → [PI]', () => {
    expect(getCompanyScopedCategories(baseProduct, { company: 'GST', isAdmin: false, isManager: false, role: 'PI' })).toEqual(['PI']);
  });

  it('GST 작업자 role 미설정 → [] (전체 fallback 금지)', () => {
    expect(getCompanyScopedCategories(baseProduct, { company: 'GST', isAdmin: false, isManager: false })).toEqual([]);
  });

  it('GST 작업자 role=TM → [] (PROCESS_ORDER 키 TMS 와 불일치)', () => {
    expect(getCompanyScopedCategories(baseProduct, { company: 'GST', isAdmin: false, isManager: false, role: 'TM' })).toEqual([]);
  });

  it('FNI 매니저 → MECH 만', () => {
    expect(getCompanyScopedCategories(baseProduct, { company: 'FNI', isAdmin: false })).toEqual(['MECH']);
  });

  it('TMS(M) alias → MECH + TMS', () => {
    const result = getCompanyScopedCategories({ ...baseProduct, mech_partner: 'TMS' }, { company: 'TMS(M)', isAdmin: false });
    expect(result.sort()).toEqual(['MECH', 'TMS']);
  });

  it('user.company 없음 → []', () => {
    expect(getCompanyScopedCategories(baseProduct, { isAdmin: false })).toEqual([]);
  });
});

describe('userToScope', () => {
  it('User → UserScope 필드 매핑', () => {
    const user = {
      id: 1, name: '홍', email: 'a@b.c', role: 'PI', company: 'GST',
      is_admin: false, is_manager: true, approval_status: 'approved', email_verified: true,
    } as User;
    expect(userToScope(user)).toEqual({ company: 'GST', isAdmin: false, isManager: true, role: 'PI' });
  });

  it('null/undefined → 안전 기본값', () => {
    expect(userToScope(null)).toEqual({ company: undefined, isAdmin: false, isManager: false, role: undefined });
  });
});
