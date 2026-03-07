# AXIS-VIEW 진행 이력

> 마지막 업데이트: 2026-03-07
> 완료된 Sprint와 주요 변경사항을 기록합니다.
> 미해결/보류/계획 항목은 BACKLOG.md에서 관리합니다.

---

## Phase 2: QR 관리 페이지 — ✅ 완료 (2026-03-07)

QR 관리 페이지 FE 구현 및 Netlify 배포 완료.
BE 500 에러 수정 후 정상 조회 확인 (200 OK).
일정 기준 날짜 필터 + CSV 추출 기능 추가.

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/types/qr.ts` | **신규** — QrRecord, QrListResponse, QrListParams 타입 정의 |
| `src/api/qr.ts` | **신규** — QR 목록 조회 API + 날짜 필터 파라미터 (date_field, date_from, date_to) |
| `src/hooks/useQr.ts` | **신규** — TanStack Query 훅 (30초 캐시) |
| `src/pages/qr/QrManagementPage.tsx` | **신규** — KPI 카드 + 필터 + 테이블 + 페이지네이션 + 날짜 필터 + CSV 다운로드 |
| `src/App.tsx` | `/qr` 라우트 추가 (ProtectedRoute) |
| `src/components/layout/Sidebar.tsx` | QR 관리 메뉴 활성화 (잠금 해제) |

### Phase 2 세부 기능

| 기능 | 설명 |
|------|------|
| 날짜 필터 | 기준(기구시작/모듈시작) 선택 + 날짜 범위 picker |
| CSV 다운로드 | 현재 필터 기준 전체 데이터에서 QR_DOC_ID, SN만 추출 |
| 컬럼명 변경 | "반제품시작" → "모듈시작" |
| 검색 | S/N, QR Doc ID 텍스트 검색 유지 |

### 해결된 이슈

| 이슈 | 해결 |
|------|------|
| QR API 500 에러 | BE 수정 완료 → 200 정상 반환 |
| apiClient import 오류 | default export로 수정 → Netlify 빌드 통과 |

---

## Sprint 3: 실 데이터 연결 ✅ 완료 (2026-03-06)

Mock → Real API 전환 완료. device_id 지원, logout BE 호출, work_site 매핑 유틸 추가.
대시보드 전체를 하드코딩 Mock 의존에서 실 API 데이터 기반 동적 계산으로 전환.

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/api/client.ts` | `getDeviceId()` 함수 추가, `X-Device-ID` 헤더, refresh body에 device_id |
| `src/api/auth.ts` | login/refreshToken POST body에 device_id 추가 |
| `src/store/authStore.ts` | logout async 변경 + `POST /api/auth/logout` BE 호출 |
| `src/api/attendance.ts` | 실 API 응답에서 CHI product_line 자동 필터링 |
| `src/utils/workSiteMapping.ts` | **신규** — work_site/product_line 매핑 유틸 |
| `src/pages/attendance/AttendancePage.tsx` | Mock import 제거, KPI/차트/테이블 동적 계산 전환 |
| `src/components/attendance/CompanySummaryCards.tsx` | 하드코딩 Mock 테이블 삭제, props 기반 렌더링 |

### 실 DB 연동 테스트

| 테스트 | 항목 | 상태 |
|--------|------|------|
| 1 | 로그인 (admin 계정) | ✅ |
| 2 | 대시보드 데이터 로딩 (KPI/차트/카드/테이블) | ✅ |
| 3 | Mock 하드코딩 제거 확인 | ✅ |

---

## Sprint 3-hotfix: 대시보드 접근 권한 확장 ✅ 완료 (2026-03-06)

기존: `is_admin=true`만 대시보드 접속 가능 → 변경: `is_admin || is_manager` 허용.
권한 없는 사용자에게 모달 팝업 표시.

### 변경 내역

| 구분 | 변경 전 | 변경 후 |
|------|---------|---------|
| 접근 조건 | `is_admin=true`만 허용 | `is_admin=true` OR `is_manager=true` 허용 |
| 에러 표시 | 인라인 빨간 박스 | 모달 팝업 (아이콘 + 안내 + 확인 버튼) |
| 하단 안내 | "관리자 계정으로만 접근 가능합니다" | "관리자 및 협력사 관리자 계정으로 접근 가능합니다" |

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/api/auth.ts` | 로그인 검증: `!is_admin && !is_manager` 조건으로 변경, 에러 메시지 업데이트 |
| `src/pages/LoginPage.tsx` | `showAccessDenied` 모달 팝업 추가, 권한 에러 시 모달 표시, 하단 안내 문구 변경 |
| `src/components/auth/ProtectedRoute.tsx` | 라우트 가드: `!is_admin && !is_manager` 조건으로 변경 |

### 접근 권한 정리

| 사용자 유형 | is_admin | is_manager | 대시보드 접근 |
|-------------|----------|------------|--------------|
| GST 관리자 | true | - | ✅ 허용 |
| 협력사 관리자 | false | true | ✅ 허용 |
| 일반 작업자 | false | false | ❌ 차단 (모달 팝업) |

---

## Sprint 2: API 연동 + 설정 메뉴 ✅ 완료 (2026-03-06)

AXIS-OPS BE API 연동 준비 및 대시보드 설정 메뉴 구현.
BE 응답 필드명 불일치 수정(`user` → `worker`), 타입 필드 추가, 설정 훅/UI 구현, 자동 새로고침 연동.

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/types/auth.ts` | `User` → `Worker`, approval_status/email_verified 추가, 하위호환 별칭 |
| `src/types/attendance.ts` | work_site?, product_line? 옵셔널 필드 추가 |
| `src/api/auth.ts` | Mock/실제 응답 `user` → `worker` |
| `src/store/authStore.ts` | `data.user` → `data.worker` |
| `src/hooks/useSettings.ts` | **신규** — DashboardSettings 인터페이스 + localStorage 동기화 |
| `src/components/layout/SettingsModal.tsx` | **신규** — 자동 새로고침/기본 뷰/본사현장 구분 설정 |
| `src/components/layout/Header.tsx` | 설정 버튼 + SettingsModal 렌더링 |
| `src/hooks/useAttendance.ts` | refreshInterval 동적 설정 |
| `src/pages/attendance/AttendancePage.tsx` | 카드/테이블 뷰 토글 + showHqSiteBreakdown 연동 |
| `src/mocks/attendance.ts` | Mock에 work_site, product_line 추가 |

---

## Sprint 1: 디자인 수정 — G-AXIS Design System ✅ 완료

컨셉 HTML 기준으로 React 구현체 전면 수정. 로그인 + 출퇴근 대시보드 Phase 1 구현.

### 주요 구현

- **인증**: LoginPage + AuthProvider + ProtectedRoute + JWT 자동갱신
- **대시보드**: KPI 카드 4열 + 회사별 요약 카드 + 필터바 + 정렬 테이블
- **레이아웃**: 260px 사이드바 + 64px 헤더 + Sonner 토스트
- **디자인**: G-AXIS 컬러 토큰, DM Sans + JetBrains Mono, fadeInUp 애니메이션
- **빌드**: Vite + React 18 + TypeScript + Tailwind CSS v4 + shadcn/ui

---

## 📋 Sprint 이력 요약

| Sprint | 주요 내용 | 상태 |
|--------|----------|------|
| 1 | 디자인 수정 + G-AXIS 완전 적용 (로그인, 대시보드, 레이아웃) | ✅ 완료 |
| 2 | API 연동 준비 + 설정 메뉴 (worker 타입, 자동새로고침, 뷰토글) | ✅ 완료 |
| 3 | 실 데이터 연결 (device_id, logout, work_site 매핑, Mock 제거) | ✅ 완료 |
| 3-hotfix | 대시보드 접근 권한 확장 (is_manager 허용 + 모달 팝업) | ✅ 완료 |
| Phase 2 | QR 관리 페이지 (날짜 필터 + CSV 추출 + 모듈시작 컬럼명) | ✅ 완료 |
