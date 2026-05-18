// src/pages/production/SNStatusPage.test.ts
// Sprint 45 — matchesTestFilter: 테스트 S/N 토글 (옵션 B — ON=테스트 전용 / OFF=운영 전용)

import { describe, it, expect } from 'vitest';
import { matchesTestFilter } from './SNStatusPage';

describe('matchesTestFilter', () => {
  it('OFF (운영 전용) — 운영 S/N 통과, 테스트 S/N 제외', () => {
    expect(matchesTestFilter('GAIA-2024-001', false)).toBe(true);
    expect(matchesTestFilter('TEST-1111', false)).toBe(false);
    expect(matchesTestFilter('DOC_TEST-9', false)).toBe(false);
  });

  it('ON (테스트 전용) — 테스트 S/N 통과, 운영 S/N 제외', () => {
    expect(matchesTestFilter('TEST-1111', true)).toBe(true);
    expect(matchesTestFilter('DOC_TEST-9', true)).toBe(true);
    expect(matchesTestFilter('GAIA-2024-001', true)).toBe(false);
  });

  it('두 모드는 상호배타 — 같은 S/N 이 양쪽 다 통과하지 않음', () => {
    for (const sn of ['GAIA-1', 'TEST-1', 'DOC_TEST-1', 'SWS-99']) {
      expect(matchesTestFilter(sn, true)).not.toBe(matchesTestFilter(sn, false));
    }
  });
});
