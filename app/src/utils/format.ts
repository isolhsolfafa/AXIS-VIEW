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

/**
 * ISO 8601 → `YYYY-MM-DD HH:mm` (로컬 타임존, 초 생략)
 * null/undefined 입력 시 '—' 반환.
 *
 * 2026-04-17: FE-19(HOTFIX-04 연계) 착수 전제로 `ChecklistReportView.tsx` L25 로컬 함수에서 승격 (Codex 지적 #1 옵션 A 채택).
 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${dd} ${hh}:${mi}`;
}

/**
 * ISO 8601 → `YYYY-MM-DD` (로컬 타임존, 시간 생략)
 *
 * 2026-04-27: REF-V-00-UTIL — QrManagementPage / InactiveWorkersPage 의 로컬 formatDate 2건 승격.
 * fallback 인자로 페이지별 표시값('—' / '없음') 차이 흡수. invalid Date 가드 통일.
 */
export function formatDate(
  iso: string | null | undefined,
  options: { fallback?: string } = {},
): string {
  const fallback = options.fallback ?? '—';
  if (!iso) return fallback;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return fallback;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
