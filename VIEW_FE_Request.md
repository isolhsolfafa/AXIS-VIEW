# VIEW FE 작업 요청 목록

> VIEW(React) 프론트엔드에서 구현해야 할 작업 목록.
> BE 수정 완료 후 진행하는 항목은 **BE 선행** 표기.
> 마지막 업데이트: 2026-04-17

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

## VIEW Sprint 33 — 미종료 작업 관리 (SNStatusPage 확장)

> BE 선행: `AXIS-OPS/AGENT_TEAM_LAUNCH.md` Sprint 61-BE (Task 3: API 확장)
> 목적: Admin/Manager가 VIEW 대시보드에서 미종료 + 미시작 task를 확인하고 강제 종료 가능
> 관련 OPS 화면: `manager_pending_tasks_screen.dart` (OPS에만 존재, VIEW에는 미구현)

### 교차 검증 결과 (Claude × Codex, 2026-04-17)

**M 등급 (필수 수정) — 2건 BE 선행**:

| # | 이슈 | 검증 결과 | 조치 |
|---|------|-----------|------|
| 1 | BE force-close API 미확인 | ✅ **이미 존재**: `PUT /api/admin/tasks/<int:task_id>/force-close` (admin.py L1061) | BE 신규 불필요. FE 연결만 |
| 2 | task_detail_id 모호 | ⚠️ 라우트 파라미터명은 `task_id` (= app_task_details.id) | 설계서에 `{task_id}` = app_task_details.id 명시 |
| 4 | 미시작 task 데이터 소스 | ✅ `GET /api/app/tasks/{sn}` 이미 전체 task 반환 (workers=[] 포함) | **BE 수정 불필요**. FE flatMap 처리만 (M→A 하향) |
| 6 | 행 레벨 권한 (company) 미지원 | ❌ pending 응답에 company 필드 없음 | **BE 추가 필요**: 응답에 `company` 또는 `can_force_close` 필드 |
| 7 | 강제종료 상태 구분 불가 | ⚠️ pending은 `WHERE force_closed=FALSE`라 불필요. S/N 상세에서만 필요 | **BE 추가 필요**: S/N task 응답에 `force_closed` 필드 추가 (범위 한정) |

**A 등급 (권고)**:

| # | 이슈 | 조치 |
|---|------|------|
| 3 | DateTimePicker 없음 | `<input type="datetime-local">` 네이티브로 대체 |
| 5 | FE-16 범위 혼재 | Sprint 33 = FE-15만. FE-16은 별도 Sprint으로 분리 |
| 8 | ProcessStepCard status enum 호환 | 현재 `'completed' \| 'in_progress' \| 'waiting'` 3종. `'not_started'` → `'waiting'`으로 매핑하는 정규화 어댑터 필요 |

**BE 선행 조건 정리 (실제 2건)**:

| # | BE 요청 | 상세 |
|---|---------|------|
| 1 | pending/task 응답에 `company` 필드 추가 | Manager 행 레벨 권한 필터용 |
| 2 | S/N task 응답에 `force_closed` 필드 추가 | 🔒 강제종료 뱃지 렌더용 (pending 목록에선 불필요) |

> ⚠️ force-close API, 미시작 task API는 이미 존재 → BE 신규 생성 불필요 (기존 합의 4건에서 2건으로 축소)

### 배경

- OPS에 "미종료 작업" 화면 존재 — 협력사 Manager가 본인 회사 task 강제 종료 가능
- VIEW SNStatusPage(S/N 작업 현황)에서 이미 S/N별 task 상세 패널(SNDetailPanel) 제공 중
- **현재 문제**: VIEW에서는 미종료 task 확인만 가능, 강제 종료 불가. 미시작 task는 표시조차 안 됨
- Sprint 61-BE에서 `GET /admin/tasks/pending?include_not_started=true` API 확장 예정 → 이를 활용

### FE-15. SNDetailPanel 미종료/미시작 task 강제 종료 기능 [BE 선행 2건]

**기존 SNDetailPanel 구조** (스크린샷 참조):
```
┌─ GBWS-6920 ─────────────────────────────┐
│ GAIA-I DUAL · MICRON · 출하: 2026-04-20 │
│ Progress: 62% (3/6 공정)                 │
│                                          │
│ MECH 기구                    ✅ 완료     │
│  👤 이*석 자주검사 04/09 ...    33m      │
│  👤 이*석 Tank Docking ...     0m       │
│  ...                                     │
│                                          │
│ ELEC 전장                    🔵 진행중   │
│  👤 최*한 배선 포설 03/31 ...   27h 6m   │
│  👤 박*현 자주검사(검수) ...    —        │
│  ...                                     │
└──────────────────────────────────────────┘
```

**추가할 내용**:

1. **미종료 경고 배너** (카테고리 헤더 옆)
   - task 중 `started_at IS NOT NULL AND completed_at IS NULL`인 게 있고 경과 14h 초과 → 빨간 배지 `⚠️ 미종료 N건`
   - task 중 `started_at IS NULL`인 게 있고 같은 S/N 다른 task 완료 → 노란 배지 `⏳ 미시작 N건`

2. **강제 종료 버튼** (각 task row에)
   - 조건: `completed_at IS NULL` + 현재 사용자가 Admin 또는 해당 company Manager
   - 권한 확인: BE 응답의 `company` 필드로 Manager 본인 회사 task만 버튼 표시
   - 클릭 → 모달: 사유 입력 + `<input type="datetime-local">` 완료 시각 선택 (네이티브)
   - API: `PUT /api/admin/tasks/{task_id}/force-close` (기존 OPS API 재사용, `{task_id}` = app_task_details.id)
   - 성공 → task row에 `🔒 강제종료` 배지 + 리스트 갱신

3. **미시작 task 표시**
   - 현재 SNDetailPanel은 `started_at IS NOT NULL`인 task만 표시 (work_log 기반)
   - 추가: 미시작 task도 "미시작" 상태로 표시
   - 데이터 소스: 기존 `GET /api/app/tasks/{sn}` 응답에 workers=[] task가 이미 포함됨 → FE에서 flatMap 시 소실되지 않도록 처리
   - status 매핑: `'not_started'` → ProcessStepCard의 `'waiting'`으로 정규화 (어댑터 필요)
   - 표시 스타일: 배경 노란색 / 작업자 "-" / 경과시간 "미시작"

4. **강제종료 완료 구분** (S/N 상세)
   - BE 응답에 `force_closed` 필드 추가 후, 완료 task 중 `force_closed=true`에 `🔒 강제종료` 배지 표시
   - pending 목록에서는 불필요 (`WHERE force_closed=FALSE`로 이미 제외)

**권한 매트릭스**:

| 역할 | 미종료/미시작 확인 | 강제 종료 |
|---|---|---|
| Admin (GST) | ✅ 전체 S/N | ✅ 모든 task |
| Manager (협력사) | ✅ 본인 공정만 | ✅ 본인 공정만 (BE `company` 필드 기반 판단) |
| Worker | ✅ 읽기만 | ❌ |

**수정 파일 (예상)**:

| 파일 | 수정 내용 |
|---|---|
| `components/sn-status/SNDetailPanel.tsx` | 미시작 task 표시 + 강제종료 버튼 + 배지 |
| `components/sn-status/ProcessStepCard.tsx` | status 정규화 어댑터 (`'not_started'` → `'waiting'`) |
| `hooks/useSNTasks.ts` | flatMap에서 workers=[] task 소실 방지 |
| `api/admin.ts` (신규 or 기존) | `forceCloseTask(taskId, reason, completedAt)` API 함수 |
| `types/snStatus.ts` | `SNTask`에 `force_closed?: boolean` 추가 |

### FE-16. 미종료 작업 전용 요약 페이지 — **별도 Sprint으로 분리** [BE 선행]

> ⚠️ Sprint 33 범위 외. FE-15 완료 후 별도 Sprint 배정.

SNStatusPage 와 별개로, 전체 S/N 통합 미종료/미시작 task 리스트 전용 페이지.

- 경로: `/admin/pending-tasks`
- 사이드바: 관리 > 미종료 작업
- 테이블: S/N, O/N, 공정, 작업명, 작업자, 경과시간, 상태(진행중/미시작), 강제종료 버튼
- 필터: 공정별, 회사별, 상태별 (IN_PROGRESS / NOT_STARTED)
- API: `GET /api/admin/tasks/pending?include_not_started=true`
- 강제종료: FE-15와 동일 모달 재사용
- **우선순위**: FE-15 완료 후 검토. SNDetailPanel 만으로 충분하면 보류.

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
