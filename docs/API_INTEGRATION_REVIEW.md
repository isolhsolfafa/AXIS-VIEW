# AXIS-VIEW ↔ AXIS-OPS BE API 연동 검토서

> 작성일: 2026-03-04
> 대상: AXIS-VIEW (React 관리자 대시보드) → AXIS-OPS BE (Railway Flask)
> 예상 사용자: 약 150명 (관리자 + 협력사 작업자)

---

## 1. 인증 (Authentication)

### 1-1. 로그인 응답 필드 수정

**현재 FE (`types/auth.ts`):**
```ts
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;  // ← 불일치
}
```

**실제 BE 응답:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "worker": { "id", "name", "email", "role", "company", "is_admin", "is_manager", "approval_status", "email_verified" }
}
```

**수정 사항:**
- `LoginResponse.user` → `LoginResponse.worker`
- `User` 인터페이스에 `approval_status`, `email_verified` 필드 추가
- `auth.ts` 51번째 줄: `data.user.is_admin` → `data.worker.is_admin`

---

### 1-2. Refresh Token Rotation 도입

**현재 구조 (문제점):**
- BE가 refresh 시 `access_token`만 반환
- 동일 refresh_token을 30일간 재사용 → 탈취 시 30일간 악용 가능

**권장 구조 (Refresh Token Rotation):**

```
[로그인]
  → access_token (2h) + refresh_token_v1 (30d) 발급
  → refresh_token_v1을 DB에 저장

[2시간 후 — access_token 만료]
  → FE가 refresh_token_v1으로 /api/auth/refresh 호출
  → BE: refresh_token_v1 검증 → DB에서 일치 확인
  → 새 access_token (2h) + refresh_token_v2 (30d) 발급
  → refresh_token_v1 무효화, refresh_token_v2를 DB에 저장
  → FE: 두 토큰 모두 localStorage에 업데이트

[탈취 감지]
  → 무효화된 refresh_token_v1으로 요청 들어옴
  → DB에 없으므로 거부 + 해당 사용자의 모든 refresh_token 무효화
  → 사용자는 재로그인 필요
```

**BE 수정 (`auth_service.py`):**

```python
# 1. refresh_tokens 테이블 추가 (또는 workers 테이블에 컬럼)
CREATE TABLE auth.refresh_tokens (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER NOT NULL REFERENCES workers(id),
    token_hash VARCHAR(64) NOT NULL,  -- SHA256 해시로 저장
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

# 2. refresh 응답 변경
POST /api/auth/refresh
  Request:  { "refresh_token": "old_token" }
  Response: { "access_token": "new_access", "refresh_token": "new_refresh" }

# 3. 로그아웃 시 해당 refresh_token 무효화
POST /api/auth/logout
  → revoked = TRUE
```

**FE 수정 (`client.ts` 72~76번째 줄):**

```ts
// 현재 코드 — 이미 refresh_token 업데이트 로직이 있음
const { access_token, refresh_token: newRefreshToken } = response.data;
localStorage.setItem(LOCAL_KEYS.ACCESS, access_token);
if (newRefreshToken) {
  localStorage.setItem(LOCAL_KEYS.REFRESH, newRefreshToken);  // ← Rotation 시 자동 동작
}
```

FE는 이미 `newRefreshToken`이 있으면 저장하는 로직이 있으므로, **BE만 수정하면 FE는 수정 불필요.**

**150명 기준 트래픽 영향:**
- 최대 동시 refresh 요청: ~10건/분 (150명 × 2시간 만료 = 분산)
- DB 조회 1회 + 업데이트 1회 추가 → 무시 가능한 수준
- 인덱스: `(worker_id, revoked)` 추가하면 충분

---

## 2. 출퇴근 API 엔드포인트 (신규 추가)

### 2-1. 추가할 엔드포인트 3개

기존 `/api/hr/` 경로는 그대로 유지. 관리자 전용으로 `/api/admin/hr/` 하위에 추가.

#### `GET /api/admin/hr/attendance/today`

```python
@admin_bp.route("/hr/attendance/today", methods=["GET"])
@jwt_required
@admin_required
def get_admin_attendance_today():
    """관리자용 — 오늘 전체 협력사 출퇴근 현황"""
```

**응답:**
```json
{
  "date": "2026-03-04",
  "records": [
    {
      "worker_id": 5,
      "worker_name": "탁재훈",
      "company": "C&A",
      "role": "ELEC",
      "check_in_time": "2026-03-04T08:15:00+09:00",
      "check_out_time": "2026-03-04T17:30:00+09:00",
      "status": "left",
      "work_site": "GST",
      "product_line": "SCR"
    }
  ],
  "summary": {
    "total_registered": 98,
    "checked_in": 86,
    "checked_out": 34,
    "currently_working": 52,
    "not_checked": 12
  }
}
```

**핵심 SQL (IN/OUT 피봇):**
```sql
SELECT
  w.id AS worker_id,
  w.name AS worker_name,
  w.company,
  w.role,
  MAX(CASE WHEN pa.check_type = 'in'  THEN pa.check_time END) AS check_in_time,
  MAX(CASE WHEN pa.check_type = 'out' THEN pa.check_time END) AS check_out_time,
  pa_in.work_site,
  pa_in.product_line
FROM workers w
LEFT JOIN hr.partner_attendance pa
  ON w.id = pa.worker_id
  AND pa.check_time >= {today_start_kst}
  AND pa.check_time <  {tomorrow_start_kst}
LEFT JOIN hr.partner_attendance pa_in
  ON w.id = pa_in.worker_id
  AND pa_in.check_type = 'in'
  AND pa_in.check_time >= {today_start_kst}
  AND pa_in.check_time <  {tomorrow_start_kst}
WHERE w.company != 'GST'
GROUP BY w.id, w.name, w.company, w.role, pa_in.work_site, pa_in.product_line
ORDER BY w.company, w.name
```

**status 계산 (Python):**
```python
if check_in_time is None:
    status = 'not_checked'
elif check_out_time is None:
    status = 'working'
else:
    status = 'left'
```

#### `GET /api/admin/hr/attendance?date=YYYY-MM-DD`

위와 동일한 로직, `date` 파라미터로 날짜만 변경.

#### `GET /api/admin/hr/attendance/summary`

```python
@admin_bp.route("/hr/attendance/summary", methods=["GET"])
@jwt_required
@admin_required
def get_admin_attendance_summary():
    """관리자용 — 회사별 출퇴근 요약"""
```

**응답:**
```json
{
  "date": "2026-03-04",
  "by_company": [
    {
      "company": "C&A",
      "total_workers": 22,
      "checked_in": 17,
      "checked_out": 7,
      "currently_working": 10,
      "not_checked": 5
    }
  ]
}
```

---

## 3. FE 타입 수정 사항

### 3-1. `types/auth.ts`

```ts
// 변경 전
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// 변경 후
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  worker: Worker;
}

interface Worker {
  id: number;
  name: string;
  email: string;
  role: string;       // MECH | ELEC | TM | PI | QI | SI | ADMIN
  company: string;    // FNI | BAT | TMS(M) | TMS(E) | P&S | C&A | GST
  is_admin: boolean;
  is_manager: boolean;
  approval_status: string;   // pending | approved | rejected
  email_verified: boolean;
}
```

### 3-2. `types/attendance.ts` — 추가 필드

```ts
interface AttendanceRecord {
  worker_id: number;
  worker_name: string;
  company: string;
  role: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: 'working' | 'left' | 'not_checked';
  work_site?: string;       // 추가: GST | HQ
  product_line?: string;    // 추가: SCR | CHI
}
```

---

## 4. 설정(옵션) 메뉴 설계

헤더 우측 ⚙️ 버튼 클릭 → 설정 패널 또는 모달 표시

### 4-1. 근무 설정 (Work Settings) — Phase 1

| 항목 | 설명 | 기본값 | UI |
|------|------|--------|-----|
| 식사시간 | 근무시간 계산 시 제외할 시간대 | 12:00 ~ 13:00 | 시작/종료 TimePicker |
| 식사시간 적용 | 식사시간 제외 ON/OFF | ON | Toggle |
| 출근 마감 기준 | 이 시간 이후 출근 = 지각 표시 | 09:00 | TimePicker |
| 정규 퇴근 시간 | 이 시간 이전 퇴근 = 조퇴 표시 | 17:00 | TimePicker |
| 야간 퇴근 인정 | 야간근무 퇴근 인정 시간대 | 19:30 ~ 20:20 | 시작/종료 TimePicker |

### 4-2. 대시보드 설정 (Dashboard) — Phase 1

| 항목 | 설명 | 기본값 | UI |
|------|------|--------|-----|
| 자동 새로고침 | 데이터 갱신 주기 | 5분 | Select: 1분 / 3분 / 5분 / 수동 |
| 기본 뷰 | 협력사 상세 기본 표시 방식 | 카드뷰 | Toggle: 카드뷰 / 테이블 |
| 본사/현장 구분 | 본사/현장 분류 표시 여부 | ON | Toggle |

### 4-3. 알림 설정 (Notifications) — Phase 1

| 항목 | 설명 | 기본값 | UI |
|------|------|--------|-----|
| 미체크 알림 기준 | 퇴근 미체크 N명 이상 시 경고 | 5명 | Number Input |
| 출근율 경고 기준 | 출근율 N% 이하 시 경고 표시 | 70% | Number Input + Slider |

### 4-4. 시스템 (System) — Phase 2+

| 항목 | 설명 | 기본값 | UI |
|------|------|--------|-----|
| API 서버 상태 | 연결 상태 표시 (읽기 전용) | — | Status Indicator |
| 언어 | UI 언어 설정 | 한국어 | Select: 한국어 / English |
| 테마 | 밝은/어두운 테마 | Light | Toggle: Light / Dark |

### 4-5. 설정 저장 방식

```
Phase 1: localStorage 저장 (axis_view_settings)
  → 사용자별 브라우저 로컬 저장
  → BE 변경 불필요

Phase 2+: BE API 저장 (/api/admin/settings)
  → DB에 사용자별 설정 저장
  → 다른 기기에서도 동일 설정 유지
```

**FE 구현:**
```ts
// hooks/useSettings.ts
interface DashboardSettings {
  // 근무 설정
  lunchStart: string;          // "12:00"
  lunchEnd: string;            // "13:00"
  lunchEnabled: boolean;       // true
  lateThreshold: string;       // "09:00"
  regularEndTime: string;      // "17:00"
  nightShiftStart: string;     // "19:30"
  nightShiftEnd: string;       // "20:20"

  // 대시보드 설정
  refreshInterval: number;     // 5 (분), 0 = 수동
  defaultView: 'card' | 'table';
  showHqSiteBreakdown: boolean;

  // 알림 설정
  notCheckedAlertThreshold: number;  // 5
  attendanceRateWarning: number;     // 70
}

const DEFAULT_SETTINGS: DashboardSettings = {
  lunchStart: '12:00',
  lunchEnd: '13:00',
  lunchEnabled: true,
  lateThreshold: '09:00',
  regularEndTime: '17:00',
  nightShiftStart: '19:30',
  nightShiftEnd: '20:20',
  refreshInterval: 5,
  defaultView: 'card',
  showHqSiteBreakdown: true,
  notCheckedAlertThreshold: 5,
  attendanceRateWarning: 70,
};
```

---

## 5. CORS 설정

| 환경 | Origin | 상태 |
|------|--------|------|
| 개발 | `http://localhost:5173` | BE에 추가 필요 |
| 운영 | `https://{axis-view}.netlify.app` | 도메인 확정 후 추가 |

**BE 수정 (`app/__init__.py`):**
```python
from flask_cors import CORS

CORS(app, origins=[
    "http://localhost:5173",
    "https://{axis-view-domain}.netlify.app"  # 확정 후 교체
], supports_credentials=True)
```

---

## 6. 체크리스트 요약

### BE 작업 (AXIS-OPS)

- [ ] `auth.refresh_tokens` 테이블 생성 (Refresh Token Rotation)
- [ ] `POST /api/auth/refresh` → 새 refresh_token도 반환하도록 수정
- [ ] `POST /api/auth/logout` → refresh_token 무효화 추가
- [ ] `GET /api/admin/hr/attendance/today` 엔드포인트 추가
- [ ] `GET /api/admin/hr/attendance?date=` 엔드포인트 추가
- [ ] `GET /api/admin/hr/attendance/summary` 엔드포인트 추가
- [ ] IN/OUT 피봇 쿼리 + status 계산 로직 구현
- [ ] CORS origin에 localhost:5173 추가
- [ ] CORS origin에 Netlify 도메인 추가 (확정 후)

### FE 작업 (AXIS-VIEW)

- [ ] `LoginResponse.user` → `LoginResponse.worker` 필드명 변경
- [ ] `Worker` 인터페이스에 `approval_status`, `email_verified` 추가
- [ ] `auth.ts` login 함수: `data.user.is_admin` → `data.worker.is_admin`
- [ ] `AttendanceRecord`에 `work_site`, `product_line` 옵셔널 필드 추가
- [ ] 설정 메뉴 컴포넌트 구현 (Settings Modal/Panel)
- [ ] `useSettings` 훅 구현 (localStorage 저장)
- [ ] `useAttendance` 훅에 설정의 `refreshInterval` 연동
- [ ] `VITE_API_BASE_URL` 환경변수에 Railway URL 설정
