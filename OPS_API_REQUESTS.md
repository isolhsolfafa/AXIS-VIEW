# AXIS-OPS BE API 요청사항

> AXIS-VIEW FE 개발 중 AXIS-OPS BE에 필요한 엔드포인트/수정 사항을 관리합니다.
> AXIS-VIEW는 BE 코드 수정 금지 — 이 문서로 요청 전달.
> 마지막 업데이트: 2026-04-23 (#62 Sprint 62-BE v2.3 AMENDED — weekly-kpi WHERE 절 원안 복원 요청 / FE v1.35.0 배포 완료)

---

## 요청 상태 범례

| 상태 | 설명 |
|------|------|
| 🟡 PROPOSAL | FE 제안서 — BE 합의 전 + Codex 교차검증 전 |
| PENDING | 합의 완료, FE 구현 완료 + BE 작업 대기 |
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

### 16. 불량 현황 조회 API (QMS 연동) — 🟡 BACKLOG (장기, 2026-04-17 Twin파파 확정)

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

### 17. 공장 API 협력사 manager 접근 허용 — ✅ DONE (2026-04-17 상태 확인)

**요청일**: 2026-03-16

**대상 엔드포인트**:

| 엔드포인트 | 현재 데코레이터 | 문제 |
|----------|--------------|------|
| `GET /api/admin/factory/weekly-kpi` | `@gst_or_admin_required` | `is_admin=true` OR `company='GST'`만 허용 → 협력사 manager 차단 |
| `GET /api/admin/factory/monthly-detail` | `@view_access_required` | `is_admin=true` OR (`company='GST'` + `is_manager`)만 허용 → 협력사 manager 차단 |

**증상**: VIEW FE에서 공장 대시보드/생산일정 페이지 접근은 허용했으나 (`allowedRoles: ['admin', 'manager', 'gst']`), BE API가 403 반환 → 데이터 없음 표시

**요청 내용**: 협력사 manager (`is_manager=true`, `company != 'GST'`)도 공장 API 조회 가능하도록 데코레이터 수정

**수정 방안** (택 1):
1. 두 엔드포인트 모두 `@view_access_required`로 통일 + `@view_access_required`에 `is_manager=true`면 company 무관 허용 조건 추가
2. 새 데코레이터 `@manager_or_above_required` 신설 — `is_admin` OR `is_manager` 체크

**파일**: `backend/app/routes/factory.py`

**FE 상태**: 라우팅 + 사이드바 이미 manager 허용 → BE 수정 시 자동 반영

---

### 19. monthly-detail 응답에 ship_plan_date 추가 — ✅ DONE (2026-04-17 상태 확인)

**요청일**: 2026-03-16

**엔드포인트**: `GET /api/admin/factory/monthly-detail`

**증상**: 생산일정 출하 파이프라인 카운트가 `finishing_plan_end`(마무리종료/출하예정) 기준으로 집계되어 실제 출하계획일과 불일치

**요청 내용**: 응답 `items[]`에 `ship_plan_date` (출하계획일, Excel U열) 필드 추가

**DB 컬럼**: `plan.product_info.ship_plan_date` — 이미 존재 (ETL step2에서 `planned_finish` → `ship_plan_date`로 UPSERT)

**수정 위치**: `factory.py` monthly-detail SELECT 쿼리에 `p.ship_plan_date` 추가

```sql
-- 현재
SELECT p.sales_order, ..., p.finishing_plan_end, ...

-- 변경 후
SELECT p.sales_order, ..., p.finishing_plan_end, p.ship_plan_date, ...
```

**FE 사용처**:
- `ProductionPlanPage.tsx` — 출하 파이프라인 circle 카운트 (STAGE_FILTERS shipped dateKey)
- `ProductionPlanPage.tsx` — 테이블 "출하계획" 컬럼

**용도 분리**:
| 필드 | 용도 | 사용 페이지 |
|------|------|-----------|
| `finishing_plan_end` | 주간 생산지표 (weekly-kpi pipeline.shipped 집계 기준) | 공장 대시보드 |
| `ship_plan_date` | 출하계획일 (생산일정 출하 카운트/필터 기준) | 생산일정 |

**FE 상태**: FE 타입 + UI 변경 완료 (`ship_plan_date` 추가). BE 응답에 필드 추가 시 자동 반영.

---

### 18. weekly-kpi 주차 동기화 오류 — ✅ DONE (2026-04-17 상태 확인)

**요청일**: 2026-03-16

**엔드포인트**: `GET /api/admin/factory/weekly-kpi`

**증상**: 오늘(2026-03-16, 월요일)은 ISO W12(03-16 ~ 03-22)인데, 파라미터 없이 호출 시 **W11(03-09 ~ 03-15)** 데이터를 반환

**확인 결과**:
```
오늘: 2026-03-16 → Python isocalendar() → W12
API 응답: week: 11, year: 2026, range: 03-09 ~ 03-15
```

**원인 추정**:
- `factory.py`에서 `week` 미지정 시 기본값 계산 로직이 "현재 주차"가 아닌 "직전 완료 주차"를 반환
- 또는 주차 시작 기준이 일요일/월요일로 달라서 1주 차이 발생

**확인 필요**:
- `factory.py`의 기본 week 계산 로직 (`datetime.isocalendar()` vs 커스텀 계산)
- 의도적으로 "직전 완료 주차"를 반환하는 것인지, 버그인지 확인

**FE 영향**: KPI 카드 "주간 생산량" + 공정별 완료율 + 모델별 차트가 전부 지난 주 기준으로 표시됨

---

### 20. monthly-detail per_page 상한 완화 — ✅ DONE (2026-04-17 상태 확인)

**요청일**: 2026-03-16

**엔드포인트**: `GET /api/admin/factory/monthly-detail`

**증상**: FE에서 `per_page=500` 요청 시 BE가 200으로 잘라서 반환 → 총 208건 중 200건만 표시, 8건 누락

**확인 결과**:
```
요청: per_page=500
응답: per_page=200, total=208, total_pages=2, items_returned=200
```

**요청 내용**: `per_page` 상한을 500으로 완화 (또는 VIEW 전용 `per_page` 상한 별도 설정)

**수정 위치**: `factory.py` monthly-detail 엔드포인트의 `per_page` max 검증 로직

**사유**: 생산일정 페이지는 클라이언트 사이드 필터/정렬/페이지네이션 → 전체 데이터를 한 번에 fetch해야 정확한 카운트/필터 가능. 200건 제한 시 공정별 카운트, 검색 결과가 불완전.

**FE 상태**: `per_page: 500` 요청 중. BE 상한 완화 시 자동 반영.

---

## 생산실적 (`/api/admin/production`)

### 23. 생산실적 조회 — O/N 단위 공정별 progress + 실적확인 이력 — ✅ DONE (2026-04-17 상태 확인)

**요청일**: 2026-03-19

**엔드포인트**: `GET /api/admin/production/performance`

**권한**: `@view_access_required`

**쿼리 파라미터**:

| 파라미터 | 타입 | 설명 | 기본값 |
|----------|------|------|--------|
| `week` | string | ISO 주차 (예: `W11`) | 현재 주 |
| `month` | string | `YYYY-MM` | 현재 월 |
| `view` | string | `weekly` \| `monthly` | `weekly` |

**응답 예시 (weekly)**:

```json
{
  "week": "W12",
  "month": "2026-03",
  "orders": [
    {
      "sales_order": "6238",
      "model": "GAIA-I DUAL",
      "sns": [
        {
          "serial_number": "GBWS-6627",
          "mech_partner": "BAT",
          "elec_partner": "C&A",
          "progress": {
            "MECH": { "total": 7, "done": 7, "pct": 100 },
            "ELEC": { "total": 6, "done": 4, "pct": 66 },
            "TM":   { "total": 2, "done": 1, "pct": 50, "tank_module_done": true, "pressure_test_done": false }
          },
          "checklist": {
            "MECH": { "completed": true, "completed_at": "2026-03-15T14:30:00+09:00" },
            "ELEC": { "completed": false, "completed_at": null }
          }
        }
      ],
      "sn_count": 3,
      "sn_summary": "GBWS-6627~6629",
      "partner_info": { "mech": "BAT", "elec": "C&A", "mixed": false },
      "process_status": {
        "MECH": { "ready": 3, "total": 3, "checklist_ready": 3, "confirmable": true },
        "ELEC": { "ready": 1, "total": 3, "checklist_ready": 0, "confirmable": false },
        "TM":   { "ready": 2, "total": 3, "confirmable": false }
      },
      "confirms": [
        { "id": 1, "process_type": "MECH", "confirmed_week": "W12", "confirmed_by": "김동규", "confirmed_at": "2026-03-15T16:00:00+09:00" }
      ]
    }
  ],
  "summary": {
    "total_orders": 8,
    "mech_confirmable": 5,
    "elec_confirmable": 3,
    "tm_confirmable": 2
  }
}
```

**응답 필드 설명**:

| 필드 | 설명 |
|------|------|
| `orders[]` | O/N 단위 그룹핑 목록 |
| `sns[].progress` | S/N별 공정 진행률 (task 기준) |
| `sns[].progress.TM.tank_module_done` | TM 실적 기준 — TANK_MODULE task 완료 여부 |
| `sns[].checklist` | S/N별 자주검사 체크리스트 완료 여부 (`checklist.checklist_record` 기반) |
| `process_status.confirmable` | O/N 전체 S/N이 해당 공정 조건 충족 시 true |
| `confirms[]` | 기존 실적확인 이력 (`plan.production_confirm`) |
| `summary` | 일괄확인용 건수 집계 |

**실적확인 가능 조건 (`confirmable = true`)**:

| 공정 | 조건 |
|------|------|
| MECH | 모든 S/N의 MECH 생산 task 완료 + SELF_INSPECTION 체크리스트 완료 |
| ELEC | 모든 S/N의 ELEC 생산 task 완료 + INSPECTION 체크리스트 완료 |
| TM | 모든 S/N의 TANK_MODULE task 완료 (PRESSURE_TEST 무관) |

**데이터 소스**:
- `app_task_details` — task별 progress (기존 OPS 데이터)
- `checklist.checklist_record` — 자주검사 완료 여부
- `plan.production_confirm` — 실적확인 이력
- `plan.product_info` — O/N, 모델, 협력사 정보

**FE 사용처**: `ProductionPerformancePage.tsx` — O/N 테이블 + 공정별 인라인 확인

---

### 24. 실적확인 처리 — ✅ DONE (2026-04-17 상태 확인)

**요청일**: 2026-03-19

**엔드포인트**: `POST /api/admin/production/confirm`

**권한**: `@manager_or_admin_required`

**요청 Body**:

```json
{
  "sales_order": "6238",
  "process_type": "MECH",
  "confirmed_week": "W12",
  "confirmed_month": "2026-03"
}
```

**처리 로직**:

1. 해당 O/N의 모든 S/N에 대해 공정별 confirmable 조건 재검증
2. 조건 미충족 시 → 400 에러 (어떤 S/N이 미충족인지 상세 반환)
3. 조건 충족 시 → `plan.production_confirm` INSERT
4. `UNIQUE(sales_order, process_type, confirmed_week)` 위반 시 → 409 (이미 확인됨)

**응답 예시 (성공)**:

```json
{
  "success": true,
  "confirm_id": 42,
  "sales_order": "6238",
  "process_type": "MECH",
  "confirmed_week": "W12",
  "sn_count": 3,
  "confirmed_at": "2026-03-15T16:00:00+09:00"
}
```

**응답 예시 (실패)**:

```json
{
  "error": "NOT_CONFIRMABLE",
  "message": "MECH 실적확인 조건 미충족",
  "details": [
    { "serial_number": "GBWS-6629", "reason": "progress 85% (5/7 tasks)" },
    { "serial_number": "GBWS-6628", "reason": "자주검사 체크리스트 미완료" }
  ]
}
```

**FE 사용처**: `ProductionPerformancePage.tsx` — 실적확인 버튼 클릭 + 일괄확인

---

### 25. 실적확인 취소 — ✅ DONE (2026-04-17 상태 확인)

**요청일**: 2026-03-19

**엔드포인트**: `DELETE /api/admin/production/confirm/:id`

**권한**: `@admin_required` (Admin만 취소 가능 — 오입력 대응)

**처리 로직**: `plan.production_confirm` 해당 행 DELETE (hard delete)

**응답 예시**:

```json
{
  "success": true,
  "deleted_id": 42,
  "sales_order": "6238",
  "process_type": "MECH",
  "confirmed_week": "W12"
}
```

**FE 사용처**: `ProductionPerformancePage.tsx` — 확인된 실적 옆 취소 버튼 (Admin만 표시)

---

### 26. 월마감 집계 — ✅ DONE (2026-04-17 상태 확인)

**요청일**: 2026-03-19

**엔드포인트**: `GET /api/admin/production/monthly-summary`

**권한**: `@manager_or_admin_required`

**쿼리 파라미터**:

| 파라미터 | 타입 | 설명 | 기본값 |
|----------|------|------|--------|
| `month` | string | `YYYY-MM` | 현재 월 |

**응답 예시**:

```json
{
  "month": "2026-03",
  "weeks": [
    {
      "week": "W10",
      "mech": { "completed": 8, "confirmed": 8 },
      "elec": { "completed": 6, "confirmed": 5 },
      "tm":   { "completed": 4, "confirmed": 4 }
    },
    {
      "week": "W11",
      "mech": { "completed": 10, "confirmed": 10 },
      "elec": { "completed": 9, "confirmed": 8 },
      "tm":   { "completed": 5, "confirmed": 5 }
    }
  ],
  "totals": {
    "mech": { "completed": 18, "confirmed": 18 },
    "elec": { "completed": 15, "confirmed": 13 },
    "tm":   { "completed": 9, "confirmed": 9 }
  }
}
```

**응답 필드 설명**:

| 필드 | 설명 |
|------|------|
| `weeks[].completed` | 해당 주에 progress 100% 도달한 O/N 수 |
| `weeks[].confirmed` | 해당 주에 실적확인 완료된 O/N 수 |
| `totals` | 월 합계 (주차별 합산) — 재무·회계 정산 근거 |

**데이터 소스**:
- `plan.production_confirm` — 확인 이력 GROUP BY week, process_type
- `app_task_details` — progress 완료 건수 집계

**FE 사용처**: `ProductionPerformancePage.tsx` — 월마감 탭 (주차별 완료/확인 이중 컬럼 + 합계 행)

---

### 22. 출하 카운트 판정 로직 변경 — SI_SHIPMENT task 기준 — 🟡 BACKLOG (장기, 2026-04-17 Twin파파 확정)

> **검증 결과 (2026-04-17)**: `backend/app/routes/factory.py:L373-L376` — `pipeline['shipped']` 판정이 여전히 `finishing_plan_end` 기준. SI_FINISHING/SI_SHIPMENT 개별 task 완료 구분 로직 **미구현 확인**.
> **Twin파파 판단 (2026-04-17)**: 실제 수정은 필요하나 **당장 진행할 사항 아님**. 현재까지 SI_SHIPMENT까지 테스트 완료된 설비 단 1건이라 운영 영향 미미. 향후 실제 출하 데이터가 누적되어 카운트가 실질적으로 필요해지는 시점에 Sprint 배정 예정. BE 라우트(`factory.py` weekly-kpi + monthly-detail) + VIEW FE 응답 스키마(`si` → `si_finishing`/`si_shipment` 분리) 양측 동시 수정 필요.

**요청일**: 2026-03-19

**배경**: 현재 공장 대시보드 `pipeline.shipped`가 `completion_status.si_completed + finishing_plan_end <= today` 기준.
SI 카테고리는 마무리공정(SI_FINISHING) + 출하완료(SI_SHIPMENT) 2개 task로 구성되어 있어서,
마무리만 끝나고 출하가 안 된 경우와 실제 출하 완료를 구분할 수 없음.

**SI task 구조**:

| Task ID | Task Name | Type | 의미 |
|---------|-----------|------|------|
| `SI_FINISHING` | 마무리공정 | NORMAL (시작/종료) | GST 내부 마무리 공정 |
| `SI_SHIPMENT` | 출하완료 | SINGLE_ACTION (원클릭) | 실제 출하 처리 (SAP 전산 필요) |

**현재 문제 (`factory.py` L364-377)**:

```python
# 현재 — si_completed = SI_FINISHING + SI_SHIPMENT 모두 완료
if r.get('si_completed'):
    fpe = r.get('finishing_plan_end')
    if fpe and fpe > today:
        pipeline['si'] += 1        # 출하예정일 미래 → SI
    else:
        pipeline['shipped'] += 1   # 출하예정일 도래 → 출하 (부정확)
```

**문제점**:
1. `finishing_plan_end`(마무리종료예정)을 출하 기준으로 사용 — 생산일정용 필드
2. `si_completed`는 마무리+출하 통합 → 마무리만 완료된 상태 구분 불가
3. `finishing_plan_end`가 null이면 무조건 shipped로 카운트됨 (버그)

**요청 내용**: `pipeline` 집계 시 `app_task_details` JOIN하여 SI_FINISHING / SI_SHIPMENT 개별 완료 판정

**수정 방향**:

```python
# 수정 — task 단위 개별 판정
# 1) 월간 대상 S/N에 대해 SI task 완료 여부 조회
si_tasks = """
    SELECT serial_number, task_id, completed_at
    FROM app_task_details
    WHERE task_category = 'SI'
      AND task_id IN ('SI_FINISHING', 'SI_SHIPMENT')
      AND serial_number IN (... 대상 S/N ...)
"""

# 2) pipeline 분류
for r in rows:
    si_finishing_done = SI_FINISHING completed_at IS NOT NULL
    si_shipment_done = SI_SHIPMENT completed_at IS NOT NULL

    if si_shipment_done:
        pipeline['shipped'] += 1     # 실제 출하 완료
    elif si_finishing_done:
        pipeline['si'] += 1          # 마무리 완료, 출하 대기
    elif r.get('qi_completed'):
        ...
```

**대상 엔드포인트 2개**:

| 엔드포인트 | 용도 | 변경 사항 |
|-----------|------|----------|
| `GET /api/admin/factory/weekly-kpi` | 공장 대시보드 파이프라인 | `pipeline.shipped` → SI_SHIPMENT 기준 |
| `GET /api/admin/factory/monthly-detail` | 생산일정 + 출하이력 | 응답에 `si_finishing_completed`, `si_shipment_completed` 개별 필드 추가 |

**monthly-detail 응답 변경 (items[])**:

```json
{
  "completion": {
    "mech": true,
    "elec": true,
    "tm": null,
    "pi": true,
    "qi": true,
    "si_finishing": true,
    "si_shipment": false
  },
  "si_shipment_at": null
}
```

- 기존 `si: boolean` → `si_finishing: boolean` + `si_shipment: boolean`으로 분리
- `si_shipment_at`: 출하완료 시각 (출하이력 페이지용, null이면 미출하)

**FE 사용처**:

| 페이지 | 사용 데이터 |
|--------|-----------|
| 공장 대시보드 파이프라인 | `pipeline.shipped` (SI_SHIPMENT 기준) |
| 출하이력 페이지 | `si_shipment_at IS NOT NULL` 목록 + 출하일시 표시 |
| 생산실적 페이지 | MECH/ELEC/TM 실적확인 (기존 구조 유지, 출하와 무관) |

**FE 상태**: FE 타입 수정 대기. BE 응답 변경 후 `CompletionStatus` 인터페이스 + 공장 대시보드 + 출하이력 페이지 동시 업데이트 예정.

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

### 21. QR 목록 search 파라미터에 Order No 검색 추가 — DONE (2026-03-18)

**요청일**: 2026-03-18

**엔드포인트**: `GET /api/admin/qr/list`

**현재 동작**: `search` 파라미터가 `serial_number`, `qr_doc_id`만 매칭

**요청 내용**: `search` LIKE 검색 대상에 `sales_order` (Order No) 추가

**수정 위치**: `backend/app/routes/qr.py` — QR 목록 쿼리의 search WHERE 절

```sql
-- 현재
WHERE (qr.serial_number ILIKE '%{search}%' OR qr.qr_doc_id ILIKE '%{search}%')

-- 변경 후
WHERE (qr.serial_number ILIKE '%{search}%' OR qr.qr_doc_id ILIKE '%{search}%' OR pi.sales_order ILIKE '%{search}%')
```

**FE 상태**: placeholder 텍스트 변경 대기 ("S/N, QR Doc ID, Order No 검색...")

---

### 27. Sprint 33 보완 — monthly-summary 주차별 집계 로직 미완성 — BACKLOG

**등록일**: 2026-03-20

**엔드포인트**: `GET /api/admin/production/monthly-summary`

**현재 상태**: `production.py` 내 weekly 집계 로직이 `pass`로 비어있음. 응답의 `weeks` 배열에 주차별 breakdown이 없고 전체 합계(`totals`)만 반환.

**영향**: VIEW Sprint 8 월마감 뷰에서 `monthlyData.weeks.map(...)` 으로 주차별 행을 렌더링 → `weeks`가 빈 배열이면 "데이터 없음" 표시됨

**시급도**: 낮음 — 현재 테스트 중인 모델 2개뿐이고 완료된 실적이 없어서 당장 영향 없음. 실제 progress 100% O/N이 생기기 전에 완성 필요.

**수정 필요 내용**:
1. `production.py` — 각 O/N의 `mech_start` 기준 ISO 주차 계산하여 `weekly[주차]`에 completed/confirmed 분배
2. `test_production.py` — `test_monthly_returns_orders`에 주차별 데이터 검증 추가

**함께 수정할 항목** (코드 품질):
- `production.py` Line 8: 미사용 `import math` 삭제
- `production.py` 중복 확인 감지: `'unique' in error_msg.lower()` → `psycopg2.errors.UniqueViolation` 에러코드(23505) 방식으로 변경

---

### 28. confirm_checklist_required — 체크리스트 연동 로직 미구현 — BACKLOG

**등록일**: 2026-03-21

**관련 코드**: `production.py` → `_is_process_confirmable()`

**현재 상태**: `confirm_checklist_required` 키는 Sprint 33 migration에 `false`로 등록됨. 하지만 `_is_process_confirmable()`에서 이 키를 **체크하지 않음** — 체크리스트 데이터 구조 자체가 아직 없기 때문.

**현재 로직**: `confirm_{process}_enabled = true` + progress 100% = confirmable

**목표 로직 (추후)**:
- `confirm_checklist_required = false` → progress 100%만으로 confirmable (현재와 동일)
- `confirm_checklist_required = true` → progress 100% **+ MECH/ELEC/TM 체크리스트 완료** = confirmable

**선행 조건**: 자주검사 체크리스트 Sprint (데이터 구조 + CRUD)

**수정 필요 내용**:
1. 체크리스트 테이블/모델 설계 및 migration
2. `_is_process_confirmable()`에 체크리스트 완료 조건 추가:
   ```python
   if settings.get('confirm_checklist_required', False):
       if not _is_checklist_completed(sales_order, process_type):
           return False
   ```
3. VIEW 실적페이지에서 체크리스트 미완 시 confirmable=false UI 반영

**시급도**: 낮음 — 체크리스트 기능 Sprint 진행 후 연동. 현재는 `false`로 비활성 상태이므로 영향 없음.

---

### 29. 근태 기간별 출입 추이 API — ✅ DONE (2026-04-17 상태 확인)

**등록일**: 2026-03-21

**엔드포인트**: `GET /api/admin/hr/attendance/trend`

**요청 내용**: 날짜 범위 지정 시 일별 출입 인원 집계를 반환하는 API

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `date_from` | string (YYYY-MM-DD) | ✅ | 시작일 |
| `date_to` | string (YYYY-MM-DD) | ✅ | 종료일 |

**응답 형식**:
```json
{
  "date_from": "2026-03-15",
  "date_to": "2026-03-21",
  "trend": [
    {
      "date": "2026-03-15",
      "total_registered": 130,
      "checked_in": 98,
      "hq_count": 32,
      "site_count": 66
    },
    {
      "date": "2026-03-16",
      "total_registered": 130,
      "checked_in": 102,
      "hq_count": 35,
      "site_count": 67
    }
  ]
}
```

**목적**: VIEW 근태관리 차트 섹션의 주간(7일)/월간(30일) 출입 인원 추이 라인 차트 표시

**FE 현황**: ChartSection 주간/월간 탭 UI 구현 완료. `trendData` props 수신 대기 중. API 연동 후 `useAttendanceTrend(dateFrom, dateTo)` 훅 생성 예정.

**구현 참고**:
- 기존 `GET /api/admin/hr/attendance?date=` 를 날짜별로 반복 호출하는 방식은 비효율 (7~30회 호출)
- BE에서 SQL `GROUP BY date` 한 번으로 처리하는 것이 최적
- `hq_count`/`site_count`는 `work_site` 컬럼 기준 집계

**시급도**: 중 — FE 차트 UI는 완성, BE 연동만 남은 상태

---

### 30. 비활성 계정 관리 — 30일 미사용 비활성화 + 6개월 후 삭제 — BACKLOG

**등록일**: 2026-03-21

**기능 요약**: 마지막 출근(`check_in_at`) 기준 30일 미사용 계정을 자동 비활성화, 비활성화 후 6개월 경과 시 삭제. 각 단계에서 메일 알림 발송.

**비활성화 기준일**: `attendance_log` 테이블의 마지막 `check_in_at` (출근 기록 기준)

**단계**:

| 단계 | 조건 | 처리 | 메일 수신자 |
|------|------|------|-------------|
| 1. 비활성화 경고 | 마지막 check_in 후 25일 | 메일 발송만 (사전 안내) | admin + 해당 작업자의 is_manager |
| 2. 비활성화 | 마지막 check_in 후 30일 | `is_active = false` 처리 | admin + 해당 작업자의 is_manager |
| 3. 삭제 경고 | 비활성화 후 5개월 25일 | 메일 발송만 (최종 안내) | admin + 해당 작업자의 is_manager |
| 4. 삭제 | 비활성화 후 6개월 | soft delete (`deleted_at` 처리) | admin |

**구현 필요**:
1. **Scheduled Job**: 매일 1회 실행 (cron) — 비활성화/삭제 대상 조회 + 처리
2. **workers 테이블**: `is_active` 컬럼 (없으면 추가), `deactivated_at` 타임스탬프
3. **메일 발송**: Flask-Mail 또는 외부 서비스 (SendGrid 등)
4. **메일 내용**: 대상자 리스트 + 마지막 출근일 + 비활성화/삭제 예정일
5. **admin 설정 연동** (선택): `inactive_days_threshold` 키로 30일 기본값 조정 가능

**주의사항**:
- 비활성화된 계정은 로그인 차단 + workers 목록에서 기본 숨김
- 삭제는 soft delete — 작업 이력(`app_task_details`, `attendance_log`)은 보존
- 한 번도 출근 기록 없는 계정 → 가입일(`created_at`) 기준으로 판정

**시급도**: 낮음 — 현재 인원 규모에서는 수동 관리 가능. 인원 증가 시 필요.

---

### QR 목록 조회 500 에러 — DONE (2026-03-07)

**엔드포인트**: `GET /api/admin/qr/list`

**증상**: JWT 토큰 정상 전송 시 500 INTERNAL_ERROR 반환

**해결**: BE 측 수정 완료 → 200 정상 반환

---

## 생산실적 버그 (`/api/admin/production/performance`)

### 31. O/N 펼침 시 S/N 상세 리스트 미반환 — BUG

**보고일**: 2026-03-22
**엔드포인트**: `GET /api/admin/production/performance?week=W12`
**시급도**: 높음 — 생산실적 핵심 기능 (S/N 단위 진행률 확인 불가)

**증상**:
- O/N 1111 행은 리스트에 정상 표시됨 (모델: GAIA-I, sn_count: 1, "(1대)")
- 그러나 O/N 1111을 **펼치면(expand) S/N 하위 리스트가 나오지 않음**
- 모든 O/N의 MECH / ELEC / TM 진행률이 **N/A**로 표시됨

**테스트 데이터 상태 (OPS 공장 대시보드에서 확인)**:
- O/N: 1111, S/N: TEST-1111, 모델: GAIA-I
- progress: **100%** (MECH 6/6, ELEC 6/6, TMS 2/2)
- 상태: **완료**
- → OPS 공장 대시보드(`/factory`)에서는 정상 표시됨

**FE 분석 결과 (문제 없음)**:
```tsx
// ProductionPerformancePage.tsx:581
{isExpanded && (order.sns ?? []).map((sn, idx) => ( ... ))}
```
- FE는 `order.sns` 배열을 그대로 렌더링 (별도 필터링 없음)
- `sns`가 빈 배열 `[]` 또는 `undefined`이면 아무것도 표시 안 됨
- `sn_count: 1`은 표시되므로 집계 값은 오지만, **상세 배열이 비어있음**

**추정 원인 (BE 확인 필요)**:

| # | 가능성 | 확인 방법 |
|---|--------|-----------|
| 1 | `sns` 배열 조회 쿼리에서 JOIN 조건 불일치 — `sn_count`는 단순 COUNT로 가져오지만, `sns` 상세는 partner/progress 테이블 JOIN 시 TEST-1111이 누락 | `sns` 조회 SQL 확인 |
| 2 | `process_status.*.total`이 모두 0 → 공장 대시보드는 `checklist_items` 기반이지만 performance API는 다른 테이블/쿼리 사용 | performance 쿼리의 progress 집계 로직 확인 |
| 3 | `sns` 필드를 populate하는 로직이 특정 조건(예: production_plan status)에서만 동작 | performance 엔드포인트의 sns 구성 코드 확인 |

**기대하는 정상 응답 (O/N 1111 부분)**:
```json
{
  "sales_order": "1111",
  "model": "GAIA-I",
  "sn_count": 1,
  "sn_summary": "TEST-1111",
  "sns": [
    {
      "serial_number": "TEST-1111",
      "mech_partner": "...",
      "elec_partner": "...",
      "progress": {
        "MECH": { "total": 6, "done": 6, "pct": 100 },
        "ELEC": { "total": 6, "done": 6, "pct": 100 },
        "TM": { "total": 2, "done": 2, "pct": 100 }
      },
      "checklist": { ... }
    }
  ],
  "process_status": {
    "MECH": { "total": 6, "ready": 6, "confirmable": true },
    "ELEC": { "total": 6, "ready": 6, "confirmable": true },
    "TM": { "total": 2, "ready": 2, "confirmable": true }
  }
}
```

**디버깅 순서 (BE)**:
1. API 직접 호출 → O/N 1111의 `sns` 배열 값 확인 (`[]`인지 데이터 있는지)
2. `sns` 배열 구성 쿼리 확인 — `plan` + `workers`(partner) + `checklist_items`(progress) JOIN 로직
3. 공장 대시보드 API와 performance API의 **쿼리 차이점** 비교
4. `process_status.*.total` 집계 로직 — 왜 모든 O/N이 N/A(total=0)인지

**FE 상태**: 수정 불필요 — BE 응답에 `sns` 데이터가 정상 포함되면 즉시 표시됨

---

#### #31 해결 — 2026-03-22

**상태**: ✅ RESOLVED

**근본 원인**: `production.py` `_build_order_item()` 함수가 `sns` 필드를 반환하지 않았음. `serial_numbers`(문자열 배열)만 존재했고, FE가 기대하는 `sns`(S/N별 progress/partner 포함 객체 배열)는 구성 로직 자체가 없었음.

**수정 내용** (`AXIS-OPS/backend/app/routes/production.py`):
1. `_build_order_item()`에 `sns_detail` 배열 구성 로직 추가 — `products` 루프 돌며 S/N별 `progress` 딕셔너리(MECH/ELEC/TMS/PI/QI/SI) 조립
2. `sn_summary` 필드 추가 — FE line 541에서 참조하나 BE에서 미반환이었음. 1대면 S/N 그대로, 2대 이상이면 "첫번째 외 N대" 형식
3. 응답 return에 `'sns': sns_detail`, `'sn_summary': sn_summary` 추가

**수정 후 응답 구조**:
```json
{
  "sales_order": "1111",
  "model": "GAIA-I",
  "sn_count": 1,
  "sn_summary": "TEST-1111",
  "serial_numbers": ["TEST-1111"],
  "sns": [
    {
      "serial_number": "TEST-1111",
      "mech_partner": "...",
      "elec_partner": "...",
      "progress": {
        "MECH": { "total": 6, "done": 6, "pct": 100.0 },
        "ELEC": { "total": 6, "done": 6, "pct": 100.0 },
        "TMS": { "total": 2, "done": 2, "pct": 100.0 }
      }
    }
  ],
  "progress_pct": 100.0,
  "processes": { ... }
}
```

**배포 후 확인사항**: O/N 펼침(expand) 시 S/N 상세 리스트 + 공정별 진행률 정상 표시 여부

---

### 32. FE-BE 키 불일치 — process_status→processes, TMS→TM 매핑

**보고일**: 2026-03-22
**시급도**: 높음 — 생산실적 O/N·S/N 진행률 전체 N/A 표시

**증상**:
```
O/N 1111 행:     MECH N/A  |  ELEC N/A  |  TM N/A     ← 전부 N/A
  └ TEST-1111:   MECH 100% |  ELEC 100% |  TM N/A     ← TM만 N/A
```
- OPS 공장 대시보드에서는 MECH 6/6, ELEC 6/6, TMS 2/2 정상 표시

**근본 원인 (2가지)**:

| # | BE 실제 응답 | FE 현재 참조 | 영향 |
|---|-------------|-------------|------|
| 1 | `order.processes` | `order.process_status` | O/N 행 MECH/ELEC/TM 전부 N/A |
| 2 | `sn.progress.TMS` | `sn.progress.TM` | S/N 행 TM N/A |

**수정 방향 (확정): BE 매핑 1줄 + FE 키 이름 1곳**

FE에서 TM→TMS 전면 변경은 **비권장**:
- `TMS`는 DB `task_category` 컬럼 전용 값
- 나머지 시스템 전체(`role_enum`, `completion_status`, `admin_settings`)는 `TM` 사용
- FE를 TMS에 맞추면 `confirm_tms_enabled` 조회 시도 → DB에 `confirm_tm_enabled`만 존재 → confirmable 영구 실패
- 향후 TMS/TM 혼동 반복

| 원래 계획 (FE→TMS) | 수정 계획 (BE 매핑→TM) |
|--------------------|----------------------|
| FE 수정 7곳 (TM→TMS) + 1곳 (processes) | **FE 수정 1곳** (processes만) |
| BE 수정 0 | BE 매핑 상수 1줄 + 적용 3곳 |
| confirm_tm_enabled 문제 **미해결** | **해결** |
| 시스템 일관성 ❌ (FE만 TMS, 나머지 TM) | ✅ 전체 TM |

**BE 수정 (production.py — 매핑 1줄)**:
```python
_CATEGORY_TO_PROCESS = {'TMS': 'TM'}
# 사용: process_key = _CATEGORY_TO_PROCESS.get(pt, pt)
```
- `processes` 딕셔너리 구성 시 `TMS` → `TM`으로 매핑
- `sns[].progress` 구성 시 동일 매핑 적용
- 결과: 응답에서 `TMS` 키가 `TM`으로 통일

**BE 수정 후 응답 구조**:
```json
{
  "sales_order": "1111",
  "processes": {
    "MECH": { "total": 6, "ready": 6, "confirmable": true },
    "ELEC": { "total": 6, "ready": 6, "confirmable": true },
    "TM":   { "total": 2, "ready": 2, "confirmable": true }
  },
  "sns": [{
    "serial_number": "TEST-1111",
    "progress": {
      "MECH": { "total": 6, "done": 6, "pct": 100 },
      "ELEC": { "total": 6, "done": 6, "pct": 100 },
      "TM":   { "total": 2, "done": 2, "pct": 100 }
    }
  }]
}
```

**FE 수정 (VIEW만 — 1곳)**:

| # | 파일 | 변경 내용 |
|---|------|----------|
| 1 | `types/production.ts` | `OrderGroup.process_status` → `processes` |
| 2 | `ProductionPerformancePage.tsx` | 모든 `order.process_status` → `order.processes` |
| - | TM 관련 | 변경 불필요 — BE가 TM으로 내려주므로 기존 코드 그대로 동작 |

**confirm API**: `process_type: 'TM'` 그대로 유지 — DB `confirms.process_type` = 'TM', `admin_settings.confirm_tm_enabled` = TM 기준

---

### 32-B. processes 내부 필드명 불일치 — `ready` 미반환 + `confirmable` 미동작 — BUG

**보고일**: 2026-03-22
**시급도**: 높음 — #32 FE 수정(`process_status`→`processes`) 이후 발견된 후속 버그
**선행**: #32 FE 완료 + BE TMS→TM 매핑 완료

**증상 (2026-03-22 스크린샷)**:

```
O/N 1111:  MECH  /6  |  ELEC  /6  |  TM  /2     ← ready 값 없이 "/total"만 표시
                  —         —            (없음)    ← 확인 버튼 미표시
```

- `processes` 키 자체는 정상 동작 (N/A → `/6`으로 변경됨 ✅)
- 그러나 `6/6`이 아닌 `/6`으로 표시 → **`ready` 필드 누락**
- `confirm_mech_enabled = true`로 설정해도 **실적확인 버튼 미활성**

**원인 분석: BE 응답 필드명 vs FE 참조 필드명**

FE `ProcessStatus` 타입이 기대하는 구조:
```typescript
// types/production.ts
interface ProcessStatus {
  ready: number;       // ← FE가 사용하는 필드명
  total: number;
  checklist_ready?: number;
  confirmable: boolean; // ← 확인 버튼 활성화 조건
}
```

BE가 실제 반환하는 구조 (**API 확인 완료 2026-03-22**):
```json
{
  "MECH": {
    "total": 6,
    "completed": 6,       // ← "ready"가 아닌 "completed"
    "pct": 100.0,
    "confirmable": false,  // ← 반환됨 — admin_settings false 때문
    "confirmed": false,
    "confirmed_at": null,
    "confirm_id": null
  }
}
```

**FE 코드에서의 영향:**

| FE 코드 | 참조 필드 | 현재 동작 | 원인 |
|---------|----------|----------|------|
| `{processStatus.ready}/{processStatus.total}` (line 178) | `ready` | `/6` 표시 | BE가 `completed`로 반환, `ready`는 undefined |
| `processStatus.ready === processStatus.total` (line 143) | `ready` | `allDone = false` 항상 | undefined !== 6 |
| `processStatus.confirmable` (line 190) | `confirmable` | 버튼 미표시 | `confirm_mech_enabled=false` → confirmable=false (정상) |

**확인 버튼 활성화 조건 (3가지 모두 충족 필요)**:
```tsx
// line 190
enabled && processStatus.confirmable && !confirm
```
1. `enabled`: `isProcessEnabled('MECH')` → `confirm_mech_enabled !== false` → **true** ✅ (설정 ON)
2. `confirmable`: BE 응답값 → **false 또는 undefined** ❌
3. `!confirm`: confirms 배열에 MECH 확인 기록 없음 → **true** ✅

→ **`confirmable`이 false/undefined라서 버튼 미표시**

**해결 방안 (BE 확인 완료)**:

| # | 원인 | BE 수정 | FE 대응 |
|---|------|--------|---------|
| 1 | `completed` 반환, `ready` 없음 | `ready` alias 추가 (`ready = completed`) | FE는 `ready` 참조 유지 |
| 2 | `confirmable=false` — `_is_process_confirmable`에 DB키(`pt='TMS'`) 전달 → `confirm_tms_enabled` 조회 실패 | `proc_key`('TM') 전달로 수정 → `confirm_tm_enabled` 조회 | 수정 불필요 |
| 3 | `confirm_mech_enabled=false` 설정 | admin_settings에서 `true`로 변경 필요 | 수정 불필요 (설정 변경만) |

**BE 수정 후 정상 응답 구조**:
```json
{
  "MECH": {
    "total": 6,
    "completed": 6,
    "ready": 6,
    "pct": 100.0,
    "confirmable": true,
    "confirmed": false,
    "confirmed_at": null,
    "confirm_id": null
  }
}
```

**전제 조건**: `admin_settings.confirm_mech_enabled = true` (Admin 옵션에서 설정)

---

#### #32-B 해결 — 2026-03-22

**상태**: ✅ RESOLVED (BE 수정 완료)

**적용 내용**:
1. `_is_process_confirmable()` — `proc_key` 파라미터 추가. `confirm_{proc_key}_enabled` 키로 조회하여 TMS→TM 매핑 후에도 `confirm_tm_enabled` 정상 참조
2. `processes[proc_key]` — `'ready': completed` alias 추가. FE `processStatus.ready` 참조와 일치

**배포 후 확인**: `confirm_mech_enabled=true` 설정 → O/N 행에 `6/6` 표시 + 확인 버튼 활성화 여부

**2026-03-22 확인 결과 (1차)**:
- `6/6` 표시: ✅ 정상 (`ready` alias 적용됨)
- 확인 버튼: ❌ 미활성 — `confirm_mech_enabled=true` 설정해도 버튼 안 나옴

**2026-03-23 근본 원인 확인 (2차)**:

`_is_process_confirmable()`에 **전체 주차의 모든 S/N progress**가 전달되고 있었음. 함수가 `for sn, cats in sns_progress.items():`로 전체를 순회하므로, 같은 주차에 미완료 S/N이 있는 **다른 O/N**이 하나라도 있으면 현재 O/N도 `confirmable=false`가 됨.

```python
# 버그: sns_progress는 주차 내 전체 O/N의 S/N을 포함
serial_numbers = [row['serial_number'] for row in product_rows]  # 주차 전체
sns_progress = _calc_sn_progress(cur, serial_numbers)
# → _is_process_confirmable(sns_progress, ...)  ← 전체 S/N 순회!
```

**수정 내용** (`production.py`):
1. `_is_process_confirmable()` — `serial_numbers` 파라미터 추가. 현재 O/N의 S/N만 필터링하여 판정
2. `has_data` 플래그 추가 — 해당 공정 데이터가 0건이면 `False` 반환 (빈 루프 → True 방지)
3. `_build_order_item()` 호출 시 `serial_numbers` 전달

**수정 후 정상 동작**:
- O/N 1111 (TEST-1111: MECH 6/6) → `confirmable=true` ✅
- O/N 2222 (TEST-2222: MECH 3/6) → `confirmable=false` ✅ (정상 — 미완료)
- 각 O/N이 독립적으로 판정됨

**2026-03-23 확인 결과 (3차)**: MECH/ELEC `✓ 확인` 정상. **TM 실적확인 버튼 클릭 시 실패**.

**3차 근본 원인**: `POST /confirm` 엔드포인트에서 FE가 전송한 `process_type='TM'`으로 `_is_process_confirmable()` 호출 → `cats.get('TM', {})` = 빈 dict (DB에는 `task_category='TMS'`) → `has_data=False` → NOT_CONFIRMABLE 반환

**3차 수정** (`production.py` confirm_production):
- `_PROC_TO_CAT = {'TM': 'TMS'}` 역방향 매핑 추가
- `_is_process_confirmable(sns_progress, db_category, settings, proc_key=process_type, serial_numbers=serial_numbers)` — DB category로 progress 조회, proc_key로 settings 조회

---

### 36. TM progress에 PRESSURE_TEST 포함 — 현재 정상, 추후 옵션 제어 필요

**보고일**: 2026-03-23
**시급도**: 낮음 — 현재 동작은 정상 (BUG 아님)
**선행**: #32-B (confirmable 수정 완료)

**확인 결과 (GBWS-6855)**:
- TM progress = **50%** (`total=2, done=1`) — TANK_MODULE 완료 ✅, PRESSURE_TEST 미완 ❌
- `confirmable=true` (TANK_MODULE 기준) — 실적확인 버튼 활성 ✅

**현재 동작: BE 수정 완료 (Sprint 12, 2026-03-23)**

| 항목 | 동작 | 상태 |
|------|------|------|
| TM progress | `1/2 = 50%` (TANK_MODULE + PRESSURE_TEST 모두 포함) | ✅ 정상 |
| TM 알람 | 2/2 완료 시 mech_partner 발송 | ✅ 정상 |
| TM 실적확인 | TANK_MODULE만 → `confirmable=true` | ✅ **BE 수정 완료** |
| O/N 행 표시 | `1/2` + 실적확인 버튼 활성 | ✅ 의도된 동작 |

**BE 수정 내역 (production.py)**:
- `_calc_sn_progress()`: `GROUP BY task_category, task_id` → `tasks` dict 포함 반환
- `_CONFIRM_TASK_FILTER = {'TMS': 'TANK_MODULE'}` 매핑 추가
- `_is_process_confirmable()`: TMS일 때 `tasks.TANK_MODULE`만 체크 (PRESSURE_TEST 무시)

**설계 근거**: 현재 가압검사는 물리적으로 2회 실시 (TM 1회 + PI 1회). TM의 PRESSURE_TEST는 실제로 수행되는 작업이므로 progress에 포함이 맞음. `1/2 + 실적확인 가능` = "TM 전체는 아직 진행 중이지만, 실적확인(TANK_MODULE 기준)은 가능한 상태"

**O/N 행 `1/2` + 실적확인 버튼 공존이 혼동되지 않는 이유**:
- 실적확인 = 협력사 실적 정산 근거 (TANK_MODULE = 협력사 작업 범위)
- PRESSURE_TEST = GST 내부 작업 → 실적 정산과 무관하지만 TM 공정 완료에는 필요
- 알람도 2/2 완료 후 발송 → progress/알람/실적확인 각각의 기준이 명확히 다름

---

**추후 옵션 제어 (설비 변경 시 — BACKLOG)**:

설비 개선으로 가압검사가 1회만 진행될 때, `tm_pressure_test_required` 옵션 하나로 **progress + 알람 동시 제어**:

| 키 | 타입 | 기본값 |
|---|------|--------|
| `tm_pressure_test_required` | boolean | `true` |

| 설정 | TM progress | TM 알람 | TM 실적확인 | 사용 시점 |
|------|------------|---------|------------|----------|
| `true` (기본) | **2/2** (TANK_MODULE + PRESSURE_TEST) | 2/2 완료 시 | TANK_MODULE만 | **현재 (가압검사 2회)** |
| `false` | **1/1** (TANK_MODULE만, PRESSURE_TEST 숨김) | TANK_MODULE 완료 시 | TANK_MODULE만 | **추후 (가압검사 1회 설비)** |

`false` 설정 시 변경 범위:

| 시스템 | 변경 내용 |
|--------|----------|
| OPS BE `production.py` | TM progress 집계에서 PRESSURE_TEST 제외 → `total=1` |
| OPS BE 알람 핸들러 | TANK_MODULE 완료만으로 알람 발송 |
| OPS BE task UI | PRESSURE_TEST task 비활성 또는 숨김 |
| VIEW FE | 변경 없음 — `processes.TM.ready/total` 그대로 사용 |

**구현 시점**: 미리 구현 (설비 변경 시 admin 토글만으로 제어 — 배포 불필요)

---

#### #36-B TM PRESSURE_TEST + mech_partner 알람 + progress 통합 연계

**보고일**: 2026-03-23
**시급도**: 낮음 — 현재 전부 정상. 추후 설비 변경 시 옵션 제어 구현
**선행**: #36 확인 완료

**현재 연계 구조 (전부 정상 — 변경 불필요)**:

```
물리적 공정:
TANK_MODULE → PRESSURE_TEST(1차, TM) → PI 공정(2차, GST 인원)
                                        └ 가압검사 2회 실시 (품질 안정화)

현재 시스템 동작 (3가지 모두 정상):
┌ progress:   TM 2/2 (TANK_MODULE + PRESSURE_TEST 포함)  ✅
├ 알람:       TM 2/2 완료 → mech_partner 알람 발송        ✅
└ 실적확인:   TANK_MODULE만 → confirmable=true             ✅
```

**핵심 설계**: progress와 알람은 **같은 기준** (TM 전체 2/2), 실적확인만 **별도 기준** (TANK_MODULE). 이것이 정상.

**추후 옵션 (`tm_pressure_test_required`) — progress + 알람 동시 제어**:

| 설정 | progress | 알람 | 실적확인 | 시점 |
|------|---------|------|---------|------|
| `true` (기본) | **2/2** | 2/2 완료 시 | TANK_MODULE만 | **현재** |
| `false` | **1/1** (PRESSURE_TEST 제외) | TANK_MODULE 완료 시 | TANK_MODULE만 | **추후 (1회 가압검사 설비)** |

`false` 설정 시 변경:

| 시스템 | 변경 내용 |
|--------|----------|
| OPS BE `production.py` | TM progress에서 PRESSURE_TEST 제외 → `total=1` |
| OPS BE 알람 핸들러 | TANK_MODULE 완료만으로 알람 발송 |
| OPS BE task UI | PRESSURE_TEST task 비활성/숨김 |
| VIEW FE | 변경 없음 — `processes.TM.ready/total` 그대로 사용 |

---

#### #36-C VIEW 실적확인 설정 UI — `tm_pressure_test_required` 옵션 추가

**보고일**: 2026-03-23
**시급도**: 구현 대상 — 추후 설비 변경 시 코드 배포 없이 admin 토글만으로 제어하기 위해 미리 구현
**선행**: #36-B 옵션 설계 확정, OPS BE admin_settings에 키 추가
**default**: `true` (현재 동작 유지 — 가압검사 포함). 설비 변경 시 admin이 `false`로 전환

**현재 ConfirmSettingsPanel 구조** (`ProductionPerformancePage.tsx` L51-128):

```
┌─ 실적확인 설정 ──────────────── ✕ ─┐
│                                      │
│ 공정별 실적확인                      │
│  기구 (MECH)              [toggle]   │
│  전장 (ELEC)              [toggle]   │
│  Tank Module (TM)         [toggle]   │
│  PI                       [toggle]   │
│  QI                       [toggle]   │
│  SI                       [toggle]   │
│ ──────────────────────────────────── │
│  체크리스트 필수           [toggle]   │
│  자주검사 완료 시에만 실적확인 가능  │
└──────────────────────────────────────┘
```

**변경 후 설계** (v2 — TM 그룹 구조):

```
┌─ 실적확인 설정 ──────────────── ✕ ─┐
│                                      │
│ 공정별 실적확인                      │
│  기구 (MECH)              [toggle]   │
│  전장 (ELEC)              [toggle]   │
│                                      │
│  Tank Module               ← 그룹 헤더
│  ┌───────────────────────────────┐   │
│  │ * 실적처리: Tank Module       │   │  ← 고정 (default, 항상 활성)
│  │   (TM 실적확인)    [toggle]   │   │  ← confirm_tm_enabled
│  │                               │   │
│  │ * Progress / 알람 trigger     │   │
│  │   가압검사 포함     [toggle]   │   │  ← tm_pressure_test_required (NEW)
│  │   ON : 가압검사 완료까지      │   │
│  │        progress·알람에 반영    │   │
│  │   OFF: 탱크모듈만으로 완료    │   │
│  └───────────────────────────────┘   │
│                                      │
│  PI                       [toggle]   │
│  QI                       [toggle]   │
│  SI                       [toggle]   │
│ ──────────────────────────────────── │
│  체크리스트 필수           [toggle]   │
│  자주검사 완료 시에만 실적확인 가능  │
└──────────────────────────────────────┘
```

**UI 동작 규칙**:

| 조건 | 동작 |
|------|------|
| TM 그룹 내 `confirm_tm_enabled` | TM 실적확인 ON/OFF — 기존과 동일 |
| TM 그룹 내 `tm_pressure_test_required` | Progress·알람에 가압검사 포함 여부 |
| `confirm_tm_enabled = false` | 가압검사 포함 토글도 disabled + 회색 처리 |

**설계 의도**:
- "실적처리"와 "Progress/알람 trigger"의 기준이 다르다는 것을 그룹 내에서 시각적으로 구분
- 실적처리 = 항상 Tank Module 기준 (default, 변경 불가)
- Progress/알람 = 가압검사 포함 여부를 옵션으로 제어

**FE 수정 내용** (`ProductionPerformancePage.tsx`):

```tsx
// TOGGLES를 일반 토글과 TM 그룹으로 분리
const PROCESS_TOGGLES = [
  { key: 'confirm_mech_enabled', label: '기구 (MECH)' },
  { key: 'confirm_elec_enabled', label: '전장 (ELEC)' },
];

const TM_GROUP = {
  header: 'Tank Module',
  items: [
    {
      key: 'confirm_tm_enabled',
      label: 'TM 실적확인',
      category: '실적처리: Tank Module',       // 고정 설명
    },
    {
      key: 'tm_pressure_test_required',
      label: '가압검사 포함',
      category: 'Progress / 알람 trigger',
      parent: 'confirm_tm_enabled',            // TM 실적확인 ON일 때만 활성
      description: 'ON: 가압검사 완료까지 반영 / OFF: 탱크모듈만',
    },
  ],
};

const REMAINING_TOGGLES = [
  { key: 'confirm_pi_enabled', label: 'PI' },
  { key: 'confirm_qi_enabled', label: 'QI' },
  { key: 'confirm_si_enabled', label: 'SI' },
];
```

**TM 그룹 렌더링**:
```tsx
{/* ── 일반 공정 토글 (MECH, ELEC) ── */}
{PROCESS_TOGGLES.map(t => renderToggle(t))}

{/* ── TM 그룹 박스 ── */}
<div style={{
  margin: '8px 0', padding: '8px',
  border: '1px solid var(--gx-mist)',
  borderRadius: '6px', background: 'var(--gx-snow)',
}}>
  <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '6px',
                color: 'var(--gx-graphite)' }}>
    {TM_GROUP.header}
  </div>
  {TM_GROUP.items.map(t => {
    const value = (settings as Record<string, unknown>)?.[t.key] as boolean ?? false;
    const parentEnabled = t.parent
      ? (settings as Record<string, unknown>)?.[t.parent] as boolean ?? false
      : true;
    const disabled = updateMutation.isPending || !parentEnabled;

    return (
      <div key={t.key} style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '3px 0',
        opacity: parentEnabled ? 1 : 0.4,
      }}>
        <div>
          <div style={{ fontSize: '9px', color: 'var(--gx-silver)' }}>
            {t.category}
          </div>
          <span style={{ fontSize: '12px', fontWeight: 500 }}>
            {t.label}
          </span>
          {t.description && (
            <div style={{ fontSize: '9px', color: 'var(--gx-silver)', marginTop: '1px' }}>
              {t.description}
            </div>
          )}
        </div>
        <button onClick={() => handleToggle(t.key, value)} disabled={disabled} ... />
      </div>
    );
  })}
</div>

{/* ── 나머지 공정 토글 (PI, QI, SI) ── */}
{REMAINING_TOGGLES.map(t => renderToggle(t))}
```

**AdminSettingsResponse 타입 추가** (`api/adminSettings.ts`):
```typescript
export interface AdminSettingsResponse {
  confirm_mech_enabled: boolean;
  confirm_elec_enabled: boolean;
  confirm_tm_enabled: boolean;
  tm_pressure_test_required: boolean;   // ← NEW
  confirm_pi_enabled: boolean;
  confirm_qi_enabled: boolean;
  confirm_si_enabled: boolean;
  confirm_checklist_required: boolean;
  [key: string]: unknown;
}
```

**BE admin_settings migration**:
```sql
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES ('tm_pressure_test_required', 'true', 'TM 가압검사 progress/알람 포함 여부')
ON CONFLICT (setting_key) DO NOTHING;
```

**구현 순서**:
1. OPS BE: `admin_settings` 테이블에 `tm_pressure_test_required` 키 추가 (migration)
2. OPS BE: `production.py` — settings 값에 따라 TM task 필터링 분기
3. OPS BE: 알람 핸들러 — settings 값에 따라 알람 트리거 분기
4. VIEW FE: `AdminSettingsResponse` 타입 + ConfirmSettingsPanel UI 추가

**구현 시점**: 미리 구현 (default `true` = 현재 동작. 설비 변경 시 admin이 `false`로 전환 — 배포 불필요)

---

### 37. 혼재 O/N 실적확인 협력사별 분리

**보고일**: 2026-03-23
**시급도**: 높음 — 현재 혼재 O/N의 실적확인이 협력사 구분 없이 O/N 단위로 처리됨
**선행**: #32-B (confirmable 수정), #36 (TM TANK_MODULE only confirmable)

#### 문제

현재 `production_confirm`은 `(sales_order, process_type, confirmed_week)` 단위. 혼재 O/N에서 서로 다른 협력사의 실적이 구분 없이 한 번에 확인됨.

**예시 — O/N 6520 (GAIA-I DUAL, 5대)**:

| S/N | mech_partner | elec_partner |
|-----|-------------|-------------|
| GBWS-6855 | TMS | TMS |
| GBWS-6856~6859 | FNI | C&A |

현재: MECH 실적확인 1개 → TMS(1대) + FNI(4대) 한꺼번에 처리
필요: TMS(1대), FNI(4대) 각각 별도 실적확인 (완료 날짜가 다름)

#### 설계 원칙

**분리 대상: MECH / ELEC / TM 모두 (혼재 시)**

| 공정 | 분리 기준 | 혼재 O/N | 비혼재 O/N | 비고 |
|------|----------|---------|----------|------|
| MECH | `mech_partner` | partner별 버튼 | 버튼 1개 | 모든 모델 공통 |
| ELEC | `elec_partner` | partner별 버튼 | 버튼 1개 | 모든 모델 공통 |
| TM | `mech_partner` | partner별 버튼 | 버튼 1개 | has_docking=true만 |

**TM 분리 기준이 `mech_partner`인 이유**: TM 작업은 TMS(M)이 전담하지만, O/N 내 S/N이 서로 다른 mech_partner 그룹에 속하면 TM 완료 일정이 다를 수 있음. mech_partner 그룹 단위로 실적확인을 분리해야 정산 시점이 정확.

**has_docking = false 모델** (DRAGON, SWS, GALLANT): TM 행 자체가 N/A (TMS task 없음). MECH/ELEC만 적용.

#### DB 스키마 변경

**Migration 030: production_confirm에 partner 컬럼 추가**

```sql
BEGIN;

-- 1. partner 컬럼 추가 (nullable — TM은 partner 불필요)
ALTER TABLE plan.production_confirm
    ADD COLUMN IF NOT EXISTS partner VARCHAR(50) DEFAULT NULL;

-- 2. 기존 unique index 교체 (partner 포함)
DROP INDEX IF EXISTS production_confirm_active_unique;

CREATE UNIQUE INDEX production_confirm_active_unique
    ON plan.production_confirm(sales_order, process_type, confirmed_week, COALESCE(partner, ''))
    WHERE deleted_at IS NULL;

-- 3. partner 검색용 인덱스
CREATE INDEX IF NOT EXISTS idx_production_confirm_partner
    ON plan.production_confirm(partner)
    WHERE deleted_at IS NULL;

COMMIT;
```

**설계 의도**:
- `partner = NULL` → TM처럼 partner 구분 불필요한 공정 (기존 동작 호환)
- `partner = 'TMS'` → 해당 협력사 S/N만의 실적확인
- `COALESCE(partner, '')` → NULL도 unique 제약에 포함 (PostgreSQL NULL ≠ NULL 방지)

#### BE API 변경 (`production.py`)

**1. `confirm_production()` — partner 파라미터 추가**:

```python
# 요청 Body 변경
# 기존: { sales_order, process_type, confirmed_week, confirmed_month }
# 변경: { sales_order, process_type, confirmed_week, confirmed_month, partner? }

partner = data.get('partner')  # nullable — 비혼재 시 None

# S/N 필터: partner가 있으면 해당 partner S/N만
# MECH, TM → mech_partner 기준 / ELEC → elec_partner 기준
_PROC_PARTNER_COL = {'MECH': 'mech_partner', 'ELEC': 'elec_partner', 'TM': 'mech_partner'}

if partner and process_type in _PROC_PARTNER_COL:
    partner_col = _PROC_PARTNER_COL[process_type]
    cur.execute(f"""
        SELECT serial_number FROM plan.product_info
        WHERE sales_order = %s AND {partner_col} = %s
    """, (sales_order, partner))
else:
    cur.execute("""
        SELECT serial_number FROM plan.product_info
        WHERE sales_order = %s
    """, (sales_order,))

# confirmable 체크도 해당 S/N만 대상
# INSERT에 partner 포함
```

**2. `_build_order_item()` — MECH/ELEC/TM 혼재 시 partner별 confirmable/confirmed 반환**:

```python
# MECH/ELEC/TM 혼재 분리 대상. PI/QI/SI는 기존 O/N 단위 유지.
# partner_col 매핑: MECH, TM → mech_partner / ELEC → elec_partner
_PROC_PARTNER_COL = {'MECH': 'mech_partner', 'ELEC': 'elec_partner', 'TM': 'mech_partner'}

# 혼재 판정 + partner_confirms 생성 (MECH/ELEC만)
if proc_key in _PROC_PARTNER_COL:
    partner_col = _PROC_PARTNER_COL[proc_key]
    partners = list(set(p.get(partner_col, '') for p in products))
    is_mixed = len(partners) > 1

    if is_mixed:
        partner_confirms = []
        for partner in sorted(partners):
            p_sns = [p['serial_number'] for p in products if p.get(partner_col) == partner]
            # partner별 confirmable 판정 + confirmed 조회
            partner_confirms.append({
                'partner': partner,
                'sn_count': len(p_sns),
                'confirmable': _is_process_confirmable(sns_progress, pt, settings, proc_key, p_sns),
                'confirmed': ...,  # confirms에서 partner 키로 조회
            })

processes[proc_key] = {
    'total': total, 'completed': completed, 'pct': ...,
    'mixed': is_mixed,
    'partner_confirms': partner_confirms if is_mixed else None,
    # 비혼재 또는 TM/PI/QI/SI → 기존 구조
    'confirmable': _is_process_confirmable(...) if not is_mixed else None,
    'confirmed': ... if not is_mixed else None,
}
```

**O/N 6520 MECH 응답 예시 (혼재)**:
```json
{
  "total": 12, "completed": 0, "pct": 0.0,
  "mixed": true,
  "partner_confirms": [
    {"partner": "FNI", "sn_count": 4, "confirmable": false, "confirmed": false},
    {"partner": "TMS", "sn_count": 1, "confirmable": false, "confirmed": false}
  ],
  "confirmable": null, "confirmed": null
}
```

**O/N 6520 TM 응답 (혼재 — mech_partner 기준 분리)**:
```json
{
  "total": 8, "completed": 4, "pct": 50.0,
  "mixed": true,
  "partner_confirms": [
    {"partner": "FNI", "sn_count": 4, "confirmable": false, "confirmed": false},
    {"partner": "TMS", "sn_count": 1, "confirmable": true, "confirmed": false}
  ],
  "confirmable": null, "confirmed": null
}
```

**3. `cancel_confirm()` — partner 조건 추가**:

```python
# DELETE (soft delete) 시 partner 조건 포함
# partner=NULL인 기존 데이터도 호환
```

#### FE 변경 (`ProductionPerformancePage.tsx`)

**ProcessCell — MECH/ELEC/TM 혼재 시 partner별 버튼 렌더링**:

```
비혼재 (공통):                  혼재 (MECH/ELEC/TM 공통):
┌──────────────────────┐       ┌──────────────────────┐
│ 6/6  ✅ 실적확인      │       │ 0/12                  │  ← 전체 합산
│ TMS                   │       │ TMS 혼재              │
└──────────────────────┘       │ ┌─────────────────┐  │
                                │ │ TMS (1대) 실적확인│  │
                                │ │ FNI (4대) 실적확인│  │
                                │ └─────────────────┘  │
                                └──────────────────────┘
```

**confirm API 호출 시**:
```typescript
// 혼재 시
confirmMutation.mutate({
    sales_order: '6520',
    process_type: 'MECH',
    partner: 'TMS',  // ← NEW
    confirmed_week: 'W12',
    confirmed_month: '2026-03',
});
```

#### 구현 순서

1. DB: Migration 030 실행 (partner 컬럼 + unique index 변경)
2. BE: `confirm_production()` — partner 파라미터 + S/N 필터 + INSERT 반영
3. BE: `cancel_confirm()` — partner 조건 추가
4. BE: `_build_order_item()` — partner별 confirmable/confirmed 반환
5. BE: `get_performance()` — confirms 조회에 partner 포함
6. FE: ProcessCell — partner_confirms 렌더링 + confirm API partner 전달
7. FE: AdminSettingsPanel — 변경 없음 (공정별 on/off는 기존 유지)

#### 하위호환

- 비혼재 O/N: `partner = NULL` → 기존 동작 그대로
- TM 공정: `partner = NULL` → 항상 O/N 단위 (TMS(M) default)
- 기존 confirmed 데이터: `partner = NULL`로 유지 — 마이그레이션 불필요
- FE: `partner_confirms`가 없으면 기존 `confirmable/confirmed` 사용

---

### 33. VIEW FE — production performance 응답 변환 필요 항목

**보고일**: 2026-03-22
**시급도**: 중간 — BE 배포 후 FE 연동 시 대응 필요
**선행**: #31 (sns 배열), #32 (processes 키), #32-B (ready + confirmable) 모두 BE 완료

**현황**: FE `types/production.ts`의 `OrderGroup` 타입 vs BE `_build_order_item()` 응답 간 불일치 3건 존재

#### 33-1. `partner_info` 객체 미반환 — FE 변환 처리

**FE 참조** (`ProductionPerformancePage.tsx` line 550-562):
```tsx
partnerDisplay={(order.partner_info?.mech ?? '—')}
mixed={(order.partner_info?.mixed ?? false)}
```

**BE 응답**: `mech_partner`, `elec_partner` flat 문자열

**수정 위치**: `api/production.ts` — `getPerformance()` 응답 후처리
```typescript
// BE 응답 → FE 타입 변환
orders.map(order => ({
  ...order,
  partner_info: {
    mech: order.mech_partner || '—',
    elec: order.elec_partner || '—',
    mixed: order.mech_partner !== order.elec_partner,
  },
}))
```

#### 33-2. `confirms` 배열 미반환 — FE 변환 처리

**FE 참조** (`ProductionPerformancePage.tsx` line 142, 274-290, 509, 549):
```tsx
const confirm = confirms.find(c => c.process_type === processType);
const mechConfirmed = orders.filter(o => (o.confirms ?? []).some(c => c.process_type === 'MECH')).length;
```

**BE 응답**: `processes.MECH.confirmed`, `.confirmed_at`, `.confirm_id` (개별 내장)

**수정 위치**: `api/production.ts` — `getPerformance()` 응답 후처리
```typescript
// processes 내부 confirmed 정보 → confirms 배열로 변환
const confirms: ConfirmRecord[] = Object.entries(order.processes)
  .filter(([, v]) => v.confirmed)
  .map(([pt, v]) => ({
    id: v.confirm_id,
    process_type: pt as 'MECH' | 'ELEC' | 'TM',
    confirmed_week: week,
    confirmed_by: '',
    confirmed_at: v.confirmed_at ?? '',
  }));
```

#### 33-3. `partner_info.mixed` "혼재" 판정 로직 오류 — FE 수정 필요

**증상**: O/N 1111 (S/N 1대 — TEST-1111)인데 MECH/ELEC 모두 "혼재" 마크 표시

**현재 FE 로직** (`api/production.ts` line 27):
```typescript
mixed: (raw.mech_partner || '') !== (raw.elec_partner || ''),
```
→ MECH 협력사(FNI) ≠ ELEC 협력사(C&A)이면 `mixed=true`

**문제**: "혼재"의 올바른 의미는 **같은 O/N 내에 여러 S/N이 있을 때, 같은 공정에서 S/N마다 협력사가 다른 경우**
- O/N 1111은 S/N 1대 → 혼재 불가능
- MECH와 ELEC의 협력사가 다른 것은 정상 (기구=FNI, 전장=C&A)

**수정 방안 (택 1)**:
- **A안 (BE에서 판정)**: BE가 `partner_info.mixed`를 직접 계산하여 반환. S/N이 2대 이상이고 같은 공정의 partner가 다를 때만 true
- **B안 (FE에서 수정)**: `sns` 배열에서 같은 공정의 partner를 비교
```typescript
mixed: order.sns.length > 1 &&
  new Set(order.sns.map(s => s.mech_partner)).size > 1
```

**임시 조치**: `sn_count === 1`이면 `mixed: false` 강제
```typescript
mixed: order.sn_count > 1 && (raw.mech_partner || '') !== (raw.elec_partner || ''),
```

---

#### 33-4. `sns[].checklist` — 추후 대응 (BACKLOG)

**FE 참조** (`ProductionPerformancePage.tsx` line 600-607):
```tsx
{sn.checklist?.MECH?.completed_at && <span>완료 {sn.checklist.MECH.completed_at.slice(5, 10)}</span>}
```

**BE 응답**: `sns[].checklist` 미반환 — optional chaining으로 보호되어 에러 없음, 단순히 미표시

**대응**: confirm_checklist_required Stage 2 (BACKLOG #28) 구현 시 BE에 `checklist` 필드 추가 예정. 현재 수정 불필요.

#### 33-5. `SNProgress` 타입 확장 (권장)

**현재**: `SNProgress = { MECH, ELEC, TM }` 고정 3키
**BE 실제**: PI, QI, SI도 반환 가능

**권장 수정** (`types/production.ts`):
```typescript
// 현재
export interface SNProgress {
  MECH: ProcessProgress;
  ELEC: ProcessProgress;
  TM: ProcessProgress;
}
// 권장
export type SNProgress = Record<string, ProcessProgress>;
```

#### 33-6. `ProcessCell` N/A 상태에서 협력사 + 혼재 마크 미표시 — FE 수정 완료

**보고일**: 2026-03-23
**증상**: O/N 6587 (GAIA-I DUAL, 5대) — 기구 FNI/BAT 혼재, 전장 C&A/TMS 혼재인데 혼재 마크 미표시

**원인**: `ProcessCell` 컴포넌트 line 145-151에서 `processStatus.total === 0` (N/A) 시 즉시 `<td>N/A</td>` 반환 → `partnerDisplay` + `mixed` 렌더링 블록에 도달 못함

**참고**: O/N 6587은 작업 미착수 상태 (progress 0) → 모든 공정 total=0 → 전부 N/A early return

**수정** (`ProductionPerformancePage.tsx` ProcessCell):
- N/A 분기 안에 `partnerDisplay` + `mixed` 렌더링 블록 추가
- progress 미착수 상태에서도 O/N 행에 협력사 + 혼재 마크 정상 표시

---

#### 요약: VIEW 수정 체크리스트

| # | 파일 | 변경 | 시급도 | 상태 |
|---|------|------|--------|------|
| 33-1 | `api/production.ts` | `getPerformance()` 후처리: `partner_info` 객체 구성 | 높음 | ✅ 완료 |
| 33-2 | `api/production.ts` | `getPerformance()` 후처리: `confirms` 배열 변환 | 높음 | ✅ 완료 |
| 33-3 | `api/production.ts` | `partner_info.mixed` "혼재" 판정 로직 수정 — `sns` 배열 기반 S/N별 협력사 비교 | 높음 | ✅ 완료 |
| 33-4 | — | `sns[].checklist` — BACKLOG #28 연계, 현재 수정 불필요 | 낮음 | — |
| 33-5 | `types/production.ts` | `SNProgress` → `Record<string, ProcessProgress>` 확장 | 중간 | ✅ 완료 |
| 33-6 | `ProductionPerformancePage.tsx` | ProcessCell N/A 상태에서 협력사 + 혼재 마크 표시 | 높음 | ✅ 완료 |

---

### 34. SAP I/F 대비 실적확인 데이터 구조 보강 — BACKLOG

**보고일**: 2026-03-22
**시급도**: 낮음 — SAP 연동 설계 확정 시 착수
**선행**: #31, #32, #32-B 완료

**현황**: 실적확인 데이터가 `plan.production_confirm` 테이블에 O/N + 공정 단위로 저장됨. SAP PP/CO 모듈 연동 시 아래 구조적 문제 존재:

| # | 현재 한계 | SAP 요구 | 영향 |
|---|----------|---------|------|
| 1 | O/N 단위 확인 (S/N 상세 없음) | S/N 단위 공정 실적 (CO11N) | 어떤 S/N이 언제 완료됐는지 추적 불가 |
| 2 | 수량 정보 없음 (sn_count만) | yield_qty(양품), scrap_qty(불량), rework_qty(재작업) | 수량 기반 실적 보고 불가 |
| 3 | 내부 공정코드만 (MECH/ELEC/TM) | SAP Operation Number(0010, 0020) + Work Center | 공정 매핑 테이블 필요 |
| 4 | 삭제=soft delete만 | SAP 전송 후 취소 시 역전기(reversal posting) 필요 | 전송 상태 추적 부재 |

**필요 테이블 (2개 신규 + 1개 보강)**:

**1. `plan.production_confirm_detail` — S/N 단위 실적 상세:**
```sql
CREATE TABLE plan.production_confirm_detail (
    id SERIAL PRIMARY KEY,
    confirm_id INTEGER NOT NULL REFERENCES plan.production_confirm(id),
    serial_number VARCHAR(255) NOT NULL,
    process_type VARCHAR(20) NOT NULL,
    yield_qty INTEGER NOT NULL DEFAULT 1,
    scrap_qty INTEGER NOT NULL DEFAULT 0,
    rework_qty INTEGER NOT NULL DEFAULT 0,
    sap_operation VARCHAR(10),          -- SAP 공정번호
    sap_work_center VARCHAR(20),        -- SAP 작업장
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**2. `plan.sap_interface_log` — SAP 전송 이력:**
```sql
CREATE TABLE plan.sap_interface_log (
    id SERIAL PRIMARY KEY,
    confirm_id INTEGER NOT NULL REFERENCES plan.production_confirm(id),
    interface_type VARCHAR(20) NOT NULL,    -- 'CO11N', 'REVERSAL'
    sap_doc_number VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, SENT, SUCCESS, FAILED, REVERSED
    request_payload JSONB,
    response_payload JSONB,
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**3. `plan.production_confirm` 컬럼 추가:**
```sql
ALTER TABLE plan.production_confirm
    ADD COLUMN sap_status VARCHAR(20) DEFAULT 'NOT_SENT',
    ADD COLUMN sap_doc_number VARCHAR(50),
    ADD COLUMN sap_sent_at TIMESTAMPTZ;
```

**데이터 흐름 (SAP I/F 시)**:
```
실적확인 클릭 → production_confirm INSERT
              → production_confirm_detail INSERT (S/N별)
              → sap_status = 'NOT_SENT'

SAP 배치     → NOT_SENT 건 조회 → RFC/BAPI 호출
              → sap_interface_log INSERT
              → 성공: sap_status = 'CONFIRMED' + sap_doc_number
              → 실패: sap_status = 'FAILED' + retry_count++

실적확인 취소 → deleted_at SET
              → sap_status = 'CONFIRMED'이면 역전기 요청
              → sap_interface_log INSERT (type='REVERSAL')
```

**선제 적용 가능 항목**: `production_confirm`에 `sap_status` 컬럼만 먼저 추가 — 기존 로직 영향 없음 (DEFAULT 'NOT_SENT')

---

### 35. 생산실적 리스트 기준 변경 — `mech_start` → 공정 종료일 기준

**보고일**: 2026-03-23
**시급도**: 높음 — 실적확인 시점과 표시 기준 불일치
**선행**: DB `module_end` 컬럼 추가 + ETL 적재

**문제**: `GET /api/admin/production/performance` 쿼리가 `mech_start` 기준으로 제품을 필터링. W12에 착수한 O/N이 W13에 완료되면 W13 뷰에서 보이지 않아 실적확인이 불가능.

**변경 내용**:

| 항목 | 변경 전 | 변경 후 |
|------|--------|--------|
| DB | `module_end` 컬럼 없음 | `ALTER TABLE ADD COLUMN module_end DATE` + 인덱스 |
| ETL | `module_end` 미추출 | AQ열 "모듈계획종료일" 추출 + 적재 |
| BE 쿼리 | `WHERE mech_start >= ? AND mech_start < ?` | `WHERE (mech_end 범위) OR (elec_end 범위) OR (COALESCE(module_end, module_start) 범위)` |

**설계 결정**:
- **통합 뷰**: 탭 분리 없이 현재 페이지에서 "해당 주차에 어떤 공정이든 완료되는 O/N" 표시
- **MECH/ELEC end 보통 비슷**: 동일 주차에 표시됨
- **module_end 7~10일 차이**: MECH/ELEC이 W12 완료, TM이 W13 완료면 양쪽 주차에 모두 표시
- **PI/QI/SI end 불필요**: 하루 공정, start ≈ end. 실제 완료는 `app_task_details.completed_at` 기준
- **module_end NULL fallback**: `COALESCE(module_end, module_start)` — ETL 미적재 과도기 대응

**상태**: ✅ BE 코드 수정 완료 (DB ALTER TABLE 수동 실행 필요)

---

#### #35 검토 피드백 (2026-03-23)

**TM 공정 순서 정정**: TM(모듈)은 MECH/ELEC보다 **7~10일 먼저** 완료됨. 문서 예시 수정 필요:
- 실제: TM W11 완료 → MECH/ELEC W12 완료 (TM이 선행)
- 문서: "MECH/ELEC W12 완료, TM W13 완료" → 순서 반대

**O/N 카운트 증가 우려**:

end 기준 OR 조건이면, 한 주차에 표시되는 O/N(S/N)이 기존 대비 증가함:
- 기존 (mech_start 기준): 해당 주에 **착수한** O/N만 표시
- 변경 (end OR 조건): 해당 주에 **어떤 공정이든 완료되는** O/N 전부 표시
- 예: TM end W11 + MECH/ELEC end W12인 O/N → W11, W12 **양쪽** 주차 리스트에 포함

한 주차 내 중복은 없음 (SQL DISTINCT). 주차 간 중복은 의도된 동작.
단, 리스트가 길어지면 페이지네이션 또는 공정별 탭 분류 검토 필요.

**BE 쿼리 재사용 여부 확인 필요 (A안 vs B안)**:

현재 생산실적(`/api/admin/production/performance`)과 생산일정(`/api/admin/factory/monthly-detail`)의 목적:

| 페이지 | API 엔드포인트 | 기준 | 목적 |
|--------|---------------|------|------|
| 생산일정 | `GET /api/admin/factory/monthly-detail` | `mech_start` (착수일, 월 기준) | 이번 달 착수하는 O/N 일정 관리 |
| 생산실적 | `GET /api/admin/production/performance` | 변경: `*_end` (종료일, 주 기준) | 이번 주 완료되는 O/N 실적 확인 |

두 API의 **WHERE 조건이 완전히 다름** → 내부 쿼리 분리 필요:

| 안 | 내용 | 장점 | 단점 |
|---|------|------|------|
| **A안**: 공유 쿼리 + `date_basis` 파라미터 | 기존 쿼리에 `date_basis='start'\|'end'` 파라미터 추가, 조건 분기 | 코드 중복 최소화 | 쿼리 복잡도 증가, start/end 조건이 근본적으로 다름 (start는 단일 컬럼, end는 3개 OR) |
| **B안**: performance 전용 쿼리 분리 | `_get_performance_orders()` 별도 함수 생성, end 기준 WHERE절 독립 구성 | 각 API 쿼리가 명확, 유지보수 용이 | 쿼리 코드 일부 중복 |

**권장: B안** — 생산일정과 생산실적의 WHERE 조건, JOIN, 집계 로직이 이미 상당히 다름. 분리가 깔끔함.

**BE 확인 요청 사항**:
1. `performance` 엔드포인트가 내부적으로 `factory/monthly-detail` 쿼리를 재사용하는지 여부
2. 재사용 시 → A안/B안 중 택 1 결정
3. 독립 쿼리 시 → #35 변경 내용 그대로 적용 (현재 상태)

**FE 영향**: 없음 — `usePerformance(week)` 파라미터만 전달, 필터링은 전부 BE 쿼리 단

---

#### #35-B 페이지 구조 검토 — end 기준 전환 시 O/N 카운트 증가 대응 (2026-03-23)

**배경**: #35 end 기준 OR 조건 전환 시 주차별 O/N 카운트가 기존(mech_start) 대비 증가함. 페이지 분류 또는 구조 변경 필요 여부 검토.

**카운트 증가 시뮬레이션 (예시)**:

| O/N | S/N 수 | TM end | MECH end | ELEC end | 기존(mech_start) | 변경(end OR) |
|-----|--------|--------|----------|----------|------------------|--------------|
| 6238 | 3대 | W11 | W12 | W12 | W11 (착수) | W11 + W12 |
| 6400 | 5대 | W11 | W12 | W12 | W12 (착수) | W11 + W12 |
| 6500 | 2대 | — (비GAIA) | W12 | W12 | W12 (착수) | W12 |

- 기존 mech_start: W12에 O/N 2건 (6400, 6500)
- 변경 end OR: W12에 O/N 3건 (6238, 6400, 6500) + W11에도 O/N 2건 (6238, 6400의 TM)
- **예상 증가율**: 주차당 O/N 수 약 1.3~1.8배 (TM 해당 GAIA 비율에 따라 변동)

**실제 영향도 추정 (2026-03-23 기준)**:
- **현재 규모**: 주당 O/N **34건**, S/N **100대** (mech_start 기준)
- **end OR 전환 시**: O/N **45~60건** 예상 (TM end가 7~10일 앞서므로 GAIA 계열 O/N이 2주차에 걸쳐 표시)
- **스크롤**: O/N 50건 × 행 높이 50px = 2500px → 스크롤 4~6회 → **단일 테이블로는 사용성 저하**
- **expand 시**: S/N 상세까지 펼치면 체감 길이 2~3배 → 실질적으로 관리 불가

---

**검토한 3가지 접근법**:

**C안: 현행 통합 뷰 유지 + 페이지네이션**

| 항목 | 내용 |
|------|------|
| 구조 | 현재 단일 테이블 유지, 페이지네이션 추가 (20건/페이지) |
| O/N 증가 대응 | 상태 필터(전체/미완료/완료) + 페이지네이션으로 분할 |
| KPI "주간 O/N" | end OR 조건 기준 DISTINCT O/N 수 → 실적확인 가능 건수와 일치 |
| TM 확인 | TM 칼럼에서 인라인 확인 (현행 동일) |
| 장점 | FE 수정 최소, 사용자 학습 비용 없음, 한 화면에서 전체 현황 파악 |
| 단점 | 50건 이상일 때 페이지 넘기며 확인 → 전체 현황 파악이 어려움, 일괄확인 시 페이지 걸침 문제 |
| FE 수정 | 페이지네이션 컴포넌트 추가 |
| BE 수정 | #35 그대로 (FE 클라이언트 페이지네이션) |

**A안: 공정 그룹별 탭 분리 (기구·전장 / TM)**

| 항목 | 내용 |
|------|------|
| 구조 | `주간` 뷰 안에 `기구·전장` 탭 / `TM` 탭 추가 |
| 기구·전장 탭 | mech_end / elec_end 기준 O/N → MECH, ELEC 확인 전용 |
| TM 탭 | module_end 기준 O/N → TM 확인 전용 |
| KPI "주간 O/N" | 탭별로 카운트 분리 (기구·전장 N건 / TM M건) |
| 장점 | 각 탭 O/N 수 적어짐, 공정 담당자별 집중 |
| 단점 | MECH 확인 + TM 확인을 동시에 봐야 하는 관리자에게 불편 (탭 전환 필요), FE 수정 중간 규모 |
| FE 수정 | 탭 컴포넌트 추가, `usePerformance` 호출 시 `process_group` 파라미터 추가 필요 |
| BE 수정 | #35 + `process_group` 필터 파라미터 추가 or 별도 엔드포인트 |

**B안: 하이브리드 KPI (카운트 기준 분리)**

| 항목 | 내용 |
|------|------|
| 구조 | 단일 테이블, KPI 카드만 기준 분리 |
| 리스트 | end OR 조건 전체 O/N 표시 (C안과 동일) |
| KPI "주간 O/N" | mech_start 기준 카운트 (착수 기준) |
| KPI "기구/전장 확인" | mech_end/elec_end 기준 확인 가능 건수 |
| KPI "TM 확인" | module_end 기준 확인 가능 건수 |
| 장점 | KPI 의미가 명확 (착수 vs 완료) |
| 단점 | "주간 O/N" 8건인데 리스트에 12건 표시 → 사용자 혼동, KPI와 리스트 기준 불일치 → 질문 유발 |
| FE 수정 | KPI 카드 로직 변경 (별도 카운트 기준 적용) |
| BE 수정 | summary에 `start_based_count`, `end_based_count` 이중 카운트 반환 필요 |

---

**권장: A안 (공정 그룹별 탭 분리)**

근거 (O/N 34건, S/N 100대 기준):
1. **O/N 수 규모가 이미 큼**: 현재 34건 → end 전환 시 45~60건 예상. C안(단일 테이블)으로는 스크롤 과다, 일괄확인 시 페이지 걸침
2. **TM과 MECH/ELEC의 시점 차이가 큼**: TM이 7~10일 먼저 끝남 → 같은 O/N이 2주에 걸쳐 표시. 탭 분리하면 각 탭에서 **해당 공정 확인 가능한 O/N만** 표시 → 카운트 줄어듦
3. **실제 업무 흐름에 맞음**: TM 담당자는 TM만, 기구/전장 담당자는 MECH/ELEC만 확인. 통합 뷰에서 모든 칼럼 보는 관리자보다 공정별 담당자가 주 사용자
4. **탭별 카운트 분리 효과**:
   - GAIA 비율 80%로 가정 (34건 중 ~27건이 TM 해당)
   - 기구·전장 탭: mech_end/elec_end 기준 → 주당 ~34건 (현행과 비슷)
   - TM 탭: module_end 기준 → 주당 ~27건 (TM 해당만)
   - 통합 대비: 60건 → 각 탭 30건 내외로 분산
5. **KPI 카드 의미 명확**: 탭 전환 시 KPI도 해당 공정 기준으로 표시 → "주간 O/N" 숫자와 리스트 일치

**A안 구현 상세**:

```
┌──────────────────────────────────────────────────┐
│  [주간 ○]  [월마감]                              │
│                                                   │
│  [W10] [W11] [■ W12] [W13]                       │
│                                                   │
│  ┌─────────────┐  ┌─────────────┐                │
│  │ 기구·전장   │  │ TM(모듈)    │   ← 공정 탭   │
│  └─────────────┘  └─────────────┘                │
│                                                   │
│  ┌─ KPI Cards (탭 기준) ────────────────────────┐│
│  │ 주간 O/N: 34 │ 기구확인: 20/34 │ 전장: 18/34││
│  └──────────────────────────────────────────────┘│
│                                                   │
│  ┌─ 테이블 (기구·전장 탭) ──────────────────────┐│
│  │ O/N  │ 모델 │ S/N │ MECH │ ELEC │ 협력사    ││
│  │ (TM 칼럼 숨김 — TM 탭에서만 표시)            ││
│  └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

| 탭 | WHERE 조건 | 표시 칼럼 | KPI |
|---|---|---|---|
| 기구·전장 | `mech_end IN week OR elec_end IN week` | O/N, 모델, S/N, MECH progress, ELEC progress, 협력사 | 주간 O/N, 기구확인, 전장확인, 월간누적(MECH+ELEC) |
| TM(모듈) | `COALESCE(module_end, module_start) IN week` | O/N, 모델, S/N, TM progress, TM상세(TANK_MODULE/PRESSURE_TEST) | 주간 O/N(TM), TM확인, 월간누적(TM) |

**BE 수정 (2가지 방식)**:

| 방식 | 설명 |
|------|------|
| 파라미터 추가 | `GET /api/admin/production/performance?week=W12&process_group=mech_elec` or `tm` — 기존 엔드포인트에 `process_group` 필터 추가 |
| FE 필터링 | BE는 end OR 전체 반환 (현행 #35), FE에서 탭별로 `mech_end`/`module_end` 기준 클라이언트 필터 — **BE 수정 불필요** |

**권장: FE 필터링 방식** — BE는 #35 그대로, FE에서 탭 전환 시 `orders.filter()` 적용. 이유:
- BE 추가 수정 없음 (이미 end OR 데이터를 반환)
- 탭 전환이 즉각적 (API 재호출 불필요)
- 일괄확인은 현재 탭에 표시된 O/N만 대상

**FE 수정 범위**:

| # | 파일 | 변경 내용 | 규모 |
|---|------|----------|------|
| 1 | `ProductionPerformancePage.tsx` | 공정 탭 UI 추가 (`activeProcessTab: 'mech_elec' \| 'tm'`) | 중 |
| 2 | `ProductionPerformancePage.tsx` | `filteredOrders` 로직에 탭별 필터 추가 | 소 |
| 3 | `ProductionPerformancePage.tsx` | KPI 카드 — 탭별 카운트 분기 | 소 |
| 4 | `ProductionPerformancePage.tsx` | 테이블 헤더 — TM 탭에서는 MECH/ELEC 숨김, 기구·전장 탭에서는 TM 숨김 | 소 |
| 5 | `types/production.ts` | `OrderGroup`에 `mech_end`, `elec_end`, `module_end` 필드 추가 (BE 응답에서 받기) | 소 |

**BE 응답 필드 추가 요청** (#35 보완):
- `orders[].mech_end`: 기구 종료일 (이미 `product_info.mech_end` 존재)
- `orders[].elec_end`: 전장 종료일 (이미 존재)
- `orders[].module_end`: 모듈 종료일 (#35에서 추가한 컬럼)
- 목적: FE에서 탭별 필터 적용 시 사용

**C안 대안 (탭 분리 안 할 경우)**: 페이지네이션 20건/페이지 + 미확인 우선 정렬 + expand 기본 off. 가능하지만 전체 현황 파악과 일괄확인에 불편.

**B안 (하이브리드 KPI)**: KPI와 리스트 기준 불일치 문제 → O/N 34건 규모에서는 혼동 심화. 비권장.

---

#### #38 BUG — TM `partner_confirms`에 기구 파트너(FNI) 혼입 (2026-03-23)

**보고일**: 2026-03-23
**시급도**: 높음 — TM 실적확인 시 잘못된 파트너 기준으로 분리됨
**발견**: VIEW 생산실적 페이지 TM(모듈) 탭, O/N 6520

**현상**:

TM(모듈) 탭에서 O/N 6520의 TM 칼럼에:
```
4/8
FNI (4대) [확인]
TMS (1대) [확인]
```

S/N 상세:
| S/N | 기구 파트너 | 전장 파트너 | TM progress |
|-----|-----------|-----------|-------------|
| GBWS-6855 | TMS | TMS | 50% |
| GBWS-6856 | FNI | C&A | 50% |
| GBWS-6857 | FNI | C&A | N/A |
| GBWS-6858 | FNI | C&A | N/A |
| GBWS-6859 | FNI | C&A | N/A |

**원인**:

BE `_build_partner_confirms()`에서 TM 공정의 `partner_confirms`를 생성할 때 **`mech_partner`** 기준으로 S/N을 그룹핑하고 있음.

하지만 TM(탱크모듈)은 기구 협력사와 무관한 별도 공정:
- TM task(TANK_MODULE, PRESSURE_TEST)는 TMS 카테고리
- 기구 파트너가 FNI든 TMS든 TM 작업 자체는 동일
- FNI는 기구/전장 협력사이지 TM 협력사가 아님

**올바른 동작**:

TM 공정의 `partner_confirms`는:
- **TM에 해당하는 task가 있는 S/N 전체**를 단일 그룹으로 처리 (mixed=false)
- 또는 TM task 자체의 파트너 기준으로 분리 (현재 TMS 단일이므로 mixed=false)
- `mech_partner` 기준 분리 적용 금지

**수정 위치**: OPS BE `production.py` — `_build_partner_confirms()` 또는 mixed 판정 로직

**수정 방향**:
```python
# TM 공정은 mech_partner가 아닌 task_category(TMS) 기준
# 현재 TM task는 모두 TMS 카테고리 → mixed=false, partner_confirms=null
if process_type == 'TM':
    # TM은 partner 분리 불필요 — 기존 confirmable/confirmed 사용
    mixed = False
    partner_confirms = None
```

---

#### #39 검증 요청 — TM 탭 O/N 카운트 기준 확인 (`module_end`) (2026-03-23)

**보고일**: 2026-03-23
**시급도**: 중간 — Sprint 13(#35-B) 공정 탭 분리 정합성 검증
**참조**: #35-B A안 (공정 그룹별 탭 분리)

**검증 필요 사항**:

현재 TM(모듈) 탭에 표시되는 O/N이 `module_end` 기준으로 정확히 필터되고 있는지 확인 필요.

**확인 포인트**:

| # | 검증 항목 | 확인 방법 |
|---|----------|----------|
| 1 | TM 탭 O/N 카운트 | `module_end`가 해당 주차에 속하는 O/N만 표시되는지 |
| 2 | 기구·전장 탭 O/N 카운트 | `mech_end` 또는 `elec_end`가 해당 주차에 속하는 O/N만 표시되는지 |
| 3 | 두 탭 합산 vs 전체 | 탭별 O/N이 겹치는 경우 (같은 O/N이 양쪽 탭에 표시) 정상인지 |
| 4 | 비GAIA O/N (TM 없음) | TM 탭에 표시되지 않는지 (예: SWS 모델) |
| 5 | GAIA O/N (TM 있음) | TM 탭에 정상 표시되는지 |

**현재 스크린샷 기준 (W13)**:

기구·전장 탭: O/N 3건 (6520, 6526, 6623)
TM 탭: O/N 2건 (6520, 6526) — 6623(SWS-I)은 TM 없으므로 미표시

→ 6623이 TM 탭에서 제외된 것은 정상. 단, `module_end` 기준 필터인지 `processes.TM.total > 0` 기준 필터인지 확인 필요.

**BE 확인 요청**:
- `orders[].module_end` 값이 응답에 포함되고 있는지
- `module_end`가 NULL인 O/N이 TM 탭에서 어떻게 처리되는지 (비GAIA = module_end NULL → TM 탭 미표시 정상)
- W13에서 `module_end`가 W12인 O/N이 있다면 TM 탭에 표시 여부 (end 기준 cross-week 검증)

---

## Sprint 18 사전 검토 — S/N 작업 현황 카드뷰 (2026-03-25)

> Sprint 18 설계 문서 검토 후 발견된 BE 확인/요청 사항 정리

#### #40 확인 요청 — `GET /tasks/<serial_number>?all=true` API 존재 여부 (2026-03-25) — ✅ DONE (2026-04-17 DOC-SYNC-01 검증)

> **검증 결과**: `backend/app/routes/work.py:L498-L500` — `@work_bp.route("/tasks/<serial_number>")` 엔드포인트 존재, `all=true` 쿼리 파라미터로 비활성 task까지 조회 가능 (`get_tasks_by_serial()` 내 `fetch_all` 지원).

**시급도**: 🔴 높음 — Sprint 18 전체 전제조건
**참조**: Sprint 18 Task 2 (S/N 상세 패널)

**현황**:

Sprint 18 설계에서 S/N 상세 패널의 핵심 데이터소스로 `GET /tasks/<serial_number>?all=true`를 명시함.
현재 AXIS-VIEW FE 코드에 이 API 호출 함수가 없고, 기존 연동 이력 없음.

**확인 필요 사항**:

| # | 항목 | 설명 |
|---|------|------|
| 1 | 엔드포인트 존재 여부 | `GET /tasks/<serial_number>` 또는 유사 경로가 OPS BE에 구현되어 있는지 |
| 2 | `?all=true` 파라미터 | 전체 공정 task를 한번에 반환하는 파라미터가 지원되는지 |
| 3 | `workers[]` 응답 구조 | 각 task에 `workers[]` 배열이 포함되는지 (worker_name, started_at, completed_at, duration_minutes, status) |
| 4 | 동시작업 지원 | 동일 task에 복수 작업자가 있을 때 `workers[]`에 모두 포함되는지 |

**API가 없을 경우**:

Sprint 18 문서의 "OPS BE 변경 없음" 전제가 무효화됨. 아래 엔드포인트 신규 개발 또는 기존 API 확장 필요:

```
GET /api/admin/tasks/<serial_number>?all=true

응답 예시:
{
  "serial_number": "GBWS-6408",
  "tasks": [
    {
      "task_category": "MECH",
      "status": "completed",
      "workers": [
        {
          "worker_id": 42,
          "worker_name": "김태영",
          "started_at": "2026-03-25T09:00:12+09:00",
          "completed_at": "2026-03-25T10:32:45+09:00",
          "duration_minutes": 92,
          "status": "completed"
        }
      ]
    }
  ]
}
```

---

#### #41 확인 요청 — `GET /performance` S/N 레벨 공정별 progress 데이터 범위 (2026-03-25) — ✅ DONE (2026-04-17 DOC-SYNC-01 검증)

> **검증 결과**: `backend/app/routes/product.py:L29-L31` — `@product_bp.route("/progress")` `get_sn_progress()` 구현 완료. S/N별 공정 progress 응답 제공.

**시급도**: 🟡 중간 — Sprint 18 Task 1 카드 progress 표시
**참조**: Sprint 18 Task 1 (S/N 카드 리스트)

**현황**:

Sprint 18 카드에 "4/7 공정 완료" 형태의 progress를 표시하려면 S/N 단위로 각 공정(MECH/ELEC/TM/PI/QI/SI)의 완료 여부를 판단해야 함.

현재 `GET /performance` 응답 구조:
- `orders[].processes` → O/N 레벨 공정 progress (S/N 레벨 아님)
- `orders[].sns[]` → S/N 리스트 (각 S/N에 공정별 progress 포함 여부 불확실)
- `orders[].sn_confirms[]` → S/N별 confirm 현황 (공정 내 task 완료율, 전체 공정 완료 수 아님)

**확인 필요 사항**:

| # | 항목 | 설명 |
|---|------|------|
| 1 | `sns[].progress` 필드 | 각 S/N에 `progress: Record<string, { total, completed, pct }>` 형태가 있는지 |
| 2 | 없다면 대안 | S/N별 공정 완료 여부를 FE에서 어떤 필드로 판단할 수 있는지 |
| 3 | 주간 필터 없이 호출 | `GET /performance` (week 파라미터 없이) 호출 시 전체 데이터 반환 범위 (전체? 최근 N건?) |

**FE 판단 근거**:

S/N 카드 progress = `sns[].progress[process].pct === 100`인 공정 수 / 해당 S/N에 존재하는 전체 공정 수.
이 필드가 BE 응답에 없으면 카드뷰에서 공정 완료 수를 표시할 수 없음.

---

#### #42 확인 요청 — VIEW 권한 체계 `role=pm` 유효성 (2026-03-25) — 🟡 보류 (2026-04-17 Twin파파 판단)

> **검증 결과 (2026-04-17)**: BE 코드에서 `pm` role 직접 사용 미확인. 현재 `is_admin`/`is_manager` 플래그 기반 구조로 대체된 것으로 보임.
> **Twin파파 판단 (2026-04-17)**: 보류 — 당장 판단 내리지 않고 추후 PM 권한 분기가 실제로 필요해지는 시점에 재검토. 현재 운영상 막는 이슈 아님.

**시급도**: 🟡 중간 — Sprint 18 권한 분기
**참조**: Sprint 18 권한 표

**현황**:

Sprint 18 설계 문서에 `role = pm (GST 인원)` 권한이 명시되어 있으나, 현재 VIEW `App.tsx`의 `ProtectedRoute`에서 사용하는 role은 `admin`, `manager`, `gst` 3종뿐. `pm`이라는 role이 존재하지 않음.

**확인 필요 사항**:

| # | 항목 | 설명 |
|---|------|------|
| 1 | `pm` role 존재 여부 | OPS BE JWT에 `role = pm`이 실제로 존재하는지 |
| 2 | 매핑 관계 | `pm`이 기존 `manager` 또는 `gst`에 해당하는지 |
| 3 | 협력사 작업자 role | 협력사 사용자의 role 값이 무엇인지 (S/N 필터링에 사용) |

**FE 대응 방향**:

`pm`이 없으면 Sprint 18 문서의 권한 표를 아래처럼 수정:

| 권한 | 조회 범위 |
|------|----------|
| admin, manager | 전체 S/N |
| gst | 전체 S/N |
| 협력사 (role=?) | 소속 협력사 S/N만 |

---

#### #43 설계 메모 — S/N 상세 패널 N+1 호출 문제 (2026-03-25)

**시급도**: 🟢 참고 — 성능 최적화
**참조**: Sprint 18 Task 1 카드 표시 항목

**현황**:

Sprint 18 카드에 "최근 작업자명 + 마지막 태깅 시간"을 표시하도록 설계되어 있는데, 이 데이터는 `GET /tasks/<sn>?all=true`에서만 제공됨. 카드 리스트 로딩 시 S/N 50개면 50번 API 호출 발생 (N+1 문제).

**방향 B 채택** (2026-03-25):

| 방향 | 설명 | BE 작업 | 채택 |
|------|------|---------|------|
| A. 카드에서 작업자 제거 | 카드는 `performance` API만 사용, 작업자 정보는 상세 패널 클릭 시에만 조회 | 없음 | — |
| **B. performance API 확장** | **`sns[]`에 `last_worker`, `last_activity_at` summary 필드 추가** | **BE 수정 필요** | **✅ 채택** |

**채택 근거**: 현장 관리자(mech, elec in_manager)가 카드 리스트에서 작업자의 실제 태깅 여부를 바로 확인해야 하는 니즈 존재. 장기적으로 작업자별 공정시간 집계 → APS integration까지 고려하면 performance API에 작업자 데이터를 붙이는 방향이 기반 일관성 유지에 유리.

**OPS BE 작업**: Sprint 38 (AGENT_TEAM_LAUNCH.md) — `_build_order_item()`에서 `work_start_log` + `work_completion_log` 서브쿼리로 S/N별 최근 활동 조회, `sns[]`에 필드 추가.

---

### #44 S/N 상세뷰 API 경로 수정 + 목업 제거 — ✅ DONE (2026-03-27)

**시급도**: 🔴 즉시 — 실 데이터 연결 차단 중
**참조**: Sprint 18 Task A-3, Sprint 38 ✅ 완료

#### 문제

`getSNTasks()` (src/api/snStatus.ts 라인 16)의 API 경로에 `/api/app` prefix가 누락됨.

| 구분 | 현재 (VIEW 호출) | OPS BE 실제 엔드포인트 |
|------|-----------------|---------------------|
| 경로 | `/tasks/{sn}?all=true` | `/api/app/tasks/{sn}?all=true` |
| 결과 | 404 → catch → `getMockTasks()` fallback | — |

`getSNProgress()` (라인 9)는 `/api/app/product/progress`로 올바르게 호출하고 있으므로, `getSNTasks()`의 경로만 일관되게 맞추면 됨.

#### BE 응답 형식 검증 완료

OPS BE `work.py`의 `GET /api/app/tasks/<sn>?all=true`는 이미 `workers[]` + `my_status` 포함해서 응답함 (Sprint 15 BUG-12에서 구현됨, Sprint 38이 아님).

| VIEW 기대 필드 (SNTaskDetail) | OPS BE 실제 응답 | 일치 |
|------|------|------|
| `task_category` | ✅ 있음 | 일치 |
| `workers[]` | ✅ 있음 | 일치 |
| `workers[].worker_id` | ✅ 있음 | 일치 |
| `workers[].worker_name` | ✅ 있음 | 일치 |
| `workers[].started_at` | ✅ 있음 | 일치 |
| `workers[].completed_at` | ✅ 있음 | 일치 |
| `workers[].duration_minutes` | ✅ 있음 | 일치 |
| `workers[].status` | ✅ 있음 (`'completed'` / `'in_progress'` / `'not_started'`) | 일치 |
| `my_status` | ✅ 있음 | 일치 |

BE 응답에 추가 필드(id, serial_number, qr_doc_id 등)도 포함되지만, VIEW TypeScript 타입에서 자동 무시됨.

#### VIEW FE 수정 사항 (src/api/snStatus.ts 1개 파일)

**수정 1 — API 경로 (라인 16)**:

```typescript
// 현재
`/tasks/${serialNumber}?all=true`

// 수정
`/api/app/tasks/${serialNumber}?all=true`
```

**수정 2 — 목업 fallback 제거 + 함수 간소화 (라인 13~73)**:

```typescript
// 현재 (try-catch + getMockTasks fallback)
export async function getSNTasks(serialNumber: string): Promise<SNTaskDetail[]> {
  try {
    const { data } = await apiClient.get<SNTaskDetail[]>(
      `/tasks/${serialNumber}?all=true`,
    );
    if (Array.isArray(data) && data.length > 0 && 'workers' in data[0]) {
      return data;
    }
  } catch {
    // API 미구현 → 목업 fallback
  }
  return getMockTasks();
}

// ── 목업 데이터 (Sprint 38 BE 구현 후 제거) ──
function getMockTasks(): SNTaskDetail[] { ... }

// 수정 후
export async function getSNTasks(serialNumber: string): Promise<SNTaskDetail[]> {
  const { data } = await apiClient.get<SNTaskDetail[]>(
    `/api/app/tasks/${serialNumber}?all=true`,
  );
  return Array.isArray(data) ? data : [];
}
```

- `getMockTasks()` 함수 전체 삭제 (라인 28~73)
- 파일 상단 주석에서 `Sprint 38 BE 미구현` 표현 제거

**수정 3 — 파일 상단 주석 (라인 1~3)**:

```typescript
// 현재
// src/api/snStatus.ts
// S/N 작업 현황 API — Sprint 18
// getSNTasks: 실 API 호출 → 실패 시 목업 fallback (Sprint 38 BE 미구현)

// 수정
// src/api/snStatus.ts
// S/N 작업 현황 API — Sprint 18
```

#### 검증

- 상세뷰에서 S/N 클릭 → 실제 작업자 이력(worker_name, started_at, duration_minutes)이 표시되는지 확인
- 태깅 이력 없는 S/N → `workers: []` 빈 배열 정상 표시
- `getMockTasks` 함수가 완전히 제거되었는지 확인
- BE 코드 수정 없음 (OPS Sprint 38 이미 완료)

---

### #45 카드뷰 last_worker에 task 이름 추가 — ✅ DONE (Sprint 38-B, VIEW v1.15.1 연동 완료)

**시급도**: 🟡 중간 — 기능 동작에는 문제 없음, UX 개선
**참조**: Sprint 18-B 이슈 3 (DESIGN_FIX_SPRINT.md)

**엔드포인트**: `GET /api/app/product/progress` (기존)

**요청 내용**: `products[]` 응답에 `last_task_name`, `last_task_category` 필드 추가

| 필드 | 타입 | 설명 |
|------|------|------|
| `last_task_name` | string \| null | 마지막 태깅 작업의 task 이름 (예: "캐비넷 조립") |
| `last_task_category` | string \| null | 마지막 태깅 작업의 카테고리 (예: "MECH") |

**BE 수정 위치**: `progress_service.py` — Step 5 last_activity 서브쿼리

`work_start_log`에 `task_name`, `task_category` 컬럼이 이미 존재하므로 서브쿼리 SELECT에 추가만 하면 됨:

```sql
-- 현재 (Step 5 서브쿼리)
SELECT DISTINCT ON (combined.serial_number)
       combined.serial_number,
       w.name AS last_worker,
       combined.activity_at AS last_activity_at

-- 수정: 2개 컬럼 추가
SELECT DISTINCT ON (combined.serial_number)
       combined.serial_number,
       w.name AS last_worker,
       combined.activity_at AS last_activity_at,
       combined.task_name AS last_task_name,
       combined.task_category AS last_task_category
```

UNION ALL 양쪽 SELECT에도 `task_name`, `task_category` 추가:
- `work_start_log` — 이미 `task_name`, `task_category` 있음
- `work_completion_log` — `task_name` 없으면 `work_start_log` JOIN 또는 NULL fallback

products 배열에 필드 추가 (Step 6):
```python
p['last_task_name'] = activity['last_task_name'] if activity else None
p['last_task_category'] = activity['last_task_category'] if activity else None
```

**FE 사용 예시**: 기본 카드뷰에서 "김태영 · 캐비넷 조립 03-27 09:30" 표시

**FE 현황**: ✅ BE Sprint 38-B 배포 완료 → FE v1.15.1에서 연결 완료

---

### #46 상세뷰 workers 누락 — task_id 매핑 불일치 — ✅ DONE (2026-04-17 Twin파파 확정)

> **검증 결과 (2026-04-17)**: BE(`backend/app/routes/work.py:L572-L577` `get_work_logs_for_tasks()` serial_number + task_id 복합 매핑) 정상 + VIEW FE `SNDetailPanel.tsx` `find()` → `filter()` 수정 반영 완료. Twin파파 확정: **현재 상세뷰에서 workers 정상 렌더링**. DOC-SYNC 차원 종결.

**시급도**: 🔴 즉시 — 상세뷰에 실제 작업자가 표시되지 않음
**참조**: Sprint 18-B 이슈 1 후속

#### 증상

GBWS-6905 S/N 예시:
- **카드뷰** (`/api/app/product/progress`): "박새벽 · 배선 포설 03-26 16:02" 정상 표시
- **상세뷰** (`/api/app/tasks/GBWS-6905?all=true`): ELEC에 "test-C&A 08:11 → 13:14"만 표시, **박새벽 없음**

#### 원인 분석

두 API의 workers 조회 경로가 다름:

| API | 조회 기준 | 쿼리 |
|-----|----------|------|
| `product/progress` (카드뷰) | `serial_number` 기준 | `work_start_log` UNION `work_completion_log` WHERE `serial_number = ANY(%s)` → 최신 1건 |
| `tasks/{sn}?all=true` (상세뷰) | `task_id` 기준 | `work_start_log` WHERE `task_id = ANY(%s)` → `app_task_details`에 등록된 task만 |

**불일치 원인**: 박새벽이 작업한 "배선 포설"의 `work_start_log.task_id`가 `app_task_details` 테이블의 ELEC task `id`와 매핑되지 않음.

가능한 시나리오:
1. `app_task_details`에 "배선 포설" task가 seed 안 됨 (task seeding 누락)
2. 박새벽이 다른 `task_id`로 태깅함 (QR 기반 task 할당 시 다른 레코드 참조)
3. ELEC 카테고리에 여러 세부 task가 있는데, 일부만 `app_task_details`에 등록됨

#### 확인 필요 사항

```sql
-- 1) GBWS-6905의 ELEC app_task_details 레코드 확인
SELECT id, task_name, task_category, serial_number
FROM app_task_details
WHERE serial_number = 'GBWS-6905' AND task_category = 'ELEC';

-- 2) 박새벽의 work_start_log에서 task_id 확인
SELECT wsl.task_id, wsl.serial_number, wsl.task_name, wsl.task_category,
       wsl.worker_id, w.name, wsl.started_at
FROM work_start_log wsl
JOIN workers w ON w.id = wsl.worker_id
WHERE wsl.serial_number = 'GBWS-6905' AND w.name = '박새벽';

-- 3) 위 두 결과의 task_id가 일치하는지 비교
```

#### 원인 확정 (2026-03-27) — ✅ BE 정상, VIEW FE 렌더링 버그

**진단 결과**: OPS BE API (`GET /api/app/tasks/GBWS-6905?all=true`) 응답에 ELEC task 복수 건 (PANEL_WORK, IF_2 등) + 각 workers 배열 정상 반환 확인됨.

**실제 원인**: `SNDetailPanel.tsx` 라인 144:
```typescript
const task = tasks.find(t => t.task_category === cat) ?? null;
```
`Array.find()`가 같은 카테고리의 **첫 번째 task만** 반환 → 나머지 task (IF_2 등) 누락.

**수정 방향**: `find()` → `filter()` — VIEW FE만 수정. BE 수정 불필요.
**참조**: `AXIS-VIEW/docs/sprints/DESIGN_FIX_SPRINT.md` Sprint 18-C 이슈 1

---

### #47 QR 스캐너 명판 인식 불량 — qrbox 크기 + 카메라 해상도 검토 — PENDING (2026-03-30)

> ⏸ **상태 재확인 (2026-04-17, Twin파파 확정)**: 아직 미착수 — 추후 진행 예정. BACKLOG.md L85 BUG-42(명판 소형 QR 접사 인식 실패) 🔴 OPEN과 연동. 실기기 카메라 매크로 포커스/줌 대응 필요.

**시급도**: 🟡 중간 — 명판 QR 인식 불가, 폰 기본 카메라에서는 정상 인식
**참조**: OPS `frontend/lib/services/qr_scanner_web.dart`

#### 증상

- **폰 기본 카메라**: 명판 QR(DOC_) 정상 인식
- **AXIS-OPS 앱 스캐너**: 동일 명판 QR 인식 불가

#### 원인 분석

앱 QR 스캐너(`html5-qrcode` 라이브러리) 설정이 명판 QR에 최적화되지 않음:

| 설정 | 현재값 | 문제 |
|------|--------|------|
| `qrbox` | 160px | 인식 영역이 160x160px로 작음 — 명판 QR이 이 영역 안에 충분히 크게 잡히지 않으면 인식 실패 |
| `fps` | 10 | 적절 |
| 컨테이너 | 정사각형 강제 (CSS `aspect-ratio: 1/1`) | 카메라 비율 crop으로 유효 해상도 저하 가능 |

폰 기본 카메라는 전체 화면을 스캔 영역으로 사용하기 때문에 인식되지만, 앱은 160x160px 박스 안에 QR이 완전히 들어와야 인식 가능.

#### 검토 필요 사항

| # | 항목 | 설명 |
|---|------|------|
| 1 | `qrbox` 확대 테스트 | `qr_scanner_web.dart:380` — `qrbox: 160` → `250` 으로 변경 후 인식률 확인 |
| 2 | 카메라 해상도 | `html5-qrcode` config에 `videoConstraints` 추가 — `width: { ideal: 1280 }`, `height: { ideal: 720 }` 로 카메라 해상도 상향 |
| 3 | 명판 반사 대비 | 금속 명판 반사로 카메라 노출 과다 시 QR 인식 실패 — `advanced: [{ torch: false }]` 등 플래시 제어 |
| 4 | 에러 정정 레벨 | 명판 QR 생성 시 에러 정정 Level H (30%) 적용 여부 확인 |

#### 수정 위치

**OPS FE 수정** (`qr_scanner_web.dart:376-381`):

```dart
// 현재
window.__qrScanConfig = {
  fps: 10,
  qrbox: 160
};

// 수정안 1: qrbox 확대
window.__qrScanConfig = {
  fps: 10,
  qrbox: 250
};

// 수정안 2: qrbox + 카메라 해상도
window.__qrScanConfig = {
  fps: 10,
  qrbox: 250,
  videoConstraints: {
    facingMode: "environment",
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
};
```

#### 검증 방법

1. `qrbox: 250` 변경 후 명판 QR 인식 테스트
2. 기존 종이 QR도 정상 인식 확인 (회귀)
3. 다양한 거리(10cm, 20cm, 30cm)에서 인식률 비교

**VIEW 수정**: 없음 — OPS FE 전용
**BE 수정**: 없음

---

### #48 ETL 변경이력 field 필터 — `finishing_plan_end` 미허용 — ✅ DONE (2026-04-17 DOC-SYNC-01 검증)

> **검증 결과**: `backend/app/routes/admin.py:L2265` — `_FIELD_LABELS`에 `'finishing_plan_end': '마무리계획일'` 추가, L2102-L2107 필드 검증 로직에서 정상 허용됨.

**시급도**: 🔴 즉시 — VIEW 변경이력 페이지에서 마무리계획 카드 클릭 시 400 에러 발생
**참조**: VIEW `EtlChangeLogPage.tsx`, OPS BE `/api/admin/etl/changes`

#### 증상

VIEW 변경이력 페이지에서 마무리계획 KPI 카드(건수 정상 표시)를 클릭하면:
```
GET /api/admin/etl/changes?field=finishing_plan_end
→ 400 INVALID_FIELD
→ {"error": "INVALID_FIELD", "message": "허용된 필드: elec_partner, mech_partner, mech_start, pi_start, sales_order, ship_plan_date"}
```

#### 원인

OPS BE의 ETL changes API에서 `field` 파라미터 허용 목록에 `finishing_plan_end`가 포함되지 않음.

| 구분 | 필드 목록 |
|------|----------|
| **BE 허용** | `elec_partner, mech_partner, mech_start, pi_start, sales_order, ship_plan_date` (6개) |
| **FE 사용** | 위 6개 + `finishing_plan_end` (7개) |
| **불일치** | `finishing_plan_end` — FE에서 KPI 카드로 표시하고 필터에 사용하지만 BE에서 미허용 |

#### 요청 사항

OPS BE ETL changes API의 field 허용 목록에 `finishing_plan_end` 추가.

ETL 데이터에 `finishing_plan_end` 변경 이력은 이미 존재 (카드 건수가 표시되고 있음).
필터 쿼리에서 해당 필드를 허용만 해주면 됨.

```python
# 예상 위치: OPS BE etl 관련 route 또는 service
ALLOWED_FIELDS = ['elec_partner', 'mech_partner', 'mech_start', 'pi_start', 'sales_order', 'ship_plan_date']
# 추가 필요:
ALLOWED_FIELDS = ['elec_partner', 'finishing_plan_end', 'mech_partner', 'mech_start', 'pi_start', 'sales_order', 'ship_plan_date']
```

**VIEW 수정**: 없음 — FE는 이미 `finishing_plan_end` 사용 중
**BE 수정**: 허용 필드 목록에 `finishing_plan_end` 추가 (1줄) — ✅ DONE (2026-03-30)

---

### #49 ProcessStepCard workers 정렬 — started_at 내림차순 — ✅ DONE (2026-03-30)

**시급도**: 🟡 중간 — 다중 task 병합 시 작업자 목록 시간순 깨짐
**참조**: VIEW `ProcessStepCard.tsx`

#### 증상

동일 카테고리에 여러 task가 있을 때 (예: MECH의 Waste Gas LINE 1, LINE 2) 작업자 목록이 시간순으로 정렬되지 않고 뒤섞여 표시됨.

#### 원인

SNDetailPanel에서 `catTasks.flatMap(t => t.workers)` 로 병합 → task 순서대로 이어붙임.
ProcessStepCard에서 `[...workers].reverse()` → 단순 배열 역순 (시간 기반 아님).

#### 수정

`ProcessStepCard.tsx`: `reverse()` → `sort()` 변경 (started_at 내림차순, 최신 먼저)

**VIEW 수정**: ProcessStepCard.tsx 1개소
**BE 수정**: 없음

---

### #50 request-deactivation API 경로 오류 — url_prefix 누락 — ✅ DONE (2026-03-30)

**시급도**: 🔴 즉시 — Manager 비활성화 요청 기능 완전 불가
**참조**: VIEW `api/workers.ts`, OPS `routes/work.py`

#### 증상

권한관리 페이지에서 Manager가 비활성화 요청 시:
- preflight OPTIONS → 404
- POST → CORS 에러 (`No 'Access-Control-Allow-Origin' header`)

#### 원인

work_bp의 `url_prefix="/api/app"`를 VIEW FE API 경로에 누락:
- **BE 실제 경로**: `/api/app/work/request-deactivation`
- **FE 호출 경로**: `/work/request-deactivation` ← prefix 누락

404 → CORS 헤더 미포함 → preflight 실패 → CORS 에러로 이어짐

#### 수정

`workers.ts`: `'/work/request-deactivation'` → `'/api/app/work/request-deactivation'`

**VIEW 수정**: workers.ts 경로 1개소
**BE 수정**: 없음

---

### #48 BUG — reactivate-task TMS 권한 체크: mech_partner 미반영 — ✅ DONE (2026-04-17 DOC-SYNC-01 검증)

> **검증 결과**: `backend/app/routes/work.py:L336-L340` — TMS 카테고리 권한 체크에 `mech_partner` 추가됨 (`company_base == mech_partner or company_base in mech_partner` 조건).

**시급도**: 🔴 높음 — Manager 재활성화 기능 차단됨
**참조**: Sprint 23 (VIEW), Sprint 41 (OPS)

#### 증상

- test1@naver.com (company=`TMS(M)`, is_manager=true) 로그인
- DOC_TEST-333 (TMS 담당 제품) S/N 상세 → 완료 작업 재활성화 클릭
- 403 응답: `{"error": "FORBIDDEN", "message": "자사 제품이 아닙니다."}`
- Admin 계정에서는 동일 S/N 재활성화 정상 동작

#### 원인

`work.py` L246-269 `reactivate_task_route()` 권한 체크:

```python
if category == 'MECH' and company.upper() in mech_partner.upper():
    allowed = True
elif category in ('ELEC',) and company.upper() in elec_partner.upper():
    allowed = True
elif category == 'TMS' and company.upper() in module_outsourcing.upper():
    allowed = True
```

TMS 카테고리일 때 `module_outsourcing`만 체크. 하지만 Dragon 등 일부 모델은 `mech_partner`가 TMS task까지 담당함 (예: `TMS(M)`이 MECH + TMS 전부 수행).

`module_outsourcing` 필드가 비어있거나 다른 값이면 `TMS(M)` Manager가 자사 TMS task를 재활성화할 수 없음.

#### VIEW FE 필터와의 불일치

VIEW `SNStatusPage.tsx` L14-21:
```typescript
const COMPANY_CATEGORIES: Record<string, string[]> = {
  'TMS(M)': ['MECH', 'TMS'],  // ← TMS(M)은 MECH+TMS 모두 볼 수 있음
};
```

FE에서는 `TMS(M)` 사용자에게 TMS task가 있는 S/N을 정상 표시하고, 재활성화 버튼도 보여주지만, BE 권한 체크에서 차단됨.

#### 수정 요청

**파일**: `backend/app/routes/work.py` L264

```python
# 현재 (버그)
elif category == 'TMS' and company and company.upper() in module_outsourcing.upper():
    allowed = True

# 수정: mech_partner도 체크 (TMS(M)이 MECH+TMS 담당하는 모델 대응)
elif category == 'TMS' and company and (
    company.upper() in module_outsourcing.upper() or
    company.upper() in mech_partner.upper()
):
    allowed = True
```

#### 검증

1. test1@naver.com (TMS(M) Manager) → DOC_TEST-333 TMS task 재활성화 → 200 성공
2. Admin → 동일 동작 정상 (회귀 확인)
3. 다른 협력사 Manager (FNI 등) → TMS task 재활성화 시도 → 403 정상 차단

**VIEW 수정**: 없음

---

### #51 progress API에 `sales_order` 필드 추가 — O/N 그룹핑 UI 선행 — ✅ DONE (2026-04-17 DOC-SYNC-01 검증)

> **검증 결과**: `backend/app/services/progress_service.py` — sn_list CTE(L64) + 메인 SELECT(L94) + response dict(L262) 3곳 모두 `sales_order` 필드 추가 완료.

**시급도**: 🟡 중간 — 생산현황 O/N 그룹핑 UI 선행 조건
**참조**: VIEW Sprint 24 (O/N 그룹핑), `progress_service.py`

#### 배경

생산현황(SNStatusPage)에서 S/N 카드가 개별 나열되어 있어 같은 O/N(Order Number) 소속 S/N을 한눈에 파악하기 어려움. O/N 단위 섹션 헤더 UI를 구현하려면 progress API 응답에 `sales_order` 필드가 필요.

현재 `GET /api/app/product/progress` 응답에 `sales_order` 없음.

#### 현재 쿼리 구조 (progress_service.py)

`sn_list` CTE (L57~76)에서 `plan.product_info pi`를 JOIN하고 있으며, 이미 `pi.model`, `pi.customer`, `pi.ship_plan_date`, `pi.mech_partner`, `pi.elec_partner`, `pi.module_outsourcing`을 SELECT.

**`pi.sales_order`는 테이블에 존재하지만 SELECT에 포함되지 않음.**

#### 수정 요청

**파일**: `backend/app/services/progress_service.py`

**1단계: sn_list CTE에 sales_order 추가 (L58~66)**

```python
# 현재
WITH sn_list AS (
    SELECT
        qr.serial_number,
        qr.qr_doc_id,
        pi.model,
        pi.customer,
        pi.ship_plan_date,
        pi.mech_partner,
        pi.elec_partner,
        pi.module_outsourcing,

# 수정: pi.sales_order 추가
WITH sn_list AS (
    SELECT
        qr.serial_number,
        qr.qr_doc_id,
        pi.model,
        pi.customer,
        pi.ship_plan_date,
        pi.sales_order,          -- ← 추가
        pi.mech_partner,
        pi.elec_partner,
        pi.module_outsourcing,
```

**2단계: 메인 SELECT에 sales_order 추가 (L87~103)**

```python
# 현재
SELECT
    sn.serial_number,
    sn.qr_doc_id,
    sn.model,
    sn.customer,
    sn.ship_plan_date,
    sn.mech_partner,
    ...

# 수정: sn.sales_order 추가
SELECT
    sn.serial_number,
    sn.qr_doc_id,
    sn.model,
    sn.customer,
    sn.ship_plan_date,
    sn.sales_order,              -- ← 추가
    sn.mech_partner,
    ...
```

**3단계: _aggregate_products()에서 sn_map에 sales_order 포함 (L254~266)**

```python
# 현재
sn_map[sn] = {
    'serial_number': sn,
    'qr_doc_id': row['qr_doc_id'],
    'model': row['model'],
    'customer': row['customer'],
    'ship_plan_date': ...,
    'all_completed': ...,
    'all_completed_at': ...,
    'mech_partner': row['mech_partner'],
    'elec_partner': row['elec_partner'],
    'module_outsourcing': row['module_outsourcing'],
    'categories': {},
}

# 수정: sales_order 추가 (mech_partner 위에)
sn_map[sn] = {
    'serial_number': sn,
    'qr_doc_id': row['qr_doc_id'],
    'model': row['model'],
    'customer': row['customer'],
    'ship_plan_date': ...,
    'sales_order': row['sales_order'],   # ← 추가
    'all_completed': ...,
    'all_completed_at': ...,
    'mech_partner': row['mech_partner'],
    'elec_partner': row['elec_partner'],
    'module_outsourcing': row['module_outsourcing'],
    'categories': {},
}
```

**⚠️ 주의**: `sales_order`는 `mech_partner`/`elec_partner`/`module_outsourcing`처럼 `pop()` 하지 않음. 응답에 포함되어야 FE에서 사용 가능.

L293~296에서 partner 필드만 pop:
```python
sn_data.pop('mech_partner', None)
sn_data.pop('elec_partner', None)
sn_data.pop('module_outsourcing', None)
# sales_order는 pop하지 않음 — 응답에 포함
```

#### 예상 응답 변화

```json
{
  "products": [
    {
      "serial_number": "6905",
      "model": "GAIA-I DUAL",
      "customer": "...",
      "sales_order": "6408",
      "ship_plan_date": "2026-04-15",
      "overall_percent": 65,
      "categories": { "MECH": {...}, "ELEC": {...} },
      ...
    }
  ]
}
```

#### 검증

1. `GET /api/app/product/progress` 응답에 `sales_order` 필드 존재 확인
2. `sales_order`가 NULL인 S/N도 정상 응답 (NULL 허용)
3. 기존 필드 (`serial_number`, `model`, `categories` 등) 영향 없음

**VIEW 수정**: Sprint 24에서 `SNProduct` 타입에 `sales_order` 추가 + O/N 섹션 헤더 UI 구현

---

### #52 ETL 변경이력 `_FIELD_LABELS`에 `finishing_plan_end` 누락 — ✅ DONE (2026-04-17 DOC-SYNC-01 검증)

> **검증 결과**: #48과 동일 — `backend/app/routes/admin.py:L2265` `_FIELD_LABELS`에 `finishing_plan_end` 등록 완료.

**시급도**: 🔴 즉시 — 마무리계획일 변경이력 조회 불가
**참조**: VIEW `EtlChangeLogPage.tsx`, OPS `routes/admin.py`

#### 증상

VIEW ETL 변경이력 페이지에서 `finishing_plan_end`(마무리계획일) 필드 조회 시:
```json
{
  "error": "INVALID_FIELD",
  "message": "허용된 필드: elec_partner, mech_partner, mech_start, pi_start, sales_order, ship_plan_date"
}
```
HTTP 400 응답 → 조회 차단.

#### 원인

`admin.py` L2067~2074 `_FIELD_LABELS` 딕셔너리에 `finishing_plan_end` 미등록:

```python
# 현재 (6개만 등록)
_FIELD_LABELS = {
    'sales_order': '판매오더',
    'ship_plan_date': '출하예정',
    'mech_start': '기구시작',
    'pi_start': '가압시작',
    'mech_partner': '기구외주',
    'elec_partner': '전장외주',
}
```

L2102~2107에서 `valid_fields = set(_FIELD_LABELS.keys())` 기반으로 필드 검증 → `finishing_plan_end`가 없으므로 `INVALID_FIELD` 에러 반환.

#### 수정 요청

**파일**: `backend/app/routes/admin.py` L2067~2074

```python
# 수정: finishing_plan_end 추가
_FIELD_LABELS = {
    'sales_order': '판매오더',
    'ship_plan_date': '출하예정',
    'mech_start': '기구시작',
    'pi_start': '가압시작',
    'finishing_plan_end': '마무리계획일',   # ← 추가
    'mech_partner': '기구외주',
    'elec_partner': '전장외주',
}
```

#### 검증

1. VIEW ETL 변경이력 → 필드 필터 `finishing_plan_end` 선택 → 정상 조회 (200)
2. 기존 6개 필드 조회 정상 동작 확인 (회귀)
3. 존재하지 않는 필드 → 여전히 400 에러 정상 차단

**VIEW 수정**: 없음

---

### #53 monthly-summary API `weeks`/`totals` 집계 값 0 — BUG (2026-04-03)

**배경**: Sprint 27에서 월마감 캘린더 뷰 구현 완료. BE가 `weeks`/`totals` 구조는 반환하지만 **집계 값이 전부 0**. 주간 실적 API(`/performance`)에서는 6905 전장 완료가 확인되므로 `monthly-summary` 집계 로직 미연동.

**2026-04-03 디버그 결과**:
```
W14: mech.completed=0, elec.completed=0, tm.completed=0  ← 전부 0
totals: mech=0, elec=0, tm=0                              ← 전부 0
```
기대값: W14 elec.completed ≥ 1 (6905 전장 완료).

**엔드포인트**: `GET /api/admin/production/monthly-summary`

**현재 응답 구조**:
```json
{
  "month": "2026-04",
  "orders": [
    { "model": "GAIA-I DUAL", "sales_order": "6367", "sn_count": 1 },
    ...
  ],
  "confirms": {}
}
```

**요청: `weeks` + `totals` 필드 추가**:
```json
{
  "month": "2026-04",
  "orders": [ ... ],
  "confirms": { ... },
  "weeks": [
    {
      "week": "W14",
      "mech": { "completed": 3, "confirmed": 2 },
      "elec": { "completed": 4, "confirmed": 3 },
      "tm":   { "completed": 1, "confirmed": 0 }
    },
    {
      "week": "W15",
      "mech": { "completed": 5, "confirmed": 5 },
      "elec": { "completed": 5, "confirmed": 5 },
      "tm":   { "completed": 2, "confirmed": 1 }
    }
  ],
  "totals": {
    "mech": { "completed": 8, "confirmed": 7 },
    "elec": { "completed": 9, "confirmed": 8 },
    "tm":   { "completed": 3, "confirmed": 1 }
  }
}
```

**weeks 집계 기준**:
- ISO 8601 주차 (월요일 시작)
- **주차-월 매핑: 금요일 기준** — 해당 주차 금요일이 속하는 월 = 소속 월
  - W14 (3/30~4/5) → 금 4/3 → 4월 소속
  - 생산계획 기준 금요일이 마지막 근무일, 공휴일 무관
  - `friday = week_monday + 4일` → `friday.month`
- `completed`: 해당 주차에 공정 100% 완료된 S/N 수 (all tasks done)
  - mech/elec: 카테고리 전체 태스크 기준
  - tm: `task_id='TANK_MODULE'`만 (PRESSURE_TEST 제외)
- `confirmed`: 해당 주차에 실적확인 완료된 S/N 수 (production_confirm 기록 기준)
- 주차 배정: S/N의 `mech_end` 기준 ISO 주차
- 해당 월에 포함되는 주차만 반환 (금요일 기준 필터)
- `totals`: 월 전체 합계
- `confirmed_month` 저장 변경 없음 — 조회 뷰 전용 매핑

**VIEW FE 타입 참고** (`types/production.ts`):
```typescript
interface ProcessSummary {
  completed: number;
  confirmed: number;
}

interface WeekSummary {
  week: string;          // "W14"
  mech: ProcessSummary;
  elec: ProcessSummary;
  tm: ProcessSummary;
}

interface MonthlySummaryResponse {
  month: string;
  weeks: WeekSummary[];
  totals: {
    mech: ProcessSummary;
    elec: ProcessSummary;
    tm: ProcessSummary;
  };
  orders: ...;    // 기존 유지
  confirms: ...;  // 기존 유지
}
```

**VIEW 영향**: MonthlyCalendarView.tsx에서 `data.weeks`로 주차별 기구·전장/TM 실적 바 렌더링. `data.totals`로 하단 합계 표시. BE가 집계 값만 채워주면 FE 추가 수정 없음 (이미 구현 완료).

---

### #54 체크리스트 성적서 API 2건 — ✅ DONE (2026-04-17 DOC-SYNC-01 검증)

> **검증 결과**: `backend/app/routes/checklist.py` — `get_checklist_report_orders()` (L941) + `get_checklist_report_detail()` (L1042) 두 엔드포인트 모두 구현. 응답 구조(categories/items/summary) 포함.

**배경**: Sprint 28 체크리스트 성적서 페이지. 고객사 오딧(Audit) 시 S/N별 체크리스트 결과를 성적서 형태로 조회 + PDF export.

#### #54-A. O/N 기준 S/N 목록 조회

**엔드포인트**: `GET /api/admin/checklist/report/orders?sales_order={on}`

S/N 직접 검색도 지원: `?serial_number={sn}` (부분 일치, ILIKE). 두 파라미터 동시 전달 시 OR 조건.

**응답**:
```json
{
  "sales_order": "6656",
  "products": [
    { "serial_number": "GBWS-6920", "model": "GAIA-I DUAL", "overall_percent": 14 },
    { "serial_number": "GBWS-6921", "model": "GAIA-I DUAL", "overall_percent": 0 }
  ]
}
```

**`overall_percent` 기준**: 체크리스트 진행률 (checklist_master active 항목 중 check_result IS NOT NULL 비율). 현재 TM만 데이터 존재, MECH/ELEC 마스터 확정 시 자동 포함.

**로직**: `product_info` 테이블에서 `sales_order` 매칭 → S/N 목록 반환. 진행률은 `checklist_master` + `checklist_record` LEFT JOIN 집계.

#### #54-B. S/N 전체 체크리스트 성적서

**엔드포인트**: `GET /api/admin/checklist/report/{serial_number}`

**응답**:
```json
{
  "serial_number": "GBWS-6920",
  "model": "GAIA-I DUAL",
  "sales_order": "6656",
  "customer": "MICRON",
  "categories": [
    {
      "category": "TM",
      "items": [
        {
          "item_group": "BURNER",
          "item_name": "가스 밸브 작동 상태",
          "item_type": "CHECK",
          "description": null,
          "check_result": "PASS",
          "checked_by_name": "김태영",
          "checked_at": "2026-04-01T14:30:00"
        }
      ],
      "summary": { "total": 15, "checked": 12, "percent": 80 }
    }
  ],
  "generated_at": "2026-04-03T10:00:00"
}
```

**필드명 통일** (기존 `get_tm_checklist()` 서비스 기준):
- `check_result`: PASS / NA / null (기존 필드명 그대로)
- `checked_by_name`: worker 이름 (기존 필드명 그대로)
- `summary.checked`: check_result IS NOT NULL 건수 (기존 필드명 그대로)
- `label` 필드 제거 — FE에서 필요 시 매핑

**`input_value` 미포함**: MECH 전용 INPUT 타입은 현재 미구현. `item_type` 필드는 master 정보로 반환하되 값 입력 필드는 추후 MECH 마스터 확정 시 추가.

**로직** — 기존 `checklist_service.get_tm_checklist()` 패턴 재활용:
1. `product_info` → S/N 기본정보 (model, sales_order, customer)
2. 카테고리 루프 (현재 TM만, 추후 MECH/ELEC 추가):
   - `checklist_master` (scope 설정 반영: COMMON 또는 product_code) + `checklist_record` LEFT JOIN
   - `item_group`별 그룹핑 + summary 집계
3. 기존 서비스 함수에 `category` 파라미터 추가하여 일반화 (TM 외 카테고리 확장 대비)
4. 신규 함수 최소화 — `get_tm_checklist(sn, phase, category)` 시그니처 확장으로 처리

**기존 코드 재활용 범위**:
- `checklist_service.get_tm_checklist()`: 쿼리 + 그룹핑 + summary 로직 그대로
- `product_info` 조회: 기존 서비스 내 동일 패턴
- `tm_checklist_scope` 설정: 기존 로직 재활용 (추후 카테고리별 scope 분리 시 확장)

**VIEW FE 타입 참고** (`types/checklist.ts` Sprint 28 추가 예정):
```typescript
interface ChecklistReportItem {
  item_group: string;
  item_name: string;
  item_type: string;
  description: string | null;
  check_result: 'PASS' | 'NA' | null;
  checked_by_name: string | null;
  checked_at: string | null;
}

interface ChecklistReportCategory {
  category: string;
  items: ChecklistReportItem[];
  summary: { total: number; checked: number; percent: number };
}

interface ChecklistReportData {
  serial_number: string;
  model: string;
  sales_order: string | null;
  customer: string;
  categories: ChecklistReportCategory[];
  generated_at: string;
}
```

**VIEW 영향**: ChecklistReportPage.tsx에서 API 호출. BE 반영 시 FE 추가 수정 없음.

---

### #55 QR 목록 API에 `elec_start` 필드 + 필터 추가 — ✅ DONE (2026-04-17 DOC-SYNC-01 검증)

> **검증 결과**: `backend/app/routes/qr.py` — SELECT 절(L122) + response(L176) + 필터 허용 필드(L84) 3곳 모두 `elec_start` 반영 완료.

> **BE**: OPS Sprint 56 (AGENT_TEAM_LAUNCH.md) — qr.py 4곳 수정
> **FE**: VIEW Sprint 29 (DESIGN_FIX_SPRINT.md) — types/qr.ts + QrManagementPage.tsx

**배경**: QR Registry 페이지에서 현재 `mech_start`(기구시작)와 `module_start`(모듈시작) 기준으로만 날짜 필터가 가능. 전장시작(`elec_start`) 기준 필터가 필요.

**엔드포인트**: `GET /api/admin/qr/list`

**요청 내용**:

1. **응답 필드 추가**: 각 QR 레코드에 `elec_start` (전장 공정 시작일) 필드 추가

```json
{
  "qr_id": 123,
  "qr_doc_id": "DOC_GBWS-6978",
  "serial_number": "GBWS-6978",
  "mech_start": "2026-03-30",
  "elec_start": "2026-04-01",
  "module_start": "2026-04-05",
  ...
}
```

2. **`date_field` 파라미터 확장**: 기존 `mech_start | module_start`에 `elec_start` 추가

```
GET /api/admin/qr/list?date_field=elec_start&date_from=2026-04-01&date_to=2026-04-14
```

**소스**: `product` 테이블의 `elec_start` 컬럼 (기존 `mech_start`, `module_start`와 동일 패턴)

**VIEW FE 수정 (BE 반영 후)**:
- `types/qr.ts`: `QrRecord`에 `elec_start` 필드 추가, `QrListParams.date_field`에 `'elec_start'` 추가
- `QrManagementPage.tsx`: 날짜 필터 드롭다운에 `전장시작` 옵션 추가, 테이블 컬럼 추가

---

### #56 ELEC 체크리스트 API 엔드포인트 확인 — ✅ DONE (2026-04-17 DOC-SYNC-01 검증)

> **검증 결과**: `backend/app/routes/checklist.py` — (1) 상세: `/api/app/checklist/elec/<sn>` (L1099) + (2) status: `/api/app/checklist/elec/<sn>/status` (L1142) 두 엔드포인트 모두 구현, phase 파라미터 지원.

> **배경**: ELEC 체크리스트 BE 구현 완료. VIEW FE에서 연동하기 위해 API 엔드포인트 패턴 확인 필요.
> 현재 FE는 TM만 체크리스트 API 호출, ELEC은 빈 응답 리턴 중 (`getChecklistStatus`에서 TM/TMS 외 카테고리 조기 리턴).

> ⚠️ **코드 검토 결과 (2026-04-11)**: 아래 3건의 문서 오류 확인됨

**확인 사항**: 아래 엔드포인트가 TM과 동일한 패턴으로 존재하는지 확인

**1. 체크리스트 상태 조회** ⚠️ 엔드포인트 미존재

```
GET /api/app/checklist/elec/{serial_number}/status   ← BE에 존재하지 않음
```

> **오류 1**: ELEC `/status` 엔드포인트는 BE에 구현되어 있지 않음.
> TM은 `checklist.py L880-911`에 `/api/app/checklist/tm/<sn>/status` 존재하지만,
> ELEC은 상세 조회(`/api/app/checklist/elec/<sn>`, L1076-1087)만 존재.
> **BE 작업 필요**: ELEC status 엔드포인트 신규 생성, 또는 기존 상세 조회에서 count 파생.

기대 응답 (TM과 동일 패턴):
```json
{
  "total_count": 24,
  "checked_count": 6
}
```

> **오류 2**: `total_count`는 31이 아닌 **WORKER 항목만 카운트**해야 함.
> Phase별: Phase 1 = 17건 (PANEL 11 + 조립 6, JIG 제외), Phase 2 = 24건 (PANEL 11 + 조립 6 + JIG WORKER 7).
> QI 항목 (7건, `checker_role='QI'`)은 완료 판정에서 항상 제외.
> 전체 완료 기준: Phase 1 (17) + Phase 2 (24) = **41건**.

**2. 체크리스트 상세 조회**

```
GET /api/app/checklist/elec/{serial_number}?phase=1
GET /api/app/checklist/elec/{serial_number}?phase=2
```

> **오류 3**: 응답 구조는 `groups` 형식이 아닌 **flat items 배열** 형식.
> TM status와 다른 패턴. 기존 BE 상세 조회(L1076-1087)는 `?phase=` 쿼리 파라미터 지원.

기대 응답 (실제 BE 패턴):
```json
{
  "items": [
    {
      "master_id": 1,
      "item_group": "PANEL 검사",
      "item_name": "파트 사양확인 (라벨 포함)",
      "item_type": "CHECK",
      "description": "...",
      "result": "PASS",
      "checked_at": "2026-04-10T21:40:00Z",
      "worker_name": "홍길동",
      "checker_role": "WORKER"
    }
  ]
}
```

**VIEW FE 수정 (BE 확인 후)**:
- `api/checklist.ts`: `getChecklistStatus()`에서 ELEC 카테고리 허용 + beCat 매핑 추가
- ProcessStepCard/SNDetailPanel: 수정 불필요 (checklist prop 정상 전달되면 자동 표시)
- `ChecklistManagePage.tsx`: BLUR_CATEGORIES에서 `'ELEC'` 제거 → 블러 해제

**확인 사항 3 — 마스터 관리 API ELEC 지원 여부**:

현재 TM 마스터 조회:
```
GET /api/admin/checklist/master?category=TM&product_code=COMMON
→ 15개 항목 정상 반환
```

ELEC도 동일 패턴으로 동작하는지 확인:
```
GET /api/admin/checklist/master?category=ELEC&product_code=COMMON
→ 31개 항목 반환 기대 (WORKER 24 + QI 7)
```

마스터 항목 추가(POST), 활성/비활성 토글(PUT)도 category=ELEC으로 정상 동작하는지 확인.

---

### #58 checklist_master 테이블에 `remarks` 컬럼 추가 — ✅ DONE (Sprint 60-BE, 2026-04-15)

> ✅ **완료 기록 (2026-04-17 정리)**: BACKLOG.md Sprint 60-BE "ELEC 마스터 정규화"에 `remarks 컬럼` 추가 명시. migration 048 + 마스터 API 확장 포함. 42/43 passed.

> **배경**: 체크리스트 관리 페이지에 **비고** 컬럼 추가 요청. 항목별 개정이력/변경사유 등을 기록하기 위한 용도.
> TM, ELEC, MECH 공통 적용.

**요청 내용**:

**1. DB 마이그레이션**

```sql
ALTER TABLE checklist.checklist_master
ADD COLUMN remarks TEXT DEFAULT NULL;

COMMENT ON COLUMN checklist.checklist_master.remarks IS '비고 — 개정이력, 변경사유 등';
```

**2. 마스터 CRUD API에 `remarks` 필드 포함**

조회 응답:
```json
{
  "items": [
    {
      "id": 1,
      "product_code": "COMMON",
      "category": "TM",
      "item_group": "BURNER",
      "item_name": "SUS Fitting 조임 상태",
      "item_type": "CHECK",
      "item_order": 1,
      "description": "GAP GAUGE / 측수 검사",
      "remarks": "2026-04 신규 추가",
      "is_active": true
    }
  ]
}
```

생성 요청:
```
POST /api/admin/checklist/master
{ ..., "remarks": "초도 등록" }
```

수정 요청:
```
PUT /api/admin/checklist/master/{id}
{ "remarks": "2026-04 검사방법 변경" }
```

**VIEW FE 수정 (BE 반영 후)**:
- `types/checklist.ts`: `ChecklistMasterItem`에 `remarks: string | null` 추가
- `CreateMasterPayload`, `UpdateMasterPayload`에 `remarks?: string` 추가
- `ChecklistTable.tsx`: 헤더 + 셀에 비고 컬럼 추가
- `ChecklistAddModal.tsx`: 비고 입력 필드 추가

---

### #55 비활성화 API NO_CHANGE 오판 + 로그인 is_active 미검증 — ✅ DONE (2026-04-09)

**배경**: VIEW 권한 관리에서 Admin이 활성 사용자를 비활성화 시도 → BE가 `422 NO_CHANGE` 반환. 해당 사용자(test5@naver.com)는 현재 로그인 가능한 상태.

**증상**:
1. `POST /api/admin/worker-status` `{worker_id: N, action: 'deactivate'}` → `{"error":"NO_CHANGE"}`
2. 사용자는 실제로 접속 가능 (비활성화된 적 없음)

**원인 추정**:
- `deactivate_worker()` (worker.py L782): `WHERE id=%s AND is_active=TRUE RETURNING id` — `is_active`가 이미 `FALSE`면 업데이트 0건 → `False` 반환 → `NO_CHANGE`
- DB에서 `is_active=FALSE`이지만 로그인이 허용되는 상태 (로그인 시 `is_active` 체크 누락 가능)

**확인 필요**:
```sql
SELECT id, name, email, is_active, deactivated_at FROM workers WHERE email = 'test5@naver.com';
```

**수정 요청 2건**:
1. **DB 데이터 정합성**: `is_active=FALSE`인데 접속 가능한 사용자 확인 + 필요 시 `is_active=TRUE`로 복원
2. **로그인 시 is_active 검증**: `POST /api/auth/login`에서 `is_active=FALSE`인 사용자 로그인 차단 (현재 미검증 추정)

**VIEW 영향**: FE 수정 없음. BE 데이터 정합성 + 로그인 로직 수정 필요.

---

### #56 confirm_checklist_required 실적확인 연동 — ✅ DONE (2026-04-17 Twin파파 확정)

> **검증 결과 (2026-04-17)**: 본문 선행 작업 체크리스트에는 `check_elec_completion()` Phase 합산만 [x]로 표시돼 있었으나, Twin파파 확정 기준 나머지 3건(`_CONFIRM_TASK_FILTER` ELEC 등록 / `confirm_checklist_required` 설정값 읽기 / TM `check_tm_completion()` 연동) 모두 실제 반영 완료. Dead Toggle 상태 해소. DOC-SYNC 차원 정리 완료.

**배경**: VIEW 생산실적 설정 패널에 "체크리스트 필수" 토글이 Sprint 25에서 추가됨. DB(`admin_settings`)에 `confirm_checklist_required` 키가 저장되고 GET/PUT 설정 API도 정상 동작하지만, **실적확인 `confirmable` 판정에 실제로 반영되지 않는 dead toggle 상태**.

> ⚠️ **코드 검토 결과 (2026-04-11)**: confirmable 로직 전체 분석 완료. 아래 문제점 확인됨.

**현재 상태 (코드 검토 확인)**:
- DB: `admin_settings` 테이블에 키 존재 (migration 027)
- BE 설정 API: `GET/PUT /api/admin/settings` — 읽기/쓰기 정상
- BE 실적확인: `_is_process_confirmable()` (production.py L169-217)에서 `confirmable` 판정 시 **체크리스트 완료 여부 미참조** — `app_task_details.completed_at` 기반 task progress만 확인
- `_is_sn_process_confirmable()` (production.py L220-243)도 동일 — 체크리스트 미참조
- `completion_status.elec_completed`는 Dual-Trigger(task_service.py)에서 설정하지만 **confirmable 판정이 이 테이블을 읽지 않음**
- `_CONFIRM_TASK_FILTER` (production.py L153-158): TMS:TANK_MODULE만 등록, **ELEC 미등록**
- FE: `confirmable`은 BE 응답값 그대로 사용 — 토글 ON/OFF 무관

**확인된 문제점 (2026-04-11)**:

1. **Dead Toggle**: `confirm_checklist_required` 설정값을 confirmable 판정 코드에서 읽지 않음
2. **completion_status 미연동**: `update_process_completion()`이 `elec_completed=TRUE` 설정하지만, confirmable은 `app_task_details` 직접 조회
3. **`check_elec_completion()` 버그**: 단일 phase만 확인 (judgment_phase 파라미터 기준). Phase 1 + Phase 2 합산 41건 확인 필요
   - Phase 1: 17건 (PANEL 11 + 조립 6, JIG 제외)
   - Phase 2: 24건 (PANEL 11 + 조립 6 + JIG WORKER 7)
   - QI 항목 (7건) 항상 제외
   - 현재 Phase 1 단독 체크 시 JIG 마스터 항목(14개)이 포함되어 항상 False 반환 가능성
4. **ELEC confirmable 미등록**: `_CONFIRM_TASK_FILTER`에 ELEC 카테고리 없음 → ELEC S/N은 confirmable 판정 대상 자체에서 누락
5. **월별 집계 SQL** (production.py L746-769): `app_task_details` COUNT 직접 사용, `completion_status` 미참조

**수정 요청**:

`GET /api/admin/production/performance` 응답의 `confirmable` 판정에 체크리스트 완료 조건 추가:

```
confirm_checklist_required = TRUE일 때:
  confirmable = progress 100% AND 체크리스트 완료
  - progress 100%: 기존 로직 (app_task_details.completed_at 기반)
  - 체크리스트 완료: 공정별 completion 함수 호출

confirm_checklist_required = FALSE일 때:
  confirmable = progress 100% (기존 로직 그대로)
```

**공정별 체크리스트 매핑**:

| 공정 | 완료 함수 | 완료 기준 | BE 상태 | 비고 |
|------|-----------|-----------|---------|------|
| TM | `check_tm_completion()` | 마스터 전체 PASS | ✅ Sprint 52 완료 | `checker_role` 조건 없음 |
| ELEC | `check_elec_completion()` | Phase 1(17) + Phase 2(24) = **41건** PASS | 🔧 버그 수정 필요 | QI 제외, 현재 단일 phase만 체크 |
| MECH | 미정 | 미정 | ❌ 미구현 | MECH 체크리스트 BE 선행 필요 |

**구현 제안**:
```python
# production.py — _is_process_confirmable() 수정

# 1. _CONFIRM_TASK_FILTER에 ELEC 추가
_CONFIRM_TASK_FILTER = {
    'TMS': ['TANK_MODULE'],
    'ELEC': [...]  # ELEC task 유형 정의 필요
}

# 2. confirmable 판정에 체크리스트 조건 추가
from app.models.admin_settings import get_setting

checklist_required = get_setting('confirm_checklist_required') == 'true'

if checklist_required:
    if process_type == 'TMS':
        from app.services.checklist_service import check_tm_completion
        if not check_tm_completion(serial_number):
            confirmable = False
    elif process_type == 'ELEC':
        from app.services.checklist_service import check_elec_completion
        # check_elec_completion 수정 후: Phase 1+2 합산 41건 확인
        if not check_elec_completion(serial_number):
            confirmable = False
    # MECH: 체크리스트 BE 구현 후 추가
```

**선행 작업**:
- [x] `check_elec_completion()` Phase 1+2 합산 수정 (Sprint 58-BE 예정)
- [ ] `_CONFIRM_TASK_FILTER`에 ELEC 카테고리 등록
- [ ] confirmable 판정에 `confirm_checklist_required` 설정값 읽기 추가
- [ ] TM `check_tm_completion()` 먼저 연동 (ELEC 수정 전에도 가능)

**우선순위**: 🟡 MEDIUM → 🔴 HIGH — check_elec_completion 버그 수정은 Dual-Trigger 정상 동작에도 필요.

**VIEW 영향**: FE 수정 없음. BE가 `confirmable` 판정에 반영하면 기존 UI 그대로 동작.

**협의 사항**:
- [ ] 체크리스트 필수 토글: 현재 전체 공정 일괄 on/off → 추후 공정별(MECH/ELEC/TM) 개별 토글로 분리 계획 있는지?
- [ ] TM 단독 먼저 연동 vs ELEC 완료 후 동시 연동 — 어느 쪽으로 진행?
- [ ] `completion_status` 테이블 활용 여부: confirmable에서 직접 참조할지, 아니면 매번 completion 함수 호출할지

---

### #57 성적서 API — ELEC Phase 분리 + TM DUAL L/R 분기 — ✅ DONE (2026-04-17 Twin파파 확정)

> **검증 결과 (2026-04-17)**: 라우트 레벨(`backend/app/routes/checklist.py:L1087-L1088`)에서 `get_checklist_report()` 호출 + Phase/DUAL 분기 로직이 `checklist_service.py`에 반영되어 있음을 Twin파파 확정. DOC-SYNC 차원 정리 완료.

**배경**: Sprint 30에서 체크리스트 성적서에 ELEC 2차 배선 누락 + TM DUAL 모델 L/R 체크리스트 미매칭 발견. `get_checklist_report()`가 단일 phase, 단일 qr_doc_id로만 조회하여 데이터 누락.

**엔드포인트**: `GET /api/admin/checklist/report/{serial_number}`

**수정 요청 3건**:

#### #57-A. ELEC Phase 1/2 분리 조회

현재 `get_checklist_report()`에서 모든 카테고리에 동일 `judgment_phase`(기본 1) 적용.
ELEC만 Phase 1 + Phase 2 각각 조회하여 `categories` 배열에 2개 추가.

```
변경 후 categories:
  { category: 'ELEC', phase: 1, phase_label: '1차 배선', items: [...17개], summary: {...} }
  { category: 'ELEC', phase: 2, phase_label: '2차 배선', items: [...31개], summary: {...} }
```

- Phase 1: JIG 그룹 제외 (17항목: PANEL 11 + 조립 6)
- Phase 2: 전체 포함 (24항목: PANEL 11 + 조립 6 + JIG WORKER 7, QI 7건 제외)
- 마스터 기준 31항목 중 QI 7건은 성적서 표시만, 완료 판정 제외
- Phase별 summary 독립 집계
- TM/MECH는 기존대로 단일 phase

#### #57-B. TM DUAL L/R 탱크별 분리 조회

DUAL 모델(`model`에 'DUAL' 포함)일 때 TM 카테고리를 `qr_doc_id`별로 분리 조회.

```
변경 후 categories (DUAL):
  { category: 'TM', phase_label: 'L Tank', qr_doc_id: 'DOC_xxx-L', items: [...], summary: {...} }
  { category: 'TM', phase_label: 'R Tank', qr_doc_id: 'DOC_xxx-R', items: [...], summary: {...} }
```

- `app_task_details`에서 `DISTINCT qr_doc_id WHERE task_category='TMS'` 조회
- 각 `qr_doc_id`별로 `_get_checklist_by_category(qr_doc_id=tank_qr)` 호출
- `-L` → `L Tank`, `-R` → `R Tank` 라벨 생성
- SINGLE 모델: 기존 동작 유지 (qr_doc_id 미전달)

#### #57-C. 진행률 합산 — `get_checklist_report_orders()`

O/N 검색 시 S/N별 `overall_percent` 계산에서:
- ELEC: Phase 1 + Phase 2 합산
- TM DUAL: L + R 합산

현재 SQL이 단일 phase만 집계하는지 확인 후 수정 필요.

**`summary` 필드명 주의**: BE가 `checked`로 반환하면 VIEW FE 타입 `completed`와 불일치. FE 매핑에서 보정하거나 BE에서 `completed`로 통일 필요.

**VIEW FE 수정 (BE 반영 후)**:
- `types/checklist.ts`: `ChecklistReportCategory`에 `phase?`, `phase_label?`, `qr_doc_id?` 추가, `ChecklistReportItem`에 `selected_value?`, `checker_role?` 추가, `item_type`에 `'SELECT'` 유니온
- `api/checklist.ts`: 필드 매핑에 `selected_value`, `checker_role` 추가
- `ChecklistReportView.tsx`: 카테고리 라벨에 `phase_label` 표시, SELECT 타입 판정 분기, QI 배지, `resultColor` SELECT 분기
- **FE 추가 로직 최소**: `phase_label`이 BE에서 내려오면 기존 `CategoryTable` 자동 적용

---

### #59 체크리스트 마스터 ELEC 항목 추가 시 JIG 2 row 자동 생성 — ✅ DONE (2026-04-17 핫픽스)

**요청 배경**: Sprint 32-VIEW (체크리스트 관리 ELEC 항목 추가/수정) 구현 중 필요.
**선행 완료**: Sprint 60-BE ✅ (마스터 정규화 — `phase1_applicable`, `qi_check_required`, `remarks` 컬럼 추가)

> ✅ **완료 (2026-04-17 핫픽스)**: Codex API 실측에서 `checker_role` 키 0건 확인 → `backend/app/routes/checklist.py` `list_checklist_master()` 2줄 수정(SELECT 절에 `cm.checker_role` 추가 + 응답 dict에 `'checker_role': row.get('checker_role') or 'WORKER'` 추가) + docstring Response 스펙 동기화. #59-A/#59-C는 방안 B(item_name `(GST)` 접미사) 채택으로 실질 완료. VIEW FE 렌더 로직(`ChecklistTable.tsx` L76/L124-133)은 이미 완성 상태였으므로 BE 배포 후 즉시 WORKER/QI 뱃지 분기 동작 예정. 조사 경위는 `VIEW_FE_Request.md` FE-18 참조.

**요청 사항 2건**:

#### #59-A. `POST /api/admin/checklist/master` — JIG 그룹 WORKER + QI 2 row 동시 INSERT

**현재 동작**: 1회 POST → 1 row INSERT

**요청 동작**: `qi_check_required=true` + `category=ELEC`이면 **자동으로 2 row 생성**

| row | checker_role | phase1_applicable | qi_check_required |
|-----|-------------|-------------------|-------------------|
| 1 (WORKER) | WORKER | 요청값 사용 | true |
| 2 (QI) | QI | 요청값 사용 | true |

**요청 페이로드 예시**:
```json
{
  "product_code": "COMMON",
  "category": "ELEC",
  "item_group": "JIG 검사 및 특별관리 POINT",
  "item_name": "신규 JIG 항목",
  "item_type": "CHECK",
  "description": "육안 검사",
  "phase1_applicable": false,
  "qi_check_required": true
}
```

**BE 처리 흐름**:
1. WORKER row INSERT (기존 로직 그대로, `checker_role='WORKER'`)
2. `qi_check_required=true` + `category='ELEC'` 감지
3. QI row 추가 INSERT (`checker_role='QI'`, 나머지 값 동일)
4. 응답: `{ "id": 신규_WORKER_id, "qi_row_id": 신규_QI_id, "qi_row_created": true }`

**UNIQUE 제약 주의**: 현재 `(product_code, category, item_group, item_name)` UNIQUE 제약이 있음. 같은 `item_name`으로 WORKER + QI 2 row를 넣으면 **충돌 발생**. 해결 방안 선택 필요:

- **방안 A**: UNIQUE 제약에 `checker_role` 포함 → `(product_code, category, item_group, item_name, checker_role)` — 가장 깔끔
- **방안 B**: 기존 UNIQUE 유지하고 QI row에만 `item_name` 접미사 부여 (예: "신규 JIG 항목 [QI]") — 지저분하지만 무변경

→ **방안 A 권장** (migration 048 또는 별도 패치에서 UNIQUE 키 변경)

**VIEW FE 현황**: Sprint 32-VIEW Task 3에서 AddModal UI 완성 대기. POST 1회 호출로 JIG 항목 추가 → BE가 2 row 자동 생성.

#### #59-B. `GET /api/admin/checklist/master` 응답에 `checker_role` 포함

**현재 응답 필드**: `id, product_code, category, item_group, item_name, item_order, description, is_active, item_type, phase1_applicable, qi_check_required, remarks, select_options`

**추가 요청 필드**: `checker_role` (VARCHAR, 'WORKER' or 'QI')

Sprint 60-BE에서 API 응답에 `phase1_applicable`, `qi_check_required`, `remarks`는 이미 추가됨. `checker_role`만 추가되면 VIEW에서 WORKER/QI row 구분 뱃지 표시 가능.

```python
# 응답 dict에 추가
'checker_role': row.get('checker_role', 'WORKER'),
```

**VIEW FE 현황**: Sprint 32-VIEW Task 2에서 테이블에 QI 뱃지 표시 구현 대기. `checker_role` 필드가 응답에 포함되면 즉시 연동.

#### #59-C. UNIQUE 제약 키 변경 + ON CONFLICT 절 동시 수정 (필수)

**현재**: `checklist_master_product_category_group_name_key (product_code, category, item_group, item_name)`

**변경**: `(product_code, category, item_group, item_name, checker_role)` — JIG WORKER/QI 동명 row 공존 허용

```sql
-- 1. checker_role NULL → 'WORKER' 일괄 치환 (COALESCE 불필요하도록)
UPDATE checklist.checklist_master
   SET checker_role = 'WORKER'
 WHERE checker_role IS NULL;

-- 2. checker_role DEFAULT 설정 (향후 INSERT 시 명시 안 해도 'WORKER')
ALTER TABLE checklist.checklist_master
    ALTER COLUMN checker_role SET DEFAULT 'WORKER';

-- 3. UNIQUE 키 교체
ALTER TABLE checklist.checklist_master
    DROP CONSTRAINT IF EXISTS checklist_master_product_category_group_name_key;

ALTER TABLE checklist.checklist_master
    ADD CONSTRAINT checklist_master_product_cat_group_name_role_key
    UNIQUE (product_code, category, item_group, item_name, checker_role);
```

**동시 수정 필수 — ON CONFLICT 절** (Codex 리뷰 #2 합의):

UNIQUE 키 변경 시 아래 파일들의 `ON CONFLICT` 절도 **5-key로 동시 수정**해야 함. 미변경 시 seed 재실행/신규 INSERT에서 에러 발생.

| 파일 | 현재 ON CONFLICT | 변경 |
|---|---|---|
| `seed_elec_checklist.py` | `(product_code, category, item_group, item_name)` | `(product_code, category, item_group, item_name, checker_role)` |
| `migrations/043a_tm_checklist_seed.sql` | 동일 4-key | 5-key (TM은 전부 WORKER, 충돌 안 나지만 일관성 위해 변경) |
| `routes/checklist.py` create_checklist_master | 해당 없음 (INSERT 시 ON CONFLICT 미사용) | #59-A에서 QI row INSERT 시 5-key ON CONFLICT 적용 |

**실행 순서**: #59-C → #59-A → #59-B (C가 A보다 선행 필수)

---

## 미종료 작업 관리 (`/api/admin/tasks`, `/api/app/tasks`)

### #60 S/N task 응답에 `company` 필드 추가 — ✅ DONE (2026-04-17, v2.9.5)

**구현 위치**:
- `admin.py` L1713 — `w.company AS worker_company` SELECT
- `admin.py` L1753 — 미시작 쿼리 `NULL AS worker_company` (B1)
- `admin.py` L1802 — 응답 dict `'company': row.get('worker_company')`
- `work.py` L597 — `/api/app/tasks/{sn}` SELECT에 `w.company AS worker_company`
- `work.py` L617 — worker_entry dict `'company': row['worker_company']`
- `work.py` L693 — legacy fallback `'company': None` (B2)

**교차 검증**: Claude × Codex 합의 #6 (M등급)

**배경**:
VIEW Sprint 33에서 미종료 task 강제 종료 기능 구현 예정.
Manager(협력사)는 **본인 회사 task만** 강제 종료 가능해야 하지만, 현재 S/N task/worker 응답에 `company` 필드가 없어 FE에서 행 레벨 권한 판단 불가.

**대상 엔드포인트**:

| 엔드포인트 | 현재 응답 | 추가 요청 |
|-----------|----------|----------|
| `GET /api/app/tasks/{sn}` | `workers[].worker_name`, `workers[].status` 등 | `workers[].company` 추가 |
| `GET /api/admin/tasks/pending` | `worker_name`, `task_name` 등 | `company` 추가 |

**응답 예시 (변경 후)**:
```json
{
  "workers": [
    {
      "worker_id": 42,
      "worker_name": "김태영",
      "company": "TMS(E)",
      "started_at": "2026-04-15T08:30:00",
      "completed_at": null,
      "status": "in_progress"
    }
  ]
}
```

**FE 활용**:
```typescript
// Manager 행 레벨 권한 필터
const canForceClose = user.is_admin || (user.is_manager && worker.company === user.company);
```

**VIEW FE 현황**: Sprint 33 FE-15에서 `company` 필드 기반 강제 종료 버튼 표시/숨김 구현 대기.

**구현 참고**: BUG-44 수정 시 `work_start_log LATERAL JOIN` → `LEFT JOIN workers w`로 변경되므로, `w.company`를 SELECT에 추가하면 자연스럽게 해결. BUG-44와 동시 처리 권장.

---

### #61 S/N task 응답에 `force_closed` 필드 추가 — ✅ DONE (2026-04-17, v2.9.5)

**구현 위치**: `work.py` L93 — `'force_closed': getattr(task, 'force_closed', False)`

**교차 검증**: Claude × Codex 합의 #7 (M등급, 범위 한정)

**배경**:
강제 종료된 task와 정상 완료 task가 동일하게 렌더링됨 (`completed_at` 존재 → 완료 표시).
S/N 상세 패널에서 강제종료 뱃지(`🔒`) 표시를 위해 구분 필드 필요.

> pending 목록(`GET /api/admin/tasks/pending`)에서는 불필요 — `WHERE force_closed=FALSE` 조건으로 이미 제외됨.

**대상 엔드포인트**:

| 엔드포인트 | 추가 필드 | 설명 |
|-----------|----------|------|
| `GET /api/app/tasks/{sn}` | `force_closed: boolean` | task_detail 레벨, 기본값 `false` |

**데이터 소스**: `app_task_details.force_closed` 컬럼 (기존 `PUT /api/admin/tasks/{id}/force-close`에서 설정하는 값)

**응답 예시 (변경 후)**:
```json
{
  "id": 1234,
  "task_name": "배선 포설",
  "task_category": "ELEC",
  "workers": [...],
  "force_closed": true
}
```

**FE 활용**:
```typescript
// ProcessStepCard 내 완료 task 중 강제종료 구분
{worker.status === 'completed' && task.force_closed && (
  <span className="badge-locked">🔒 강제종료</span>
)}
```

**VIEW FE 현황**: Sprint 33 FE-15에서 `force_closed` 기반 뱃지 렌더링 구현 대기.

---

### #60 비활성 task(is_applicable=FALSE) 미시작 카운트 오류 — ✅ DONE (2026-04-17 핫픽스, 방안 A)

**증상**: 생산현황 S/N 상세뷰에서 `Heating Jacket` task가 OPS 설정에서 비활성(`heating_jacket_enabled=false` → `is_applicable=FALSE`)인데, VIEW에서 "⏳ 미시작 1건"으로 카운트됨.

**원인**: `GET /api/app/tasks/{serial_number}?all=true` 엔드포인트에서 `is_applicable` 필터 없이 전체 task 반환.

**코드 위치**: `backend/app/models/task_detail.py` L301-316 `get_tasks_by_serial_number()`

```python
# 현재 (필터 없음)
SELECT * FROM app_task_details
WHERE serial_number = %s
ORDER BY id

# 수정 요청
SELECT * FROM app_task_details
WHERE serial_number = %s AND is_applicable = TRUE
ORDER BY id
```

`task_category` 필터 분기(L301-307)도 동일하게 `AND is_applicable = TRUE` 추가 필요:

```python
# task_category 지정 시
SELECT * FROM app_task_details
WHERE serial_number = %s AND task_category = %s AND is_applicable = TRUE
ORDER BY id
```

**영향 범위**:
- VIEW S/N 상세뷰: 비활성 task가 미시작으로 표시 → 수정 후 미표시
- OPS 앱 `all=true` 조회: 동일 영향 (관리자 전체 조회 시에도 비활성 task 제외)
- OPS 앱 일반 조회(작업자): `filter_tasks_for_worker()`에서 별도 필터링 중일 가능성 있으나 미확인 → 일괄 적용이 안전

**주의**: `all=true`(관리자 전체 조회)에서도 비활성 task를 제외하는 게 맞는지 확인 필요. 만약 관리자는 비활성 task도 봐야 한다면, `is_applicable` 필드를 응답에 포함하고 VIEW FE에서 필터링하는 방안으로 전환.

**VIEW FE 현황**: BE 수정만으로 자동 해결 — FE 추가 작업 없음. 비활성 task가 응답에서 빠지면 `workers=[]` placeholder 미생성 → 미시작 카운트 0.

---

## 공장 대시보드 Sprint 62-BE — 주간/월간 KPI 확장 + 출하 UNION fallback + 토글 지원 (2026-04-23 등록)

### #62 weekly-kpi 확장 + monthly-kpi 신설 + WHERE 절 교정 + monthly-detail 화이트리스트 — **🟡 AMENDED v2.3 (2026-04-23 원안 복원)**

> ⚠️ **v2.3 교정 (2026-04-23)** — FE v2 작성 시 설계 원안(Twin파파 요구 #6)을 놓친 조항 1건 복원
> - **교정 대상**: weekly-kpi WHERE 절 `ship_plan_date` → `finishing_plan_end` 교정 (v1 원안 복원)
> - **근거**: `DESIGN_FIX_SPRINT.md` Sprint 35 L14705~14706 Twin파파 요구 #5/#6 — "주간/월간 생산량 모두 finishing_plan_end로 통일"
> - **v2.2 AGREED에서 유지되는 항목**: 화이트리스트 2상수 분리 / 출하 3필드 축소 (그대로 유효)
> - BE 측 factory.py L322 1줄 수정 추가 필요

#### v2.2 → v2.3 교정 (1개 항목 복원)

| 조항 | v2.2 | **v2.3 (교정)** | 이유 |
|---|---|---|---|
| weekly-kpi WHERE 절 | ship_plan_date 유지 | **`finishing_plan_end` 로 교정** | 설계 원안 Twin파파 요구 #6 "주간/월간 생산량 모두 finishing_plan_end 통일" 복원 |

#### v2.2 → v2.3 유지 조항

| 조항 | 상태 |
|---|---|
| `_ALLOWED_DATE_FIELDS` 2개 상수 분리 | ✅ 유지 (monthly-kpi 4값 / monthly-detail 5값) |
| 출하 응답 3필드 | ✅ 유지 (shipped_plan / shipped_actual / shipped_ops) |
| UNION shipped_count 폐기 | ✅ 유지 |
| monthly-kpi date_field 파라미터 | ✅ 유지 (기본 mech_start) |
| pipeline.shipped deprecated | ✅ 유지 |

#### 교정 이력 (투명성)

| 단계 | 표기 | 실제 |
|---|---|---|
| BE v1 원안 | WHERE 절 finishing_plan_end 교정 | ✅ 설계 원안과 일치 |
| FE v2 제안 (내 실수) | WHERE 절 ship_plan_date 유지 | ❌ 원안 뒤집음 |
| BE v2.2 합의 | FE v2 수용 → ship_plan_date 유지 | ❌ 원안 이탈 |
| **v2.3 교정** | 원안 복원 → finishing_plan_end | ✅ **정상화** |

**연관 Sprint**:
- VIEW FE Sprint 35 (v1.34.4 배포 완료, BE 미배포 상태로 v1.34.2~3 TEMP-HARDCODE 임시 운영 중)
- VIEW FE Sprint 36 (예정) — 공장 대시보드 옵션 토글 (출하 완료 / 월간 생산량 기준)
- OPS BE `AGENT_TEAM_LAUNCH.md` "Sprint 62-BE v2.2" → ✅ 합의 완료 (FE 측 Sprint 35 Phase 2 통합)

**심각도**: 🟡 MEDIUM — 공장 대시보드 주간 KPI 라벨/기준 drift + 월간 생산량·출하 엔드포인트 부재

**VIEW FE v1.34.4 확정 기준 (2026-04-23)**:
- 하단 3영역(생산 현황 상세 테이블 / 월간 생산 지표 차트 / 상단 스와이프 월간 ProductionChart): **`mech_start` 영구 유지**
- 월간 생산량 카드 / 출하 완료 카드: **Sprint 36 옵션 토글로 기준 선택**
- 주간 생산량·완료율·by_model 카드: **기존 BE weekly-kpi 동적 값 유지 (ship_plan_date 기준 현행)**

---

### BE 원안(v1) 대비 최종 설계(v2.3) 핵심 변경점

| 조항 | 원안 (v1, AGENT_TEAM_LAUNCH L29099) | **v2.3 최종** | 이유 |
|---|---|---|---|
| weekly-kpi WHERE 절 | `ship_plan_date` → `finishing_plan_end` 교정 | **✅ 원안 그대로 (v2.3에서 복원)** | 설계 원안 Twin파파 요구 #6 "주간/월간 생산량 모두 finishing_plan_end 통일" |
| monthly-kpi 기준 | `finishing_plan_end` 고정 | **`date_field` 쿼리 파라미터 (4옵션, 기본 `mech_start`)** | Sprint 36 토글 지원 |
| monthly-detail 전환 | `mech_start` → `finishing_plan_end` (FE 쪽 변경 전제) | **mech_start 영구 유지** | FE v1.34.4 확정 — 하단 3영역 |
| 출하 응답 | `shipped_count` 단일 UNION 값 | **3필드 축소** (`plan/actual/ops`, UNION 폐기) | Twin파파 자동 합산 폐기 (v2.2) |
| `_ALLOWED_DATE_FIELDS` | 3값 통합 | **2상수 분리** (monthly-kpi 4값 / monthly-detail 5값) | 파이프라인 구분 (v2.2) |

---

### 1. 수정 범위 — `backend/app/routes/factory.py` (v2.3)

| # | 위치 | 변경 | LOC |
|---|---|---|---|
| 1 | weekly-kpi L322 WHERE | **`ship_plan_date` → `finishing_plan_end` 교정** (v2.3 복원) | 1 |
| 2 | pipeline 판정 L363~376 | 기존 유지 (`pipeline.shipped` deprecated) | 0 |
| 3 | `_count_shipped_*` 3개 헬퍼 신설 (개별 COUNT) | ops/actual/plan 별도 COUNT | +40 |
| 4 | weekly-kpi 응답 확장 | `shipped_plan/actual/ops` 3필드 + `defect_count` | +6 |
| 5 | `get_monthly_kpi()` 신설 | date_field 파라미터 + shipped_* 3필드 | +45 |
| 6 | `_MONTHLY_KPI_DATE_FIELDS` (4값) + `_MONTHLY_DETAIL_DATE_FIELDS` (5값) | 2상수 분리 | +5 |
| 7 | route 등록 | `factory_bp.route("/monthly-kpi")` | +3 |

**순 증분: ~100 LOC** (v2.2 대비 L322 WHERE 1줄 교정만 추가).

### ⚠️ v2.3 WHERE 절 교정 영향 (배포 전 확인)

```sql
-- 현재 (v2.9.10)
WHERE p.ship_plan_date >= %s AND p.ship_plan_date <= %s

-- v2.3 교정 (원안 복원)
WHERE p.finishing_plan_end >= %s AND p.finishing_plan_end < %s  -- 반개구간 권장
```

**영향 범위**:
- `weekly-kpi` 응답의 `production_count` / `by_model` / `by_stage` / `completion_rate` / `pipeline` **전체** (같은 rows 기반)
- 기존 "주간 31대" 숫자가 **달라질 것** — finishing_plan_end 범위 내 S/N 수로 변경
- FE 측 코드 변경 없음 (자동 반영)

**배포 전 Railway DB 확인 쿼리**:
```sql
-- finishing_plan_end NULL 비율 (20%+ 면 COALESCE fallback 고려)
SELECT COUNT(*) FILTER(WHERE finishing_plan_end IS NULL) * 100.0 / COUNT(*) AS null_pct
FROM plan.product_info;

-- v2.3 교정 후 예상 주간 카운트 (현재 ISO week 기준)
SELECT COUNT(*) FROM plan.product_info
WHERE finishing_plan_end >= date_trunc('week', CURRENT_DATE)::date
  AND finishing_plan_end < (date_trunc('week', CURRENT_DATE) + interval '7 days')::date;
```

---

### 2. API 시그니처

#### `GET /api/admin/factory/weekly-kpi` (기존 확장, breaking 없음) — v2.2 최종

파라미터 기존 유지 (`week`, `year`). 응답에 신규 3필드 추가 (UNION `shipped_count` 폐기):

```python
{
  ... 기존 필드 전부 유지 (week, year, week_range, production_count, completion_rate,
      by_model, by_stage, pipeline) ...,
  "pipeline": { ..., "shipped": int },  # deprecated (기존 숫자 유지 — FE backward compat)
  "shipped_plan":   int,   # ship_plan_date + si_completed (주간 범위 전체 집계, today 제한 없음)
  "shipped_actual": int,   # actual_ship_date 만 (실적 기준, FE 기본값)
  "shipped_ops":    int,   # SI_SHIPMENT.completed_at 만 (app 실시간 기준, app 베타 100% 전까지 loss 가능성)
  "defect_count":   null   # placeholder (QMS 미연동)
}
```

> 🚫 **`shipped_count` UNION 폐기**: 자동 합산은 비즈니스 의미 없음. 3필드 차이 기반 이행률/정합성 분석은 `BACKLOG-BIZ-KPI-SHIPPING-01` 이관.

#### `GET /api/admin/factory/monthly-kpi` (신설) — v2.2 최종

```python
# 파라미터
?month=YYYY-MM                  # 기본: 현재 달
?date_field=<4옵션>             # 기본: 'mech_start'
                                # 허용: mech_start | finishing_plan_end
                                #     | ship_plan_date | actual_ship_date
                                # ⚠️ pi_start 제외 (monthly-kpi 전용 화이트리스트)

# 응답
{
  "month": "2026-04",
  "month_range": { "start": "2026-04-01", "end": "2026-05-01" },   # [1일, 다음달 1일)
  "date_field_used": "mech_start",     # 클라이언트 토글 값 검증용
  "production_count": int,              # date_field 기준 COUNT
  "shipped_plan":   int,                # ship_plan_date 기준 (월간 범위 전체)
  "shipped_actual": int,                # actual_ship_date 기준 (FE 기본값)
  "shipped_ops":    int,                # SI_SHIPMENT.completed_at 기준 (app 실시간)
  "defect_count":   null
}
# completion_rate / by_stage / pipeline / by_model 미포함
# (FE β'안 주간 값 재활용 + monthly-detail 엔드포인트가 테이블/차트용 담당)
```

#### `GET /api/admin/factory/monthly-detail` (화이트리스트만 확장) — v2.2 최종

```python
# v2.2: 2개 상수 분리 — monthly-kpi vs monthly-detail 화이트리스트 독립

# monthly-kpi 전용 (신규) — 4값 (pi_start 제외)
_MONTHLY_KPI_DATE_FIELDS = {
  'mech_start',          # 기본값
  'finishing_plan_end',
  'ship_plan_date',
  'actual_ship_date',
}

# monthly-detail 기존 (확장) — 5값 (pi_start 포함)
_MONTHLY_DETAIL_DATE_FIELDS = {
  'pi_start',            # 기존 (ProductionPlanPage 토글)
  'mech_start',          # 기존 + FE v1.34.4 영구 기본
  'finishing_plan_end',  # 신규 (확장)
  'ship_plan_date',      # 신규 (확장)
  'actual_ship_date',    # 신규 (확장)
}
```

**의도**: monthly-kpi는 월간 생산량 KPI 전용이라 pi_start가 의미 없음 → 4값으로 제한. monthly-detail은 ProductionPlanPage에서도 호출 → pi_start 하위 호환 유지.

---

### 3. SQL — 3개 개별 COUNT 헬퍼 (v2.2 — UNION 폐기)

```python
# v2.2: 3개 개별 헬퍼 (BE 구현자 재량으로 단일 함수 + basis 분기 가능)
# 예시 시그니처: _count_shipped(conn, start, end, basis='actual')
#                basis: 'ops' | 'actual' | 'plan'  (UNION 폐기)

def _count_shipped_ops(conn, start, end):
    """SI_SHIPMENT task 기준 (app 실시간 — app 베타 100% 전까진 loss 가능)"""
    cur.execute("""
        SELECT COUNT(DISTINCT serial_number)
        FROM app_task_details
        WHERE task_id = 'SI_SHIPMENT'
          AND completed_at IS NOT NULL
          AND completed_at >= %s AND completed_at < %s
          AND force_closed = false
    """, (start, end))

def _count_shipped_actual(conn, start, end):
    """actual_ship_date 기준 (ETL 실적)"""
    cur.execute("""
        SELECT COUNT(*)
        FROM plan.product_info
        WHERE actual_ship_date >= %s AND actual_ship_date < %s
    """, (start, end))

def _count_shipped_plan(conn, start, end):
    """ship_plan_date + si_completed 기준 (계획 + 실적 교집합, today 제한 없음)"""
    cur.execute("""
        SELECT COUNT(*)
        FROM plan.product_info p
        LEFT JOIN completion_status cs ON p.serial_number = cs.serial_number
        WHERE p.ship_plan_date >= %s AND p.ship_plan_date < %s
          AND cs.si_completed = TRUE
    """, (start, end))
```

**설계 원칙**:
- 반개구간 `[start, end)` 사용 — 경계 중복 제거
- `force_closed = false` — BACKLOG `CLEAN-CORE` 원칙 (강제종료 task row 제외)
- UNION 폐기 → **FE에서 토글로 3가지 중 선택** (현재 FE 기본값: `shipped_actual`)

---

### 4. pytest 테스트 (10개)

```
tests/backend/test_factory_kpi.py (신규)
├─ TC-FK-01: weekly-kpi 기본 응답 + shipped_* 4필드 포함 확인
├─ TC-FK-02: weekly-kpi WHERE 절 finishing_plan_end 적용 확인 (v2.3 교정)
├─ TC-FK-03: monthly-kpi 기본 (date_field=mech_start, 기본값 적용 확인)
├─ TC-FK-04: monthly-kpi date_field=finishing_plan_end
├─ TC-FK-05: monthly-kpi date_field=ship_plan_date
├─ TC-FK-06: monthly-kpi date_field=actual_ship_date
├─ TC-FK-07: monthly-kpi 잘못된 date_field → 400 응답
├─ TC-FK-08: _count_shipped basis 4종 결과 일치성 (union ≥ 각 개별)
├─ TC-FK-09: _count_shipped force_closed=true 제외 확인
└─ TC-FK-10: monthly-detail 확장된 3개 date_field 화이트리스트 허용

회귀 테스트:
├─ tests/backend/test_factory.py — weekly-kpi 스키마 backward compat 확인
└─ tests/backend/test_admin_api.py — monthly-detail 기존 2 date_field 동작 유지
```

---

### 5. 원안(v1) 대비 위험 감소

| 위험 | 원안 v1 | **수정 v2** |
|---|---|---|
| 주간 생산량 숫자 변경 (31대 → 다른 값) | 있음 (WHERE 절 교정) | **없음 (현행 유지)** |
| 하단 3영역 기준 일관성 | 파괴 (finishing_plan_end 전환) | **유지 (mech_start 영구)** |
| FE Sprint 36 토글 구현 가능 | 불가 (단일 기준) | **가능 (4옵션 파라미터 + 4필드 응답)** |
| backward compatibility | 응답 추가 필드만 | **동일** |

---

### 6. FE Sprint 35 Phase 2 연동 (v2.2 — 3필드 축소 반영)

```tsx
// Sprint 35 Phase 2 FE 구현 (v1.35.0 예정)
// localStorage 기반 (BE admin_settings 불필요)
const [shippedBasis, setShippedBasis] = useState<'plan'|'actual'|'ops'>(() =>
  (localStorage.getItem('axis_view_factory_shipped_basis') as any) || 'actual'
);
const [monthlyDateField, setMonthlyDateField] = useState<string>(() =>
  localStorage.getItem('axis_view_factory_monthly_date_field') || 'mech_start'
);

// 주간 출하 카드 (API 재호출 불필요 — 응답 3필드 중 선택)
const weeklyShipped = {
  plan:   weekly?.shipped_plan,
  actual: weekly?.shipped_actual,
  ops:    weekly?.shipped_ops,
}[shippedBasis] ?? '—';

// 월간 KPI 호출 (date_field 변경 시 재호출)
const { data: monthly } = useMonthlyKpi({
  month: currentMonth,
  date_field: monthlyDateField,
});
```

**설계 장점**: BE가 3필드 **동시 제공**이라 출하 토글은 API 재호출 없이 프론트 상태만 바꿔서 즉시 전환 가능. 월간 date_field 토글만 쿼리 파라미터로 재호출.

**토글 UI 배치**: `FactoryDashboardSettingsPanel.tsx` 신규 컴포넌트 (기존 `SNStatusSettingsPanel` 패턴 재활용) — 헤더 ⚙️ 아이콘 클릭 시 모달 오픈.

---

### 7. 착수 조건 / 트리거

1. **Twin파파 설계 승인 (v2)**: 본 엔트리 + `AGENT_TEAM_LAUNCH.md` L29099 Sprint 62-BE v2 반영
2. **Railway DB 사전 검증 쿼리**:
   ```sql
   -- SI_SHIPMENT task 데이터 존재 여부
   SELECT COUNT(*) FROM app_task_details
   WHERE task_id = 'SI_SHIPMENT' AND completed_at IS NOT NULL;

   -- actual_ship_date NULL 비율
   SELECT
     COUNT(*) FILTER(WHERE actual_ship_date IS NULL) * 100.0 / COUNT(*) AS null_pct
   FROM plan.product_info;

   -- finishing_plan_end NULL 비율 (토글 옵션 1개)
   SELECT
     COUNT(*) FILTER(WHERE finishing_plan_end IS NULL) * 100.0 / COUNT(*) AS null_pct
   FROM plan.product_info;
   ```
3. **Codex 교차검증**: 본 v2 설계안 전달 → 응답 스키마 breaking 가능성 / pytest 커버리지 / `_count_shipped` 쿼리 인덱스 검토
4. **구현 착수**: Codex M/A 반영 후 Claude Code Opus Lead 구현 → pytest GREEN → Railway 배포

---

### 8. FE 영향 / 원복 작업 (BE 배포 후, Sprint 35 Phase 2로 통합)

BE Sprint 62-BE v2.2 배포 완료 시 **Sprint 35 Phase 2 작업** (v1.35.0 릴리스):

#### (a) TEMP-HARDCODE 제거 + 3필드 매핑 원복
```ts
// 삭제할 모듈 상수 (v1.34.2/3 TEMP-HARDCODE)
const TEMP_WEEKLY_SHIPPED = 11;
const TEMP_MONTHLY_PRODUCTION = 215;
const TEMP_MONTHLY_SHIPPED = 76;

// 원복할 카드 value prop 3곳 (v2.2 — shipped_actual 기본값)
주간 출하       TEMP_WEEKLY_SHIPPED       → weekly?.[shippedBasis field] ?? '—'    // 토글 연동
월간 생산량     TEMP_MONTHLY_PRODUCTION   → monthly?.production_count ?? '—'
월간 출하       TEMP_MONTHLY_SHIPPED      → monthly?.[shippedBasis field] ?? '—'   // 토글 연동
```

#### (b) 신규 컴포넌트 — `FactoryDashboardSettingsPanel.tsx`
- 2개 토글: 출하 기준(3옵션) / 월간 생산량 기준(4옵션)
- localStorage 저장 (`axis_view_factory_shipped_basis` / `axis_view_factory_monthly_date_field`)
- 기존 `SNStatusSettingsPanel` 패턴 재활용 (~80 LOC)

#### (c) 타입 확장 (`api/factory.ts`)
- `WeeklyKpiResponse`: `shipped_plan` / `shipped_actual` / `shipped_ops` 3필드 추가
- `MonthlyKpiResponse`: 동일 3필드 추가
- `MonthlyKpiParams.date_field`: 4옵션 union 타입 (pi_start 제외)

`useMonthlyDetail` date_field는 **`mech_start` 유지 (v1.34.4 확정)** — 건드리지 않음.

---

### 9. Rollback 경로

| 위험 | 대응 |
|---|---|
| `_count_shipped` 쿼리 성능 이슈 (UNION + DISTINCT) | `app_task_details.completed_at` / `plan.product_info.actual_ship_date` 인덱스 확인. 없으면 Sprint 63-BE로 인덱스 추가 |
| `shipped_count` 숫자가 기존 `pipeline.shipped` 와 크게 차이 | SI_SHIPMENT task가 아직 생성 안 된 상태면 actual_ship_date fallback이 주 경로로 동작 — 정상. Twin파파 사전 검증으로 파악 |
| FE Sprint 36 미배포 상태 | BE `shipped_count`만 기본으로 표시 (현재 `shipped_basis='union'` 기본값). 토글 없어도 문제 없음 |
| Rollback | `factory.py` 1파일 revert로 원복 가능. FE Sprint 35는 safe degrade 설계 (월간 카드 '—' 표시) |

---

**OPS 측 반영 위치**: `AXIS-OPS/AGENT_TEAM_LAUNCH.md` "Sprint 62-BE v2.3" 섹션 — **WHERE 절 교정 1줄 추가 요청**
**FE 상태**: v1.35.0 (2026-04-23 배포 완료) — Sprint 35 Phase 2 통합 (출하/월간 토글 + TEMP-HARDCODE 제거)
**문서 상태**: 🟡 **AMENDED v2.3** (2026-04-23) — FE v2 작성 시 원안 뒤집은 것 복원
**다음 단계**: OPS 측 factory.py L322 WHERE 절 1줄 교정 + TC-FK-02 회귀 테스트 업데이트 → 재배포 (FE 코드 변경 없음, 자동 반영)
**교정 영향**: weekly-kpi `production_count` 숫자 변동 (기존 ship_plan_date 범위 → finishing_plan_end 범위)
