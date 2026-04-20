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

### FE-02. API 필드 매핑 보정 — `src/api/checklist.ts` ✅ DONE (2026-04-17 상태 확인)

`getChecklistReport()` 매핑에 추가:
- summary 필드명 불일치 보정: BE `checked` → FE `completed` (`rawSummary.completed ?? rawSummary.checked ?? 0`)
- items: `selected_value`, `checker_role` 매핑 추가

### FE-03. 카테고리 라벨 — `ChecklistReportView.tsx` ✅ DONE (2026-04-17 상태 확인)

CategoryTable 헤더에 `phase_label` 표시:
```
{CATEGORY_LABEL[cat.category] ?? cat.category}
{cat.phase_label && ` — ${cat.phase_label}`}
```
결과: `전장 — 1차 배선`, `전장 — 2차 배선`, `TM (모듈) — L Tank`, `TM (모듈) — R Tank`

### FE-04. SELECT 타입 판정 렌더링 — `ChecklistReportView.tsx` ✅ DONE (2026-04-17 상태 확인)

판정 컬럼에 SELECT 분기 추가:
- CHECK → PASS/NA
- INPUT → input_value
- SELECT → selected_value

`resultColor` 함수에도 SELECT 분기 추가.

### FE-05. QI 배지 표시 — `ChecklistReportView.tsx` ✅ DONE (2026-04-17 상태 확인)

`checker_role === 'QI'` 항목에 QI 배지 표시 (검사항목 컬럼).

---

## 체크리스트 필수 토글 연동 (실적확인)

> 참조: `OPS_API_REQUESTS.md` — 별도 번호 미배정 (BE 확인 후 배정)

### FE-06. 현재 상태 확인 ✅ DONE (2026-04-17 상태 확인)

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

### FE-07. `getChecklistStatus()` ELEC 카테고리 허용 — `src/api/checklist.ts` ✅ DONE (2026-04-17 상태 확인)

현재 TM/TMS만 허용, ELEC은 조기 리턴. beCat 매핑에 ELEC 추가 필요.
- `GET /api/app/checklist/elec/{sn}/status?phase=1`
- `GET /api/app/checklist/elec/{sn}/status?phase=2`

> ⚠️ **주의**: ELEC `/status` 엔드포인트는 현재 BE에 미존재. Sprint 58-BE Task 4에서 신규 생성 예정.
> 대안: 기존 상세 조회(`/api/app/checklist/elec/{sn}?phase=`)에서 FE가 count 파생.

### FE-08. ProcessStepCard ELEC 체크리스트 표시 [BE 선행] — ✅ DONE (2026-04-17 DOC-SYNC-01 검증)

BE에서 ELEC status API 정상 반환 확인 후, 기존 checklist prop 전달 로직으로 자동 표시.
추가 FE 수정 불필요 (확인만).

> **검증 결과**: `frontend/app/src/api/checklist.ts:L89-L104` — `getChecklistStatus()` 함수에 ELEC 카테고리 처리 로직 포함 (CAT_MAP). `ProcessStepCard.tsx`는 checklist prop 전달로 자동 표시.

### FE-12. 체크리스트 관리 ELEC 블러 해제 — `ChecklistManagePage.tsx` ✅ DONE (2026-04-17 상태 확인)

현재 `BLUR_CATEGORIES = new Set(['MECH', 'ELEC'])` → ELEC 제거.
BE 마스터 API(`GET /api/admin/checklist/master?category=ELEC&product_code=COMMON`) 정상 확인 후 진행.
항목 추가/활성 토글도 TM과 동일 로직으로 동작 (FE 추가 수정 없음).

### FE-18. JIG WORKER/QI 뱃지 분기 미동작 조사 노트 — ✅ BE 핫픽스 완료 (2026-04-17)

> 연계: `OPS_API_REQUESTS.md` #59 DONE, `DESIGN_FIX_SPRINT.md` L13573 Sprint 32
>
> **결론**: OPS #59-B 원인 확인 후 BE 2줄 핫픽스(`backend/app/routes/checklist.py` `list_checklist_master()` SELECT 절 + 응답 dict) 적용 완료. FE는 수정 불필요, BE 배포 후 자동 정상화 예정.

**증상**: 체크리스트 관리 ELEC 페이지 "JIG 검사 및 특별관리 POINT" 14 row 전원 `WORKER` 뱃지로 표시. 본래 7건 WORKER + 7건 QI(GST) 뱃지 구분 렌더 필요.

**DB 실측 (정상)**: id 79~85 `checker_role='WORKER'` / id 86~92 `checker_role='QI'` (item_name `(GST)` 접미사 7건). 모두 `phase1_applicable=false`, `qi_check_required=true`, `is_active=true`.

**방안 B 채택 기록**: item_name에 `(GST)` 접미사를 붙여 4-key UNIQUE 유지 — 2 row 공존 OK. 정식 방안 A(5-key UNIQUE + 동일 item_name 2 row) 이관은 별도 마이그레이션 건으로 추후 검토.

**FE 렌더 로직 사전 검증 결과 (Codex 2026-04-17)**: `ChecklistTable.tsx` L76(`isQI` 판정), L89(QI 보더), L124-133(뱃지 분기) 모두 정상. `getChecklistMaster()`는 BE 응답을 타입 바인딩만 하므로, BE가 `checker_role` 키를 추가하면 FE 추가 수정 없이 즉시 동작.

**API 응답 실측 결과 (Codex 2026-04-17, 조사 종결)**:
- 엔드포인트: `GET /api/admin/checklist/master?category=ELEC&product_code=COMMON`
- 총 item 수: 31
- 응답 키: `category, description, id, is_active, item_group, item_name, item_order, phase1_applicable, product_code, qi_check_required, remarks`
- `checker_role` 키: ❌ **0건 (전 item에서 누락)**
- **→ OPS #59-B 미완 확정**. BE `routes/checklist.py` `get_checklist_master()` 응답 dict에 `'checker_role': row.get('checker_role', 'WORKER'),` 한 줄 추가로 해결. FE 수정 불필요.

참고 — 사용한 판정 명령 (재현용):
```bash
# 1단계: 응답의 한 item 구조 확인
curl -s -H "Authorization: Bearer <ADMIN_TOKEN>" \
  "https://<API_HOST>/api/admin/checklist/master?category=ELEC&product_code=COMMON" \
  | python -m json.tool | sed -n '/"items"/,/^    }/p' | head -40
# 2단계: checker_role 키 등장 횟수
curl -s ... | grep -c '"checker_role"'
```

---

## OPS #58 — checklist_master 비고(remarks) 컬럼

> 참조: `OPS_API_REQUESTS.md` #58

### FE-13. 비고 컬럼 추가 ✅ DONE (2026-04-17 상태 확인)

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

### FE-15. SNDetailPanel 미종료/미시작 task 강제 종료 기능 ✅ DONE (2026-04-17 상태 확인)

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

### FE-16. 미종료 작업 전용 요약 페이지 — **별도 Sprint으로 분리** [BE 선행] — 🟡 BACKLOG (2026-04-17 DOC-SYNC-01 재확인)

> ⚠️ Sprint 33 범위 외. FE-15 완료 후 별도 Sprint 배정.
> **검증 결과 (2026-04-17)**: BE `GET /api/admin/tasks/pending?include_not_started=true` 엔드포인트 미존재 확인. FE 페이지(`/admin/pending-tasks`)도 미구현. 의도대로 **보류 상태 유지** — FE-15 운영 상황 본 후 필요성 재판단.

SNStatusPage 와 별개로, 전체 S/N 통합 미종료/미시작 task 리스트 전용 페이지.

- 경로: `/admin/pending-tasks`
- 사이드바: 관리 > 미종료 작업
- 테이블: S/N, O/N, 공정, 작업명, 작업자, 경과시간, 상태(진행중/미시작), 강제종료 버튼
- 필터: 공정별, 회사별, 상태별 (IN_PROGRESS / NOT_STARTED)
- API: `GET /api/admin/tasks/pending?include_not_started=true`
- 강제종료: FE-15와 동일 모달 재사용
- **우선순위**: FE-15 완료 후 검토. SNDetailPanel 만으로 충분하면 보류.

---

### FE-17. 강제 종료 API 필드명 수정 — `useForceClose.ts` ✅ (BUG-45 연계)

**등록**: 2026-04-17 · **동반 BE 수정**: `AXIS-OPS/AGENT_TEAM_LAUNCH.md` BUG-45 섹션 · **상태**: ✅ 수정 완료 (2026-04-17)

> ✅ **완료 기록**: `useForceClose.ts` L24 `close_reason: reason` 매핑 적용. BE 가드(admin.py L1185-1203) + pytest TC-FC-11~18 8/8 GREEN과 동시 반영. Sprint 33 FE-15 강제종료 경로 복구 확인.

**증상**: VIEW SNDetailPanel(또는 Sprint 33 FE-15 구현부)에서 강제 종료 클릭 시 BE 400 반환.
```json
{"error": "INVALID_REQUEST", "message": "close_reason(강제 종료 사유)은 필수입니다."}
```

**원인**: FE 페이로드 필드명 불일치. BE는 `close_reason`을 읽지만 FE는 `reason`을 전송.

| 쪽 | 파일 | 전송 필드 |
|---|------|-----------|
| OPS Flutter (정상) | `frontend/lib/screens/admin/admin_options_screen.dart` L716, `.../manager/manager_pending_tasks_screen.dart` L236 | `'close_reason': reason` |
| VIEW (에러) | `app/src/hooks/useForceClose.ts` L24 | `reason` ❌ |
| BE 검증 | `backend/app/routes/admin.py` L1104-1109 | `data.get('close_reason', '').strip()` → empty면 INVALID_REQUEST |

**수정안** — `app/src/hooks/useForceClose.ts` L22-26:

```typescript
mutationFn: ({ taskId, reason, completedAt }: ForceClosePayload) =>
  apiClient.put<ForceCloseResponse>(`/api/admin/tasks/${taskId}/force-close`, {
    close_reason: reason,        // ← reason → close_reason (BE 계약)
    completed_at: completedAt,
  }),
```

- `ForceClosePayload` interface의 내부 이름(`reason`)은 **유지** — 호출부(useForceClose를 쓰는 모달 컴포넌트) 변경 불필요
- 실제 body 전송 시에만 `close_reason`으로 매핑

**검증 방법**:
1. VIEW SNDetailPanel에서 task "강제 종료" 클릭 → 사유 + 완료 시각 입력 → 제출
2. Network 탭: Request Payload에 `close_reason` 포함 확인
3. 200 OK + task row에 `🔒 강제종료` 배지 표시
4. OPS에서 동일 task 강제 종료 시 정상 동작 유지(regression)

**의존 관계**:
- 🔴 **BLOCKS Sprint 33 FE-15** — 본 FE-17 수정 전 상태로 배포 시 FE-15 강제종료 기능 전면 불능 (발견 당시 조건, 현재는 해소됨)
- ✅ BE 측 `completed_at` 가드(BUG-45)는 **이미 배포 완료 (v2.9.6)** — `admin.py` L1187-1193 (미래 차단, 60초 clock skew 허용), L1200-1205 (과거 차단, started_at 이전 시각), L1207-1210 (NOT_STARTED task duration 스킵). 즉 L1212 `elapsed_minutes`와 L1255 pause 차감, L1257-1258 fallback은 모두 가드 **뒤**에서 실행되므로 음수 elapsed 또는 과대 duration 경로는 구조적으로 봉쇄됨.
- **FE 단독 1줄 수정**(`useForceClose.ts` L24 `reason → close_reason`)으로 본 400 에러 완전 해소, 추가 BE 대기 없음.

**수정 파일 (예상)**:

| 파일 | 수정 내용 |
|---|---|
| `hooks/useForceClose.ts` | L24: `reason` → `close_reason` 필드명 변경 (1줄) |
| `components/sn-status/SNDetailPanel.tsx` | 변경 없음 (useForceClose interface 유지) |

**교차 검증 합의 포인트**:
- FE interface를 통째로 `closeReason`으로 바꾸지 않는다 — 호출부 레거시 최소화, 전송 레이어에서만 정규화
- `completedAt` (camelCase → snake_case) 매핑은 이미 정상이므로 동일 패턴 유지
- Sprint 33 FE-15의 모달(사유 입력 + `datetime-local`)은 이미 올바르게 `{ taskId, reason, completedAt }` 형태로 호출 중 — FE-17 1곳 수정만으로 전체 복구

**작업 주체**: VSCode 터미널 (Claude + Codex 교차검증 후 pytest + VIEW 빌드)

---

## HOTFIX-04 연계 — 강제종료 표시 누락 보정

> BE 설계: `AXIS-OPS/AGENT_TEAM_LAUNCH.md` HOTFIX-04 섹션 (방안 B + 확장 A 통합, M2 옵션 C' 재확정)
> 등록: 2026-04-17 · Codex 재검증 M1/M2/A1/A2 반영: 2026-04-17 · **배포 완료: v2.9.8 (2026-04-17)**
> **FE 영향 없음(키 계약 불변)**: BE 내부 구현이 후처리 루프 → 모델 필드 + SELECT JOIN(옵션 C')으로 바뀌었으나 VIEW가 받는 응답 키는 `close_reason`/`closed_by`/`closed_by_name` 동일 → 본 FE-19 JSX·타입 변경 없음
> **구현 전제 (2026-04-17 결정)**: `formatDateTime` 공통 유틸 — `ChecklistReportView.tsx` L25 로컬 함수를 `utils/format.ts`로 **선승격 완료** (Codex 지적 #1 옵션 A 채택). FE-19 구현 시 `import { formatDateTime } from '@/utils/format'` 사용. REFACTOR-FMT-01 나머지 2건(`formatDate` in QrManagementPage / InactiveWorkersPage)은 BACKLOG 유지.

### FE-19. ProcessStepCard 강제종료 표시 보정 — ✅ DONE (2026-04-17 v1.32.0 + 2026-04-18 v1.32.1 + v1.32.2)

> **v1.32.2 (2026-04-18)** — 툴팁 UX 보정: 브라우저 기본 `title` 속성 500~700ms 딜레이 회피. CSS `.fc-tooltip` + `data-tooltip` 패턴으로 즉시 반응 툴팁 구현 (`index.css` 공통 추가 + `ProcessStepCard` 속성 교체). 상세는 `DESIGN_FIX_SPRINT.md` `FE-19.2 툴팁 즉시 반응` 섹션 참조.

> **v1.32.0 (2026-04-17)** — 1차 구현: `taskStatus()` L55 분기 + `workers.length === 0` placeholder JSX + `SNTaskDetail` 3필드 추가 + `formatDateTime` 유틸 승격.
>
> **v1.32.1 (2026-04-18)** — 후속 보정: 실사용 스크린샷으로 v1.32.0의 placeholder JSX가 **데드 코드**임 확인 (SNDetailPanel 병합 로직이 항상 placeholder worker 주입 → `workers.length > 0` 경로로 진입). per-row 전파 방식으로 재설계:
> - `TaskWorker` 타입에 `force_closed?`/`close_reason?`/`closed_by_name?`/`force_closed_at?` 4필드 추가
> - `SNDetailPanel` 병합 시 부모 task의 force_closed 관련 필드를 각 worker row(실제 + placeholder)에 전파
> - `ProcessStepCard` 상태 컬럼: `force_closed` 시 `🔒 강제종료 mm/dd hh:mm`으로 대체 + `title` 툴팁(사유/처리자/종료)
> - 강제종료 버튼 이중 노출 방지(`!w.force_closed` guard), duration 컬럼도 '—'로 통일, v1.32.0 데드 코드 제거
>
> **Sprint 기록**: `DESIGN_FIX_SPRINT.md` `HOTFIX-04 — FE-19 ProcessStepCard 강제종료 표시 보정` 섹션 참조.

**배경**: HOTFIX-04 BE가 task 응답에 `close_reason`, `closed_by_name` 2키를 추가. 이로써 VIEW에서 두 가지 케이스를 동시 해소.

| Case | 기존 동작 | 기대 동작 |
|---|---|---|
| Case 1 — Orphan `work_start_log` (wsl 있음 + wcl 없음) | worker row "진행중" 표시 (BE가 `in_progress` 반환) | BE 쪽에서 자동 `completed` 반환 → **VIEW 수정 불필요** |
| Case 2 — 미시작 강제종료 (wsl 자체 없음) | 상단 `🔒 강제종료` 뱃지 + 하단 "대기중" 텍스트 (시각/사유 소실) | 상단 뱃지 `✅ 완료` + placeholder row (처리자 마스킹 + 종료 시각 + 사유 표시) |

본 FE-19는 **Case 2 전용**. Case 1은 BE 배포 시점에 기존 렌더링 로직 그대로 정상 동작.

**수정 — `app/src/components/sn-status/ProcessStepCard.tsx`** (단일 파일, 2곳):

1. **L55 `taskStatus()` 분기 확장**:
```typescript
// Before
if (!task || task.workers.length === 0) return 'waiting';

// After
if (!task || task.workers.length === 0) {
  if (task?.force_closed) return 'completed';   // 미시작 강제종료 케이스
  return 'waiting';
}
```

2. **L178~L180 workers=[] 블록 확장**:
```tsx
// Before
{workers.length === 0 && status === 'waiting' && !hasChecklist && (
  <div style={{ fontSize: '12px', color: 'var(--gx-silver)' }}>대기중</div>
)}

// After
{workers.length === 0 && !hasChecklist && (
  task?.force_closed ? (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '6px 4px', fontSize: '12px',
      background: 'rgba(239,68,68,0.04)', borderRadius: '4px',
    }}>
      <span style={{ color: 'var(--gx-slate)', fontWeight: 500 }}>
        👤 (강제 종료 · 작업 이력 없음)
      </span>
      {task.closed_by_name && (
        <span style={{ color: 'var(--gx-steel)', fontSize: '11px' }}>
          처리: {maskName(task.closed_by_name)}
        </span>
      )}
      {task.completed_at && (
        <span style={{
          color: 'var(--gx-steel)', fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px', marginLeft: 'auto',
        }}>
          {formatDateTime(task.completed_at)}
        </span>
      )}
      {task.close_reason && (
        <span style={{ color: 'var(--gx-silver)', fontSize: '11px', width: '100%', marginTop: '4px' }}>
          사유: {task.close_reason}
        </span>
      )}
    </div>
  ) : (
    <div style={{ fontSize: '12px', color: 'var(--gx-silver)' }}>대기중</div>
  )
)}
```

**보조 수정 — `app/src/types/snStatus.ts`**: `SNTaskDetail` 인터페이스에 선택 필드 2개 추가.

```typescript
export interface SNTaskDetail {
  // ... 기존 필드
  force_closed?: boolean;     // 기존 유지 (Sprint 33 #61에서 L46에 이미 추가됨)
  close_reason?: string;      // 신규
  closed_by_name?: string;    // 신규 (마스킹 전 원문, VIEW에서 maskName() 적용)
}
```

**영향 범위**:
- 파일: `ProcessStepCard.tsx` + `types/snStatus.ts` 2개
- 예상 diff: 약 30~40줄 (placeholder JSX 포함)
- `workers.length > 0` 기존 경로 영향 없음 (조건 분기 neutral)
- Case 1(Orphan wsl) 은 본 FE-19와 독립적으로 BE 배포 시점에 자동 정상화

**검증 방법**:
1. 스테이징 배포 후 `TM 모듈` 가압검사 Card 에 placeholder row 가 렌더되는지 육안 확인
2. 처리자 이름이 `maskName()` 규칙에 따라 `김*규` 형태로 마스킹되는지 확인
3. `close_reason` 원문 그대로(마스킹 없음) 표시 확인
4. `completed_at` 이 KST(+09:00) 기준으로 표시되는지 확인 (`utils/format.ts` 의 `formatDateTime` 공통 유틸 사용 — 2026-04-17 선승격 완료)
5. Case 1 회귀: 박*현/김*욱이 `ELEC 전장` 상세뷰에서 KST 종료 시각 + "완료" 뱃지 표시 (FE 변경 불필요, 자동 정상화 확인)

**의존 관계**:
- 🟢 **BE 배포 완료 (v2.9.8, 2026-04-17)** — `AGENT_TEAM_LAUNCH.md` HOTFIX-04 BE 반영 완료 → FE 착수 가능
- BE 응답 키 누락 시 `task?.force_closed`만 true, 나머지 필드 undefined → placeholder가 처리자/사유 미표시 상태로 안전하게 degrade (Guard 조건 `task.closed_by_name &&` / `task.close_reason &&` 로 조건부 렌더)
- **TC-FORCECLOSE-NS-04 (Codex A1) 대응**: legacy 강제종료 레코드(`closed_by IS NULL`)는 BE LEFT JOIN 결과 `closed_by_name` undefined → `{task.closed_by_name && ...}` guard 에서 처리자 span 자동 생략, "처리: ?" 같은 깨진 문구 나오지 않음 (backward-compat 보장, 추가 FE 변경 불필요)

**교차 검증 합의 포인트**:
- BE가 `closed_by_name`을 미리 마스킹해서 보내지 않음 — VIEW에서 기존 `maskName()` 재사용 (다른 worker 이름 마스킹과 일관)
- `close_reason`은 관리자 자유 텍스트 → 마스킹 대상 아님 (일반 표시)
- Case 1 FE 분기 추가 시도 금지 — BE 계약에서 이미 `status='completed'` 반환하므로 기존 렌더링 경로 활용

**작업 주체**: VSCode 터미널 (Claude + Codex 교차검증, BE HOTFIX-04 배포 직후 FE 적용)

---

### FE-19.1. 강제종료 시각 툴팁 용어 정합 — ✅ DONE (2026-04-20 v1.32.3 적용, Claude↔Codex 교차검증 합의 후 구현)

> **베이스라인**: v1.32.2 (원안은 v1.32.0 기준 stale 상태로 작성되어 폐기, 본 재설계는 v1.32.2 실측 코드 기준)
>
> **원안 폐기 근거 (2026-04-20 Codex 교차검증)**: 초기 원안은 placeholder row의 `{task.completed_at && (<span>{formatDateTime(task.completed_at)}</span>)}` 블록에 `🔒 종료 처리:` 접두어를 추가하는 설계였으나, 해당 JSX 블록은 **v1.32.1 "데드 코드 정리" 단계에서 이미 제거됨** (grep `formatDateTime(task.completed_at)` 매치 0건 확인). 현재 v1.32.2 구조는 `SNDetailPanel.tsx:206`에서 `task.completed_at → w.force_closed_at` per-row 전파 후 `ProcessStepCard.tsx:234`에서 `🔒 강제종료 {formatTime(w.force_closed_at)}` 형태로 worker row 상태 컬럼에 노출 중. 이미 **`🔒 강제종료`** 텍스트가 "권한 액션·감사 시각"을 명시하므로 클린 코어 원칙 #4 UI 책임 **주요 요건은 이미 충족**. 다만 툴팁 문구에서 "종료:"만 단독 사용 중 → 원칙 문서(`AGENT_TEAM_LAUNCH.md` / `BACKLOG.md`)의 `🔒 종료 처리:` 용어와 **정합성 확보 차원**에서 소폭 보정만 잔여.

**목적**: 툴팁 문구 용어를 원칙 문서(`🔒 종료 처리:`)와 일치시켜 grep·문서 참조 일관성 확보. "종료:"가 "작업 종료"로 오독될 여지 제거.

**수정 — `app/src/components/sn-status/ProcessStepCard.tsx`** (단일 파일, 1곳):

L224 부근 worker row 상태 컬럼의 tooltip `title` 속성 내 **"종료:"** → **"종료 처리:"** 1단어 추가.

```tsx
// Before (v1.32.2, L224 근처 tooltip 내부)
title={`사유: ${w.close_reason ?? ''}\n처리: ${maskName(w.closed_by_name) ?? ''}\n종료: ${formatDateTime(w.force_closed_at)}`}

// After (FE-19.1)
title={`사유: ${w.close_reason ?? ''}\n처리: ${maskName(w.closed_by_name) ?? ''}\n종료 처리: ${formatDateTime(w.force_closed_at)}`}
```

> **실제 tooltip 문자열 템플릿은 현재 소스 구현에 따라 달라질 수 있음** — 본 설계의 고정점은 "`종료:` 라벨을 `종료 처리:`로 교체한다" 한 가지이고, 문자열 조합 방식(템플릿 리터럴 / `\n` 개행 / 필드 순서 등)은 VSCode 구현 시 현행 코드 그대로 유지.

**원안 폐기 항목 (명시)**:
- ❌ placeholder row `{task.completed_at && (<span>...</span>)}` 접두어 추가 → **해당 JSX 이미 제거됨, 대상 없음**
- ❌ `SNTaskDetail` 인터페이스 신규 필드 추가 → **v1.32.1에서 `TaskWorker` 4필드(`force_closed?`/`close_reason?`/`closed_by_name?`/`force_closed_at?`)로 이미 처리됨**
- ❌ span 별도 `title` 속성 추가 → **기존 상태 컬럼 title 하나로 통합되어 불필요**

**영향 범위**:
- 파일: `ProcessStepCard.tsx` 1개
- 예상 diff: **텍스트 1단어 추가** (1줄 수정)
- 기능 변경: 없음 (툴팁 문구만 조정)
- 회귀 위험: **매우 낮음** (조건 분기·필드 접근·렌더 경로 무변경. 다만 현행 구현이 HTML `title` 속성이 아닌 CSS `::after { content: attr(data-tooltip) }` + `white-space: pre-line` + `min-width: 180px / max-width: 320px` 말풍선 방식이라, 1단어 증가가 **줄바꿈 위치·말풍선 폭에 최소 영향 가능성** 존재. 스테이징 육안 검증으로 해소 가능 수준.)

**검증 방법**:
1. 스테이징 배포 후 강제종료된 worker row(예: 박*현/김*욱 ELEC 전장, TM 가압검사) hover
2. 툴팁에 `사유: ... / 처리: ... / 종료 처리: YYYY-MM-DD HH:MM` 형태 노출 확인
3. 기존 상태 컬럼 `🔒 강제종료 {formatTime(...)}` 표시는 **변경 없이 유지** 확인

**의존 관계**:
- 🟢 **설계 원칙 문서화 완료**: `AGENT_TEAM_LAUNCH.md` HOTFIX-04 📐 설계 원칙 블록 (2026-04-20) — 원칙 #4 UI 책임의 **주요 요건은 현행 코드가 이미 충족**, 본 FE-19.1은 **문구 정합**에 한정.
- 🟡 **회귀 가드 연계**: BACKLOG `TEST-CLEAN-CORE-01` pytest (force_close 호출 후 wsl/wcl row 0건 확인) — BE 레이어 회귀 가드는 본 FE-19.1과 독립적으로 진행 가능.
- ⏸️ **Codex 재검증**: Option A+B 재설계본은 텍스트 1단어 변경이라 **추가 교차검증 생략 가능**. 단 실제 구현 시 tooltip 라인 번호·템플릿 구조가 본 설계서와 달라지면 그때 1회 확인 권장.

**제외 대상 (Codex Option C, 명시적 스코프 아웃)**:
- 상태 컬럼 `formatTime` → `formatDateTime` 전환 (수일 전 강제종료 식별 개선): 카드 폭 UX 영향 있어 **별도 이슈로 분리**, 본 FE-19.1 스코프 아님.
- ChecklistReportView 등 다른 `formatDateTime(completed_at)` 사용처: 맥락이 달라 용어 정합 불필요.

**작업 주체**: VSCode 터미널 (Claude + Codex 교차검증, 다음 스프린트 FE 작업 시 일괄 적용)

**우선순위**: **낮음** (기능적 영향 없음, 용어 정합만)

**예상 소요**: 구현 2분 + 스테이징 육안 검증 3분 = 총 5분

---

## 기타 PENDING 항목

(현재 없음)

---

## VIEW Sprint 30 — 비활성화 권한 분기 + 422 에러 처리

> 설계: `AXIS-VIEW/docs/sprints/DESIGN_FIX_SPRINT.md` Sprint 30
> BE 추가 요청 없음 (기존 API 활용)

### FE-14. Admin/Manager 비활성화 분기 — `PermissionsPage.tsx` ✅ DONE (2026-04-17 상태 확인)

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
