# AXIS-VIEW 백로그

> 마지막 업데이트: 2026-03-06 (Sprint 3-hotfix 완료 — 대시보드 접근 권한 확장)
> 이 파일은 보류/재검토/계획/아이디어를 한 곳에서 관리합니다.
> 완료된 항목은 PROGRESS.md로 이동합니다.

---

## 🔴 지금 진행 중 / 미해결

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| TASK-1 | Netlify 배포 (실 데이터 모드) | 대기 | Sprint 3 실 DB 테스트 통과. `VITE_USE_MOCK=false` + `VITE_API_BASE_URL` 설정 후 배포 필요 |
| TASK-2 | 협력사 관리자 데이터 범위 제한 | 🔍 설계 필요 | `is_manager` 로그인 허용됨. 자기 회사 데이터만 보이게 FE 필터링 또는 BE API 권한별 응답 분기 필요 |

---

## 🟡 재검토 (Review Needed)

보류해둔 항목. 다음 Sprint 기획 시 우선 검토.

### RV-1: 실 데이터 연결 추가 테스트
- **배경**: Sprint 3에서 기본 3개 테스트 통과 (로그인, 데이터 로딩, Mock 제거). 추가 테스트 미실행
- **미실행 항목**:
  - 날짜별 조회 (date 파라미터)
  - 자동 새로고침 interval 확인
  - Token 자동갱신 (401 handling)
  - Logout API 호출 + 로컬 정리
- **우선순위**: 중 (배포 전 실행 권장)
- **등록일**: 2026-03-06

### RV-2: work_site 매핑 확장
- **배경**: 현재 `GST` → "GST공장", `HQ` → "협력사본사" 2가지만 매핑
- **확인 필요**: DB에 다른 work_site 값이 추가될 가능성. 매핑 테이블을 BE에서 내려주는 방식도 고려
- **우선순위**: 낮음
- **등록일**: 2026-03-06

---

## 🟠 배포 준비

| ID | 항목 | 설명 | 상태 |
|----|------|------|------|
| DP-1 | 개발 환경 세팅 | Vite + React 18 + TypeScript + Tailwind v4 + shadcn/ui | ✅ 완료 |
| DP-2 | Mock 데이터 시스템 | `VITE_USE_MOCK` 기반 Mock/실제 분기 | ✅ 완료 |
| DP-3 | 실 API 연결 | AXIS-OPS BE (Railway) 연동 확인 | ✅ 완료 |
| DP-4 | Netlify 배포 설정 | `netlify.toml` 설정 완료 | ✅ 완료 |
| DP-5 | 프로덕션 배포 | `VITE_USE_MOCK=false`로 Netlify 배포 | 대기 |
| DP-6 | 도메인 설정 | 커스텀 도메인 또는 Netlify 서브도메인 확정 | 추후 |

**현재 개발 URL**:
- FE: `http://localhost:5173` (Vite dev server)
- BE: `https://axis-ops-api.up.railway.app` (AXIS-OPS 공유)

**환경변수**:
- `VITE_USE_MOCK=true` → Mock 데이터 (개발)
- `VITE_USE_MOCK=false` → 실 API 호출 (프로덕션)
- `VITE_API_BASE_URL` → API 서버 URL

---

## 🔵 추후 구현 (Phase 로드맵)

### Phase 2: QR 관리 페이지
- **내용**: `/qr` 경로 — QR 코드 목록 조회, 다운로드, 인쇄 기능
- **현재 상태**: 사이드바에 메뉴 존재 (Lock 아이콘, 비활성)
- **의존성**: AXIS-OPS QR ETL 파이프라인 (BACKLOG.md 참조)
- **시기**: 미정

### Phase 3: WebSocket 실시간 업데이트
- **내용**: 출퇴근 시간대에 실시간 push로 대시보드 자동 갱신
- **현재**: 설정 메뉴에서 1분/3분/5분 polling 방식
- **의존성**: AXIS-OPS WebSocket flask-sock (Sprint 13 완료)
- **시기**: 미정

### 협력사 관리자 전용 뷰
- **내용**: `is_manager` 사용자 로그인 시 자기 회사 데이터만 표시하는 필터링 뷰
- **구현 방향**:
  - FE: `worker.company` 기준으로 대시보드 데이터 자동 필터링
  - BE: API 응답에서 권한별 데이터 범위 제한 (선택적)
  - UI: 헤더에 "OO협력사" 회사명 표시, 다른 회사 데이터 숨김
- **의존성**: Sprint 3-hotfix (is_manager 로그인 허용) ✅ 완료
- **우선순위**: 높음 (is_manager 로그인 허용 후 바로 필요)
- **등록일**: 2026-03-06

### 월간 출퇴근 집계 대시보드
- **내용**: 일별 → 월간 집계 뷰 (출근율 추이, 회사별 월간 통계)
- **BE API**: GET /api/admin/hr/attendance/monthly (미구현 — OPS BACKLOG Phase B 참조)
- **시기**: 미정

### 생산 현황 대시보드
- **내용**: `/production` 경로 — 작업 진행률, S/N 현황, 공정별 통계
- **현재 상태**: 사이드바에 메뉴 존재 (Lock 아이콘, 비활성)
- **의존성**: AXIS-OPS 생산 API
- **시기**: 미정

### KPI 리포트
- **내용**: `/reports` 경로 — 주간/월간 KPI 리포트 생성 및 다운로드
- **현재 상태**: 사이드바에 메뉴 존재 (Lock 아이콘, 비활성)
- **시기**: 미정

---

## 🟢 아이디어 / 메모

- **다크모드**: G-AXIS 디자인 시스템에 다크 컬러 토큰 추가 가능. 현재는 라이트 모드만
- **반응형 모바일**: 현재 데스크탑 기준. 태블릿/모바일 레이아웃 추가 시 사이드바 → 하단 네비게이션
- **알림 센터**: 대시보드에서 실시간 알림 (지각 경고, 미출근 알림 등) 표시
- **CSV/Excel 다운로드**: 출퇴근 데이터를 CSV/Excel로 내보내기 기능
- **AXIS-OPS 통합 인증**: OPS와 VIEW가 동일 BE를 사용하므로, SSO 또는 토큰 공유 가능

---

## 📋 Sprint 이력 요약

| Sprint | 주요 내용 | 상태 |
|--------|----------|------|
| 1 | 디자인 수정 + G-AXIS 완전 적용 (로그인, 대시보드, 레이아웃) | ✅ 완료 |
| 2 | API 연동 준비 + 설정 메뉴 (worker 타입, 자동새로고침, 뷰토글) | ✅ 완료 |
| 3 | 실 데이터 연결 (device_id, logout, work_site 매핑, Mock 제거) | ✅ 완료 |
| 3-hotfix | 대시보드 접근 권한 확장 (is_manager 허용 + 모달 팝업) | ✅ 완료 |
