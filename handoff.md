# AXIS-VIEW Handoff

> 세션 종료 시 업데이트. 다음 세션이 즉시 작업을 이어갈 수 있도록 현재 상태를 기록합니다.
> 마지막 업데이트: 2026-04-10

---

## 현재 버전

- **VIEW FE**: v1.26.0
- **최근 Sprint**: 30 (비활성화 권한 + 성적서 ELEC Phase/TM DUAL)
- **최근 완료**: Sprint 29 (QR 전장시작), Sprint 30 (비활성화 + 성적서 확장)

---

## 직전 세션 작업 내용 (2026-04-03)

### Sprint 28 — 체크리스트 성적서 페이지
1. **신규 페이지**: ChecklistReportPage (O/N·S/N 검색 → 성적서 뷰)
2. **신규 컴포넌트**: ChecklistReportView (카테고리별 테이블 + PDF export)
3. **API**: searchSNList, getChecklistReport (BE #54 직접 호출)
4. **BE→FE 필드 매핑**: check_result→result, checked_by_name→worker_name, value→input_value
5. **GST 로고 적용**: gst-logo.png import, 헤더 로고(좌)+타이틀(중앙) 레이아웃
6. **라우트**: /partner/report (admin, manager)
7. **사이드바**: 협력사 관리 > 체크리스트 탭

### 생산실적 개선
8. **폰트 증가**: 전체 +2px (7→9, 9→11, 10→12, 10.5→12)
9. **명칭 수정**: "기전" → "기구·전장" (MonthlyCalendarView 2곳)
10. **기본뷰 변경**: weekly → monthly (월마감 캘린더가 기본)
11. **월마감 캘린더 대기/확인 이중 카운트**: completed-confirmed=대기(주황), confirmed=확인(초록)
12. **ISO 주차 버그 수정**: getISOWeek yearStart Jan 4 → Jan 1 (W14가 W13으로 밀리던 버그)
13. **하드코딩 제거**: "2026-03 마감 전" 배지, 중복 월 텍스트 삭제

### 사이드바 배지
14. **생산실적**: preparing 제거 (운영 중)
15. **체크리스트**: preparing 추가 → 이후 제거 (운영 전환)

### 체크리스트 400 에러 수정
16. **월별 자동 로드 제거**: BE month 파라미터 미지원 → 검색 전용 UI로 복원

### QR 관리 개선
17. **QR 이미지 모달**: Doc ID 클릭 → QR 코드 이미지 모달 (O/N + QR + S/N 라벨 레이아웃)
18. **인쇄 기능**: 모달 내 인쇄 버튼 → 새 창 열어 브라우저 인쇄
19. **의존성 추가**: `qrcode` 패키지 (QR 코드 FE 생성, 에러정정 M레벨)

### 이름 마스킹
20. **maskName 공통 유틸**: `utils/format.ts` — 한글 이름 마스킹 (임지후→임*후)
21. **적용 범위**: ProcessStepCard (디테일뷰) + SNCard (카드 목록)

---

## 진행 중 Sprint

없음 — Sprint 28 구현 완료

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

> 전체 목록: `docs/OPS_API_REQUESTS.md` (#1~#54)

---

## 파일 참조 가이드

| 파일 | 용도 | 읽는 시점 |
|------|------|-----------|
| `CLAUDE.md` | 프로젝트 고정 정보 (팀 구성, 기술 스택, 규칙) | 매 세션 시작 시 |
| `memory.md` | 누적 의사결정, 버그 분석, 아키텍처 판단 | 맥락 필요 시 |
| `handoff.md` | 현재 파일. 세션 인계용 | 매 세션 시작 시 |
| `docs/sprints/DESIGN_FIX_SPRINT.md` | Sprint 1~28 메인 스프린트 문서 | Sprint 기획/실행 시 |
| `docs/OPS_API_REQUESTS.md` | BE API 요청/이슈 (#1~#54) | BE 의존 작업 시 |
| `docs/APS_LITE_PLAN.md` | APS Lite 기획서 (차세대) | APS 작업 시 |
| `docs/sprints/RESPONSIVE_DESIGN_PLAN.md` | 반응형 설계 v2 | 반응형 작업 시 |

---

## 다음 세션에서 할 일 (제안)

### 즉시 — BE #53 수정 후 월마감 캘린더 검증
- weeks/totals 집계가 채워지면 대기/확인 카운트 정상 표시 확인
- W14 6905 전장 완료건 → "대기 1" 표시 검증

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
