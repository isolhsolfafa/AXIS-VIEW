# AXIS-VIEW Handoff

> 세션 종료 시 업데이트. 다음 세션이 즉시 작업을 이어갈 수 있도록 현재 상태를 기록합니다.
> 마지막 업데이트: 2026-04-22

---

## 🔧 2026-04-21~22 세션 요약 (문서 개정 only — 코드 배포 없음)

> ⚠️ 마이그레이션으로 로컬 Cowork 초기화 → 컨텍스트 전수 재정리 + 규칙·워크플로우 대폭 개정
> ⚠️ 세션 중 `AXIS-VIEW/CLAUDE.md` 파일이 일시 삭제 → git restore로 복구 완료 (원인 불명)

### 문서 개정 내역 (VIEW FE 코드 변경 0)

1. **CLAUDE.md 대폭 개정**:
   - 📏 **코드 크기 원칙** 신설 — 1단계 500/800/1200 + 함수 60줄 + JSX return 100줄 + Custom Hook 80줄
   - 🔄 **DRY 재활용 원칙** 신설 — Rule of Three + grep 선행 + `utils/` `hooks/` `components/ui/` 승격 위치
   - 🛡️ **리팩토링 안전 7원칙** 신설 — `npm run build` Before/After + `[REFACTOR]` prefix + Netlify preview 수동 검증 + BE API 변경 0
   - 🤝 **AI 검증 워크플로우 v2** 전면 교체 — 8단계 파이프라인 + 3주체 용어 + ② Codex 이관 체크리스트 (BE API 계약/타입/인증/TanStack 훅 구조 등) + 침묵 승인 거부 + 1라운드 상한 + 합의 실패 정의(Codex 반박 1회 + Claude 재반박 1회)
   - ⑦ **FE 회귀 테스트 규칙** 신설 — `npm run test --run` + 점진적 커버 영역 (utils/hooks/API 매핑/핵심 페이지) + 신규/변경 파일 테스트 동반
   - 🚨 **긴급 HOTFIX 예외 조항** 신설 — S1/S2 Severity 구분
   - 📦 **버전 번호 규칙** 재정의 (`version.ts` + CHANGELOG + git tag 3곳 동시)
   - 🤖 **모델 버전 관리 규칙** 신설 — `claude-opus-4-7` / `claude-sonnet-4-6`
   - 번들 크기 기준 차등 — 일반 Sprint ±10% / 리팩토링 Sprint ±5%

2. **BACKLOG.md 리팩토링 Sprint 계획 등록**:
   - **7 Sprint** 총 계획 (REF-V-00~06)
   - Phase 1: REF-V-00-UTIL (`formatDate` 공통화 — REFACTOR-FMT-01 완성)
   - Phase 2 🔴: ProductionPerformancePage 895줄 분할 → ~200줄 / QrManagementPage 814줄 → ~150줄
   - Phase 3 🟡: Sidebar 627 / ProductionPlanPage 617 / FactoryDashboardPage 591 / PermissionsPage 535 + EtlChangeLogPage 514
   - 부산물: `components/ui/` 공통 컴포넌트 5종 추출 예정 (FilterBar / DataTable / DateRangePicker / ConfirmDialog / EmptyState)

3. **클린 코어 데이터 원칙 외부 참조** 추가 — OPS BACKLOG.md 링크 (② 체크리스트 6번)

### 🔴 OPS 쪽 알람 장애 발견 (VIEW 영향)

> OPS `ALERT_SCHEDULER_DIAGNOSIS.md` §9 참조 — 4-17 이후 app_alert_logs 0건
> VIEW 영향: 알림 뱃지 / 분석 대시보드 알람 통계 등이 6일간 멈춘 상태

**확정 대기** (다음 세션 최우선):
- Railway 로그 3 문구 확인 → 후보 E (Gunicorn recycling) / F (DB pool) 확정
- 긴급 HOTFIX 배포 (OPS 쪽 작업, VIEW는 대기)

### 📌 신규 세션(4.7) 시작 시 참조 순서

1. `~/Desktop/GST/AXIS-VIEW/CLAUDE.md` (VIEW 규칙·워크플로우 전문)
2. `~/Desktop/GST/AXIS-OPS/CLAUDE.md` (공유 원칙 + BE API 계약)
3. `~/Desktop/GST/AXIS-VIEW/handoff.md` (이 파일 — 최신 상태)
4. `~/Desktop/GST/AXIS-OPS/handoff.md` (OPS 상태)
5. `~/Desktop/GST/AXIS-OPS/ALERT_SCHEDULER_DIAGNOSIS.md` (알람 장애 진단)
6. `~/Desktop/GST/AXIS-VIEW/BACKLOG.md` / `~/Desktop/GST/AXIS-OPS/BACKLOG.md` (리팩토링 Sprint 계획)

---

## 현재 버전

- **VIEW FE**: v1.35.0 (main 배포 완료, 2026-04-23)
- **최근 작업**: Sprint 35 Phase 2 머지 + BE Sprint 62-BE **v2.3 교정 요청** (weekly-kpi WHERE 절 원안 복원)
- **최근 완료**: v1.35.0 (Phase 2), OPS_API_REQUESTS #62 v2.3 AMENDED

### ⚠️ BE Sprint 62-BE v2.3 추가 교정 요청 중 (2026-04-23)
FE v2 작성 단계에서 설계 원안(Twin파파 요구 #6)을 뒤집은 1조항 복원 요청:
- **weekly-kpi WHERE 절**: `ship_plan_date` → `finishing_plan_end` 교정 (factory.py L322)
- **FE 측 변경 없음** — BE 1줄 교정 시 자동 반영 (weekly.production_count 기준 변경)
- **영향**: 주간 생산량/완료율/모델별/스테이지별 숫자 전부 finishing_plan_end 기반으로 변경
- 상세: `OPS_API_REQUESTS.md #62 v2.3` 섹션 참조

### ✅ Sprint 35 Phase 2 (v1.35.0) 구현 완료 (feat/sprint-35-phase-2 브랜치)
- [x] `api/factory.ts`: 3필드 + 2타입 + date_field 쿼리 파라미터
- [x] `KpiSwipeDeck.tsx`: TEMP-HARDCODE 제거 + shippedBasis 매핑 + pickShipped 헬퍼
- [x] `FactoryDashboardSettingsPanel.tsx` 신규 (~170 LOC): 3+4 옵션 토글 + localStorage
- [x] `FactoryDashboardPage.tsx`: 설정 아이콘 + Panel 연동 + localStorage state 2개
- [x] localStorage 키: `axis_view_factory_shipped_basis` / `axis_view_factory_monthly_date_field`
- [x] version.ts v1.35.0 + CHANGELOG 섹션

### 🔜 BE v2.2 배포 완료 시 즉시 실행 (Phase 2 머지)
```bash
git checkout main
git merge --no-ff feat/sprint-35-phase-2
git tag v1.35.0
git push origin main && git push origin v1.35.0
```
- 상세 설계: `DESIGN_FIX_SPRINT.md` Sprint 35 "Phase 2" 섹션
- 배포 전 Netlify preview 검증 권장 (CLAUDE.md ⑧ 단계)
- **✅ 확정 기준 (영구)**: 생산 현황 상세 테이블 / 월간 생산 지표 차트 / 상단 스와이프 월간 ProductionChart **3영역은 mech_start 기준 유지**
- **🔧 Sprint 36 예정**: 출하 완료 카드 토글 (실시간/실적/계획) + 월간 생산량 카드 토글 (기본 mech_start, 4옵션)
- **⚠️ BE Sprint 62-BE 배포 시 필수 제거**: `KpiSwipeDeck.tsx` 모듈 상수 3개(`TEMP_WEEKLY_SHIPPED=11` / `TEMP_MONTHLY_PRODUCTION=215` / `TEMP_MONTHLY_SHIPPED=76`) + 3개 카드 value prop 원복 (date_field는 건드리지 않음)

---

## 직전 세션 작업 내용 (2026-04-22 Sprint 35)

### v1.34.0 — Sprint 35 공장 대시보드 KPI 주간/월간 스와이프 덱
1. **KPI 덱 신규**: 4카드(생산량·완료율·불량·출하) 주간/월간 스와이프 + 세그먼트 토글 + 점 indicator — CSS scroll-snap (의존성 0)
2. **β'안 완료율**: 월간 뷰에서 메인 값 `—` + 서브텍스트 `"주간 값: 68% (W14)"` — 오독 방지 (Codex M1)
3. **기준 통일**: monthly-detail 조회 `mech_start` → `finishing_plan_end`, 테이블 정렬은 mech_start 유지 (Codex M2)
4. **첫 스와이프 UX**: `useMonthlyKpi`에 `placeholderData: keepPreviousData` (Codex M3)
5. **공용 컴포넌트 추출**: `KpiCard` / `KpiSwipeDeck` / `ProductionChart` 3개 신규 — 기존 인라인 KPI 렌더 교체 (DRY)
6. **pipeline.shipped → shipped_count 마이그레이션** (Codex H3) — BE Sprint 62-BE 배포 이후 실숫자 표시
7. **BE 선행 필요**: OPS Sprint 62-BE (`monthly-kpi` 신설 + `weekly-kpi` shipped_count/defect_count + `_ALLOWED_DATE_FIELDS` 확장)
8. **교차검증**: Codex 7건 + Claude 추가발견(KpiCard 추출) 전건 반영
9. **빌드/테스트 GREEN**: 3282 modules / 2.34s + Vitest 2 files / 30 tests / 414ms

### Sprint 35 환경 이슈 (참고 기록)
- **증상**: PC 재셋팅 후 빌드 5m 49s + vitest 60s worker timeout
- **원인**: stale node_modules (이전 Mac에서 install된 native binary + iCloud 동기화 충돌본 " 2.js" 22개)
- **해결**: `rm -rf node_modules && npm ci` → 738 packages / 6s → 정상화 (빌드 2.34s 복귀)

---

## 과거 세션 작업 내용 (2026-04-20)

### v1.33.0 — Sprint 34 S/N 상세뷰·O/N 헤더 정보 보강
1. **FE-20 카테고리 담당 회사명**: ProcessStepCard 헤더에 `· {partner}` 접미 (MECH/ELEC/TMS만, NULL 방어)
2. **FE-21 고객사 line 노출**: O/N 카드 헤더 + S/N 상세뷰 헤더. 혼재 O/N은 대표값 + "외 N" (NULL row 제외)
3. **SNProduct flat 확장**: `mech_partner`/`elec_partner`/`module_outsourcing`/`line` 4필드 optional
4. **SNStatusPage groupedByON**: `lineLabel` 집계 추가 (최빈값 + "외 N", NULL row 제외)
5. **BE 미배포 안전 degrade**: 4필드 undefined 시 현행 UI와 동일 동작
6. **교차검증**: Claude↔Codex 2라운드 합의 (v3 M1+A8, v4 M1+A6) 반영
7. **빌드 GREEN**: 3279 modules, 2.96s

---

### v1.32.3 — FE-19.1 용어 정합 (강제종료 툴팁 문구 보정)
1. **원안 폐기**: placeholder row 접두어 추가 설계는 v1.32.1 데드 코드 정리 단계에서 타겟 JSX가 이미 제거됨 → 타겟 없음
2. **Claude↔Codex 교차검증 합의**: 스코프 축소 → 툴팁 `종료:` → `종료 처리:` 1단어 교체 (Option A+B)
3. **수정 파일**: `ProcessStepCard.tsx` L224 `data-tooltip` 템플릿 내 `종료:` → `종료 처리:`
4. **근거**: 클린 코어 원칙 #4 UI 책임 — `🔒 종료 처리:` 용어 정합 확보, "작업 종료 시각" 오독 방지
5. **회귀 위험**: 매우 낮음 (CSS `data-tooltip` + pre-line 방식이라 1단어 증가가 줄바꿈·말풍선 폭에 최소 영향 가능성, 스테이징 육안 검증으로 해소)
6. **빌드 GREEN**: 3279 modules, 2.72s

---

## 과거 세션 작업 내용 (2026-04-18 후반부)

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

> 전체 목록: `OPS_API_REQUESTS.md` (#1~#62)
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
