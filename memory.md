# AXIS-VIEW Memory

> 세션 간 누적되는 의사결정, 버그 분석, 아키텍처 판단을 기록합니다.
> CLAUDE.md = 프로젝트 고정 정보 / memory.md = 누적 학습 / handoff.md = 세션 인계
> 마지막 업데이트: 2026-04-28 (ADR-V006 추가 — Sprint 36 + R-02 결과)

---

## 1. 아키텍처 의사결정 기록 (ADR)

### ADR-V001: AXIS-OPS BE 공유, VIEW 전용 BE 없음 (2026-03 초기 결정)
- **맥락**: VIEW는 관리자 대시보드로, 별도 BE 구축 vs OPS BE API 공유
- **결정**: OPS BE API 공유. VIEW 전용 BE 없음
- **이유**: OPS에 이미 workers/attendance/production/qr 전체 API 존재. 중복 구축 불필요
- **제약**: BE 변경 필요 시 `OPS_API_REQUESTS.md`에 기록 → OPS 팀에서 처리
- **향후**: 사내서버 마이그레이션 시에도 동일 구조 유지 예정

### ADR-V002: G-AXIS Design System — 인라인 스타일 + CSS 클래스 병행 (2026-03 Sprint 1)
- **맥락**: Tailwind CSS 4 도입했으나, 디자인 시스템 토큰이 CSS 변수 기반
- **결정**: 인라인 스타일로 CSS 변수 직접 사용 + 반응형은 className + media query !important 오버라이드
- **이유**: 인라인이 구체적이고 빠름. 반응형만 CSS 클래스로 오버라이드
- **규칙**: 인라인 `gridTemplateColumns`는 데스크톱 기본값으로 유지, className 추가 방식

### ADR-V003: 반응형 전략 — 태블릿 우선, 모바일은 선택적 (2026-03-28)
- **맥락**: 공장 현장에서 태블릿으로 VIEW 대시보드 조회 요구 증가
- **결정**: 1024px(태블릿) 우선 대응, 768px(모바일)은 Phase D로 후순위
- **브레이크포인트**: 1200px(소형 데스크톱) → 1024px(태블릿, 주 타겟) → 768px(모바일)
- **CSS 규칙**: 넓은 브레이크포인트부터 선언 (cascade 순서)
- **사이드바**: 1024px 이하 자동 접힘(64px), 768px 이하 숨김+오버레이
- **접힌 사이드바 children**: hover popover(오버스펙) 대신 click→expand 방식 채택

### ADR-V004: SNCard vs ProcessStepCard 완료 기준 통일 (2026-03-29)
- **맥락**: S/N 6905 ELEC 공정 — SNCard는 "진행중", ProcessStepCard는 "완료"로 불일치
- **원인**: SNCard = `categories.percent` 기준(정확), ProcessStepCard = `workers.some()` 기준(부정확)
- **결정**: ProcessStepCard도 `categories.percent` 기준으로 통일
- **방법**: `categoryPercent` prop 추가, fallback에서도 `some()` → `every()` 변경
- **상태**: Sprint 22 설계 완료, 승인 대기

### ADR-V005: 사용자분석 페이지 — 참고 지표 유지 (2026-03-29)
- **맥락**: 사용시간(usage_minutes) 표시가 오버스펙 아닌지 검토
- **결정**: 페이지 자체는 참고 지표로 유지, 사용시간→최근접속(last_access)으로 변경 예정
- **이유**: 접속 현황 파악은 유용하나, 정확한 사용시간 산출은 불필요

### ADR-V014: Sprint 40 — manager 본인 worker_id 기록 정책 (2026-05-04, 클린 코어 데이터)

- **맥락**: Sprint 40 (Tank Module 시작/종료 admin 액션) 에서 manager/admin 이 모바일 앱 누락 시 VIEW 에서 대신 시작/종료 처리할 때, **누구의 worker_id 로 task_detail.workers row 가 추가되는지** 정책 결정 필요
- **결정**: **(c) 채택** — 클릭한 manager/admin 본인 worker_id (JWT 자동, proxy 모달 없음)
- **이유**:
  - VIEW 접속 자체가 manager 이상 권한 보장 → "action 하는 본인이 worker"
  - 시간 = `now()` 자동 기록만 (백데이트 입력은 별건, 다음 응용 포인트로 분리)
  - UI 단순화 + BE 변경 최소
  - 현장 작업자가 협력사 직원이라도 모바일 앱 누락 시 manager 가 대리 처리 → "기록 = 행위 책임자" 의미로 통합 운영
- **트레이드오프**: 실제 현장 작업자 worker_id 가 별도로 필요해질 경우 (집계 통계 정밀도) — 별도 컬럼 `actual_worker_id` 또는 `actor_role='proxy'` 플래그 추가 ADR 별건. 현 시점 미적용
- **클린 코어 데이터 원칙 영향**: `force_closed` 같은 별도 처리 플래그 추가 안 함 → 자연스러운 worker row 로 기록, 단순함 유지
- **회사 경계 정합 (M4 + M6)**: manager 인 경우 본인 회사 task 만 영향. 미시작 task 의 회사 매핑은 `product.module_outsourcing` (TMS) / `product.mech_partner` (MECH) 사용. NULL 시 카운트 제외 + toast 경고 (c-3)
- **참조**: `DESIGN_FIX_SPRINT.md` Sprint 40 결정 #5 + #9, Sprint 40 ADR 보강 섹션

---

### ADR-V015: Sprint 40 P2 화이트리스트 — 신규 모델 자동 흡수 정책 (2026-05-04)

- **맥락**: TANK_MODULE 누락이 GAIA/iVAS (TMS 카테고리) 외 DRAGON/SWS/GALLANT (MECH 카테고리) 에서도 동일 발생. 신규 모델 추가 시 코드 수정 부담 최소화 필요
- **결정**: **다중 카테고리 화이트리스트** — `task_id='TANK_MODULE' AND task_category IN ('TMS','MECH')`
- **DB 실측 근거**:
  - GAIA / iVAS: `is_tms=True` → `task_seed.py` TMS 카테고리에 TANK_MODULE 생성
  - DRAGON / SWS / GALLANT: `tank_in_mech=True` → MECH 카테고리에 TANK_MODULE 생성
  - 양쪽 모두 같은 `task_id='TANK_MODULE'` 사용
- **이유**:
  - 신규 모델 추가 시 `model_config` + product 데이터만 입력하면 일괄 시작/종료 자동 동작 (코드 변경 0건)
  - is_tms 플래그 신설 모델 / tank_in_mech 플래그 신설 모델 모두 자동 흡수
  - MITHAS / SDS 는 TANK_MODULE 자체 없음 → 화이트리스트 매칭 실패로 자동 제외
- **한계 (P3 후보 — BACKLOG OPS-BATCH-WHITELIST-DYNAMIC-01)**: 다른 task 종류 (가압검사 등) 추가는 여전히 코드 변경 필요. 향후 admin_settings 동적 옵션화 검토
- **참조**: `DESIGN_FIX_SPRINT.md` Sprint 40 결정 #10·#11, `components/sn-status/utils.ts` `TANK_MODULE_CATEGORIES`

---

### ADR-V006: 출하 토글 3옵션 동작 검증 — 운영 정합성 100% 상태에서 토글 변별력 0 (2026-04-28)
- **맥락**: Sprint 36 (v1.37.0) + BE Sprint 62-BE v2.4 양쪽 deployed 후 W18 (2026-04-27 ~ 2026-05-03) 응답 확인. `shipped_plan = shipped_actual = shipped_best = 22` (셋 다 동일)
- **결정**: 정상 동작 — 버그 아님. 토글 3옵션 그대로 유지
- **이유**:
  - `actual = 22`: actual_ship_date 이번 주 인 S/N 22개 (단순 카운트)
  - `plan = 22`: ship_plan_date 이번 주 + (actual NOT NULL OR si_shipment NOT NULL). 22개 actual ship 모두 ship_plan_date 도 이번 주 = 운영 정합성 100% 상태
  - `best = 22`: actual NOT NULL + 주간 귀속 si 우선. SI app 도입 0% → si_shipment 없음 → actual 그대로 22
  - 토글 변별력은 운영 흐트러질 때 발현: ship 지연 (plan ≠ actual) / SI 도입 후 actual 누락 (best > actual)
- **R-02 검증 결과**: BE 측 Pre-deploy Gate ③ 0건 검증 완료 → 해석 A (si ⊆ actual) 사실 확인. Twin파파 직접 검증 면제
- **사용자 SQL 결과 0/22/0 의 의미**: 사용자가 v2.2/v2.3 옛날 쿼리 실행 → BE 는 v2.4 새 쿼리 사용 → 결과 차이가 v2.4 deploy 의 정당성 증거 (AND 조건 무의미함을 데이터로 확인)

---

## 2. 버그 분석 기록

### BUG-V1: ProcessStepCard 완료 오판정 (2026-03-29 발견)

**현상**: S/N 6905의 ELEC 공정이 완료되지 않았는데 ProcessStepCard에서 `✅ 완료` 표시

**근본 원인**: `ProcessStepCard.tsx` L31~36
```typescript
// workers.some() → 공정 내 작업자 1명이라도 completed면 전체 완료로 판정
if (task.workers.some(w => w.status === 'completed')) return 'completed';
```

**데이터 흐름 분석**:
- SNDetailPanel이 같은 카테고리의 모든 task workers를 `flatMap`으로 병합 (L148~155)
- 예: ELEC에 task 5개, 그 중 3개 완료 → `mergedTask.workers`에 completed 작업자 포함
- `some()` 검사 → true → "완료" 오판정
- 한편 `categories[ELEC] = { total: 5, done: 3, percent: 60 }` → SNCard는 60%로 정확 표시

**수정 방향**: Sprint 22에서 `categoryPercent` prop 기반으로 통일 (ADR-V004 참조) — ✅ 수정 완료

### BUG-V3: ProcessStepCard workers 정렬 깨짐 (2026-03-30 발견)

**현상**: 동일 공정에 여러 task가 있을 때(MECH Waste Gas LINE 1/2 등) 작업자 목록 시간순 깨짐

**근본 원인**:
- SNDetailPanel L148~155: `catTasks.flatMap(t => t.workers)` → task 순서대로 이어붙임
- ProcessStepCard L116: `[...workers].reverse()` → 단순 배열 역순, 시간 기반 아님

**수정**: `reverse()` → `sort((a, b) => tb - ta)` (started_at 내림차순) — ✅ 즉시 수정 완료

---

### ADR-V006: 에러 메시지 한글화 원칙 (2026-03-30)
- **맥락**: `(error as Error)?.message` 또는 `err.message`를 UI에 직접 표시 → "Request failed with status code 401" 같은 영문 시스템 메시지 사용자 노출
- **결정**: 모든 사용자 노출 에러는 한글 메시지로 교체. HTTP status 기반 분기 처리
- **규칙**:
  - `err.message` / `error.message`를 UI에 직접 표시 금지
  - status 코드별 한글 fallback 메시지 사용 (401→인증, 403→권한, 404→미존재, 429→과다요청, 5xx→서버오류)
  - BE 응답의 `data.message`도 영문일 수 있으므로 직접 표시 대신 status 기반 fallback 사용
- **적용 파일**: LoginPage, PermissionsPage, ProductionPerformancePage, EtlChangeLogPage, ProcessStepCard

### ADR-V013: 성적서 ELEC Phase 분리 + TM DUAL L/R — 카테고리 배열 확장 패턴 (2026-04-10)
- **맥락**: 성적서 API가 단일 phase/단일 qr_doc_id로만 조회 → ELEC 2차 배선 누락 + TM DUAL L/R 체크 결과 0건
- **결정**: BE가 `categories` 배열에 동일 category를 phase/tank별로 복수 추가, FE는 `phase_label` 필드로 구분 표시
- **패턴**:
  - ELEC → `{category:'ELEC', phase:1, phase_label:'1차 배선'}` + `{category:'ELEC', phase:2, phase_label:'2차 배선'}`
  - TM DUAL → `{category:'TM', phase_label:'L Tank', qr_doc_id:'DOC_xxx-L'}` + `{category:'TM', phase_label:'R Tank'}`
  - TM SINGLE / MECH → 기존 단일 카테고리 유지
- **FE 구현**: `CategoryTable`에서 `cat.phase_label && " — ${cat.phase_label}"` 한 줄로 자동 적용
- **SELECT 타입**: `item_type='SELECT'` → `selected_value` 표시 (TUBE 색상 등)
- **QI 항목**: `checker_role='QI'` → 보라색 배지 표시, 실적 판정에서 제외 (BE `check_elec_completion`)
- **summary 필드 불일치**: BE `checked` / FE `completed` → API 매핑에서 `checked→completed` fallback 보정
- **How to apply**: 새 카테고리/phase 추가 시 BE가 `phase_label` 필드만 채우면 FE 수정 없이 자동 렌더링

### ADR-V010: 체크리스트 성적서 — BE 필드 매핑 보정 패턴 (2026-04-03)
- **맥락**: BE #54 체크리스트 성적서 API 반환 필드명이 FE 타입과 불일치
- **BE 반환**: `check_result`, `checked_by_name`, `value`
- **FE 기대**: `result`, `worker_name`, `input_value`
- **결정**: `getChecklistReport()` 내부에서 응답 후처리로 필드 매핑 보정
- **패턴**: `item.result ?? item.check_result ?? null` (FE 우선 → BE fallback)
- **이유**: BE 수정 요청 없이 FE에서 즉시 대응. 추후 BE가 필드명 통일하면 fallback 자동 무시
- **참고**: 동일 패턴이 `getPerformance()`에도 적용 중 (partner_info, confirms 변환)

### ADR-V012: confirm_checklist_required — UI만 존재, 로직 미연동 (2026-04-09 발견)
- **맥락**: 생산실적 ConfirmSettingsPanel에 "체크리스트 필수" 토글이 있음 (Sprint 25에서 추가)
- **현상**: 토글 ON/OFF 상관없이 실적확인 동작에 영향 없음
- **원인 분석**:
  - DB: `admin_settings` 테이블에 `confirm_checklist_required` 키 존재 (migration 027)
  - BE 설정 API: 읽기/쓰기 정상 (`GET/PUT /api/admin/settings`)
  - **BE 실적확인**: `production_service.py`에서 `confirmable` 판정 시 체크리스트 완료 여부 **미참조**
  - FE: `confirmable`은 BE 응답값 그대로 사용 — FE에서 체크리스트 상태를 별도 확인하지 않음
- **결론**: 설정값은 저장되지만 `confirmable` 판정 파이프라인에 연결되지 않은 dead toggle 상태
- **구현 필요 사항 (BE)**:
  1. `GET /api/admin/production/performance` 응답의 `confirmable` 판정에 체크리스트 완료 여부 조건 추가
  2. `confirm_checklist_required=true`일 때: 해당 S/N의 공정별 체크리스트가 미완료이면 `confirmable=false`
  3. 현재 체크리스트 BE: TM만 구현됨, ELEC은 Sprint 57에서 추가 예정, MECH는 미정
  4. 공정별 분기 필요: TM → TM 체크리스트, ELEC → ELEC 체크리스트 (Sprint 57 후), MECH → 미정
- **FE 수정**: BE가 `confirmable` 판정에 반영하면 FE 추가 수정 없음
- **How to apply**: BE Sprint으로 별도 등록 필요. ELEC 체크리스트(Sprint 57) 완료 후 연동이 현실적

### ADR-V011: ISO 주차 계산 — yearStart 기준 (2026-04-03)
- **맥락**: MonthlyCalendarView에서 W14(3/30~4/5)가 W13으로 1주 밀려 표시
- **원인**: `getISOWeek()`의 `yearStart = new Date(year, 0, 4)` (Jan 4 기준)
- **수정**: `yearStart = new Date(year, 0, 1)` (Jan 1 기준) + `dayNum = day || 7` (일요일=7)
- **검증**: 2026-04-01(수) → 수정 전 W13 → 수정 후 W14 (정확)

### ADR-V009: 체크리스트 관리 BE 연동 — TM 우선 + MECH/ELEC 블러 (2026-04-02)
- **맥락**: Sprint 20 목업 → OPS Sprint 52/52-A BE 완성 후 실제 연동 필요
- **결정**: TM 탭만 활성화, MECH/ELEC은 블러 오버레이 ("준비중")
- **TM Product Code**: `COMMON` 자동 고정 (드롭다운 숨김). 추후 MECH/ELEC도 동일 패턴
- **필드 매핑 변경**:
  - `inspection_group` → `item_group` (BE 기준)
  - `spec_criteria` + `inspection_method` → `description` (BE 통합 필드)
  - `item_type`: TM/ELEC=CHECK only, MECH=CHECK+INPUT
- **API 변경**: mock 제거, `deleteChecklistMaster` → `toggleChecklistMaster` (PATCH toggle)
- **UNIQUE 제약**: `(product_code, category, item_group, item_name)` — Sprint 52-A에서 item_group 추가

### ADR-V008: SNStatusPage O/N 그룹핑 — 섹션 헤더 방식 (2026-03-31)
- **맥락**: 생산현황에서 S/N 카드가 개별 나열 → 같은 O/N 소속 S/N을 한눈에 파악 어려움
- **결정**: O/N 단위 **섹션 헤더** (기존 카드 그리드 유지, 아코디언 아님)
- **BE 선행**: progress API에 `sales_order` 필드 추가 필요 (#51)
- **아코디언 → 섹션 헤더 변경 이유**:
  1. 완료 S/N은 1일 후 BE에서 자동 제외 → 접을 대상이 거의 없음
  2. 기존 카드 그리드 UX 유지 → 사용자 학습 비용 없음
  3. 신규 컴포넌트 불필요 → 2파일 ~60줄로 구현 가능
- **설계**:
  - `sales_order`로 그룹핑 → O/N 헤더(오더번호, 모델, 고객, 대수, 진행률 바) → 바로 아래 SNCard 그리드
  - `sales_order` NULL인 S/N은 헤더 없이 개별 카드 표시
  - 검색: O/N 번호 매칭 추가

### ADR-V007: 사이드바 토글 버튼 가시성 개선 (2026-03-30)
- **맥락**: 반응형 UI 업데이트 후 사이드바 접기/펼기 버튼(24x24, 반투명)이 잘 보이지 않음
- **결정**: 28x28 확대 + 그림자 강화 + hover 시 accent 색상 전환
- **변경 v1**: 크기/그림자 강화 (사이드바 경계 오른쪽 돌출 방식)
- **변경 v2**: 경계선에 걸려서 가려지는 문제 → 사이드바 내부 하단으로 이동 (full-width 버튼, 펼침 시 "사이드바 접기" 텍스트 표시, 접힘 시 아이콘만)

---

## 3. 반복 실수 방지

### CSS media query 순서
- **반드시** 넓은 브레이크포인트 → 좁은 브레이크포인트 순서
- `@media (max-width: 1200px)` → `@media (max-width: 1024px)` → `@media (max-width: 768px)`
- 역순으로 하면 cascade에 의해 좁은 규칙이 넓은 규칙에 덮어씌워짐
- Sprint 21 설계 중 한 번 틀림 → 피드백으로 수정

### SNStatusPage.tsx 수정 금지
- 이미 `auto-fill, minmax(280px, 1fr)`로 반응형 완성
- 반응형 Sprint에서 건드릴 필요 없음

### OPS BE 코드 수정 금지
- VIEW에서 필요한 BE 변경은 `docs/OPS_API_REQUESTS.md`에 기록
- 직접 OPS 코드 수정 절대 금지

### 사용자 승인 전 코드 수정 금지
- **핵심 규칙**: "내가 승인전에는 코드 수정은 하지마"
- 설계 문서 작성 → 사용자 리뷰 → 승인 → 코드 수정 순서 준수

---

## 4. 프로젝트 수치 (2026-03-29 기준)

### VIEW FE
- **페이지**: 20개 (Sprint 28: ChecklistReportPage 추가)
- **컴포넌트**: layout 5개, sn-status 4개, checklist 3개, partner 1개, attendance 7개, auth 1개, ui 13개
- **API 클라이언트**: 14개
- **훅**: 18개 (TanStack Query 기반)
- **타입 정의**: 7개
- **테스트**: 2개 파일만 (vitest 설치됨, 커버리지 낮음)
- **Sprint 이력**: 1~28 (+ 18-B, 18-C, 19 HOTFIX, 40-C, 40-C+)

### 의존 BE (AXIS-OPS)
- Flask + PostgreSQL (Railway)
- Migration: 041개
- API 엔드포인트: ~50개
- 테스트: 667+ passed

---

## 5. 데이터 구조 핵심 메모

### SNProduct.categories (공정 완료 판정의 Single Source of Truth)
```typescript
categories: Record<string, { total: number; done: number; percent: number }>
// 예: { MECH: { total: 3, done: 3, percent: 100 }, ELEC: { total: 5, done: 3, percent: 60 } }
```
- SNCard: `statusIcon(catData.percent)` — ✅ 올바른 사용
- ProcessStepCard: `workers.some()` — ❌ 잘못된 사용 (Sprint 22에서 수정 예정)

### SNDetailPanel의 task 병합 로직 (L148~155)
```typescript
const mergedTask = catTasks.length > 0
  ? { ...catTasks[0], workers: catTasks.flatMap(t => t.workers.map(w => ({ ...w, task_name: t.task_name }))) }
  : null;
```
- 같은 카테고리의 모든 task를 1개 카드로 병합 → workers 배열이 커짐
- 이 병합된 workers로 완료 판정하면 안 됨 → categories 데이터 사용해야 함

---

## 6. APS Lite 메모

### 데이터 준비도 (OPS memory.md와 동일, 참조용)
| 축 | 준비도 | 비고 |
|----|--------|------|
| 수요 (Demand) | 80% | product_info에 납기/수량 있음 |
| 공정능력 (Capacity) | 90% | duration_minutes 역산 가능 |
| 자재 (Material) | **0%** | AXIS에 전혀 없음 |
| 캘린더/인력 (Calendar) | 50% | 공장 캘린더 테이블 부재 |
| 공정 제약 (Constraint) | 30% | 명시적 dependency 없음 |

### Phase 수정 (2026-03-29)
- **기존**: Phase 1(사내서버+SAP) → Phase 2(APS 엔진)
- **수정**: Phase 0(데이터 축적) → Phase 1(APS 엔진) → Phase 2(사내서버+SAP) → Phase 3(고도화)
- **이유**: 사내서버 없이도 APS 엔진 개발/검증 가능. 데이터 축적이 먼저

### 맨먼스 산출 로직 (확정)
- 공정별 × 모델별 `PERCENTILE(actual_duration_minutes, 0.7)` = 표준공수
- 70th percentile 채택 이유: 극단값 제외 + 현실적 난이도 반영

---

## 7. 협력사 구조 (OPS와 동일)

| 코드 | 업종 | 공정 | 비고 |
|------|------|------|------|
| FNI | 기구 | MECH | — |
| BAT | 기구 | MECH | — |
| TMS(M) | 기구 | MECH + TMS | PI 위임 적용 중 |
| TMS(E) | 전기 | ELEC | — |
| P&S | 전기 | ELEC | — |
| C&A | 전기 | ELEC | — |
| GST | 자사 | PI/QI/SI/PM | 관리 + 자사 검사 |

### 제품 모델
GAIA-I DUAL, DRAGON-V, GALLANT-III, MITHAS-II, SDS-100, SWS-200

---

## 8. 배포 환경

| 구성요소 | 환경 | URL |
|----------|------|-----|
| VIEW FE | Netlify (정적) | (배포 URL 확인 필요) |
| OPS BE | Railway (Flask) | axis-ops-api.up.railway.app |
| OPS FE | Netlify (PWA) | gaxis-ops.netlify.app |
| DB | Railway PostgreSQL | 운영 DB 단일 인스턴스 |

- CI/CD: 미구축 (GitHub Actions 예정)
- 사내서버 마이그레이션: 2026년 내 안정화 목표, 2027년 전환 예정
