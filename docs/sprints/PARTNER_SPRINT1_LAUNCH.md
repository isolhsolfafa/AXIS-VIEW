# AXIS-VIEW Partner Sprint 1 실행 가이드 (로그인 + 협력사 출퇴근 대시보드)

## 사전 조건
- ✅ AXIS-OPS Flutter PWA 완성 (Sprint 16.2 완료)
- ✅ Railway PostgreSQL DB 운영 중
- ✅ hr.partner_attendance 테이블 생성 완료 (Sprint 12)
- ✅ AXIS-OPS 출퇴근 API: `POST /api/hr/attendance` (in/out) 구현 완료
- ✅ AXIS-OPS 인증 시스템: JWT + adminMiddleware 구현 완료
- ✅ 컨셉 HTML: `G-AXIS VIEW(협력사).html` 디자인 확정
- ✅ AXIS_VIEW_ROADMAP.md 작성 완료
- ✅ 배포 환경: Netlify 확정

---

## 실행 순서

### Step 1: tmux 세션 시작 (멀티창 보기)
```bash
# tmux 세션 생성
tmux new -s axis-view

# 3분할 레이아웃 설정
# 1) 세로 분할
Ctrl+B, %

# 2) 왼쪽 패널에서 가로 분할
Ctrl+B, 방향키(←)로 왼쪽 이동
Ctrl+B, "
```

결과: 3개 패널
```
┌──────────┬──────────┐
│  Lead    │   FE     │
├──────────┤          │
│  BE-API  │          │
└──────────┴──────────┘
```

tmux 패널 이동: `Ctrl+B, 방향키`

### Step 2: 왼쪽 상단 패널(Lead)에서 Claude Code 시작
```bash
cd ~/Desktop/GST/AXIS-VIEW/app
claude
```

### Step 3: accept edits on 확인
- 하단에 `accept edits on` 표시 확인
- 아니면 **Shift+Tab** 으로 전환

### Step 4: Sprint 1 팀 생성 프롬프트 입력

---

## 🚀 Sprint 1 프롬프트 (복사해서 사용)

```
AXIS-VIEW Partner 대시보드 프로젝트를 처음부터 세팅하고, 로그인 페이지 + 협력사 출퇴근 대시보드 페이지를 구현해줘.

⚠️ 프로젝트 컨텍스트:
- AXIS-VIEW는 AXIS-OPS(Flutter PWA)와 별도로 운영되는 React 관리자 대시보드
- AXIS-OPS BE(Railway)의 API와 JWT를 공유 — 별도 BE 서버 없음
- DB는 Railway PostgreSQL 공유 (직접 접근 X, AXIS-OPS BE API를 통해서만 데이터 조회)
- 배포: Netlify (정적 사이트)
- 디자인: G-AXIS Design System (컨셉 HTML 참조)

⚠️ 참조 파일:
- 로드맵: ~/Desktop/GST/AXIS-VIEW/docs/AXIS_VIEW_ROADMAP.md (반드시 읽을 것)
- 디자인 컨셉: ~/Desktop/GST/AXIS-VIEW/docs/concepts/G-AXIS VIEW(협력사).html (반드시 읽을 것)
- AXIS-OPS BE 구조 참고: ~/Desktop/GST/AXIS-OPS/backend/ (API 엔드포인트 확인용)

## 팀 구성
2명의 teammate를 생성해줘. 모든 teammate는 Sonnet 모델 사용:

1. **FE** (Frontend 담당) - 소유: src/**
2. **CONFIG** (설정/배포 담당) - 소유: *.config.*, *.json, netlify.toml, public/**

## Sprint 1 시작

### Phase A: 프로젝트 초기 세팅

**CONFIG 작업 순서 (반드시 이 순서대로):**

1. Vite + React + TypeScript 프로젝트 생성:
   ```bash
   npm create vite@latest . -- --template react-ts
   npm install
   ```

2. 필수 의존성 설치:
   ```bash
   # UI
   npm install tailwindcss @tailwindcss/vite
   npm install class-variance-authority clsx tailwind-merge
   npm install lucide-react

   # 상태 관리 + API
   npm install @tanstack/react-query axios

   # 라우팅
   npm install react-router-dom

   # 차트 (Phase 1에서 출퇴근 통계에 사용)
   npm install recharts

   # 날짜
   npm install date-fns
   ```

3. shadcn/ui 초기화:
   ```bash
   npx shadcn@latest init
   ```
   설정값:
   - Style: New York
   - Base color: Neutral
   - CSS variables: Yes

4. shadcn 컴포넌트 설치 (필요한 것만):
   ```bash
   npx shadcn@latest add button card input label select table badge separator dropdown-menu avatar dialog toast tabs
   ```

5. Tailwind CSS 설정 — G-AXIS Design System 커스텀 토큰 추가:
   ```css
   /* src/index.css 에 추가 */
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

6. 환경변수 설정:
   ```
   # .env.development
   VITE_API_BASE_URL=http://localhost:5000

   # .env.production
   VITE_API_BASE_URL=https://axis-ops-api.up.railway.app
   ```

7. Netlify 배포 설정:
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

8. 프로젝트 구조 생성:
   ```
   src/
   ├── api/
   │   ├── client.ts          # Axios 인스턴스 + JWT 인터셉터
   │   ├── auth.ts            # 로그인 API
   │   └── attendance.ts      # 출퇴근 API
   ├── components/
   │   ├── layout/
   │   │   ├── Sidebar.tsx     # 좌측 사이드바 (260px)
   │   │   ├── Header.tsx      # 상단 헤더 (64px)
   │   │   └── Layout.tsx      # 사이드바 + 헤더 + 메인 콘텐츠 래퍼
   │   ├── auth/
   │   │   └── ProtectedRoute.tsx  # JWT 인증 가드
   │   └── ui/                 # shadcn/ui 컴포넌트 (자동 생성)
   ├── hooks/
   │   ├── useAuth.ts          # 인증 상태 관리
   │   └── useAttendance.ts    # 출퇴근 데이터 훅
   ├── pages/
   │   ├── LoginPage.tsx       # 로그인 페이지
   │   └── AttendancePage.tsx  # 협력사 출퇴근 대시보드
   ├── store/
   │   └── authStore.ts        # JWT 토큰 저장/관리
   ├── types/
   │   ├── auth.ts             # 인증 관련 타입
   │   └── attendance.ts       # 출퇴근 관련 타입
   ├── lib/
   │   └── utils.ts            # cn() 유틸리티
   ├── App.tsx                 # 라우터 설정
   └── main.tsx                # 엔트리포인트
   ```

### Phase B: 인증 시스템 (로그인 페이지)

**FE 작업 순서 (반드시 이 순서대로):**

1. **TypeScript 타입 정의** (`src/types/auth.ts`):
   ```typescript
   export interface LoginRequest {
     email: string;
     password: string;
   }

   export interface LoginResponse {
     access_token: string;
     refresh_token: string;
     user: {
       id: number;
       name: string;
       email: string;
       role: string;
       company: string;
       is_admin: boolean;
       is_manager: boolean;
     };
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

2. **Axios 인스턴스** (`src/api/client.ts`):
   - baseURL: `import.meta.env.VITE_API_BASE_URL`
   - Request interceptor: localStorage에서 access_token 읽어서 `Authorization: Bearer {token}` 헤더 자동 추가
   - Response interceptor:
     - 401 응답 → refresh_token으로 `POST /api/auth/refresh` 호출
     - 새 access_token 받으면 저장 + 원래 요청 재시도
     - refresh도 실패하면 토큰 삭제 + 로그인 페이지로 리다이렉트

3. **인증 API** (`src/api/auth.ts`):
   - `login(email, password)` → `POST /api/auth/login`
   - `refreshToken()` → `POST /api/auth/refresh`
   - ⚠️ 로그인 시 응답에서 `is_admin: true` 확인 필수 — false면 "관리자 권한이 필요합니다" 에러

4. **인증 Store** (`src/store/authStore.ts`):
   - React Context 또는 zustand 사용 (zustand 권장하지만 의존성 최소화를 위해 Context도 OK)
   - 상태: `user`, `isAuthenticated`, `isLoading`
   - 메서드: `login()`, `logout()`, `checkAuth()`
   - localStorage 키: `axis_view_access_token`, `axis_view_refresh_token`, `axis_view_user`

5. **ProtectedRoute** (`src/components/auth/ProtectedRoute.tsx`):
   - 비인증 → `/login` 리다이렉트
   - `is_admin: false` → "권한 없음" 표시 또는 `/login` 리다이렉트

6. **로그인 페이지** (`src/pages/LoginPage.tsx`):

   디자인 요구사항 (G-AXIS Design System):
   - 배경: `var(--gx-cloud)` (#F3F4F7) 전체 배경
   - 중앙 로그인 카드: max-width 420px, 흰색 배경, shadow-card, radius-lg
   - 상단: AXIS-VIEW 로고/타이틀 (DM Sans 700, Indigo accent)
   - 부제목: "Manufacturing Execution Platform" (DM Sans 300, Steel 색상)
   - 입력 필드: 이메일, 비밀번호 (shadcn Input, radius-sm)
   - 로그인 버튼: Indigo accent (#6366F1), 흰색 텍스트, radius-sm, 호버 시 약간 밝게
   - 에러 메시지: Danger 색상 (#EF4444), 카드 하단에 표시
   - 로딩 상태: 버튼에 스피너 표시

   기능:
   - 이메일 + 비밀번호 입력 → POST /api/auth/login
   - 성공 (is_admin=true) → /attendance로 리다이렉트
   - 성공 (is_admin=false) → "관리자 권한이 필요합니다" 에러 표시
   - 실패 → 에러 메시지 표시 (이메일/비밀번호 확인, 네트워크 에러 등)
   - Enter 키로 로그인 가능
   - 이미 로그인 상태면 /attendance로 자동 리다이렉트

### Phase C: 협력사 출퇴근 대시보드

**FE 작업 순서 (반드시 이 순서대로):**

1. **출퇴근 타입 정의** (`src/types/attendance.ts`):
   ```typescript
   export interface AttendanceRecord {
     id: number;
     worker_id: number;
     worker_name: string;
     company: string;
     role: string;
     check_type: 'IN' | 'OUT';
     checked_at: string;  // ISO8601
   }

   export interface AttendanceSummary {
     company: string;
     total_workers: number;
     checked_in: number;
     checked_out: number;
     not_checked: number;
   }

   export interface DailyAttendance {
     worker_id: number;
     worker_name: string;
     company: string;
     role: string;
     check_in_time: string | null;
     check_out_time: string | null;
     status: 'working' | 'left' | 'not_checked';
   }
   ```

2. **출퇴근 API** (`src/api/attendance.ts`):
   ```
   GET /api/admin/hr/attendance/today          → 당일 출퇴근 목록
   GET /api/admin/hr/attendance?date=YYYY-MM-DD → 특정일 조회
   GET /api/admin/hr/attendance/summary        → 회사별 출근 인원 요약
   ```
   ⚠️ 위 API가 AXIS-OPS BE에 아직 없을 수 있음.
   없으면 AXIS-OPS BE에 추가 구현 필요 (별도 Sprint으로 분리 가능).
   우선 Mock 데이터로 FE 개발 진행하되, API 인터페이스는 위 스펙 기준으로 구현.

3. **useAttendance 훅** (`src/hooks/useAttendance.ts`):
   - TanStack Query 사용
   - `useAttendanceToday()` → 당일 출퇴근 데이터
   - `useAttendanceSummary()` → 회사별 요약
   - `useAttendanceByDate(date)` → 특정일 조회
   - refetchInterval: 근무시간(07:00~17:20) 5분, 비근무시간 비활성

4. **레이아웃 컴포넌트**:

   **Sidebar** (`src/components/layout/Sidebar.tsx`):
   - 컨셉 HTML 디자인 그대로 구현
   - 폭 260px, 높이 100vh, 고정 위치
   - 상단: 브랜드 로고 (AXIS-VIEW)
   - 네비게이션 그룹:
     - Dashboard: 공장 대시보드, 협력사 대시보드, 생산일정
     - Analysis: 불량 분석, CT 분석
     - Intelligence: AI 예측, AI 챗봇
   - 현재 Phase 1이므로 "협력사 대시보드"만 활성, 나머지는 비활성(disabled) + 자물쇠 아이콘
   - 하단: 사용자 프로필 (이름, 역할) + 로그아웃 버튼
   - 색상: 배경 White, 텍스트 Slate, 활성 메뉴 Accent + accent-soft 배경

   **Header** (`src/components/layout/Header.tsx`):
   - 높이 64px, 배경 White, 하단 보더 Mist
   - 좌측: 페이지 타이틀 (DM Sans 600)
   - 우측: 데이터 신선도 표시 (초록 dot + "실시간" or "마지막 업데이트: HH:mm")

   **Layout** (`src/components/layout/Layout.tsx`):
   - Sidebar + Header + 메인 콘텐츠 영역
   - 메인 콘텐츠: margin-left 260px, margin-top 64px, padding 24px
   - 배경: Cloud (#F3F4F7)

5. **출퇴근 대시보드 페이지** (`src/pages/AttendancePage.tsx`):

   컨셉 HTML `G-AXIS VIEW(협력사).html`을 정확히 반영하여 구현:

   **5-1. 상단 KPI 카드 영역** (가로 4열 그리드):
   - 카드 1: 전체 출근 인원 (숫자 JetBrains Mono 700, 서브텍스트 "전체 등록 작업자 중")
   - 카드 2: 현재 근무 중 (Success 색상 dot + 숫자)
   - 카드 3: 퇴근 완료 (Steel 색상 + 숫자)
   - 카드 4: 미체크 (Warning 색상 + 숫자)
   - 카드 스타일: White 배경, shadow-card, radius-md, 호버 시 shadow-md + translateY(-1px)

   **5-2. 필터 바**:
   - 회사 필터: "전체" + FNI, BAT, TMS(M), TMS(E), P&S, C&A 드롭다운 (shadcn Select)
   - 날짜 선택: 오늘 날짜 기본 선택, 달력 아이콘 (date input)
   - 검색: 작업자 이름 검색 (shadcn Input)
   - 상태 필터: 전체 / 근무중 / 퇴근 / 미체크 탭 (shadcn Tabs)

   **5-3. 회사별 출퇴근 요약 카드** (가로 6열 그리드):
   - 각 협력사별 카드: 회사명, 출근 인원/전체 인원, 퇴근 인원
   - Progress bar로 출근율 시각화
   - 컨셉 HTML의 협력사 카드 디자인 참조

   **5-4. 작업자 출퇴근 테이블** (shadcn Table):
   - 컬럼: 이름, 소속(회사), 역할, 출근시간, 퇴근시간, 상태(뱃지)
   - 상태 뱃지: 근무중(Success/초록), 퇴근(Steel/회색), 미체크(Warning/노랑)
   - 시간 표시: JetBrains Mono (등폭 폰트)
   - 회사별 색상 구분 (선택적)
   - 정렬: 기본 출근시간순, 컬럼 헤더 클릭으로 정렬 변경 가능

   **5-5. 애니메이션**:
   - 페이지 진입 시 fadeInUp 0.5s
   - 카드별 딜레이 0.05s 간격
   - KPI 숫자 카운트업 애니메이션 (선택적)

### Phase D: 라우터 + 통합

**FE 작업 순서:**

1. **App.tsx 라우터 설정**:
   ```
   / → /login 리다이렉트
   /login → LoginPage (비인증 전용)
   /attendance → AttendancePage (ProtectedRoute)
   /* → 404 페이지 (간단한 "페이지를 찾을 수 없습니다" 메시지)
   ```

2. **main.tsx**:
   - QueryClientProvider (TanStack Query)
   - BrowserRouter
   - AuthProvider (Context)
   - Toaster (shadcn toast)

3. **Google Fonts 로드** (`index.html`):
   ```html
   <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
   ```

4. **빌드 + 로컬 테스트**:
   ```bash
   npm run build
   npm run preview
   ```
   에러 0건 확인

## AXIS-OPS BE 신규 API (필요 시 — 별도 작업)

⚠️ 아래 API가 AXIS-OPS BE에 아직 없을 경우, FE는 Mock 데이터로 개발하되 API 스펙은 아래를 기준으로 한다.
BE API 구현은 AXIS-OPS 프로젝트에서 별도로 진행.

```
## 필요 API 목록

### 1. GET /api/admin/hr/attendance/today
응답:
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
    },
    ...
  ],
  "summary": {
    "total_registered": 45,
    "checked_in": 38,
    "checked_out": 12,
    "currently_working": 26,
    "not_checked": 7
  }
}

### 2. GET /api/admin/hr/attendance?date=2026-03-01
위와 동일한 응답 포맷, 날짜만 변경

### 3. GET /api/admin/hr/attendance/summary
응답:
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
    },
    ...
  ]
}
```

## Mock 데이터 (FE 개발용)

FE 개발 시 API가 없으면 사용할 Mock 데이터를 `src/mocks/attendance.ts`에 생성:

```typescript
// 협력사 목록
const COMPANIES = ['FNI', 'BAT', 'TMS(M)', 'TMS(E)', 'P&S', 'C&A'];

// Mock 작업자 30명 생성 (회사별 5명)
// 출근시간: 07:30~08:30 랜덤
// 퇴근시간: 일부만 17:00~18:00 랜덤 (근무중인 사람 포함)
// 미체크: 회사당 0~1명
```

⚠️ Mock 모드 전환은 환경변수로 제어:
```
VITE_USE_MOCK=true   # Mock 데이터 사용
VITE_USE_MOCK=false  # 실제 API 호출
```

## 검증 기준 (Sprint 1 완료 조건)

✅ `npm run build` 에러 0건
✅ 로그인 → is_admin=true 확인 → 대시보드 이동 정상
✅ 로그인 → is_admin=false → "관리자 권한이 필요합니다" 에러 표시
✅ 비인증 상태에서 /attendance 접근 → /login 리다이렉트
✅ 401 응답 → refresh token 자동 갱신 → 원래 요청 재시도
✅ 출퇴근 대시보드 KPI 카드 4개 정상 표시
✅ 회사별 필터 동작 (드롭다운 선택 → 테이블 필터링)
✅ 날짜 선택 동작
✅ 작업자 테이블 정렬 동작
✅ 상태 뱃지 색상 정확 (근무중=Success, 퇴근=Steel, 미체크=Warning)
✅ G-AXIS Design System 토큰 정확 적용 (폰트, 컬러, 라디우스, 쉐도우)
✅ 사이드바 네비게이션 구조 완성 (협력사만 활성, 나머지 비활성)
✅ 반응형 최소 대응: 1280px 이하에서 사이드바 접기 (선택)
✅ Mock 데이터 ↔ 실제 API 전환 가능 (`VITE_USE_MOCK` 환경변수)

## 규칙
- 컨셉 HTML `G-AXIS VIEW(협력사).html`의 디자인을 최대한 정확하게 React로 변환할 것
- G-AXIS Design System 토큰 (색상, 폰트, 간격, 그림자, 라디우스) 반드시 준수
- DM Sans 폰트는 일반 텍스트, JetBrains Mono는 숫자/데이터/시간에 사용
- shadcn/ui 컴포넌트를 기본으로 사용하되, 커스텀 스타일은 Tailwind 유틸리티로 오버라이드
- AXIS-OPS BE API 엔드포인트를 직접 수정하지 말 것 (API 없으면 Mock 사용)
- .env 파일은 .gitignore에 추가하고 절대 커밋하지 말 것
- 각 파일 상단에 JSDoc 또는 주석으로 파일 역할 명시
- Sprint 1 완료 시 PROGRESS.md에 진행사항 추가 정리
```

---

## 🔧 Sprint 1 보완 프롬프트 (API 연동 후 사용)

```
AXIS-OPS BE에 출퇴근 API가 구현된 후 Mock → 실제 API 전환 작업을 진행해줘.

## 팀 구성
1명의 teammate를 생성해줘. Sonnet 모델 사용:

1. **FE** (Frontend 담당) - 소유: src/**

## 보완 작업

### FE 작업 순서:

1. Mock 제거 및 실제 API 연동:
   - .env.development에서 `VITE_USE_MOCK=false` 설정
   - 실제 API 응답 포맷과 Mock 데이터 포맷 불일치 수정
   - API 에러 핸들링 강화 (네트워크 에러, 서버 에러 등)

2. WebSocket 연동 (출퇴근 시간대 한정):
   - 07:00~09:30 (출근): WebSocket 활성 → 실시간 push
   - 09:30~16:30 (근무): 5분 폴링
   - 16:30~17:20 (퇴근): WebSocket 활성
   - 19:30~20:20 (야간퇴근): WebSocket 활성
   - 나머지: 연결 없음
   - WebSocket URL: `ws://{API_BASE}/ws/attendance`
   - heartbeat 30초, 자동 재연결

3. Netlify 배포 테스트:
   - `npm run build` 성공 확인
   - Netlify CLI로 배포 테스트: `npx netlify-cli deploy --prod`

4. CORS 확인:
   - AXIS-OPS BE에서 AXIS-VIEW Netlify 도메인 CORS 허용 필요
   - BE의 CORS 설정에 Netlify 도메인 추가 요청 (별도 작업)

## 규칙
- 실제 API 연동 시 Mock 코드는 삭제하지 말고 환경변수로 전환 가능하게 유지
- WebSocket 연결 실패 시 폴링으로 자동 fallback
- Sprint 1 보완 완료 시 PROGRESS.md 업데이트
```
