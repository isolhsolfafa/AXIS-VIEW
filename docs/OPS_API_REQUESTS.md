# AXIS-OPS BE API 요청사항

> AXIS-VIEW FE 개발 중 AXIS-OPS BE에 필요한 엔드포인트/수정 사항을 관리합니다.
> AXIS-VIEW는 BE 코드 수정 금지 — 이 문서로 요청 전달.
> 마지막 업데이트: 2026-03-09

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

## 공지사항 (`/api/announcements`)

### 2. 공지사항 목록 조회 — PENDING

**엔드포인트**: `GET /api/announcements`

**설명**: VIEW와 OPS에서 공통으로 사용하는 공지사항 목록 조회. VIEW는 읽기 전용, OPS(admin)에서 작성/수정/삭제.

**인증**: Bearer 토큰 필수 (is_admin 또는 is_manager)

**응답 예시**:
```json
{
  "announcements": [
    {
      "id": 1,
      "title": "3월 안전교육 일정 안내",
      "content": "3월 10일(화) 오전 10시...",
      "priority": "important",
      "is_active": true,
      "created_by": "관리자",
      "created_at": "2026-03-07T09:00:00+09:00",
      "updated_at": "2026-03-07T09:00:00+09:00"
    }
  ],
  "total": 1
}
```

**priority 값**: `normal` | `important` | `urgent`

**FE 현황**: AnnouncementPanel UI 구현 완료 (Mock 데이터 사용 중), Header에 공지사항 버튼 배치 완료. BE 엔드포인트 연동 시 Mock → API 전환 필요.

**DB 테이블 (제안)**:
```sql
CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  is_active BOOLEAN DEFAULT TRUE,
  created_by INTEGER REFERENCES workers(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. 공지사항 관리 (CRUD) — PENDING

**엔드포인트**:

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| `POST` | `/api/admin/announcements` | is_admin | 공지 생성 |
| `PUT` | `/api/admin/announcements/:id` | is_admin | 공지 수정 |
| `DELETE` | `/api/admin/announcements/:id` | is_admin | 공지 삭제 (soft delete → is_active=false) |

**목적**: OPS 관리자 화면에서 공지사항 작성/수정/삭제. VIEW/OPS 동일 데이터 공유.

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

### 4. OPS에서 is_manager 권한 부여 UI — PENDING

**설명**: OPS(Flutter)의 협력사 관리 메뉴에서 작업자에게 `is_manager` 권한을 부여/해제할 수 있는 기능 필요.

**엔드포인트 (제안)**:

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| `PUT` | `/api/admin/workers/:id/manager` | is_admin | manager 권한 토글 |

**요청 Body**:
```json
{
  "is_manager": true
}
```

**제약 조건**:
- is_admin만 manager 권한 부여 가능
- (선택) is_manager가 자기 회사 소속 작업자에게 부여 가능하도록 확장 가능

**목적**: OPS에서 `is_manager=true`로 설정된 협력사 작업자가 VIEW 대시보드에 로그인 가능. 별도 VIEW 수정 불필요.

---

## 해결 완료

### QR 목록 조회 500 에러 — DONE (2026-03-07)

**엔드포인트**: `GET /api/admin/qr/list`

**증상**: JWT 토큰 정상 전송 시 500 INTERNAL_ERROR 반환

**해결**: BE 측 수정 완료 → 200 정상 반환
