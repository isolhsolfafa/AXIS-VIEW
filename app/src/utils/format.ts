// src/utils/format.ts
// 공통 포맷 유틸리티

/**
 * 이름 마스킹 — 개인정보 보호
 * 3글자: 임지후 → 임*후 | 2글자: 김솔 → 김* | 4글자+: 남궁지후 → 남궁*후
 * 영문/특수문자 포함 이름: 마스킹 안함
 */
export function maskName(name: string): string {
  if (!name) return '';
  // 한글로만 구성된 이름만 마스킹
  if (!/^[가-힣]+$/.test(name)) return name;
  const len = name.length;
  if (len <= 1) return name;
  if (len === 2) return name[0] + '*';
  // 3글자 이상: 첫 글자 + * + 마지막 글자
  return name[0] + '*'.repeat(len - 2) + name[len - 1];
}
