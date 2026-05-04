# 📋 VIEW Weekly Plan — 2026-05-04 주 (월~금)

> OPS에 집중하느라 VIEW 컨텍스트 떠있을 때 10초 만에 복구용.
> "지금 어디까지 와있고 / 뭐가 남았는지" 만 본다. 상세는 BACKLOG·handoff·CHANGELOG에서.
>
> 마지막 업데이트: 2026-05-04 (월) — Cowork 자동 생성 후 **Sprint 39 (v1.41.0) 완료 반영 갱신**. 지난 주 회고는 WEEKLY_PLAN_20260427.md 참고.

---

## 🧭 한눈에 (현재 상태, 2026-05-04)

```
현재 버전 : v1.41.0 (Sprint 39 FE 완료 — main pushed / BE Sprint 63-BE 배포 대기)
최근 작업 : Sprint 39 — MECH 체크리스트 VIEW 연동 (Codex 1·2·3차 19건 전건 반영, 2026-05-04 push)
이전 트랙 : Sprint 40 (v1.40.0, 2026-05-04) Tank Module + Sprint 38 (v1.38.0) 모델 칩 + BE v2.4 deployed
진행 중   : Sprint 39 BE Sprint 63-BE 배포 + Sprint 40 BE Sprint 64-BE 배포 + Netlify preview 실기기 검증
대기 중   : BE Sprint 63-BE (MECH 체크리스트 인프라) + BE Sprint 64-BE (Tank Module batch 3 endpoint)
```

→ **이번 주 폭발적 시작**: 월요일에 Sprint 39 + Sprint 40 양 트랙 FE 완료 + main push. 핵심 트랙: ① BE Sprint 63-BE / 64-BE 배포 추적 / ② Netlify preview 실기기 검증 (Sprint 39 + 40 동시) / ③ Sprint 40 사전 점검 SQL / ④ 잠재 트랙 (BUG-V2 / AnalyticsDashboardPage / REF-V-01).

---

## ✅ 최근 완료 (지난 2주, 2026-04-21 ~ 2026-05-04)

> "내가 OPS 들어가있는 동안 VIEW에 뭐가 쌓였지?" 답.

| 일자 | 항목 | 의미 |
|:---:|:---|:---|
| 05-04 | **v1.41.0 Sprint 39** MECH 체크리스트 VIEW 연동 | OPS Sprint 63-BE BE 인프라 활용 — `/checklist` 페이지 MECH 카테고리 블러 해제 + 카테고리 탭 잠금 해제 (두 파일 동시: ChecklistManagePage + ChecklistFilterBar). 항목 추가/수정 모달 MECH 분기 (CHECK/INPUT/SELECT 3종 + phase1_applicable 토글). MECH_GROUP_DEFAULTS 8 그룹 자동 추론 (INLET/GN2/CDA/LNG/O2/BCW/PCW-S/PCW-R). 라벨 카테고리 무관 일반화 ("1차 입력 적용" / "QI 검사 필요"). EditModal/Table 도 MECH 분기 (UX 대칭). 5 파일 / ~50 LOC, Sprint 32 ELEC 패턴 재활용 (DRY). 빌드 3293 modules 2.33s + vitest 30/30 GREEN. **Codex 1·2·3차 19건 전건 반영** (M 4 / A 8 / I 7) |
| 05-04 | **v1.40.0 Sprint 40** TM Tank Module 시작/종료 admin 액션 + O/N 일괄 토스트 | SNDetailPanel 카테고리 카드 아래 inline `[▶ 시작] / [■ 종료]`. P2 화이트리스트 (TMS+MECH) GAIA/iVAS + DRAGON/SWS/GALLANT 자동 흡수. 신규 9파일 (utils/Dialog 2개/hook 6개) + 수정 5파일 (types +2 / api +85 / Panel +135 / Page +5 / version). ~609 LOC, 빌드 3293 modules 2.26s + vitest 30/30 GREEN. **Codex 1·2·3·4·5차 47건 전건 반영** (M 18 / A 23 / I 13 누적 55건 중 정정 47 + 보존 8). BE Sprint 64-BE 미배포 시 `Promise.allSettled` fallback (안전 degrade). 결정 #5 manager 본인 worker_id 기록 정책 + 결정 #9 c-3 NULL 경고 ADR-V014 신설, P2 화이트리스트 ADR-V015 신설 |
| 04-30 | **v1.38.0 Sprint 38** S/N 작업 현황 진행 중 모델별 카운트 칩 + 미니 진행 바 | `InProgressModelChips.tsx` 신규 추출. `modelFilter` 별도 state (Codex M1 정확매칭). Effect 4 자동 펼침 (Sprint 37 패턴). CLS 완화 + 모델 키 정규화 + aria 강화. SNStatusPage 421→485 LOC |
| 04-28 | **v1.37.0 Sprint 36** 출하 토글 3옵션 재구조 | `ShippedBasis` `ops → best`, `shipped_best` 응답 필드 추가, 라디오 라벨 '실시간(ops)' → '종합(best)', localStorage 마이그레이션. BE v2.4 대기 중 safe degrade ('—' 표시) |
| 04-27 | **v1.36.2 REF-V-00-UTIL** formatDate 공통 유틸 승격 | `utils/format.ts` 에 fallback 인자 + invalid Date 가드 통합. QR/Inactive 로컬 함수 2건 제거. 사용자 화면 변화 0, REFACTOR-FMT-01 완성 |
| 04-27 | **v1.36.1 UX 일관성** O/N 그룹 토글 단대/다대 통일 | `multi → hasHeader` 분기 변경. 1대 그룹도 클릭 토글 적용. Sprint 37 운영 피드백 즉시 반영, 424→421 LOC |
| 04-27 | **v1.36.0 Sprint 37** S/N O/N 그룹 카드 인라인 토글 | 다대 그룹 헤더 클릭 펼침/접힘 + 검색·상세 자동 펼침(race 방지) + stale key cleanup. BE 의존 0, `SNStatusPage.tsx` 단일 파일 319→424 LOC. Codex 1+2차 5건 전건 반영 |
| 04-25 | **v1.35.2 HOTFIX** 체크리스트 관리 협력사 읽기 전용 | `canEdit = is_admin \|\| company==='GST'` 게이트 추가. 협력사 manager는 조회만, 편집 UI 전부 disabled + 툴팁 |
| 04-24 | **v1.35.1 HOTFIX** 출하예정 컬럼 매핑 정정 | v1.7.0(2026-03-16)부터 `finishing_plan_end` 잘못 참조 → `ship_plan_date` 로 교정 (1줄 fix) |
| 04-24 | **OPS_API_REQUESTS #62 v2.4 AMENDED** 작성 | 토글 3옵션 확정 (plan/actual/best) · `shipped_plan` AND→OR · `shipped_best` 신설 · `shipped_ops` 폐기 |
| 04-24 | **SI-BACKFILL-01** BACKLOG 등록 | app si_shipment → Teams Excel Graph API cron. Phase 0~3 단계 명문화. "생산관리 플랫폼 선행" 블로커 |
| 04-24 | CLAUDE.md **Codex 모델 관리 규칙** 추가 | Codex CLI 자동 최신 유지 + 주1회 brew outdated codex 체크 + 검증 trail 기록 룰 |
| 04-23 | **v1.35.0** Sprint 35 Phase 2 (BE v2.2 연동) | TEMP-HARDCODE 3개 제거 + 출하 3필드 + 월간 date_field 토글 + FactoryDashboardSettingsPanel 신설 |
| 04-23 | **v1.34.6** transform 재설계 | `pipeline.shipped → shipped_count` 마이그레이션 안정화 |
| 04-23 | **62-BE v2.3 AMENDED** 요청 | weekly-kpi WHERE 절 `ship_plan_date → finishing_plan_end` 원안 복원 (BE 1줄 교정 요청) |
| 04-22 | **v1.34.0** Sprint 35 Phase 1 — KPI 스와이프 덱 + KpiCard/KpiSwipeDeck/ProductionChart 추출 | 공장 대시보드 주간/월간 4카드 스와이프 + β'안 완료율 |
| 04-21 | **CLAUDE.md 대폭 개정** | 코드 크기 원칙 / DRY 원칙 / 리팩토링 안전 7원칙 / AI 검증 v2 / 모델 관리 규칙 / 번들 ±10% vs ±5% 차등 |
| 04-21 | **BACKLOG 리팩토링 Sprint 7개** 등록 | REF-V-00 ~ REF-V-06 단계적 분할 로드맵 |

---

## 🟡 대기 중 (BE / 외부 의존 — 내가 지금 손대도 의미 없음)

| ID | 작업 | 블로커 | 해소 시 액션 |
|:---|:---|:---|:---|
| **🆕 Sprint 39 BE 배포** | BE Sprint 63-BE — MECH 체크리스트 인프라 (migration 051 + 051a v2 73 INSERT + check_mech_completion + routes/checklist.py MECH 분기) | OPS 측 commit 완료 → 배포 미완 | 배포 후 `/checklist` MECH 카테고리 자동 활성화 (69 항목 표시) → Netlify preview 실기기 검증 → main merge + git tag v1.41.0 |
| **🆕 Sprint 40 BE 동반 배포** | BE Sprint 64-BE — `/work/start-batch` `/work/complete-batch` `/api/app/tasks/by-order` 3 endpoint | OPS 측 구현·배포 | Netlify preview 실기기 검증 6시나리오 → Twin파파 "배포 OK" → main merge + git tag v1.40.0 |
| **🆕 Sprint 40 사전 점검 SQL** | Sprint 34 BE 배포 + module_outsourcing/mech_partner NULL 비율 + GAIA/iVAS 입력률 100% | 운영 DB 접근 + Twin파파 실행 | DESIGN_FIX_SPRINT.md L17030~17044 SQL 실행 → 결과 memory.md 기록 → M6 c-3 NULL 빈도 사전 검증 |
| ~~**FE Sprint 36**~~ | ~~출하 토글 3옵션 교체~~ | — | ✅ **v1.37.0 + BE v2.4 deployed 자동 활성화 (2026-04-28)** |
| ~~**R-02 검증**~~ | ~~해석 A (si ⊆ actual) 반례 쿼리~~ | — | ✅ **BE 측 Pre-deploy Gate ③ 0건 검증 완료 (2026-04-28)** |
| **SI-BACKFILL-01** | Teams Excel Graph API cron | "생산관리 플랫폼 신설 일정 결정" | 플랫폼 일정 확정 시 Phase 1 착수 여부 결정 |
| **BIZ-KPI-SHIPPING-01** | 출하 이행률 위젯 | app SI 베타 100% + 데이터 2~4주 누적 | shipped_best 기반 지표 위젯 추가 |
| **OPS-BATCH-WHITELIST-DYNAMIC-01** | Work Batch 화이트리스트 admin_settings 동적 옵션화 (P3 안) | 다른 task 추가 (가압검사 등) 누락 발생 시 가치 발현 | admin 페이지 토글로 `task_categories` / `task_ids` 동적 제어. P2 자동 흡수가 신규 모델은 이미 보장 |

---

## 📡 OPS_API_REQUESTS 현황 (BE 측 작업 대기)

> 실제 OPS_API_REQUESTS.md 기준 — handoff.md 의 표는 stale (대부분 DONE 처리됨).

### 🚧 BE 작업 대기 (VIEW 의존)

| # | 항목 | 우선순위 | FE 영향 | 액션 위치 |
|:---:|:---|:---:|:---|:---|
| **🆕 Sprint 63-BE** | MECH 체크리스트 인프라 (Sprint 39 동반) — migration 051 + 051a v2 + check_mech_completion + routes/checklist.py MECH 분기 | 🟠 MEDIUM | FE Sprint 39 (v1.41.0) 자동 활성화 — 배포 전 MECH 카테고리 빈 목록 (안전 degrade) | OPS migrations/051.sql + 051a.sql + routes/checklist.py + task_service.py |
| **🆕 Sprint 64-BE** | Work Start/Complete Batch + tasks/by-order 3 endpoint (Sprint 40 동반) | 🟠 MEDIUM | FE Sprint 40 (v1.40.0) 자동 활성화 — 현재 fallback 모드만 동작 | OPS work.py + admin/tasks.py + 화이트리스트 검증 |
| **#47** | QR 명판 인식 — `qrbox 160 → 250` 등 카메라 설정 보강 | 🟡 LOW | OPS FE 작업 (VIEW 무관) — BACKLOG BUG-42 연동 | OPS qr_scanner_web.dart |

### ✅ 최근 DONE 확인 (handoff.md 표가 stale → 실제로는 처리됨)

```
#45 카드뷰 last_worker task 이름        ✅ Sprint 38-B
#52 ETL _FIELD_LABELS finishing_plan_end ✅ DOC-SYNC-01
#54 체크리스트 성적서 API 2건           ✅ DOC-SYNC-01
#55 QR elec_start 필드                  ✅ DOC-SYNC-01
#56 ELEC 체크리스트 API + confirmable   ✅ Sprint 58-BE
#58 checklist_master remarks 컬럼       ✅ Sprint 60-BE
#59 ELEC JIG 2 row 자동 생성           ✅ 2026-04-17 핫픽스
#60 S/N task company 필드               ✅ v2.9.5
#61 S/N task force_closed 필드          ✅ v2.9.5
#62 v2.2 출하 3필드 + monthly-kpi      ✅ 2026-04-23 (v1.35.0 와 동시)
#62 v2.3 weekly-kpi WHERE 절 교정      ✅ 2026-04-27 확인 (v2.10.1 패치)
#62 v2.4 shipped_plan OR + best 신설   ✅ 2026-04-28 deployed (FE v1.37.0 자동 활성화)
R-02   해석 A 반례 검증                  ✅ 2026-04-28 (BE Pre-deploy Gate ③ 0건)
Sprint 63-BE MECH 체크리스트 인프라     🟡 OPS commit 까지 완료 / 배포 미완 (FE Sprint 39 v1.41.0 동반)
Sprint 64-BE Tank Module Batch endpoint 🟡 OPS 미진행 (FE Sprint 40 v1.40.0 동반, fallback 모드 동작 중)
```

→ **handoff.md 의 #18/#45/#52/#58/#59-A/B/C/#60/#61 표 정리 필요** (별도 정정 작업 BACKLOG `DOC-HANDOFF-CLEANUP` 1건 등록 가능, 30분 작업)

---

## 🔴 OPEN (지금 손댈 수 있는 FE 작업)

> BE 의존 없음. 짬 났을 때 위에서부터 처리.

| 순위 | ID | 작업 | 시간 | 비고 |
|:---:|:---|:---|:---:|:---|
| 1 | **BUG-V2** | ProductionPerformancePage `?? []` defensive coding 7개소 | 1h | 🟡 LOW · 짬 작업 |
| 2 | **AnalyticsDashboardPage** | `usage_minutes` → `last_access` 표시 변경 | 30분 | 설계 완료, 코드 미작성 |
| 3 | **REF-V-01** | ProductionPerformancePage 895줄 → ~200줄 분할 (4단계) | 반나절 | 🔴 필수 분할 · 사용 빈도 최고 |
| 4 | **REF-V-02** | QrManagementPage 804줄 → ~150줄 분할 (4단계) | 반나절 | 🔴 필수 분할 |
| 5 | **REFACTOR-SNStatusPage** | SNStatusPage Sprint 38 후 485 LOC (🟡 경고 임계 근접) | 반나절 | 🟡 LOW · 코드 크기 1단계 권장 (500 미만) |
| 6 | **SETUP-PERMISSIONS-01** | settings.local.json 의 user별 absolute path stale 정리 | 30분 | 🟡 LOW · 환경 정리 |

→ **권장**: BE Sprint 63-BE / 64-BE 배포 대기 시간에 **1·2번 (각 30분)** 먼저 처리 → 문서 정합 + Sprint 39/40 검증 시간 확보.

---

## 🟢 다음 주 이후 — 머리에서 비워둬도 OK

```
🟡 REF-V-03  Sidebar 627줄 분할
🟡 REF-V-04  ProductionPlanPage 617줄 분할
🟡 REF-V-05  FactoryDashboardPage 591줄 분할
🟡 REF-V-06  PermissionsPage 535 + EtlChangeLogPage 514줄 분할
🟢 components/ui/ 부산물 5종 (FilterBar/DataTable/DateRangePicker/ConfirmDialog/EmptyState)
🟢 DESIGN_FIX_SPRINT.md 잔존 UX 항목
🟢 LOCAL-BUILD-ICLOUD-OR-MIGRATION 근본 조사 (PC 재설정 시)
```

---

## 📚 어디 가면 뭐 있나 (cheat sheet)

```
"오늘 뭐 해야 되지?"
  → 이 파일 (WEEKLY_PLAN_20260504.md)

"내가 며칠 떠있는 동안 무슨 일이 있었지?"
  → handoff.md (현재 상태 + v1.35.x 흐름)
  → CHANGELOG.md (버전별 상세)

"VIEW 작업 상세 설계는?"
  → DESIGN_FIX_SPRINT.md (Sprint 35 Phase 2 등)

"BE에 요청한 게 뭐였지? / 지금 OPS 측 작업 대기는?"
  → OPS_API_REQUESTS.md (#62 v2.4 ✅ + Sprint 64-BE Tank Module Batch 🟠 대기 + #47 🟡 PENDING)
  → 이 파일 § 📡 OPS_API_REQUESTS 현황 (요약본)

"전체 BACKLOG / 리팩토링 로드맵?"
  → BACKLOG.md (REF-V-00~06 + SI-BACKFILL-01 + BIZ-KPI-SHIPPING-01)

"왜 이렇게 결정했지?"
  → memory.md (ADR)
```

---

## 💪 이번 주 끝났을 때 기대 상태 (2026-05-04 ~ 2026-05-08)

### 시나리오 A (BE Sprint 63-BE + 64-BE 양쪽 이번 주 배포 시)
- Sprint 39 (v1.41.0) MECH 체크리스트 자동 활성화 → 69 항목 표시
- Sprint 40 (v1.40.0) Tank Module batch + 토스트 분기 활성화
- Twin파파 실기기 검증 완료 → 양쪽 main merge + git tag v1.40.0 / v1.41.0 + prod 배포
- BUG-V2 / AnalyticsDashboardPage 1~2건 흡수

### 시나리오 B (BE 측 일부 지연)
- FE 단독 배포 상태로 fallback/안전 degrade 동작 (Sprint 40 batch 미동작 / Sprint 39 빈 목록)
- REF-V-01 (ProductionPerformancePage 분할) 반나절 착수 가능
- 사전 점검 SQL 실행 → memory.md 기록

### 월요일 회고 (2026-05-04, 폭발적 시작)
1. ✅ Sprint 40 (v1.40.0) FE 완료 + main push (오전)
2. ✅ Sprint 39 (v1.41.0) FE 완료 + main push (오후) — Codex 1·2·3차 19건 전건 반영
3. **남은 핵심 트랙**:
   - 🔴 BE Sprint 63-BE + 64-BE 동반 배포 추적 (OPS 측)
   - 🟠 Netlify preview 실기기 검증 (Sprint 39 + 40 동시)
   - 🟠 Sprint 40 사전 점검 SQL 실행
   - 🟡 잠재 트랙 (BUG-V2 / AnalyticsDashboardPage / REF-V-01)

---

> 머리 가벼워야 좋은 결정 나옴. 이 파일이 그 무게 덜어주는 용도.
> 2026-05-04 (월) 폭발적 시작 — Sprint 39 + 40 양 트랙 FE 완료 + main push. 남은 주에는 BE 동반 배포 + 검증 + 잠재 트랙.
