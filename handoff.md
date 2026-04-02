# AXIS-VIEW Handoff

> 세션 종료 시 업데이트. 다음 세션이 즉시 작업을 이어갈 수 있도록 현재 상태를 기록합니다.
> 마지막 업데이트: 2026-04-02

---

## 현재 버전

- **VIEW FE**: v1.20.0
- **최근 Sprint**: 26 (체크리스트 관리 BE 연동 + TM 활성화) — 설계 완료, 코드 미작성
- **최근 완료**: Sprint 25 (페이지별 설정 패널), Sprint 24 (O/N 섹션 헤더)

---

## 직전 세션 작업 내용 (2026-04-02)

1. **ProcessStepCard 날짜 표시 수정** — formatTime: `HH:mm` → `MM/DD HH:mm` (배포 완료)
2. **OPS Sprint 52 + 52-A 검토** — TM 체크리스트 전체 설계 리뷰, UNIQUE 충돌 발견→해결(item_group 추가)
3. **Sprint 26 설계 완료** — 체크리스트 관리 페이지 목업→실제 BE 연동, TM 활성화, MECH/ELEC 블러
4. **Sprint 25 검토 피드백** — SNStatusSettingsPanel 설명 텍스트 불일치 (DOC_TEST- → DOC_TEST-/TEST-)
5. **OPS Sprint 52-A 검토** — COMMON seed 15항목, scope='all' 기본값, Excel UPSERT 4컬럼

---

## 진행 중 Sprint

없음 — Sprint 26 설계 완료, 코드 미작성 (OPS Sprint 52 BE 배포 대기)

---

## 실행 대기 Sprint (설계 완료, 코드 미작성)

### 1순위: 사용시간 → 최근접속 변경
- AnalyticsDashboardPage.tsx: usage_minutes → last_access 표시 변경

### 2순위: Defensive coding `?? []`
- ProductionPerformancePage.tsx: 7개소 옵셔널 체이닝 보강

---

## 미해결 버그

| ID | 설명 | 심각도 | 파일 |
|----|------|--------|------|
| BUG-V2 | ProductionPerformancePage `?? []` 미적용 (7개소) | 🟡 LOW | ProductionPerformancePage.tsx |

---

## 금일 수정 완료 건 (2026-04-01)

| # | 내용 | 파일 |
|---|------|------|
| — | 테스트 S/N 필터 (DOC_TEST- + TEST-) | SNStatusPage.tsx, QrManagementPage.tsx |
| — | Sprint 25 Part A: showTestSN 토글 | useSettings.ts, SNStatusSettingsPanel.tsx, SNStatusPage.tsx, QrManagementPage.tsx |
| — | Sprint 25 Part B: TM 체크리스트 설정 | adminSettings.ts, ChecklistSettingsPanel.tsx, ChecklistManagePage.tsx |

---

## OPS BE 미해결 요청 (VIEW 의존)

| # | 설명 | 상태 | 영향 |
|---|------|------|------|
| #18 | factory.py weekly-kpi 주차 계산 오류 | PENDING | 공장 대시보드 |
| #45 | 카드뷰 last_worker에 task 이름 추가 | PENDING | S/N 카드뷰 |
| #47 | QR 명판 인식 — qrbox 200 적용, focusMode 미해결 | PENDING | OPS FE |
| #51 | progress API에 sales_order 필드 추가 | DONE | SNStatusPage O/N 그룹핑 |
| #52 | ETL _FIELD_LABELS에 finishing_plan_end 누락 | PENDING | 마무리계획일 조회 불가 |

> 전체 목록: `docs/OPS_API_REQUESTS.md` (#1~#52)

---

## 파일 참조 가이드

| 파일 | 용도 | 읽는 시점 |
|------|------|-----------|
| `CLAUDE.md` | 프로젝트 고정 정보 (팀 구성, 기술 스택, 규칙) | 매 세션 시작 시 |
| `memory.md` | 누적 의사결정, 버그 분석, 아키텍처 판단 | 맥락 필요 시 |
| `handoff.md` | 현재 파일. 세션 인계용 | 매 세션 시작 시 |
| `docs/sprints/DESIGN_FIX_SPRINT.md` | Sprint 1~26 메인 스프린트 문서 | Sprint 기획/실행 시 |
| `docs/OPS_API_REQUESTS.md` | BE API 요청/이슈 (#1~#52) | BE 의존 작업 시 |
| `docs/APS_LITE_PLAN.md` | APS Lite 기획서 (차세대) | APS 작업 시 |
| `docs/sprints/RESPONSIVE_DESIGN_PLAN.md` | 반응형 설계 v2 | 반응형 작업 시 |

---

## 다음 세션에서 할 일 (제안)

### 즉시 — Sprint 25 설명 텍스트 수정
- SNStatusSettingsPanel L10265: `DOC_TEST- prefix S/N 포함` → `DOC_TEST- / TEST- prefix S/N 포함`

### 단기 — Sprint 26 실행 (OPS Sprint 52 BE 배포 후)
- 체크리스트 관리 페이지 목업→실제 API 전환
- TM 탭 활성화 + MECH/ELEC 블러

### 단기 — Defensive coding + 사용시간 변경
- ProductionPerformancePage `?? []` 7개소
- AnalyticsDashboardPage usage_minutes → last_access

### 중기 — 사내서버 마이그레이션
- Railway/Netlify → 사내서버 전환
- SAP RFC 연동 가능 환경 구축

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
