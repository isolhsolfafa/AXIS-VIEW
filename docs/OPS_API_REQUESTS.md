# AXIS-OPS BE API 요청사항

> AXIS-VIEW FE 개발 중 AXIS-OPS BE에 필요한 엔드포인트/수정 사항을 관리합니다.
> AXIS-VIEW는 BE 코드 수정 금지 — 이 문서로 요청 전달.
> 마지막 업데이트: 2026-03-15 (#16 defect API 요청 추가)

---

## 요청 상태 범례

| 상태 | 설명 |
|------|------|
| PENDING | FE 구현 완료, BE 작업 대기 |
| DONE | BE 반영 완료, FE 연동 확인 |
| BLOCKED | BE 측 제약으로 보류 |

---

## QR 관리 (`/api/admin/qr`)

### 1. QR 목록 날짜 필터 파라미터 지원 — DONE (2026-03-08)

**엔드포인트**: `GET /api/admin/qr/list`

**요청 내용**: 아래 쿼리 파라미터 추가 지원

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `date_field` | string | 필터 기준 컬럼 (`mech_start` 또는 `module_start`) |
| `date_from` | string (YYYY-MM-DD) | 시작일 (이상) |
| `date_to` | string (YYYY-MM-DD) | 종료일 (이하) |

**FE 사용 예시**:
```
GET /api/admin/qr/list?date_field=mech_start&date_from=2026-03-01&date_to=2026-03-15
```

**목적**: QR 관리 페이지에서 기구시작/모듈시작 일정 기준으로 조회

**FE 현황**: 파라미터 전송 구현 완료 (`src/api/qr.ts`, `src/pages/qr/QrManagementPage.tsx`)

---

## 공지사항 (`/api/notices`)

### 2. 공지사항 목록 조회 — DONE (OPS Sprint 20-B)

**엔드포인트**: `GET /api/notices`

**설명**: OPS Sprint 20-B에서 BE 구현 완료. VIEW에서 동일 API 사용 가능.

**쿼리 파라미터**: `page`, `limit`, `is_pinned`

**응답 필드**: `notices[]` (id, title, content, version, is_pinned, created_by, author_name, created_at, updated_at), `total`, `page`, `limit`

**FE 현황**: ✅ API 연동 완료 (2026-03-11). Mock 제거, `useNotices` 훅으로 실시간 조회. Header badge도 API 기반 unread 카운트.

> 참고: OPS 문서에서는 `priority` 사용했지만 실제 BE는 `is_pinned`(boolean) + `version`(string) 구조

### 3. 공지사항 관리 (CRUD) — DONE (OPS Sprint 20-B)

**엔드포인트** (BE 구현 완료):

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| `GET` | `/api/notices` | 인증 필요 | 공지 목록 |
| `GET` | `/api/notices/:id` | 인증 필요 | 공지 상세 |
| `POST` | `/api/admin/notices` | is_admin | 공지 생성 |
| `PUT` | `/api/admin/notices/:id` | is_admin | 공지 수정 |
| `DELETE` | `/api/admin/notices/:id` | is_admin | 공지 삭제 (hard delete) |

**VIEW 작업**: ✅ Mock → API 전환 완료 (2026-03-11). `api/notices.ts`, `hooks/useNotices.ts` 추가.

---

## 권한 체계 (`is_admin` / `is_manager`)

### 현재 VIEW 구현 상태 (참고용, BE 수정 불필요)

VIEW FE에서는 이미 `is_admin || is_manager` 권한 체크가 완료되어 있음.

| 파일 | 체크 내용 |
|------|-----------|
| `src/api/auth.ts` (L57) | 로그인 시 `!is_admin && !is_manager` → 접근 차단 에러 |
| `src/components/auth/ProtectedRoute.tsx` (L33) | 라우트 진입 시 `!is_admin && !is_manager` → `/login` 리다이렉트 |

**권한 매핑**:

| 플래그 | 대상 | VIEW 접근 | VIEW 범위 |
|--------|------|-----------|-----------|
| `is_admin=true` | GST 내부 관리자 | 가능 | 전체 협력사 데이터 |
| `is_manager=true` | 협력사 대표/관리자 | 가능 | (추후) 자사 소속만 필터 가능 |
| 둘 다 false | 일반 작업자 | 차단 | OPS만 사용 |

### 4. OPS에서 is_manager 권한 부여 — DONE (Sprint 22-C, 2026-03-11)

**엔드포인트**: `PUT /api/admin/workers/:id/manager`

**권한**: `@manager_or_admin_required` (Sprint 22-C에서 변경)

**요청 Body**:
```json
{
  "is_manager": true
}
```

**권한 위임 구조** (Sprint 22-C 구현):
- Admin → 전체 작업자 is_manager 부여/해제
- 협력사 Manager → 같은 company 소속 작업자만 부여/해제
- Manager가 Admin 권한 변경 시도 → 403

**목적**: OPS에서 `is_manager=true`로 설정된 협력사 작업자가 VIEW 대시보드에 로그인 가능. 별도 VIEW 수정 불필요.

---

## ETL 변경 이력 (`/api/admin/etl`)

### 5. ETL 변경 이력 조회 — DONE (2026-03-11)

**엔드포인트**: `GET /api/admin/etl/changes`

**설명**: ETL UPSERT 시 기록된 `etl.change_log` 테이블 데이터 조회. VIEW 변경 이력 페이지(`/qr/changes`)에서 사용.

**인증**: Bearer 토큰 필수 (is_admin 또는 is_manager)

**쿼리 파라미터**:

| 파라미터 | 타입 | 설명 | 기본값 |
|----------|------|------|--------|
| `days` | int | 최근 N일 | 7 |
| `field` | string | 특정 필드만 필터 (`sales_order`, `ship_plan_date`, `mech_start`, `mech_partner`, `elec_partner`) | (전체) |
| `serial_number` | string | 특정 S/N만 | (전체) |
| `limit` | int | 최대 건수 | 100 |

**응답 예시**:
```json
{
  "changes": [
    {
      "id": 42,
      "serial_number": "GBWS-6408",
      "model": "SCR-1234",
      "field_name": "ship_plan_date",
      "field_label": "출하예정",
      "old_value": "2026-03-15",
      "new_value": "2026-03-22",
      "changed_at": "2026-03-09T09:15:00+09:00"
    }
  ],
  "summary": {
    "total_changes": 15,
    "by_field": {
      "ship_plan_date": 6,
      "mech_start": 4,
      "mech_partner": 3,
      "sales_order": 1,
      "elec_partner": 1
    }
  }
}
```

**참고**: `model`은 change_log에 없으므로 `plan.product_info` JOIN 필요. `field_label`은 BE에서 매핑 또는 FE에서 처리 가능.

**FE 현황**: ✅ API 연동 완료 (2026-03-11). `api/etl.ts` + `hooks/useEtlChanges.ts` + `EtlChangeLogPage.tsx` Mock→API 전환.

**DB 의존**: `etl.change_log` 테이블 (CORE-ETL Sprint 2 Task 1에서 생성) ✅

---

## QR 관리 추가 (`/api/admin/qr`)

### 6. QR 목록 응답에 actual_ship_date, status 포함 — PARTIAL (actual_ship_date: Sprint 24 예정)

**엔드포인트**: `GET /api/admin/qr/list` (기존 #1 확장)

**설명**: ETL에서 `actual_ship_date` 적재 + `qr_registry.status='shipped'` 처리 후, QR 목록 응답에 해당 필드 포함 필요.

**추가 응답 필드**:

| 필드 | 타입 | 설명 | DB 의존 |
|------|------|------|---------|
| `actual_ship_date` | string (YYYY-MM-DD) \| null | 실제 출고일 (Excel R열 "출고") | CORE-ETL Sprint 2 Task 3 |
| `status` | string | `active` \| `shipped` | qr_registry.status 변경 |
| `contract_type` | string \| null | 양산/신규/계약변경 (Excel N열 "신규여부") | CORE-ETL Sprint 2 — plan.product_info.contract_type 추가 |
| `sales_note` | string \| null | 영업 특이사항 (Excel CJ열) | CORE-ETL Sprint 1 — plan.product_info.sales_note 추가 |

**목적**: QR관리 페이지에서 출고 완료 건 구분 + 계약 유형 + 영업 메모 표시

**진행 상태**:
- `actual_ship_date`: DB 컬럼 ✅ + ETL 적재 ✅ + BE SELECT **누락** → OPS Sprint 24 Task 1에서 추가 예정
- `status`: ✅ 이미 응답에 포함 (active/shipped/revoked)
- `contract_type`: DB 컬럼 미추가 + step2 UPSERT 미포함 → 활용성 검토 후 진행 (OPS BACKLOG 아이디어에 등록)
- `sales_note`: 동일 — 활용성 검토 필요

---

## 데이터 범위 제한

### 7. is_manager 로그인 시 자사 데이터만 응답 — Sprint 24 예정

**대상 엔드포인트**:

| 엔드포인트 | 현재 | 변경 필요 |
|-----------|------|----------|
| `GET /api/admin/hr/attendance/daily` | 전체 협력사 데이터 반환 | is_manager → 자사 소속만 필터 |
| `GET /api/admin/qr/list` | 전체 S/N 반환 | is_manager → 자사 담당 S/N만 필터 |
| `GET /api/admin/etl/changes` | 전체 변경이력 반환 | 필터 불필요 (전체 접근 허용) |

**필터 기준 (제안)**:
- 출퇴근: `workers.company` = 로그인 사용자의 `company`
- QR 목록: `product_info.mech_partner` 또는 `elec_partner` = 사용자의 `company`
- ETL 변경이력: ~~위 QR 필터와 동일 범위의 S/N만~~ → 필터 불필요 (전체 접근 허용으로 결정)

**구현 방식 (제안)**:
```
# JWT 토큰에서 사용자 정보 추출
if worker.is_admin:
    → 전체 데이터
elif worker.is_manager:
    → WHERE company = worker.company (출퇴근)
    → WHERE mech_partner = worker.company OR elec_partner = worker.company (QR/ETL)
```

**FE 현황**: VIEW BACKLOG TASK-2에 등록. BE 분기 구현 후 FE 변경 불필요 (동일 API, 응답 범위만 달라짐).

### 8. GET /api/admin/workers 권한 완화 — DONE (OPS Sprint 23)

**엔드포인트**: `GET /api/admin/workers`

**현재 상태**: `@admin_required` → Manager 계정 403 Forbidden

**요청 내용**: `@admin_required` → `@manager_or_admin_required`로 데코레이터 변경

**변경 위치**: `backend/app/routes/admin.py` L184-186
```python
# 현재
@admin_bp.route("/workers", methods=["GET"])
@jwt_required
@admin_required        # ← 이것을
def get_workers():

# 변경 요청
@admin_bp.route("/workers", methods=["GET"])
@jwt_required
@manager_or_admin_required  # ← 이것으로
def get_workers():
```

**사유**:
- 권한 관리 페이지(`/admin/permissions`)에서 Manager 계정이 자사 작업자 목록을 조회해야 함
- `PUT /api/admin/workers/:id/manager` (Toggle)은 이미 `@manager_or_admin_required`로 되어 있음 (Sprint 22-C)
- 목록 조회(GET)만 admin 전용이라 Manager가 페이지 진입 시 403 발생

**FE 현황**: Manager 로그인 시 `w.company === currentUser.company` FE 필터링 이미 구현 완료. BE에서 전체 목록을 내려줘도 FE에서 자사만 표시함.

**보안 참고**: Manager에게 전체 작업자 목록이 노출되는 것이 우려되면, BE에서도 `is_manager → 자사 소속만 응답`하는 필터를 추가하면 됨 (선택적).

**테스트 결과 (2026-03-11)**:
- Admin 로그인 → 권한 Toggle 동작 ✅ Pass
- Manager 로그인 → `GET /api/admin/workers` 403 Forbidden ❌

---

## 공장 대시보드 (`/api/admin/factory`)

### 9. 주간 공장 KPI — DONE (2026-03-15)

**엔드포인트**: `GET /api/admin/factory/weekly-kpi`

**권한**: `@gst_or_admin_required` (공장 대시보드 전용 — #11 참조)

**쿼리 파라미터**:

| 파라미터 | 타입 | 설명 | 기본값 |
|----------|------|------|--------|
| `week` | int | ISO week 번호 (1~53) | 현재 주 |
| `year` | int | 연도 | 현재 연도 |

**응답 예시**:
```json
{
  "week": 11,
  "year": 2026,
  "week_range": {
    "start": "2026-03-09",
    "end": "2026-03-15"
  },
  "production_count": 37,
  "completion_rate": 62.5,
  "by_model": [
    { "model": "GAIA-I DUAL", "count": 30 },
    { "model": "GAIA-P", "count": 3 },
    { "model": "GAIA-I", "count": 3 },
    { "model": "SWS-I", "count": 1 }
  ],
  "by_stage": {
    "mech": 85.2,
    "elec": 60.0,
    "tm": 45.0,
    "pi": 30.0,
    "qi": 12.0,
    "si": 5.0
  },
  "pipeline": {
    "pi": 11,
    "qi": 9,
    "si": 7,
    "shipped": 17
  }
}
```

**응답 필드 설명**:

| 필드 | 설명 |
|------|------|
| `production_count` | `finishing_plan_end`가 해당 ISO week(월~일)에 속하는 S/N 수 |
| `completion_rate` | Option B — 해당 S/N들의 평균 공정 완료율 (%) |
| `by_model` | 모델별 S/N 수 (bar chart + donut chart 용) |
| `by_stage` | 공정별 완료율 — 해당 주 S/N 중 각 단계 완료된 비율 (%) |
| `pipeline` | GST 공정 파이프라인 건수 — 가압(PI)/공정(QI)/마무리(SI)/출하 단계별 현재 대수 |
| `pipeline.shipped` | `finishing_plan_end`가 해당 주이고 `finishing_plan_end <= TODAY`인 S/N 수 (계획일 기준 출하 카운트) |

**쿼리 로직**:
```sql
-- 1) 대상 S/N 추출
SELECT serial_number, model
FROM plan.product_info
WHERE finishing_plan_end >= ISO_WEEK_START AND finishing_plan_end <= ISO_WEEK_END

-- 2) completion_status LEFT JOIN → 6단계 완료 여부
-- 3) TM 해당 여부: model prefix 'GAIA' → is_tms=true → 6단계, 나머지 → 5단계 (TM 제외)
-- 4) completion_rate = AVG(완료단계수 / 해당단계수) * 100
-- 5) by_stage.mech = (mech_completed=true인 S/N 수 / 전체 S/N 수) * 100
--    by_stage.tm = TM 해당 S/N 중 tm_completed=true 비율 (비해당 S/N 제외)
```

**공정 단계 (자주검사 제거, PI 유지)**:
- MECH → ELEC → (TM) → PI → QI → SI
- `model LIKE 'GAIA%'` → `is_tms=true` → TM 포함 6단계 (분모=6)
- 그 외 모델 → TM 제외 5단계 (분모=5)
- `by_stage.tm`은 TM 해당 모델의 S/N만 분모로 사용
- 자주검사 단계 삭제 — 테이블 미존재, 분류 없음

**목적**: 공장 대시보드 1행 KPI 카드 (주간 생산량, 완료율) + 2행 차트 (모델별 bar chart, 도넛)

**FE 사용처**: `FactoryDashboardPage.tsx` — KPI 카드 + 주간 생산 지표 차트

---

### 10. 월간 생산 현황 — DONE (2026-03-15)

**엔드포인트**: `GET /api/admin/factory/monthly-detail`

**권한**: `@view_access_required` (생산일정 페이지 공유 — #11 참조)

**쿼리 파라미터**:

| 파라미터 | 타입 | 설명 | 기본값 |
|----------|------|------|--------|
| `month` | string | `YYYY-MM` 형식 | 현재 월 |
| `date_field` | string | 필터 기준 컬럼 (`pi_start` \| `mech_start`) | `pi_start` |
| `page` | int | 페이지 번호 | 1 |
| `per_page` | int | 페이지당 건수 (max: 200) | 50 |

**필터 기준 용도**:
- `pi_start` (기본값): GST 인원용 — 가압시작 기준으로 이번 달에 GST 공정 진입하는 S/N
- `mech_start`: 협력사용 — 기구시작 기준으로 이번 달에 협력사 작업 시작하는 S/N

**응답 예시**:
```json
{
  "month": "2026-03",
  "items": [
    {
      "sales_order": "6408",
      "product_code": "41000558",
      "serial_number": "GBWS-6408",
      "model": "GAIA-I DUAL",
      "customer": "SEC",
      "line": "15L",
      "mech_partner": "BAT",
      "elec_partner": "C&A",
      "mech_start": "2026-03-03",
      "mech_end": "2026-03-10",
      "elec_start": "2026-03-08",
      "elec_end": "2026-03-15",
      "pi_start": "2026-03-14",
      "qi_start": "2026-03-16",
      "si_start": "2026-03-18",
      "finishing_plan_end": "2026-03-20",
      "completion": {
        "mech": true,
        "elec": false,
        "tm": null,
        "pi": false,
        "qi": false,
        "si": false
      },
      "progress_pct": 16.7
    }
  ],
  "by_model": [
    { "model": "GAIA-I DUAL", "count": 81 },
    { "model": "GAIA-P DUAL", "count": 12 },
    { "model": "GAIA-P", "count": 10 }
  ],
  "total": 119,
  "page": 1,
  "per_page": 50,
  "total_pages": 3
}
```

**응답 필드 설명**:

| 필드 | 타입 | 설명 |
|------|------|------|
| `sales_order` | string | 오더번호 (O/N) |
| `product_code` | string | 제품번호 |
| `serial_number` | string | S/N |
| `model` | string | 모델명 |
| `customer` | string | 고객사 |
| `line` | string | 라인 |
| `mech_partner` | string | 기구업체 |
| `elec_partner` | string | 전장업체 |
| `mech_start` | date \| null | 기구시작 |
| `mech_end` | date \| null | 기구종료 |
| `elec_start` | date \| null | 전장시작 |
| `elec_end` | date \| null | 전장종료 |
| `pi_start` | date \| null | 가압시작 (PI) |
| `qi_start` | date \| null | 공정시작 (QI) |
| `si_start` | date \| null | 마무리 (SI) |
| `finishing_plan_end` | date \| null | 출하예정 |
| `completion.mech` | bool | 기구 공정 완료 여부 |
| `completion.elec` | bool | 전장 공정 완료 여부 |
| `completion.tm` | bool \| null | TM 완료 (`null` = 비해당 모델) |
| `completion.pi` | bool | 가압검사 완료 여부 |
| `completion.qi` | bool | 공정검사 완료 여부 |
| `completion.si` | bool | 마무리 완료 여부 |
| `progress_pct` | float | 완료단계 / 해당단계 * 100 |
| `by_model[]` | array | 월간 모델별 S/N 수 (호리즌 bar chart 용) |

**쿼리 로직**:
```sql
SELECT p.sales_order, p.product_code, p.serial_number, p.model,
       p.customer, p.line, p.mech_partner, p.elec_partner,
       p.mech_start, p.mech_end, p.elec_start, p.elec_end,
       p.pi_start, p.qi_start, p.si_start, p.finishing_plan_end,
       cs.mech_completed, cs.elec_completed, cs.tm_completed,
       cs.pi_completed, cs.qi_completed, cs.si_completed
FROM plan.product_info p
LEFT JOIN completion_status cs ON p.serial_number = cs.serial_number
WHERE p.{date_field} >= '2026-03-01' AND p.{date_field} < '2026-04-01'
ORDER BY p.{date_field} DESC

-- date_field: 'pi_start' (GST 기본) or 'mech_start' (협력사)
-- TM 판별: model LIKE 'GAIA%' → tm 값 반환, 나머지 → null
-- progress_pct: 완료된 true 수 / 해당단계 수 * 100 (GAIA=6단계, 나머지=5단계)
```

**공정 단계 (자주검사 제거, PI 유지)**:
- 공정단계: MECH → ELEC → (TM) → PI → QI → SI
- 진행률 분모: GAIA 계열 = 6단계 (MECH/ELEC/TM/PI/QI/SI), 나머지 = 5단계 (MECH/ELEC/PI/QI/SI)
- 자주검사: 테이블 미존재, 분류 없음 → 제외

**목적**: 공장 대시보드 3행 생산 현황 상세 + 4행 월간 호리즌 bar + **생산일정 페이지 테이블** (신규 엔드포인트 없이 공유)

**FE 사용처**:
- `FactoryDashboardPage.tsx` — 생산 현황 상세 테이블 + 월간 생산 지표
- `ProductionPlanPage.tsx` — 생산일정 16컬럼 테이블 (동일 API 사용, 자주검사 제거)

---

## 추후 검토 — 서드파티 연동

### 제조 생산 일정 스케줄러 (Google Apps Script)
- **URL**: Google Apps Script 기반 사내 서드파티 앱
- **기능**: 가압검사/제조품질검사/공정검사/마무리/출하 5탭 칸반 보드 (일별 S/N 카드)
- **데이터 소스**: Teams Excel 동일 소스 추정
- **연동 검토 사항**:
  - Google Apps Script → 사내서버 Push: 보안상 불가
  - OPS에서 Pull 방식 검토 필요 (Google Sheets API or Apps Script Web API)
  - DB 구조 분석 후 OPS 연동 방법 결정
  - 출하 완료 실적 데이터를 이 앱에서 가져올 수 있으면 `actual_ship_date` 정확도 향상 가능
- **현재 방침**: 출하 카운트는 `finishing_plan_end` 계획일 기준으로 우선 진행, 추후 연동 시 실적 기반으로 전환

---

## AXIS-VIEW 권한 체계 재정비 — DONE (2026-03-13)

### 11. 권한 데코레이터 신설 + 기존 API 권한 변경 — DONE

**배경**: AXIS-VIEW 사이드바 권한 테스트 결과, FE/BE 간 권한 불일치 발생. GST 일반 직원(PI, QI 등)이 FE에서는 페이지 진입되지만 BE API에서 403 반환되는 케이스 확인.

**AXIS-VIEW 접근 게이트**: AXIS-VIEW 로그인 가능 사용자는 아래 3가지뿐:
- `is_admin=true` (GST 관리자)
- `company='GST'` (GST 전직원)
- `is_manager=true` (협력사 관리자)

**확정 권한 매트릭스**:

| 메뉴 | admin | GST+manager (PM) | GST+일반 (PI,QI) | 협력사+manager |
|------|-------|-------------------|-------------------|----------------|
| 공장 대시보드 | ✅ | ✅ | ✅ | ❌ |
| 협력사 관리 | ✅ | ✅ | ❌ | ✅(자사) |
| 생산관리 | ✅ | ✅ | ✅ | ✅ |
| QR 관리 | ✅ | ✅ | ✅ | ✅ |
| 권한 관리 | ✅ | ✅(GST만) | ❌ | ✅(자사) |
| 불량 분석 | ✅ | ✅ | ✅ | ❌ |
| CT 분석 | ✅ | ✅ | ✅ | ❌ |
| AI 예측/챗봇 | ✅ | ✅ | ✅ | ❌ |

---

#### 11-A. 신규 데코레이터 2개 추가 요청

**파일**: `backend/app/middleware/jwt_auth.py`

**1) `@gst_or_admin_required`** — GST 전직원 + Admin

```python
def gst_or_admin_required(f):
    """GST 소속 전직원 또는 Admin만 허용.
    용도: 공장 대시보드, 불량 분석, CT 분석 등 GST 전용 페이지 API"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(g, 'worker_id'):
            return jsonify({'error': 'UNAUTHORIZED', 'message': '인증이 필요합니다.'}), 401
        worker = get_worker_by_id(g.worker_id)
        if not worker or (worker.company != 'GST' and not worker.is_admin):
            return jsonify({'error': 'FORBIDDEN', 'message': 'GST 소속 또는 관리자 권한이 필요합니다.'}), 403
        return f(*args, **kwargs)
    return decorated_function
```

**대상 API**: 공장 대시보드 전용 (#9 weekly-kpi)

**2) `@view_access_required`** — AXIS-VIEW 접근 가능 전원

```python
def view_access_required(f):
    """AXIS-VIEW 접근 가능 사용자만 허용: GST 소속 OR is_admin OR is_manager.
    용도: QR 관리, 생산관리 등 VIEW 사용자 전체 공개 API"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(g, 'worker_id'):
            return jsonify({'error': 'UNAUTHORIZED', 'message': '인증이 필요합니다.'}), 401
        worker = get_worker_by_id(g.worker_id)
        if not worker or (worker.company != 'GST' and not worker.is_admin and not worker.is_manager):
            return jsonify({'error': 'FORBIDDEN', 'message': 'AXIS-VIEW 접근 권한이 필요합니다.'}), 403
        return f(*args, **kwargs)
    return decorated_function
```

**대상 API**: QR 목록, ETL 변경이력, 생산 관련 등

---

#### 11-B. 기존 API 데코레이터 변경

| # | 엔드포인트 | 현재 데코레이터 | 변경 데코레이터 | 사유 |
|---|-----------|----------------|----------------|------|
| 1 | `GET /api/admin/qr/list` | `@manager_or_admin_required` | `@view_access_required` | QR 관리 전체 공개 — GST 일반(PI,QI) 403 해소 |
| 2 | `GET /api/admin/etl/changes` | `@manager_or_admin_required` | `@view_access_required` | 변경이력 전체 공개 — 동일 사유 |
| 3 | `GET /api/admin/factory/weekly-kpi` (#9) | `@manager_or_admin_required` | `@gst_or_admin_required` | 공장 대시보드 전용 — 협력사 manager 접근 차단 |
| 4 | `GET /api/admin/factory/monthly-detail` (#10) | `@manager_or_admin_required` | `@view_access_required` | 생산일정 페이지 공유 — 협력사 manager도 사용 |
| 5 | `GET /api/admin/workers` | `@manager_or_admin_required` | 변경 없음 | 권한 관리 — admin+manager만 필요 (현재 OK) |
| 6 | `PUT /api/admin/workers/:id/manager` | `@manager_or_admin_required` | 변경 없음 | 권한 Toggle — 현재 OK |

**변경 위치 상세**:

```python
# 1) qr.py L20-22
@qr_bp.route("/list", methods=["GET"])
@jwt_required
@view_access_required      # 기존: @manager_or_admin_required

# 2) admin.py L1919-1921
@admin_bp.route("/etl/changes", methods=["GET"])
@jwt_required
@view_access_required      # 기존: @manager_or_admin_required
```

---

#### 11-C. FE 수정 사항 (VIEW 자체 처리 — BE 참고용)

FE에서 Sidebar 필터와 ProtectedRoute의 `if (isGst) return true` 일괄 우회 제거 후, 매트릭스 기준으로 세분화 적용 예정.

| 사용자 유형 | 판별 조건 | 접근 가능 메뉴 |
|---|---|---|
| admin | `is_admin === true` | 전체 |
| GST+manager | `company === 'GST' && is_manager` | 전체 |
| GST+일반 | `company === 'GST' && !is_admin && !is_manager` | 공장, 생산, QR, 불량, CT, AI |
| 협력사+manager | `company !== 'GST' && is_manager` | 협력사(자사), 생산, QR, 권한(자사) |

---

#### 11-D. 데코레이터 체계 요약 (변경 후)

| 데코레이터 | 조건 | 용도 |
|---|---|---|
| `@admin_required` (기존) | `is_admin` | 시스템 설정, 가입 승인 등 |
| `@manager_or_admin_required` (기존) | `is_admin OR is_manager` | 권한 관리, 출퇴근 등 |
| `@gst_or_admin_required` (신규) | `company='GST' OR is_admin` | 공장 대시보드 전용 API |
| `@view_access_required` (신규) | `company='GST' OR is_admin OR is_manager` | VIEW 전체 공개 API (QR, 생산 등) |

---

## ETL 변경 이력 추적 필드 확장

### 14. pi_start (가압시작) 변경 추적 추가 — DONE (2026-03-14)

**배경**: 현재 ETL 변경 추적 대상은 5개 필드. 가압시작(`pi_start`) 일정 변경도 VIEW 변경이력 페이지에서 확인 필요.

**변경 대상 3곳**:

| # | 프로젝트 | 파일 | 변경 내용 |
|---|----------|------|----------|
| 1 | **AXIS-CORE** | `CORE-ETL/step2_load.py` L35-41 | `TRACKED_FIELDS`에 `'pressure_test': 'pi_start'` 추가 |
| 2 | **AXIS-OPS** | `backend/app/routes/admin.py` L1910-1916 | `_FIELD_LABELS`에 `'pi_start': '가압시작'` 추가 |
| 3 | **AXIS-VIEW** | `app/src/pages/qr/EtlChangeLogPage.tsx` L14-22 | `FIELD_CONFIG`에 `pi_start` 추가 + `DATE_FIELDS`에 추가 |

**상세**:

#### 14-1. AXIS-CORE ETL (step2_load.py)

```python
# 현재 (5개)
TRACKED_FIELDS = {
    'order_no':       'sales_order',
    'planned_finish': 'ship_plan_date',
    'mech_start':     'mech_start',
    'mech_partner':   'mech_partner',
    'elec_partner':   'elec_partner',
}

# 변경 후 (6개)
TRACKED_FIELDS = {
    'order_no':       'sales_order',
    'planned_finish': 'ship_plan_date',
    'mech_start':     'mech_start',
    'pressure_test':  'pi_start',       # 신규
    'mech_partner':   'mech_partner',
    'elec_partner':   'elec_partner',
}
```

- ETL 키 `pressure_test`는 step1에서 Excel "가압검사" 컬럼을 파싱한 값
- DB 컬럼 `pi_start`는 이미 `plan.product_info`에 존재 (UPSERT에도 포함)
- `_build_existing_cache()`의 SELECT에 `pi_start` 추가 필요

#### 14-2. AXIS-OPS BE (admin.py)

```python
# 현재
_FIELD_LABELS = {
    'sales_order': '판매오더',
    'ship_plan_date': '출하예정',
    'mech_start': '기구시작',
    'mech_partner': '기구외주',
    'elec_partner': '전장외주',
}

# 변경 후
_FIELD_LABELS = {
    'sales_order': '판매오더',
    'ship_plan_date': '출하예정',
    'mech_start': '기구시작',
    'pi_start': '가압시작',          # 신규
    'mech_partner': '기구외주',
    'elec_partner': '전장외주',
}
```

#### 14-3. AXIS-VIEW FE (EtlChangeLogPage.tsx)

```typescript
// FIELD_CONFIG에 추가
pi_start: { label: '가압시작', color: '#EC4899', bg: '#FDF2F8' },

// DATE_FIELDS에 추가
const DATE_FIELDS = new Set(['ship_plan_date', 'mech_start', 'pi_start']);
```

- KPI 카드 그리드: 5열 → 6열 (`gridTemplateColumns: 'repeat(6, 1fr)'`)
- kpiCards 배열에 `pi_start` 추가

**DB 스키마 변경**: 없음 (`etl.change_log.field_name`은 VARCHAR — 새 값 자동 수용)

**참고**: 다음 ETL 실행부터 pi_start 변경이 기록되며, 기존 이력은 소급 불가.

---

### 15. ETL summary 카운트 limit 독립 — DONE (2026-03-14)

**파일**: `backend/app/routes/admin.py` L1971-1985

**증상**: 변경이력 summary 카드의 `total_changes`가 200건으로 고정 (실제 339건)

**원인**: summary를 `LIMIT` 적용된 rows에서 `len(changes)`로 계산하여 limit에 영향받음

**수정**: summary용 `GROUP BY` 쿼리를 별도 실행하여 limit과 무관한 전체 건수 반환

**커밋**: `e82e75f` (AXIS-OPS main)

---

### 16. 불량 현황 조회 API (QMS 연동) — PENDING

**요청일**: 2026-03-15

**엔드포인트**: `GET /api/admin/factory/defects`

**인증**: `@view_access_required` (admin + GST+manager)

**목적**: 공장 대시보드 KPI 카드 "불량 건수" 표시 + 활동 피드에 불량 이벤트 노출

**요청 파라미터**:

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `days` | int (default: 7) | 최근 N일 범위 |
| `limit` | int (default: 20) | 최대 건수 |

**응답 포맷 (희망)**:

```json
{
  "total_defects": 12,
  "defect_rate": 3.2,
  "defects": [
    {
      "id": 1,
      "serial_number": "SN-001",
      "model": "MODEL-A",
      "defect_type": "가압검사 불량",
      "part": "BULKHEAD UNION",
      "partner": "FNI",
      "detected_at": "2026-03-15T10:30:00+09:00",
      "description": "가압검사 누설 발견"
    }
  ]
}
```

**FE 사용처**:
1. KPI 카드 "불량 건수" — `total_defects` 표시 (현재 `—` placeholder)
2. 활동 피드 — `defects[]` 배열을 ETL/생산완료 이벤트와 시간순 merge

**참고**: QMS 데이터 스키마는 etl/defect에 load 되어 있으나 data thread가 미정의 상태. BE에서 어떤 테이블/뷰에서 집계할지 결정 필요.

---

## 해결 완료

### 13. QR 목록 자사 필터 제거 — DONE (2026-03-13)

**파일**: `backend/app/routes/qr.py`

**변경**: `is_manager` 로그인 시 `WHERE mech_partner = company OR elec_partner = company` 자사 필터 제거.

**사유**: QR 데이터는 협력사 manager에게도 전체 공개. 기존 필터가 `workers.company` (`TMS(M)`, `TMS(E)`)와 `product_info.mech_partner` (`TMS`) 이름 불일치로 0건 반환 문제 발생.

**커밋**: `359af87` (AXIS-OPS main)

---

### 12. Admin prefix 로그인 버그 — DONE (2026-03-13)

**파일**: `backend/app/models/worker.py` L279-321 (`get_admin_by_email_prefix`)

**증상**: `admin1234` 또는 `admin` prefix로 로그인 시 "등록되지 않은 계정입니다" 에러. 전체 이메일(`admin1234@gst-in.com`)은 정상.

**원인**: `rows = cur.fetchall()` (L311)이 `if len(rows) == 0:` 블록 바깥에 위치하여, 1차 매칭(`prefix@%`)이 성공해도 이미 소진된 커서를 다시 fetch → 빈 리스트 반환 → `None`.

```python
# 버그 코드 (L304-313)
if len(rows) == 0:
    cur.execute("SELECT ... WHERE email LIKE %s ...", (prefix + '%',))

rows = cur.fetchall()   # ← 항상 실행됨! 1차 성공 시 빈 리스트 반환
```

**수정**: `rows = cur.fetchall()`을 `if` 블록 안으로 이동하여 2차 쿼리 실행 시에만 재할당.

```python
# 수정 코드
if len(rows) == 0:
    cur.execute("SELECT ... WHERE email LIKE %s ...", (prefix + '%',))
    rows = cur.fetchall()   # ← 2차 쿼리 시에만 실행
```

**커밋**: `23c60c0` (AXIS-OPS main)

---

### QR 목록 조회 500 에러 — DONE (2026-03-07)

**엔드포인트**: `GET /api/admin/qr/list`

**증상**: JWT 토큰 정상 전송 시 500 INTERNAL_ERROR 반환

**해결**: BE 측 수정 완료 → 200 정상 반환
