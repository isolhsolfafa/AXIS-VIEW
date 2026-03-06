# AXIS-VIEW Sprint Progress

## Sprint 3: 실 데이터 연결 — device_id + logout + 스키마 정합성 — Status: COMPLETED

### Summary

Mock → Real API 전환 완료. device_id 지원, logout BE 호출, work_site 매핑 유틸 추가.
대시보드 전체를 하드코딩 Mock 의존에서 실 API 데이터 기반 동적 계산으로 전환.
실 DB 연동 확인 완료 (2026-03-06).

---

### Completed Tasks

#### 3-A: device_id 추가 (완료 — 2026-03-06)
- `api/client.ts` — `getDeviceId()` 함수 추가 (localStorage `axis_view_device_id` + `crypto.randomUUID()`)
- `api/client.ts` — 요청 인터셉터에 `X-Device-ID` 헤더 추가
- `api/client.ts` — 응답 인터셉터 내 refresh POST body에 `device_id` 추가
- `api/auth.ts` — `login()` POST body에 `device_id: getDeviceId()` 추가
- `api/auth.ts` — `refreshToken()` POST body에 `device_id: getDeviceId()` 추가

#### 3-B: logout BE API 호출 (완료 — 2026-03-06)
- `store/authStore.ts` — logout 함수를 async로 변경
- `store/authStore.ts` — `POST /api/auth/logout` 호출 추가 (try-catch, 실패해도 로컬 정리 보장)
- `store/authStore.ts` — `apiClient` import 추가, `AuthContextType.logout` 타입 `Promise<void>`로 변경

#### 3-C: work_site 매핑 유틸 + CHI 필터 (완료 — 2026-03-06)
- `utils/workSiteMapping.ts` — **신규 생성**. `WORK_SITE_LABEL` (GST→GST공장, HQ→협력사본사), `ACTIVE_PRODUCT_LINES` (SCR만), `getWorkSiteLabel()`, `isActiveProductLine()`
- `api/attendance.ts` — 실 API 응답에서 CHI product_line 레코드 자동 필터링 (Mock 모드는 변경 없음)

#### 3-D: 빌드 검증 (완료 — 2026-03-06)
- `npm run build` — TypeScript 오류 0개, 빌드 성공

#### 3-E: 대시보드 Mock 하드코딩 제거 + 동적 계산 전환 (완료 — 2026-03-06)
- `pages/attendance/AttendancePage.tsx` — Mock import 완전 제거 (`getMockExtendedAttendance`, `MOCK_COMPANIES`)
- `pages/attendance/AttendancePage.tsx` — KPI 카드 값 동적 계산 (등록 협력사, 본사/현장 인원, 평균 출근율)
- `pages/attendance/AttendancePage.tsx` — 차트/BottomGrid 데이터를 실 records 기반 그룹핑으로 전환
- `components/attendance/CompanySummaryCards.tsx` — 하드코딩 Mock 테이블 3개 삭제 (`COMPANY_HQ_SITE`, `COMPANY_NOT_CHECKED`, `COMPANY_ALERT_TYPE`)
- `components/attendance/CompanySummaryCards.tsx` — props 기반 동적 렌더링으로 전환

#### 3-F: 실 DB 연동 테스트 (완료 — 2026-03-06)

BE: `https://axis-ops-api.up.railway.app` / VITE_USE_MOCK=false

| 테스트 | 항목 | 상태 |
|--------|------|------|
| 1 | 로그인 (admin 계정) | ✅ |
| 2 | 대시보드 데이터 로딩 (KPI/차트/카드/테이블) | ✅ |
| 3 | Mock 하드코딩 제거 확인 | ✅ |

---

## Sprint 2: API 연동 + 설정 메뉴 — Status: COMPLETED

### Summary

AXIS-OPS BE API 연동 준비 및 대시보드 설정 메뉴 구현 완료.
BE 응답 필드명 불일치 수정(`user` → `worker`), 타입 필드 추가, 설정 훅/UI 구현, 자동 새로고침 연동.

---

### Completed Tasks

#### 2-A: 타입 수정 (완료)
- `types/auth.ts` — `User` → `Worker` 이름 변경, `approval_status`, `email_verified` 추가, `LoginResponse.worker`, 하위호환 `User` 별칭 유지
- `types/attendance.ts` — `AttendanceRecord`에 `work_site?`, `product_line?` 옵셔널 필드 추가

#### 2-B: API/Store 필드명 맞춤 (완료)
- `api/auth.ts` — Mock/실제 응답 모두 `user` → `worker`, Mock에 `approval_status`, `email_verified` 추가
- `store/authStore.ts` — `import Worker`, `data.user` → `data.worker` (localStorage 저장, setState 3곳)

#### 2-C: 설정 시스템 (완료)
- `hooks/useSettings.ts` — **신규** 생성. `DashboardSettings` 인터페이스, localStorage(`axis_view_settings`) 동기화
  - `refreshInterval` (분 단위, 0=수동), `defaultView` (card/table), `showHqSiteBreakdown` (boolean)
- `components/layout/SettingsModal.tsx` — **신규** 생성. 드롭다운 패널 (외부 클릭 닫기)
  - 자동 새로고침 Select (1분/3분/5분/수동)
  - 기본 뷰 Toggle (카드뷰/테이블)
  - 본사/현장 구분 Toggle (ON/OFF)

#### 2-D: 설정 연동 (완료)
- `components/layout/Header.tsx` — 설정 버튼 onClick 핸들러, SettingsModal 렌더링, 활성 상태 스타일링
- `hooks/useAttendance.ts` — `useSettings`에서 `refreshInterval` 읽어서 `refetchInterval` 동적 설정 (0이면 `false`)
- `pages/attendance/AttendancePage.tsx` — 카드/테이블 뷰 토글 설정 연동, `showHqSiteBreakdown=false`일 때 ChartSection + BottomGrid 숨김

#### 2-E: Mock 데이터 보강 (완료)
- `mocks/attendance.ts` — Mock 레코드에 `work_site`, `product_line` 필드 추가

#### 2-F: 빌드 검증 (완료)
- `npm run build` — TypeScript 오류 0개, 빌드 성공

---

## Sprint 1 — Status: COMPLETED

### Summary

Sprint 1 구현이 완료되었습니다. 관리자 로그인 + 협력사 출퇴근 대시보드 (Phase 1)가 동작합니다.

### Completed Tasks

#### Phase A: CONFIG (완료)
- Vite + React 18 + TypeScript 프로젝트 세팅
- Tailwind CSS v4 + shadcn/ui 설치 및 설정
- G-AXIS Design System 컬러 토큰 (`src/index.css` @theme 블록)
- Netlify 배포 설정 (`netlify.toml`)
- 환경변수 설정 (`.env.development`, `.env.production`)
- Google Fonts (DM Sans + JetBrains Mono) — `index.html`

#### Phase B: FE — 인증 시스템 (완료)
- `src/types/auth.ts` — LoginRequest, LoginResponse, Worker 타입
- `src/api/client.ts` — Axios 인스턴스 + JWT 인터셉터 (자동 갱신, 401 처리)
- `src/api/auth.ts` — login(), refreshToken() (is_admin 검증 포함)
- `src/store/authStore.ts` — React Context (AuthProvider, useAuth)
- `src/components/auth/ProtectedRoute.tsx` — 비인증/비관리자 접근 차단
- `src/pages/LoginPage.tsx` — G-AXIS 디자인 시스템 적용 로그인 UI

#### Phase C: FE — 출퇴근 대시보드 (완료)
- `src/types/attendance.ts` — 출퇴근 관련 타입 정의
- `src/mocks/attendance.ts` — 7개 협력사 Mock 데이터 생성기
- `src/api/attendance.ts` — VITE_USE_MOCK 기반 Mock/실제 API 분기
- `src/hooks/useAttendance.ts` — TanStack Query 훅 (설정 기반 자동갱신)
- `src/components/layout/Sidebar.tsx` — 260px 고정 사이드바 (비활성 Lock 아이콘)
- `src/components/layout/Header.tsx` — 64px 헤더 (설정 패널 포함)
- `src/components/layout/Layout.tsx` — 레이아웃 래퍼
- `src/components/attendance/KpiCards.tsx` — 4열 KPI 카드 (호버 애니메이션)
- `src/components/attendance/CompanySummaryCards.tsx` — 회사별 카드 + 진행 바
- `src/components/attendance/FilterBar.tsx` — 회사, 날짜, 검색, 상태 탭 필터
- `src/components/attendance/AttendanceTable.tsx` — 정렬 가능 테이블 + 상태 뱃지

#### Phase D: FE — 라우터 + 통합 + 빌드 (완료)
- `src/App.tsx` — React Router DOM 라우팅 (/, /login, /attendance, /*)
- `src/main.tsx` — QueryClientProvider + AuthProvider + Toaster 설정
- `npm run build` — TypeScript 오류 0개, 빌드 성공

---

## Design System

- **폰트**: DM Sans (일반) + JetBrains Mono (숫자/시간)
- **컬러**: G-AXIS 토큰 (`gx-charcoal`, `gx-accent`, `gx-success`, `gx-warning` 등)
- **섀도**: `shadow-card` 스타일 (0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04))
- **애니메이션**: fadeInUp 0.5s + 카드별 delay 50ms

---

## Development

```bash
# 개발 서버 (Mock 모드)
cd ~/Desktop/GST/AXIS-VIEW/app
npm run dev

# 빌드
npm run build
```

### 환경변수
- `VITE_USE_MOCK=true` — Mock 데이터 사용 (개발)
- `VITE_USE_MOCK=false` — 실제 AXIS-OPS BE API 호출 (프로덕션)
- `VITE_API_BASE_URL` — API 서버 URL

---

## Next: Sprint 3 완료 후

- Sprint 3 Task 5: 실 데이터 연결 테스트 (수동 브라우저)
- Netlify 배포 (테스트 전체 통과 시)
- QR 관리 페이지 (`/qr`) — Phase 2
- WebSocket 연동 (출퇴근 시간대 실시간 push)
