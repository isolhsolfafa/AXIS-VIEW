# AXIS-VIEW Handoff

> 세션 종료 시 업데이트. 다음 세션이 즉시 작업을 이어갈 수 있도록 현재 상태를 기록합니다.
> 마지막 업데이트: 2026-04-16

---

## 현재 버전

- **VIEW FE**: v1.29.0
- **최근 Sprint**: QR 개선 (전장협력사 컬럼 + 필터)
- **최근 완료**: v1.28.0 (생산일정 업체 필터 + 체크리스트 ELEC), v1.29.0 (QR 전장협력사)

---

## 직전 세션 작업 내용 (2026-04-16)

### QR 관리 — 전장협력사
1. **전장협력사 컬럼**: 테이블에 elec_partner 컬럼 추가 (고객사 뒤)
2. **전장협력사 필터**: 드롭다운 필터 (TMS(E), P&S, C&A 등 데이터에서 자동 추출)
3. **FE 필터**: 선택한 전장협력사만 테이블에 표시
4. **초기화 연동**: 초기화 버튼 시 전장협력사 필터도 리셋

---

## 진행 중 Sprint

없음 — v1.29.0 배포 완료

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

> 전체 목록: `OPS_API_REQUESTS.md` (#1~#58)
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

### 즉시 — VIEW FE 연동 (BE Sprint 58-BE 완료됨)
- FE-12: ELEC 블러 해제 (`BLUR_CATEGORIES`에서 'ELEC' 제거)
- FE-07: `getChecklistStatus()` ELEC beCat 매핑 + /status 엔드포인트 연동
- FE-08: ProcessStepCard/SNDetailPanel 자동 동작 (FE-07 의존)
- **테스트**: 실적확인 토글 OFF(progress 100%) / ON(progress+체크리스트) 동작 검증

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
