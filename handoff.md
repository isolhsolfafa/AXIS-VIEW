# AXIS-VIEW Handoff

> 세션 종료 시 업데이트. 다음 세션이 즉시 작업을 이어갈 수 있도록 현재 상태를 기록합니다.
> 마지막 업데이트: 2026-03-30

---

## 현재 버전

- **VIEW FE**: v1.17.0
- **최근 Sprint**: 22 (공정 완료 판정 버그 수정) — 승인 대기
- **최근 완료**: Sprint 21 (반응형 레이아웃), Sprint 40-C+ (비활성 사용자)

---

## 직전 세션 작업 내용 (2026-03-30)

1. Sprint 22 설계 완료 — ProcessStepCard 완료 판정 버그 (`workers.some()` → `categories.percent`)
2. handoff.md + memory.md 신규 생성 (OPS와 동일 구조)
3. CLAUDE.md에 handoff/memory 파일 참조 추가
4. **#48 ETL finishing_plan_end 필터 — BE 수정 완료 (사용자 직접)**
5. **#49 ProcessStepCard workers 정렬 — task_name 그룹핑 + started_at 내림차순 적용**
6. **에러 메시지 한글화 — 5개소 수정** (LoginPage, PermissionsPage, ProductionPerformancePage, EtlChangeLogPage, ProcessStepCard)
7. **사이드바 토글 버튼 위치 변경** — 경계선 돌출 → 사이드바 내부 하단 full-width 버튼
8. **#50 request-deactivation API 경로 수정** — `/work/` → `/api/app/work/` (url_prefix 누락)
9. OPS Sprint 41 진행 (릴레이 + 재활성화 BE) — VIEW Sprint 23 설계 완료

---

## 진행 중 Sprint

### VIEW Sprint 23 — Task 재활성화 UI (OPS Sprint 41 BE 완료 후 실행)
- ProcessStepCard worker 행 단위에 재활성화 버튼 추가
- SNDetailPanel 병합 시 `task_detail_id: t.id` 주입 방식으로 BE 수정 불필요
- `canReactivate` 단일 prop drilling 설계
- **선행**: OPS Sprint 41 BE 커밋 + 배포
- 설계 문서: `DESIGN_FIX_SPRINT.md` Sprint 23 섹션
- snStatus.ts에 `task_detail_id?: number` 타입 이미 추가됨

---

## 실행 대기 Sprint (설계 완료, 코드 미작성)

### 1순위: Sprint 22 — 공정 완료 판정 버그 수정 (승인 대기)
- ProcessStepCard.tsx: `workers.some()` → `categories.percent` 기준으로 변경
- SNDetailPanel.tsx: `categoryPercent` prop 전달
- **FE 2파일, ~20줄 변경. BE 변경 0건**
- 상세: `DESIGN_FIX_SPRINT.md` → Sprint 22 섹션

### 2순위: 사용시간 → 최근접속 변경
- AnalyticsDashboardPage.tsx: usage_minutes → last_access 표시 변경

### 3순위: Defensive coding `?? []`
- ProductionPerformancePage.tsx: 7개소 옵셔널 체이닝 보강

---

## 미해결 버그

| ID | 설명 | 심각도 | 파일 |
|----|------|--------|------|
| BUG-V1 | S/N 6905 ELEC 완료 오표시 (`workers.some()` 버그) | 🔴 HIGH | ProcessStepCard.tsx L33 |
| BUG-V2 | ProductionPerformancePage `?? []` 미적용 (7개소) | 🟡 LOW | ProductionPerformancePage.tsx |

---

## 금일 수정 완료 건 (2026-03-30)

| # | 내용 | 파일 |
|---|------|------|
| #48 | ETL `finishing_plan_end` 필터 BE 추가 | OPS BE (사용자 직접) |
| #49 | ProcessStepCard workers 정렬 (task_name 그룹 + 최신순) | ProcessStepCard.tsx |
| #50 | request-deactivation API 경로 수정 (`/api/app` prefix) | workers.ts |
| — | 에러 메시지 한글화 5개소 | LoginPage, PermissionsPage 등 |
| — | 사이드바 토글 버튼 내부 하단 이동 | Sidebar.tsx |

---

## OPS BE 미해결 요청 (VIEW 의존)

| # | 설명 | 상태 | 영향 |
|---|------|------|------|
| #18 | factory.py weekly-kpi 주차 계산 오류 | PENDING | 공장 대시보드 |
| #45 | 카드뷰 last_worker에 task 이름 추가 | PENDING | S/N 카드뷰 |
| #46 | 상세뷰 workers 누락 — task_id 매핑 불일치 | DONE (FE 버그) | — |
| #47 | QR 명판 인식 — qrbox 200 적용, focusMode 미해결 | PENDING | OPS FE |

> 전체 목록: `docs/OPS_API_REQUESTS.md` (#1~#50)

---

## 파일 참조 가이드

| 파일 | 용도 | 읽는 시점 |
|------|------|-----------|
| `CLAUDE.md` | 프로젝트 고정 정보 (팀 구성, 기술 스택, 규칙) | 매 세션 시작 시 |
| `memory.md` | 누적 의사결정, 버그 분석, 아키텍처 판단 | 맥락 필요 시 |
| `handoff.md` | 현재 파일. 세션 인계용 | 매 세션 시작 시 |
| `docs/sprints/DESIGN_FIX_SPRINT.md` | Sprint 1~22 메인 스프린트 문서 | Sprint 기획/실행 시 |
| `docs/OPS_API_REQUESTS.md` | BE API 요청/이슈 (#1~#50) | BE 의존 작업 시 |
| `docs/APS_LITE_PLAN.md` | APS Lite 기획서 (차세대) | APS 작업 시 |
| `docs/sprints/RESPONSIVE_DESIGN_PLAN.md` | 반응형 설계 v2 | 반응형 작업 시 |

---

## 다음 세션에서 할 일 (제안)

### 즉시 — Sprint 22 코드 수정 (승인 후)
- ProcessStepCard + SNDetailPanel categoryPercent 연동 (FE only, 30분 이내)

### 단기 — Sprint 23 실행 (OPS Sprint 41 배포 후)
- Task 재활성화 UI — ProcessStepCard worker 행 단위 버튼

### 중기 — 체크리스트 완성 + 사내서버
- ELEC 양식 수집 → 체크리스트 스키마 확장 (OPS BE Sprint 선행)
- Railway/Netlify → 사내서버 마이그레이션

### 장기 — APS Lite
- Phase 0: 데이터 축적 (factory_calendar, standard_manhour)
- Phase 1: APS 엔진 개발/검증
- 상세: `docs/APS_LITE_PLAN.md`

---

## 세션 업데이트 규칙

세션 종료 시 아래 항목만 업데이트:
- `현재 버전` — 새 Sprint 완료 시
- `직전 세션 작업 내용` — 전체 교체
- `실행 대기 Sprint` — 완료된 것 제거, 새로 추가된 것 기록
- `미해결 버그` — 해결/신규 반영
- `다음 세션에서 할 일` — 방향 업데이트

memory.md에는 **의사결정/버그분석/아키텍처 판단**만 추가 (일상 작업 기록 X)
