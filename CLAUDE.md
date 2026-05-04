# AXIS-VIEW — Agent Teams 프로젝트

> 최종 갱신: 2026-05-04 | 버전: v1.41.1
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
현재 21개 페이지, 월 170~200대 생산 규모의 공장 5개 설비 운용 중.

---

## 팀 구성 & 모델 설정

### 리드 에이전트 (Lead — 설계 조율)
- **모델**: Opus 최상위 — **2026-04-21 현재 `claude-opus-4-7`** ⚠️ 신 모델 출시 시 갱신
- **역할**: 전체 아키텍처 설계, 에이전트 간 조율, 코드 리뷰, 의사결정
- **모드**: Delegate 모드 (Shift+Tab) — 리드는 직접 코드 작성하지 않고 조율만 수행
- **권한**: 모든 파일 읽기 가능, 직접 수정은 하지 않음

### 워커 에이전트 (Workers — 구현/테스트)
- **모델**: Sonnet 최상위 — **2026-04-21 현재 `claude-sonnet-4-6`** ⚠️ 신 모델 출시 시 갱신
- **역할**: 담당 영역의 코드 구현
- **모드**: 사용자 승인 후 코드 수정 가능 (위임 모드)

### ⚠️ 모델 버전 관리 규칙 (2026-04-21 추가, 2026-04-24 Codex 섹션 보강)

#### Claude 모델 (Opus 리드 / Sonnet 워커)

- **원칙**: 항상 각 티어의 **최상위 모델** 사용 (Opus = 리드, Sonnet = 워커)
  - 리드는 설계·아키텍처 판단 역할 → 추론 성능 최우선 → Opus 최상위
  - 워커는 대량 구현·테스트 → 처리량·비용 균형 → Sonnet 최상위
  - 하위 모델 사용 금지 (설계 오류·컨텍스트 누락 리스크)
- **업데이트 트리거**: 새 Claude 모델(Opus/Sonnet) 릴리스 감지 시 이 섹션 즉시 갱신
- **세션 시작 체크**: Claude Code / Cowork 시작 시 현재 가용 모델 확인 → CLAUDE.md 기재 버전과 대조 → 신규 있으면 **먼저 갱신 후** 작업 시작
- **갱신 시 업데이트 대상**:
  - `AXIS-VIEW/CLAUDE.md` (이 파일) L33, L39
  - `AXIS-OPS/CLAUDE.md` L10, L16
  - `memory.md`에 ADR 추가 (모델 전환 이유·영향)

#### Codex (외부 교차 검증자) — 2026-04-24 보강

- **원칙**: Codex CLI 기본 모델(= 자동 최신) 유지 — `~/.codex/config.toml` 에 model **pinning 금지**
  - 이유: Codex CLI가 최신 GPT 모델을 자동 수신하도록 설계됨. pinning 시 구 모델 고착 위험
  - 현재 설치: `codex-cli 0.122.0` (2026-04-24 기준)
- **업데이트 트리거**:
  - 주 1회 이상 `brew outdated codex` 수동 확인 (권장: 매주 월요일 Sprint 시작 시)
  - Codex 메이저 업데이트(0.X → 0.Y) 발견 시 즉시 `brew upgrade codex` 후 CLAUDE.md 버전 갱신
  - GPT 신 모델(GPT-5.x 등) 출시 감지 시 Codex CLI가 자동 수신하는지 `codex doctor` 또는 공식 페이지로 확인
- **세션 시작 체크** (Claude 모델 체크와 병행):
  ```bash
  codex --version              # 현재 CLI 버전
  brew outdated codex          # 업데이트 가용 여부
  ```
- **검증 라운드 trail 기록**: `memory.md` ADR 또는 `CROSS_VERIFY_LOG.md` 에 사용 모델·CLI 버전 병기
  - 예: `"2026-04-24 / Codex CLI 0.122.0 / 검증 결과: M=2 A=1"`
- **갱신 시 업데이트 대상**:
  - `AXIS-VIEW/CLAUDE.md` (이 파일) 이 섹션 "현재 설치" 라인
  - `AXIS-OPS/CLAUDE.md` 동일 섹션 (OPS 쪽도 동일 버전 유지)
  - `memory.md` ADR (메이저 업데이트 시)
- **실패 시 fallback**: Codex CLI 업데이트 불가 상황(네트워크·권한)이면 당일 Sprint 교차검증을 Claude Code 자가 리뷰로 대체 + 다음 세션에 Codex 재실행 의무

### 위임 모드 규칙
1. 리드가 작업을 분배하고 워커에게 위임
2. 워커는 코드 변경 전 **반드시 사용자 승인** 필요
3. 파일 소유권 위반 시 즉시 중단
4. 스프린트 단위로 작업 진행

---

## AI 검증 워크플로우 (Claude-Codex 교차 검증, 2026-04-21 개정 v2)

### 3주체 용어 정의

- **Claude Cowork**: Claude 기반 설계 환경 (대화형 설계 초안 md 산출)
- **Claude Code**: Claude 기반 로컬 CLI (로컬 맥락 접근 + 코드 구현)
- **Codex**: 외부 독립 모델 (Claude 견해 편향 제거용 교차 검증자)

### 스프린트 파이프라인 (9단계 · ⑦.5 사용자 승인 게이트 포함)

```
① Claude Cowork → 설계 초안 md 작성 (VIEW_FE_Request.md)

② Claude Code (Opus Lead) → 1차 리뷰 + 쟁점 압축
   · 로컬 맥락(CLAUDE.md / memory / handoff) 대조
   · 사소한 이슈(오타·서식·설계서 문구만)는 설계서 내 직접 수정
   · ⚠️ 설계서의 **API 응답 필드·타입 정의·조건 로직·숫자 임계값** 변경은 "사소함" 불인정 → 사용자 승인 필수
   · ⚠️ 코드 수정은 ⑥ 구현 단계 전까지 금지 (사용자 승인 필수)
   · 중대 쟁점만 Codex용 프롬프트 생성
   · Codex 프롬프트에 관련 ADR/원칙 원문 인용 첨부 (맥락 보완)

③ /codex:review → 압축 프롬프트 전달 → Codex 독립 검증 + M/A 라벨

④ Claude Code → Codex 지적 대조 (1라운드 상한)
   · 수용/반박 의견 설계서 기록
   · Codex 응답이 침묵 승인(예: "LGTM", "문제 없음" 류 한 줄 답변)이면
     → 자동 재질문 ("구체적으로 검토한 부분과 잠재 리스크 재답변")
   · ⚠️ 구체성 부족으로 인한 자동 재질문은 라운드 카운트 제외
     (실질적 쟁점 교환이 아닌 "응답 품질 보강"이므로 1라운드 상한 무관)
   · ⚠️ Claude가 Codex 지적을 **즉시 수용(1라운드 내)**하는 경우에도
     "Claude 원안의 약점" 을 설계서에 한 줄 기록 — 맹목 동조 방지, 사후 trail 확보

⑤ 합의 분기
   · 합의 M(Must) → 구현 전 필수 해결
   · 합의 A(Advisory) → BACKLOG 등록 (기본 🟡 LOW, Must 강등 시 🟠 MEDIUM 병기)
   · **M→A 재라벨 정상 경로**: Claude-Codex 2자 합의로만 가능. Claude 단독 강등 금지
   · 합의 실패 정의: Codex 반박 1회 + Claude 재반박 1회 후에도 불일치
     → 사용자 최종 판정 (M 유지 / A 강등 / 기각)

⑥ 확정 설계서 → 구현 (이 단계부터 코드 수정 허용)

⑦ 빌드·테스트 GREEN 확인
   · FE: `npm run build` (빌드 GREEN) + `vitest --run` (회귀 GREEN)
   · 타입 에러·import 누락 확인
   · 번들 크기 기준:
     - 일반 Sprint (기능 추가): **±10%** 허용, 10% 초과 시 설계서에 증가 근거 명시
     - 리팩토링 Sprint: **±5%** (기능 변경 없음 전제)
   · 실패 항목 → Codex 합의 후 수정 → 재실행 (전건 GREEN까지 반복)

   ⚠️ **실패 발견 시 강제 절차 (2026-04-30 추가 — OPS 표준 차용, 4-22 HOTFIX-ALERT-SCHEDULER-DELIVERY 위반 사례 반영)**:
   a. Claude 단독 "범위 외 판단" **절대 금지**
      — "본 Sprint 와 무관해 보여" / "결과적으로 맞을 것 같아" 휴리스틱 배제
   b. 실패 정보 정리 (필수):
      - 빌드 에러 / vitest fail 파일:라인 + 실패 메시지 전문
      - 본 Sprint 수정 파일 목록 + 실패 테스트가 참조하는 컴포넌트/훅 경로
      - import 체인 / 컴포넌트 트리 / props 흐름 분석 1줄
   c. Codex 쿼리 구성 → `/codex:rescue` 또는 이관 프롬프트로 전달
   d. Codex M/A 라벨 수신 후에만 조치:
      - M(Must) → 본 Sprint 에 포함 or 선행 fix Sprint 분리
      - A(Advisory) → BACKLOG 이관 (이관 trail 을 설계서 § Codex 합의 기록 에 추가)
   e. 판정 trail 은 설계서 § Codex 합의 기록 에 1줄 기록 (위반 방지)

   > 이 강제 절차는 AI 검증 워크플로우 침묵 승인 거부 ④ 와 Codex 독립 ③ 의 실패 경로 특화 버전.
   > "결과적으로 맞을 것 같다" 는 판단이 실제로 맞더라도 절차 위반이며, 사후 Codex 재검토 대상.
   > OPS 측 동일 절차 (`AXIS-OPS/CLAUDE.md` ⑦ 섹션) 와 cross-repo 일관성 유지.

⑦.5 사용자 배포 승인 (Twin파파)
   · 빌드·테스트 GREEN ≠ 자동 배포. Netlify preview 실기기 검증 완료 후 Twin파파의 명시적 "배포 OK" 승인 필수
   · HOTFIX S1 제외 (🚨 긴급 HOTFIX 예외 조항 참조)

⑧ 머지/배포 (Netlify preview 실기기 검증 → prod)
```

### ⑦ FE 회귀 테스트 규칙 (Vitest = FE 쪽 pytest)

> 기존 "테스트 있으면" 조건부 표현 대신 명시적 규칙으로 강제력 확보.
> 현재 VIEW 테스트 2개 파일 상태 → 점진적 도입.

- **실행**: `npm run test --run` — Sprint 후 GREEN 필수
- **점진적 커버 영역** (신규/변경 시 테스트 동반 필수):
  - `utils/*` — 공통 유틸 (formatDate, validation 등)
  - `hooks/*` — TanStack Query 훅
  - API 응답 매핑 로직 (`api/*.ts`의 변환 함수)
  - 핵심 로직 페이지 (생산실적·체크리스트 등)
- **변경 파일 동반 규칙**: 해당 파일에 기존 테스트가 있으면 수정, 없으면 추가
- **실패 → Codex 합의 수정** (상위 ⑦ 빌드·테스트 Codex 합의 규칙과 동일 — 본 문서 ⑦ 단계 참조)
- **커버리지 감소 시** 설계서에 근거 명시 (예: "테스트 파일 삭제는 대상 컴포넌트 제거 때문")
- **단계적 목표**:
  - 1단계 (지금~3개월): 신규/변경 파일 100% 테스트 동반
  - 2단계 (3~6개월): `utils/*` + 핵심 훅 전수 커버
  - 3단계 (APS 연동 전): 핵심 로직 페이지 smoke test 전수 커버

### ② 단계 Codex 이관 자동 체크리스트

> Opus가 "사소함"으로 분류해서 Codex로 안 넘기는 누락 편향을 방지.
> 아래 6가지 중 **1개라도 해당**되면 **자동 Codex 이관** (Opus 재량 제외).

- [ ] AXIS-OPS BE API 응답 계약 변경 동반 (OPS_API_REQUESTS.md 신규 등록)
- [ ] 타입 정의 변경 (types/**)
- [ ] 인증·권한·ProtectedRoute 로직 변경
- [ ] 전역 상태·TanStack Query 훅 구조 변경
- [ ] 3개 이상 페이지/컴포넌트 touch
- [ ] 클린 코어 데이터 원칙 영향 여부 (강제종료 표시·duration·force_closed 관련)
      → 원칙 전문: `~/Desktop/GST/AXIS-OPS/BACKLOG.md` 📐 설계 원칙 § 클린 코어 데이터 원칙 (2026-04-20)

> ⚠️ **판정 애매 시 = 자동 이관 (의심 시 포함)**: 위 6항목 중 "영향 여부 판정이 주관적으로 갈릴 여지"가 보이면 Opus는 이관 쪽으로 판단. 원래 막으려던 "사소함 편향" 재발 방지용.
> **"touch" 정의**: 신규 파일 · 테스트 파일 · 3줄 이상 code 변경 파일 모두 포함. comment-only / 서식만 변경 / CSS 클래스명만 변경은 제외.

### 핵심 규칙 7가지

1. **설계서 선행** — 코드 작성 전 반드시 md 설계서 완료
2. **설계 단계 교차 검증** — 구현 전 검증으로 재작업 방지
3. **합의 기반 보정** — 맹목 수용 금지, 근거 없는 반박도 금지
4. **Opus 1차 리뷰** — 쟁점 압축으로 Codex 응답 시간 단축
5. **M/A 라벨링 = Codex 독립** — Claude 편향 제거
6. **라운드 상한 1회** — 핑퐁 방지, 합의 실패는 즉시 사용자 에스컬레이션
7. **빌드·테스트 실패 → Codex 합의 후 수정** — `npm run build` / `vitest` / 실기기 검증 전부 동일

### 🚨 긴급 HOTFIX 예외 조항

> 프로덕션 장애 시 정식 파이프라인 skip 허용. 사후 검토 필수 (Google SRE Book / Microsoft SDL 관례 준수).

| Severity | 조건 | 프로세스 | 사후 조치 |
|---|---|---|---|
| **S1** 🚨 | 전체 VIEW 장애 (로그인 불가·모든 페이지 crash·CSP 오류 등) | **Codex만 skip** (Opus 자가 리뷰 필수: 로컬 맥락 대조 + 회귀 영향 1분 스캔) → 즉시 패치 배포 | **24h 이내** 사후 Codex 검토 + BACKLOG `POST-REVIEW-{HOTFIX-ID}` 등록 |
| **S2** 🟠 | 부분 장애 (특정 페이지 crash·핵심 기능 오동작) | Opus 단독 리뷰 → 배포 | **7일 이내** 또는 다음 Sprint 시작 전 중 이른 시점 Codex 검토 필수 + BACKLOG `POST-REVIEW-{HOTFIX-ID}` 등록 |
| **S3~** | 일반 버그·UX 이슈 | 정상 파이프라인 | — |

**판정 기준**: S1/S2 여부는 Twin파파 단독 판정. 애매하면 S2로 처리 (보수적).

### 우선순위 라벨 (4단계)

- 🔴 **HIGH** — 배포 블로커 / 실데이터 장애 / 보안 이슈 (즉시 패치)
- 🟠 **MEDIUM** — 다음 Sprint 내 해결 (기능 제약 있으나 우회 가능)
- 🟡 **LOW** — BACKLOG, 여유 Sprint에 소화
- 🟢 **INFO** — 변경 요청 아님, 참고/기록용

### 교차 검증 원칙

- **전수 검증**: 설계서 전체를 코드/기존 시스템과 대조 — 특정 항목만 체크하지 않음
- **맹목 수용 금지**: 지적 사항은 Claude와 대조하여 합의된 항목만 반영
- **M/A 분류**: Codex 지적은 M(Must fix), A(Advisory) 로 구분하여 공유
- **침묵 승인 거부**: Codex가 구체성 없는 OK 응답 시 자동 재질문
- **BE API 의존**: AXIS-OPS BE API 변경 시 타입/인터페이스 동기화 확인 (OPS_API_REQUESTS.md에 동시 반영)

### 재검토 조건 (이 플로우는 완벽하지 않음)

다음 조건 중 하나라도 충족 시 워크플로우 재개정:

1. Codex가 로컬 파일 직접 접근 가능해지면 → ② 쟁점 압축 단계 단순화
2. 제3의 독립 모델 도입 시 → 3자 검증 도입 검토
3. 실제 합의 실패율 20%+ 관찰 시 → 라운드 상한 2회로 완화 검토
   - **측정 정의**: 합의 실패율 = (사용자 판정 에스컬레이션 건수) / (Codex 검증 완료 설계서 수)
   - **trail 기록 위치**: `memory.md` 또는 별도 `CROSS_VERIFY_LOG.md` 에 Sprint별 누적 기록

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
│   │   ├── pages/            (21개 페이지)
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
│   │   ├── api/              API 클라이언트 13개
│   │   ├── hooks/            TanStack Query 훅 22파일 / 41함수
│   │   ├── types/            TypeScript 타입 7개
│   │   ├── version.ts        v1.41.1 (2026-05-04)
│   │   └── index.css         G-AXIS Design System CSS
│   ├── package.json
│   └── netlify.toml
│
├── etl/                      ← 데이터 파이프라인 (Python)
│   └── defect/               불량 ETL + migration + tests
│
└── docs/                     ← 설계 문서
    ├── AXIS_VIEW_ROADMAP.md       전체 로드맵
    ├── OPS_API_REQUESTS.md        BE API 요청사항 (#1~#62)
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
- BE 요청 우선순위 (4단계):
  - 🔴 **HIGH** — 배포 블로커 / 실데이터 연동 실패 / 보안·인증 이슈 (즉시 패치)
  - 🟠 **MEDIUM** — 다음 Sprint 내 해결 목표 (기능 제약 있으나 우회 가능)
  - 🟡 **LOW** — BACKLOG 등록, 여유 Sprint에 소화 (UX 개선·중복 제거 등)
  - 🟢 **INFO** — 변경 요청 아님, 참고/기록용 (스펙 확인, 추후 검토 대상)

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

## 📏 코드 크기 원칙 (2026-04-21 확정)

> **배경**: 2026-03-22 AXIS SYSTEM 점검 보고서에서 AttendancePage 700+ LOC, ChartSection 700+ LOC를 "God 컴포넌트"로 지적. 현재 ProductionPerformancePage 895줄, QrManagementPage 814줄로 기준 초과. 업계 표준(ESLint 300 / Airbnb 300 / React 공식 300) 기준으로 GST 현실에 맞춰 단계적 도입.

### 파일당 최대 LOC (단계적 도입)

| 단계 | 적용 시점 | 🟡 경고 (리팩토링 계획 수립) | 🔴 필수 분할 | ⛔ God File |
|---|---|---|---|---|
| **1단계 (현재)** | 2026-04-21 ~ | **500줄** | **800줄** | **1200줄** |
| 2단계 | APS Lite 연동 전 (~2026 Q3) | 400줄 | 600줄 | 1000줄 |
| 3단계 (업계 표준) | APS Lite 연동 후 | 300줄 | 500줄 | 800줄 |

### 함수·컴포넌트 (1단계부터 엄격 적용)

- 함수 1개: **60줄 이하** (권장 30줄, 절대 한도 100줄)
- 컴포넌트 1개 JSX return: **100줄 이하** (넘으면 하위 컴포넌트 분해)
- Custom Hook 1개: **80줄 이하**
- 매개변수/props: **4개 이하** (5개 이상 → interface로 묶기)
- 순환 복잡도 (Cyclomatic): **≤ 10**
- 중첩 깊이: **≤ 3단계** (JSX 중첩은 5단계까지 허용)

### 적용 규칙

- 🟡 경고 임계 초과 시: Sprint 시작 전 BACKLOG에 `REFACTOR-{파일명}` 등록
- 🔴 필수 분할 파일: **새 로직 추가 금지** → 분할 Sprint 선행 필수
- ⛔ God File: 즉시 BACKLOG 최상단 + 분할 Sprint 우선순위 🔴 HIGH
- 예외: 자동 생성 파일(`version.ts`, 타입 정의), 테스트 파일(`*.test.ts`, `*.spec.tsx`)

### 측정 명령어 (Sprint 시작 전 체크 필수)

```bash
# 대상 파일 Top 10
cd app && find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -10

# ESLint max-lines 검사 (package.json에 추가 권장)
# "rules": { "max-lines": ["warn", 500], "max-lines-per-function": ["warn", 60] }
```

---

## 🔄 재활용 원칙 — DRY (Don't Repeat Yourself)

> **배경**: REFACTOR-FMT-01에서 `formatDateTime` 중복 2건 발견 후 `utils/format.ts` 승격으로 해결. `formatDate`는 여전히 QrManagementPage / InactiveWorkersPage 2곳에 중복(BACKLOG). 재활용은 Line 수를 **줄이지 절대 늘리지 않음**.

### 코드 작성 전 필수 절차 (모든 Sprint 공통)

```
① 새 컴포넌트/훅/유틸 작성 전 → 기존 구현 존재 여부 grep 검색 필수
   → 유사 로직 발견 시: 재활용 또는 공통 유틸로 승격

② Rule of Three (3의 법칙)
   - 같은 로직 2곳 반복: 의식적 선택 (용인 or 승격)
   - 같은 로직 3곳 이상: 무조건 공통화 (Sprint 선행)

③ 승격 위치 (VIEW)
   - 범용 유틸: src/utils/ (format.ts, validation.ts, date.ts)
   - 공통 훅: src/hooks/ (TanStack Query 훅은 여기로 통일)
   - 재사용 UI: src/components/ui/ (shadcn 계열)
   - 도메인 컴포넌트: src/components/{domain}/
```

### 검색 명령어 (Sprint 시작 전)

```bash
# 유사 함수 검색 예시
cd app && grep -rn "formatDate\|format_date" src/
cd app && grep -rn "const use[A-Z]" src/hooks/

# 공통 유틸 현황
ls app/src/utils/
ls app/src/hooks/
ls app/src/components/ui/
```

### 중복 발견 시 BACKLOG 등록 규칙

- 2곳 중복: `REFACTOR-{함수명}` Advisory 등록 (낮은 우선순위)
- 3곳+ 중복: Sprint 선행 (신규 기능보다 우선)

### 🚫 금지 패턴

- ❌ 비슷한 컴포넌트를 복사+수정 (예: `UserCard` → `UserCardSmall` → `UserCardWithBadge`)
- ❌ 컴포넌트 내부 private 유틸 방치 (다른 컴포넌트에서도 또 만들게 됨)
- ❌ "일단 구현하고 나중에 공통화" (나중은 안 옴)
- ❌ TanStack Query 훅 복제 (api.ts 클라이언트 함수 재사용)

### ✅ 권장 패턴

- 공통 유틸 먼저 검색 → 없으면 `utils/`에 **먼저 만들고** → import 호출
- Props variant로 변형 흡수 (`<Badge variant="success" />`, `formatDate(d, { withTime, fallback })`)
- Custom Hook 재활용 (예: `useSNProgress`를 SNStatusPage·ProductionStatus 등에서 동일 import)
- BE 응답 변환 로직은 api/{domain}.ts에 한 번만 (ADR-V010 패턴)

### GST 기존 참조 사례

- ✅ REFACTOR-FMT-01: `ChecklistReportView.tsx` 로컬 `formatDateTime` → `utils/format.ts` 승격 (v1.32.0)
- ✅ ADR-V013: `categories` 배열 확장 패턴 — CategoryTable에서 `phase_label` 한 줄로 자동 적용 → BE가 필드 추가하면 FE 수정 0
- ✅ ADR-V010: 체크리스트 성적서 BE 필드 매핑 보정 — `getChecklistReport()` 응답 후처리 한 곳에만, 컴포넌트에서 중복 변환 X

---

## 🛡️ 리팩토링 안전 규칙 (Regression 방지 7원칙)

> **배경**: ProductionPerformancePage 895줄, QrManagementPage 814줄 등 God Component 다수. BE API 의존 때문에 Regression 리스크 최대. 안전장치 7원칙 필수 준수.

### 7원칙 (리팩토링 Sprint는 일반 Sprint와 규칙이 다름)

```
1. 빌드/테스트 GREEN 선행
   - 대상 파일의 `npm run build` GREEN 확인
   - vitest 테스트가 있다면 전부 PASS 확인
   - Sprint 28 이상 페이지: 최소 수동 회귀 시나리오 문서화

2. 기능 변경 절대 금지
   - 리팩토링 Sprint = "UI/UX·동작 100% 동일, 구조만 변경"
   - 버그 수정·기능 추가·스타일 변경과 같은 커밋에 섞지 않기
   - 커밋 메시지 prefix: [REFACTOR] 필수

3. 작은 단위로 쪼개기
   - 900줄+ 파일을 한 번에 4개로 쪼개지 않기
   - 한 Sprint당 이동 줄 수 상한: 400줄
   - 점진적 분할 (예: Custom Hook 추출 → 하위 컴포넌트 분해 → CSS 분리)

4. Before/After 빌드·동작 증명
   - Before: `npm run build` 결과 (modules 수, 번들 크기, build time)
   - After: 동일 결과 **±5% 이내** (리팩토링 Sprint 전용 기준 — 기능 변경 없음 전제)
   - ⚠️ 일반 기능 Sprint는 ±10%가 기본 기준 (⑦ 단계 참조)
   - Netlify preview URL로 실기기/태블릿 수동 테스트
   - Sprint PR에 명시 필수: "Before: 3279 modules 2.96s → After: 동일, 회귀 0"

5. Claude×Codex 교차검증 필수 (1순위 대상)
   - 리팩토링은 교차검증 대상 1순위 (기능 변경보다 엄격)
   - Codex M(Must) 지적 전부 해결 후 머지
   - 설계서 = diff 계획서 (이동 줄 수, 새 파일 경로, import 변경 목록)

6. 단계적 배포 (Netlify Preview → Prod)
   - PR 머지 전 Netlify preview URL 생성 → 실기기 검증
   - 핵심 경로(로그인·생산현황·체크리스트) 수동 클릭 테스트
   - GREEN 확인 후에만 prod 머지

7. 롤백 플랜 사전 준비
   - git 태그 `pre-refactor-{sprint}` 먼저 생성
   - Netlify 이전 배포 rollback 1클릭 가능
   - BE API 변경 금지 (VIEW 리팩토링은 FE only)
```

### 리팩토링 Sprint 체크리스트 (PR 머지 전 필수)

- [ ] 대상 파일 `npm run build` GREEN (Before)
- [ ] 리팩토링 완료 후 동일 빌드 GREEN (After)
- [ ] modules 수·번들 크기 ±5% 이내
- [ ] `[REFACTOR]` 커밋 prefix 적용
- [ ] Netlify preview URL 실기기 검증 완료
- [ ] git 태그 `pre-refactor-{sprint}` 생성됨
- [ ] Codex 교차검증 M 해결됨
- [ ] BACKLOG 해당 REFACTOR 항목 체크

### 상세 리팩토링 계획

→ **`BACKLOG.md` 🔧 리팩토링 Sprint 계획 섹션 참조** (파일별·단계별 Sprint 일정)

---

## 버전 관리 기준 (Semantic Versioning, 2026-04-21 확정)

### 버전 형식: `MAJOR.MINOR.PATCH`

| 구분 | 올리는 시점 | AXIS-VIEW 실정 예시 |
|------|-----------|---------------------|
| **MAJOR** (X.0.0) | 아키텍처 전환 (BE 교체·SAP 연동·디자인 시스템 전면 개편) | v1→v2: OPS BE→사내서버 전환, SAP RFC 연동 |
| **MINOR** (0.X.0) | Sprint 단위 기능 추가 (신규 페이지·훅·API 연동, 하위 호환 유지) | v1.33→v1.34: Sprint 35 신규 페이지 |
| **PATCH** (0.0.X) | HOTFIX·용어 정합·데드 코드 정리·버그 수정 (기능 변경 없음) | v1.32.2→v1.32.3: 툴팁 문구 정정 |

**릴리스 시 동시 업데이트 필수 (3곳)**:
1. `app/src/version.ts` (VERSION 상수)
2. `CHANGELOG.md` (변경 요약)
3. `git tag v{X.Y.Z}` (Netlify 배포 시점 고정)

---

## 페이지 구성 (21개, v1.33.0 기준)

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

## API 클라이언트 (13개)

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

## 훅 (22파일 / 41함수 — TanStack Query 기반)

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
| useForceClose | 미종료 task 강제종료 mutation (Sprint 33) | — |
| useGetTasksByOrder | 같은 O/N Tank Module task 일괄 조회 (Sprint 40, P2 다중 카테고리) | 30초 |
| useStartTask | Tank Module 단일 시작 mutation (Sprint 40, Optimistic+retry) | — |
| useCompleteTask | Tank Module 단일 종료 mutation (Sprint 40, Optimistic+retry) | — |
| useStartTaskBatch | Tank Module 일괄 시작 mutation (Sprint 40, allSettled fallback) | — |
| useCompleteTaskBatch | Tank Module 일괄 종료 mutation (Sprint 40, allSettled fallback) | — |
| useEscapeKey | ESC 키 closure 훅 (Sprint 40, 모달 재사용) | — |
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
| `DESIGN_FIX_SPRINT.md` | Sprint 1~30 메인 스프린트 문서 | 필수 |
| `OPS_API_REQUESTS.md` | BE API 요청/이슈 (#1~#62) | 필수 |
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
| 34 | S/N 상세뷰·O/N 헤더 정보 보강 — FE-20(카테고리 담당 회사명) + FE-21(고객사 line) BE FIX-25 v4 연동 (v1.33.0) | ✅ 완료 |
| 35 Phase 1 | 공장 대시보드 KPI 주간/월간 스와이프 덱 — KpiSwipeDeck/KpiCard/ProductionChart 추출 + β'안 완료율 + pipeline.shipped→shipped_count + v1.34.6 transform 재설계 (v1.34.0~v1.34.6) | ✅ 완료 |
| 35 Phase 2 | BE Sprint 62-BE v2.2 연동 — TEMP-HARDCODE 3개 제거 + 출하 3필드(plan/actual/ops) + 월간 date_field 토글 + FactoryDashboardSettingsPanel (v1.35.0, 2026-04-23 배포) | ✅ 완료 |
| 62-BE v2.3 교정 | weekly-kpi WHERE 절 `ship_plan_date` → `finishing_plan_end` 원안 복원 — FE v2 실수 정정 (BE 1줄 교정, FE 코드 변경 없음, OPS_API_REQUESTS #62 v2.3 AMENDED) | 🟡 OPS 작업 대기 |
| HOTFIX v1.35.1 | 공장 대시보드 "출하예정" 컬럼 매핑 정정 — `FactoryDashboardPage.tsx:446` `finishing_plan_end` → `ship_plan_date` (라벨·필드 의미 정합성 복원, v1.7.0 이후 누적된 불일치, 2026-04-24) | ✅ 완료 |
| 62-BE v2.4 AMENDED | shipped_plan AND 조건 교정 (si_completed → actual OR si_shipment) + shipped_best 신설 (해석 A: si⊆actual) + shipped_ops 폐기 + FE 토글 3옵션(plan/actual/best) 재설계 (OPS_API_REQUESTS #62 v2.4 AMENDED, 2026-04-24) | 🟡 OPS 작업 대기 |
| SI-BACKFILL-01 | app si_shipment → Teams Excel 역방향 backfill cron 스크립트 (Graph API) — 단계적 구조: Phase 0(현재)→Phase 1(스크립트)→Phase 2(생산관리 플랫폼)→Phase 3(SAP API GW). "생산관리 플랫폼 선행" 블로커 대기 (BACKLOG.md 🟡 LOW) | 🟡 대기 |
| Sprint 36 (FE) | BE v2.4 배포 후 FE 3옵션 토글 교체 — `api/factory.ts` ShippedBasis 타입 변경 + pickShipped() best 분기 + FactoryDashboardSettingsPanel 라디오 라벨 갱신. 안전 degrade 설계 (BE 배포 전 undefined 처리) | 🟡 BE v2.4 대기 |
| HOTFIX v1.35.2 | 체크리스트 관리 페이지 협력사(비-GST) 읽기 전용 — `canEdit = is_admin \|\| company==='GST'` 게이트 (추가·편집·토글·설정 차단 + 툴팁) (ChecklistManagePage + ChecklistTable, 2026-04-25) | ✅ 완료 |
| Sprint 37 (v1.36.0) | S/N 작업 현황 O/N 그룹 카드 인라인 토글 — 다대(2대+) 헤더 클릭 펼침/접힘 + 검색·상세 자동 펼침(`lastProcessedSearchRef` race 방지) + stale key cleanup. BE 의존 0, `SNStatusPage.tsx` 단일 파일 319→424 LOC, Codex 1차 4건 + 2차 1건 전건 반영, 2026-04-27 | ✅ 완료 |
| UX 일관성 v1.36.1 | O/N 그룹 토글 통일 — 단대/다대 분기 제거. salesOrder 있는 모든 그룹 동일하게 클릭 토글 (`multi → hasHeader`). Sprint 37 운영 피드백 반영, 424→421 LOC, 2026-04-27 | ✅ 완료 |
| REF-V-00-UTIL v1.36.2 | `formatDate` 공통 유틸 승격 (REFACTOR-FMT-01 완성) — `utils/format.ts` 에 fallback 인자 + invalid Date 가드 통합. QrManagementPage / InactiveWorkersPage 로컬 함수 2건 제거. 사용자 화면 변화 0 (순수 내부 정리), 2026-04-27 | ✅ 완료 |
| Sprint 36 (v1.37.0) | 출하 토글 3옵션 재구조 (BE Sprint 62-BE v2.4 대응) — `ShippedBasis` 타입 `ops → best` 교체, `shipped_best` 응답 필드 추가, `shipped_ops` 폐기 표시. SettingsPanel 라디오 라벨 '실시간(ops)' → '종합(best)'. localStorage 마이그레이션. 안전 degrade — BE v2.4 미배포 동안 'best' 선택 시 '—' 표시, 2026-04-28 | ✅ FE 완료 (BE v2.4 대기 중) |
| Sprint 38 (v1.38.0) | S/N 작업 현황 진행 중 모델별 카운트 칩 + 미니 진행 바 — `InProgressModelChips.tsx` 신규 추출 (86 LOC). `modelFilter` 별도 state (Codex M1: 정확매칭, search 부분매칭과 분리). Effect 4 자동 펼침 (Sprint 37 패턴). CLS 완화 minHeight, 모델 키 정규화 trim, aria 강화. SNStatusPage 421→485 LOC (🟢 OK), 2026-04-30 | ✅ 완료 |
| Sprint 40 (v1.40.0) | TM Tank Module 시작/종료 admin 액션 + O/N 일괄 토스트 — SNDetailPanel inline 버튼 (▶/■). P2 화이트리스트 (TMS+MECH) — GAIA/iVAS + DRAGON/SWS/GALLANT 자동 흡수. `useGetTasksByOrder` query hook + 4 mutation hook (Optimistic + retry: 1) + `useEscapeKey/DialogActions/ParallelConfirmDialog` 신규. `utils.ts` 카테고리별 회사 매핑 (M6 c-3 NULL 경고). BE Sprint 64-BE 미배포 시 `Promise.allSettled` fallback. Codex 1·2·3·4·5차 47건 전건 반영, ~609 LOC, 2026-05-04 | 🟡 FE 완료 (BE Sprint 64-BE 대기) |
| Sprint 39 (v1.41.0) | MECH 체크리스트 VIEW 연동 — OPS Sprint 63-BE BE 인프라 (migration 051+051a v2, check_mech_completion, routes/checklist.py MECH 분기) 활용. 5 파일 변경: BLUR_CATEGORIES MECH 제거 (ChecklistManagePage + ChecklistFilterBar), TYPE_OPTIONS.MECH SELECT 추가, isMech 분기 (payload + 토글 렌더 JSX), MECH_GROUP_DEFAULTS 8 그룹 자동 추론, 라벨 일반화 ("1차 입력 적용" / "QI 검사 필요"). EditModal/Table 도 MECH 분기 (UX 대칭). Sprint 32 ELEC 패턴 재활용 (DRY). Codex 1·2·3차 19건 전건 반영, ~50 LOC, 2026-05-04 | 🟡 FE 완료 (BE Sprint 63-BE 배포 대기) |
| Sprint 39 후속 (v1.41.1) | MECH COMMON product 자동 매핑 + UX 일관성 — `COMMON_CATEGORIES = ['TM', 'ELEC', 'MECH']` 상수 신설. `effectiveProduct` 자동 'COMMON' 매핑 (BE migration 051a v2 시드 데이터 정상 조회 보장). `hideProductDropdown` 도 동일 상수 사용 (MECH 도 dropdown 숨김, UX 일관성). v1.41.0 push 직후 사용자 후속 보강, 2026-05-04 | ✅ 완료 |

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
