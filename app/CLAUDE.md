# AXIS-VIEW — Agent Teams 프로젝트

## 프로젝트 개요
AXIS-OPS(현장 작업자용 Flutter PWA)와 별도로 운영되는 **React 관리자 대시보드**.
Phase 1 목표: 협력사 출퇴근 현황 조회 + 관리자 로그인.
AXIS-OPS BE(Railway)의 API와 JWT를 공유하며, 별도 Backend 없이 프론트엔드만 개발.

## 프로젝트 디렉토리 구조 (하이브리드)
```
AXIS-VIEW/
├── app/                    ← 단일 React 프로젝트 (이 CLAUDE.md 위치)
│   ├── CLAUDE.md           ← 이 파일 (에이전트 필독)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── attendance/  (협력사 출퇴근 — Phase 1)
│   │   │   ├── qr/          (QR 발급/관리 — Phase 2)
│   │   │   ├── defect/      (불량 분석 — Phase 3)
│   │   │   ├── factory/     (공장 대시보드 — Phase 3)
│   │   │   ├── plan/        (생산일정 — Phase 3)
│   │   │   └── ct/          (CT분석 — Phase 3)
│   │   ├── components/      (Sidebar, Header, ui 등 공유)
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   ├── package.json
│   └── netlify.toml
│
├── etl/                    ← 데이터 파이프라인 (Python, 도메인별 분리)
│   └── defect/             (불량 ETL + migration + tests)
│
├── docs/                   ← 설계 문서 / 컨셉
│   ├── AXIS_VIEW_ROADMAP.md
│   ├── concepts/           (컨셉 HTML 모음)
│   └── sprints/            (LAUNCH/PROGRESS 문서)
│
└── README.md
```

## 팀 구성 & 모델 설정

### 리드 에이전트 (Lead — 설계 조율)
- **모델**: Opus (claude-opus-4-6)
- **역할**: 전체 아키텍처 설계, 에이전트 간 조율, 코드 리뷰, 의사결정
- **모드**: Delegate 모드 (Shift+Tab) — 리드는 직접 코드 작성하지 않고 조율만 수행
- **권한**: 모든 파일 읽기 가능, 직접 수정은 하지 않음

### 워커 에이전트 (Workers — 구현)
- **모델**: Sonnet (claude-sonnet-4-5)
- **역할**: FE, CONFIG 각각 담당 영역의 코드 구현
- **모드**: 사용자 승인 후 코드 수정 가능 (위임 모드)

### 위임 모드 규칙
1. 리드가 작업을 분배하고 워커에게 위임
2. 워커는 코드 변경 전 **반드시 사용자 승인** 필요
3. 파일 소유권 위반 시 즉시 중단
4. 스프린트 단위로 작업 진행

## 참조 문서
- `../docs/AXIS_VIEW_ROADMAP.md` — **주 참조 문서**. AXIS-VIEW 전체 로드맵, Phase별 기능, 결정사항
- `../docs/concepts/G-AXIS VIEW(협력사).html` — **디자인 컨셉 HTML**. 출퇴근 대시보드 UI 원본
- `../docs/sprints/PARTNER_SPRINT1_LAUNCH.md` — Sprint 1 실행 가이드 (프롬프트)
- ⚠️ AXIS-OPS BE 코드 참조: `~/Desktop/GST/AXIS-OPS/backend/` (API 엔드포인트/모델 확인용, 수정 금지)

## 기술 스택
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui (G-AXIS Design System 토큰)
- **상태관리**: TanStack Query (React Query) + React Context
- **실시간**: WebSocket (출퇴근 시간대 한정)
- **차트**: Recharts
- **라우팅**: React Router DOM
- **HTTP**: Axios
- **날짜**: date-fns
- **배포**: Netlify (정적 사이트)
- **Backend**: 없음 — AXIS-OPS BE(Railway Flask) API 공유

## 핵심 규칙 (모든 에이전트 공통)

### AXIS-OPS BE 의존 규칙
- AXIS-VIEW는 **별도 BE 없음** — AXIS-OPS BE의 API만 호출
- AXIS-OPS BE 코드를 **절대 수정하지 않음**
- API가 없으면 **Mock 데이터로 FE 개발** 진행 (환경변수 `VITE_USE_MOCK`으로 전환)
- API 스펙 불일치 시 AXIS-OPS 프로젝트에서 별도 Sprint으로 처리

### 인증 규칙
- AXIS-OPS JWT 공유 — `POST /api/auth/login` → JWT 발급
- **is_admin=true 필수** — false면 "관리자 권한이 필요합니다" 에러
- Access Token: `Authorization: Bearer {token}` 헤더
- 401 응답 → refresh_token으로 `POST /api/auth/refresh` 자동 갱신 → 원래 요청 재시도
- refresh도 실패 → 토큰 삭제 → `/login` 리다이렉트
- localStorage 키: `axis_view_access_token`, `axis_view_refresh_token`, `axis_view_user`
- Admin 계정: `dkkim1@gst-in.com` / `93830979` (is_admin=true, freepass)

### DB 규칙 (읽기 전용 — AXIS-OPS BE API를 통해 조회)
- AXIS-VIEW는 DB에 직접 접근하지 않음
- 모든 데이터는 AXIS-OPS BE API를 통해 조회
- DB 타임존: `Asia/Seoul` (KST) — API 응답의 시간도 KST 기준

### 코드 스타일
- TypeScript: strict mode, interface 우선 (type보다), 명시적 타입
- React: 함수형 컴포넌트 + Hooks, Custom Hook 패턴
- Tailwind: G-AXIS Design System 토큰 사용 (커스텀 color 변수)
- 한국어 주석 허용
- 커밋 메시지: 영어 (conventional commits)
- 각 파일 상단에 JSDoc 또는 주석으로 파일 역할 명시

### 환경변수
```
# .env.development
VITE_API_BASE_URL=http://localhost:5000
VITE_USE_MOCK=true

# .env.production
VITE_API_BASE_URL=https://axis-ops-api.up.railway.app
VITE_USE_MOCK=false
```
- `.env` 파일은 `.gitignore`에 포함 — 절대 커밋 금지

---

## G-AXIS Design System

> 소스: `G-AXIS VIEW(협력사).html` — 반드시 참조

### 브랜드
```
앱 이름: AXIS-VIEW
부제: Manufacturing Execution Platform
로고: 좌측 사이드바 상단
```

### 폰트
```
일반 텍스트: DM Sans (300, 400, 500, 600, 700)
숫자/데이터/시간: JetBrains Mono (400, 500, 700)
Google Fonts URL:
  https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap
```

### 컬러 토큰
| 토큰 | CSS 변수 | 값 | 용도 |
|------|---------|-----|------|
| Charcoal | `--gx-charcoal` | #2A2D35 | 본문 텍스트 |
| Graphite | `--gx-graphite` | #3D4150 | 부제목, 강조 텍스트 |
| Slate | `--gx-slate` | #5A5F72 | 사이드바 텍스트, 보조 텍스트 |
| Steel | `--gx-steel` | #8B90A0 | 라벨, 비활성 텍스트 |
| Silver | `--gx-silver` | #B8BCC8 | 구분선 hover, 스크롤바 |
| Mist | `--gx-mist` | #E8EAF0 | 구분선, 보더 |
| Cloud | `--gx-cloud` | #F3F4F7 | 배경색 |
| Snow | `--gx-snow` | #FAFBFD | 서브 배경 |
| White | `--gx-white` | #FFFFFF | 카드, 사이드바 배경 |
| Accent | `--gx-accent` | #6366F1 (Indigo) | 브랜드 강조, 버튼, 활성 상태 |
| Success | `--gx-success` | #10B981 | 완료, 정상, 출근, 근무중 |
| Warning | `--gx-warning` | #F59E0B | 경고, 미체크 |
| Danger | `--gx-danger` | #EF4444 | 에러, 불량 |
| Info | `--gx-info` | #3B82F6 | 정보 |

### Tailwind 커스텀 토큰 (src/index.css)
```css
@import "tailwindcss";

@theme {
  --color-gx-charcoal: #2A2D35;
  --color-gx-graphite: #3D4150;
  --color-gx-slate: #5A5F72;
  --color-gx-steel: #8B90A0;
  --color-gx-silver: #B8BCC8;
  --color-gx-mist: #E8EAF0;
  --color-gx-cloud: #F3F4F7;
  --color-gx-snow: #FAFBFD;
  --color-gx-accent: #6366F1;
  --color-gx-accent-soft: rgba(99, 102, 241, 0.08);
  --color-gx-accent-medium: rgba(99, 102, 241, 0.15);
  --color-gx-success: #10B981;
  --color-gx-success-bg: rgba(16, 185, 129, 0.08);
  --color-gx-warning: #F59E0B;
  --color-gx-warning-bg: rgba(245, 158, 11, 0.08);
  --color-gx-danger: #EF4444;
  --color-gx-danger-bg: rgba(239, 68, 68, 0.08);
  --color-gx-info: #3B82F6;
  --color-gx-info-bg: rgba(59, 130, 246, 0.08);
  --font-sans: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### 레이아웃 토큰
```
사이드바: 260px (고정, 좌측)
헤더: 64px (고정, 상단)
메인 콘텐츠: margin-left 260px, margin-top 64px, padding 24px
배경: Cloud (#F3F4F7)
```

### Shadow 토큰
```
shadow-card: 0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)
shadow-md: 0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)
shadow-lg: 0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)
```

### Radius 토큰
```
radius-sm: 6px   → rounded-md (Tailwind)
radius-md: 10px  → rounded-lg
radius-lg: 14px  → rounded-xl
radius-xl: 18px  → rounded-2xl
```

### 공통 UI 패턴
```
Status Bar: 실시간 상태 표시 (초록 dot + 텍스트 + 시간)
KPI Cards: 4~5열 그리드, 호버 시 shadow-md + translateY(-1px)
Chart Cards: 헤더(제목+서브+탭) + 바디(차트 영역)
Filter Bar: 탭 + 드롭다운 + 검색 입력
Animation: fadeInUp 0.5s + 딜레이 0.05s 간격
사용자 카드: 아바타(gradient) + 이름 + 역할
```

---

## DB 스키마 (AXIS-OPS BE에서 관리 — AXIS-VIEW는 API 조회만)

> AXIS-VIEW는 DB에 직접 접근하지 않지만, API 응답 구조를 이해하기 위해 스키마를 참조한다.

### workers (AXIS-OPS public 스키마)
```sql
id SERIAL PK, name VARCHAR(255), email VARCHAR(255) UNIQUE,
password_hash VARCHAR(255), role role_enum (MECH/ELEC/TM/PI/QI/SI/ADMIN),
company VARCHAR(50),  -- FNI, BAT, TMS(M), TMS(E), P&S, C&A, GST
approval_status approval_status_enum (pending/approved/rejected),
email_verified BOOLEAN, is_manager BOOLEAN, is_admin BOOLEAN,
created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
```

### hr.partner_attendance (hr 스키마)
```sql
id SERIAL PK,
worker_id INTEGER FK → workers(id),
check_type VARCHAR(3) NOT NULL,     -- 'in' / 'out'
check_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
method VARCHAR(10) DEFAULT 'button', -- 'button' / 'pin' / 'fingerprint' / 'face_id'
note TEXT,
created_at TIMESTAMPTZ DEFAULT NOW()
```
- INDEX: `idx_partner_att_worker ON hr.partner_attendance(worker_id, check_time DESC)`
- 대상: 협력사(company != 'GST')만 해당

### 협력사 목록 (workers.company)
```
| company  | role       | 설명 |
|----------|-----------|------|
| FNI      | MECH      | 기구 협력사 |
| BAT      | MECH      | 기구 협력사 |
| TMS(M)   | MECH      | 기구(모듈) 협력사 |
| TMS(E)   | ELEC      | 전장 협력사 |
| P&S      | ELEC      | 전장 협력사 |
| C&A      | ELEC      | 전장 협력사 |
| GST      | PI,QI,SI,ADMIN | 자사 (출퇴근 대상 아님) |
```

---

## API 스펙 (AXIS-OPS BE 호출)

### 인증 API (기존 — 구현 완료)
| HTTP | 엔드포인트 | 설명 | 인증 |
|------|-----------|------|------|
| POST | `/api/auth/login` | 로그인 → JWT 발급 | 없음 |
| POST | `/api/auth/refresh` | Access Token 갱신 | Refresh Token |

**로그인 요청/응답:**
```json
// 요청
{ "email": "dkkim1@gst-in.com", "password": "Gst@dmin2026!" }

// 성공 응답 (200)
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": {
    "id": 1,
    "name": "관리자",
    "email": "dkkim1@gst-in.com",
    "role": "ADMIN",
    "company": "GST",
    "is_admin": true,
    "is_manager": true
  }
}

// 실패 응답 (401)
{ "error": "INVALID_CREDENTIALS", "message": "이메일 또는 비밀번호가 올바르지 않습니다." }
```

### 출퇴근 API (신규 — AXIS-OPS BE에 구현 필요)

⚠️ 아래 API가 AXIS-OPS BE에 아직 없을 수 있음. 없으면 Mock 데이터 사용.

| HTTP | 엔드포인트 | 설명 | 인증 |
|------|-----------|------|------|
| GET | `/api/admin/hr/attendance/today` | 당일 출퇴근 목록 | admin_required |
| GET | `/api/admin/hr/attendance?date=YYYY-MM-DD` | 특정일 조회 | admin_required |
| GET | `/api/admin/hr/attendance/summary` | 회사별 출근 인원 요약 | admin_required |
| WS | `/ws/attendance` | 출퇴근 실시간 이벤트 | JWT |

**당일 출퇴근 응답 포맷:**
```json
{
  "date": "2026-03-03",
  "records": [
    {
      "worker_id": 1,
      "worker_name": "홍길동",
      "company": "FNI",
      "role": "MECH",
      "check_in_time": "2026-03-03T07:45:00+09:00",
      "check_out_time": "2026-03-03T17:05:00+09:00",
      "status": "left"
    }
  ],
  "summary": {
    "total_registered": 45,
    "checked_in": 38,
    "checked_out": 12,
    "currently_working": 26,
    "not_checked": 7
  }
}
```

**회사별 요약 응답 포맷:**
```json
{
  "date": "2026-03-03",
  "by_company": [
    {
      "company": "FNI",
      "total_workers": 8,
      "checked_in": 7,
      "checked_out": 3,
      "currently_working": 4,
      "not_checked": 1
    }
  ]
}
```

### WebSocket 연결 전략 (출퇴근 시간대 한정)
```
07:00 ~ 09:30 (출근): WebSocket 활성 → 실시간 push
09:30 ~ 16:30 (근무): WebSocket 해제 → 5분 폴링 or 수동 새로고침
16:30 ~ 17:20 (퇴근): WebSocket 활성 → 실시간 push
19:30 ~ 20:20 (야간퇴근): WebSocket 활성 → 실시간 push
20:20 ~ 07:00 (비근무): 연결 없음

WebSocket URL: ws://{API_BASE}/ws/attendance
Heartbeat: 30초
자동 재연결: 3회 시도, 5초 간격
연결 실패 시: 폴링으로 자동 fallback
```

---

## TypeScript 타입 정의

### 인증 관련 (src/types/auth.ts)
```typescript
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  company: string;
  is_admin: boolean;
  is_manager: boolean;
}
```

### 출퇴근 관련 (src/types/attendance.ts)
```typescript
export interface AttendanceRecord {
  worker_id: number;
  worker_name: string;
  company: string;
  role: string;
  check_in_time: string | null;   // ISO8601
  check_out_time: string | null;  // ISO8601
  status: 'working' | 'left' | 'not_checked';
}

export interface AttendanceSummary {
  total_registered: number;
  checked_in: number;
  checked_out: number;
  currently_working: number;
  not_checked: number;
}

export interface CompanySummary {
  company: string;
  total_workers: number;
  checked_in: number;
  checked_out: number;
  currently_working: number;
  not_checked: number;
}

export interface DailyAttendanceResponse {
  date: string;
  records: AttendanceRecord[];
  summary: AttendanceSummary;
}

export interface CompanySummaryResponse {
  date: string;
  by_company: CompanySummary[];
}
```

---

## 에이전트 팀 구성

### Agent 1: FE (Frontend — React 앱)
**담당**: React 앱 전체 (UI 컴포넌트, 페이지, 훅, API 통신, 상태관리)

**소유 파일**:
```
src/**
```

**주요 업무**:
- 로그인 페이지 (JWT 인증, is_admin 검증)
- 협력사 출퇴근 대시보드 (KPI 카드, 필터, 테이블)
- 사이드바 네비게이션 (Phase 1: 협력사만 활성)
- 헤더 (데이터 신선도 표시)
- ProtectedRoute (인증 가드)
- Axios 인스턴스 + JWT 인터셉터
- TanStack Query 훅
- WebSocket 연결 (출퇴근 시간대)
- Mock 데이터 ↔ 실제 API 전환 로직

**절대 수정 금지**: `*.config.*`, `*.json` (루트), `netlify.toml`, `public/**`

---

### Agent 2: CONFIG (설정/배포 담당)
**담당**: 프로젝트 설정, 빌드 설정, 배포 설정

**소유 파일**:
```
*.config.*    (vite.config.ts, tailwind.config.ts, tsconfig.json 등)
*.json        (package.json, tsconfig.json 등 — 루트 레벨)
netlify.toml
public/**
index.html
```

**주요 업무**:
- Vite + React + TypeScript 초기 세팅
- Tailwind CSS + shadcn/ui 설정
- G-AXIS Design System 토큰 설정
- Netlify 배포 설정
- 환경변수 설정 (.env)
- Google Fonts 로드 (index.html)
- 빌드 에러 수정

**절대 수정 금지**: `src/**` (소스코드)

---

## app/ 디렉토리 구조 (React 프로젝트)

```
app/                                   # cd ~/Desktop/GST/AXIS-VIEW/app
├── CLAUDE.md                          # 이 파일 (에이전트 필독)
├── PROGRESS.md                        # 스프린트 진행 현황
│
├── public/                            # [CONFIG 소유]
│   ├── favicon.ico
│   └── logo.svg
│
├── src/                               # [FE 소유]
│   ├── api/
│   │   ├── client.ts                  # Axios 인스턴스 + JWT 인터셉터
│   │   ├── auth.ts                    # 로그인/갱신 API
│   │   └── attendance.ts              # 출퇴근 API (+ Mock fallback)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx            # 좌측 사이드바 (260px) — 전 페이지 공유
│   │   │   ├── Header.tsx             # 상단 헤더 (64px) — 전 페이지 공유
│   │   │   └── Layout.tsx             # 사이드바 + 헤더 + 메인 래퍼
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx     # JWT 인증 가드
│   │   ├── attendance/                # 출퇴근 전용 컴포넌트
│   │   │   ├── KpiCards.tsx
│   │   │   ├── CompanySummaryCards.tsx
│   │   │   ├── AttendanceTable.tsx
│   │   │   └── FilterBar.tsx
│   │   └── ui/                        # shadcn/ui 컴포넌트 (자동 생성, 전 페이지 공유)
│   ├── hooks/
│   │   ├── useAuth.ts                 # 인증 상태 관리 훅
│   │   ├── useAttendance.ts           # 출퇴근 데이터 TanStack Query 훅
│   │   └── useWebSocket.ts            # WebSocket 연결 훅
│   ├── mocks/
│   │   └── attendance.ts              # Mock 데이터 (개발용)
│   ├── pages/
│   │   ├── LoginPage.tsx              # 로그인 페이지
│   │   ├── attendance/                # 협력사 출퇴근 (Phase 1)
│   │   │   └── AttendancePage.tsx
│   │   ├── qr/                        # QR 발급/관리 (Phase 2)
│   │   ├── factory/                   # 공장 대시보드 (Phase 3)
│   │   ├── plan/                      # 생산일정 (Phase 3)
│   │   ├── defect/                    # 불량 분석 (Phase 3)
│   │   └── ct/                        # CT 분석 (Phase 3)
│   ├── store/
│   │   └── authStore.ts               # JWT 토큰 저장/관리 (Context)
│   ├── types/
│   │   ├── auth.ts
│   │   └── attendance.ts
│   ├── lib/
│   │   └── utils.ts                   # cn() 유틸리티
│   ├── App.tsx                        # 라우터 설정
│   └── main.tsx                       # 엔트리포인트
│
├── index.html                         # [CONFIG 소유] — Google Fonts 로드
├── vite.config.ts                     # [CONFIG 소유]
├── tailwind.config.ts                 # [CONFIG 소유]
├── tsconfig.json                      # [CONFIG 소유]
├── package.json                       # [CONFIG 소유]
├── netlify.toml                       # [CONFIG 소유]
├── .env.development                   # [CONFIG 소유] (gitignore)
├── .env.production                    # [CONFIG 소유] (gitignore)
└── .gitignore
```

> Phase 3에서 factory/, plan/, defect/, ct/ 페이지를 추가할 때 Sidebar, Header, Layout, Auth, Design System 등이 **자동으로 공유**됨.

---

## 사이드바 네비게이션 구조

```
Dashboard
├── 공장 대시보드     → (Phase 3, 비활성 + 자물쇠)
├── 협력사 대시보드   → /attendance (Phase 1, 활성)
└── 생산일정         → (Phase 3, 비활성 + 자물쇠)

Management
└── QR 관리          → /qr (Phase 2, 비활성 + 자물쇠)

Analysis
├── 불량 분석        → (Phase 3, 비활성 + 자물쇠)
└── CT 분석          → (Phase 3, 비활성 + 자물쇠)

Intelligence
├── AI 예측          → (Phase 4+, 비활성 + 자물쇠)
└── AI 챗봇          → (Phase 4+, 비활성 + 자물쇠)

사용자 프로필 (사이드바 하단)
└── 이름, 역할, 로그아웃 버튼
```

- Phase 1에서는 "협력사 대시보드"만 클릭 가능
- 나머지 메뉴는 disabled 상태 + 자물쇠 아이콘으로 "준비 중" 표시
- URL: `/attendance`만 라우팅, 나머지는 404

---

## 라우팅 설정

```
/ → /login 리다이렉트
/login → LoginPage (비인증 전용 — 인증 시 /attendance 리다이렉트)
/attendance → AttendancePage (ProtectedRoute — 인증 + is_admin 필수)
/* → 404 페이지
```

---

## Mock 데이터 전략

API가 없을 때 FE 개발을 위한 Mock 데이터:

```
VITE_USE_MOCK=true  → src/mocks/attendance.ts에서 데이터 반환
VITE_USE_MOCK=false → 실제 AXIS-OPS BE API 호출
```

Mock 생성 규칙:
- 협력사 6개 (FNI, BAT, TMS(M), TMS(E), P&S, C&A)
- 회사당 5~8명 작업자 (총 30~48명)
- 출근 시간: 07:30~08:30 KST 랜덤
- 퇴근 시간: 일부만 17:00~18:00 KST 랜덤 (근무 중인 사람 포함)
- 미체크: 회사당 0~1명
- 상태: working(Success), left(Steel), not_checked(Warning)

---

## 작업 우선순위

### Sprint 1: 프로젝트 초기 세팅 + 로그인 + 출퇴근 대시보드
1. **CONFIG**: Vite + React + TS 세팅 → Tailwind + shadcn/ui → G-AXIS 토큰 → Netlify 설정 → 환경변수
2. **FE**: 로그인 페이지 → 인증 시스템 (JWT, 자동 갱신) → 사이드바/헤더 레이아웃 → 출퇴근 대시보드 → Mock 데이터 → 빌드 확인

### Sprint 1 보완: API 연동 + WebSocket
1. **FE**: Mock → 실제 API 전환 → WebSocket 연동 (시간대별) → CORS 확인 → Netlify 배포 테스트

### Sprint 2+ (추후 — Phase 2~3):
- QR 발급 페이지 (Phase 2)
- 공장 대시보드, 생산일정, 불량분석, CT분석 (Phase 3)

---

## 충돌 방지 규칙

| 에이전트 | 쓰기 가능 | 읽기 가능 | 절대 수정 금지 |
|---------|----------|----------|--------------|
| FE | `src/**` | 모든 파일 | `*.config.*`, `*.json`(루트), `netlify.toml`, `public/**` |
| CONFIG | `*.config.*`, `*.json`(루트), `netlify.toml`, `public/**`, `index.html` | 모든 파일 | `src/**` |

**공유 파일 (수정 전 리드 승인 필수)**:
- `CLAUDE.md` — 리드만 수정 가능
- `src/index.css` — FE 소유이지만 Tailwind 토큰 변경 시 CONFIG와 협의
