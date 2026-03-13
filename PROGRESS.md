# AXIS-VIEW 진행 이력

> 마지막 업데이트: 2026-03-13 (v1.6.0 — 권한 매트릭스 세분화)
> 완료된 Sprint와 주요 변경사항을 기록합니다.
> 미해결/보류/계획 항목은 BACKLOG.md에서 관리합니다.

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
