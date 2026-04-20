# AXIS-VIEW — Agent Teams 프로젝트

> 최종 갱신: 2026-04-20 | 버전: v1.32.3
> 이 파일은 모든 에이전트가 작업 시작 전 반드시 읽어야 하는 프로젝트 컨텍스트입니다.

---

## ⚠️ 필수 규칙: Sprint 작업 시작 전

**모든 Sprint 프롬프트는 이 CLAUDE.md 참조로 시작한다.**

```
⚠️ 작업 시작 전 반드시 ~/Desktop/GST/AXIS-VIEW/CLAUDE.md 를 읽고 시작할 것
```

- 이 파일을 읽지 않고 Sprint 작업을 시작하면 안 됨
- Sprint 완료 시 이 파일의 버전, 페이지 수, API/훅 목록 등 변경사항 업데이트
- Sprint별 고유 내용만 `docs/sprints/DESIGN_FIX_SPRINT.md`에 작성

---

## 프로젝트 개요

AXIS-OPS(현장 작업자용 Flutter PWA)와 별도 운영되는 **React 관리자 대시보드**.
AXIS-OPS BE(Railway → 사내서버 마이그레이션 예정)의 API와 JWT를 공유하며, 별도 Backend 없이 프론트엔드만 개발.
현재 19개 페이지, 월 170~200대 생산 규모의 공장 5개 설비 운용 중.

---

## 팀 구성 & 모델 설정

### 리드 에이전트 (Lead — 설계 조율)
- **모델**: Opus (claude-opus-4-6)
- **역할**: 전체 아키텍처 설계, 에이전트 간 조율, 코드 리뷰, 의사결정
- **모드**: Delegate 모드 (Shift+Tab) — 리드는 직접 코드 작성하지 않고 조율만 수행
- **권한**: 모든 파일 읽기 가능, 직접 수정은 하지 않음

### 워커 에이전트 (Workers — 구현/테스트)
- **모델**: Sonnet (claude-sonnet-4-5)
- **역할**: 담당 영역의 코드 구현
- **모드**: 사용자 승인 후 코드 수정 가능 (위임 모드)

### 위임 모드 규칙
1. 리드가 작업을 분배하고 워커에게 위임
2. 워커는 코드 변경 전 **반드시 사용자 승인** 필요
3. 파일 소유권 위반 시 즉시 중단
4. 스프린트 단위로 작업 진행

---

## AI 검증 워크플로우 (Claude-Codex 교차 검증)

### 스프린트 파이프라인

```
① Claude Code → Sprint 설계서 작성 (VIEW_FE_Request.md)
  ↓
② /codex:review → Codex 교차 검증 + 합의 결과 공유
  ↓
③ Cowork 또는 터미널(Claude) → 설계서 보정 반영
  ↓
④ Claude Code → Sprint 코드 구현
  ↓
⑤ npm run build → 빌드 + 동작 확인
  ↓ 실패 시 → 수정 내용 Codex 합의 후 수정 → 빌드 재실행
  ↓
⑥ 테스트 결과 공유 → 전체 통과(GREEN) → 머지/배포
```

### 워크플로우 규칙

1. **설계서 선행**: Sprint 코드 작성 전 반드시 `VIEW_FE_Request.md`에 설계 완료
2. **설계 단계 교차 검증**: 코드 구현 전 `/codex:review`로 설계서 검증 — 구현 후 재작업 방지
3. **합의 기반 보정**: Codex 지적 사항은 Claude와 대조하여 합의된 항목만 반영 (맹목 수용 금지)
4. **빌드 확인 필수**: FE 코드 변경 후 `npm run build` 통과 확인
5. **빌드 실패 시 합의 수정**: 수정 내용도 Codex 합의 후 진행
6. **GREEN 판정 후 머지**: 전체 통과 확인 후에만 main 브랜치 머지
7. **BE API 의존**: AXIS-OPS BE API 변경 시 타입/인터페이스 동기화 확인

### 교차 검증 원칙

- **전수 검증**: 설계서 전체를 코드/기존 시스템과 대조 — 특정 항목만 체크하지 않음
- **맹목 수용 금지**: 지적 사항은 Claude와 대조하여 합의된 항목만 반영
- **분류 기준**: 지적 사항은 M(Must fix), A(Advisory) 로 구분하여 공유

---

## 프로젝트 디렉토리 구조

```
AXIS-VIEW/
├── CLAUDE.md                 ← 이 파일 (에이전트 필독)
├── handoff.md                ← 세션 인계용 (현재 상태, 대기 Sprint)
├── memory.md                 ← 누적 의사결정, 버그 분석, 아키텍처 판단
├── app/                      ← React 프로젝트
│   ├── package.json
│   ├── src/
│   │   ├── pages/            (19개 페이지)
│   │   │   ├── factory/      공장 대시보드
│   │   │   ├── partner/      협력사 (대시보드, 평가, 배분)
│   │   │   ├── production/   생산 (실적, 출하, 현황)
│   │   │   ├── plan/         생산일정
│   │   │   ├── attendance/   근태관리
│   │   │   ├── checklist/    체크리스트
│   │   │   ├── analytics/    사용자분석
│   │   │   ├── defect/       불량분석
│   │   │   ├── ct/           CT분석
│   │   │   ├── qr/           QR관리 + ETL변경이력
│   │   │   ├── admin/        권한관리 + 비활성 사용자
│   │   │   ├── LoginPage.tsx
│   │   │   └── UnauthorizedPage.tsx
│   │   ├── components/
│   │   │   ├── layout/       Layout, Sidebar, Header, Notification, Settings
│   │   │   ├── attendance/   출퇴근 전용 컴포넌트 7개
│   │   │   ├── sn-status/    S/N 현황 카드 컴포넌트 5개 (+SNStatusSettingsPanel)
│   │   │   ├── checklist/    체크리스트 컴포넌트 4개 (+ChecklistSettingsPanel)
│   │   │   ├── auth/         ProtectedRoute
│   │   │   └── ui/           shadcn 기반 공통 UI 13개
│   │   ├── api/              API 클라이언트 14개
│   │   ├── hooks/            TanStack Query 훅 14개
│   │   ├── types/            TypeScript 타입 7개
│   │   ├── version.ts        v1.19.0 (2026-03-31)
│   │   └── index.css         G-AXIS Design System CSS
│   ├── package.json
│   └── netlify.toml
│
├── etl/                      ← 데이터 파이프라인 (Python)
│   └── defect/               불량 ETL + migration + tests
│
└── docs/                     ← 설계 문서
    ├── AXIS_VIEW_ROADMAP.md       전체 로드맵
    ├── OPS_API_REQUESTS.md        BE API 요청사항 (#1~#52)
    ├── APS_LITE_PLAN.md           APS Lite 기획서 (차세대)
    ├── API_INTEGRATION_REVIEW.md  API 통합 리뷰
    ├── BACKLOG.md                 백로그
    ├── CHANGELOG.md               변경이력
    ├── concepts/                  컨셉 HTML 모음
    └── sprints/
        ├── DESIGN_FIX_SPRINT.md          Sprint 1~28 (메인 스프린트 문서)
        ├── RESPONSIVE_DESIGN_PLAN.md     반응형 설계 v2
        └── PARTNER_SPRINT1_LAUNCH.md     Sprint 1 런치 가이드
```

---

## 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| Framework | React | ^19.2.0 |
| Language | TypeScript | ~5.9.3 |
| Bundler | Vite | ^7.3.1 |
| Routing | React Router DOM | ^7.13.1 |
| 상태관리 | TanStack Query (React Query v5) | ^5.90.21 |
| HTTP | Axios | ^1.13.6 |
| 차트 | Recharts | ^3.7.0 |
| CSS | Tailwind CSS 4 + G-AXIS Design System | ^4.2.1 |
| UI 컴포넌트 | shadcn/ui (Radix 기반) | ^1.4.3 |
| 아이콘 | Lucide React | ^0.576.0 |
| 날짜 | date-fns | ^4.1.0 |
| 토스트 | Sonner | ^2.0.7 |
| 테스트 | Vitest | ^4.1.0 |
| 배포 | Netlify (정적 사이트) | — |
| Backend | 없음 — AXIS-OPS BE (Flask/Railway) API 공유 | — |

---

## 핵심 규칙 (모든 에이전트 공통)

### ⚠️ 최우선 규칙
- **사용자 승인 전 코드 수정 금지** — 설계/리뷰 완료 후 승인받고 진행
- **AXIS-OPS BE 코드 절대 수정 금지** — BE 변경 필요 시 `docs/OPS_API_REQUESTS.md`에 기록
- API가 없으면 **Mock 데이터로 FE 개발** 진행

### AXIS-OPS BE 의존 규칙
- AXIS-VIEW는 별도 BE 없음 — AXIS-OPS BE의 API만 호출
- API 스펙 불일치 시 `OPS_API_REQUESTS.md`에 요청 등록
- BE 요청 우선순위: 🔴 HIGH → 🟡 MEDIUM → 🟢 INFO

### 인증 규칙
- AXIS-OPS JWT 공유 — `POST /api/auth/login` → JWT 발급
- Access Token: `Authorization: Bearer {token}` 헤더
- 401 응답 → refresh_token으로 자동 갱신 → 원래 요청 재시도
- refresh도 실패 → 토큰 삭제 → `/login` 리다이렉트
- localStorage 키: `axis_view_access_token`, `axis_view_refresh_token`, `axis_view_user`
- 역할 체계: admin, manager, gst (ProtectedRoute에서 allowedRoles로 제어)

### 코드 스타일
- TypeScript strict mode, interface 우선
- React 함수형 컴포넌트 + Hooks + Custom Hook 패턴
- G-AXIS Design System CSS 변수 사용 (인라인 스타일 + CSS 클래스 병행)
- 한국어 주석 허용
- 각 파일 상단에 주석으로 파일 역할 명시
- `.env` 파일 절대 커밋 금지

### TanStack Query 규칙 (React Query v5)
- `refetchInterval`은 함수형 사용 가능 — `() => number | false`
- `placeholderData: keepPreviousData` — queryKey 전환 시 이전 데이터 유지
- `staleTime` 기본 5분, 분석류는 2분
- 에러 시 자동 재시도 3회 (기본 설정)

### 환경변수
```
# .env.development
VITE_API_BASE_URL=http://localhost:5000
VITE_USE_MOCK=true

# .env.production
VITE_API_BASE_URL=https://axis-ops-api.up.railway.app
VITE_USE_MOCK=false
```

---

## 페이지 구성 (21개, v1.24.0 기준)

### 사이드바 메뉴 구조

```
공장 대시보드        /factory                    [admin, manager, gst]
  ├─ Summary        /factory
  └─ Digital Twin   /factory/map                (preparing)
협력사 관리          /partner                    [admin, manager]
  ├─ 대시보드        /partner                    (preparing)
  ├─ 평가지수        /partner/evaluation         (preparing)
  ├─ 물량할당        /partner/allocation         (preparing)
  ├─ 근태 관리       /partner/attendance
  └─ 체크리스트      /partner/report
생산관리            /production/plan             [admin, manager, gst]
  ├─ 생산일정        /production/plan
  ├─ 생산현황        /production/status
  ├─ 생산실적        /production/performance
  └─ 출하이력        /production/shipment        (preparing)
QR 관리             /qr                          [admin, manager, gst]
  ├─ QR Registry    /qr
  └─ 변경 이력       /qr/changes
체크리스트 관리      /checklist                   [admin, manager, gst]
권한 관리           /admin/permissions            [admin, manager]
비활성 사용자        /admin/inactive              [admin]
불량 분석           /defect                       [admin, gst] (preparing)
CT 분석            /ct                            [admin, gst] (preparing)
사용자 분석         /analytics                    [admin]
```

- `preparing` 표시: 페이지 존재하지만 API 미연동 또는 목업 상태
- AI 예측 / AI 챗봇: disabled (향후 APS Lite 연동 예정)

---

## API 클라이언트 (14개)

| 파일 | 주요 함수 | BE 엔드포인트 |
|------|----------|-------------|
| auth.ts | login, refresh | `/api/auth/login`, `/api/auth/refresh` |
| client.ts | axiosInstance | 인터셉터 (JWT 자동 갱신, 에러 핸들링) |
| factory.ts | getWeeklyKpi, getMonthlyDetail | `/api/admin/factory/*` |
| production.ts | getPerformance, confirmProduction, cancelConfirm | `/api/admin/production/*` |
| snStatus.ts | getSNProgress | `/api/app/product/progress` |
| attendance.ts | getAttendance, getSummary, getTrend | `/api/admin/hr/attendance/*` |
| analytics.ts | getSummary, getWorkerAnalytics, getEndpoint, getHourly | `/api/admin/analytics/*` |
| workers.ts | getWorkers, toggleManager, getInactiveWorkers, getDeactivatedWorkers, updateWorkerStatus, requestDeactivation | `/api/admin/workers/*`, `/api/admin/inactive-workers`, `/api/admin/deactivated-workers`, `/api/admin/worker-status`, `/work/request-deactivation` |
| qr.ts | getQrList | `/api/admin/qr/*` |
| etl.ts | getEtlChanges | `/api/admin/etl/*` |
| notices.ts | getNotices | `/api/notices` |
| checklist.ts | getMasters, getRecords, upsertMaster, deleteMaster, searchSNList, getChecklistReport | `/api/admin/checklist/*` |
| adminSettings.ts | getSettings, updateSettings | `/api/admin/settings/*` |

---

## 훅 (18개 — TanStack Query 기반)

| 훅 | 용도 | staleTime |
|----|------|-----------|
| useFactory | 주간KPI + 월간상세 (refetchInterval 지원) | 5분 |
| useProduction | 생산실적 + 확인/취소 mutation | 5분 |
| useSNProgress | S/N 진행 상황 목록 | 5분 |
| useSNTasks | S/N별 태스크 상세 | 5분 |
| useAttendance | 출퇴근 기록 + 요약 + 추이 | 5분 |
| useAnalytics | 접속 통계 + 사용자별 + 기능별 + 시간대별 | 2분 |
| useWorkers | 작업자 목록 + 매니저 토글 | 5분 |
| useInactiveWorkers | 30일 미로그인 사용자 목록 | 1분 |
| useDeactivatedWorkers | 비활성화된 사용자 목록 | 1분 |
| useWorkerStatus | 비활성화/재활성화 mutation | — |
| useRequestDeactivation | Manager → 자사 소속 비활성화 요청 mutation | — |
| useQr | QR 레지스트리 목록 | 5분 |
| useEtlChanges | ETL 변경 이력 | 5분 |
| useNotices | 공지사항 | 5분 |
| useChecklist | 체크리스트 레코드 | 5분 |
| useChecklistMaster | 체크리스트 마스터 CRUD | 5분 |
| useAdminSettings | 관리 설정 | 5분 |
| useTaskReactivate | Task 재활성화 mutation (완료 작업 되돌리기) | — |
| useSettings | 로컬 UI 설정 (테마 등) | — |

---

## 타입 정의 (7개)

| 파일 | 주요 타입 |
|------|----------|
| auth.ts | User, LoginRequest, LoginResponse |
| production.ts | SNConfirm, PartnerConfirm, ProcessStatus, OrderGroup, ConfirmRequest |
| snStatus.ts | SNProduct, SNTask, SNWorker, SNProgress |
| attendance.ts | AttendanceRecord, CompanySummary, TrendDataPoint |
| qr.ts | QrRecord (PRODUCT/TANK, DUAL L/R) |
| checklist.ts | ChecklistMaster, ChecklistRecord, InspectionGroup |
| announcement.ts | Announcement |

---

## G-AXIS Design System

### 컬러 토큰
| 토큰 | CSS 변수 | 값 | 용도 |
|------|---------|-----|------|
| Charcoal | `--gx-charcoal` | #2A2D35 | 본문 텍스트 |
| Graphite | `--gx-graphite` | #3D4150 | 부제목 |
| Slate | `--gx-slate` | #5A5F72 | 사이드바, 보조 텍스트 |
| Steel | `--gx-steel` | #8B90A0 | 라벨, 비활성 |
| Silver | `--gx-silver` | #B8BCC8 | 구분선 hover |
| Mist | `--gx-mist` | #E8EAF0 | 보더 |
| Cloud | `--gx-cloud` | #F3F4F7 | 배경 |
| Snow | `--gx-snow` | #FAFBFD | 서브 배경 |
| White | `--gx-white` | #FFFFFF | 카드 배경 |
| Accent | `--gx-accent` | #6366F1 | 브랜드, 버튼, 활성 |
| Success | `--gx-success` | #10B981 | 완료, 정상 |
| Warning | `--gx-warning` | #F59E0B | 경고 |
| Danger | `--gx-danger` | #EF4444 | 에러, 불량 |
| Info | `--gx-info` | #3B82F6 | 정보 |

### 레이아웃 토큰
```
사이드바: 260px (--sidebar-width), 접힘 64px (--sidebar-collapsed-width), 고정 좌측
헤더: 64px (--header-height), sticky 상단
메인: margin-left 동적(펼침/접힘), padding 28px 32px, maxWidth 1440px
배경: Cloud (#F3F4F7)
반응형: 1024px 이하 자동 접힘, 768px 이하 숨김+오버레이
```

### 폰트
```
일반: DM Sans (300~700)
숫자/데이터: JetBrains Mono (400, 500, 700)
```

### Shadow / Radius
```
shadow-card: 0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)
shadow-md: 0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)
radius-sm: 6px | radius-md: 10px | radius-lg: 14px | radius-xl: 18px
```

---

## 협력사 목록 (BE workers 테이블 기준)

| company | role | 구분 |
|---------|------|------|
| FNI | MECH | 기구 협력사 |
| BAT | MECH | 기구 협력사 |
| TMS(M) | MECH | 기구(모듈) 협력사 |
| TMS(E) | ELEC | 전장 협력사 |
| P&S | ELEC | 전장 협력사 |
| C&A | ELEC | 전장 협력사 |
| GST | PI, QI, SI, ADMIN | 자사 |

- BE 공정 키 `TMS` → FE 표시 라벨 `TM` 매핑 필요
- DUAL 모델: TMS(L), TMS(R) 분리 표시

---

## 참조 문서

| 문서 | 용도 | 우선순위 |
|------|------|---------|
| `handoff.md` | 세션 인계 (현재 상태, 대기 Sprint, 미해결 버그) | 매 세션 시작 시 |
| `memory.md` | 누적 의사결정(ADR), 버그 분석, 아키텍처 판단 | 맥락 필요 시 |
| `PROGRESS.md` | 완료된 Sprint 이력 (상세) | 참조 |
| `DESIGN_FIX_SPRINT.md` | Sprint 1~30 메인 스프린트 문서 | 필수 |
| `OPS_API_REQUESTS.md` | BE API 요청/이슈 (#1~#57) | 필수 |
| `CHANGELOG.md` | 릴리스 이력 | 릴리스 시 |
| `BACKLOG.md` | 보류/계획/아이디어 + 디지털트윈 기획 | 기획 시 |
| `docs/APS_LITE_PLAN.md` | APS Lite 차세대 기획 | 참조 |
| `docs/AXIS_VIEW_ROADMAP.md` | 전체 로드맵 | 참조 |
| `docs/sprints/RESPONSIVE_DESIGN_PLAN.md` | 반응형 설계 v2 | 참조 |
| `docs/concepts/` | 디자인 컨셉 HTML | 디자인 기준 |

### AXIS-OPS 참조 (읽기 전용)
- `~/Desktop/GST/AXIS-OPS/backend/` — API 엔드포인트/모델 확인용, **수정 금지**
- `~/Desktop/GST/AXIS-OPS/CLAUDE.md` — OPS 프로젝트 컨텍스트

---

## 스프린트 이력 (요약)

| Sprint | 내용 | 상태 |
|--------|------|------|
| 1 | G-AXIS Design System 전면 적용 | ✅ 완료 |
| 2 | API 연동 + 설정 메뉴 | ✅ 완료 |
| 3 | 실 데이터 연결 + 스키마 정합성 | ✅ 완료 |
| 4 | 권한 체계 + 반응형 설계 | ✅ 완료 (반응형 보류) |
| 5 | DUAL QR 대시보드 | ✅ 완료 |
| 6 | 태스크 레벨 진행률 | ✅ 완료 |
| 7 | 사용자 분석 대시보드 | ✅ 완료 |
| 8 | 생산실적 API 연동 | ✅ 완료 |
| 9 | 실적확인 설정 + 권한 필터 | ✅ 완료 |
| 10 | 근태 추이 API 연동 | ✅ 완료 |
| 11 | 생산실적 BE 매핑 수정 | ✅ 완료 |
| 12 | TM 실적확인 로직 분리 (OPS BE) | ✅ 완료 |
| 13 | 공정 그룹 탭 분리 (기구전장/TM) | ✅ 완료 |
| 14 | 혼재 O/N partner별 실적확인 | ✅ 완료 |
| 15 | TM 가압검사 옵션 | ✅ 완료 |
| 16 | S/N별 실적확인 + End 필터 | ✅ 완료 |
| 17 | HOTFIX: End 필터 버그 수정 | ✅ 완료 |
| 18 | S/N 카드뷰 생산현황 | ✅ 완료 |
| 18-B | 상세뷰 UX 개선 (정렬반전 + 체크리스트 토글 + task명) | ✅ 완료 |
| 18-C | 다중 task 병합 렌더링 + task_name 표시 | ✅ 완료 |
| 19 | HOTFIX: 공장 대시보드 자동 새로고침 | ✅ 완료 |
| 20 | 체크리스트 관리 + 생산현황 연동 | ✅ 완료 |
| 21 | 반응형 레이아웃 (태블릿 우선) | ✅ 완료 |
| 22 | 공정 완료 판정 버그 수정 (categories 기준 통일) | ✅ 완료 |
| 23 | Task 재활성화 UI (생산현황 S/N 디테일) | ✅ 완료 |
| 24 | 생산현황 O/N 섹션 헤더 + 검색 확장 | ✅ 완료 |
| 25 | 페이지별 설정 패널 (테스트 S/N 토글 + TM 체크리스트 옵션) | ✅ 완료 |
| 26 | 체크리스트 관리 BE 연동 + TM 활성화 | ✅ 완료 |
| 27 | 월마감 캘린더 뷰 | ✅ 완료 |
| 28 | 체크리스트 성적서 페이지 | ✅ 완료 |
| 29 | QR 전장시작(elec_start) 필터 | ✅ 완료 |
| 30 | 비활성화 권한 분기 + 성적서 ELEC Phase/TM DUAL/SELECT/QI | ✅ 완료 |
| 31 | ELEC 체크리스트 VIEW 연동 (상세뷰 진행률 + 관리 블러 해제) | ✅ 완료 |
| 40-C | 비활성 사용자 관리 (VIEW 연동) | ✅ 완료 |
| 40-C+ | Manager 비활성화 요청 기능 | ✅ 완료 |
| 32 | 체크리스트 관리 ELEC 항목 추가/수정 + Sprint 60-BE 연동 | ✅ 완료 |
| 33 | 미종료 작업 관리 (강제종료 + 미시작 표시 + 권한) | ✅ 완료 |
| HOTFIX-04 / FE-19 | ProcessStepCard 강제종료 placeholder 렌더 (Case 2) + `formatDateTime` 유틸 승격 (v1.32.0) | ✅ 완료 |
| FE-19.1 후속 | per-row 강제종료 표시 (상태 컬럼 대체 + 툴팁) + v1.32.0 데드 코드 정리 (v1.32.1) | ✅ 완료 |
| FE-19.2 후속 | 강제종료 툴팁 즉시 반응 (CSS `.fc-tooltip` + `data-tooltip` — browser title 딜레이 회피) (v1.32.2) | ✅ 완료 |
| FE-19.1 용어 정합 | 강제종료 툴팁 `종료:` → `종료 처리:` (클린 코어 원칙 #4 UI 책임 — Claude↔Codex 교차검증 합의, v1.32.3) | ✅ 완료 |

### HOTFIX 연계 — 후속 BACKLOG (2026-04-17 정리)

| 항목 | 내용 | 상태 |
|---|---|---|
| REFACTOR-FMT-01 (나머지) | `formatDate` 2건(QrManagementPage / InactiveWorkersPage) 공통 유틸 승격 + fallback 인자 옵션 + invalid Date 가드 | 🟡 BACKLOG (우선순위 낮음, 리팩토링 건) |

**참조**:
- FE-19 구현 상세: `VIEW_FE_Request.md` L340~ (HOTFIX-04 연계 섹션)
- REFACTOR-FMT-01 BACKLOG 상세: `AXIS-OPS/BACKLOG.md` TECH-REFACTOR-FMT-01 행
- HOTFIX-04 BE 설계·배포 상세: `AXIS-OPS/AGENT_TEAM_LAUNCH.md` HOTFIX-04 섹션

---

## 향후 방향

### 단기 — Phase D 모바일 + 체크리스트 완성
- Sprint 21 Phase D: 모바일 하단 탭 네비게이션 (선택적)
- Sprint 20: 체크리스트 관리 BE 연동 (현재 목업)

### 중기 — 사내서버 마이그레이션
- Railway/Netlify → 사내서버 전환
- SAP RFC 연동 가능 환경 구축
- QMS 인터페이스 연동

### 장기 — APS Lite
- SAP 수주 수신 → 맨먼스 자동산출 → 협력사 자동분할
- 실적 → SAP 역동기화
- 납기 예측 ML, LLM 자연어 쿼리
- 상세: `docs/APS_LITE_PLAN.md` 참조
