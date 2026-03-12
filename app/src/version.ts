// src/version.ts
// AXIS-VIEW 버전 관리 — Semantic Versioning (OPS 동일 기준)

export const APP_VERSION = 'v1.5.0';
export const BUILD_DATE = '2026-03-12';

// 버전 이력
// v1.0.0 | 2026-03-06 | Sprint 1~3     | 초기 릴리스 (로그인, 출퇴근 대시보드, 실 API 연동)
// v1.1.0 | 2026-03-08 | Phase 2        | QR 관리 페이지 (상태바, 날짜 필터, CSV 추출)
// v1.2.0 | 2026-03-11 | Phase 2-2~3    | 공지사항, ETL 변경이력, 컨셉 HTML 매칭 4개 페이지
// v1.3.0 | 2026-03-11 | Phase 3-A      | 알림 뱃지 (Header+Sidebar) + Admin prefix 로그인
// v1.4.0 | 2026-03-11 | Phase 4        | Role 기반 접근 제어 + 권한 관리 페이지
// v1.4.1 | 2026-03-11 | Phase 4-fix    | Toggle API endpoint 수정 + Manager 자사 필터
// v1.4.2 | 2026-03-12 | BUG-1 fix      | Logout Storm 수정 (401 무한 루프 방지)
// v1.5.0 | 2026-03-12 | Phase 5-A      | 협력사 관리 메뉴 개편 + 대시보드/평가지수/물량할당 페이지 + 근태 자사 필터
