# VIEW FE 작업 요청 목록

> VIEW(React) 프론트엔드에서 구현해야 할 작업 목록.
> BE 수정 완료 후 진행하는 항목은 **BE 선행** 표기.
> 마지막 업데이트: 2026-04-20 (v1.33.0 — Sprint 34 FE-20·FE-21 구현 DONE. BE FIX-25 v4 배포 대기 중(미배포 시 4필드 undefined 자동 생략·안전 degrade). 합의 근거: Claude↔Codex 2라운드 교차검증 M1+A8 (v3) + M1+A6 (v4) 전원 반영.)

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

## S/N 상세뷰·O/N 리스트 헤더 정보 보강 (2026-04-20 요청)

> **배경**: Twin파파 요청 — (1) 상세뷰 카테고리 헤더에 담당 회사명 동반 표시, (2) O/N 카드 헤더·상세뷰 헤더에 제품 `line`(고객사 공정 라인) 노출.
> **설계 원칙 적용**: 데이터 소스는 `plan.product_info` 단일 원천 (모델/쿼리 레벨 일관성 — `feedback_system_design_principle.md`). NULL인 경우 "뭐라도 값을 넣자" 금지, 그대로 생략.
> **BE 선행**: `AGENT_TEAM_LAUNCH.md` FIX-25 (**v4 — progress API 단일 확장**) 완료 후 진행.
> **교차검증 합의 (2026-04-20 Claude↔Codex v1.32.5 = v4 기준)**:
>   - **v4 핵심 전환**: BE가 tasks API(`work.py`) 무변경, `/api/app/product/progress` 응답 `SNProduct` 요소에 `mech_partner` / `elec_partner` / `module_outsourcing` / `line` 4필드를 **flat**으로 추가. FE는 이미 `SNStatusPage`가 progress API products 배열을 `selectedProduct`로 `SNDetailPanel`에 `product: SNProduct` prop 내려주는 상태 → 신규 API 호출·Hook 추가 불요.
>   - **타입 구조 변경**: v3에서 설계했던 `ProductInfo` 별도 인터페이스 + `SNTaskDetailResponse.product_info` 중첩 구조 **폐기** → `SNProduct` 인터페이스에 4필드 직접 확장(snake_case flat). `ProcessStepCard`는 `product: SNProduct` 혹은 4필드 중 필요한 3개만 prop으로 받음.
>   - v1.32.4 이미 확정된 사항 중 유지: ① `line_mixed_count`는 **BE 필드 아닌 FE 계산** (`groupedByON` 내부 `lineAgg` useMemo) ② 실제 페이지 경로 `app/src/pages/production/SNStatusPage.tsx` ③ `case 'TMS'` (DB 실측값) ④ 타입 snake_case 유지.
>   - **API 검증 경로 변경**: v3 `curl /api/app/tasks/{sn}?all=true | jq '.product_info'` → **v4 `curl /api/app/product/progress | jq '.products[0] | {mech_partner,elec_partner,module_outsourcing,line}'`** + tasks API 회귀 확인용 `curl /api/app/tasks/{sn}?all=true | jq 'type'` → `"array"` 유지 확인 (v3 List→Dict breaking 방지 가드).

### FE-20. 상세뷰 카테고리 헤더에 담당 회사명 표시 — `SNDetailPanel.tsx` / `ProcessStepCard.tsx` [BE 선행] — ✅ DONE (2026-04-20 v1.33.0 구현, BE FIX-25 배포 대기)

**목적**: 협력사 작업자 이름(마스킹된 `박*현` 등)만 노출되는 현재 구조에서 **회사명**까지 함께 식별 가능하도록 상세뷰 카테고리 헤더를 보강. GST 자체생산 케이스도 동일하게 "GST"로 노출해 **자체 vs 협력사 구분**을 시각화.

**전제 (DB 실측 — `DB_SCHEMA_MAP.md` + Twin파파 2026-04-20 확인)**:
- `plan.product_info` 보유 컬럼: `mech_partner` / `elec_partner` / `module_outsourcing` / `line` (모두 `VARCHAR(255)`)
- **대상 카테고리 3종 (회사명 라벨 표시)**: MECH / ELEC / TMS (partner 컬럼 보유)
  - 주의: app_task_details.task_category 값은 `TMS` (FE `CATEGORY_LABEL`·carousel 로직 전반 동일). 한국어 라벨은 "TM 모듈"이지만 **분기 key는 `'TMS'`**.
- **제외 카테고리 3종 (라벨 미표시)**:
  - PI / QI — partner source 부재 (GST 자체검사 고정)
  - **SI** — partner 컬럼 없음, GST 출하검사 고정 (Codex A7 명시)
- **TM 특례**: `module_outsourcing` 실질 고정값 "TMS" (Twin파파: "module outsourcing값은 TMS에서 변경사항 없음"). DB 값 그대로 렌더.
- **GST 자체생산**: `mech_partner`/`elec_partner`가 "GST"인 경우 존재 → 그대로 표시 (Twin파파: "gst도 자체 생산이 있어서 넣으면 될거 같음").
- **NULL 빈도**: S/N 채번 시점에 협력사 배정 완료 (Twin파파: "SN번호가 채번된 경우는 협력사 배정은 완료, 추후에 변경은 될수 있음") → NULL 사실상 없으나 **방어 코드는 필수**.

**표시 포맷 (카테고리 헤더 제목 옆에 중점 + 회사명)**:
```
MECH 기구 · 에스이엔지
ELEC 전장 · GST
TM 모듈 · TMS
PI 검사              ← 변경 없음 (라벨 없음)
QI 검사              ← 변경 없음
SI 출하검사          ← 변경 없음
```

**NULL 처리 규칙 (클린 코어 원칙)**:
- 회사명 값이 `null` / 빈 문자열 → 카테고리명만 단독 표시 (`MECH 기구`), 중점·빈값 표시 **금지**.
- `"GST"` / `"TMS"` / 협력사명 → 그대로 문자열 삽입. 가공·번역 금지.

**수정 파일 (예상 3개 — v4 기준: `SNProduct` flat 확장 + ProcessStepCard prop 확장 + SNDetailPanel 배선)**:
1. `app/src/types/snStatus.ts` — **`SNProduct` 인터페이스에 4필드 flat 추가** (v3 `ProductInfo` 별도 인터페이스 + 중첩 구조 폐기. BE 응답 스키마와 동일하게 snake_case 유지 — Codex A3)
   ```ts
   // 기존 SNProduct 인터페이스 확장 (L5~20)
   export interface SNProduct {
     serial_number: string;
     model: string;
     customer: string;
     ship_plan_date: string | null;
     sales_order: string | null;
     // ... 기존 필드들 유지
     last_task_name: string | null;
     last_task_category: string | null;
     // ↓ FE-20 / FE-21 신규 (v4 — progress API 응답 flat 확장)
     mech_partner: string | null;
     elec_partner: string | null;
     module_outsourcing: string | null;
     line: string | null;
   }
   ```
   > **v3 대비 변경**: `ProductInfo` 별도 인터페이스 신설 없음. `SNTaskDetailResponse.product_info` 중첩 구조 **미도입**. 타입은 BE `progress_service.py` dict 구조 1:1 반영이라 snake_case 유지. camelCase 변환 계층 여전히 없음 (Codex Q3 합의 유효).
   >
   > **tasks API 타입 무변경**: `SNTaskDetail` 인터페이스(L45~55) 는 v3 설계와 달리 **건드리지 않음**. `work.py` 응답 구조가 List 그대로라서 `getSNTasks()` (`Array.isArray(data) ? data : []`) 로직 그대로 유효.

2. `app/src/components/sn-status/ProcessStepCard.tsx` — **prop 확장 + 카테고리별 회사명 선택 + 조건부 렌더 헬퍼 추가** (Codex M1: `case 'TMS'` 유지):
   ```tsx
   // Props 확장 — 신규 (v4: 중첩 객체 대신 4필드 중 필요 3개를 flat prop으로 받거나, product 일체 전달 중 택1)
   // 옵션 A (권장) — 의존 축소: 필요한 3필드만 선택적 prop으로
   interface ProcessStepCardProps {
     // ...기존 props
     mechPartner?: string | null;
     elecPartner?: string | null;
     moduleOutsourcing?: string | null;
   }
   // 옵션 B — 단순: product: SNProduct 통째 주입 (이미 부모 SNDetailPanel 이 보유)

   // 카테고리 → partner 추출 헬퍼 (Codex M1: case 'TMS' 정정 반영)
   const getCategoryPartner = (
     category: string,
     props: Pick<ProcessStepCardProps, 'mechPartner' | 'elecPartner' | 'moduleOutsourcing'>,
   ): string | null => {
     switch (category) {
       case 'MECH': return props.mechPartner ?? null;
       case 'ELEC': return props.elecPartner ?? null;
       case 'TMS':  return props.moduleOutsourcing ?? null;  // ⚠️ task_category DB 값은 'TMS'
       default:     return null;  // PI / QI / SI: 라벨 없음
     }
   };

   const partner = getCategoryPartner(category, { mechPartner, elecPartner, moduleOutsourcing });
   // 헤더 제목 JSX
   <span className="category-header">
     {CATEGORY_LABEL[category] ?? category}
     {partner && partner.trim().length > 0 && (
       <span className="category-partner"> · {partner}</span>
     )}
   </span>
   ```
   > **권고**: 옵션 A(flat 3 prop) 선택 — `SNProduct` 전체를 ProcessStepCard까지 전달하면 카드 단위 책임을 벗어남. 필요 3필드만 `Pick` 하여 배선.

3. `app/src/components/sn-status/SNDetailPanel.tsx` — **이미 L17 `product: SNProduct` prop 보유**. `ProcessStepCard` 에 3필드 내려주는 JSX 1곳만 추가 (약 3줄):
   ```tsx
   <ProcessStepCard
     // ...기존 props
     mechPartner={product.mech_partner}
     elecPartner={product.elec_partner}
     moduleOutsourcing={product.module_outsourcing}
   />
   ```
   > `SNStatusPage.tsx` L277에서 이미 `<SNDetailPanel product={selectedProduct} ... />` 배선 완료되어 있어, 상위 페이지 수정 불요.

**스타일 가이드**:
- 회사명은 카테고리 제목 대비 **약간 옅은 색** (기존 `phase_label` 유사 톤) — 주정보(카테고리) / 부정보(담당사) 위계 명확화.
- 모바일·태블릿에서 제목 줄바꿈 발생 시 **회사명은 같은 줄 유지 우선** (wrap 방지 필요 시 `white-space: nowrap`).

**영향 범위**:
- 파일: 3개 (types 1 + 컴포넌트 2: ProcessStepCard + SNDetailPanel 배선)
- 예상 diff: 타입 +4줄(SNProduct flat 4필드), 헬퍼 +10줄, JSX +5줄, 부모 prop 배선 +3줄 = 약 20~22줄
- 기능 변경: UI 텍스트 **추가만**, 기존 렌더 경로 무변경
- 회귀 위험: **매우 낮음** (순수 추가 JSX, null/undefined guard 완비, 기존 로직 touch 없음). **tasks API 타입 무변경**이라 `snStatus.ts getSNTasks()` / `SNTaskDetail` 소비처 전원 회귀 0. v4 전환으로 BE 변경이 progress API 응답 필드 추가 전용으로 축소되어 v3 대비 회귀 위험 등급 하향(Codex A6).

**검증 방법 (v4 기준)**:
1. BE FIX-25 배포 후 **`/api/app/product/progress`** 응답 products[n]에 `mech_partner` / `elec_partner` / `module_outsourcing` / `line` 4필드 포함 확인:
   ```bash
   curl -s '<host>/api/app/product/progress' -H 'Authorization: ...' \
     | jq '.products[0] | {serial_number,mech_partner,elec_partner,module_outsourcing,line}'
   ```
2. **tasks API 회귀 가드**: `curl -s '<host>/api/app/tasks/<sn>?all=true' | jq 'type'` → `"array"` 그대로 (v3 List→Dict breaking 방지 확인).
3. 스테이징에서 S/N 3개 샘플 상세뷰 접근:
   - 일반 협력사 케이스: MECH/ELEC에 협력사명, TM 모듈 카드에 "TMS" 표시 (분기 key `'TMS'` 실제 동작 확인)
   - GST 자체생산 케이스: "· GST" 접미 표시 (`mech_partner='GST'`)
   - NULL 방어: 신규·테스트 S/N에 `mech_partner IS NULL` 인위적 세팅 → 카테고리명 단독 표시 확인
4. PI/QI/SI 카테고리는 라벨 **미표시** 확인 (부가정보 누락 아님 — 의도된 동작)

**의존 관계**:
- 🔴 **BE 선행 필수**: FIX-25 (v4 — progress API 단일 확장) 배포 완료 후 FE 착수. BE 미배포 시 `product.mech_partner` 등이 undefined → 현행 UI와 동일 동작(안전, 점진 배포 가능).
- 🟡 **FE-03 (성적서 ELEC Phase 라벨)과 무관**: FE-03은 성적서 페이지 전용 `phase_label`(1차/2차 배선) 렌더 건. 본 FE-20은 S/N 상세뷰(`SNDetailPanel`·`ProcessStepCard`) 헤더 수정이라 **다른 화면 · 다른 컴포넌트** — 병존 이슈 없음 (Codex 지적 반영).
- ⏸️ **FE-21과 병합 권장**: 같은 `SNProduct` flat 확장 건(4필드 공용)이라 타입·상태관리 공용. 1 PR로 묶어 배포.

**작업 주체**: VSCode 터미널 (Claude + Codex 교차검증)

**우선순위**: **중간** (운영 개선, 데이터 정합 영향 없음)

**예상 소요**: 구현 30분 + 스테이징 육안 검증 15분 = 총 45분

---

### FE-21. O/N 카드·상세뷰 헤더에 `line` 값 표시 — `SNStatusPage.tsx` / `SNDetailPanel.tsx` [BE 선행] — ✅ DONE (2026-04-20 v1.33.0 구현, BE FIX-25 배포 대기)

**목적**: 생산현황 O/N 카드 헤더와 S/N 상세뷰 헤더에 **고객사 공정 라인(`plan.product_info.line`)** 노출. 동일 고객사 내 라인별 분류가 가능해 현장 대응력 강화.

**전제 (Twin파파 2026-04-20 확인)**:
- `plan.product_info.line`: `VARCHAR(255)`, 예시값 `TW(F16)`, `JP(F15)`, `FAB2`, `FOUNDRY`, `P4-D` 등 자유 문자열.
- **O/N 내 S/N별 line 혼재 가능성**:
  - 일반: O/N 단위로 line 동일 (S/N 4개 → 모두 같은 line)
  - 변경 케이스: "4개중에 한개만 바뀌는 경우는 그냥 오더번호 변경없이 진행되는 경우가 있음" → **1개 O/N 내 다른 line 존재 가능**
  - 계약 변경 수준: "전체적으로 line이 변경되면 오더번호가 계약 변경으로 바뀌지만" → O/N 자체가 분리되므로 혼재 아님

**표시 위치 및 포맷**:

#### 위치 1 — 생산현황 페이지 O/N 카드 헤더 (`SNStatusPage.tsx` `groupedByON` 렌더 블록)
현재: `오더번호 · 모델명 · 고객사 · {댓수}대`
변경: `오더번호 · 모델명 · 고객사 · **{line}** · {댓수}대`

혼재 규칙 (O/N 내 S/N별 line이 서로 다름) — **FE 계산 (Codex A4 반영: BE는 S/N별 `line`만 반환, 혼재 집계는 FE `groupedByON` 로직에서 도출)**:
- **대표값** = 최다 S/N의 line 값 (동률 시 사전순 1위)
- 표기: `F16 외 {N-1}` (예: 4건 중 F16이 3건, F15가 1건 → `F16 외 1`)
- 전부 NULL: 필드 자체 생략 (`오더번호 · 모델명 · 고객사 · {댓수}대`)

#### 위치 2 — S/N 상세뷰 헤더
현재: `고객사 · 출하일: YYYY-MM-DD` (혹은 유사 배치)
변경: `고객사 · {line} · 출하일: YYYY-MM-DD`

단일 S/N이라 혼재 처리 불필요. `line` NULL이면 해당 필드 생략.

**NULL / 빈값 처리 (클린 코어 원칙)**:
- `line IS NULL` / `""` → 렌더 자체 생략. "—" / "미정" 같은 placeholder **금지**.
- 혼재 집계 시 NULL은 카운트에서 제외 (대표값 계산 시 NULL row 무시).

**수정 파일 (예상 3개 — v4 기준: FE-20과 타입 공용, lineAgg FE 계산)**:
1. `app/src/types/snStatus.ts` — **FE-20에서 이미 `SNProduct` flat 4필드 확장 시 `line` 포함**. 본 FE-21은 타입 **추가 수정 없음** (FE-20과 동일 커밋 시). snake_case 유지.
   ```ts
   // FE-20에서 확장된 SNProduct (재확인용)
   export interface SNProduct {
     // ...기존 필드
     mech_partner: string | null;
     elec_partner: string | null;
     module_outsourcing: string | null;
     line: string | null;   // ← 본 FE-21이 소비
   }
   ```
   > **`line_mixed_count`는 BE 필드 아님** (Codex A4 / v4 유지). BE `progress_service.py`는 per-S/N `line` 문자열만 반환, O/N 카드 혼재 집계(최빈값 + "외 N")는 FE에서 계산.
2. `app/src/pages/production/SNStatusPage.tsx` — O/N 카드 헤더 JSX + `groupedByON` 블록에 혼재 집계 로직 추가 (**Codex A2: 실제 경로 확정 / v4: `product.line` 직접 참조**)
   ```tsx
   // groupedByON 내부에 per-group line 집계 helper 추가
   // ⚠️ v3 대비 변경: `s.product_info?.line` → `s.line` (SNProduct flat 참조)
   // ⚠️ v4 보정 (Codex M7): 실측 SNStatusPage.tsx L90/L101/L107 그룹 스키마는 `products: SNProduct[]` → group.items 아닌 `group.products` 사용. NULL line row 는 혼재 카운트에서 제외.
   const lineAgg = useMemo(() => {
     const counts = new Map<string, number>();
     let validCount = 0;                                         // ← NULL 제외 실카운트
     group.products.forEach((s: SNProduct) => {                  // ← items 아님, products
       const l = s.line?.trim();
       if (l) {
         counts.set(l, (counts.get(l) ?? 0) + 1);
         validCount++;
       }
     });
     if (counts.size === 0) return { label: null };              // 전체 NULL → 생략
     const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
     const [topLine, topCount] = sorted[0];
     const mixedCount = validCount - topCount;                   // ← group.products.length 아님 (NULL 오산 방지)
     return { label: mixedCount > 0 ? `${topLine} 외 ${mixedCount}` : topLine };
   }, [group.products]);                                         // ← deps 도 products
   ```
   > **NULL 혼재 처리 예시 (Codex M7 보정)**: `[F16, F16, F16, NULL]` → `validCount=3`, `topCount=3`, `mixedCount=0` → `"F16"` 만 표시 (NULL 은 "혼재"로 집계하지 않음). 반면 `[F16, F16, F16, F15]` → `validCount=4`, `topCount=3`, `mixedCount=1` → `"F16 외 1"`.
3. `app/src/components/sn-status/SNDetailPanel.tsx` — 상세뷰 헤더 JSX에 `product.line` 조건부 렌더 (단일 S/N이라 혼재 집계 불필요). 이미 L17 `product: SNProduct` prop 보유 → `product.line` 직접 참조.
   ```tsx
   {product.line && product.line.trim().length > 0 && (
     <span className="detail-line"> · {product.line}</span>
   )}
   ```
4. (선택) `app/src/components/sn-status/SNCard.tsx` — O/N 카드 내부 S/N 개별 라인 툴팁/배지 노출이 필요하면 함께 업데이트 (2차 개선 범위, 본 FE-21에서는 제외)

공용 포맷 헬퍼 (S/N 상세뷰용 — 혼재 없음):
```tsx
const formatLineLabel = (line: string | null | undefined): string | null => {
  if (!line || line.trim().length === 0) return null;
  return line;
};
```

**스타일 가이드**:
- 헤더 구분자는 기존과 동일 (중점 `·` 또는 세로선 `|`). 추가 규칙 없음.
- 혼재 표기(`F16 외 1`)는 툴팁으로 **전체 라인 목록**(줄바꿈 구분) 노출 권장 (옵션, 2차 개선).

**영향 범위**:
- 파일: 3개 (types 1 — FE-20과 공용 / SNStatusPage 집계·JSX / SNDetailPanel JSX)
- 예상 diff: 타입 +0줄(FE-20에서 이미 `line` 포함 확장), useMemo 집계 로직 +12줄, JSX +4줄 × 2 위치 = 약 20~24줄
- 기능 변경: UI 텍스트 **추가만** + FE 집계 로직 (순수함수), 필터·정렬 로직 무변경
- 회귀 위험: **매우 낮음** (타입 확장 + 순수 useMemo + 조건부 JSX, BE progress API 응답에 필드 1개 추가뿐 → 스테이징 육안 검증으로 해소 가능). **tasks API 타입·경로 무변경**. v3 대비 회귀 위험 등급 하향(Codex A6).

**검증 방법 (v4 기준)**:
1. BE FIX-25 배포 후 **`/api/app/product/progress`** 응답 products[n]에 `line` 필드 포함 확인 (v3 `/api/app/tasks/<sn>?all=true` → `product_info.line` 경로는 **폐기**):
   ```bash
   curl -s '<host>/api/app/product/progress' | jq '.products[] | {serial_number, sales_order, line}' | head -40
   ```
   (**BE 응답에는 `line_mixed_count` 필드 없음** — 혼재 집계는 FE `groupedByON` 내부 `lineAgg` useMemo에서 계산)
2. **tasks API 회귀 가드**: `curl /api/app/tasks/<sn>?all=true | jq 'type'` → `"array"` 그대로 확인 (v4 전환으로 tasks API 응답 구조 무변경 확정).
3. 스테이징에서:
   - 단일 라인 O/N (S/N 4개 모두 `F16`) → `F16`만 표시 (mixedCount=0)
   - 혼재 O/N (S/N 4개 중 3 `F16` / 1 `F15`) → `F16 외 1` 표시 (lineAgg 최빈값 + 차이수)
   - 동률 케이스 (2/2 혼재) → 사전순 1위 + `외 2` 표시
   - 전체 line NULL O/N → 필드 생략 확인
   - S/N 상세뷰 3 케이스: 단일 line / NULL / GST 자체생산 S/N
4. 고객사 필터링·O/N 정렬·페이지네이션 기존과 동일 동작 확인 (회귀)

**의존 관계**:
- 🔴 **BE 선행 필수**: FIX-25 (v4 — `progress_service.py` SELECT 확장 + pop 제거) 배포 완료 후 FE 착수.
- 🟡 **FE-20과 공용**: `SNProduct` flat 4필드 타입·상태관리 공유 (`line`은 FE-21이 소비, `mech_partner`/`elec_partner`/`module_outsourcing` 은 FE-20이 소비). 1 PR 병합 권장.
- ⏸️ **이력 추적 불요**: Twin파파 확인 — line 변경 이력 저장·표시 요구 없음 (DB 현재값만 표시).

**스코프 아웃 (명시)**:
- ❌ line 변경 이력 UI (감사 로그 탭 등) — **요구 아님**
- ❌ line 필터링/정렬 기능 — 향후 별도 이슈로 분리
- ❌ 혼재 라인 툴팁 전체 목록 표시 — 본 FE-21은 "외 N"만, 툴팁은 차후 개선

**작업 주체**: VSCode 터미널 (Claude + Codex 교차검증)

**우선순위**: **중간** (운영 가시성 개선)

**예상 소요**: 구현 40분 + 스테이징 육안 검증 20분 = 총 1시간

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
