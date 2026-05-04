# AXIS-VIEW 백로그

> 마지막 업데이트: 2026-04-24 (SI-BACKFILL-01 등록 / BIZ-KPI-SHIPPING-01 v2.4 반영)
> 관련: AXIS_VIEW_ROADMAP.md, OPS_API_REQUESTS.md

---

## 📤 SI-BACKFILL-01 — app si_shipment → 생산관리 Excel 역방향 backfill (🟡 LOW, 2026-04-24 등록)

### 배경
- 생산관리팀은 Teams 공유 Excel에서 `ship_plan_date` / `actual_ship_date`를 **수기**로 실시간 관리
- AXIS-OPS 앱에 **SI 공정(`si_finishing` + `si_shipment`)** 이 도입되면 `si_shipment.completed_at` 이 **100% 정합 진실 소스**가 됨
- 과도기에 수기 Excel 누락분을 app 데이터로 자동 보완 필요

### 단계적 최종 구조 (Twin파파 2026-04-24 확정)
```
[Phase 0 — 현재]
  생산관리팀 → Teams Excel 수기 입력 (actual_ship_date 누락 가능)
  app si_shipment → DB 저장만 (Excel로 push X)

[Phase 1 — SI-BACKFILL-01 본 항목]
  app si_shipment completed_at → Graph API 로 Teams Excel 셀 업데이트 (cron)
  → 수기 Excel 누락분 자동 보완
  → 과도기 정합성 확보

[Phase 2 — 생산관리 플랫폼 신설]
  Teams Excel 탈피 → 자체 생산관리 플랫폼 구축 (APS 이전 필요 인프라)
  app si_shipment → 생산관리 플랫폼 직접 push
  → Phase 1 스크립트는 새 플랫폼 엔드포인트로 target 변경

[Phase 3 — CRM ↔ SAP API GW 완성]
  CRM ↔ SAP 양방향 API GW 구성중 (시행 일정 미정)
  최종: 단일 소스 정합성, ETL 역할 축소
```

### 전제 조건 (착수 트리거)
- **블로커**: "생산관리 플랫폼" 신설 여부 결정 전까지 본 항목 착수 보류
  - 플랫폼이 **금방 생긴다**면 Phase 1 스크립트 개발 비용이 아까움 (Phase 2 엔드포인트 변경 재작업)
  - 플랫폼이 **오래 걸린다**면 Phase 1 스크립트 먼저 개발 → 과도기 정합성 빨리 확보
- Twin파파 판단 필요: "생산관리 플랫폼 언제쯤 가능한가?" 일정 확정 시 착수 결정

### 구현 범위 (Phase 1, 착수 시)
- **언어**: Python 3.10+
- **라이브러리**: `msgraph-sdk-python` / `office365-rest-python-client`
- **인증**: Azure AD app registration (client credentials flow)
- **스크립트 동작**:
  1. Railway DB에서 `app_task_details.task_id='si_shipment' AND completed_at IS NOT NULL` 최근 N시간 조회
  2. 각 S/N의 `serial_number`를 Teams Excel의 해당 행에서 찾음
  3. `actual_ship_date` 셀이 비어있으면 `si_shipment.completed_at::date` 로 채움
  4. 로그 기록 (어떤 S/N을 몇 시에 backfill 했는지)
- **스케줄**: 매시간 정각 또는 08/14/20시 3회 (부하·정합성 균형)
- **배치 위치**: AXIS-OPS 측 Python 스크립트 (VIEW 범위 아님)

### 우선순위: 🟡 LOW (블로커 해소 대기)
- 2026 상반기 app SI 도입률 100% 목표 달성 시 backfill 주체가 역전됨 (app이 truth, Excel은 소멸)
- 생산관리 플랫폼 일정에 따라 Phase 1 스킵 가능성 존재

### 연관
- OPS `_count_shipped_plan` / `_count_shipped_best` 의 OR 조건 (v2.4) — backfill 없어도 `shipped_plan` 작동하지만 **수기·app 일치도**는 본 항목 구현 시 개선
- BIZ-KPI-SHIPPING-01 — app 보급률 지표가 100%에 수렴하는지 모니터링
- AXIS-OPS SI 공정 app flow 도입 (상반기 100% 목표)

---

## 📊 BIZ-KPI-SHIPPING-01 — 출하 이행률/정합성 분석 (🟡 LOW, 2026-04-23 등록)

### 배경
- Sprint 62-BE v2.2 확정안에서 출하 UNION `shipped_count` 폐기, **3필드(`shipped_plan` / `shipped_actual` / `shipped_ops`)만 제공**
- 3필드 차이 기반 비즈니스 지표는 본 BACKLOG 항목으로 이관 결정 (Twin파파 2026-04-23)

### 분석 대상 지표 (예시) — v2.4 기준 재정리
> v2.4에서 `shipped_ops` 필드 폐기 + `shipped_best` 신설 → 지표 수식 변경
1. **계획 대비 실적 이행률**: `shipped_actual / shipped_plan * 100%` — 출하 계획이 실제 얼마나 지켜졌는가
2. **종합 vs 실적 차이 (app 누락 감지)**: `(shipped_best − shipped_actual)` — app `si_shipment` 이벤트가 수기 actual과 별개 경로에서 카운트된 수량. 해석 A(si ⊆ actual) 가정이 깨지면 양수로 나타남
3. **app 보급률 (간접)**: `_count_shipped_best() WHERE t.completed_at IS NOT NULL` 서브카운트 ÷ `shipped_actual` — **별도 API 신설 필요** (BE factory.py에 `si_app_coverage_pct` 메타 필드)
4. **누락 감지 보조**: app 보급률이 기대치보다 낮으면 SI-BACKFILL-01 필요성 지표가 됨

### 전제 조건 (착수 트리거)
- **AXIS-OPS 앱 베타 100% 배포 완료** (현재 일부 미사용 worker 존재)
- `shipped_ops` 값이 신뢰할 만한 수준으로 누적된 뒤에만 의미 있음
- 데이터 2~4주 누적 후 착수 검토

### 구현 범위 (예상)
- FE: 공장 대시보드 또는 분석 페이지에 "출하 이행률" / "app 보급률" 위젯 추가
- BE: 추가 API 없이 기존 weekly-kpi / monthly-kpi 3필드 재활용
- 또는 별도 `/api/admin/factory/shipping-compliance` 엔드포인트 신설

### 우선순위: 🟡 LOW
- 앱 베타 100% 완료 전까지 데이터 불안정 → 착수 부적합
- 비즈니스 요구 강도에 따라 우선순위 재조정

### 연관
- OPS BE Sprint 62-BE v2.2 출하 3필드 제공
- VIEW Sprint 35 Phase 2 출하 기준 토글 UI (토글 선택이 곧 "어떤 기준으로 분석 중인가" 표시 역할)

---

## 🔧 REFACTOR-SNStatusPage — 코드 크기 원칙 다중 위반 정리 (🟡 LOW, 2026-04-30 등록)

### 배경
- Sprint 38 (v1.38.0) 진행 중 Codex 교차검증에서 발견 — SNStatusPage.tsx 코드 크기 원칙 다중 위반 (Sprint 38 와 무관, 기존 누적)

### 위반 현황 (CLAUDE.md § 📏 1단계 기준)
- **함수 길이 60줄** ← SNStatusPage 컴포넌트 함수 393줄 (655% 초과)
- **JSX 반환 100줄** ← 현재 209줄 (109% 초과)
- **JSX 중첩 5단계** ← `groupedByON.map` 안 헤더/조건부/그리드/카드 한도 초과 가능
- **순환복잡도 ≤10** ← 보수적 평가 시 초과 가능성 (3 effects + map 분기 + 권한 분기 등)
- **파일 LOC** ← 485 (한도 500, 🟢 OK 이지만 borderline)

### 분할 전략 (4단계)
1. **`hooks/useSNFiltering.ts`** — 검색/권한/showTestSN/modelFilter 필터링 + sorted 정렬 로직 (~120 LOC 이동)
2. **`components/sn-status/ONGroupHeader.tsx`** — Sprint 37 의 다대 그룹 헤더 + chevron + hover (~60 LOC 이동)
3. **`components/sn-status/SNCardGrid.tsx`** — 카드 그리드 + 들여쓰기 + 빈 상태 (~30 LOC 이동)
4. **`hooks/useExpandedGroups.ts`** — 3개 effect (검색/상세/cleanup) + Sprint 38 modelFilter effect 통합 (~80 LOC 이동)

### 결과 추정
- SNStatusPage.tsx: 485 → ~200 LOC (🟢 OK)
- JSX 반환 209줄 → ~70 (한도 100 미만)
- 함수 393줄 → ~80 (한도 60 근접)
- 신규 파일 4개 (utils/hooks/components 의 Rule of Three 정합 — 다른 페이지에서도 SNCardGrid / ONGroupHeader 재사용 가능성 검토)

### 우선순위: 🟡 LOW
- 현재 Sprint 38 까지 LOC 제한 내 (485 < 500)
- 점진적 위반 누적이라 시급도 낮음
- 다음 Sprint 추가 시 500 초과 위험 → 그 시점에 우선순위 상향 검토
- 리팩토링 안전 7원칙 적용 — 별도 PR + Codex 교차검증 1순위 + Netlify preview 실기기 검증 필수

### 연관
- Sprint 37 (v1.36.0/v1.36.1) O/N 그룹 토글 — 헤더 분리 가능 영역
- Sprint 38 (v1.38.0) 모델 칩 — 이미 분리됨 (옵션 A 채택, `InProgressModelChips.tsx`)

---

## 🔧 SETUP-PERMISSIONS-01 — Claude Code 권한 설정 장기 정비 (🟡 LOW, 2026-04-30 등록)

### 배경
- 2026-04-30 Sprint 38 Codex 교차검증 시 `settings.local.json` 권한 부족으로 Codex companion 차단 발견
- 옵션 B 로 즉시 해소 (Codex + npm build/test + git read-only + grep/find/wc 등 11개 entry 추가)
- 그러나 옵션 B 는 **단기 심플 해결안** — 장기 친화적 아님

### 현재 권한 설정의 한계
1. **절대 경로 하드코딩**: `Bash(cd /Users/twinfafa/Desktop/...)` — PC 변경 시 stale (이전 `kdkyu311` → 현 `twinfafa` 사례)
2. **프로젝트별 중복 관리**: AXIS-VIEW / AXIS-OPS 각각 동일 권한 추가 필요 (DRY 위반)
3. **임의 선택 기반**: skill 자동 분석 없이 추측으로 명령 선정 → 근거 약함
4. **glob 패턴 정밀도**: `Bash(find *)` 가 `find -delete` 도 매치할 가능성 (실 위험 낮음, 정밀화 가능)

### 장기 개선안 (4단계)

```
[단계 1] /fewer-permission-prompts skill 실행
  → transcripts 기반 실제 사용 명령 추출
  → 데이터 기반 권한 리스트 작성 (임의 선택 → 근거 기반)

[단계 2] 전역 vs 프로젝트 분리
  ~/.claude/settings.local.json (전역, 모든 프로젝트 공통):
    - grep / find / wc / git log / git status / git diff (read-only)
    - codex companion 호출

  프로젝트/.claude/settings.json (체크인 가능, 프로젝트 특화):
    - npm run build / test (프로젝트별 특화)
    - cwd-aware 패턴 (절대 경로 회피)

[단계 3] glob 패턴 정밀화
  - Bash(find *) → Bash(find * -name *) / Bash(find * -type *)
    (-delete / -exec rm 차단)
  - 기타 위험 옵션 명시 차단

[단계 4] 분기별 점검 (stale entry 정리)
  - PC 변경 / 디렉토리 이동 시 절대 경로 갱신
  - 사용 빈도 0인 entry 제거
```

### 우선순위: 🟡 LOW
- 현재 옵션 B 적용으로 정상 동작
- 장기 작업이라 즉시 시급도 없음
- 여유 있는 sprint 또는 PC 재설정 시점에 진행 권장

### 예상 작업 시간
- 단계 1: 5분 (skill 자동)
- 단계 2: 30분 (전역/프로젝트 분리 + 검증)
- 단계 3: 30분 (glob 패턴 정밀화)
- 단계 4: 분기당 10분 (지속 작업)

### 연관
- AXIS-OPS 프로젝트의 `.claude/settings.local.json` 도 동일 정비 필요 (단계 2 진행 시 함께)

---

## 🐛 LOCAL-BUILD-ICLOUD-OR-MIGRATION (🟡 LOW, 2026-04-23 등록)

### 증상 (2026-04-22~23 반복 발생)
- `npm run build` 1~2회 성공 후 일정 시간 뒤 재실행 시 `TS2307 Cannot find module '{package}'` 에러
- 영향 패키지: `lucide-react`, `tinyglobby` 등 (매번 다름)
- 해당 패키지 `node_modules/{package}/dist/` 폴더가 **통째로 사라짐**
- package.json의 `main` / `module` 참조 경로가 깨져 import resolution 실패

### 배경
- PC 변경 + 마이그레이션 중단 + 재셋팅 이후 발생 시작
- 기존 동일 iCloud Desktop 경로에서 **이전 Mac에서는 정상 동작**했음 (iCloud 자체 원인 아님)
- 사용자 기억상 이전 Mac에서도 `npm build` 관련 이슈 있었으나 해결 방법은 기억 안 남

### 해결 방법 (재발 시)
```bash
rm -rf node_modules && npm ci
```
- 6초 내 복구 완료
- Netlify 프로덕션 빌드는 fresh install이라 무영향 (published 상태 유지)

### 원인 불명 (추후 조사)
- 마이그레이션 부산물로 macOS extended attribute / security flag 잔존?
- 초기 세팅값 유실 범위 미확인 (Node 버전 관리 도구 / .zshrc / Xcode CLT 일부 등)
- 백업/동기화 도구가 `node_modules` 일부 파일 수정 권한 침해?

### 영향 범위
- 로컬 개발 환경만 — 빌드 실패 시 `npm ci` 1회 필요 (수 분 단위 지연)
- 프로덕션 빌드 (Netlify) 영향 없음
- 사용자 손님 응대 / 배포 경로 영향 없음

### 우선순위 판정: 🟡 LOW
- Production 무영향 + 해결 방법 간단(6초)
- 근본 조사에 시간 많이 들어갈 가능성 (환경 분석 · 시스템 로그 · backup 도구 식별 등)
- 여유 Sprint 또는 PC 완전 재설정 시점에 조사

### 향후 조사 방향
1. `node_modules/{lost_package}/dist/` 삭제 직전 시스템 로그 (`log stream --style syslog`) 확인
2. 마이그레이션 중단 시점에 `.migrationlog` 또는 Apple System 로그 조사
3. `xattr` / `mdls` 기반 파일 상태 비교 (정상 Mac vs 현재 Mac)
4. 또는 프로젝트 경로를 `~/dev/` 같은 iCloud 미동기 경로로 이동해 증상 재현 여부 테스트

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

### 📌 REFACTOR-FMT-01 (기존 BACKLOG 연계) — ✅ **완료 (2026-04-27, v1.36.2)**

- ✅ 완료: `formatDateTime` → `utils/format.ts` 승격 (v1.32.0)
- ✅ 완료: `formatDate` 2건(QrManagementPage / InactiveWorkersPage) 승격 + fallback 인자 옵션 + invalid Date 가드 (v1.36.2 / REF-V-00-UTIL)

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

---

## 🆕 BIZ-COMPANY-PROGRESS-01 — 협력사별 진행률 view 도입 (🟡 LOW, 2026-04-30 등록)

### 배경

현재 `SNCard.overall_percent` 는 모든 카테고리 합산 진행률. 협력사 매니저/worker 입장에서는 자기 회사가 담당하지 않는 카테고리(타 협력사 또는 GST 직속) 의 진척도까지 반영된 숫자라 "내가 책임지는 부분이 얼마나 진행됐는지" 직관 파악이 어려움.

Twin파파 제보 (2026-04-30): 협력사 view 에서는 **자기 회사 담당 task 의 진행률만** 보이게 좁히고, admin/GST 는 현행 유지.

### 정책 (Twin파파 2026-04-30 확정)

| 사용자 | view | 산식 |
|---|---|---|
| `is_admin === true` | 현행 (전체) | `overall_percent` 그대로 |
| `company === 'GST'` | 현행 (전체) | PI/QI/SI 가 GST 직속 → admin 동일 화면 제공 |
| 그 외 협력사 (`company !== 'GST'` AND `!is_admin`) | 자기 담당 카테고리만 | `mech_partner` / `elec_partner` / `module_outsourcing` 매핑 → 매칭 카테고리만 평균 |

### 카테고리 ↔ partner 필드 매핑

| 카테고리 | 담당 필드 |
|---|---|
| MECH | `product.mech_partner` |
| ELEC | `product.elec_partner` |
| TM | `product.module_outsourcing` |
| PI / QI / SI | GST 직속 (협력사 view 에서는 진행률 계산 제외) |

### Edge case 정리

- **0개 매칭** (협력사 user 가 담당 task 없는 S/N) → BE 단에서 `task_seed` 태깅 기반으로 협력사 user 에게는 자기 담당 S/N 만 응답하므로 FE 단 추가 처리 불필요. 0매칭 케이스 자체가 발생하지 않음.
- **partner 필드 null** — 매칭 안됨으로 간주하여 평균 산식에서 제외 (보수적 처리)
- **GST 도 partner 로 등장하는 경우** (예: `mech_partner === 'GST'`) — GST 회사 user 는 어차피 현행 view 라 영향 없음

### 영향 파일 (예상)

- `app/src/components/sn-status/SNCard.tsx` — overall_percent 표시 로직 분기
- `app/src/utils/companyScopedProgress.ts` (신규) — 회사별 진행률 계산 유틸 (`getCompanyScopedPercent(product, currentUser)`)
- (검토 필요) `app/src/pages/production/SNStatusPage.tsx` 의 `groupedByON.overallPercent` 도 회사 분기 적용 여부 — 그룹 헤더 진행률도 동일 정책 가져갈지 별도 결정 필요

### 우선순위: 🟡 LOW

블로커 없음. Sprint 40 (TM Tank Module 시작/종료) 우선 처리 후 자연스럽게 착수 권장.

### 연계

- Sprint 34 (FE-21, v1.33.0) — `mech_partner` / `elec_partner` / `module_outsourcing` 필드 도입 ✅ (데이터 이미 확보)
- Sprint 33 — `is_admin` / `is_manager` / `currentUserCompany` 분기 패턴 (`canForceClose` 등) 참조
- Sprint 40 (FE) — 동일 회사 경계 분기 정책과 통일성 확보

### 착수 트리거

- 협력사 매니저로부터 "전체 진행률이 우리 회사 작업 안 한 부분까지 포함되어 헷갈린다" 류 제보 누적 시 우선순위 상향
- 또는 다른 BACKLOG 정리 후 sprint 슬롯 확보 시 진행

---

## 🆕 OPS-BATCH-WHITELIST-DYNAMIC-01 — Work Batch 화이트리스트 admin_settings 동적 옵션화 (🟡 LOW, 2026-04-28 등록)

### 배경

Sprint 40 (FE) + Sprint 64-BE 의 일괄 시작/종료 화이트리스트가 현재 코드에 하드코딩 (`task_category IN ('TMS','MECH') AND task_id='TANK_MODULE'`). Codex 2차 검토 P2 채택으로 신규 모델 (is_tms 또는 tank_in_mech) 추가 시 코드 변경 0건 자동 대응 가능하나, **다른 task 추가 (가압검사, 다른 카테고리 task) 는 여전히 코드 변경 필요**.

Twin파파 의도 (2026-04-28): "신규 model 추가됐을 때 대응 로직이나 옵션 처리 가능한지" — P2 로 모델은 자동 흡수, 그러나 task 자체는 admin 토글로 제어하면 더 유연.

### 정책 (Codex P3 후보안 — 향후 검토)

| 항목 | 현재 (Sprint 64-BE) | 향후 P3 안 |
|---|---|---|
| 카테고리 화이트리스트 | 하드코딩 `('TMS','MECH')` | `admin_settings.batch_target_categories = ['TMS','MECH']` (admin 페이지 토글) |
| task_id 화이트리스트 | 하드코딩 `'TANK_MODULE'` | `admin_settings.batch_target_task_ids = ['TANK_MODULE']` (배열, 다중 task 지원) |
| FE 동기화 | 하드코딩 | `GET /admin/settings` 응답 기반 동적 로딩 |

### 영향 파일 (예상)

- BE: `backend/app/routes/admin.py` — settings 정의 추가, `backend/app/routes/work.py` — 화이트리스트 동적 조회 (DB 캐시 또는 메모리)
- BE migration: `admin_settings` 행 INSERT (`batch_target_categories`, `batch_target_task_ids`)
- FE: `app/src/pages/admin/SettingsPage.tsx` — 토글 UI, `app/src/components/sn-status/utils.ts` — `TANK_MODULE_CATEGORIES` 동적화
- 캐시 정책: 변경 빈도 낮음 → 5분 staleTime 또는 settings polling

### 우선순위: 🟡 LOW

블로커 없음. P2 (다중 카테고리 화이트리스트) 가 신규 모델 자동 흡수를 이미 보장하므로 P3 는 신규 task 종류 (가압검사 등) 자주 추가될 때 가치 발생.

### 연계

- Sprint 40 (FE) — TM Tank Module 시작/종료 결정 #10 P2
- Sprint 64-BE — Work Start/Complete Batch 결정 #4·#8 P2 화이트리스트
- 향후 응용: Sprint 40 다음 응용 포인트의 "가압검사 추가" / "다른 카테고리 확장" 시 자연스럽게 동시 진행

### 착수 트리거

- 가압검사·다른 카테고리 task 의 누락률 문제 발생 → 화이트리스트 확장 요구 시 P2 코드 수정 대신 P3 admin 토글로 대체
- 또는 admin 페이지 신설 작업과 묶어서 일괄 진행
