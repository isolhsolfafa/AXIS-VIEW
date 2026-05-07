// src/utils/companyScopedProgress.test.ts
// Sprint 41 — 6 케이스: admin / GST / FNI 매칭 / TMS(M) alias / TMS(E) alias / null·빈문자

import { describe, it, expect } from 'vitest';
import { getCompanyScopedPercent, getCompanyScopedCategories } from './companyScopedProgress';
import type { SNProduct } from '@/types/snStatus';

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
    PI: { total: 5, done: 0, percent: 0 },
    QI: { total: 5, done: 0, percent: 0 },
    SI: { total: 5, done: 0, percent: 0 },
  },
  my_category: null,
  last_worker: null,
  last_activity_at: null,
  last_task_name: null,
  last_task_category: null,
  mech_partner: 'FNI',
  elec_partner: 'TMS',     // DB 단축 표기
  module_outsourcing: 'TMS', // DB 단축 표기
  line: null,
};

describe('getCompanyScopedPercent', () => {
  it('admin → overall_percent 그대로', () => {
    const result = getCompanyScopedPercent(baseProduct, { isAdmin: true });
    expect(result).toBe(38);
  });

  it('GST → overall_percent 그대로', () => {
    const result = getCompanyScopedPercent(baseProduct, { company: 'GST', isAdmin: false });
    expect(result).toBe(38);
  });

  it('FNI 매니저 (MECH 직접 매칭) → 100%', () => {
    const result = getCompanyScopedPercent(baseProduct, { company: 'FNI', isAdmin: false });
    expect(result).toBe(100);
  });

  it('TMS(M) alias → MECH(100) + TMS(80) 평균 = 90', () => {
    // mech_partner='TMS' (DB) + module_outsourcing='TMS' (DB) → alias 적용 둘 다 매칭
    const result = getCompanyScopedPercent(
      { ...baseProduct, mech_partner: 'TMS' },
      { company: 'TMS(M)', isAdmin: false },
    );
    expect(result).toBe(90);
  });

  it('TMS(E) alias → ELEC 단일 = 50%', () => {
    const result = getCompanyScopedPercent(baseProduct, { company: 'TMS(E)', isAdmin: false });
    expect(result).toBe(50);
  });

  it('partner=NULL/빈 문자열 → null (UI "—")', () => {
    const product = {
      ...baseProduct,
      mech_partner: null,
      elec_partner: '',
      module_outsourcing: '',
    };
    const result = getCompanyScopedPercent(product, { company: 'FNI', isAdmin: false });
    expect(result).toBeNull();
  });
});

describe('getCompanyScopedCategories', () => {
  it('admin → PROCESS_ORDER 전부', () => {
    const result = getCompanyScopedCategories(baseProduct, { isAdmin: true });
    expect(result).toEqual(['MECH', 'ELEC', 'TMS', 'PI', 'QI', 'SI']);
  });

  it('GST → PROCESS_ORDER 전부', () => {
    const result = getCompanyScopedCategories(baseProduct, { company: 'GST', isAdmin: false });
    expect(result).toEqual(['MECH', 'ELEC', 'TMS', 'PI', 'QI', 'SI']);
  });

  it('FNI 매니저 → MECH 만', () => {
    const result = getCompanyScopedCategories(baseProduct, { company: 'FNI', isAdmin: false });
    expect(result).toEqual(['MECH']);
  });

  it('TMS(M) alias → MECH + TMS', () => {
    const result = getCompanyScopedCategories(
      { ...baseProduct, mech_partner: 'TMS' },
      { company: 'TMS(M)', isAdmin: false },
    );
    expect(result.sort()).toEqual(['MECH', 'TMS']);
  });

  it('TMS(E) alias → ELEC 만', () => {
    const result = getCompanyScopedCategories(baseProduct, { company: 'TMS(E)', isAdmin: false });
    expect(result).toEqual(['ELEC']);
  });

  it('user.company 없음 → []', () => {
    const result = getCompanyScopedCategories(baseProduct, { isAdmin: false });
    expect(result).toEqual([]);
  });
});
