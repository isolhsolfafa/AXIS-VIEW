// src/components/sn-status/constants.ts
// 공정 순서·라벨 상수 — Sprint 18

export const PROCESS_ORDER = ['MECH', 'ELEC', 'TMS', 'PI', 'QI', 'SI'] as const;

export const PROCESS_LABEL: Record<string, string> = {
  MECH: 'MECH 기구',
  ELEC: 'ELEC 전장',
  TMS: 'TM 모듈',
  PI: 'PI 가압',
  QI: 'QI 공정검사',
  SI: 'SI 마무리',
};

export const TAB_LABEL: Record<string, string> = {
  MECH: 'MECH',
  ELEC: 'ELEC',
  TMS: 'TM',
  PI: 'PI',
  QI: 'QI',
  SI: 'SI',
};
