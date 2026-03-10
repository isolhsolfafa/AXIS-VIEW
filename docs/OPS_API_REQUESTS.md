# AXIS-OPS BE API 요청사항

> AXIS-VIEW FE 개발 중 AXIS-OPS BE에 필요한 엔드포인트/수정 사항을 관리합니다.
> AXIS-VIEW는 BE 코드 수정 금지 — 이 문서로 요청 전달.
> 마지막 업데이트: 2026-03-11

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

### 6. QR 목록 응답에 actual_ship_date, status 포함 — PENDING

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

**DB 의존**: `plan.product_info`에 `actual_ship_date`, `contract_type`, `sales_note` 컬럼 추가 필요

---

## 데이터 범위 제한

### 7. is_manager 로그인 시 자사 데이터만 응답 — PENDING (설계 필요)

**대상 엔드포인트**:

| 엔드포인트 | 현재 | 변경 필요 |
|-----------|------|----------|
| `GET /api/admin/hr/attendance/daily` | 전체 협력사 데이터 반환 | is_manager → 자사 소속만 필터 |
| `GET /api/admin/qr/list` | 전체 S/N 반환 | is_manager → 자사 담당 S/N만 필터 |
| `GET /api/admin/etl/changes` | 전체 변경이력 반환 | is_manager → 자사 관련만 필터 |

**필터 기준 (제안)**:
- 출퇴근: `workers.company` = 로그인 사용자의 `company`
- QR 목록: `product_info.mech_partner` 또는 `elec_partner` = 사용자의 `company`
- ETL 변경이력: 위 QR 필터와 동일 범위의 S/N만

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

---

## 해결 완료

### QR 목록 조회 500 에러 — DONE (2026-03-07)

**엔드포인트**: `GET /api/admin/qr/list`

**증상**: JWT 토큰 정상 전송 시 500 INTERNAL_ERROR 반환

**해결**: BE 측 수정 완료 → 200 정상 반환
