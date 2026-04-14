# VIEW FE 작업 요청 목록

> VIEW(React) 프론트엔드에서 구현해야 할 작업 목록.
> BE 수정 완료 후 진행하는 항목은 **BE 선행** 표기.
> 마지막 업데이트: 2026-04-11

---

## 상태 범례

| 상태 | 의미 |
|---|---|
| PENDING | 작업 대기 |
| BE 선행 | BE 수정 완료 후 진행 가능 |
| IN PROGRESS | 작업 진행 중 |
| DONE ✅ | 완료 |

---

## 성적서 ELEC Phase + TM DUAL + SELECT/QI

> BE Sprint: `AXIS-OPS/AGENT_TEAM_LAUNCH.md` Sprint 30-BE (성적서 API) + Sprint 58-BE (completion + confirmable)
> VIEW Sprint: TBD (BE 완료 후 배정)

### FE-01. 타입 확장 — `src/types/checklist.ts` [BE 선행] ✅ DONE

`ChecklistReportCategory` 필드 추가:
- `phase?: number` — ELEC 전용 (1 또는 2)
- `phase_label?: string` — ELEC: "1차 배선"/"2차 배선", TM DUAL: "L Tank"/"R Tank"
- `qr_doc_id?: string` — TM DUAL: "DOC_xxx-L" / "DOC_xxx-R"

`ChecklistReportItem` 필드 추가:
- `item_type`: `'SELECT'` 유니온 추가
- `selected_value?: string | null` — TUBE 색상 선택값
- `checker_role?: string | null` — 'WORKER' | 'QI'

> 비고: `types/checklist.ts`에 이미 반영 완료 (Sprint 28에서 선제 타입 정의)

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

## 체크리스트 필수 토글 연동 (실적확인)

> 참조: `OPS_API_REQUESTS.md` — 별도 번호 미배정 (BE 확인 후 배정)

### FE-06. 현재 상태 확인 [BE 선행]

- 실적확인 설정 패널의 "체크리스트 필수" 토글: DB 저장/읽기 정상 동작 ✅
- BE `confirmable` 판정에 체크리스트 완료 미반영 (dead toggle) → **BE 선행 필요**
- BE 반영 후 FE 추가 수정 없음 — `confirmable`은 BE 응답값 그대로 사용

> **코드 검토 결과 (2026-04-11)**:
> - `_is_process_confirmable()` (production.py L169): task progress만 확인, 체크리스트 미참조
> - `_CONFIRM_TASK_FILTER`: ELEC 카테고리 미등록 → ELEC S/N은 confirmable 판정 대상 자체에서 누락
> - `check_elec_completion()`: 단일 phase만 확인 → Phase 1(17)+Phase 2(24)=41건 합산 필요
> - `completion_status.elec_completed`: Dual-Trigger에서 설정하지만 confirmable이 읽지 않음
> - **BE 수정 Sprint**: `AXIS-OPS/AGENT_TEAM_LAUNCH.md` Sprint 58-BE (4 Tasks / 22 TCs)

---

## OPS #56 — ELEC 체크리스트 상태 API VIEW 연동

> 참조: `OPS_API_REQUESTS.md` #56

### FE-07. `getChecklistStatus()` ELEC 카테고리 허용 — `src/api/checklist.ts` [BE 선행]

현재 TM/TMS만 허용, ELEC은 조기 리턴. beCat 매핑에 ELEC 추가 필요.
- `GET /api/app/checklist/elec/{sn}/status?phase=1`
- `GET /api/app/checklist/elec/{sn}/status?phase=2`

> ⚠️ **주의**: ELEC `/status` 엔드포인트는 현재 BE에 미존재. Sprint 58-BE Task 4에서 신규 생성 예정.
> 대안: 기존 상세 조회(`/api/app/checklist/elec/{sn}?phase=`)에서 FE가 count 파생.

### FE-08. ProcessStepCard ELEC 체크리스트 표시 [BE 선행]

BE에서 ELEC status API 정상 반환 확인 후, 기존 checklist prop 전달 로직으로 자동 표시.
추가 FE 수정 불필요 (확인만).

### FE-12. 체크리스트 관리 ELEC 블러 해제 — `ChecklistManagePage.tsx` [BE 선행]

현재 `BLUR_CATEGORIES = new Set(['MECH', 'ELEC'])` → ELEC 제거.
BE 마스터 API(`GET /api/admin/checklist/master?category=ELEC&product_code=COMMON`) 정상 확인 후 진행.
항목 추가/활성 토글도 TM과 동일 로직으로 동작 (FE 추가 수정 없음).

---

## OPS #58 — checklist_master 비고(remarks) 컬럼

> 참조: `OPS_API_REQUESTS.md` #58

### FE-13. 비고 컬럼 추가 [BE 선행]

- `types/checklist.ts`: `ChecklistMasterItem`에 `remarks: string | null` 추가
- `CreateMasterPayload`, `UpdateMasterPayload`에 `remarks?: string` 추가
- `ChecklistTable.tsx`: 헤더 + 셀에 비고 컬럼 추가
- `ChecklistAddModal.tsx`: 비고 입력 필드 추가

---

## 기타 PENDING 항목

(현재 없음)

---

## VIEW Sprint 30 — 비활성화 권한 분기 + 422 에러 처리

> 설계: `AXIS-VIEW/docs/sprints/DESIGN_FIX_SPRINT.md` Sprint 30
> BE 추가 요청 없음 (기존 API 활용)

### FE-14. Admin/Manager 비활성화 분기 — `PermissionsPage.tsx` [PENDING]

- Admin: `confirm()` → `POST /api/admin/worker-status` (즉시 비활성화), 전체 사용자 대상
- Manager: `prompt()` 사유 → `POST /api/app/work/request-deactivation` (admin 승인 대기), 같은 회사만
- 422 `NO_CHANGE` → "이미 비활성화 요청된 사용자입니다" 에러 메시지 개선

---

## 완료 항목

| ID | 내용 | 완료일 |
|---|---|---|
| FE-01 | 타입 확장 — ChecklistReportCategory/Item 필드 추가 (types/checklist.ts) | 2026-04-03 |
| FE-09 | QR 관리 — elec_start 날짜 필터 (헤더/드롭다운/컬럼 추가 + 셀 매핑 버그 수정) | 2026-04-11 |
| FE-11 | 성적서 PDF — Phase 2 + DUAL L/R 포함 출력 (categories.map 구조로 자동 포함, 레이아웃 확인 완료) | 2026-04-11 |
| FE-10 | 성적서 S/N 카드 진행률 — 현재 기준 정상 (MECH 추가 시 재확인 필요) | 2026-04-11 |
