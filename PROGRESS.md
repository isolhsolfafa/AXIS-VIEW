# AXIS-VIEW 진행 이력

> 마지막 업데이트: 2026-04-14 (v1.27.0 — Sprint 31 ELEC 체크리스트 VIEW 연동)
> 완료된 Sprint와 주요 변경사항을 기록합니다.
> 미해결/보류/계획 항목은 BACKLOG.md에서 관리합니다.

---

## v1.27.0: Sprint 31 — ELEC 체크리스트 VIEW 연동 — ✅ 완료 (2026-04-14)

### 생산현황 ELEC 진행률
- `getChecklistStatus()` CAT_MAP 패턴: `ELEC → 'elec'` 매핑 추가
- S/N 상세뷰 ELEC ProcessStepCard에 체크리스트 프로그레스바 자동 표시
- Phase 1+2 합산 진행률 (Sprint 58-BE 활용)

### 체크리스트 관리 ELEC 블러 해제
- `BLUR_CATEGORIES`에서 `'ELEC'` 제거 → 31항목 관리 가능
- MECH 블러 유지

### 기타
- 로그인 후 첫화면: 모든 역할 → /factory

---

## v1.26.0: Sprint 30+ — 성적서 ELEC Phase/TM DUAL/SELECT/QI — ✅ 완료 (2026-04-10)

### 체크리스트 성적서 확장
- ELEC 1차 배선 / 2차 배선 별도 테이블 (`phase_label` 기반)
- TM DUAL L/R 탱크별 분리 (`qr_doc_id` 기반)
- SELECT 타입 판정 (TUBE 색상 등 선택값 표시)
- QI 항목 보라색 배지 구분
- `summary.checked → completed` 매핑 보정

### 기타
- 체크리스트 관리: 그룹명 기준 정렬 (item_group 1차 + item_order 2차)
- QR 관리: elec_start tbody 셀 누락 수정

---

## v1.25.0: Sprint 29~30 — QR 전장시작 + 비활성화 권한 분기 — ✅ 완료 (2026-04-09)

### QR 관리 (Sprint 29)
- 날짜 드롭다운: 기구시작 / 전장시작 / 모듈시작 (3옵션)
- 테이블 전장시작 컬럼 + 정렬 + 필터

### 권한 관리 (Sprint 30)
- Admin: 전체 사용자 대상 "비활성화" → confirm → 즉시 처리
- Manager: 같은 회사만 "비활성화 요청" → prompt 사유 → admin 승인 대기
- 422 NO_CHANGE: "이미 비활성화된/요청된 사용자" 분기 toast
- `isAdmin` 버그 수정 (행 대상 → 로그인 사용자)

---

## v1.24.0: QR 이미지 모달 + Digital Twin 목업 — ✅ 완료 (2026-04-07)

### QR 관리
- Doc ID 클릭 → QR 코드 이미지 모달 (O/N + QR 200px + S/N)
- 인쇄 버튼 → 새 창 + 브라우저 인쇄

### Digital Twin 목업
- 공장 대시보드 > Digital Twin (preparing)
- 1/2공장 2D 평면도, 공정별 레인, S/N 셀 배치
- 장비 클릭 → 줌인 + 미니맵 + 상세 패널 + 6초 자동 줌아웃

### UI 개선
- CT 분석: 그라데이션 카드 → G-AXIS 스타일 통일
- 사이드바: AXIS-VIEW → VIEW (로고 중복 제거)

---

## v1.23.0: Sprint 28 — 체크리스트 성적서 + 생산실적 개선 — ✅ 완료 (2026-04-03)

### 체크리스트 성적서 (신규 페이지)
- 협력사 관리 > 체크리스트: O/N·S/N 검색 → 카테고리별 테이블 (검사항목, SPEC, 검사방법, 판정)
- PDF 다운로드 (html2canvas + jsPDF, oklch 우회)
- GST 로고, 마스킹 해제 출력
- BE→FE 필드 매핑 (check_result→result, checked_by_name→worker_name)

### 생산실적 개선
- 기본뷰: 주간 → 월마감 (캘린더 기본)
- 월마감 캘린더: 대기(주황)/확인(초록) 이중 카운트
- "기전" → "기구·전장" 명칭 통일, 전체 폰트 +2px
- ISO 주차 버그 수정 (yearStart Jan 4 → Jan 1)

---

## v1.22.0: Sprint 27 — 월마감 캘린더 뷰 — ✅ 완료 (2026-04-03)

### 생산실적
- 월마감 캘린더 UI (달력 + 주차별 실적 바 + 주차 클릭 → 주간 전환)
- 작업자 이름 마스킹 (`maskName()` 공통 유틸)

---

## v1.21.0: Sprint 26 — 체크리스트 관리 BE 연동 — ✅ 완료 (2026-04-02)

### 체크리스트 관리
- 목업 → BE 실데이터 연동 (OPS Sprint 52)
- TM 탭 활성화, MECH/ELEC 블러
- 활성 토글 확인 다이얼로그 + sonner 토스트

---

## v1.20.0: Sprint 25 — 페이지별 설정 패널 — ✅ 완료 (2026-04-01)

- 테스트 S/N 토글 (DOC_TEST- prefix 숨김/표시)
- TM 체크리스트 옵션 (생산현황 설정)

---

## v1.19.0: Sprint 24 — 생산현황 O/N 섹션 헤더 + 검색 — ✅ 완료 (2026-03-31)

- S/N 카드뷰에 O/N 단위 섹션 헤더 추가
- O/N 번호 검색 지원

---

## v1.18.0: Sprint 23 — Task 재활성화 UI — ✅ 완료 (2026-03-30)

- 생산현황 S/N 디테일에서 완료된 Task 재활성화 버튼

---

## v1.17.1: Sprint 22 — 공정 완료 판정 버그 수정 — ✅ 완료 (2026-03-30)

- ProcessStepCard: `workers.some()` → `categories.percent` 기준 통일

---

## v1.17.0: Sprint 21 — 반응형 레이아웃 (태블릿 우선) — ✅ 완료 (2026-03-29)

Sprint 21. 사이드바 접기 + KPI/차트 반응형 + 모바일 오버레이.

### Phase B — 사이드바 접기

| 항목 | 파일 | 변경 |
|------|------|------|
| CSS 변수 | `index.css` | `--sidebar-collapsed-width: 64px` 추가 |
| 상태 관리 | `Layout.tsx` | `collapsed/isMobile/mobileOpen` state + matchMedia 리스너 + localStorage 동기화 |
| 접기 모드 | `Sidebar.tsx` | 64px 아이콘 모드 + 토글 버튼(ChevronLeft/Right) + children 클릭시 펼침 전환 |
| 모바일 | `Sidebar.tsx` | 768px 이하 숨김 + 오버레이(딤 배경 + 슬라이드 인) |
| 햄버거 | `Header.tsx` | 모바일 햄버거 버튼 (768px 이하) |

### Phase C — KPI/차트 반응형

| 항목 | 파일 수 | 변경 |
|------|---------|------|
| media query | `index.css` | 1200px→1024px→768px 순서 + `kpi-grid-7`, `stage-grid` 신규 |
| kpi-grid | 11개소 | 데스크톱 원본 유지 + 태블릿 2열 + 모바일 1열 |
| chart-grid | 7개소 | 1200px 이하 1열 스택 |
| bottom-grid | 2개소 | 1200px 이하 1열 스택 |
| stage-grid | 1개소 | ProductionPlanPage 동적 그리드 |
| kpi-grid-7 | 1개소 | EtlChangeLogPage 7열→3열→2열 |
| SNDetailPanel | 1개소 | `maxWidth: '100vw'` 태블릿 넘침 방지 |

### 브레이크포인트 동작

| 너비 | 사이드바 | KPI 그리드 | 차트 그리드 |
|------|---------|-----------|-----------|
| >1024px | 펼침 260px (토글 가능) | 원본 열 수 | 원본 비율 |
| 768~1024px | 접힘 64px (아이콘) | 2열 | 1열 스택 |
| <768px | 숨김 + 오버레이 | 1열 | 1열 스택 |

### 빌드/테스트 결과

- `tsc --noEmit` 통과
- `npm run build` 통과
- 19개 파일 수정 (코어 5 + 페이지 14)

---

## v1.16.1: Manager 비활성화 요청 기능 — ✅ 완료 (2026-03-28)

Sprint 40-C+. 협력사 is_manager가 자사 소속 사용자 비활성화 요청 → admin 앱 알림 + 이메일 발송.

### 변경 내용

| 항목 | 파일 | 변경 |
|------|------|------|
| API | `api/workers.ts` | `requestDeactivation()` — `POST /work/request-deactivation` |
| Hook | `hooks/useWorkers.ts` | `useRequestDeactivation` mutation |
| 페이지 | `PermissionsPage.tsx` | manager에게 자사 소속 사용자 "비활성화 요청" 버튼 표시 + 사유 입력 |

### 빌드 결과

- `tsc --noEmit` 통과
- `npm run build` 통과

---

## v1.16.0: 비활성 사용자 관리 페이지 — ✅ 완료 (2026-03-28)

Sprint 40-C VIEW 연동. 30일 미로그인 사용자 조회 + 비활성화/재활성화.

### 변경 내용

| 항목 | 파일 | 변경 |
|------|------|------|
| API 연동 | `api/workers.ts` | inactive-workers, deactivated-workers, worker-status 3개 API |
| Hooks | `hooks/useWorkers.ts` | `useInactiveWorkers`, `useDeactivatedWorkers`, `useWorkerStatus` |
| 페이지 | `pages/admin/InactiveWorkersPage.tsx` | 신규 — 2탭(미로그인/비활성화) + KPI + 검색 + 테이블 |
| 라우트 | `App.tsx` | `/admin/inactive` (admin only) |
| 사이드바 | `Sidebar.tsx` | Management 그룹에 "비활성 사용자" 메뉴 추가 |

### 빌드 결과

- `tsc --noEmit` 통과
- `npm run build` 통과

---

## v1.15.3: Sprint 18-C — 상세뷰 다중 task 병합 + task_name 표시 — ✅ 완료 (2026-03-27)

Sprint 18-C. 같은 카테고리 다중 task를 1개 카드로 병합 렌더링 + 작업자별 task_name 표시.

### 변경 내용

| 항목 | 파일 | 변경 |
|------|------|------|
| 타입 확장 | `types/snStatus.ts` | `SNTaskDetail`에 id, task_name 추가 + `TaskWorker`에 task_name 옵션 |
| 병합 렌더링 | `SNDetailPanel.tsx` | `find()` → `filter()` + `flatMap(workers)` — 카테고리당 1개 카드 |
| task_name 표시 | `ProcessStepCard.tsx` | 작업자명 옆에 task_name 연한색 표시 |

### 빌드 결과

- `tsc --noEmit` 통과
- `npm run build` 통과

---

## v1.15.2: 생산현황 공정 탭 제거 + 협력사 권한 필터 — ✅ 완료 (2026-03-27)

Sprint 18-B+. 불필요한 공정별 분류 탭 제거, 협력사 manager 권한 분리, 준비중 태그 정리.

### 변경 내용

| 항목 | 파일 | 변경 |
|------|------|------|
| 공정 탭 제거 | `SNStatusPage.tsx` | 전체/MECH/ELEC/TM/PI/QI/SI 7개 탭 삭제, constants import 제거 |
| 레이아웃 정리 | `SNStatusPage.tsx` | 검색바 + 동기화 시간 + 새로고침 버튼 한 줄 배치 |
| 협력사 권한 필터 | `SNStatusPage.tsx` | `COMPANY_CATEGORIES` 매핑 — 협력사 is_manager는 자사 공정 S/N만 표시 |
| 준비중 태그 제거 | `Sidebar.tsx` | 생산현황 메뉴 `preparing: true` 제거 |

### 권한 로직

| 사용자 | 표시 범위 |
|--------|----------|
| admin / GST | 전체 S/N |
| FNI, BAT | MECH 공정 S/N |
| TMS(M) | MECH + TMS 공정 S/N |
| TMS(E), P&S, C&A | ELEC 공정 S/N |

### 빌드 결과

- `tsc --noEmit` 통과
- `npm run build` 통과

---

## v1.15.1: Sprint 18-B — S/N 상세뷰 UX 개선 + API 경로 수정 — ✅ 완료 (2026-03-27)

Sprint 18-B. 상세뷰 작업자 정렬 + 체크리스트 토글 + 카드뷰 task 이름 표시 + getSNTasks API 경로 수정.

### 변경 내용

| 항목 | 파일 | 변경 |
|------|------|------|
| #44 API 경로 수정 | `api/snStatus.ts` | `/tasks/{sn}` → `/api/app/tasks/{sn}` prefix 누락 수정 + 목업 fallback 제거 (60줄→4줄) |
| #1 작업자 정렬 반전 | `ProcessStepCard.tsx` | `[...workers].reverse()` — 최근 작업자 맨 위 + 동시작업 배지 위치 수정 |
| #2 체크리스트 토글 | `ProcessStepCard.tsx` | `checklistOpen` state + 기본 접힘 + 미니 프로그레스바 + 클릭 펼침 |
| #3 task 이름 표시 | `snStatus.ts` + `SNCard.tsx` | `last_task_name`/`last_task_category` 타입 추가 + 카드에 "작업자 · task명" 표시 (Sprint 38-B BE 연동) |

### 빌드 결과

- `tsc --noEmit` 통과
- `npm run build` 통과

---

## v1.13.1: HOTFIX — End 필터 버그 + 중복 정리 + 쿼리 안정화 — ✅ 완료 (2026-03-24)

Sprint 17. 새로고침 시 카운트 깜빡임 + end 필터 참조 오류 수정.

### 변경 내용

| 항목 | 파일 | 변경 |
|------|------|------|
| End 필터 수정 | `productionFilters.ts` | `o.mech_end` (O/N 레벨) → `o.sns.some(sn => sn.mech_end)` (SN 순회) |
| inline 중복 제거 | `ProductionPerformancePage.tsx` | getISOWeekRange, tabOrders, KPI, isDone → utils import (~75줄 → 4줄) |
| O/N end 집계 | `api/production.ts` | BE→FE 변환에서 sns end max 집계 (표시/정렬용) |
| 쿼리 안정화 | `useProduction.ts` | `placeholderData: keepPreviousData` — queryKey 전환 깜빡임 방지 |
| isOrderDone export | `productionFilters.ts` | 테이블 행 배경색 판정용 공개 함수 |
| 테스트 | `productionFilters.test.ts` | sns 기반 end 필터 4건 추가 (총 30 tests) |

### 빌드/테스트 결과

- `npm run build` 통과
- `npm run test` 30/30 전체 통과

---

## v1.13.0: S/N별 실적확인 UI + TM 혼재 제거 + 탭별 End 필터 — ✅ 완료 (2026-03-24)

Sprint 16. S/N 단위 실적확인 전환 + End 날짜 기반 주차 필터링.

### 변경 내용

| 항목 | 파일 | 변경 |
|------|------|------|
| 타입 전면 변경 | `types/production.ts` | `SNConfirm` 추가, `PartnerConfirm` breaking (sn_confirms/all_confirmed), `ProcessStatus` 확장, `ConfirmRequest.serial_numbers`, `ConfirmResponse` 교체 |
| SNConfirmButton | `ProductionPerformancePage.tsx` | S/N 1개 확인 버튼 공통 컴포넌트 |
| ProcessCell 재작성 | `ProductionPerformancePage.tsx` | 5단 분기: N/A, disabled, 혼재(partner>SN별), sn_confirms(SN별), fallback(PI/QI/SI) |
| handleConfirm | `ProductionPerformancePage.tsx` | `serialNumbers: string[]` 파라미터 추가 |
| handleBatchConfirm | `ProductionPerformancePage.tsx` | sn_confirms 기반 serial_numbers 전달, 혼재 제외 유지 |
| End 필터 | `productionFilters.ts` | `getISOWeekRange` + `filterByProcessTab` weekStart/weekEnd 파라미터 |
| KPI/상태필터 | `productionFilters.ts` | all_confirmed/sn_confirms 기반 전환 |
| S/N end 날짜 | `ProductionPerformancePage.tsx` | expand 영역에 mech_end/elec_end/module_end 표시 |
| 테스트 | `productionFilters.test.ts` | 전면 재작성 — end 필터, sn_confirms, all_confirmed, getISOWeekRange (28 tests) |

### 빌드/테스트 결과

- `npm run build` 통과
- `npm run test` 28/28 전체 통과

---

## v1.12.0: #36-C TM 가압검사 옵션 UI — ✅ FE 완료 (2026-03-23)

Sprint 15. ConfirmSettingsPanel에 TM 그룹 박스 구조 추가. `tm_pressure_test_required` 토글로 가압검사 포함 여부 제어.

### 변경 내용

| 항목 | 파일 | 변경 |
|------|------|------|
| 타입 추가 | `api/adminSettings.ts` | `AdminSettingsResponse`에 `tm_pressure_test_required: boolean` 추가 |
| 설정 패널 개편 | `ProductionPerformancePage.tsx` | TOGGLES → PROCESS_TOGGLES / TM_GROUP / REMAINING_TOGGLES 3분리 |
| TM 그룹 박스 | `ProductionPerformancePage.tsx` | Tank Module 그룹 박스: 실적처리(TM 실적확인) + Progress/알람(가압검사 포함) |
| parent 의존성 | `ProductionPerformancePage.tsx` | `confirm_tm_enabled=false` 시 가압검사 토글 disabled + opacity 0.4 |
| 테스트 추가 | `productionFilters.test.ts` | `tm_pressure_test_required` 관련 2 tests 추가 (총 22 tests) |

### 빌드/테스트 결과

- `npm run build` 통과
- `npm run test` 22/22 전체 통과

### OPS BE 미완료 (선행 조건)

- `admin_settings` migration 미완료
- `production.py` progress 분기 미완료
- 알람 핸들러 분기 미완료

---

## v1.11.0: 혼재 O/N partner별 실적확인 UI — ✅ 완료 (2026-03-23)

Sprint 14. 혼재 O/N(같은 주문에 협력사가 2개 이상)에서 partner별 개별 실적확인 버튼 분리.

### 변경 내용

| 항목 | 파일 | 변경 |
|------|------|------|
| 타입 추가 | `types/production.ts` | `PartnerConfirm` 인터페이스, `ProcessStatus`에 `mixed`/`partner_confirms` 추가 |
| ConfirmRequest 확장 | `types/production.ts` | `partner?: string \| null` 필드 추가 |
| ProcessCell 혼재 분기 | `ProductionPerformancePage.tsx` | 혼재 시 partner별 확인 버튼 박스 렌더링, 비혼재는 기존 유지 |
| handleConfirm | `ProductionPerformancePage.tsx` | `partner` 파라미터 추가, confirm API에 전달 |
| handleBatchConfirm | `ProductionPerformancePage.tsx` | 혼재 O/N 일괄 확인 대상에서 제외 |
| ProcessCell 호출부 | `ProductionPerformancePage.tsx` | `mixed`를 `processes.{proc}.mixed`에서 참조 |
| KPI 카운트 | `ProductionPerformancePage.tsx`, `productionFilters.ts` | 혼재 partner_confirms 기반 confirmable 카운트 |
| 테스트 추가 | `productionFilters.test.ts` | 혼재 partner_confirms KPI 카운트 3 tests 추가 (총 20 tests) |

### 빌드/테스트 결과

- `npm run build` 통과
- `npm run test` 20/20 전체 통과

---

## v1.10.0: 생산실적 공정 그룹 탭 분리 — 기구·전장 / TM — ✅ 완료 (2026-03-23)

Sprint 13. end 기준 전환 시 O/N 증가에 대비해 공정 그룹별 탭 분리(기구·전장 / TM).

### 변경 내용

| 항목 | 파일 | 변경 |
|------|------|------|
| 타입 확장 | `types/production.ts` | `OrderGroup`에 `mech_end`, `elec_end`, `module_end` 필드 추가 |
| 공정 탭 UI | `ProductionPerformancePage.tsx` | `activeProcessTab` state + 기구·전장 / TM(모듈) 탭 버튼 |
| 탭별 필터 | `ProductionPerformancePage.tsx` | `tabOrders` — MECH/ELEC 또는 TM 기준 O/N 분리 |
| KPI 분기 | `ProductionPerformancePage.tsx` | 기구·전장 탭: 4열(O/N, 기구, 전장, 월간), TM 탭: 3열(O/N, TM, 월간) |
| 테이블 칼럼 | `ProductionPerformancePage.tsx` | 헤더/ProcessCell/SN상세 탭별 조건부 렌더링 |
| 일괄확인 | `ProductionPerformancePage.tsx` | 탭별 일괄확인 버튼 + TM 일괄확인 신규 지원 |
| 순수 로직 추출 | `utils/productionFilters.ts` | `filterByProcessTab`, `filterByStatus`, `calcTabKpi`, `isProcessEnabled` |
| 테스트 환경 | `vite.config.ts`, `test/setup.ts` | vitest + jsdom + @testing-library 구성 |
| 단위 테스트 | `utils/productionFilters.test.ts` | 탭 필터, 상태 필터, KPI 산출, 권한 분기 (13 tests) |
| API 변환 테스트 | `api/production.test.ts` | partner_info, mixed 판정, confirms 변환 (4 tests) |

### 빌드/테스트 결과

- `npm run build` 통과
- `npm run test` 17/17 전체 통과

---

## v1.7.4: 생산실적 BE-FE 키 매핑 수정 — ✅ 완료 (2026-03-22)

생산실적 페이지 O/N·S/N 진행률 N/A 표시 버그 수정. BE 응답 키(`processes`)에 FE 참조 키(`process_status`) 통일.

### 배경

- O/N 1111 (TEST-1111, progress 100%) 테스트 중 발견
- OPS 공장 대시보드에서는 정상 표시, VIEW 생산실적 페이지에서만 전체 N/A
- 원인: BE가 `processes` 키로 반환하는데 FE가 `process_status`로 참조

### 변경 내용

| 항목 | 파일 | 변경 |
|------|------|------|
| 타입 정의 | `types/production.ts` | `OrderGroup.process_status` → `OrderGroup.processes` |
| 페이지 참조 | `ProductionPerformancePage.tsx` | 모든 `order.process_status` / `o.process_status` → `order.processes` / `o.processes` (8곳) |

### BE 연계 (OPS_API_REQUESTS #32)

- BE `production.py`에 TMS→TM 매핑 상수 추가 필요 (`_CATEGORY_TO_PROCESS = {'TMS': 'TM'}`)
- DB `task_category`는 'TMS'이나 시스템 표준은 'TM' (role_enum, confirm, admin_settings 모두 TM)
- BE 매핑 완료 후 S/N TM progress도 정상 표시 예정

### 영향 범위

- FE VIEW만 수정 — OPS Flutter 영향 없음
- TM 키 관련 코드 변경 없음 (BE 매핑으로 해결)
- confirm API `process_type: 'TM'` 그대로 유지

---

## v1.7.3: 근태 차트 주간/월간 추이 + 퇴근 미체크 필터 + TMS(E) 버그 수정 — ✅ 완료 (2026-03-21)

근태관리 페이지 차트/하단 그리드의 미구현 탭 로직 구현 및 데이터 불일치 버그 수정.

### 변경 내용

| 항목 | 파일 | 변경 |
|------|------|------|
| 차트 주간/월간 탭 | `ChartSection.tsx` | 전면 리라이트 — 일간: 기존 스택 바+도넛, 주간/월간: 라인 차트(전체/본사/현장 추이). BE API 미연동 시 placeholder 표시 |
| 차트 레이아웃 전환 | `ChartSection.tsx` | 일간: `2fr 1fr` (바+도넛), 주간/월간: `1fr` (라인만, 도넛 숨김) |
| `TrendDataPoint` type export | `ChartSection.tsx` | 추후 AttendancePage에서 trend API 연동 시 사용할 타입 |
| 퇴근 미체크 필터 | `BottomGrid.tsx` | `activeCheckoutTab` state 추가. 전체/본사/현장 탭 클릭 시 `work_site` 기반 필터링. 카운트도 연동 |
| TMS(E) fallback 버그 | `AttendancePage.tsx` | `site_count: breakdown?.site ?? (c.checked_in - ...)` → `breakdown?.site ?? 0`. Summary/레코드 불일치 해소 |

### 발견 및 조치

| 구분 | 내용 |
|------|------|
| ChartSection | 일간/주간/월간 탭 UI만 존재, state 변경 시 차트 데이터 불변 → 탭별 차트 전환 구현 |
| BottomGrid | 전체/본사/현장 탭 UI만 존재, state 자체 없음 → 필터 로직 구현 |
| TMS(E) 1명 표시 | Summary API `checked_in=1` vs FE `isActiveProductLine` 필터 제거 → fallback이 raw 값 사용 → 0 고정으로 수정 |

### BE 요청

| # | 엔드포인트 | 상태 |
|---|-----------|------|
| 29 | `GET /api/admin/hr/attendance/trend?date_from=&date_to=` | PENDING — OPS_API_REQUESTS.md 등록 완료 |

---

## v1.7.2: 근태 KPI 카드 정적 데이터 제거 + 어제 출근율 비교 — ✅ 완료 (2026-03-21)

근태관리 페이지 상단 KPI 카드의 하드코딩 값 제거 및 어제 대비 출근율 비교 로직 추가.

### 변경 내용

| 항목 | 파일 | 변경 |
|------|------|------|
| KPI fallback 제거 | `KpiCards.tsx` | fallback `7, 32, 66, 87.8` → 모두 `0`으로 변경 |
| 출입 협력사 라벨 변경 | `KpiCards.tsx` | "등록 협력사" → "오늘 출입 협력사" (출근자 1명 이상인 회사만 카운트) |
| 출입 협력사 sub 텍스트 | `KpiCards.tsx` | "활성 협력사 · 오늘 기준" → "등록 N개사 중" (전체 등록 수 표시) |
| 출근율 비교 하드코딩 제거 | `KpiCards.tsx` | `+2.1% vs 어제` 정적 → 어제 데이터 기반 동적 계산. 데이터 없으면 숨김 |
| 어제 데이터 조회 | `AttendancePage.tsx` | `useAttendanceToday(yesterday)` 추가 — 기존 `getAttendanceByDate` API 재활용 |
| companyCount 계산 변경 | `AttendancePage.tsx` | `companies.length` → `new Set(checkedInRecords.map(r => r.company)).size` |
| enhancedSummary 확장 | `AttendancePage.tsx` | `total_company_count`, `yesterday_attendance_rate` 필드 추가 |
| import 추가 | `AttendancePage.tsx` | `subDays` (date-fns) import |

### 발견 및 조치

| 구분 | 내용 |
|------|------|
| 문제 1 | 등록 협력사 카드가 전체 등록 수(7)를 표시 → 오늘 출근자가 있는 회사만 카운트하도록 변경 |
| 문제 2 | 평균 출근율 "+2.1% vs 어제" 완전 하드코딩 → 어제 날짜 API 추가 호출로 실 비교 구현 |
| 문제 3 | KPI fallback 값이 Mock 수치(7, 32, 66, 87.8)로 박혀 있어 실 API 시 오류 표시 가능 → 0으로 변경 |
| CompanySummaryCards | 하드코딩 없음 확인 — 모든 값이 props로 동적 전달 (양호) |

### BE 추가 작업

없음 — 어제 날짜 조회는 기존 `/api/admin/hr/attendance?date=` API로 처리.

---

## v1.7.0: 공장 API 연동 + 대시보드/생산일정 리팩토링 — ✅ 완료 (2026-03-16)

OPS Sprint 29 BE 완료 후 VIEW FE에서 샘플→실 API 전환 + UI 리팩토링.

### 변경 내용

| 항목 | 파일 | 변경 |
|------|------|------|
| API 모듈 생성 | `api/factory.ts` | 타입 정의 + `getMonthlyDetail`, `getWeeklyKpi` 함수 |
| Query 훅 생성 | `hooks/useFactory.ts` | `useMonthlyDetail`, `useWeeklyKpi` TanStack 훅 |
| 공장 대시보드 | `FactoryDashboardPage.tsx` | 전면 리라이트 — 실 API, 자동 슬라이드, 활동 피드 |
| 생산일정 | `ProductionPlanPage.tsx` | 전면 리라이트 — 통합 필터, sorting, 공정 중복 |
| 활동 피드 | `FactoryDashboardPage.tsx` | ETL + 생산완료 + 출하완료 이벤트 통합 (시간순) |
| KPI 카드 변경 | `FactoryDashboardPage.tsx` | PI 대기 → 불량 건수 (QMS 대기 placeholder) |
| 전장업체 컬럼 | `FactoryDashboardPage.tsx` | 테이블 7열 → 8열 |
| 사이드바 | `Sidebar.tsx` | 공장 대시보드 `preparing: true` 제거 |
| API 요청 | `OPS_API_REQUESTS.md` | #16 불량 API 요청 PENDING 등록 |

### OPS BE 연동

| 엔드포인트 | 용도 |
|----------|------|
| `GET /api/admin/factory/weekly-kpi` | 주간 KPI (by_model, by_stage, pipeline) |
| `GET /api/admin/factory/monthly-detail` | 월간 상세 (items, by_model, pagination) |

---

## v1.6.1: ETL 변경이력 개선 — ✅ 완료 (2026-03-15)

### 변경 내용

| 항목 | 파일 | 변경 |
|------|------|------|
| O/N 컬럼 추가 | `api/etl.ts` | `ChangeLogEntry`에 `sales_order` 필드 추가 |
| O/N 컬럼 추가 | `EtlChangeLogPage.tsx` | 테이블 6열→7열, O/N `<td>` 추가, colSpan 업데이트 |
| pi_start 추적 | `EtlChangeLogPage.tsx` | `FIELD_CONFIG` + `DATE_FIELDS`에 pi_start 추가 |
| pi_start 추적 | `EtlChangeLogPage.tsx` | KPI 그리드 5열→6열, kpiCards에 가압시작 추가 |
| pi_start 추적 | `EtlChangeLogPage.tsx` | 주간 차트에 가압시작 카테고리 + Bar(#EC4899) 추가 |
| summary 수정 | OPS BE 연동 | 전체 변경 건수 limit 독립 (BE `e82e75f`) |

### OPS BE 연동 커밋

| 커밋 | 내용 |
|------|------|
| `6551d54` | ETL changes 응답에 `sales_order` 추가 |
| `e82e75f` | summary COUNT 쿼리 분리 (limit 영향 제거) |
| `faadd98` | `_FIELD_LABELS`에 `pi_start: 가압시작` 추가 |

---

## v1.6.0: 권한 매트릭스 세분화 (Sprint 27 연동) — ✅ 완료 (2026-03-13)

OPS Sprint 27 데코레이터 신설에 맞춰 VIEW FE 권한 체계를 매트릭스 기준으로 세분화.

### 변경 내용

| 파일 | 변경 |
|------|------|
| `ProtectedRoute.tsx` | `'gst'` role 추가, `isGst` blanket bypass 제거 |
| `App.tsx` | 라우트별 `allowedRoles` 매트릭스 맞춤 (`['admin','manager','gst']` 등) |
| `Sidebar.tsx` | NavItem roles 매트릭스 맞춤, 필터 로직에서 `'gst'` role 처리 |
| `LoginPage.tsx` | GST 일반 → `/factory`, admin/manager → `/partner` 분기 리다이렉트 |
| `UnauthorizedPage.tsx` | 동일 리다이렉트 분기 적용 |

### 매트릭스 대응

| 메뉴 | roles |
|------|-------|
| 공장 대시보드 | `['admin', 'gst']` |
| 협력사 관리 | `['admin', 'manager']` |
| 생산관리 | `['admin', 'manager', 'gst']` |
| QR 관리 | `['admin', 'manager', 'gst']` |
| 권한 관리 | `['admin', 'manager']` |
| 불량/CT/AI | `['admin', 'gst']` |

---

## OPS Bugfix: Admin prefix 로그인 수정 — ✅ 완료 (2026-03-13)

`get_admin_by_email_prefix()` 함수의 `fetchall()` 위치 버그 수정. 1차 매칭 성공 시 이미 소진된 커서를 재fetch하여 빈 리스트 반환하는 문제. `admin1234@gst-in.com` 추가 후 발견. OPS 커밋 `23c60c0`.

---

## OPS Sprint 27: 권한 데코레이터 재정비 — ⏳ OPS 작업 대기 (2026-03-13)

AXIS-VIEW FE/BE 권한 불일치 해소를 위해 OPS BE에 데코레이터 신설 요청.

### 요청 내용 (OPS_API_REQUESTS #11)

| 항목 | 내용 |
|------|------|
| 신규 데코레이터 | `@gst_or_admin_required` (GST 전용), `@view_access_required` (VIEW 전체) |
| API 교체 | QR 목록 + ETL 변경이력 → `@view_access_required` (GST 일반직원 403 해소) |
| API 교체 | 공장 대시보드 weekly-kpi → `@gst_or_admin_required` (협력사 차단) |
| 문서 | 확정 권한 매트릭스 + 데코레이터 체계 요약 |

### OPS 완료 후 VIEW 작업 필요

- ProtectedRoute + Sidebar 권한을 매트릭스 기준으로 세분화
- GST 일반직원: 공장/생산/QR/불량/CT/AI 접근 가능, 협력사/권한 접근 불가
- 협력사 manager: 협력사(자사)/생산/QR/권한(자사) 접근 가능

---

## Phase 5-A+: 생산관리 메뉴 개편 — ✅ 완료 (2026-03-12)

Sidebar "생산일정" 단일 메뉴 → "생산관리" 하위 메뉴 3개로 구조 개편.

### 주요 변경

| 항목 | 내용 |
|------|------|
| 메뉴 구조 | "생산일정" (preparing) → "생산관리" (하위: 생산일정/생산실적/출하이력, 모두 preparing) |
| 신규 페이지 | ProductionPerformancePage (O/N 주간 실적 확인 + 월마감), ShipmentHistoryPage (출하이력 스켈레톤) |
| 리다이렉트 | `/plan` → `/production/plan` 하위호환 |
| 자동 펼침 | `/production/*` 경로 시 생산관리 메뉴 자동 펼침 |

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/App.tsx` | `/production/plan`, `/production/performance`, `/production/shipment` 라우트 + `/plan` 리다이렉트 |
| `src/components/layout/Sidebar.tsx` | 생산관리 하위 메뉴 3개 + 자동 펼침 + NavLink end |
| `src/pages/production/ProductionPerformancePage.tsx` | **신규** — O/N 주간 실적 확인(기구/전장/TM 공정별) + 월마감 집계 |
| `src/pages/production/ShipmentHistoryPage.tsx` | **신규** — 출하이력 스켈레톤 (KPI + 테이블) |

---

## Phase 5-A: 협력사 관리 메뉴 개편 + 신규 페이지 — ✅ 완료 (2026-03-12)

Sidebar 메뉴 구조 개편 + 협력사 관리 하위 페이지 3종 추가 (샘플 데이터, API 미연동).

### 주요 변경

| 항목 | 내용 |
|------|------|
| 메뉴 구조 | "협력사 대시보드" → "협력사 관리" (하위 4개: 대시보드/평가지수/물량할당/근태 관리) |
| 신규 페이지 | PartnerDashboardPage, PartnerEvaluationPage, PartnerAllocationPage |
| 근태 자사 필터 | 협력사 유저(FNI, BAT 등)는 자사 데이터만 표시, 회사 드롭다운 숨김 |
| 리다이렉트 | `/attendance` → `/partner/attendance`, 로그인 후 기본 → `/partner` |
| 용어 정리 | NaN → 작업기록 누락률, 물량배분 → 물량할당, 출퇴근 기록 → 근태 관리 |
| 준비중 태그 | 대시보드/평가지수/물량할당 — 준비중 뱃지 표시, 근태 관리만 운영 중 |
| API 문서 | OPS_API_REQUESTS #9 주간 KPI, #10 월간 생산 현황 추가 |

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/App.tsx` | `/partner`, `/partner/evaluation`, `/partner/allocation`, `/partner/attendance` 라우트 추가 + `/attendance` 리다이렉트 |
| `src/components/layout/Sidebar.tsx` | 협력사 관리 하위 메뉴 4개 + preparing 태그 + 자동 펼침 복원 |
| `src/pages/partner/PartnerDashboardPage.tsx` | **신규** — KPI 카드 + 누락 히트맵 + 출퇴근 현황 + 주간 누락률 추이 |
| `src/pages/partner/PartnerEvaluationPage.tsx` | **신규** — 기구/전장 평가 테이블 (불량70%+누락30%) + 주차별 누락률 |
| `src/pages/partner/PartnerAllocationPage.tsx` | **신규** — 물량할당 시뮬레이션 + 배분 이력 테이블 |
| `src/pages/attendance/AttendancePage.tsx` | 협력사 유저 자사 필터 추가 (isAdminOrGst 분기) |
| `src/components/attendance/FilterBar.tsx` | `hideCompanyFilter` prop 추가 |
| `src/pages/LoginPage.tsx` | 로그인 후 리다이렉트 → `/partner` |
| `src/pages/UnauthorizedPage.tsx` | 기본 경로 → `/partner` |
| `docs/OPS_API_REQUESTS.md` | #9 weekly-kpi, #10 monthly-detail API 스펙 추가 |
| `BACKLOG.md` | Logout Storm 버그 → OPS BACKLOG로 이동 |

---

## v1.4.2: Logout Storm 버그 수정 — ✅ 완료 (2026-03-12)

refresh token 만료 시 logout API 다중 호출(10회+) 방지.

| 파일 | 변경 내용 |
|------|----------|
| `src/api/client.ts` | interceptor catch에서 logout 시 API 호출 대신 localStorage 정리만 |
| `src/store/authStore.ts` | `_isLoggingOut` 플래그로 중복 logout 차단 |

---

## Phase 4 Hotfix: Toggle API + Manager 회사 필터 — ✅ 완료 (2026-03-11)

Phase 4 테스트 중 발견된 버그 2건 수정.

| 버그 | 원인 | 수정 |
|------|------|------|
| Toggle 수정 안됨 (NG) | API endpoint 오류: `/toggle-manager` → BE 실제 라우트는 `/manager` | `workers.ts` endpoint 수정 |
| Manager가 전체 회사 보임 | FE에서 회사 필터링 미적용 | `PermissionsPage.tsx`에 `currentUser.company` 기준 필터 추가 |

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/api/workers.ts` | API URL: `/toggle-manager` → `/manager` (OPS BE 라우트 매칭) |
| `src/pages/admin/PermissionsPage.tsx` | Manager 로그인 시 `w.company === currentUser.company` 자동 필터링 |

---

## Phase 4: 페이지별 Role 기반 접근 제어 — ✅ 완료 (2026-03-11)

페이지별 접근 가능 role 구분 + OPS 권한 관리 기능 연동.

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/components/auth/ProtectedRoute.tsx` | `allowedRoles` prop 추가, 미지정 시 기존 동작 유지 |
| `src/App.tsx` | 라우트별 role 지정 — admin-only(factory/defect/ct), 공통(attendance/qr/plan/permissions) |
| `src/components/layout/Sidebar.tsx` | `NavItem.roles` 필드 + role 기반 메뉴 필터링 + ShieldIcon + 권한관리 메뉴 |
| `src/pages/admin/PermissionsPage.tsx` | **신규** — 작업자 목록 + is_manager Toggle (회사뱃지/역할/검색/필터) |
| `src/pages/UnauthorizedPage.tsx` | **신규** — 접근 거부 안내 + 대시보드 복귀 버튼 |
| `src/api/workers.ts` | **신규** — `getWorkers()`, `toggleManager()` API |
| `src/hooks/useWorkers.ts` | **신규** — TanStack Query 훅 + mutation |

### 페이지별 Role 매핑 (v1.6.0 매트릭스 기준)

| 페이지 | 경로 | 접근 가능 roles |
|--------|------|----------------|
| 협력사 관리 | `/partner/*` | admin, manager |
| QR Registry | `/qr` | admin, manager, gst |
| 변경 이력 | `/qr/changes` | admin, manager, gst |
| 생산관리 | `/production/*` | admin, manager, gst |
| 권한 관리 | `/admin/permissions` | admin, manager |
| 공장 대시보드 | `/factory` | admin, gst |
| 불량 분석 | `/defect` | admin, gst |
| CT 분석 | `/ct` | admin, gst |

### Sidebar 동작

| 사용자 유형 | 표시 메뉴 |
|------------|----------|
| admin | 전체 |
| GST+manager (PM) | 전체 |
| GST+일반 (PI, QI) | 공장, 생산, QR, 불량, CT, AI (협력사/권한 제외) |
| 협력사+manager | 협력사(자사), 생산, QR, 권한(자사) (공장/불량/CT/AI 제외) |

---

## QR 관리 — shipped 상태 반영 (2026-03-11)

QR 관리 페이지에 shipped(출하완료) 상태 지원 추가.

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| StatusBadge | Active / Revoked 2분기 | 진행 중 / 출하완료 / 폐기 3분기 |
| KPI 카드 | 전체 / Active / Revoked | 전체 / 진행 중 / 출하완료 |
| 필터 드롭다운 | Active / Revoked | 진행 중 / 출하완료 |
| QrStats 타입 | `total`, `active`, `revoked` | `shipped: number` 추가 |

> BE에서 `stats.shipped` 값을 내려주면 바로 반영. ETL이 `actual_ship_date` 기반으로 status를 shipped로 변경하면 자동 집계.

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/pages/qr/QrManagementPage.tsx` | StatusBadge 3분기, KPI shipped 카드, 필터 한글화 |
| `src/types/qr.ts` | `QrStats.shipped` 필드 추가 |

---

## Phase 3-A: ETL 알림 뱃지 + Admin 간편 로그인 — ✅ 완료 (2026-03-11)

ETL 변경이력 발생 시 Header/Sidebar에 unread 뱃지 표시 + Admin prefix 로그인 지원.

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/components/layout/NotificationPanel.tsx` | **신규** — 알림 드롭다운 패널 (소스별 건수 + 바로가기, 확장 가능 구조) |
| `src/components/layout/Header.tsx` | `useEtlChanges({ days: 1 })` 추가, 알림 벨 클릭 → NotificationPanel 토글, 소스별 건수 합산 뱃지 |
| `src/components/layout/Sidebar.tsx` | `SubNavItem.badge` 필드 추가, `useEtlChanges` 호출, "변경 이력" 서브메뉴에 빨간 숫자 뱃지 |
| `src/pages/qr/EtlChangeLogPage.tsx` | `useEffect`로 페이지 진입 시 `axis_view_last_seen_change_id` localStorage 저장 (읽음 처리) |
| `src/pages/LoginPage.tsx` | input type: `email` → `text`, placeholder: "이메일 또는 관리자 ID", 유효성 검증 `.trim()` 적용 |
| `src/api/auth.ts` | `@` 미포함 시 prefix 로그인 지원 (BE 자동 매칭) |

### ETL unread 추적 방식

| 항목 | 설명 |
|------|------|
| localStorage 키 | `axis_view_last_seen_change_id` |
| 저장 값 | 마지막으로 확인한 change_log 최신 ID |
| unread 계산 | `changes.filter(c => c.id > lastSeenId).length` |
| 읽음 처리 | `/qr/changes` 페이지 진입 시 `Math.max(changes.map(c => c.id))` 저장 |
| 뱃지 위치 | Header 알림 벨 + Sidebar "변경 이력" 서브메뉴 |

### 알림 드롭다운 패널 (NotificationPanel)

| 항목 | 설명 |
|------|------|
| 컴포넌트 | `NotificationPanel.tsx` — 확장 가능한 알림 소스 리스트 |
| 동작 | 알림 벨 클릭 → 드롭다운 열림 (공지사항 패널과 동일 패턴) |
| 항목 구성 | 아이콘 + 라벨 + 건수 뱃지 + 화살표 (클릭 → 해당 페이지 이동) |
| 현재 소스 | ETL 변경이력 (`/qr/changes`) |
| 확장성 | `notificationItems` 배열에 항목 추가로 실시간 이벤트 등 소스 추가 가능 |
| 상호 배타 | 알림/공지사항/설정 패널 중 하나만 열림 |

### Admin prefix 로그인

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| input type | `email` | `text` |
| placeholder | "관리자 이메일" | "이메일 또는 관리자 ID" |
| 로그인 방식 | 전체 이메일만 | `@` 없으면 prefix로 BE 전송 (자동 매칭) |

---

## Phase 3: 컨셉 HTML 매칭 + API 연동 — ✅ 완료 (2026-03-11)

Phase 2-2 API 연동 완료 + Phase 3 전체 페이지 컨셉 HTML 디자인 매칭.

### API 연동 (Mock → 실 API 전환)

| 파일 | 변경 내용 |
|------|----------|
| `src/api/notices.ts` | **신규** — `GET /api/notices` API 클라이언트 |
| `src/hooks/useNotices.ts` | **신규** — TanStack Query 훅 (60초 stale) |
| `src/api/etl.ts` | **신규** — `GET /api/admin/etl/changes` API 클라이언트 |
| `src/hooks/useEtlChanges.ts` | **신규** — TanStack Query 훅 (60초 stale) |
| `src/types/announcement.ts` | `is_pinned`(boolean) + `version`(string) 구조로 변경 (BE 스펙 매칭) |
| `src/components/layout/AnnouncementPanel.tsx` | Mock 제거 → `useNotices` 훅 사용, `is_pinned` 매핑 |
| `src/components/layout/Header.tsx` | `useNotices` + localStorage 기반 unread 카운트 |
| `src/pages/qr/EtlChangeLogPage.tsx` | Mock 제거 → `useEtlChanges` 훅, loading/error 상태 처리 |

### 컨셉 HTML 디자인 매칭

| 페이지 | 컨셉 파일 | 주요 변경 |
|--------|----------|----------|
| 공장 대시보드 | `G-AXIS VIEW(공장대시보드).html` | 최근 활동 피드, 월간 생산지표 수평 바 차트, progress bar 3단계 색상(≥80%=green, 40~79%=yellow, <40%=red) |
| 생산일정 | `G-AXIS VIEW(생산일정).html` | 원형 파이프라인(5단계), 범례 스트립, 필터 바(탭+드롭다운+검색), DateCell 7타입 컬러 셀 |
| 불량 분석 | `G-AXIS VIEW(불량분석).html` | 상태바, 전체너비 탭, KPI 아이콘 wrap, SVG 도넛+범례, 순위 뱃지(1=red/2=yellow/3=blue), SVG 라인 차트, 외주사 카드(그라디언트 아이콘+2x2 grid) |
| CT 분석 | `G-AXIS VIEW(CT분석).html` | 필터 바(기간 토글+월/모델 드롭다운), 프로세스 카드(top bar+아이콘), 범례 스트립, 이중 바 차트(IQR accent+평균 green), 신뢰도 뱃지, diff 태그 |

### 변경 파일 (디자인)

| 파일 | 변경 내용 |
|------|----------|
| `src/pages/factory/FactoryDashboardPage.tsx` | 최근 활동/월간 생산 섹션 추가, progressLevel() 함수 |
| `src/pages/plan/ProductionPlanPage.tsx` | 전면 재작성 (~370줄) — 원형 파이프라인, DateCell 컴포넌트 |
| `src/pages/defect/DefectAnalysisPage.tsx` | 전면 재작성 — SVG 도넛/라인 차트, 순위 리스트, 외주사 카드 |
| `src/pages/ct/CtAnalysisPage.tsx` | 전면 재작성 — 필터 바, 프로세스 카드, 이중 바 태스크 리스트 |

---

## Phase 2-2: 공지사항 + ETL 변경이력 + Sidebar 서브메뉴 — ✅ 완료 (2026-03-11)

공지사항 UI + ETL 변경 이력 서브페이지 + Sidebar 하위 메뉴 → API 연동 완료.

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/types/announcement.ts` | **신규** — Announcement 타입 (is_pinned, version, author_name) |
| `src/components/layout/AnnouncementPanel.tsx` | **신규** → API 전환 완료 |
| `src/components/layout/Header.tsx` | 공지사항 버튼 + API 기반 unread 카운트 |
| `src/components/layout/Sidebar.tsx` | 서브메뉴 지원 — QR관리 하위(QR Registry, 변경 이력) |
| `src/pages/qr/EtlChangeLogPage.tsx` | **신규** → API 전환 완료 |
| `src/App.tsx` | `/qr/changes` 라우트 추가 |
| `docs/OPS_API_REQUESTS.md` | 공지사항 (#2,#3), ETL (#5), 권한 (#4) 문서화 |

### 완료 상태

| 항목 | 상태 |
|------|------|
| 공지사항 API 연동 | ✅ 완료 |
| ETL 변경이력 API 연동 | ✅ 완료 |
| Sidebar 서브메뉴 | ✅ 완료 |
| 빌드 확인 (npm run build) | ✅ 통과 |

---

## Phase 2: QR 관리 페이지 — ✅ 완료 (2026-03-08)

QR 관리 페이지 FE 구현 및 Netlify 배포 완료.
BE 500 에러 수정 후 정상 조회 확인 (200 OK).
일정 기준 날짜 필터 + CSV 추출 + 동기화 상태바 추가.
기본 필터: 오늘~+2주 (기구시작 기준), 전체 보기 옵션 제공.

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/types/qr.ts` | **신규** — QrRecord, QrListResponse, QrListParams 타입 정의 (날짜 필터 파라미터 포함) |
| `src/api/qr.ts` | **신규** — QR 목록 조회 API + 날짜 필터 파라미터 (date_field, date_from, date_to) |
| `src/hooks/useQr.ts` | **신규** — TanStack Query 훅 (30초 캐시) |
| `src/pages/qr/QrManagementPage.tsx` | **신규** — 동기화 상태바 + KPI 카드 + 필터 + 테이블 + 페이지네이션 + CSV 다운로드 |
| `src/App.tsx` | `/qr` 라우트 추가 (ProtectedRoute) |
| `src/components/layout/Sidebar.tsx` | QR 관리 메뉴 활성화 (잠금 해제) |
| `src/components/layout/Header.tsx` | 페이지별 타이틀/breadcrumb 동적 변경 (BREADCRUMB_MAP) |

### Phase 2 세부 기능

| 기능 | 설명 |
|------|------|
| 동기화 상태바 | 초록 dot + 동기화 상태 + 등록 건수 + 마지막 동기화 시간(KST) |
| 기본 날짜 필터 | 페이지 진입 시 기구시작 기준 오늘~+2주 자동 적용 |
| 날짜 필터 | 기준(기구시작/모듈시작) 선택 + 날짜 범위 picker |
| 전체 보기 | 날짜 필터 해제하여 전체 리스트 조회 |
| CSV 다운로드 | 현재 필터 기준 전체 데이터에서 QR_DOC_ID, SN만 추출 |
| 컬럼명 변경 | "반제품시작" → "모듈시작" |
| 검색 | S/N, QR Doc ID 텍스트 검색 유지 |
| 헤더 동기화 | 페이지 전환 시 헤더 타이틀 + breadcrumb 자동 변경 |

### 해결된 이슈

| 이슈 | 해결 |
|------|------|
| QR API 500 에러 | BE 수정 완료 → 200 정상 반환 |
| apiClient import 오류 | default export로 수정 → Netlify 빌드 통과 |
| 헤더 타이틀 미변경 | Layout에 title prop 전달 + BREADCRUMB_MAP 추가 |
| 중복 헤더 | QR 페이지 내 h1 제거, 동기화 상태바로 대체 |

---

## Sprint 3: 실 데이터 연결 ✅ 완료 (2026-03-06)

Mock → Real API 전환 완료. device_id 지원, logout BE 호출, work_site 매핑 유틸 추가.
대시보드 전체를 하드코딩 Mock 의존에서 실 API 데이터 기반 동적 계산으로 전환.

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/api/client.ts` | `getDeviceId()` 함수 추가, `X-Device-ID` 헤더, refresh body에 device_id |
| `src/api/auth.ts` | login/refreshToken POST body에 device_id 추가 |
| `src/store/authStore.ts` | logout async 변경 + `POST /api/auth/logout` BE 호출 |
| `src/api/attendance.ts` | 실 API 응답에서 CHI product_line 자동 필터링 |
| `src/utils/workSiteMapping.ts` | **신규** — work_site/product_line 매핑 유틸 |
| `src/pages/attendance/AttendancePage.tsx` | Mock import 제거, KPI/차트/테이블 동적 계산 전환 |
| `src/components/attendance/CompanySummaryCards.tsx` | 하드코딩 Mock 테이블 삭제, props 기반 렌더링 |

### 실 DB 연동 테스트

| 테스트 | 항목 | 상태 |
|--------|------|------|
| 1 | 로그인 (admin 계정) | ✅ |
| 2 | 대시보드 데이터 로딩 (KPI/차트/카드/테이블) | ✅ |
| 3 | Mock 하드코딩 제거 확인 | ✅ |

---

## Sprint 3-hotfix: 대시보드 접근 권한 확장 ✅ 완료 (2026-03-06)

기존: `is_admin=true`만 대시보드 접속 가능 → 변경: `is_admin || is_manager` 허용.
권한 없는 사용자에게 모달 팝업 표시.

### 변경 내역

| 구분 | 변경 전 | 변경 후 |
|------|---------|---------|
| 접근 조건 | `is_admin=true`만 허용 | `is_admin=true` OR `is_manager=true` 허용 |
| 에러 표시 | 인라인 빨간 박스 | 모달 팝업 (아이콘 + 안내 + 확인 버튼) |
| 하단 안내 | "관리자 계정으로만 접근 가능합니다" | "관리자 및 협력사 관리자 계정으로 접근 가능합니다" |

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/api/auth.ts` | 로그인 검증: `!is_admin && !is_manager` 조건으로 변경, 에러 메시지 업데이트 |
| `src/pages/LoginPage.tsx` | `showAccessDenied` 모달 팝업 추가, 권한 에러 시 모달 표시, 하단 안내 문구 변경 |
| `src/components/auth/ProtectedRoute.tsx` | 라우트 가드: `!is_admin && !is_manager` 조건으로 변경 |

### 접근 권한 정리

| 사용자 유형 | is_admin | is_manager | 대시보드 접근 |
|-------------|----------|------------|--------------|
| GST 관리자 | true | - | ✅ 허용 |
| 협력사 관리자 | false | true | ✅ 허용 |
| 일반 작업자 | false | false | ❌ 차단 (모달 팝업) |

---

## Sprint 2: API 연동 + 설정 메뉴 ✅ 완료 (2026-03-06)

AXIS-OPS BE API 연동 준비 및 대시보드 설정 메뉴 구현.
BE 응답 필드명 불일치 수정(`user` → `worker`), 타입 필드 추가, 설정 훅/UI 구현, 자동 새로고침 연동.

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/types/auth.ts` | `User` → `Worker`, approval_status/email_verified 추가, 하위호환 별칭 |
| `src/types/attendance.ts` | work_site?, product_line? 옵셔널 필드 추가 |
| `src/api/auth.ts` | Mock/실제 응답 `user` → `worker` |
| `src/store/authStore.ts` | `data.user` → `data.worker` |
| `src/hooks/useSettings.ts` | **신규** — DashboardSettings 인터페이스 + localStorage 동기화 |
| `src/components/layout/SettingsModal.tsx` | **신규** — 자동 새로고침/기본 뷰/본사현장 구분 설정 |
| `src/components/layout/Header.tsx` | 설정 버튼 + SettingsModal 렌더링 |
| `src/hooks/useAttendance.ts` | refreshInterval 동적 설정 |
| `src/pages/attendance/AttendancePage.tsx` | 카드/테이블 뷰 토글 + showHqSiteBreakdown 연동 |
| `src/mocks/attendance.ts` | Mock에 work_site, product_line 추가 |

---

## Sprint 1: 디자인 수정 — G-AXIS Design System ✅ 완료

컨셉 HTML 기준으로 React 구현체 전면 수정. 로그인 + 출퇴근 대시보드 Phase 1 구현.

### 주요 구현

- **인증**: LoginPage + AuthProvider + ProtectedRoute + JWT 자동갱신
- **대시보드**: KPI 카드 4열 + 회사별 요약 카드 + 필터바 + 정렬 테이블
- **레이아웃**: 260px 사이드바 + 64px 헤더 + Sonner 토스트
- **디자인**: G-AXIS 컬러 토큰, DM Sans + JetBrains Mono, fadeInUp 애니메이션
- **빌드**: Vite + React 18 + TypeScript + Tailwind CSS v4 + shadcn/ui

---

## 📋 Sprint 이력 요약

| Sprint | 주요 내용 | 상태 |
|--------|----------|------|
| 1 | 디자인 수정 + G-AXIS 완전 적용 (로그인, 대시보드, 레이아웃) | ✅ 완료 |
| 2 | API 연동 준비 + 설정 메뉴 (worker 타입, 자동새로고침, 뷰토글) | ✅ 완료 |
| 3 | 실 데이터 연결 (device_id, logout, work_site 매핑, Mock 제거) | ✅ 완료 |
| 3-hotfix | 대시보드 접근 권한 확장 (is_manager 허용 + 모달 팝업) | ✅ 완료 |
| Phase 2 | QR 관리 페이지 (상태바 + 기본2주필터 + CSV 추출 + 헤더 동기화) | ✅ 완료 |
| Phase 2-2 | 공지사항 + ETL 변경이력 API 연동 완료 | ✅ 완료 |
| Phase 3 | 공장대시보드 + 생산일정 + 불량분석 + CT분석 컨셉 HTML 매칭 | ✅ 완료 |
| Phase 3-A | ETL 알림 뱃지 (Header+Sidebar) + Admin prefix 로그인 | ✅ 완료 |
| Phase 3-A+ | QR shipped 상태 3분기 + KPI 카드 출하완료 반영 | ✅ 완료 |
| Phase 4 | 페이지별 Role 접근 제어 + 권한 관리 페이지 + UnauthorizedPage | ✅ 완료 |
| Phase 4-fix | Toggle API endpoint 수정 + Manager 자사 필터 | ✅ 완료 |
| v1.4.2 | Logout Storm 버그 수정 (401 무한 루프 방지) | ✅ 완료 |
| Phase 5-A | 협력사 관리 메뉴 개편 + 대시보드/평가지수/물량할당 + 근태 자사 필터 | ✅ 완료 |
| Phase 5-A+ | 생산관리 메뉴 개편 (생산일정/생산실적/출하이력) | ✅ 완료 |
