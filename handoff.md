# AXIS-VIEW Handoff

> 세션 종료 시 업데이트. 다음 세션이 즉시 작업을 이어갈 수 있도록 현재 상태를 기록합니다.
> 마지막 업데이트: 2026-04-02

---

## 현재 버전

- **VIEW FE**: v1.21.0
- **최근 Sprint**: 27 (월마감 캘린더 뷰) — 설계 완료, 코드 미작성
- **최근 완료**: Sprint 26 (체크리스트 BE 연동), Sprint 25 (페이지별 설정 패널)

---

## 직전 세션 작업 내용 (2026-04-02)

1. **ProcessStepCard 날짜 표시 수정** — formatTime: `HH:mm` → `MM/DD HH:mm` (배포 완료)
2. **Sprint 26 구현 완료** — 체크리스트 관리 목업→BE 연동, TM 활성화, MECH/ELEC 블러
3. **타입 필드 매핑 변경** — inspection_group→item_group, spec_criteria+inspection_method→description
4. **활성 토글 UX 개선** — confirm 다이얼로그 + sonner 토스트 알림 추가
5. **HOTFIX: 비활성 포함 체크박스** — BE에 `include_inactive` 파라미터 미전달 → 수정
6. **HOTFIX: S/N 디테일뷰 크래시** — checklist.summary undefined → 옵셔널 체이닝 방어
7. **HOTFIX: S/N 체크리스트 조회 분기** — TM만 실제 API, MECH/ELEC 빈 응답 (BE 미구현)
8. **HOTFIX: S/N 체크리스트 BE 엔드포인트** — 경로 매핑 + TMS→TM + 응답 구조 변환
9. **월마감 뷰 크래시 수정** — `monthlyData.weeks` undefined → `monthlyData?.weeks` 옵셔널 체이닝
10. **작업자 이름 마스킹** — maskName() 한글 개인정보 보호 (임지후→임*후)
11. **Sprint 27 설계 완료** — 월마감 캘린더 뷰 (달력 UI, 주차 클릭→주간 전환, 기전/TM 분류)

---

## 진행 중 Sprint

없음 — Sprint 27 설계 완료, 코드 미작성 (사용자 승인 대기)

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

## 금일 수정 완료 건 (2026-04-02)

| # | 내용 | 파일 |
|---|------|------|
| — | ProcessStepCard 날짜 표시 (MM/DD HH:mm) | ProcessStepCard.tsx |
| — | Sprint 26 Phase 1: API 전환 + 타입 수정 | checklist.ts, types/checklist.ts, useChecklistMaster.ts |
| — | Sprint 26 Phase 2: UI 수정 | ChecklistManagePage, FilterBar, Table, AddModal |
| — | 활성 토글 확인 다이얼로그 + 토스트 | ChecklistManagePage.tsx, ChecklistTable.tsx |
| — | 비활성 포함 → BE include_inactive 전달 | checklist.ts, useChecklistMaster.ts, ChecklistManagePage.tsx |
| — | S/N 디테일뷰 summary 크래시 수정 | ProcessStepCard.tsx |
| — | S/N 체크리스트 TM/MECH 분기 | checklist.ts |

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

### 즉시 — Sprint 26 수동 테스트 (Phase 3)
- TM 탭 → COMMON 자동 → 15개 항목 (4그룹) BE 데이터 확인
- MECH/ELEC 블러 오버레이 동작 확인
- 항목 추가/토글 API 호출 확인
- ⚙️ TM 체크리스트 설정 패널 BE 저장/조회 확인

### 단기 — Defensive coding + 사용시간 변경
- ProductionPerformancePage `?? []` 7개소
- AnalyticsDashboardPage usage_minutes → last_access

### 중기 — MECH/ELEC 체크리스트 활성화
- 항목 확정 후 블러 해제 (별도 Sprint)

### 중기 — 사내서버 마이그레이션
- Railway/Netlify → 사내서버 전환

### 장기 — APS Lite
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
