// src/version.ts
// AXIS-VIEW 버전 관리 — Semantic Versioning (OPS 동일 기준)

export const APP_VERSION = 'v1.13.0';
export const BUILD_DATE = '2026-03-23';

// 버전 이력
// v1.0.0 | 2026-03-06 | Sprint 1~3     | 초기 릴리스 (로그인, 출퇴근 대시보드, 실 API 연동)
// v1.1.0 | 2026-03-08 | Phase 2        | QR 관리 페이지 (상태바, 날짜 필터, CSV 추출)
// v1.2.0 | 2026-03-11 | Phase 2-2~3    | 공지사항, ETL 변경이력, 컨셉 HTML 매칭 4개 페이지
// v1.3.0 | 2026-03-11 | Phase 3-A      | 알림 뱃지 (Header+Sidebar) + Admin prefix 로그인
// v1.4.0 | 2026-03-11 | Phase 4        | Role 기반 접근 제어 + 권한 관리 페이지
// v1.4.1 | 2026-03-11 | Phase 4-fix    | Toggle API endpoint 수정 + Manager 자사 필터
// v1.4.2 | 2026-03-12 | BUG-1 fix      | Logout Storm 수정 (401 무한 루프 방지)
// v1.5.0 | 2026-03-12 | Phase 5-A      | 협력사 관리 메뉴 개편 + 대시보드/평가지수/물량할당 페이지 + 근태 자사 필터
// v1.5.1 | 2026-03-12 | Phase 5-A+     | 생산관리 메뉴 개편 (생산일정/생산실적/출하이력)
// v1.6.0 | 2026-03-13 | Sprint 27 연동 | 권한 매트릭스 세분화 (GST 일반/협력사 manager 분리)
// v1.6.1 | 2026-03-15 | ETL 개선       | O/N 컬럼 추가 + pi_start 변경 추적 + summary limit 수정
// v1.7.0 | 2026-03-16 | Sprint 29 연동 | 공장 API 실데이터 연동 + 대시보드/생산일정 리팩토링
// v1.7.1 | 2026-03-16 | UX 개선        | 공장 대시보드 자동 새로고침 + 근태 근무지 컬럼
// v1.8.0 | 2026-03-18 | Sprint 5       | QR DUAL Tank 뱃지 + 기구/모듈 필터 분리 + ETL 오늘 필터 + Order No 검색 + 슬라이드 정지/재생
// v1.9.0 | 2026-03-20 | Sprint 6~8     | 태스크 진행률 + 카테고리 필터 + 사용자 분석 대시보드 + 생산실적 API 연동
// v1.10.0| 2026-03-23 | Sprint 13      | 생산실적 공정 그룹 탭 분리 (기구·전장 / TM) + vitest 테스트 환경 구축
// v1.11.0| 2026-03-23 | Sprint 14      | 혼재 O/N partner별 실적확인 UI + 일괄확인 혼재 제외
// v1.12.0| 2026-03-23 | Sprint 15      | #36-C TM 가압검사 옵션 UI (ConfirmSettingsPanel TM 그룹 박스)
// v1.13.0| 2026-03-24 | Sprint 16      | S/N별 실적확인 UI + TM 혼재 제거 + 탭별 End 필터 + SNConfirmButton
