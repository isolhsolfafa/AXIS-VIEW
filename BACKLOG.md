# AXIS-VIEW 백로그

> 마지막 업데이트: 2026-03-29 (v1.17.0 — Sprint 21 반응형 레이아웃)
> 이 파일은 보류/재검토/계획/아이디어를 한 곳에서 관리합니다.
> 완료된 항목은 PROGRESS.md로 이동합니다.

---

## 🔴 지금 진행 중 / 미해결

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| TASK-1 | Netlify 배포 (실 데이터 모드) | 대기 | Sprint 3 실 DB 테스트 통과. `VITE_USE_MOCK=false` + `VITE_API_BASE_URL` 설정 후 배포 필요 |
| TASK-2 | 협력사 관리자 데이터 범위 제한 | 🔄 부분 완료 | 권한관리 페이지 자사 필터 완료. 출퇴근/QR 페이지는 OPS Sprint 24 대기 (TASK-7) |
| TASK-3 | 공지사항 OPS API 연동 | ✅ 완료 | `GET /api/notices` 연동 완료 (2026-03-11). Mock 제거, `useNotices` 훅, Header badge API 기반 |
| TASK-4 | ETL 변경이력 OPS API 연동 | ✅ 완료 | `GET /api/admin/etl/changes` 연동 완료 (2026-03-11). Mock 제거, `useEtlChanges` 훅 |
| TASK-5 | shipped 상태 VIEW 반영 | ✅ FE 완료 | QR 페이지 StatusBadge 3분기(진행중/출하완료/폐기) + KPI 카드 shipped 표시. BE `stats.shipped` + ETL `actual_ship_date` 적재 후 자동 반영 |
| TASK-6 | QR 목록 API 응답 확장 | ⏳ OPS Sprint 24 대기 | `actual_ship_date`: BE SELECT 추가 예정(Sprint 24). `status`: ✅ 이미 포함. `contract_type`/`sales_note`: 활용성 검토 후 진행 (BACKLOG 아이디어) |
| TASK-7 | is_manager 데이터 범위 제한 | 🔄 부분 완료 | 출퇴근: 자사 필터 완료(FE). QR: 자사 필터 불필요로 결정→제거(#13). `etl/changes`: 전체 접근. 잔여: OPS Sprint 24 대기 |
| TASK-8 | 페이지별 Role 기반 접근 제어 | ✅ 완료 | ProtectedRoute `allowedRoles` + Sidebar role 필터 + admin-only 페이지 분리 + UnauthorizedPage |
| TASK-9 | 권한 관리 페이지 (OPS 연동) | ✅ 완료 | `/admin/permissions` — 작업자 목록 + is_manager Toggle. API endpoint 수정 + Manager 자사 필터 적용 완료 |
| TASK-10 | VIEW 권한 매트릭스 세분화 | ✅ 완료 | v1.6.0 — ProtectedRoute `'gst'` role 추가 + Sidebar/App.tsx 매트릭스 맞춤. OPS Sprint 27 데코레이터 연동 완료 |
| TASK-11 | ETL 변경이력 O/N 컬럼 추가 | ✅ 완료 | 테이블 6열→7열, `sales_order` 타입+셀 추가. OPS BE `6551d54` 연동 |
| TASK-12 | ETL summary 카운트 limit 독립 | ✅ 완료 | summary `total_changes`가 200 고정 → BE 별도 GROUP BY 쿼리 분리. OPS BE `e82e75f` |
| TASK-13 | pi_start 변경 추적 추가 | ✅ 완료 | CORE-ETL + OPS BE + VIEW FE 3곳 모두 수정 완료. ETL 실행 후 데이터 확인 필요 |
| TASK-14 | 공장 대시보드 실 API 연동 | ✅ 완료 | OPS Sprint 29 연동. 자동 슬라이드, 활동 피드, 전장업체 추가, 준비중 태그 제거 |
| TASK-15 | 생산일정 리팩토링 | ✅ 완료 | 통합 필터(오늘/이번주/전체), 공정 카운트 chip, 헤더 sorting, 공정 중복, 체크마크 준비 |
| TASK-16 | 불량 API 요청 등록 | ⏳ OPS 대기 | OPS_API_REQUESTS #16 PENDING. QMS defect API 필요 (KPI 불량 건수 + 활동 피드) |
| TASK-17 | 출하 데이터 소스 변경 | ✅ 완료 | 출하 카운트 `finishing_plan_end` → `ship_plan_date` 전환. 마무리종료 컬럼 제거. 기본 필터 "오늘" |
| TASK-18 | per_page 200 제한 | ⏳ OPS 대기 | OPS_API_REQUESTS #20 PENDING. monthly-detail 상한 200→500 완화 필요 (208건 중 8건 누락) |
| TASK-19 | 근태 KPI 카드 정적 데이터 제거 | ✅ 완료 | v1.7.2 — fallback(7,32,66,87.8)→0, "등록 협력사"→"오늘 출입 협력사", "+2.1%"→어제 API 비교 |
| TASK-20 | TMS(E) 카드 1명 표시 버그 | ✅ 완료 | v1.7.3 — `site_count` fallback이 Summary raw 값 사용 → `breakdown?.site ?? 0`으로 수정 |
| TASK-21 | 차트 주간/월간 탭 로직 | 🔄 FE 완료 | v1.7.3 — 라인 차트 UI 구현. BE trend API 연동 대기 (OPS_API_REQUESTS #29 PENDING) |
| TASK-22 | 퇴근 미체크 전체/본사/현장 필터 | ✅ 완료 | v1.7.3 — `activeCheckoutTab` state + `work_site` 기반 필터링. FE 단독 구현 |
| TASK-23 | 생산실적 BE-FE 키 매핑 수정 | 🔄 FE 완료 | v1.7.4 — `process_status`→`processes` 변경. BE TMS→TM 매핑 대기 (OPS_API_REQUESTS #32) |
| TASK-24 | 생산실적 공정 그룹 탭 분리 | ✅ 완료 | v1.10.0 Sprint 13 — 기구·전장 / TM 탭 + tabOrders 필터 + KPI/테이블/일괄확인 탭별 분기 + vitest 17 tests |
| TASK-25 | #36-C TM 가압검사 옵션 UI | 🔄 FE 완료 | v1.12.0 Sprint 15 — ConfirmSettingsPanel TM 그룹 박스 UI 완료. OPS BE migration 대기 |
| TASK-26 | 혼재 O/N partner별 실적확인 UI | ✅ 완료 | v1.11.0 Sprint 14 — ProcessCell 혼재 분기 + partner별 버튼 + 일괄확인 혼재 제외 |
| TASK-27 | S/N별 실적확인 UI + End 필터 | ✅ 완료 | v1.13.0 Sprint 16 — SNConfirm 타입, SNConfirmButton, ProcessCell 5단 분기, End 날짜 필터, 28 tests |

---

## 🟡 재검토 (Review Needed)

보류해둔 항목. 다음 Sprint 기획 시 우선 검토.

### RV-1: 실 데이터 연결 추가 테스트
- **배경**: Sprint 3에서 기본 3개 테스트 통과 (로그인, 데이터 로딩, Mock 제거). 추가 테스트 미실행
- **미실행 항목**:
  - 날짜별 조회 (date 파라미터)
  - 자동 새로고침 interval 확인
  - Token 자동갱신 (401 handling)
  - Logout API 호출 + 로컬 정리
- **우선순위**: 중 (배포 전 실행 권장)
- **등록일**: 2026-03-06

### RV-2: work_site 매핑 확장
- **배경**: 현재 `GST` → "GST공장", `HQ` → "협력사본사" 2가지만 매핑
- **확인 필요**: DB에 다른 work_site 값이 추가될 가능성. 매핑 테이블을 BE에서 내려주는 방식도 고려
- **우선순위**: 낮음
- **등록일**: 2026-03-06

---

## 🟠 배포 준비

| ID | 항목 | 설명 | 상태 |
|----|------|------|------|
| DP-1 | 개발 환경 세팅 | Vite + React 18 + TypeScript + Tailwind v4 + shadcn/ui | ✅ 완료 |
| DP-2 | Mock 데이터 시스템 | `VITE_USE_MOCK` 기반 Mock/실제 분기 | ✅ 완료 |
| DP-3 | 실 API 연결 | AXIS-OPS BE (Railway) 연동 확인 | ✅ 완료 |
| DP-4 | Netlify 배포 설정 | `netlify.toml` 설정 완료 | ✅ 완료 |
| DP-5 | 프로덕션 배포 | `VITE_USE_MOCK=false`로 Netlify 배포 | 대기 |
| DP-6 | 도메인 설정 | 커스텀 도메인 또는 Netlify 서브도메인 확정 | 추후 |

**현재 개발 URL**:
- FE: `http://localhost:5173` (Vite dev server)
- BE: `https://axis-ops-api.up.railway.app` (AXIS-OPS 공유)

**환경변수**:
- `VITE_USE_MOCK=true` → Mock 데이터 (개발)
- `VITE_USE_MOCK=false` → 실 API 호출 (프로덕션)
- `VITE_API_BASE_URL` → API 서버 URL

---

## 🔵 추후 구현 (Phase 로드맵)

### Phase 2: QR 관리 페이지 — ✅ 완료 (→ PROGRESS.md 참조)

### Phase 2-2: 공지사항 + ETL 변경이력 — ✅ 완료 (2026-03-11)
- **공지사항**: Mock → API 전환 완료. `api/notices.ts` + `hooks/useNotices.ts`, Header unread badge API 기반
- **ETL 변경이력**: Mock → API 전환 완료. `api/etl.ts` + `hooks/useEtlChanges.ts`
- **Sidebar 서브메뉴**: QR관리 → QR Registry + 변경 이력 하위 메뉴 구현 완료

### Phase 3 페이지: 컨셉 HTML 매칭 — ✅ 완료 (2026-03-11)
- **공장 대시보드**: 최근 활동 피드, 월간 생산지표 차트, progress bar 3단계 색상 추가
- **생산일정**: 원형 파이프라인, 범례 스트립, 필터 바, 날짜 컬러 테이블 구현
- **불량 분석**: SVG 도넛 차트, 부품 순위(뱃지+bar), SVG 라인 차트, 외주사 카드 (2x2 grid)
- **CT 분석**: 필터 바(기간 토글+드롭다운), 프로세스 카드(아이콘+top bar), 범례, 이중 바 차트(IQR/평균)

### Phase 3-A: ETL 알림 뱃지 + Admin 간편 로그인 — ✅ 완료 (2026-03-11)
- **알림 드롭다운 패널**: `NotificationPanel.tsx` 신규 — 알림 벨 클릭 시 소스별 건수 + 바로가기 드롭다운 (확장 가능 구조)
- **ETL 알림 뱃지**: Header 알림 벨 + Sidebar "변경 이력" 서브메뉴에 unread 숫자 뱃지, `last_seen_change_id` localStorage 패턴
- **Admin prefix 로그인**: input type=text, `@` 미포함 시 prefix 전송 (BE 자동 매칭)
- **읽음 처리**: `/qr/changes` 진입 시 최대 ID 저장 → 뱃지 자동 갱신

### Phase 4: 페이지별 Role 기반 접근 제어 + OPS 권한 부여 연동 — ✅ 완료 (2026-03-11)
- **ProtectedRoute**: `allowedRoles` prop 추가, 미지정 시 기존 동작 유지 (하위 호환)
- **App.tsx**: admin-only 라우트(공장/불량/CT), 공통 라우트(출퇴근/QR/생산일정/권한관리)
- **Sidebar**: `NavItem.roles` 기반 메뉴 필터링, Manager 로그인 시 admin-only 메뉴 숨김
- **권한 관리 페이지**: `/admin/permissions` — 작업자 목록 + is_manager Toggle (OPS API 연동)
- **UnauthorizedPage**: role 부족 시 접근 거부 안내 + 대시보드 복귀 버튼

### Phase 5-A: 협력사 관리 메뉴 개편 — ✅ 완료 (2026-03-12)
- **메뉴 구조**: "협력사 대시보드" → "협력사 관리" (하위: 대시보드/평가지수/물량할당/근태 관리)
- **신규 페이지**: 대시보드(KPI+히트맵), 평가지수(가중평가 테이블), 물량할당(시뮬레이션+이력) — 샘플 데이터, 준비중
- **근태 자사 필터**: 협력사 유저는 자사만 표시, admin/GST는 전체
- **용어 정리**: NaN → 작업기록 누락률, 물량배분 → 물량할당, 출퇴근 기록 → 근태 관리
- **API 문서**: OPS_API_REQUESTS #9 주간 KPI, #10 월간 생산 현황

### Phase 5-A+: 생산관리 메뉴 개편 — ✅ 완료 (2026-03-12)
- **메뉴 구조**: "생산일정" (단일) → "생산관리" (하위: 생산일정/생산실적/출하이력, 모두 preparing)
- **신규 페이지**: 생산실적(O/N 주간확인+월마감), 출하이력(스켈레톤)
- **리다이렉트**: `/plan` → `/production/plan`

### #36-C: TM 가압검사 옵션 UI — ⏳ BACKLOG (설비 변경 확정 시)
- **내용**: ConfirmSettingsPanel에 TM 그룹 박스 추가 — `tm_pressure_test_required` 토글
- **선행**: OPS BE `admin_settings` migration + `production.py` progress 분기 + 알람 핸들러 분기
- **설계**: DESIGN_FIX_SPRINT.md BACKLOG 섹션 참조
- **시기**: 설비 변경으로 가압검사 1회 전환 시

### Phase 6: WebSocket 실시간 업데이트
- **내용**: 출퇴근 시간대에 실시간 push로 대시보드 자동 갱신
- **현재**: 설정 메뉴에서 1분/3분/5분 polling 방식
- **의존성**: AXIS-OPS WebSocket flask-sock (Sprint 13 완료)
- **시기**: 미정

### 협력사 관리자 전용 뷰 — ✅ 부분 완료 (2026-03-12)
- **완료**: 근태 관리 자사 필터 (FE), 권한관리 자사 필터
- **미완료**: QR 관리 자사 필터 (OPS Sprint 24 대기, TASK-7)

### 월간 출퇴근 집계 대시보드
- **내용**: 일별 → 월간 집계 뷰 (출근율 추이, 회사별 월간 통계)
- **BE API**: GET /api/admin/hr/attendance/monthly (미구현 — OPS BACKLOG Phase B 참조)
- **시기**: 미정

### KPI 리포트
- **내용**: `/reports` 경로 — 주간/월간 KPI 리포트 생성 및 다운로드
- **시기**: 미정

---

## 🟢 아이디어 / 메모

- **다크모드**: G-AXIS 디자인 시스템에 다크 컬러 토큰 추가 가능. 현재는 라이트 모드만
- **반응형 모바일**: 현재 데스크탑 기준. 태블릿/모바일 레이아웃 추가 시 사이드바 → 하단 네비게이션
- **알림 센터**: 대시보드에서 실시간 알림 (지각 경고, 미출근 알림 등) 표시 — Header 알림 아이콘(채팅 버블) 자리에 OPS 알람 연동 예정
- **CSV/Excel 다운로드**: 출퇴근 데이터를 CSV/Excel로 내보내기 기능
- **shipped 상태 표시**: ✅ FE 완료 — QR관리 페이지 StatusBadge 3분기 + KPI 출하완료 카드 (BE/ETL 적재 후 자동 반영)
- **AXIS-OPS 통합 인증**: OPS와 VIEW가 동일 BE를 사용하므로, SSO 또는 토큰 공유 가능

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
| Phase 3-A+ | QR shipped 상태 3분기 + KPI 출하완료 반영 | ✅ 완료 |
| Phase 4 | 페이지별 Role 접근 제어 + OPS 권한 관리 연동 | ✅ 완료 |
| Phase 4-fix | 권한 Toggle API endpoint 수정 + Manager 자사 필터 | ✅ 완료 |
| v1.4.2 | Logout Storm 버그 수정 (401 무한 루프 방지) | ✅ 완료 |
| Phase 5-A | 협력사 관리 메뉴 개편 + 대시보드/평가지수/물량할당 + 근태 자사 필터 | ✅ 완료 |
| Phase 5-A+ | 생산관리 메뉴 개편 (생산일정/생산실적/출하이력) | ✅ 완료 |
| v1.6.0 | 권한 매트릭스 세분화 — OPS Sprint 27 연동 (GST 일반/협력사 분리) | ✅ 완료 |
| v1.6.0+ | ETL O/N 컬럼 추가 + summary limit 분리 + pi_start 스펙 문서화 | ✅ 완료 |
| v1.7.0 | 공장 API 실데이터 연동 + 대시보드/생산일정 리팩토링 (OPS Sprint 29) | ✅ 완료 |
| v1.7.1 | 공장 대시보드 자동 새로고침(10분/근무시간) + 근태 근무지 컬럼 | ✅ 완료 |
| v1.7.4 | 생산실적 BE-FE 키 매핑 (process_status→processes) + BE TMS→TM 대기 | 🔄 FE 완료 |
| v1.10.0 | Sprint 13 — 공정 그룹 탭 분리 (기구·전장 / TM) + vitest 테스트 환경 | ✅ 완료 |
| v1.11.0 | Sprint 14 — 혼재 O/N partner별 실적확인 UI + 일괄확인 혼재 제외 | ✅ 완료 |
| v1.12.0 | Sprint 15 — #36-C TM 가압검사 옵션 UI (ConfirmSettingsPanel TM 그룹 박스) | 🔄 FE 완료 |
| v1.13.0 | Sprint 16 — S/N별 실적확인 UI + TM 혼재 제거 + End 필터 + SNConfirmButton | ✅ 완료 |
| v1.13.1 | Sprint 17 — HOTFIX: end 필터 sns 순회 + inline 중복 제거 + keepPreviousData | ✅ 완료 |
