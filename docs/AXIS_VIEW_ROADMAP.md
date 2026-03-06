# AXIS-VIEW 로드맵

> 마지막 업데이트: 2026-03-05 (보안 Sprint 19-A/B 연계 + GST 좌표 + 실 데이터 연결 정보 추가)
> AXIS-OPS (Flutter PWA)와 별도로 운영되는 React 기반 관리자 대시보드
> 컨셉 UI: `docs/concepts/G-AXIS VIEW(*.html)` — 공장대시보드, 협력사, 불량분석, 생산일정, CT분석

---

## 개요

AXIS-OPS는 현장 작업자용 모바일 PWA이고, AXIS-VIEW는 관리자/사무실용 React 웹 대시보드이다.
두 시스템은 동일한 Railway PostgreSQL DB를 공유하며, AXIS-VIEW는 조회/관리 중심의 읽기 위주 서비스.

### 개발 방법론

AXIS-OPS와 동일하게 MD 파일 기반 스프린트 관리 체계 적용:
- `LAUNCH.md` → 릴리즈/배포 이력
- `PROGRESS.md` → 스프린트 진행 현황
- `BACKLOG.md` → 백로그 관리
- 팀 에이전트 기반 스프린트 진행 (AXIS-OPS에서 검증 완료)

```
┌─────────────────────────────────────────────────────────────────┐
│                      Railway PostgreSQL                          │
│                                                                  │
│  plan.product_info  │  public.qr_registry  │  hr.*  │  app.*    │
└───────┬─────────────────────┬───────────────────┬───────────────┘
        │                     │                   │
   ┌────▼────┐          ┌─────▼─────┐      ┌─────▼─────┐
   │ ETL     │          │ AXIS-OPS  │      │ AXIS-VIEW │
   │ Pipeline│──Slack──▶│ Flutter   │      │ React     │
   │ (Cron)  │  알림    │ PWA       │      │ Dashboard │
   └─────────┘          └─────┬─────┘      └─────┬─────┘
                              │   JWT 공유        │
                              └───────────────────┘
```

---

## 인증 (결정)

AXIS-OPS의 JWT를 그대로 공유한다. AXIS-OPS BE에 이미 `is_admin` 체크 로직이 구현되어 있으므로,
AXIS-VIEW용 별도 인증 시스템은 만들지 않는다.

```
인증 흐름:
1. AXIS-VIEW 로그인 → AXIS-OPS BE의 POST /api/auth/login 호출
2. JWT 발급 (is_admin: true 확인)
3. 이후 모든 API 요청에 Authorization: Bearer {token} 헤더
4. AXIS-OPS BE의 기존 adminMiddleware로 권한 검증
```

### 보안 강화 (OPS 보안 Sprint 19-A/B 적용 — 2026-03-05)

OPS 보안 스프린트에서 아래 내용이 VIEW FE에도 적용됨:

| 항목 | 내용 | VIEW FE 변경 |
|------|------|-------------|
| Refresh Token Rotation | `/auth/refresh` 시 새 refresh_token 반환 | `client.ts`에 이미 `if (response.refresh_token)` 대응 있음 → 수정 불필요 |
| Device ID | 기기별 UUID 생성 + login/refresh 요청에 포함 | `client.ts`에 `getDeviceId()` 추가 (crypto.randomUUID + localStorage) |
| DB 토큰 관리 | revoked 토큰 재사용 시 전체 무효화 (탈취 감지) | BE 자동 적용, FE 변경 없음 |
| Logout API | `POST /auth/logout`으로 서버측 토큰 무효화 | `auth.ts` logout 함수에 API 호출 추가 |
| Geolocation | GST 현장 출근 시 GPS 위치 검증 (반경 1km) | VIEW 무관 — OPS admin 설정 페이지에서 관리 |

```
OPS + VIEW 동시 사용 시:
├── 동일 이메일/비밀번호로 각각 로그인
├── 각각 독립된 access_token + refresh_token + device_id
├── 한쪽 로그아웃해도 다른 쪽 유지
└── 탈취 감지 시에만 양쪽 모두 재로그인 필요 (보안상 의도된 동작)
```

---

## Phase 1: 협력사 출퇴근 대시보드 (~1주)

### 목적
AXIS-OPS에서 협력사 작업자가 출퇴근 체크 → DB 적재 → AXIS-VIEW에서 조회

### 선행 조건
- [x] hr.partner_attendance 테이블 (Sprint 12에서 생성)
- [x] AXIS-OPS 출퇴근 API: `POST /api/hr/attendance` (in/out)
- [x] AXIS-OPS 권한 분리 완료 (adminMiddleware)
- [ ] 실제 협력사 작업자 데이터 입력 테스트 (리얼타임 검증)

### 출퇴근 분류 체계 (2026-03-04 확정)

```
협력사 출퇴근 분류
├── 근무지 (work_site)
│   ├── GST    → GST 공장 근무 — 제조 현장 (default)
│   └── HQ     → 협력사 본사 근무
│
└── 제품군 (product_line)
    ├── SCR    → 스크러버 (default, 현재 주력)
    └── CHI    → 칠러 (CHI 제조기술부 통합 대비)

조합 4가지:
├── GST + SCR  → GST 공장 스크러버 근무 (default)
├── GST + CHI  → GST 공장 칠러 근무
├── HQ + SCR   → 협력사 본사 스크러버 근무
└── HQ + CHI   → 협력사 본사 칠러 근무
```

### FE 드롭다운 (출근 시에만 표시)

```
대상: 모든 협력사 작업자 (company != 'GST')
       → role: MECH, ELEC, TM 모두 동일하게 선택창 제공
       → GST 내부 (PI, QI, SI): 해당사항 없음 (드롭다운 미표시)
       → Admin: 전체 메뉴 접근 (AXIS-VIEW에서 필터로 조회)

근무 선택 드롭다운 (출근 버튼 위, 기본값 선택된 상태):
┌─────────────────────────────────────┐
│  📍 근무 선택                        │
│  ┌─────────────────────────────────┐ │
│  │ ● GST 공장 (SCR)    ← default  │ │
│  │ ○ GST 공장 (CHI)               │ │
│  │ ○ 협력사 본사 (SCR)             │ │
│  │ ○ 협력사 본사 (CHI)             │ │
│  └─────────────────────────────────┘ │
│                                      │
│  [ 출근하기 ]                         │
└─────────────────────────────────────┘

퇴근 시:
  → 드롭다운 미표시
  → BE에서 당일 마지막 IN 레코드의 work_site/product_line 자동 복사
```

### DB 스키마

```
현재 테이블 (마이그레이션 010):
hr.partner_attendance
├── id (SERIAL PK)
├── worker_id (FK → workers.id)
├── check_type VARCHAR(3)        -- 'in' / 'out'
├── check_time (timestamptz)
├── method VARCHAR(10)           -- 'button' / 'pin' / 'biometric'
├── note (text)
└── created_at (timestamptz)

신규 마이그레이션 (017_add_attendance_classification.sql):
ALTER TABLE hr.partner_attendance
  ADD COLUMN work_site VARCHAR(10) NOT NULL DEFAULT 'GST',
  ADD COLUMN product_line VARCHAR(10) NOT NULL DEFAULT 'SCR';

ALTER TABLE hr.partner_attendance
  ADD CONSTRAINT chk_work_site CHECK (work_site IN ('GST', 'HQ')),
  ADD CONSTRAINT chk_product_line CHECK (product_line IN ('SCR', 'CHI'));

CREATE INDEX IF NOT EXISTS idx_partner_att_site_line
  ON hr.partner_attendance(work_site, product_line);

설계 근거:
  - VARCHAR + CHECK constraint (ENUM 아님)
  - 확장 시: ALTER TABLE DROP CONSTRAINT → ADD CONSTRAINT로 값 추가 가능
  - ENUM은 ALTER TYPE ... ADD VALUE가 트랜잭션 내 실행 불가 → 운영 번거로움
  - 기존 데이터: DEFAULT 값으로 자동 채워짐 (GST + SCR)
```

### BE 수정 범위 (hr.py)

```
1. attendance_check() — POST /api/hr/attendance/check
   수정 내용:
   ├── Request Body에 work_site, product_line 필드 추가 (optional, default 있음)
   ├── check_type == 'in':
   │   → FE에서 전달된 work_site/product_line 사용
   │   → 미전달 시 default: GST + SCR
   ├── check_type == 'out':
   │   → 당일 마지막 IN 레코드에서 work_site/product_line 복사
   │   → FE에서 보낸 값 무시 (IN 페어 기준)
   └── INSERT에 work_site, product_line 추가
       RETURNING에도 work_site, product_line 추가

2. attendance_today() — GET /api/hr/attendance/today
   수정 내용:
   ├── SELECT에 work_site, product_line 추가
   └── Response records에 work_site, product_line 포함

3. (AXIS-VIEW용) admin API 확장 — 필터 추가
   ├── GET /api/admin/hr/attendance/today?work_site=GST&product_line=SCR
   └── GET /api/admin/hr/attendance/summary → work_site/product_line별 집계 포함
```

### React 대시보드 기능

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 당일 출퇴근 현황 | 회사별 출근/퇴근 인원 수 | 높음 |
| 작업자 목록 | 이름, 소속, 출근시간, 퇴근시간, 상태(근무중/퇴근) | 높음 |
| 회사별 필터 | FNI, BAT, TMS(M), TMS(E), P&S, C&A 드롭다운 | 높음 |
| 날짜 선택 | 특정 날짜 출퇴근 기록 조회 | 중간 |
| 월간 집계 | 작업자별 월 출근일수, 총 근무시간 | 낮음 |

### 데이터 갱신 전략: WebSocket

출퇴근 시간이 규칙적이므로 (출근: 07:30~08:30, 퇴근: 17:00~18:00) WebSocket 연결을 시간대별로 관리한다.

```
WebSocket 연결 전략:
├── 07:00 ~ 09:30 (출근 시간대): WebSocket 활성 → 실시간 push
├── 09:30 ~ 16:30 (근무 시간대): WebSocket 해제 → 수동 새로고침 or 5분 폴링
├── 16:30 ~ 17:20 (퇴근 시간대): WebSocket 활성 → 실시간 push
├── 19:30 ~ 20:20 (퇴근 시간대): WebSocket 활성 → 실시간 push
└── 24:00 ~ 07:00 (비근무 시간): WebSocket 해제 → 연결 없음

BE 구현:
├── AXIS-OPS BE에 ws:// 엔드포인트 추가
├── 출퇴근 체크 시 → WebSocket broadcast to AXIS-VIEW clients
└── 연결 관리: heartbeat 30초, 자동 재연결
```

### 기술 스택

```
React + TypeScript
├── UI: Tailwind CSS + shadcn/ui (G-AXIS Design System 토큰 적용)
├── 상태: React Query (TanStack Query)
├── 실시간: WebSocket (출퇴근 시간대 한정)
├── 차트: Recharts
├── API: AXIS-OPS BE JWT 공유 (/api/admin/*)
└── 배포: Netlify
```

### 필요 API (신규 or 확장)

```
GET  /api/admin/hr/attendance/today            → 당일 출퇴근 목록
GET  /api/admin/hr/attendance?date=YYYY-MM-DD  → 특정일 조회
GET  /api/admin/hr/attendance/monthly?month=YYYY-MM  → 월간 집계
GET  /api/admin/hr/attendance/summary          → 회사별 출근 인원 요약
WS   /ws/attendance                            → 출퇴근 실시간 이벤트
```

---

## Phase 2: QR 이미지 발급 페이지 (~1주)

### 목적
ETL로 생산계획 데이터 적재 → QR 이미지 자동 생성 → 관리자가 웹에서 QR 라벨 다운로드/인쇄

### 선행 조건
- [x] ETL 파이프라인 구현 (`etl_main.py` + step1/2/3)
- [x] plan.product_info + public.qr_registry 스키마
- [x] QR 이미지 생성 로직 (`step3_qr_generate.py`)
- [ ] GitHub Actions Cron 스케줄 설정
- [ ] QR 이미지 저장소: **Cloudflare R2 (권장)** — S3 호환 + 무료 egress

### QR 이미지 저장소 권장안

```
비교:
├── GitHub Artifacts  → ✗ 90일 만료, 프로덕션 부적합
├── Railway Volume    → △ 재배포 시 데이터 유실 리스크
├── AWS S3            → ○ 안정적이나 egress 비용 발생
└── Cloudflare R2     → ◎ S3 호환 API + egress 무료 + 저렴
                          → boto3 그대로 사용 가능, endpoint만 변경

구현:
  ETL → QR PNG 생성 → R2 업로드 (s3cmd or boto3)
  AXIS-VIEW → R2 public URL로 이미지 직접 로드
```

### ETL 파이프라인 현황

```
현재 (수동):
  로컬에서 python3 etl_main.py --all 실행
  → Teams Excel(Graph API) → PostgreSQL 적재 → QR PNG 생성(로컬)

목표 (자동):
  GitHub Actions (Cron: 매일 08:00 KST, 월~금)
  → Teams Excel(Graph API) → PostgreSQL 적재 → QR PNG 생성 → R2 업로드
  → 실패 시 Slack 알림
```

### GitHub Actions Flow

```yaml
# .github/workflows/etl-pipeline.yml
name: ETL Pipeline

on:
  schedule:
    # UTC 일~목 23:00 = KST 월~금 08:00
    - cron: '0 23 * * 0-4'
  workflow_dispatch:  # 수동 실행 가능

jobs:
  etl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install psycopg2-binary qrcode[pil] openpyxl requests boto3

      - name: Run ETL
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          TEAMS_CLIENT_ID: ${{ secrets.TEAMS_CLIENT_ID }}
          TEAMS_CLIENT_SECRET: ${{ secrets.TEAMS_CLIENT_SECRET }}
          TEAMS_TENANT_ID: ${{ secrets.TEAMS_TENANT_ID }}
          R2_ACCESS_KEY: ${{ secrets.R2_ACCESS_KEY }}
          R2_SECRET_KEY: ${{ secrets.R2_SECRET_KEY }}
          R2_ENDPOINT: ${{ secrets.R2_ENDPOINT }}
          R2_BUCKET: ${{ secrets.R2_BUCKET }}
        run: python etl_pipeline/etl_main.py --all

      # ETL 실패 시 Slack 알림
      - name: Slack 알림 (실패)
        if: failure()
        uses: slackapi/slack-github-action@v2.1.0
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          webhook-type: incoming-webhook
          payload: |
            {
              "text": "⚠️ ETL Pipeline 실패",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "🔴 *ETL Pipeline 실패*\n• Workflow: ${{ github.workflow }}\n• 시간: ${{ github.event.head_commit.timestamp || 'scheduled' }}\n• <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|로그 확인>"
                  }
                }
              ]
            }

      # ETL 성공 시 Slack 알림 (선택)
      - name: Slack 알림 (성공)
        if: success()
        uses: slackapi/slack-github-action@v2.1.0
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          webhook-type: incoming-webhook
          payload: |
            {
              "text": "✅ ETL Pipeline 완료 — QR 이미지 업데이트됨"
            }
```

### React QR 발급 페이지 기능

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| QR 목록 조회 | S/N, 모델, 상태(active/revoked), 발급일 | 높음 |
| QR 이미지 미리보기 | 클릭 시 QR 이미지 팝업 | 높음 |
| 단건 다운로드 | 개별 QR 이미지 PNG 다운로드 | 높음 |
| 일괄 다운로드 | 선택한 QR 이미지 ZIP 묶음 다운로드 | 높음 |
| 모델별 필터 | GAIA-I, DRAGON, SWS 등 드롭다운 | 중간 |
| 날짜 범위 필터 | 생산일(prod_date) 기준 기간 검색 | 중간 |
| QR 재발급 | 기존 QR revoke → 신규 발급 | 낮음 |
| 인쇄 규격 설정 | 스티커 크기 (30x30mm, 50x50mm 등) 선택 후 인쇄용 PDF 생성 | 낮음 |

### 필요 API

```
GET  /api/qr/list?model=&date_from=&date_to=     → QR 목록 (페이지네이션)
GET  /api/qr/image/{qr_doc_id}                     → QR 이미지 단건 (R2 redirect)
POST /api/qr/batch-download                        → 선택 QR ZIP 다운로드
POST /api/qr/revoke/{qr_doc_id}                    → QR 비활성화
GET  /api/qr/stats                                 → 모델별/기간별 QR 통계
```

> 참고: 기존 로컬 Flask 서버에 `/api/qr/list`, `/api/qr/image`, `/api/qr/download`, `/api/qr/batch-download` API 이미 구현되어 있음. AXIS-OPS BE로 이관 또는 별도 서비스로 분리 결정 필요.

---

## Phase 3: 통합 관리 대시보드 (~2주)

Phase 1 + Phase 2 완료 후, 컨셉 HTML 5개 페이지를 React 컴포넌트로 구현하여 통합:

| 사이드바 메뉴 | 컨셉 HTML | 주요 기능 | Phase |
|---------------|-----------|-----------|-------|
| 공장 대시보드 | `G-AXIS VIEW(공장대시보드).html` | KPI 카드, 실시간 생산 현황, 공정 파이프라인 | 3 |
| 협력사 대시보드 | `G-AXIS VIEW(협력사).html` | 출퇴근 현황, 회사별 집계, 작업자 목록 | 1→3 이관 |
| 생산일정 | `G-AXIS VIEW(생산일정).html` | 주차별 SCR 일정 테이블, 공정 파이프라인, 필터 | 3 |
| 불량 분석 | `G-AXIS VIEW(불량분석).html` | 가압검사 불량 분포, 부품별 순위, 외주사별 현황, 월별 추이 | 3 |
| CT 분석 | `G-AXIS VIEW(CT분석).html` | Task별 IQR 군집도, 전장/검사 공정 시간 분석 | 3 |
| 작업 진행현황 | (신규) | 협력사별 S/N 진행률, 공정별 완료율 바차트 | AXIS-OPS Sprint 18 API 재사용 |
| QR 관리 | (신규) | Phase 2 QR 발급/다운로드 | 2→3 이관 |

### 페이지별 데이터 소스

```
공장 대시보드  → app.tasks + app.work_start_log (AXIS-OPS DB)
협력사 대시보드 → hr.partner_attendance + app.workers
작업 진행현황   → plan.product_info + completion_status + app_task_details (Sprint 18 공유 API)
생산일정       → plan.product_info (ETL로 적재)
불량 분석      → 별도 ETL 필요 (Teams 가압검사 시트 → DB)
CT 분석        → app.tasks의 시간 데이터 집계
QR 관리        → public.qr_registry + R2 이미지
```

---

## 실행 순서 (권장)

```
1단계: 리얼타임 테스트 (1~2일)
   ├── AXIS-OPS 배포 → 협력사 출퇴근 데이터 실입력 → DB 적재 확인
   └── hr.partner_attendance에 데이터 쌓이는지 검증

2단계: Phase 1 React — 출퇴근 대시보드 (~1주)
   ├── React 프로젝트 초기 세팅 (Vite + Tailwind + shadcn)
   ├── AXIS-OPS BE API 확장 (/api/admin/hr/attendance/*)
   ├── WebSocket 엔드포인트 추가 (/ws/attendance)
   └── 출퇴근 대시보드 React 구현

3단계: ETL 자동화 (~3일)
   ├── GitHub Actions Cron 설정
   ├── Teams Graph API secrets 등록
   ├── Cloudflare R2 버킷 생성 + 시크릿 등록
   ├── Slack Webhook 연동 (ETL 실패/성공 알림)
   └── 수동 실행으로 E2E 테스트

4단계: Phase 2 React — QR 발급 페이지 (~1주)
   ├── ETL 자동화 완료 후 React 개발
   └── 기존 로컬 Flask QR API → AXIS-OPS BE 이관

5단계: Phase 3 — 통합 (~2주)
   ├── Phase 1 + Phase 2 → 단일 AXIS-VIEW 앱으로 통합
   ├── 컨셉 HTML 5개 페이지 → React 컴포넌트 변환
   ├── 공장 대시보드, 생산일정, 불량 분석, CT 분석 페이지 구현
   └── 사이드바 네비게이션 완성 + AI 예측/AI 챗봇 (placeholder)
```

---

## AXIS-OPS 공유 API (AXIS-VIEW 재사용)

AXIS-OPS Sprint 18에서 추가된 API로, AXIS-VIEW에서 그대로 재사용할 엔드포인트.
별도 구현 없이 AXIS-OPS BE의 기존 JWT 인증으로 호출 가능.

### 협력사 S/N 작업 진행률 API

| API | 용도 | AXIS-VIEW 활용 |
|-----|------|----------------|
| `GET /api/app/product/progress` | 로그인 사용자 소속 회사의 S/N 진행률 | 협력사 대시보드 → 작업 진행현황 섹션 |
| `GET /api/app/product/progress?company=FNI` | 특정 협력사 필터 (admin 전용) | 전체 협력사 비교 대시보드, 드롭다운 필터 |
| `GET /api/app/product/progress?include_completed=3` | 완료 포함 일수 조정 (default: 1일) | 주간 리뷰용 확장 조회 |

**응답 포맷**:

```json
{
  "products": [
    {
      "serial_number": "SCR-001",
      "model": "SCR-1200",
      "mech_partner": "FNI",
      "elec_partner": "TMS(E)",
      "progress": {
        "MM": {"total": 8, "done": 5, "percent": 62.5},
        "EE": {"total": 6, "done": 6, "percent": 100.0},
        "TM": {"total": 3, "done": 0, "percent": 0.0},
        "PI": {"total": 4, "done": 2, "percent": 50.0},
        "QI": {"total": 4, "done": 0, "percent": 0.0},
        "SI": {"total": 3, "done": 0, "percent": 0.0}
      },
      "overall_percent": 43.3,
      "all_completed": false,
      "all_completed_at": null,
      "mech_start": "2026-03-01",
      "ship_plan_date": "2026-04-15"
    }
  ],
  "summary": {
    "total": 15,
    "in_progress": 12,
    "completed_recent": 3
  }
}
```

**협력사별 S/N 필터링 규칙**:

| 협력사 | 필터 조건 | 보이는 공정 |
|--------|----------|------------|
| FNI, BAT, TMS(M) | `mech_partner` 또는 `module_outsourcing` 일치 | MM (+ TM for TMS) |
| TMS(E), P&S, C&A | `elec_partner` 일치 | EE |
| GST (is_admin) | 전체 | 전체 (6공정) |

**100% 완료 자동 제거**: `all_completed_at` 기준 N일 후 목록에서 사라짐 (`include_completed` 파라미터로 조정)

**AXIS-VIEW 활용 시나리오**:

```
1. 협력사 대시보드 → "작업 진행현황" 탭 추가
   → admin JWT로 GET /api/app/product/progress?company=FNI
   → 회사별 드롭다운으로 전환 (FNI, BAT, TMS 등)

2. 공장 대시보드 → "전체 작업 진행률" 위젯
   → admin JWT로 GET /api/app/product/progress (전체)
   → overall_percent 기준 바 차트 / 히트맵

3. 차트 시각화 (Recharts)
   → progress 객체의 카테고리별 percent를 Stacked Bar로 표현
   → ship_plan_date 기준 납기 임박 S/N 강조 (Warning 컬러)
```

> **DB 참조 테이블**: `plan.product_info` (partner 필드) + `completion_status` (완료 추적) + `app_task_details` (태스크별 진행)
> **스키마 변경 없음** — 기존 3개 테이블 JOIN으로 구현

---

## 실 데이터 연결 가이드 (Sprint 2 완료 후)

> VIEW Sprint 2에서 API 연동 레이어가 구현 완료됨. Mock → Real 전환만 남은 상태.

### 전환 방법

```
1. 환경변수 변경:
   VITE_USE_MOCK=false
   VITE_API_BASE_URL=https://{railway-domain}/api

2. OPS Sprint 19-A/B 완료 후 추가 반영된 사항:
   - device_id: login/refresh 요청에 자동 포함됨
   - logout: 서버측 토큰 무효화 API 호출 추가됨
   - Rotation: FE 수정 없이 자동 대응 (이미 대응 코드 있음)

3. 확인 항목:
   - 로그인 → BE 인증 → 대시보드 진입 정상
   - access_token 만료 → 자동 갱신 (새 refresh_token 저장 확인)
   - 출퇴근 데이터 실시간 표시
   - 설정 메뉴 정상 동작
```

### 필요 BE 엔드포인트 (Sprint 2에서 추가됨)

| 엔드포인트 | 상태 | 용도 |
|-----------|------|------|
| `GET /api/admin/hr/attendance/today` | Sprint 2 구현 | 당일 출퇴근 현황 |
| `GET /api/admin/hr/attendance?date=` | Sprint 2 구현 | 특정일 조회 |
| `GET /api/admin/hr/attendance/summary` | Sprint 2 구현 | 회사별 요약 |
| `POST /api/auth/logout` | Sprint 19-B 추가 | 서버측 로그아웃 |
| `GET /api/admin/settings` | 기존 존재 | admin 설정 조회 |

---

## 결정 사항

| 항목 | 결정 | 비고 |
|------|------|------|
| 인증 | **AXIS-OPS JWT 공유** | is_admin 체크 미들웨어 활용, 별도 인증 시스템 불필요 |
| QR 이미지 저장소 | **Cloudflare R2 (권장)** | S3 호환 + egress 무료, boto3 그대로 사용 |
| AXIS-VIEW 배포 | **Netlify** | 확정 |
| QR API 위치 | AXIS-OPS BE에 통합 | Flask 이관 |
| QR 인쇄 방식 | 스티커 프린터 직접 / PDF 생성 후 인쇄 | 미정 |
| ETL 실패 알림 | **Slack Webhook** | GitHub Actions failure 시 자동 알림 |
| 데이터 갱신 | **WebSocket (출퇴근 시간대 한정)** | 07~09시, 16:30~18:30 활성 / 나머지 폴링 |
| Geolocation 설정 | **OPS admin 설정 페이지** | VIEW에서 관리하지 않음 — OPS `admin_options_screen.dart` Section 5 |
| GST 공장 좌표 | **위도 37.171, 경도 127.088** (추정) | 동탄산단6길 15-13, 반경 1km, 현장 실측 후 OPS admin에서 수정 |
| 보안 인증 | **OPS Sprint 19-A/B** | Rotation + Device ID + DB 토큰 + Logout API, VIEW FE에도 자동 적용 |

---

## 모니터링 & 알림

```
ETL 파이프라인 모니터링:
├── GitHub Actions 실패 → Slack #axis-ops-alerts 채널 알림
├── 알림 내용: 실패 워크플로우명, 시간, 로그 링크
├── 성공 시에도 간단한 완료 메시지 전송 (선택적)
└── 주요 실패 원인 대응:
    ├── Graph API 토큰 만료 → 갱신 필요 알림 포함
    ├── DB 연결 실패 → Railway 상태 체크 안내
    └── R2 업로드 실패 → 네트워크/인증 에러 구분

AXIS-VIEW 헬스체크:
├── Netlify 자체 모니터링
└── API 응답 실패 시 프론트엔드에서 토스트 알림
```

---

## 컨셉 UI 분석

> 소스: `Brand identity/G-AXIS VIEW(*.html)` — 공장대시보드, 협력사, 불량분석, 생산일정, CT분석

### 공통 디자인 시스템 (G-AXIS Design System)

```
브랜드: AXIS-VIEW — Manufacturing Execution Platform
폰트: DM Sans (300~700) + JetBrains Mono (데이터/숫자)
레이아웃: 좌측 사이드바 260px + 상단 헤더 64px + 메인 콘텐츠
테마: Light — Refined Minimalism
```

**컬러 토큰**:

| 토큰 | 값 | 용도 |
|------|-----|------|
| Charcoal | #2A2D35 | 본문 텍스트 |
| Graphite | #3D4150 | 부제목, 강조 텍스트 |
| Slate | #5A5F72 | 사이드바 텍스트, 보조 텍스트 |
| Steel | #8B90A0 | 라벨, 비활성 텍스트 |
| Silver | #B8BCC8 | 구분선 hover, 스크롤바 |
| Mist | #E8EAF0 | 구분선, 보더 |
| Cloud | #F3F4F7 | 배경색 |
| Snow | #FAFBFD | 서브 배경 |
| White | #FFFFFF | 카드, 사이드바 배경 |
| Accent | #6366F1 (Indigo) | 브랜드 강조, 버튼, 활성 상태 |
| Success | #10B981 | 완료, 정상, 출근 |
| Warning | #F59E0B | 경고, 미체크, 오늘 날짜 |
| Danger | #EF4444 | 에러, 불량, 지난 날짜 |
| Info | #3B82F6 | 정보 |

**공통 컴포넌트**:

```
Shadow 토큰:
├── shadow-card: 0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)
└── shadow-md: 0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)

Radius 토큰:
├── radius-sm: 6px
├── radius-md: 10px
└── radius-lg: 14px

공통 UI 패턴:
├── Status Bar: 실시간 상태 표시 (초록 dot + 텍스트 + 시간)
├── KPI Cards: 4~5열 그리드, 호버 시 shadow-md + translateY(-1px)
├── Chart Cards: 헤더(제목+서브+탭) + 바디(차트 영역)
├── Filter Bar: 탭 + 드롭다운 + 검색 입력
├── Animation: fadeInUp 0.5s + 딜레이 0.05s 간격
└── 사용자 카드: 아바타(gradient) + 이름 + 역할
```

**사이드바 네비게이션 구조**:

```
Dashboard
├── 공장 대시보드     → 생산 KPI, 라인별 가동률, 일일 생산량
├── 협력사 대시보드   → 출퇴근 현황, 회사별 인원, 작업자 목록
├── 작업 진행현황     → 협력사별 S/N 진행률, 공정별 완료율 (Sprint 18 API 활용)
└── 생산일정         → 주차별 SCR 일정, 공정 파이프라인, 오더 테이블

Analysis
├── 불량 분석 (뱃지: 3) → 가압검사 불량 분포, 부품별 순위, 외주사별 현황, 추이
└── CT 분석            → Task별 IQR 군집도, 전장/검사 공정 시간 분석

Intelligence
├── AI 예측           → (Phase 4 이후) 불량 예측, 생산 예측
└── AI 챗봇           → (Phase 4 이후) 데이터 질의 챗봇

사용자 프로필 (사이드바 하단)
└── 이름, 역할, 설정
```

### 페이지별 컨셉 상세

**1. 공장 대시보드** (`G-AXIS VIEW(공장대시보드).html`)
- 전체 공장 레벨의 생산 KPI 오버뷰
- 실시간 라인 가동 상태, 일일/주간 생산량
- 상단 status bar로 데이터 신선도 표시

**2. 협력사 대시보드** (`G-AXIS VIEW(협력사).html`)
- 협력사별 출퇴근 현황 카드
- 작업자 테이블 (이름, 소속, 출근/퇴근 시간, 상태)
- 회사별 필터링

**3. 생산일정** (`G-AXIS VIEW(생산일정).html`)
- 주차 선택기 (W07 · Feb 10–14)
- KPI 5열: 기구시작 수, 필터 결과, 고객사 수, 모델 수, 총 데이터
- 공정 파이프라인: 기압 → 자주검사 → 공정 → 포장 → 출하 (원형 스텝)
- 범례: 날짜 색상(지난/오늘/예정) + 공정 중복(2/3/4개) + 동일 표시
- 필터바: 오늘공정/이번주/다음주/전체 탭 + 기준/고객사/업체 드롭다운 + 검색
- 테이블: O/N, 제품번호, S/N, 모델, 고객사, 기구~출하 17열

**4. 불량 분석** (`G-AXIS VIEW(불량분석).html`)
- 탭: 가압검사 / 제조품질 / 통합비교 / 주차별 분석
- KPI 4열: 총 불량 건수, 총 검사 CH수, 평균 불량률, 주요 외주사
- 도넛 차트: 부품별 전체 분포 TOP10 + 범례
- 랭킹 리스트: 불량 부품 순위 (바 그래프 + 순위 뱃지)
- SVG 라인 차트: 주요 부품별 월별 불량 추이
- 외주사 카드 3열: 불량률, 건수, 검사CH, 주요 부품, 집중도

**5. CT 분석** (`G-AXIS VIEW(CT분석).html`)
- 필터: 분석기간(단일월/기간합산) + 월 선택 + 모델 선택
- 공정 요약 카드 4열: 기구/전장/검사/기타 (IQR + 평균 시간)
- 범례: IQR 군집도(Indigo) vs 기존 평균(Green)
- 상세 섹션: 전장/검사 공정별 Task 리스트
  - 각 Task: 순위 뱃지 + 이름 + 이중 바(IQR/평균) + 시간값 + 신뢰도 + 차이율
