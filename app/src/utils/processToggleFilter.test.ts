// src/utils/processToggleFilter.test.ts
// Sprint 46 — isVisibleForProcessToggle: PI/QI/SI 공정 토글 표시 조건

import { describe, it, expect } from 'vitest';
import { isVisibleForProcessToggle, NO_PROCESS_TOGGLE } from './processToggleFilter';
import type { SNProduct, CategoryProgress } from '@/types/snStatus';

function mockProduct(categories: Record<string, CategoryProgress>): SNProduct {
  return {
    serial_number: 'SN1', model: 'M', customer: 'C', ship_plan_date: null, sales_order: 'O1',
    all_completed: false, all_completed_at: null, overall_percent: 0, categories,
    my_category: null, last_worker: null, last_activity_at: null,
    last_task_name: null, last_task_category: null,
    mech_partner: null, elec_partner: null, module_outsourcing: null, line: null,
  };
}

describe('isVisibleForProcessToggle — 전체보기', () => {
  it('토글 전부 OFF → 항상 true (전체보기)', () => {
    const p = mockProduct({});
    expect(isVisibleForProcessToggle(p, NO_PROCESS_TOGGLE)).toBe(true);
  });
});

describe('isVisibleForProcessToggle — PI/QI 토글', () => {
  it('PI ON — 태깅됨 + 미완료 → true', () => {
    const p = mockProduct({ PI: { total: 5, done: 2, percent: 40, started: true } });
    expect(isVisibleForProcessToggle(p, { PI: true, QI: false, SI: false })).toBe(true);
  });

  it('PI ON — 태깅됨 + 완료 + 오늘 아님 → false (익일 제거)', () => {
    const p = mockProduct({ PI: { total: 5, done: 5, percent: 100, started: true, completed_today: false } });
    expect(isVisibleForProcessToggle(p, { PI: true, QI: false, SI: false })).toBe(false);
  });

  it('PI ON — 태깅됨 + 완료 + 오늘 완료 → true (완료 당일 노출)', () => {
    const p = mockProduct({ PI: { total: 5, done: 5, percent: 100, started: true, completed_today: true } });
    expect(isVisibleForProcessToggle(p, { PI: true, QI: false, SI: false })).toBe(true);
  });

  it('PI ON — 미태깅(started=false) → false', () => {
    const p = mockProduct({ PI: { total: 5, done: 0, percent: 0, started: false } });
    expect(isVisibleForProcessToggle(p, { PI: true, QI: false, SI: false })).toBe(false);
  });

  it('PI ON — PI 카테고리 없음 → false', () => {
    const p = mockProduct({ MECH: { total: 5, done: 5, percent: 100 } });
    expect(isVisibleForProcessToggle(p, { PI: true, QI: false, SI: false })).toBe(false);
  });

  it('QI ON — 태깅됨 + 미완료 → true (PI 와 동일 로직)', () => {
    const p = mockProduct({ QI: { total: 3, done: 1, percent: 33, started: true } });
    expect(isVisibleForProcessToggle(p, { PI: false, QI: true, SI: false })).toBe(true);
  });
});

describe('isVisibleForProcessToggle — SI 토글 (출하 대기)', () => {
  it('SI ON — 마무리공정 시작 + 미완료(done<total) → true', () => {
    const p = mockProduct({ SI: { total: 2, done: 1, percent: 50, started: true } });
    expect(isVisibleForProcessToggle(p, { PI: false, QI: false, SI: true })).toBe(true);
  });

  it('SI ON — 미태깅(started=false) → false (v1.46.1 hotfix — 시작 안 한 제품 제외)', () => {
    const p = mockProduct({ SI: { total: 2, done: 0, percent: 0, started: false } });
    expect(isVisibleForProcessToggle(p, { PI: false, QI: false, SI: true })).toBe(false);
  });

  it('SI ON — 시작 + 전부 완료(done==total) → false (출하 완료 제거)', () => {
    const p = mockProduct({ SI: { total: 2, done: 2, percent: 100, started: true } });
    expect(isVisibleForProcessToggle(p, { PI: false, QI: false, SI: true })).toBe(false);
  });

  it('SI ON — SI task 1개 모델도 시작 + done<total → true', () => {
    const p = mockProduct({ SI: { total: 1, done: 0, percent: 0, started: true } });
    expect(isVisibleForProcessToggle(p, { PI: false, QI: false, SI: true })).toBe(true);
  });

  it('SI ON — SI 카테고리 없음/total 0 → false', () => {
    expect(isVisibleForProcessToggle(mockProduct({}), { PI: false, QI: false, SI: true })).toBe(false);
    expect(isVisibleForProcessToggle(mockProduct({ SI: { total: 0, done: 0, percent: 0, started: true } }), { PI: false, QI: false, SI: true })).toBe(false);
  });
});

describe('isVisibleForProcessToggle — 다중 선택 (OR 합집합)', () => {
  it('PI+SI ON — PI 만 만족 → true', () => {
    const p = mockProduct({
      PI: { total: 5, done: 2, percent: 40, started: true },
      SI: { total: 2, done: 2, percent: 100 },
    });
    expect(isVisibleForProcessToggle(p, { PI: true, QI: false, SI: true })).toBe(true);
  });

  it('PI+SI ON — 둘 다 미만족 → false', () => {
    const p = mockProduct({
      PI: { total: 5, done: 5, percent: 100, started: true, completed_today: false },
      SI: { total: 2, done: 2, percent: 100 },
    });
    expect(isVisibleForProcessToggle(p, { PI: true, QI: false, SI: true })).toBe(false);
  });
});

describe('isVisibleForProcessToggle — 재활성화 자동 재등장', () => {
  it('완료→재활성화: started 유지(work_start_log) + done<total → 토글 목록 재등장', () => {
    // reactivate_task 후: completed_at NULL → done 감소, started(work_start_log) 보존
    const reactivated = mockProduct({ PI: { total: 5, done: 4, percent: 80, started: true, completed_today: false } });
    expect(isVisibleForProcessToggle(reactivated, { PI: true, QI: false, SI: false })).toBe(true);
  });
});
