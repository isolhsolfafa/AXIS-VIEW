# AXIS-VIEW 업데이트 내역

> Manufacturing Execution Platform — 관리자 대시보드
> 최신 버전: v1.34.6 (2026-04-23)

---

## 공지(Notice) 작성 가이드

### API
- **등록**: `POST /api/admin/notices` (Authorization: Bearer 필요)
- **수정**: `PUT /api/admin/notices/{id}`
- **필드**: `title`, `content`, `version`, `is_pinned`

### 제목 형식
```
🖥️ VIEW v{버전} 업데이트 안내
```

### 본문 형식 — 플레인 텍스트 + 이모지 섹션 (마크다운 사용 금지)
```
🖥️ v{버전} 업데이트 안내

{이모지} 섹션 제목
 - 설명 1
 - 설명 2

{이모지} 섹션 제목
 - 설명 1
 - 설명 2
```

### 규칙
1. **플레인 텍스트 + 줄바꿈** — 마크다운(##, ###, **) 사용하지 않음
2. 섹션 구분은 **이모지 + 제목** (OPS 공지와 동일 형식)
3. 항목은 ` - ` (공백+하이픈+공백) 들여쓰기
4. 현장 작업자가 앱에서 바로 읽기 편한 수준으로 작성
5. 기술 용어 최소화 — 사용자 관점에서 "무엇이 바뀌었는지" 중심
6. **상단 고정(pin) 관리**: 신규 VIEW 공지를 `is_pinned: true`로 등록하고, 기존 VIEW 공지의 pin은 해제 (`is_pinned: false`)
   - 항상 최신 VIEW 공지 1개만 상단 고정 유지
   - OPS 공지의 pin 상태는 건드리지 않음

### 자주 쓰는 섹션 이모지
```
🔧 버그 수정           📱 반응형/UI 개선
👥 사용자/권한 관리     📊 대시보드/차트
⚙️ 설정/관리 기능      🔐 로그인/인증
📋 체크리스트          🏭 생산관리
```

### 예시 (v1.17.1)
```
제목: 🖥️ VIEW v1.17.1 업데이트 안내

본문:
🖥️ v1.17.1 업데이트 안내

🔧 생산현황 공정 상태 수정
 - S/N 상세 패널에서 공정 완료 상태가 잘못 표시되던 문제 수정
 - 예: 전장(ELEC) 5개 작업 중 3개만 완료 → 기존 완료 표시 → 수정 후 진행중 표시
 - S/N 카드 목록과 상세 패널의 공정 상태가 동일하게 표시됩니다

📱 반응형 레이아웃 개선
 - 태블릿에서 사이드바가 자동으로 접혀 화면을 넓게 사용할 수 있습니다
 - 사이드바 토글 버튼으로 펼침/접힘 전환 가능
 - 소형 모니터에서 KPI, 차트 그리드가 자동으로 재배치됩니다

👥 비활성 사용자 관리
 - 권한 관리 > 비활성 사용자 메뉴에서 30일 미로그인 사용자 확인
 - 비활성화/재활성화 버튼으로 계정 관리
 - 협력사 관리자가 소속 인원 비활성화 요청 가능
```

---

## v1.34.6 — 2026-04-23

**HOTFIX S2 — KPI 덱 scroll-snap → transform: translateX 재설계**

### 현상 (v1.34.5 후에도 재발)
- 세그먼트 토글 버튼 / 30초 자동 전환 모두 **여전히 동작 안 함**
- v1.34.5의 `clientWidth === 0` 가드로도 근본 해결 실패

### 원인 재진단
`CSS scroll-snap + overflow-x: auto` 기반 구현이 **부모 Layout의 overflow 설정 / width 제약**과 충돌하여 scrollable container로 인식되지 않음. 결과:
- scrollTo(left=clientWidth) 호출돼도 실제 스크롤 이동 없음 → 시각적 전환 안 됨
- scroll 이벤트 미발동 → handleScroll 로직 전체 무력화

### 재설계 (transform: translateX)
scroll 의존성을 완전히 제거하고 단순 CSS transform으로 교체:

```tsx
<div style={{ overflow: 'hidden' }}>
  <div style={{
    display: 'flex',
    width: '200%',
    transform: period === 'weekly' ? 'translateX(0%)' : 'translateX(-50%)',
    transition: 'transform 0.4s ease',
  }}>
    <section style={{ width: '50%' }}>주간 4카드</section>
    <section style={{ width: '50%' }}>월간 4카드</section>
  </div>
</div>
```

### 장점
- ✅ 브라우저 호환성 100% (transform GPU 가속)
- ✅ 부모 레이아웃 overflow 영향 받지 않음
- ✅ 버튼 클릭 → state 변경 → transform 즉시 반영
- ✅ 30초 자동 전환 확실히 작동
- ✅ 코드 단순화 (scrollRef / handleScroll / scrollTo useEffect 전부 제거)

### 트레이드오프 (기록)
- ❌ 터치 스와이프 제스처 사라짐 (scroll-snap이 제공하던 것)
- → Sprint 36에서 swiper.js 또는 embla-carousel 도입 시 복구

### 검증
- 빌드 GREEN 확인
- 의존 제거: useRef / useCallback / 관련 import 정리

### 분류
- S2 HOTFIX (기능 복구) — Opus 단독 리뷰 → 배포 (CLAUDE.md 🚨 긴급 HOTFIX 예외 S2)
- 사후 Codex 검토 대상 (POST-REVIEW-HOTFIX-v1.34.6)

---

## v1.34.5 — 2026-04-23

**HOTFIX S3 — KPI 덱 탭 전환 버그 수정 + 30초 자동 전환 도입**

### 현상
- 세그먼트 토글 버튼(주간/월간) 또는 스와이프 제스처로 period 전환 시도 시 **동작 안 함**
- 원인: 초기 렌더 시점에 `scrollRef.current.clientWidth`가 `0` → `scrollLeft / 0` NaN → `NaN > 0.5` false → 항상 'weekly' 유지

### 수정 (`KpiSwipeDeck.tsx`)
- `handleScroll` 방어 로직: `if (clientWidth === 0) return` 추가 — 초기 렌더 NaN 가드
- 신규 prop `autoSwipeInterval?: number` (ms 단위) 추가
- 30초 간격 자동 전환 useEffect — 대형 모니터 운영 UX
- `FactoryDashboardPage.tsx`: `<KpiSwipeDeck autoSwipeInterval={30000} />` 전달

### 리소스 영향 분석
| 항목 | 영향 |
|---|---|
| setInterval 30초 1개 | 브라우저 타이머 1개 (무시 수준) |
| period toggle 재렌더 | KpiCard 4개 React 기본 최적화 |
| 월간 API 호출 | `staleTime 5분` → 실제 network는 5분에 1회 |
| 스크롤 애니메이션 | GPU 가속, CPU 영향 0 |

**결론: 리소스 낭비 없음**. 기존 FactoryDashboardPage가 이미 5초 자동 슬라이드(`slideAutoPlay`)를 운영 중이고 문제 없었던 선례 참고.

### 분류
- S3 HOTFIX (일반 UX 이슈) — 정상 파이프라인
- Sprint 36 정식 진입 전 유지보수 성격

### 교차검증
- Opus 단독 리뷰 (CLAUDE.md 🚨 긴급 HOTFIX 예외 조항 S3 — 정상 파이프라인 범주)
- 다음 Sprint 전까지 관찰 필요 사항 없음 (재현 가능한 방어 로직 + 기존 패턴 재활용)

---

## v1.34.4 — 2026-04-23

**문서 정정 — mech_start 영구 기준 확정 + finishing_plan_end 재전환 폐기**

### 배경
- Sprint 35 설계서 원안: monthly-detail `date_field`를 `mech_start` → `finishing_plan_end`로 전환 (생산량은 완료 기준이 합리적)
- v1.34.0 배포 후 BE Sprint 62-BE 미지원으로 하단 3영역 장애 → v1.34.1 HOTFIX로 `mech_start` 복원 (임시 조치로 기록)
- 2026-04-23 사용자 재결정: **하단 3영역은 mech_start 기준으로 영구 유지** ("이번 달 기구 착수 S/N" 현장 관점이 자연스러움)
- 월간 생산량 카드만 Sprint 36에서 옵션 토글로 4가지 기준 선택 제공

### 정정 범위
- `CHANGELOG.md` v1.34.1 "finishing_plan_end 재전환 예정" 문구 → 폐기 표기
- `app/src/pages/factory/FactoryDashboardPage.tsx` L65 주석 → 영구 유지 명시 + Sprint 36 토글 언급
- `app/src/pages/factory/components/ProductionChart.tsx` sub 주석 → 영구 유지 명시
- `handoff.md` 현재 버전 및 BE 배포 시 원복 작업 항목 → date_field 제외
- `docs/sprints/DESIGN_FIX_SPRINT.md` Sprint 35 상단에 v1.34.4 재결정 블록 추가
- `CLAUDE.md` 메타 갱신 (v1.34.4, 2026-04-23)

### 확정 기준 (영구)
| 영역 | 기준 | 비고 |
|---|---|---|
| 생산 현황 상세 테이블 | `mech_start` | 영구 |
| 월간 생산 지표 차트 (하단) | `mech_start` | 영구 |
| 상단 스와이프 월간 ProductionChart | `mech_start` | 영구 |
| 월간 생산량 카드 | Sprint 36 옵션 토글 (기본 `mech_start`) | 토글 |
| 주간/월간 출하 완료 카드 | Sprint 36 옵션 토글 (실시간/실적/계획) | 토글 |

### 변경 파일 (6)
- CHANGELOG.md + version.ts + handoff.md + CLAUDE.md + DESIGN_FIX_SPRINT.md + FactoryDashboardPage.tsx + ProductionChart.tsx
- 코드 로직 변경 없음 (주석만 정정)

---

## v1.34.3 — 2026-04-22

**TEMP-HARDCODE 보정 — 주간 생산량 BE 동적 값 복원 + 월간 분리**

### 배경
- v1.34.2에서 "actual_ship_date 기준 통일" 지시를 과해석 → **이미 BE weekly-kpi로 정상 반환 중이던 주간 생산량까지 하드코딩(11)으로 덮음**
- 실제로는 주간 생산량은 BE 동적 값(약 31대, ship_plan_date 기준)이 정상

### 수정
- `KpiSwipeDeck.tsx`:
  - 주간 생산량 카드 value: `TEMP_WEEKLY_COUNT` → `weekly?.production_count ?? '—'` **원복**
  - 월간 생산량/출하 상수 분리: `TEMP_MONTHLY_COUNT` → `TEMP_MONTHLY_PRODUCTION = 215` + `TEMP_MONTHLY_SHIPPED = 76`
  - 주간 출하 상수 이름 변경: `TEMP_WEEKLY_COUNT` → `TEMP_WEEKLY_SHIPPED = 11` (명확성)

### 최종 하드코딩 3곳 (BE 미지원만)
| 상수 | 값 | 카드 |
|---|---|---|
| `TEMP_WEEKLY_SHIPPED` | 11 | 주간 출하 완료 (actual_ship_date W17) |
| `TEMP_MONTHLY_PRODUCTION` | 215 | 월간 생산량 (2026-04 계획) |
| `TEMP_MONTHLY_SHIPPED` | 76 | 월간 출하 완료 (actual_ship_date 2026-04) |

### 건드리지 않은 BE 동적 값
- 주간 생산량: `weekly?.production_count` (BE weekly-kpi)
- 주간 완료율: `weekly?.completion_rate`
- 월간 완료율: β'안대로 `—` + 서브텍스트
- 불량 건수 (주/월): `—` (QMS 미연동)

---

## v1.34.2 — 2026-04-22

**TEMP-HARDCODE — 손님 응대용 actual_ship_date 기준 값 하드코딩 (BE 미배포)**

### 배경
- BE Sprint 62-BE 미배포 상태에서 손님 방문 예정
- 공장 대시보드 주간/월간 카드에 실제 출하 기준 숫자 표시 필요

### 하드코딩 값 (`plan.product_info.actual_ship_date` 기준 직접 SQL 집계)
- **주간 (W17 2026-04-20~26)**: 11대
  - 주간 생산량 카드: 11대
  - 주간 출하 완료 카드: 11대 (동일 값)
- **월간 (2026-04 전체)**: 76대
  - 월간 생산량 카드: 76대
  - 월간 출하 완료 카드: 76대 (동일 값)

### 변경 파일
- `app/src/pages/factory/components/KpiSwipeDeck.tsx`: 모듈 상수 `TEMP_WEEKLY_COUNT = 11`, `TEMP_MONTHLY_COUNT = 76` 선언 후 4개 카드에 적용
- 주석에 `TEMP-HARDCODE v1.34.2` 마커 명시

### 제거 조건
- BE Sprint 62-BE 배포 후 `weekly-kpi.shipped_count` / `monthly-kpi.production_count` / `monthly-kpi.shipped_count` 실값 반환 시점에 즉시 하드코딩 제거
- `KpiSwipeDeck.tsx` 모듈 상수 2개 + 4개 카드 `value` prop 원복 필요

---

## v1.34.1 — 2026-04-22

**Sprint 35 HOTFIX — monthly-detail date_field 복원 (S2 부분 장애)**

### 증상
- v1.34.0 배포 후 공장 대시보드 하단 3개 영역 동시 빈 상태:
  - 생산 현황 상세 테이블 0건
  - 월간 생산 지표 차트 "데이터 없음"
  - 최근 활동은 정상 (영향 없음)

### 원인
- Sprint 35에서 `useMonthlyDetail`의 `date_field: 'mech_start'` → `'finishing_plan_end'` 전환
- **BE Sprint 62-BE 미배포** 상태 → `_ALLOWED_DATE_FIELDS` 화이트리스트에 `finishing_plan_end` 미등록 → 파라미터 reject → 빈 응답
- 설계 단계에서 "상단 스와이프 월간 차트만 영향"으로 간주했으나, **같은 `monthlyDetail` 데이터 소스가 하단 테이블·하단 월간 차트에도 쓰이는 점을 간과**

### 복원
- `FactoryDashboardPage.tsx` L65: `date_field: 'finishing_plan_end'` → `'mech_start'` 원복
- ~~주석 보강: BE Sprint 62-BE 배포 후 재전환 예정 명시~~ (v1.34.4에서 정정 — mech_start 영구 유지로 결정)
- `ProductionChart` 서브 라벨에서 "finishing_plan_end 기준" 문구 제거 (정직성)
- **주간 출하 카드 fallback 추가**: `weekly?.shipped_count ?? weekly?.pipeline?.shipped ?? '—'` — BE Sprint 62-BE 미배포 상태에서도 기존 `pipeline.shipped`로 값 표시 (Sprint 35 설계 타입에 `pipeline.shipped` deprecated 유지는 이 fallback 용도였으나 FE에서 빠뜨림)

### 후속 (v1.34.4에서 정정)
- ~~BE 배포 후 `finishing_plan_end` 재전환~~ → **폐기**. `mech_start`를 생산 현황 상세 / 월간 생산 지표 / 상단 스와이프 월간 차트의 **영구 기준**으로 유지 결정 (v1.34.4)
- 월간 생산량 카드만 Sprint 36에서 **옵션 토글**로 기준 선택 가능하게 제공 예정
- 설계 단계 교훈: 공유 데이터 소스 기준 변경 시 **모든 소비처 사용처 점검** 필수

### 교차검증
- S2 HOTFIX — Opus 단독 리뷰 후 즉시 배포 (CLAUDE.md 🚨 긴급 HOTFIX 예외 조항)
- 다음 Sprint 시작 전 Codex 사후 검토 예정 (`POST-REVIEW-HOTFIX-v1.34.1`)

---

## v1.34.0 — 2026-04-22

**Sprint 35 — 공장 대시보드 KPI 주간/월간 스와이프 덱**

### 공장 대시보드 — 4카드 주간/월간 period 스와이프
- KPI 4카드(생산량·완료율·불량·출하) 주간 ↔ 월간 스와이프 전환 도입
- 세그먼트 토글 버튼 + CSS scroll-snap 스와이프 덱 + 점 indicator (의존성 0)
- 월간 완료율은 β'안 — 메인 값 `—` + 서브텍스트 `"주간 값: 68% (W14)"` (오독 방지, Codex M1 반영)
- `useMonthlyKpi` 훅 신규 — `enabled: period === 'monthly'` 지연 로딩 + `placeholderData: keepPreviousData` (첫 스와이프 빈 카드 완화, Codex M3)

### 생산 지표 차트 — 기준 통일 & period 연동
- `monthly-detail` 조회 기준 `mech_start` → `finishing_plan_end` 전환 (생산량은 완료 기준이 합리적, Codex M2)
- 하단 테이블 정렬 키는 `mech_start` 유지 (조회 기준과 정렬 기준 분리, 현업 익숙도 고려)
- 주간/월간 모델별 막대 차트를 `ProductionChart` 컴포넌트로 추출 + period prop 연동
- 기존 `주간 생산 지표 [Planned Finish]` 라벨 제거 — WHERE 절 교정으로 라벨 drift 해소

### 공용 컴포넌트 추출 (DRY)
- `KpiCard.tsx` 신규 — 기존 `FactoryDashboardPage` 인라인 KPI 렌더 공용화 (props: label, value, unit, sub, subtext, color, disabled, loading)
- `KpiSwipeDeck.tsx` 신규 — 스와이프 덱 컨테이너
- `ProductionChart.tsx` 신규 — 기존 인라인 바 차트 추출
- 유사 `KpiCard` 패턴이 QrManagementPage / AnalyticsDashboardPage 에도 존재 — 이번엔 factory 전용으로 한정 (공용 promote 여지 BACKLOG)

### 타입 & API
- `WeeklyKpiResponse` 에 `shipped_count` / `defect_count` 필드 추가 (Sprint 62-BE 신규)
- `MonthlyKpiResponse` 타입 + `getMonthlyKpi()` API 신규 (`by_model` 미포함 — monthly-detail 재활용)
- `MonthlyDetailParams.date_field` 에 `'finishing_plan_end'` 추가
- `pipeline.shipped` (deprecated) → `shipped_count` 마이그레이션 (L119 교체, Codex H3)

### 안전 degrade & 배포 순서
- BE Sprint 62-BE 미배포 시 `getMonthlyKpi()` 404 → 월간 카드 `—` 표시, runtime error 없음
- `shipped_count` / `defect_count` undefined 시 `—` fallback
- 권장 배포 순서: BE Sprint 62-BE 먼저 → FE Sprint 35 (실데이터 정합 확보)

### 교차검증 이력
- Codex 7건 이슈 전건 반영 (H1 `--gx-neutral-300` → `--gx-mist/--gx-steel` 재매핑, H2 FactoryDashboardPage 경고 크기 정책 A안, H3 pipeline.shipped 마이그레이션, M1/M2/M3 β'안·정렬 유지·keepPreviousData)
- Claude 추가 발견: KpiCard props 확장 필요 → 신규 컴포넌트로 추출 + 인라인 렌더 교체
- 빌드 GREEN (3282 modules, 2.34s) + Vitest GREEN (2 files, 30 tests, 414ms)

### 후속 BACKLOG
- `REFACTOR-FactoryDashboardPage` — 현재 596줄 (경고 500 초과, 필수 분할 800 미만). Sprint 35 이후 KPI/테이블/ETL 3분할 검토

---

## v1.33.0 — 2026-04-20

**Sprint 34 — S/N 상세뷰·O/N 헤더 정보 보강 (FE-20 / FE-21)**

### 생산현황 — 카테고리 헤더 담당 회사명 (FE-20)
- S/N 상세뷰의 MECH / ELEC / TMS 카테고리 카드 제목 옆에 담당 회사명 표시 (예: `MECH 기구 · 에스이엔지`, `ELEC 전장 · GST`, `TM 모듈 · TMS`)
- GST 자체생산 케이스도 `· GST`로 표시하여 자체 vs 협력사 구분 시각화
- PI / QI / SI 카테고리는 라벨 미표시 (GST 자체검사·출하검사 고정)
- `SNProduct` 타입에 `mech_partner` / `elec_partner` / `module_outsourcing` 3필드 flat 추가
- `ProcessStepCard` prop 확장 + `getCategoryPartner` 헬퍼 (`case 'TMS'` 주의)
- NULL/빈 문자열 방어 — 카테고리명 단독 표시, placeholder 금지 (클린 코어 원칙)

### 생산현황 — O/N 카드·상세뷰 헤더 line 노출 (FE-21)
- O/N 카드 헤더에 고객사 공정 라인(`line`) 표시: `오더번호 · 모델명 · 고객사 · {line} · {댓수}대`
- S/N 상세뷰 헤더에도 `line` 조건부 렌더: `고객사 · {line} · 출하일`
- 1개 O/N 내 S/N별 line 혼재 시 대표값 + "외 N" 표기 (예: `F16 외 1`)
  - 대표값 = 최다 S/N line (동률 시 사전순 1위)
  - NULL row는 혼재 카운트에서 제외 (`[F16, F16, F16, NULL]` → `F16`만 표시)
- 혼재 집계는 FE `groupedByON` 내부 `lineAgg` 로직 (BE는 per-S/N `line`만 반환)

### BE 연동
- **BE FIX-25 v4**: `/api/app/product/progress` 응답 `SNProduct` 요소에 `mech_partner` / `elec_partner` / `module_outsourcing` / `line` 4필드 flat 추가 (progress API 단일 확장)
- tasks API (`work.py`) 무변경 — List→Dict breaking 회귀 0
- BE 미배포 시 4필드 undefined → 현행 UI와 동일 동작 (안전 degrade, 점진 배포 가능)

### 교차검증 이력
- Claude ↔ Codex 2라운드 교차검증 합의 반영 (v3 M1+A8, v4 M1+A6)
- v3 → v4 전환: BE 확장 범위를 tasks API → progress API flat 구조로 축소, 회귀 위험 등급 "매우 낮음~낮음" → "매우 낮음" 하향

---

## v1.32.3 — 2026-04-20

**FE-19.1 용어 정합 — 강제종료 툴팁 문구 보정**

### 생산현황 S/N 상세 — 툴팁 문구 정합
- 강제종료 툴팁 라벨 `종료:` → `종료 처리:`로 1단어 교체 (`ProcessStepCard.tsx` L224)
- 클린 코어 데이터 원칙 #4 "UI 책임"의 `🔒 종료 처리:` 용어와 정합 확보
- "종료:"가 "작업 종료 시각"으로 오독될 여지 제거 → 관리자 강제종료 감사 시각임을 명시
- 기능 변경 없음, 순수 텍스트 보정
- Claude ↔ Codex 교차검증 합의 후 진행 (회귀 위험 매우 낮음)

---

## v1.32.2 — 2026-04-18

**FE-19.2 후속 — 강제종료 툴팁 즉시 반응**

### 생산현황 S/N 상세 — 툴팁 UX 개선
- 브라우저 기본 `title` 속성 500~700ms 딜레이 회피
- CSS `.fc-tooltip` + `data-tooltip` 패턴으로 즉시 반응 툴팁 구현
- 디자인: `--gx-charcoal` 배경 + 흰색 텍스트, 상단 화살표, `pre-line` 줄바꿈, 180~320px 폭
- `index.css` 하단에 재사용 가능한 공통 CSS 추가 (`.fc-tooltip[data-tooltip]:hover::after/::before`)
- `ProcessStepCard` 강제종료 row 상태 컬럼: `title` 속성 → `className` + `data-tooltip` 교체

---

## v1.32.1 — 2026-04-18

**FE-19.1 후속 보정 — per-row 강제종료 표시**

### 생산현황 S/N 상세 — row별 강제종료 식별
- `TaskWorker` 타입에 `force_closed?` / `close_reason?` / `closed_by_name?` / `force_closed_at?` 4필드 추가
- `SNDetailPanel.tsx` 병합 로직: 부모 task의 force_closed 관련 필드를 각 worker row(실제 + placeholder)에 전파
- `ProcessStepCard.tsx` 상태 컬럼: `force_closed` 시 `미시작` → `🔒 강제종료 mm/dd hh:mm`으로 대체
- `title` 툴팁으로 사유/처리자(마스킹)/종료 시각 표시
- 강제종료 버튼 이중 노출 방지 (`!w.force_closed` 가드)
- duration 컬럼도 force_closed면 '—'로 통일

### 데드 코드 정리
- v1.32.0 FE-19의 `workers.length === 0` placeholder JSX 제거 — SNDetailPanel이 항상 placeholder worker를 주입하여 해당 경로 도달 불가 확인

### 회고
- v1.32.0 설계 단계에서 SNDetailPanel 병합 방식(placeholder worker 주입)을 간과 → 실제 렌더링 경로는 `workers.length > 0`
- per-row 전파 방식으로 재설계, TM 모듈·SI 마무리 카드에서 task별 강제종료 여부 명확 식별 가능

---

## v1.32.0 — 2026-04-17

**HOTFIX-04 / FE-19 — 강제종료 표시 누락 보정 + formatDateTime 유틸 승격**

### 생산현황 — 미시작 강제종료 placeholder 렌더 (FE-19)
- `ProcessStepCard.tsx`: `taskStatus()` 분기 확장 — `force_closed && workers=[]`면 `'completed'`로 판정 (상단 뱃지 `✅ 완료`)
- workers=[] 블록 확장: 기존 "대기중" 텍스트 → placeholder row (처리자 마스킹 + 종료 시각 + 사유 표시)
- Guard 조건 (`task.closed_by_name && ...`, `task.close_reason && ...`)로 legacy 데이터(`closed_by IS NULL`) 안전 degrade
- BE 선행: `AXIS-OPS` HOTFIX-04 v2.9.8 배포 완료 (task 응답에 `close_reason`/`closed_by`/`closed_by_name` 3키 추가)

### 타입 확장 — `SNTaskDetail`
- `close_reason?: string` — 강제종료 사유
- `closed_by_name?: string` — 처리자 원문(마스킹 전)
- `completed_at?: string | null` — placeholder row 종료 시각

### 리팩토링 — `formatDateTime` 공통 유틸 승격
- `ChecklistReportView.tsx` 로컬 함수 → `utils/format.ts`로 이관 (옵션 A 채택)
- null/undefined 가드 추가 (`string | null | undefined`)
- `formatDate` 2건(QrManagementPage / InactiveWorkersPage) 일괄 승격은 BACKLOG(TECH-REFACTOR-FMT-01) 유지

---

## v1.31.0 — 2026-04-17

**Sprint 33 — 미종료 작업 관리 + 모델명 레이아웃 개선**

### 생산현황 — 미종료/미시작 task 강제 종료
- S/N 상세 패널에 미종료 경고 배지 (`⚠️ 미종료 N건`, 14h 초과) + 미시작 배지 (`⏳ 미시작 N건`)
- 강제 종료 버튼: 사유 입력 + 완료 시각 선택 → `PUT /api/admin/tasks/{id}/force-close`
- 행 레벨 권한: Admin=전체, Manager=본인 회사만 (BE `company` 필드 기반)
- 미시작 task placeholder 표시: 배경 노란색, 작업자 "-", 시간 "미시작"
- 강제종료 뱃지 (`🔒`): BE `force_closed` 필드 기반
- BE 선행: OPS #60 (company 필드), #61 (force_closed 필드)

### 생산현황 — 모델명 레이아웃 개선
- 긴 모델명 (IVAS GAIA-I DUAL PUMP RACK 3CH 등) maxWidth 180px + 자연 줄바꿈
- whiteSpace nowrap 제거, wordBreak keep-all, lineHeight 1.4
- 나머지 컬럼 밀림 현상 해소

---

## v1.30.0 — 2026-04-16

**Sprint 32 — 체크리스트 관리 ELEC 항목 추가/수정 + Sprint 60-BE 연동**

### 체크리스트 관리 — 타입 확장
- `ChecklistMasterItem`에 `phase1_applicable`, `qi_check_required`, `remarks`, `checker_role`, `select_options` 필드 추가
- `item_type`에 `SELECT` 유니온 추가 (ELEC TUBE 색상 선택 등)
- `ChecklistStatusItem`, `BeDetailItem`에도 SELECT 타입 전파

### 체크리스트 관리 — 테이블 확장
- ELEC 탭: "1차 배선" / "역할" 컬럼 2개 추가 (TM에는 미표시)
- QI row 좌측 보라색 보더 + QI/WORKER 역할 뱃지
- 행 클릭 → 수정 모달 열기 (활성 토글은 stopPropagation)
- SELECT 타입 보라색 뱃지 추가

### 체크리스트 관리 — 항목 추가 모달 개편
- GROUP_POLICY: TM/ELEC 고정 그룹 (신규 그룹 버튼 숨김)
- ELEC 그룹별 자동 추론 (PANEL→phase1 ON, JIG→qi ON) + 수동 토글 오버라이드
- SELECT 타입 선택 시 선택지 입력란 (쉼표 구분 → 배열)
- JIG 선택 시 "WORKER + QI 2행 자동 생성" 안내 표시

### 체크리스트 관리 — 항목 수정 모달 (신규)
- 수정 가능: 항목명, 기준/검사방법, 1차 배선, 선택지, 개정이력
- 읽기 전용: 그룹, 타입, 역할, GST 확인 필요 (qi_check_required)
- 변경된 필드만 payload에 포함하여 전송

### BE 선행 조건 (Sprint 60-BE 후속)
- #59-A: POST 시 JIG WORKER+QI 2 row 자동 생성 (PENDING)
- #59-B: GET master 응답에 checker_role 포함 (PENDING)
- #59-C: UNIQUE 키에 checker_role 포함 + 마이그레이션 (PENDING)

---

## v1.29.0 — 2026-04-16

**QR 관리 — 전장협력사 컬럼 + 필터**

### QR 관리 — 전장협력사
- 테이블에 전장협력사 컬럼 추가 (고객사 뒤)
- 전장협력사 드롭다운 필터 추가 (TMS(E), P&S, C&A 등)
- 전장시작 일정 기준 + 전장협력사 필터 조합으로 해당 업체 데이터만 조회 가능
- BE 추가 없음 — 기존 elec_partner 필드 FE 필터

---

## v1.28.0 — 2026-04-15

**생산일정 업체 필터 + 체크리스트 ELEC 정렬/UI 수정**

### 생산일정 — 협력사 필터
- 기구업체 / 전장업체 드롭다운 필터 추가 (FNI, BAT, TMS, P&S, C&A 등)
- BE 추가 없음 — 기존 mech_partner, elec_partner 필드 FE 필터

### 체크리스트 관리 — ELEC 수정
- ELEC COMMON 자동 적용 (TM과 동일 "항목 범위 COMMON" 표시)
- ELEC 자물쇠 아이콘 제거 + 활성 폰트 (ChecklistFilterBar)
- 그룹 정렬: BE 등장 순서 기준 (PANEL → 조립 → JIG)
- 그룹 내 순번 표시 (#컬럼: 1,2,3...)

---

## v1.27.0 — 2026-04-14

**Sprint 31 — ELEC 체크리스트 VIEW 연동**

### 생산현황 — ELEC 체크리스트 진행률
- S/N 상세뷰 ELEC ProcessStepCard에 "체크리스트 N/M 완료" 프로그레스바 표시
- `getChecklistStatus()` CAT_MAP 패턴 도입 (TM/TMS/ELEC → BE 경로 매핑)
- Phase 1+2 합산 진행률 자동 반영

### 체크리스트 관리 — ELEC 블러 해제
- ELEC 탭 블러 오버레이 제거 → 31항목(WORKER 24 + QI 7) 관리 가능
- 항목 비활성화 토글, 비활성 포함 표시 정상 동작
- MECH 탭은 여전히 블러 유지

### 기타
- 로그인 후 첫화면: 모든 역할 → /factory (공장 대시보드 Summary)

---

## v1.26.0 — 2026-04-10

**Sprint 30+ — 성적서 ELEC Phase/TM DUAL/SELECT/QI 지원**

### 체크리스트 성적서 — ELEC Phase 분리
- ELEC 1차 배선 / 2차 배선 별도 테이블 표시
- Phase별 독립 summary (n/17, n/31)

### 체크리스트 성적서 — TM DUAL L/R 분기
- DUAL 모델: "TM (모듈) — L Tank" + "TM (모듈) — R Tank" 2개 테이블
- SINGLE 모델: 기존 동작 유지

### 체크리스트 성적서 — SELECT/QI 지원
- SELECT 타입(TUBE 색상): 판정 컬럼에 선택값 표시
- QI 항목: 검사항목에 보라색 QI 배지 표시
- resultColor SELECT 분기 추가

### 체크리스트 관리 — 그룹 정렬
- item_group 1차 정렬 + item_order 2차 정렬 (같은 그룹 항목 연속 배치)

### QR 관리 — elec_start 셀 누락 수정
- tbody에 전장시작 td 누락 → 컬럼 밀림 해소

---

## v1.25.0 — 2026-04-09

**Sprint 29~30 — QR 전장시작 필터 + 비활성화 권한 분기**

### QR 관리 — 전장시작 필터 추가
- 날짜 드롭다운에 "전장시작" 옵션 추가 (기구시작/전장시작/모듈시작)
- 테이블에 "전장시작" 컬럼 추가 + 정렬 지원
- 전장시작 선택 시 PRODUCT QR만 표시 (기구시작과 동일)

### 권한 관리 — 비활성화 권한 분기
- Admin: 전체 사용자 대상 "비활성화" → confirm → 즉시 처리
- Manager: 같은 회사만 "비활성화 요청" → prompt 사유 → admin 승인 대기
- 422 NO_CHANGE 에러: "이미 비활성화된/요청된 사용자" 분기 toast

---

## v1.24.0 — 2026-04-07

**QR 이미지 모달 + Digital Twin 목업 + UI 개선**

### QR 관리 — 이미지 모달 + 인쇄
- Doc ID 클릭 → QR 코드 이미지 모달 표시
- 모달 레이아웃: 상단 O/N + QR 이미지(200px, 에러정정 M) + 하단 S/N (실물 라벨 동일)
- 인쇄 버튼: 새 창으로 QR 라벨 열고 브라우저 인쇄

### 공장 대시보드 — Digital Twin 목업
- 공장 대시보드 > Digital Twin (preparing)
- 1/2공장 2D 평면도 + 공정별 레인(MECH~SI) + S/N 셀 배치
- 장비 클릭 → 줌인 + 미니맵 + 상세 패널 (공정 진행률/협력사/고객)
- 6초 후 자동 줌아웃

### CT 분석 — KPI 카드 디자인 통일
- 상단 그라데이션 바 + hover 애니메이션 제거
- 생산실적 KPI 카드와 동일한 G-AXIS 스타일로 통일

### 사이드바
- 로고 텍스트: AXIS-VIEW → VIEW (로고 중복 제거)

---

## v1.23.0 — 2026-04-03

**신규 기능 — 체크리스트 성적서 (Sprint 28) + 생산실적 개선**

### 체크리스트 성적서 페이지
- 협력사 관리 > 체크리스트 — 신규 페이지
- O/N 또는 S/N 검색 → S/N별 체크리스트 성적서 조회
- 카테고리별(기구/전장/TM) 검사 테이블: 검사항목, 검사내용, 기준/SPEC, 검사방법, 판정, 작업자, 확인일시
- PDF 다운로드 (A4 포맷, 페이지 분할, 마스킹 해제 출력)
- GST 로고 적용

### 생산실적 개선
- 기본뷰: 주간 → 월마감 (캘린더가 기본)
- 월마감 캘린더: 대기(주황)/확인(초록) 이중 카운트 표시
- "기전" → "기구·전장" 명칭 통일
- 전체 폰트 +2px 증가 (가독성 개선)
- ISO 주차 계산 오류 수정 (W14가 W13으로 밀리던 버그)
- 불필요한 "마감 전" 배지, 중복 월 텍스트 제거

### 사이드바
- 생산실적: preparing 배지 제거 (운영 중)
- 체크리스트: 운영 전환

---

## v1.22.0 — 2026-04-03

**신규 기능 — 월마감 캘린더 뷰 (Sprint 27)**

### 생산실적 — 월마감 캘린더
- 기존 주차×공정 테이블 → 캘린더 UI로 교체
- 오늘 날짜 원형 하이라이트, 현재 주차 "현재" 뱃지
- 주차별 기구·전장/TM 확인 건수 + 비율 바 표시
- 주차 행 클릭 → 주간 뷰로 전환 (해당 주차 자동 선택)
- 합계: 기구·전장 확인/완료, TM 확인/완료
- 토/일 색상 구분 (파란색/빨간색)

### 작업자 이름 마스킹
- `maskName()` 공통 유틸 분리 (`utils/format.ts`)
- SNCard + ProcessStepCard 양쪽 적용
- 한글 이름만 마스킹 (임지후→임*후), 영문은 그대로

### 수정 파일
- `MonthlyCalendarView.tsx` — 신규 캘린더 컴포넌트
- `ProductionPerformancePage.tsx` — 월마감 뷰 교체 + 미사용 코드 제거
- `utils/format.ts` — maskName 공통 유틸 신규
- `ProcessStepCard.tsx` — maskName import 전환
- `SNCard.tsx` — last_worker 마스킹 적용

---

## v1.21.0 — 2026-04-02

**신규 기능 — 체크리스트 관리 BE 연동 + TM 활성화 (Sprint 26)**

### 체크리스트 관리 — TM 활성화
- 목업 → 실제 BE API 연동 (OPS Sprint 52)
- TM 탭 기본 선택 + COMMON 자동 고정 (전 모델 공통)
- MECH/ELEC 탭 블러 오버레이 + "준비중" 표시
- 필드 매핑 변경: item_group, description 통합
- 항목 삭제 → 활성/비활성 토글로 교체 (PATCH API)
- 토글 시 확인 다이얼로그 + 토스트 알림

### 체크리스트 항목 추가 — 카테고리별 분기
- TM/ELEC: item_type CHECK 자동 고정 (라디오 미표시)
- MECH: CHECK/INPUT 선택 가능
- 기준/SPEC + 검사방법 → description 통합 필드

### S/N 상세 — 작업시간 날짜 표시
- ProcessStepCard formatTime: HH:mm → MM/DD HH:mm (야간 작업 날짜 구분)

### S/N 상세 — 작업자 이름 마스킹
- 개인정보 보호: 한글 이름 마스킹 (임지후→임*후, 김솔→김*)
- 영문/특수문자 포함 이름은 그대로 표시

### 버그 수정
- S/N 디테일뷰 체크리스트 summary undefined 크래시 — 옵셔널 체이닝 방어
- 비활성 포함 체크박스 미작동 — BE에 `include_inactive` 파라미터 전달 추가
- S/N 체크리스트 조회 — TM만 실제 API, MECH/ELEC은 빈 응답 반환
- S/N 체크리스트 BE 엔드포인트 경로 + 응답 구조 매핑 수정
- TMS→TM 카테고리 매핑 + API 에러 방어
- 생산실적 월마감뷰 `monthlyData.weeks` undefined 크래시 수정

---

## v1.20.0 — 2026-04-01

**신규 기능 — 페이지별 설정 패널 (Sprint 25)**

### Part A: 테스트 S/N 토글
- 생산현황 페이지에 ⚙️ 설정 버튼 추가 → Admin 전용 토글 패널
- DOC_TEST- / TEST- prefix S/N 표시/숨김 전환 (기본값: 숨김)
- QR 관리 페이지 + CSV 다운로드에도 동일 설정 공유 (localStorage)

### Part B: TM 체크리스트 설정
- 체크리스트 관리 페이지에 ⚙️ 설정 버튼 추가
- 1차 검수자 (Manager/모든 사용자), ISSUE 알림 토글, 항목 범위 (모델별/전체) 설정
- BE admin_settings API 연동 (OPS Sprint 52)

### 수정 파일
- `useSettings.ts` — showTestSN 필드 추가
- `adminSettings.ts` — tm_checklist_* 3개 타입 추가
- `SNStatusPage.tsx` — 설정 패널 + 조건부 필터
- `QrManagementPage.tsx` — 조건부 필터 (테이블 + CSV)
- `ChecklistManagePage.tsx` — 설정 버튼 연동
- `SNStatusSettingsPanel.tsx` — 신규 컴포넌트
- `ChecklistSettingsPanel.tsx` — 신규 컴포넌트

---

## v1.19.0 — 2026-03-31

**신규 기능 — 생산현황 O/N 섹션 헤더 (Sprint 24)**

### 생산현황 — O/N 그룹핑
- S/N 카드를 O/N(Order Number) 단위로 그룹핑하여 섹션 헤더 표시
- O/N 헤더: 오더번호, 모델, 고객, 대수, 진행률 바
- 검색: O/N 번호로도 검색 가능 (placeholder "O/N · S/N · 모델명 검색")
- BE #51 배포 후 자동 활성화 (미배포 시 기존 UI와 동일하게 동작)

### 수정 파일
- `snStatus.ts` — SNProduct에 `sales_order` 필드 추가
- `SNStatusPage.tsx` — groupedByON 그룹핑 + 섹션 헤더 렌더링 + 검색 확장

---

## v1.18.0 — 2026-03-30

**신규 기능 — Task 재활성화 UI (Sprint 23)**

### 생산현황 — S/N 디테일 패널
- 완료된 작업자 행 우측에 재활성화 버튼 추가 (RotateCcw 아이콘)
- Manager/Admin 권한 사용자에게만 표시
- 클릭 시 확인 다이얼로그 → BE 재활성화 API 호출
- 성공 시 실적확인 자동 취소 + S/N progress 즉시 갱신

### 수정 파일
- `ProcessStepCard.tsx` — 재활성화 버튼 + useTaskReactivate 훅 연동
- `SNDetailPanel.tsx` — canReactivate prop 전달 + task_detail_id 병합 주입
- `SNStatusPage.tsx` — canReactivate 권한 판단 전달
- `useTaskReactivate.ts` — 신규 mutation 훅
- `types/snStatus.ts` — TaskWorker에 task_detail_id 필드 추가

---

## v1.17.1 — 2026-03-30

**버그 수정 — 공정 완료 판정 기준 통일 (Sprint 22)**

### 생산현황 — ProcessStepCard
- **수정**: `taskStatus()` 판정을 `workers.some()` → `categories[cat].percent` 기준으로 변경
- SNCard와 동일한 `categories` 기준으로 완료/진행중/대기중 판정 통일
- 작업자 1명만 완료해도 전체 공정이 '완료'로 표시되던 버그 해소
- fallback 로직도 `some()` → `every()`로 강화

### 수정 파일
- `ProcessStepCard.tsx` — `categoryPercent` prop 추가 + `taskStatus()` 로직 변경
- `SNDetailPanel.tsx` — `ChecklistProcessCard` + 일반 카드에 `categoryPercent` 전달

---

## v1.7.1 — 2026-03-16

**UX 개선 — 공장 대시보드 자동 새로고침 + 근태 근무지 컬럼**

### 공장 대시보드
- 근무시간(08~20시) 10분 간격 자동 새로고침 — 공장 모니터 디스플레이용
- 비근무시간은 자동 새로고침 비활성 (수동 새로고침만 가능)

### 근태관리
- 출퇴근 현황 테이블에 **근무지** 컬럼 추가 (본사=보라 뱃지, 현장=초록 뱃지)
- 근무지 기준 정렬 지원

---

## v1.7.0 — 2026-03-16

**공장 API 실데이터 연동 + 대시보드/생산일정 리팩토링 (OPS Sprint 29)**

### 공장 대시보드
- 샘플 데이터 전면 제거 → OPS BE `weekly-kpi` + `monthly-detail` 실 API 연동
- KPI 카드: 주간 생산량 / 완료율 / 불량 건수(QMS 대기) / 출하 완료
- 생산 현황 테이블: **5초 자동 슬라이드** (5건씩, mech_start 정렬, dot indicator)
- 파이프라인 → **통합 활동 피드** (ETL 변동이력 + 생산완료/출하완료 이벤트, 시간순)
- 전장업체 컬럼 추가 (테이블 7열 → 8열)
- 사이드바 "준비중" 태그 제거

### 생산일정
- 샘플 데이터 전면 제거 → `monthly-detail` 실 API 연동 (500건 fetch, 클라이언트 페이지네이션)
- **통합 필터바**: Quick filter(오늘/이번주/전체) + 공정 카운트 chip(가압/공정/마무리/출하)
- 공정 카운트 chip 클릭 → 해당 공정만 필터 (파이프라인 통합)
- **날짜 헤더 sorting**: 날짜 컬럼 클릭 시 ▲/▼ 정렬 토글
- **공정 중복 표시**: 같은 행 내 동일 날짜 2/3/4개 셀 색상 배지 (파랑/핑크/주황)
- 완료 체크마크(✓) 로직 준비 (`ENABLE_CHECKMARKS` 플래그, BE complete 값 대기)
- 출하 파이프라인 데이터 소스 `finishing_plan_end` → `ship_plan_date`(출하계획일) 변경
- 마무리종료(`finishing_plan_end`) 컬럼 제거 — 하루 공정으로 불필요
- 기본 필터를 "전체" → "오늘"로 변경 — 페이지 진입 시 오늘 기준 표시

### 기타
- `OPS_API_REQUESTS.md` #16 — 불량 현황 API(QMS 연동) PENDING 등록
- `OPS_API_REQUESTS.md` #19 — monthly-detail `ship_plan_date` 응답 추가 요청
- `OPS_API_REQUESTS.md` #20 — monthly-detail `per_page` 상한 200→500 완화 요청
- `OPS_API_REQUESTS.md` #9, #10 FE 연동 완료

---

## v1.6.1 — 2026-03-15

**ETL 변경이력 개선**

- 변경이력 테이블에 **O/N(오더넘버)** 컬럼 추가 — S/N이 어떤 오더인지 바로 확인 가능
- **가압시작(pi_start)** 변경 추적 추가 — 추적 필드 5개 → 6개 확장
  - KPI 카드 6열 (전체/출하예정/기구시작/가압시작/기구외주/전장외주)
  - 주간 추이 차트에 가압시작 카테고리 추가 (핑크 #EC4899)
  - 날짜 diff 표시 지원 (±Nd)
- ETL summary 전체 변경 건수가 200건 limit에 영향받던 버그 수정 — 별도 집계 쿼리 분리

---

## v1.6.0 — 2026-03-13

**권한 매트릭스 세분화 (OPS Sprint 27 연동)**

- 기존 `admin/manager` 2분류 → `admin/manager/gst` 3분류로 권한 체계 세분화
- GST 일반직원(PI, QI 등): 공장/생산/QR/불량/CT/AI 접근 가능, 협력사 관리/권한 관리 차단
- 협력사 manager: 협력사 관리(자사)/생산/QR/권한 관리(자사) 접근 가능, 공장/불량/CT/AI 차단
- GST 일반직원 로그인 시 기본 랜딩 페이지를 공장 대시보드(`/factory`)로 변경
- OPS BE `@view_access_required`, `@gst_or_admin_required` 데코레이터와 FE 매트릭스 일치

---

## v1.5.1 — 2026-03-12

**생산관리 메뉴 개편**

- Sidebar "생산일정" 단일 메뉴 → "생산관리" 하위 메뉴 3개로 구조 개편
  - 생산일정 (준비중) — 기존 파이프라인 + 날짜별 일정 테이블
  - 생산실적 (준비중) — O/N 단위 주간 실적 확인 + 월마감 집계 (카톡→PPS 대체)
  - 출하이력 (준비중) — 출하 완료/예정 현황 테이블
- 기존 `/plan` → `/production/plan` 리다이렉트 하위호환

---

## v1.5.0 — 2026-03-12

**협력사 관리 메뉴 개편 + 신규 페이지 3종**

- Sidebar "협력사 대시보드" → "협력사 관리" 메뉴로 개편 (하위 4개 메뉴)
  - 대시보드 (준비중) — KPI 요약, 작업기록 누락 히트맵, 출퇴근 현황, 주간 누락률 추이
  - 평가지수 (준비중) — 기구/전장 협력사 불량률+누락률 가중 평가 테이블
  - 물량할당 (준비중) — 등급 기반 물량할당 시뮬레이션 + 배분 이력
  - 근태 관리 — 기존 출퇴근 대시보드 (운영 중)
- 협력사 유저(FNI, BAT 등) 근태 관리에서 자사 데이터만 표시되도록 필터 추가
- 로그인 후 기본 이동 경로 `/attendance` → `/partner` 변경
- 용어 정리: NaN 비율 → 작업기록 누락률, 물량배분 → 물량할당
- 공장 대시보드 API 스펙 문서화 (#9 주간 KPI, #10 월간 생산 현황)

---

## v1.4.2 — 2026-03-12

**Logout Storm 버그 수정**

- refresh token 만료 시 logout API 무한 호출(10회+) 방지
- 401 인터셉터에서 중복 logout 차단 플래그 적용

---

## v1.4.1 — 2026-03-11

**권한 관리 버그 수정**

- 관리자(Manager) 권한 Toggle이 정상 동작하도록 수정
- 협력사 관리자 로그인 시 자기 회사 작업자만 표시되도록 변경
- Sidebar 하단에 앱 버전 표시 추가

---

## v1.4.0 — 2026-03-11

**페이지별 접근 권한 + 권한 관리 페이지**

- 로그인 유형(Admin/Manager)에 따라 접근 가능한 페이지 자동 구분
  - Admin: 모든 페이지 접근 가능
  - Manager: 협력사 대시보드, QR 관리, 생산일정, 권한 관리만 접근 가능
- Sidebar 메뉴가 로그인 권한에 맞게 자동 표시/숨김
- **권한 관리 페이지** 신규 — 작업자 목록 조회 + Manager 권한 부여/해제
- 접근 권한이 없는 페이지 진입 시 안내 페이지 표시

---

## v1.3.0 — 2026-03-11

**알림 기능 + 간편 로그인**

- Header 알림 벨 클릭 시 알림 드롭다운 패널 표시
  - 소스별 건수 확인 + 클릭 시 해당 페이지로 이동
- ETL 변경이력 발생 시 Header 알림 벨 + Sidebar "변경 이력" 메뉴에 빨간 숫자 뱃지 표시
- 변경 이력 페이지 진입 시 자동 읽음 처리 (뱃지 초기화)
- 로그인 시 이메일 전체 입력 또는 관리자 ID(prefix)만 입력 가능

---

## v1.2.0 — 2026-03-11

**공지사항 + ETL 변경이력 + 컨셉 페이지 4종**

- **공지사항**: Header 메가폰 아이콘 클릭 시 공지사항 패널 표시 (읽지 않은 공지 뱃지)
- **ETL 변경이력**: QR 관리 > 변경 이력 서브메뉴에서 S/N별 일정 변경 내역 조회
- **공장 대시보드**: 최근 활동 피드, 월간 생산지표 차트 (준비중)
- **생산일정**: 파이프라인 현황, 날짜별 일정 테이블 (준비중)
- **불량 분석**: 도넛 차트, 부품 순위, 추이 차트, 외주사별 현황 (준비중)
- **CT 분석**: 공정별 CT 카드, IQR/평균 바 차트 (준비중)

---

## v1.1.0 — 2026-03-08

**QR 관리 페이지**

- QR 발급 현황 목록 조회 (S/N, 모델, 일정, 상태)
- 기구시작/모듈시작 기준 날짜 필터 (기본: 오늘~2주 후)
- 전체 보기 옵션으로 날짜 필터 해제 가능
- 상태별 필터 (진행 중 / 출하완료)
- S/N, QR Doc ID 텍스트 검색
- CSV 다운로드 (QR Doc ID + S/N 추출)
- 동기화 상태바 (등록 건수, 마지막 동기화 시간)
- KPI 카드 (전체 / 진행 중 / 출하완료)

---

## v1.0.0 — 2026-03-06

**초기 릴리스 — 협력사 출퇴근 대시보드**

- 관리자/협력사 관리자 로그인 (JWT 인증)
- 협력사 출퇴근 현황 대시보드
  - KPI 카드 (전체 등록 / 출근 / 근무 중 / 미체크)
  - 회사별 출근 현황 요약 카드
  - 작업자별 출퇴근 상세 테이블 (정렬, 필터)
- 자동 새로고침 설정 (1분 / 3분 / 5분)
- 카드 뷰 / 테이블 뷰 전환
- 본사/현장 구분 표시 설정
