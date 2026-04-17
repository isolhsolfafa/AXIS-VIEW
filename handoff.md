# AXIS-VIEW Handoff

> 세션 종료 시 업데이트. 다음 세션이 즉시 작업을 이어갈 수 있도록 현재 상태를 기록합니다.
> 마지막 업데이트: 2026-04-18

---

## 현재 버전

- **VIEW FE**: v1.32.2
- **최근 작업**: FE-19.2 후속 (툴팁 즉시 반응)
- **최근 완료**: v1.32.0 (HOTFIX-04/FE-19), v1.32.1 (per-row 표시), v1.32.2 (툴팁 즉시 반응)

---

## 직전 세션 작업 내용 (2026-04-18 후반부)

### v1.32.2 — FE-19.2 후속 (툴팁 즉시 반응)
1. **이슈**: v1.32.1 툴팁이 HTML 기본 `title` 속성 기반이라 500~700ms 딜레이
2. **해결**: CSS `.fc-tooltip` + `data-tooltip` 패턴 — `:hover::after/::before`로 즉시 렌더
3. **index.css**: 재사용 가능 공통 툴팁 CSS 추가 (--gx-charcoal 배경 + 화살표 + pre-line)
4. **ProcessStepCard 강제종료 상태 컬럼**: `title` → `className="fc-tooltip"` + `data-tooltip` 교체

---

### v1.32.1 — FE-19.1 후속 (per-row 강제종료 표시)
1. **문제**: v1.32.0의 `workers.length === 0` placeholder JSX가 실제 렌더 경로(SNDetailPanel 항상 placeholder 주입)에서 데드 코드로 확인됨 → 카드 레벨 `🔒 강제종료` 뱃지만 표시되어 row별 식별 불가
2. **TaskWorker 타입 확장**: `force_closed?` / `close_reason?` / `closed_by_name?` / `force_closed_at?` 4필드 추가
3. **SNDetailPanel 병합 로직**: 실제 worker + placeholder worker 양쪽에 부모 task의 force_closed 필드 전파
4. **ProcessStepCard 상태 컬럼**: `force_closed` 시 `미시작`/`시간 범위` → `🔒 강제종료 mm/dd hh:mm`으로 대체 + `title` 툴팁(사유/처리자/종료)
5. **강제종료 버튼 guard**: `!w.force_closed` 조건 추가 — 이미 종료된 row에서 버튼 중복 방지
6. **데드 코드 제거**: v1.32.0의 workers=[] placeholder JSX 삭제
7. **Sprint 기록**: `DESIGN_FIX_SPRINT.md`에 HOTFIX-04 — FE-19 섹션 작성 (v1.32.0 + v1.32.1 2단계 회고 포함)
8. **빌드 GREEN**: 3279 modules, 2.53s

### v1.32.0 — HOTFIX-04 / FE-19 강제종료 표시 누락 보정
1. **선행 리팩토링**: `ChecklistReportView.tsx` 로컬 `formatDateTime` → `utils/format.ts`로 승격 (REFACTOR-FMT-01 1/3)
2. **타입 확장**: `SNTaskDetail`에 `close_reason?`, `closed_by_name?`, `completed_at?` 3필드 추가
3. **ProcessStepCard.tsx**: `taskStatus()` L55 force_closed 분기, L178 workers=[] placeholder JSX (처리자 마스킹 + 종료시각 + 사유) + `formatDateTime` import
4. **Guard 조건**: `task.closed_by_name && ...`, `task.close_reason && ...` — legacy(`closed_by IS NULL`) 안전 degrade
5. **문서 정리**: VIEW_FE_Request.md FE-19 DONE 마킹 + CLAUDE.md Sprint 이력 등재 + CHANGELOG v1.32.0 섹션
6. **BE 선행**: AXIS-OPS HOTFIX-04 v2.9.8 배포 완료 (task 응답에 3키 추가)
7. **검증 대기**: 스테이징 배포 후 Case 2(미시작 강제종료) placeholder 육안 확인

### v1.31.0 — Sprint 33 미종료 작업 관리
1. **타입 확장**: TaskWorker.company, SNTaskDetail.force_closed 추가
2. **useForceClose 신규**: PUT force-close mutation
3. **SNDetailPanel**: 미시작 placeholder 주입, getPendingCounts (task dedup + allTasks), 배지 전달
4. **ProcessStepCard**: 강제종료 모달 + 버튼, 행 레벨 권한, 🔒 뱃지, status 정규화
5. **SNStatusPage**: canForceClose, currentUserCompany, isAdmin props 전달
6. **모델명 레이아웃**: maxWidth 180px, wordBreak keep-all, lineHeight 1.4
7. **Codex 교차 검증**: placeholder 미주입, 카운트 dedup, checklist 배지 미전달, 모달 form 잔존

---

## 진행 중 Sprint

없음 — v1.31.0 배포 완료

---

## 실행 대기 Sprint (설계 완료, 코드 미작성)

### 1순위: 사용시간 → 최근접속 변경
- AnalyticsDashboardPage.tsx: usage_minutes → last_access 표시 변경

### 2순위: Defensive coding `?? []`
- ProductionPerformancePage.tsx: 7개소 옵셔널 체이닝 보강

---

## 미해결 버그 / BE 대기

| ID | 설명 | 심각도 | 상태 |
|----|------|--------|------|
| BUG-V2 | ProductionPerformancePage `?? []` 미적용 (7개소) | 🟡 LOW | FE 대기 |
| ~~#53~~ | ~~monthly-summary weeks/totals~~ | ~~HIGH~~ | ✅ BE Sprint 53 완료·테스트 통과 |

---

## OPS BE 미해결 요청 (VIEW 의존)

| # | 설명 | 상태 | 영향 |
|---|------|------|------|
| #18 | factory.py weekly-kpi 주차 계산 오류 | PENDING | 공장 대시보드 |
| #45 | 카드뷰 last_worker에 task 이름 추가 | PENDING | S/N 카드뷰 |
| #47 | QR 명판 인식 — qrbox 200 적용 | PENDING | OPS FE |
| #52 | ETL _FIELD_LABELS에 finishing_plan_end 누락 | PENDING | 마무리계획일 |
| ~~#53~~ | ~~monthly-summary weeks/totals 집계~~ | ✅ **DONE** | 월마감 캘린더 |
| ~~#54~~ | ~~체크리스트 성적서 API 2건~~ | ✅ BE Sprint 54 완료·테스트 통과 | 체크리스트 페이지 |
| ~~#56~~ | ~~ELEC API 문서 오류 + confirmable dead toggle~~ | ✅ **BE Sprint 58-BE 완료** | 실적확인 체크리스트 연동 (FE 연동 대기) |
| #57 | 성적서 API ELEC Phase + TM DUAL | ✅ BE Sprint 30-BE 완료 | 성적서 페이지 |
| #58 | checklist_master remarks 컬럼 | PENDING | 체크리스트 관리 비고 |
| #59-A | POST 시 JIG WORKER+QI 2 row 자동 생성 | PENDING | Sprint 32 AddModal |
| #59-B | GET master 응답에 checker_role 포함 | PENDING | Sprint 32 테이블 역할 뱃지 |
| #59-C | UNIQUE 키에 checker_role 포함 | PENDING | #59-A 선행 조건 |
| #60 | S/N task 응답에 company 필드 추가 | PENDING | Sprint 33 행 레벨 권한 |
| #61 | S/N task 응답에 force_closed 필드 추가 | PENDING | Sprint 33 강제종료 뱃지 |

> 전체 목록: `OPS_API_REQUESTS.md` (#1~#61)
> FE 태스크: `VIEW_FE_Request.md` (FE-01~FE-14)

---

## 파일 참조 가이드

### 필수 (매 세션)
| 파일 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 고정 정보 (팀 구성, 기술 스택, 규칙, 페이지 목록) |
| `handoff.md` | 현재 파일. 세션 인계용 (현재 상태, 대기 Sprint, 미해결 버그) |
| `memory.md` | 누적 의사결정(ADR), 버그 분석, 아키텍처 판단 |

### Sprint 작업 시
| 파일 | 용도 |
|------|------|
| `DESIGN_FIX_SPRINT.md` | Sprint 1~30 메인 스프린트 문서 |
| `OPS_API_REQUESTS.md` | BE API 요청/이슈 (#1~#57) |

### 릴리스/문서 업데이트 시
| 파일 | 용도 |
|------|------|
| `app/src/version.ts` | 버전 + 빌드 날짜 + 이력 주석 |
| `CHANGELOG.md` | 릴리스별 변경 내역 |
| `PROGRESS.md` | 완료된 Sprint 이력 (상세) |
| `BACKLOG.md` | 보류/계획/아이디어 + 디지털트윈 기획 |

### 참조
| 파일 | 용도 |
|------|------|
| `docs/APS_LITE_PLAN.md` | APS Lite 기획서 (차세대) |
| `docs/sprints/RESPONSIVE_DESIGN_PLAN.md` | 반응형 설계 v2 |
| `docs/API_INTEGRATION_REVIEW.md` | API 통합 리뷰 |

---

## 다음 세션에서 할 일 (제안)

### 즉시 — BE 패치 대기
- Sprint 32: #59-C → #59-A → #59-B 순서로 BE 패치 → 체크리스트 ELEC 전체 기능 검증
- Sprint 33: #60 (company) + #61 (force_closed) → 미종료 강제종료 실데이터 검증

### 단기 — 기타 FE 작업
- Defensive coding `?? []` 7개소 (ProductionPerformancePage)
- AnalyticsDashboardPage usage_minutes → last_access
- FE-13: checklist_master remarks 컬럼 (BE #58 완료 후)

### 중기 — MECH 체크리스트 + 사내서버
- MECH 체크리스트 BE 구현 → completion 함수 일괄 리팩토링 (TM/ELEC/MECH public 인터페이스)
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
