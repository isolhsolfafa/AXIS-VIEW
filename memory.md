# AXIS-VIEW Memory

> 세션 간 누적되는 의사결정, 버그 분석, 아키텍처 판단을 기록합니다.
> CLAUDE.md = 프로젝트 고정 정보 / memory.md = 누적 학습 / handoff.md = 세션 인계
> 마지막 업데이트: 2026-03-29

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

**수정 방향**: Sprint 22에서 `categoryPercent` prop 기반으로 통일 (ADR-V004 참조)

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
- **페이지**: 19개
- **컴포넌트**: layout 5개, sn-status 4개, checklist 3개, attendance 7개, auth 1개, ui 13개
- **API 클라이언트**: 14개
- **훅**: 18개 (TanStack Query 기반)
- **타입 정의**: 7개
- **테스트**: 2개 파일만 (vitest 설치됨, 커버리지 낮음)
- **Sprint 이력**: 1~22 (+ 18-B, 18-C, 19 HOTFIX, 40-C, 40-C+)

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
