# AXIS-VIEW 백로그

> 마지막 업데이트: 2026-04-21 (코드 크기 원칙 + 리팩토링 Sprint 계획 등록)
> 관련: AXIS_VIEW_ROADMAP.md, OPS_API_REQUESTS.md

---

## 🔧 리팩토링 Sprint 계획 (2026-04-21 등록)

> **근거**: CLAUDE.md § 📏 코드 크기 원칙 + 🛡️ 리팩토링 안전 규칙 7원칙
> **트리거**: 2026-03-22 AXIS SYSTEM 점검 보고서에서 AttendancePage 700+ LOC·ChartSection 700+ LOC "God 컴포넌트" 지적
> **실측 기준일**: 2026-04-21

### 📊 현재 위반 현황 (1단계 기준: 🟡 500 / 🔴 800 / ⛔ 1200)

| 파일 | LOC | 등급 | 주요 책임 혼재 |
|---|---|---|---|
| `pages/production/ProductionPerformancePage.tsx` | 895 | 🔴 필수 분할 | 월간 캘린더 + 주차 테이블 + 실적확인 다이얼로그 + O/N 그룹핑 + 필터 |
| `pages/qr/QrManagementPage.tsx` | 814 | 🔴 필수 분할 | QR 목록 + 필터 + 정렬 + elec_start + 테스트 S/N 토글 |
| `components/layout/Sidebar.tsx` | 627 | 🟡 경고 | 반응형 분기 + 접힘 상태 + children 그룹 + hover popover |
| `pages/plan/ProductionPlanPage.tsx` | 617 | 🟡 경고 | 생산일정 테이블 + 날짜 필터 + 모델 필터 |
| `pages/factory/FactoryDashboardPage.tsx` | 591 | 🟡 경고 | 주간 KPI + 월간 상세 + 차트 병합 |
| `pages/admin/PermissionsPage.tsx` | 535 | 🟡 경고 | 권한 테이블 + 매니저 토글 + 비활성 요청 |
| `pages/qr/EtlChangeLogPage.tsx` | 514 | 🟡 경고 | 변경 이력 + 필드 라벨 맵 + 필터 |

> 참고: AttendancePage(375줄)·ChartSection(456줄)은 감사 시점(700+) 대비 이미 분리 완료. 공통 유틸(REFACTOR-FMT-01) 효과 확인됨.

---

### 📋 리팩토링 Sprint 전체 로드맵

> **총 7개 Sprint, 각 1주 전후 예상 + Netlify preview 수동 검증 1~2일**
> **원칙**: Sprint 간 독립 배포 가능. 중간에 기능 Sprint 끼워넣기 허용. BE API 의존 변경 0.

#### Phase 1 — 공통 유틸 선행 (REFACTOR-FMT-01 완성)

| Sprint ID | 대상 | 작업 | 예상 LOC 절감 |
|---|---|---|---|
| **REF-V-00-UTIL** | `formatDate` 중복 2건 | `utils/format.ts` 승격 (QrManagementPage / InactiveWorkersPage) — BACKLOG REFACTOR-FMT-01 완성 | ~40줄 |

**Why**: 리팩토링 7원칙 + DRY 원칙. 큰 파일 분할 전에 공통 유틸 먼저 추출하면 감소 효과 누적.

#### Phase 2 — 🔴 필수 분할 (2 Sprint)

##### REF-V-01: ProductionPerformancePage.tsx 895줄 → 분할

| 단계 | 작업 | 이동 LOC |
|---|---|---|
| 1-1 | Custom Hook 추출 → `hooks/useProductionPerformance.ts` (데이터 페칭·필터 상태) | ~200줄 |
| 1-2 | `components/production/MonthlyCalendarView.tsx` 분리 | ~180줄 |
| 1-3 | `components/production/WeeklyPerformanceTable.tsx` 분리 | ~200줄 |
| 1-4 | `components/production/ConfirmDialog.tsx` + `ConfirmSettingsPanel.tsx` 분리 | ~150줄 |

**결과**: ProductionPerformancePage.tsx 895 → ~200줄 (🟢 OK)
**리스크**: 사용자 가장 많이 쓰는 페이지 → Netlify preview에서 월마감·실적확인 시나리오 수동 검증 필수

##### REF-V-02: QrManagementPage.tsx 814줄 → 분할

| 단계 | 작업 | 이동 LOC |
|---|---|---|
| 2-1 | Custom Hook 추출 → `hooks/useQrManagement.ts` (검색·정렬·필터) | ~180줄 |
| 2-2 | `components/qr/QrFilterBar.tsx` 분리 | ~150줄 |
| 2-3 | `components/qr/QrTable.tsx` 분리 (정렬·페이지네이션) | ~200줄 |
| 2-4 | `components/qr/QrDetailPanel.tsx` 분리 (DUAL L/R 렌더) | ~150줄 |

**결과**: QrManagementPage.tsx 814 → ~150줄 (🟢 OK)
**의존**: Sprint 56(elec_start 필드) 이후 작업. BE API 변경 0.

#### Phase 3 — 🟡 경고 파일 정리 (4 Sprint)

| Sprint ID | 대상 | 분할 전략 |
|---|---|---|
| **REF-V-03** | `Sidebar.tsx` 627 | `SidebarItem`, `SidebarGroup`, `SidebarToggle` 위젯 추출 + 반응형 로직 → `useResponsiveSidebar` 훅 |
| **REF-V-04** | `ProductionPlanPage.tsx` 617 | `PlanFilterBar` + `PlanTable` + `usePlanFilters` 훅 |
| **REF-V-05** | `FactoryDashboardPage.tsx` 591 | `WeeklyKpiSection` + `MonthlyDetailSection` + `useFactoryDashboard` 훅 |
| **REF-V-06** | `PermissionsPage.tsx` 535 + `EtlChangeLogPage.tsx` 514 | 각각 테이블·필터·다이얼로그 분리 |

---

### 🔄 리팩토링 부산물 — 재활용 가능 컴포넌트 (신규 `components/ui/`)

리팩토링 중 공통화 가능한 패턴 → 공통 UI로 승격:

| 컴포넌트 | 추출 소스 | 재사용처 |
|---|---|---|
| `FilterBar` | QR·생산실적·생산일정·권한 | 7+ 페이지 |
| `DataTable` (with sort + pagination) | QR·권한·ETL | 5+ 페이지 |
| `DateRangePicker` | 생산실적·근태·분석 | 4+ 페이지 |
| `ConfirmDialog` | 생산실적·강제종료·권한 | 5+ 페이지 |
| `EmptyState` | 전체 페이지 공통 | 전 페이지 |

→ Rule of Three 충족 시 즉시 `components/ui/`로 승격

---

### 🛡️ 공통 안전장치 (모든 REFACTOR Sprint 적용)

1. Sprint 시작 전 `git tag pre-refactor-{sprint-id}` 생성
2. `npm run build` 결과 스냅샷 저장 (modules 수·번들 크기·build time)
3. `[REFACTOR]` 커밋 prefix
4. **Netlify preview URL 실기기/태블릿 수동 검증 필수** (데스크톱 + 1024px 태블릿 + 768px 모바일)
5. BE API 변경 0 (VIEW only — OPS_API_REQUESTS.md에 추가 항목 없어야 함)
6. Codex 교차검증 M 전부 해결
7. 한 Sprint 이동 LOC 상한 400줄

### 📈 진행 추적

| 항목 | 시작 LOC | 목표 LOC | 현재 LOC | 상태 |
|---|---|---|---|---|
| ProductionPerformancePage.tsx | 895 | ≤ 300 | 895 | 🔴 미착수 |
| QrManagementPage.tsx | 814 | ≤ 300 | 814 | 🔴 미착수 |
| Sidebar.tsx | 627 | ≤ 400 | 627 | 🟡 미착수 |
| ProductionPlanPage.tsx | 617 | ≤ 400 | 617 | 🟡 미착수 |
| FactoryDashboardPage.tsx | 591 | ≤ 400 | 591 | 🟡 미착수 |

### 🚧 리팩토링 Sprint 우선순위 (권장 순서)

1. **REF-V-00-UTIL** (`formatDate` 공통화 — 30분 작업, 선행)
2. **REF-V-01** (ProductionPerformancePage — 사용 빈도 최고, 분할 효과 최대)
3. **REF-V-02** (QrManagementPage — 🔴 두 번째)
4. **REF-V-03 ~ 06** (🟡 병행 가능, 우선순위 낮음)

### 📌 REFACTOR-FMT-01 (기존 BACKLOG 연계)

- ✅ 완료: `formatDateTime` → `utils/format.ts` 승격 (v1.32.0)
- 🟡 잔여: `formatDate` 2건(QrManagementPage / InactiveWorkersPage) 승격 + fallback 인자 옵션 + invalid Date 가드 → **REF-V-00-UTIL에 통합**

---

## 1. 생산관리 (/production)

### 1-1. 라우트 구조 (확정)

```
생산관리  /production          ← Sidebar children 그룹
  ├── 생산일정  /production/plan         ← 기존 ProductionPlanPage 이동
  ├── 생산실적  /production/performance   ← 신규 (핵심)
  └── 출하이력  /production/shipment      ← 신규 (미정, 스켈레톤)

기존 /plan → /production/plan redirect 추가
권한: admin + GST + manager (협력사 관리와 동일)
```

### 1-2. 생산실적 — 핵심 설계

#### 배경 (As-Is → To-Be)

```
As-Is (현재):
  현장 → 카톡으로 "O/N 6238 기구 완료" 보고
       → 생관팀이 PPS(시스템)에 실적 수동 입력
       → 카톡으로 "처리 완료" 회신

To-Be (AXIS-VIEW):
  OPS에서 공정별 progress push (task 완료 기반)
  → progress 100% 도달 시 자동 표시
  → 생관팀이 "실적확인" 클릭 (공정별 개별 확인)
  → 확인 이력 DB 저장 (plan.production_confirm)
  → 재무·회계 정산 근거로 활용
```

#### 데이터 소스

- OPS 기존 API: `GET /api/app/product/progress` (Sprint 18)
  - S/N별 공정 진행률 (MM, EE, TM, PI, QI, SI)
  - 각 공정의 total / done / percent
  - mech_partner, elec_partner
- 집계 기준: **O/N 단위** (S/N을 O/N으로 그룹핑)
  - 보통 1개 O/N = 1~5개 S/N
  - 현재 생관/협력사는 S/N 관리보다 O/N 관리 선호

#### 뷰 구조

| 구분 | 내용 |
|------|------|
| **기본 단위** | O/N 행 (접기/펼치기로 S/N 상세) |
| **주간 탭** | W10~W13 (3월 기준), 공정별 progress 100% = 완료 건수 |
| **월마감 탭** | 주차별 집계 → 월 합계, 정산 근거 |
| **실적확인** | 공정별 인라인 확인 (기구/전장/TM 각각 독립) |
| **확인 기준** | 협력사: progress 100% + 자주검사 체크리스트 완료 → 확인 버튼 활성 |
| **일괄 처리** | 상단 "기구 일괄확인 (N건)" 또는 체크박스 선택 → 플로팅 바 |

#### 실적확인 단위 — 공정별 개별 확인

리스트 폭발 방지: **행 수는 O/N 수** (주간 6~10건), 공정 컬럼 안에 인라인 확인

```
O/N    모델         S/N                기구           전장           TM
6238   GAIA-I DUAL  GBWS-6627~6629(3)  3/3 [확인✓]   2/3            0/3
6401   GAIA-I DUAL  GBWS-6635~6636(2)  2/2 [확인]    2/2 [확인]     1/2
6405   GAIA-P DUAL  GBWS-6640~6644(5)  1/5           0/5            -
```

#### S/N 표시 규칙

- 3개 이상 + 연번: `GBWS-6627~6629 (3대)`
- 3개 이상 + 비연번: `GBWS-6627 외 2건`
- 2개 이하: `GBWS-6627, GBWS-6628`

#### 협력사 혼재 케이스

동일 O/N 내에서 S/N별 담당 협력사가 다를 수 있음

- O/N 접힌 상태: `FNI` → 통일 / `P&S / C&A` `혼재` → 혼재 뱃지
- O/N 펼친 상태: S/N별 개별 progress bar + 담당 협력사 표시

#### DB 스키마 — plan.production_confirm

```sql
-- Core DB (Railway PostgreSQL) — plan 스키마
CREATE TABLE IF NOT EXISTS plan.production_confirm (
    id              SERIAL PRIMARY KEY,
    sales_order     VARCHAR(255) NOT NULL,        -- O/N
    process_type    VARCHAR(20)  NOT NULL,        -- 'MECH' | 'ELEC' | 'TM'
    confirmed_week  VARCHAR(10)  NOT NULL,        -- 'W11' (주차)
    confirmed_month VARCHAR(7)   NOT NULL,        -- '2026-03' (월마감용)
    sn_count        INTEGER      NOT NULL,        -- 확인 대상 S/N 수
    confirmed_by    INTEGER REFERENCES public.workers(id),
    confirmed_at    TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,

    -- 중복 방지: 같은 O/N + 공정 + 주차에 1회만
    CONSTRAINT unique_confirm UNIQUE(sales_order, process_type, confirmed_week)
);

CREATE INDEX idx_prod_confirm_month ON plan.production_confirm(confirmed_month);
CREATE INDEX idx_prod_confirm_week ON plan.production_confirm(confirmed_week);
CREATE INDEX idx_prod_confirm_order ON plan.production_confirm(sales_order);
```

활용:
- `GROUP BY confirmed_month, process_type` → 공정별 월간 실적 자동 산출
- `confirmed_by + confirmed_at` → 감사 추적 (누가 언제 확인)
- 재무·회계 정산 근거 데이터

#### 필요 API (OPS BE 추가)

```
# 생산실적 조회 — 주간/월간
GET  /api/admin/production/performance
     ?week=W11&month=2026-03
     → O/N 그룹핑 + S/N별 progress + 확인 이력

# 실적확인 처리
POST /api/admin/production/confirm
     { sales_order: "6238", process_type: "MECH", week: "W11" }
     → plan.production_confirm INSERT

# 실적확인 취소 (오입력 대응)
DELETE /api/admin/production/confirm/:id

# 월마감 집계
GET  /api/admin/production/monthly-summary?month=2026-03
     → 주차별 공정 완료 건수 + 확인 건수
```

#### 실적확인 조건 (확정)

| 공정 | progress 조건 | 추가 조건 | SAP 전산 |
|------|-------------|----------|---------|
| MECH | 생산 task 완료 (자주검사 제외) | 자주검사 체크리스트 완료 (성적서) | ✅ |
| ELEC | 생산 task 완료 (자주검사 제외) | 자주검사 체크리스트 완료 (성적서) | ✅ |
| TM | TANK_MODULE 완료 | 가압검사(PRESSURE_TEST)는 실적 기준에서 제외 | ✅ |

- 자주검사 체크리스트: OPS 앱에서 시작 → 체크리스트 토스트 → 항목별 체크 → 디지털 검사 성적서 생성
- DB: `checklist` 스키마 (`checklist_master`, `checklist_record`) 이미 존재, 설계 검토 중
- 자체공정(PI, QI, 마무리): OPS 완료 timestamp 자동 적재 → 추후 보고서/챗봇 활용

#### 미결 사항

| 항목 | 상태 | 내용 |
|------|------|------|
| 주간 대상 기준 | 🟡 확인 필요 | 해당 주에 완료(end 찍힌) O/N? 또는 활성(진행중) O/N? |
| QMS 연동 | 🟡 확인 필요 | production_confirm 데이터를 QMS에도 반영해야 하는지 |
| 체크리스트 설계 | 🟡 검토 중 | OPS 앱 자주검사 체크리스트 기능 + checklist 스키마 설계 확정 필요 |

---

### 1-3. 출하이력

| 항목 | 내용 |
|------|------|
| 상태 | 데이터 소스 확정 — BE 수정 대기 (OPS #22) |
| 데이터 소스 | `app_task_details WHERE task_id='SI_SHIPMENT' AND completed_at IS NOT NULL` |
| 출하 판정 | SI_SHIPMENT task 완료 = 실제 출하 (원클릭 액션) |
| SAP 전산 | 출하 시 SAP 전산 처리 필요 |

#### 실적/출하 구조 (확정)

| 구분 | 공정 | 실적확인 | 출하 판정 | SAP |
|------|------|---------|----------|-----|
| 협력사 실적 | MECH, ELEC, TM | ✅ VIEW에서 확인 | - | ✅ |
| GST 자체공정 | PI, QI, 마무리(SI_FINISHING) | 내부실적 (timestamp 자동) | - | ❌ |
| 출하 | SI_SHIPMENT | - | ✅ completed_at 기준 | ✅ |

- `finishing_plan_end`: 생산일정 전용 (일정 관리)
- `SI_SHIPMENT completed_at`: 출하 카운트 기준 (공장 대시보드 + 출하이력)

---

## 2. 협력사 관리 (/partner) — 구현 완료

### 2-1. 페이지 구조 (완료)

```
협력사 관리  /partner
  ├── 대시보드    /partner                 (준비중)
  ├── 평가지수    /partner/evaluation      (준비중)
  ├── 물량할당    /partner/allocation      (준비중)
  └── 근태 관리   /partner/attendance      (운영중)
```

### 2-2. 평가지수 공식 (확정)

```
최종점수 = 불량등급점수 × 0.7 + 작업기록누락등급점수 × 0.3

누락률 등급: A(<1%) → 10점 / B(1~3%) → 7.5점 / C(3~6%) → 5점 / D(6%+) → 2.5점
누락률 기준: finishing_plan_end 해당 월 S/N의 task_records completed_at IS NULL 비율
갱신 주기: 일별
```

### 2-3. 6개 협력사

| 구분 | 기구 3사 | 전장 3사 |
|------|----------|----------|
| 업체 | BAT, FNI, TMS(M) | C&A, P&S, TMS(E) |
| 역할 | MECH 공정 | ELEC 공정 |

### 2-4. 용어 표준화 (완료)

- ~~NaN 비율~~ → **작업기록 누락률**
- ~~물량배분~~ → **물량할당**

---

## 3. 불량 데이터 (defect) — ETL Sprint 3 대기

### 3-1. 현황

```
ETL 파이프라인 (Sprint 1~2 완료):
  Teams Excel → ETL → defect.defect_record (917건) + inspection_record (3,517건)
  5-Tier DB: plan → public → partner → defect(DL) → analytics(DW)

Sprint 3 (대기):
  BE API 엔드포인트 구현 → VIEW 대시보드 연결 → blur 제거
```

### 3-2. QMS 스키마 매핑 (진행중)

```
현재:  [QMS 원천] → [Teams Excel 수동입력] → [DB 컬럼]
목표:  [QMS API] → [DB 컬럼]  ← 중간 Excel 제거

문서: etl/defect/docs/QMS_SCHEMA_MAPPING.md (v1.0 — QMS 스펙 확보 전)
```

**액션 아이템:**
1. QMS 스키마/API 스펙 확보 (사용자)
2. 매핑 테이블 TBD 칸 채우기
3. 값 매핑 대조표 (검출단계, 대분류 등)
4. DB 컬럼 리네이밍 여부 확정
5. Sprint 3 API는 매핑 확정 후 착수

### 3-3. 확인사항 정리 (답변 완료)

| 항목 | 답변 |
|------|------|
| 불량 데이터 소스 | Teams 실시간 운영 Excel → ETL 로컬 테스트 완료 |
| NaN(누락률) 기준 S/N 범위 | finishing_plan_end 기준, 3월=W10~W13, 일별 갱신 |
| 히트맵 해상도 | 일별 셀 단위 (기존 cron과 동일) |
| NaN 체크 UI | 앱에서 체크 UI 미구현, 에스컬레이션 알람으로 방지 |

---

## 4. OPS API 스펙 — 추가 필요

### 작성 완료

| # | 엔드포인트 | 문서 위치 |
|---|-----------|----------|
| 1~8 | QR, 공지, ETL, 출퇴근 등 | OPS_API_REQUESTS.md |
| 9 | weekly-kpi | OPS_API_REQUESTS.md |
| 10 | monthly-detail | OPS_API_REQUESTS.md |

### 작성 필요

| # | 엔드포인트 | 용도 | 선행 |
|---|-----------|------|------|
| 11 | `GET /api/admin/production/performance` | 생산실적 주간/월간 | O/N 그룹핑 쿼리 설계 |
| 12 | `POST /api/admin/production/confirm` | 실적확인 처리 | plan.production_confirm 마이그레이션 |
| 13 | `GET /api/admin/production/monthly-summary` | 월마감 집계 | #11 완료 후 |
| 14 | `GET /api/admin/partner/nan-heatmap` | 작업기록 누락 히트맵 | 누락률 쿼리 설계 |
| 15 | `GET /api/admin/partner/evaluation` | 평가지수 | #14 + 불량률 연동 |

---

## 5. 공통 규칙

| 항목 | 규칙 |
|------|------|
| OPS BE 코드 수정 | **반드시 사용자 승인 후** 진행 |
| VIEW FE 코드 | 자유 수정 가능 |
| 디자인 시스템 | G-AXIS Design System (CSS vars, 인라인 스타일) |
| 숫자 폰트 | JetBrains Mono |
| 텍스트 폰트 | DM Sans |
| 공정 단계 | MECH → ELEC → (TM) → PI → QI → SI |
| TM 적용 | GAIA 시리즈만 (non-GAIA는 N/A) |

---

## 6. 공장 위치도 — 디지털 트윈 (/factory-map) `PREPARING`

### 6-1. 개요

2D 공장 평면도 기반 디지털 트윈. S/N별 실시간 위치 + 공정 진행 상태 시각화.

### 6-2. 공장 구조

```
┌─────────────────────┐  ┌──────────────────────────────────────┐
│ 2공장                │  │ 1공장                                │
│ ┌──────┐ ┌────────┐ │  │ ┌─────────────────────────┐ ┌─────┐ │
│ │출하   │ │        │ │  │ │                         │ │     │ │
│ │라인   │ │생산라인 │ │  │ │  TEST-공정라인          │ │ 랙  │ │
│ ├──────┤ │        │ │  │ │                         │ │ 라  │ │
│ │TEST- │ │        │ │  │ ├─────────────────────────┤ │ 인  │ │
│ │공정   │ │        │ │  │ │                         │ │     │ │
│ │라인   │ │        │ │  │ │  생산라인               │ │     │ │
│ └──────┘ └────────┘ │  │ │                         │ │     │ │
└─────────────────────┘  │ └─────────────────────────┘ └─────┘ │
                          └──────────────────────────────────────┘
```

### 6-3. 핵심 기능

| 기능 | 설명 | 데이터 소스 |
|------|------|------------|
| **공장 2D 맵** | 1/2공장 실제 레이아웃 반영 | 고정 레이아웃 |
| **라인별 공정 레인** | MECH→ELEC→TM→PI→QI→SI 횡 배치 | `completion_status` |
| **S/N 셀** | 설비별 현재 공정·진행률 표시 | `app_task_details` |
| **S/N·O/N 검색** | Focus Zoom 애니메이션 → 설비 위치 하이라이트 | `qr_registry` + `plan.product_info` |
| **미니맵** | Zoom 시 우상단 전체 지도 + 핀 표시 | UI only |
| **상세 패널** | 공정별 진행률 바 + 협력사·고객·위치 정보 | 복합 JOIN |
| **KPI 카드** | 진행 중 / 완료 / 지연 경고 / 작업자 수 | 집계 쿼리 |

### 6-4. 데이터 연동 (향후)

```
필수 테이블:
  - completion_status     → 6공정 완료 상태 (S/N별)
  - app_task_details      → 현재 진행 중인 공정 + 작업자
  - plan.product_info     → 모델, O/N, 라인, 협력사
  - qr_registry           → S/N ↔ QR 매핑

추가 (디지털 트윈 고도화):
  - location_history      → GPS 좌표 → 맵 위 실시간 위치
  - work_pause_log        → 비가동 상태 표시
  - hr.partner_attendance → 작업자 출퇴근 상태
```

### 6-5. API 필요 (OPS BE)

```
# 공장 맵 데이터 (전체)
GET  /api/admin/factory/map
     → S/N별 현재 공정 + 진행률 + 라인 + 위치

# S/N 검색 상세
GET  /api/admin/factory/equipment/:serial_number
     → 공정별 진행 상태 + 작업자 + 협력사 + 타임라인
```

### 6-6. 목업

`/G-AXIS_디지털트윈_목업.html` — VIEW 디자인 시스템 적용 완료. Mock 데이터 기반 동작.

---

## 7. 우선순위 (현재 기준)

```
🔴 지금
├── 생산관리 페이지 구현 (생산실적 목업 → 라우트/사이드바)
└── QMS 스키마 매핑 (스펙 확보 대기)

🟡 다음
├── OPS API #11~13 스펙 작성 (생산실적)
├── plan.production_confirm 마이그레이션
└── 주간 대상 기준 확정 (B 항목)

🟢 이후
├── 불량 Sprint 3 (BE API + VIEW 연결)
├── 출하이력 데이터 소스 확정
├── OPS API #14~15 (협력사 평가)
├── 🗺 공장 위치도 — 디지털 트윈 (Section 6, PREPARING)
└── 📋 CSV 다운로드 이력 관리 (Section 8)
```

---

## 8. CSV 다운로드 이력 관리 `BACKLOG`

> 등록일: 2026-04-10
> 목적: 누가 언제 어떤 데이터를 CSV 다운로드했는지 추적 (감사/보안)

### 8-1. 배경

현재 CSV 다운로드는 FE에서 클라이언트 사이드로 생성하여 바로 내려줌.
다운로드 이력이 서버에 남지 않아 추적 불가.

### 8-2. 대상 페이지

| 페이지 | 현재 CSV 기능 | 비고 |
|--------|-------------|------|
| QR Registry | O | date_field/range 필터 적용 데이터 |
| 추후 추가 페이지 | - | 성적서 PDF, 생산실적 등 확장 가능 |

### 8-3. 설계 방향

BE 로깅 API 방식 (권장):
- CSV 다운로드 시 FE → BE 로그 API 호출
- DB에 영구 기록 (worker_id, page, filters, row_count, timestamp)
- 관리자 페이지에서 다운로드 이력 조회 가능

```
POST /api/admin/download-log
{
  page: "qr-registry",
  action: "csv_export",
  filters: { date_field: "mech_start", date_from: "...", date_to: "..." },
  row_count: 20
}
```

### 8-4. 선행조건

- OPS BE: download_log 테이블 + API 엔드포인트
- VIEW FE: CSV 내보내기 함수에 로그 API 호출 추가
- (선택) 관리자 다운로드 이력 조회 페이지
```
