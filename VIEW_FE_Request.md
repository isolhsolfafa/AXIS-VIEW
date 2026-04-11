# VIEW FE 작업 요청 목록

> VIEW(React) 프론트엔드에서 구현해야 할 작업 목록.
> BE 수정 완료 후 진행하는 항목은 **BE 선행** 표기.

---

## 상태 범례

| 상태 | 의미 |
|---|---|
| PENDING | 작업 대기 |
| BE 선행 | BE 수정 완료 후 진행 가능 |
| IN PROGRESS | 작업 진행 중 |
| DONE | 완료 |

---

## Sprint 30 — 체크리스트 성적서 ELEC Phase + TM DUAL + SELECT/QI

> BE Sprint: `AXIS-OPS/AGENT_TEAM_LAUNCH.md` Sprint 30-BE
> 설계: `AXIS-VIEW/docs/sprints/DESIGN_FIX_SPRINT.md` Sprint 30

### FE-01. 타입 확장 — `src/types/checklist.ts` [BE 선행]

`ChecklistReportCategory` 필드 추가:
- `phase?: number` — ELEC 전용 (1 또는 2)
- `phase_label?: string` — ELEC: "1차 배선"/"2차 배선", TM DUAL: "L Tank"/"R Tank"
- `qr_doc_id?: string` — TM DUAL: "DOC_xxx-L" / "DOC_xxx-R"

`ChecklistReportItem` 필드 추가:
- `item_type`: `'SELECT'` 유니온 추가
- `selected_value?: string | null` — TUBE 색상 선택값
- `checker_role?: string | null` — 'WORKER' | 'QI'

### FE-02. API 필드 매핑 보정 — `src/api/checklist.ts` [BE 선행]

`getChecklistReport()` 매핑에 추가:
- summary 필드명 불일치 보정: BE `checked` → FE `completed` (`rawSummary.completed ?? rawSummary.checked ?? 0`)
- items: `selected_value`, `checker_role` 매핑 추가

### FE-03. 카테고리 라벨 — `ChecklistReportView.tsx` [BE 선행]

CategoryTable 헤더에 `phase_label` 표시:
```
{CATEGORY_LABEL[cat.category] ?? cat.category}
{cat.phase_label && ` — ${cat.phase_label}`}
```
결과: `전장 — 1차 배선`, `전장 — 2차 배선`, `TM (모듈) — L Tank`, `TM (모듈) — R Tank`

### FE-04. SELECT 타입 판정 렌더링 — `ChecklistReportView.tsx` [BE 선행]

판정 컬럼에 SELECT 분기 추가:
- CHECK → PASS/NA
- INPUT → input_value
- SELECT → selected_value

`resultColor` 함수에도 SELECT 분기 추가.

### FE-05. QI 배지 표시 — `ChecklistReportView.tsx` [BE 선행]

`checker_role === 'QI'` 항목에 QI 배지 표시 (검사항목 컬럼).

---

## #56 — 체크리스트 필수 토글 연동 (실적확인)

> 참조: `AXIS-VIEW/docs/OPS_API_REQUESTS.md` #56

### FE-06. 현재 상태 확인 [PENDING]

- 실적확인 설정 패널의 "체크리스트 필수" 토글: DB 저장/읽기 정상 동작 ✅
- BE `confirmable` 판정에 체크리스트 완료 미반영 (dead toggle) → **BE 선행 필요**
- BE 반영 후 FE 추가 수정 없음 — `confirmable`은 BE 응답값 그대로 사용

### 확인 사항

- [ ] 체크리스트 필수 토글: 전체 공정 일괄 적용인지, 추후 공정별 분리 계획 있는지

---

## #56-API — ELEC 체크리스트 상태 API VIEW 연동

> 참조: `AXIS-VIEW/docs/OPS_API_REQUESTS.md` #56 ELEC 체크리스트 API

### FE-07. `getChecklistStatus()` ELEC 카테고리 허용 — `src/api/checklist.ts` [BE 선행]

현재 TM/TMS만 허용, ELEC은 조기 리턴. beCat 매핑에 ELEC 추가 필요.
- `GET /api/app/checklist/elec/{sn}/status?phase=1`
- `GET /api/app/checklist/elec/{sn}/status?phase=2`

### FE-08. ProcessStepCard ELEC 체크리스트 표시 [BE 선행]

BE에서 ELEC status API 정상 반환 확인 후, 기존 checklist prop 전달 로직으로 자동 표시.
추가 FE 수정 불필요 (확인만).

---

## 기타 PENDING 항목 (OPS_API_REQUESTS.md 참조)

### FE-09. QR 관리 — `elec_start` 날짜 필터 [BE 선행]

> 참조: OPS_API_REQUESTS.md #55-B

- `types/qr.ts`: `QrRecord`에 `elec_start` 필드 추가
- `QrManagementPage.tsx`: 날짜 필터 드롭다운에 "전장시작" 옵션 추가, 테이블 컬럼 추가

### FE-10. 성적서 진행률 — ELEC Phase + TM DUAL 합산 [BE 선행]

> Sprint 30-BE Task 4 완료 후

BE `get_checklist_report_orders()` 수정 시 FE 추가 변경 없음 (overall_percent 값만 사용).
BE 반영 후 정상 표시 확인만 필요.

### FE-11. 성적서 PDF — Phase 2 + DUAL L/R 포함 출력 [BE 선행]

BE에서 categories에 Phase 2, TM L/R 데이터가 내려오면 기존 PDF 생성 로직에서 자동 포함.
레이아웃 깨짐 여부 확인 필요.

---

## 완료 항목

| ID | 내용 | 완료일 |
|---|---|---|
| — | (아직 없음) | — |
