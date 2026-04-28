# 📋 VIEW Weekly Plan — 2026-04-27 주 (월~금)

> OPS에 집중하느라 VIEW 컨텍스트 떠있을 때 10초 만에 복구용.
> "지금 어디까지 와있고 / 뭐가 남았는지" 만 본다. 상세는 BACKLOG·handoff·CHANGELOG에서.
>
> 마지막 업데이트: 2026-04-27 (월) — 시드 정리 1회차

---

## 🧭 한눈에 (현재 상태)

```
현재 버전 : v1.36.2 (2026-04-27, main 배포)
최근 작업 : REF-V-00-UTIL — formatDate 공통 유틸 승격 (내부 정리)
진행 중   : 없음
대기 중   : OPS BE Sprint 62-BE v2.4 배포 → FE Sprint 36 토글 교체
```

→ 지난 주 후반(목·금·토) 출하 토글 v2.4 설계 + HOTFIX 2건이 메인이었음. **VIEW 코드 변경 없이 며칠 잠수 가능한 상태.**

---

## ✅ 최근 완료 (지난 1주, 2026-04-21~25)

> "내가 OPS 들어가있는 동안 VIEW에 뭐가 쌓였지?" 답.

| 일자 | 항목 | 의미 |
|:---:|:---|:---|
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
| **FE Sprint 36** | 출하 토글 3옵션 교체 (`plan`/`actual`/`best`) | OPS BE Sprint 62-BE v2.4 배포 | `api/factory.ts` ShippedBasis 타입 변경 + `pickShipped()` best 분기 + Settings Panel 라벨. 1~2h |
| **62-BE v2.3** | weekly-kpi WHERE 절 1줄 교정 | OPS 작업 | FE 코드 변경 0 (자동 반영) |
| **R-02 검증** | 해석 A (si ⊆ actual) 반례 존재 여부 쿼리 | BE v2.4 배포 후 72h 내 | Twin파파 직접 쿼리 실행 |
| **SI-BACKFILL-01** | Teams Excel Graph API cron | "생산관리 플랫폼 신설 일정 결정" | 플랫폼 일정 확정 시 Phase 1 착수 여부 결정 |
| **BIZ-KPI-SHIPPING-01** | 출하 이행률 위젯 | app SI 베타 100% + 데이터 2~4주 누적 | shipped_best 기반 지표 위젯 추가 |

---

## 📡 OPS_API_REQUESTS 현황 (BE 측 작업 대기)

> 실제 OPS_API_REQUESTS.md 기준 — handoff.md 의 표는 stale (대부분 DONE 처리됨).

### 🚧 BE 작업 대기 (VIEW 의존)

| # | 항목 | 우선순위 | FE 영향 | 액션 위치 |
|:---:|:---|:---:|:---|:---|
| **#62 v2.3** | `weekly-kpi` WHERE 절 `ship_plan_date → finishing_plan_end` 원안 복원 (BE factory.py L322 1줄) | 🟠 MEDIUM | FE 코드 변경 0. 주간 production_count 등 숫자 자동 변경 | OPS factory.py |
| **#62 v2.4** | `shipped_plan` AND→OR 교정 + `shipped_best` 신설 + `shipped_ops` 폐기 + `completion_status` JOIN 제거 + pytest TC-FK-08~14 | 🔴 HIGH | FE Sprint 36 토글 교체 트리거 | OPS factory.py + test_factory_kpi.py |
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

→ **권장**: BE v2.4 배포 대기 시간에 **1·2번 (각 30분)** 먼저 처리 → 문서 정합 + Sprint 36 워밍업.

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
  → 이 파일 (WEEKLY_PLAN_20260427.md)

"내가 며칠 떠있는 동안 무슨 일이 있었지?"
  → handoff.md (현재 상태 + v1.35.x 흐름)
  → CHANGELOG.md (버전별 상세)

"VIEW 작업 상세 설계는?"
  → DESIGN_FIX_SPRINT.md (Sprint 35 Phase 2 등)

"BE에 요청한 게 뭐였지? / 지금 OPS 측 작업 대기는?"
  → OPS_API_REQUESTS.md (#62 v2.3·v2.4 AMENDED + #47 만 PENDING)
  → 이 파일 § 📡 OPS_API_REQUESTS 현황 (요약본)

"전체 BACKLOG / 리팩토링 로드맵?"
  → BACKLOG.md (REF-V-00~06 + SI-BACKFILL-01 + BIZ-KPI-SHIPPING-01)

"왜 이렇게 결정했지?"
  → memory.md (ADR)
```

---

## 💪 이번 주 끝났을 때 기대 상태

```
가능 시나리오 A (BE v2.4 이번 주 배포 시)
  → FE Sprint 36 토글 교체 완료 (best/actual/plan 3옵션)
  → R-02 검증 쿼리 실행 + 결과 memory.md 기록
  → REF-V-00-UTIL 흡수 진행

가능 시나리오 B (BE v2.4 다음 주 이후)
  → REF-V-00-UTIL 단독 완료
  → BUG-V2 defensive coding 흡수
  → REF-V-01 또는 02 착수 가능 (반나절 확보 시)
```

---

> 머리 가벼워야 좋은 결정 나옴. 이 파일이 그 무게 덜어주는 용도.
> 다음 주 (5-04) 시드는 사용자 직접 작성 권장 — 이번 주 회고 1~2줄만 추가.
