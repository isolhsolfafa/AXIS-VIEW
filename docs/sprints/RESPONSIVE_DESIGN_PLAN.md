# AXIS-VIEW 반응형 레이아웃 설계 (v2 — 전면 재점검)

> 최초 작성: 2026-03-16 (Sprint 4 Phase B~D)
> 전면 개정: 2026-03-27 | 기준 버전: v1.15.2
> 상태: 설계 완료, 구현 보류
> 우선 목표: 태블릿(768~1024px) 정상 표시

---

## 1. 현재 상태 분석

### 1.1 레이아웃 구조
- **Sidebar**: 260px 고정 (`--sidebar-width` CSS 변수), `position: fixed`
- **Header**: 64px sticky (`--header-height`), 햄버거 버튼 없음
- **Layout**: `marginLeft: var(--sidebar-width)` + `flex: 1`
- **Main**: `padding: 28px 32px`, `maxWidth: 1440px`
- **반응형 로직**: CSS media query 2개만 존재, 사이드바 접기/토글 없음

### 1.2 전체 페이지 목록 (18개)

| # | 페이지 | 파일 경로 | 인라인 그리드 수 | 반응형 상태 |
|---|--------|----------|:---:|:---:|
| 1 | 공장 대시보드 | factory/FactoryDashboardPage.tsx | 3 | ❌ |
| 2 | 협력사 대시보드 | partner/PartnerDashboardPage.tsx | 4 | ❌ |
| 3 | 협력사 평가 | partner/PartnerEvaluationPage.tsx | 1 | ❌ |
| 4 | 협력사 배분 | partner/PartnerAllocationPage.tsx | 1 | ❌ |
| 5 | 불량 분석 | defect/DefectAnalysisPage.tsx | 4 | ❌ |
| 6 | CT 분석 | ct/CtAnalysisPage.tsx | 1 | ❌ |
| 7 | 생산 실적 | production/ProductionPerformancePage.tsx | 1 | ❌ |
| 8 | 출하 이력 | production/ShipmentHistoryPage.tsx | 1 | ❌ |
| 9 | 생산 현황 | production/SNStatusPage.tsx | 2 | ✅ auto-fill |
| 10 | 생산 일정 | plan/ProductionPlanPage.tsx | 1 | ❌ |
| 11 | 사용자 분석 | analytics/AnalyticsDashboardPage.tsx | 2 | ❌ |
| 12 | QR 관리 | qr/QrManagementPage.tsx | 1 | ❌ |
| 13 | ETL 변경이력 | qr/EtlChangeLogPage.tsx | 1 | ❌ |
| 14 | 권한 관리 | admin/PermissionsPage.tsx | 1 | ❌ |
| 15 | 근태 관리 | attendance/AttendancePage.tsx | 0 | ✅ CSS 클래스 |
| 16 | 체크리스트 | checklist/ChecklistManagePage.tsx | 0 | — |
| 17 | 로그인 | LoginPage.tsx | 0 | — |
| 18 | 권한없음 | UnauthorizedPage.tsx | 0 | — |

**요약: 14개 페이지에 인라인 그리드 24개, 반응형 미적용**

### 1.3 인라인 그리드 전체 목록 (24개)

#### 4열 KPI 패턴 — `repeat(4, 1fr)` (6개)
| 파일 | 라인 | 용도 | 필요 클래스 |
|------|------|------|-----------|
| FactoryDashboardPage.tsx | L241 | KPI 카드 | `kpi-grid` |
| PartnerDashboardPage.tsx | L89 | KPI 카드 | `kpi-grid` |
| DefectAnalysisPage.tsx | L168 | 공정 카드 | `kpi-grid` |
| CtAnalysisPage.tsx | L197 | 공정 요약 | `kpi-grid` |
| AnalyticsDashboardPage.tsx | L143 | KPI 카드 | `kpi-grid` |
| ShipmentHistoryPage.tsx | L52 | KPI 카드 | `kpi-grid` |

#### 3열 패턴 — `repeat(3, 1fr)` (3개)
| 파일 | 라인 | 용도 | 필요 클래스 |
|------|------|------|-----------|
| QrManagementPage.tsx | L397 | 상태 카드 | `kpi-grid` |
| PermissionsPage.tsx | L145 | 권한 매트릭스 | `kpi-grid` |
| DefectAnalysisPage.tsx | L406 | 업체별 카드 | `kpi-grid` |

#### 2열 패턴 — `1fr 1fr` (6개)
| 파일 | 라인 | 용도 | 필요 클래스 |
|------|------|------|-----------|
| AnalyticsDashboardPage.tsx | L201 | 테이블+차트 | `chart-grid` |
| DefectAnalysisPage.tsx | L204 | 도넛+랭킹 | `chart-grid` |
| DefectAnalysisPage.tsx | L447 | 상세 그리드 | `chart-grid` |
| PartnerDashboardPage.tsx | L229 | 하단 섹션 | `bottom-grid` |
| PartnerAllocationPage.tsx | L115 | 배분 그리드 | `chart-grid` |
| PartnerEvaluationPage.tsx | L198 | 평가 카드 | `chart-grid` |
| FactoryDashboardPage.tsx | L483 | 하단 섹션 | `bottom-grid` |

#### 2:1 비율 패턴 — `2fr 1fr` (2개)
| 파일 | 라인 | 용도 | 필요 클래스 |
|------|------|------|-----------|
| FactoryDashboardPage.tsx | L266 | 차트+사이드 | `chart-grid` |
| PartnerDashboardPage.tsx | L125 | 히트맵+사이드 | `chart-grid` |

#### 3열 특수 패턴 — `1fr 1fr 1fr` (1개)
| 파일 | 라인 | 용도 | 필요 클래스 |
|------|------|------|-----------|
| PartnerDashboardPage.tsx | L195 | 근태/갭 카드 | `kpi-grid` |

#### 동적 그리드 (3개)
| 파일 | 라인 | 현재 | 비고 |
|------|------|------|------|
| ProductionPerformancePage.tsx | L572 | `repeat(4,1fr)` or `repeat(3,1fr)` 탭 동적 | `kpi-grid` (4열일때만 축소) |
| ProductionPlanPage.tsx | L384 | `repeat(${N}, 1fr)` 동적 | 별도 `stage-grid` 클래스 필요 |
| EtlChangeLogPage.tsx | L180 | `repeat(7, 1fr)` | `kpi-grid-7` 신규 필요 |

#### 이미 반응형 (2개) — 수정 불필요
| 파일 | 라인 | 현재 |
|------|------|------|
| SNStatusPage.tsx | L136 | `auto-fill, minmax(280px, 1fr)` |
| SNStatusPage.tsx | L154 | `auto-fill, minmax(280px, 1fr)` |

### 1.4 기존 CSS media query (index.css L226~235)
```css
@media (max-width: 1200px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .chart-grid { grid-template-columns: 1fr !important; }
  .company-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .bottom-grid { grid-template-columns: 1fr !important; }
}
@media (max-width: 768px) {
  .kpi-grid { grid-template-columns: 1fr !important; }
  .company-grid { grid-template-columns: 1fr !important; }
}
```

---

## 2. 브레이크포인트 설계

| 범위 | 대상 | 사이드바 | KPI 그리드 | 차트 그리드 | 네비게이션 |
|------|------|---------|-----------|-----------|-----------|
| >1024px | 데스크톱 | 펼침 260px (토글 가능) | 원본 열 수 | 원본 비율 | 사이드바 |
| 768~1024px | **태블릿** | **자동 접힘 64px** | **2~3열** | **1열 스택** | 사이드바 접힌 |
| <768px | 모바일 | 숨김 + 오버레이 | 1~2열 | 1열 스택 | 하단 탭 바 |

---

## 3. Phase B — 사이드바 접기 (태블릿 핵심)

> 태블릿에서 260px 사이드바가 콘텐츠 영역을 심하게 압축하는 문제 해결

### B-1: CSS 변수 추가 (index.css)
```css
:root {
  --sidebar-collapsed-width: 64px;
}
```

### B-2: Layout.tsx 변경
```tsx
// 추가할 상태
const [collapsed, setCollapsed] = useState(() =>
  localStorage.getItem('sidebar_collapsed') === 'true'
);

// matchMedia 리스너
useEffect(() => {
  const mql = window.matchMedia('(max-width: 1024px)');
  const handler = (e: MediaQueryListEvent) => setCollapsed(e.matches);
  mql.addEventListener('change', handler);
  // 초기값
  if (mql.matches) setCollapsed(true);
  return () => mql.removeEventListener('change', handler);
}, []);

// marginLeft 동적 변경
const sidebarWidth = collapsed
  ? 'var(--sidebar-collapsed-width)'
  : 'var(--sidebar-width)';
```

### B-3: Sidebar.tsx 변경
- `collapsed` prop 수신
- 접힌 상태: width 64px, 아이콘만 표시
- hover 시 label 툴팁 표시
- 하위 메뉴: 접힌 상태에서 hover 시 팝오버
- 하단 토글 버튼 (chevron 아이콘)
- localStorage에 상태 저장

### B-4: Header.tsx 변경
- 좌측에 햄버거 버튼 추가 (768px 이하에서만 표시)
- 클릭 시 사이드바 오버레이 열기

---

## 4. Phase C — KPI/차트 반응형

### C-1: index.css media query 추가/수정

```css
/* ── 기존 유지 ── */
.kpi-grid { display: grid; gap: 16px; }
.chart-grid { display: grid; gap: 16px; }
.bottom-grid { display: grid; gap: 16px; }
.company-grid { display: grid; gap: 16px; }

/* ── 신규: 7열 그리드 (EtlChangeLogPage) ── */
.kpi-grid-7 { display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; }

/* ── 신규: 스테이지 필터 그리드 (ProductionPlanPage) ── */
.stage-grid { display: grid; gap: 8px; }

/* ── 태블릿 (768~1024px) ── */
@media (max-width: 1024px) {
  .kpi-grid-7 { grid-template-columns: repeat(4, 1fr) !important; }
  .stage-grid { grid-template-columns: repeat(3, 1fr) !important; }
}

/* ── 기존 수정: 1200px ── */
@media (max-width: 1200px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .chart-grid { grid-template-columns: 1fr !important; }
  .company-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .bottom-grid { grid-template-columns: 1fr !important; }
  .kpi-grid-7 { grid-template-columns: repeat(3, 1fr) !important; }
  .stage-grid { grid-template-columns: repeat(2, 1fr) !important; }
}

/* ── 모바일 (768px 이하) ── */
@media (max-width: 768px) {
  .kpi-grid { grid-template-columns: 1fr !important; }
  .company-grid { grid-template-columns: 1fr !important; }
  .kpi-grid-7 { grid-template-columns: repeat(2, 1fr) !important; }
  .stage-grid { grid-template-columns: repeat(2, 1fr) !important; }
}
```

### C-2: 각 페이지 className 추가 (인라인 유지 + className 병행)

인라인 `gridTemplateColumns`는 데스크톱 기본값으로 유지하고,
className을 추가해서 media query가 `!important`로 오버라이드.

**작업 목록 — 4열 KPI (6개 파일)**
| 파일 | 라인 | 추가할 className |
|------|------|-----------------|
| FactoryDashboardPage.tsx | L241 | `className="kpi-grid"` |
| PartnerDashboardPage.tsx | L89 | `className="kpi-grid"` |
| DefectAnalysisPage.tsx | L168 | `className="kpi-grid"` |
| CtAnalysisPage.tsx | L197 | `className="kpi-grid"` |
| AnalyticsDashboardPage.tsx | L143 | `className="kpi-grid"` |
| ShipmentHistoryPage.tsx | L52 | `className="kpi-grid"` |

**작업 목록 — 3열 KPI (3개 파일)**
| 파일 | 라인 | 추가할 className |
|------|------|-----------------|
| QrManagementPage.tsx | L397 | `className="kpi-grid"` |
| PermissionsPage.tsx | L145 | `className="kpi-grid"` |
| DefectAnalysisPage.tsx | L406 | `className="kpi-grid"` |

**작업 목록 — 2열 차트 (7개)**
| 파일 | 라인 | 추가할 className |
|------|------|-----------------|
| AnalyticsDashboardPage.tsx | L201 | `className="chart-grid"` |
| DefectAnalysisPage.tsx | L204 | `className="chart-grid"` |
| DefectAnalysisPage.tsx | L447 | `className="chart-grid"` |
| PartnerAllocationPage.tsx | L115 | `className="chart-grid"` |
| PartnerEvaluationPage.tsx | L198 | `className="chart-grid"` |
| PartnerDashboardPage.tsx | L229 | `className="bottom-grid"` |
| FactoryDashboardPage.tsx | L483 | `className="bottom-grid"` |

**작업 목록 — 2:1 비율 차트 (2개)**
| 파일 | 라인 | 추가할 className |
|------|------|-----------------|
| FactoryDashboardPage.tsx | L266 | `className="chart-grid"` |
| PartnerDashboardPage.tsx | L125 | `className="chart-grid"` |

**작업 목록 — 3열 특수 (1개)**
| 파일 | 라인 | 추가할 className |
|------|------|-----------------|
| PartnerDashboardPage.tsx | L195 | `className="kpi-grid"` |

**작업 목록 — 동적 그리드 (3개)**
| 파일 | 라인 | 추가할 className | 비고 |
|------|------|-----------------|------|
| ProductionPerformancePage.tsx | L572 | `className="kpi-grid"` | 탭 전환 시 3~4열 동적, 태블릿에서 2열로 축소 |
| ProductionPlanPage.tsx | L384 | `className="stage-grid"` | 스테이지 수 동적, 태블릿에서 3열로 축소 |
| EtlChangeLogPage.tsx | L180 | `className="kpi-grid-7"` | 7열 → 태블릿 4열 → 모바일 2열 |

**수정 불필요**
| 파일 | 라인 | 사유 |
|------|------|------|
| SNStatusPage.tsx | L136, L154 | `auto-fill, minmax(280px, 1fr)` 이미 반응형 |

### C-3: 메인 패딩 반응형 (Layout.tsx)
```css
/* 태블릿에서 좌우 패딩 축소 */
@media (max-width: 1024px) {
  .main-content { padding: 20px 16px !important; }
}
@media (max-width: 768px) {
  .main-content { padding: 16px 12px !important; }
}
```

---

## 5. Phase D — 모바일 네비게이션 (선택적)

### D-1: MobileNav.tsx (신규 컴포넌트)
- 768px 이하에서만 렌더링
- 하단 고정 56px
- 5탭: 대시보드 / 생산 / QR / 협력사 / 더보기
- Sidebar와 동일한 roles 필터 적용
- "더보기" → 드로어로 나머지 메뉴 (권한관리, 불량, CT 등)

### D-2: 터치 타겟
- 클릭 타겟 최소 44x44px
- main padding-bottom: 72px (768px 이하)

---

## 6. 수정 파일 목록 (총 ~20개)

| # | 파일 | Phase | 변경 내용 |
|---|------|-------|----------|
| 1 | `index.css` | B,C | CSS 변수 + media query 추가/수정 |
| 2 | `Layout.tsx` | B,C | collapsed state + className="main-content" + 반응형 패딩 |
| 3 | `Sidebar.tsx` | B | collapsed 모드 + 토글 + 오버레이 |
| 4 | `Header.tsx` | B | 햄버거 버튼 (모바일) |
| 5 | `MobileNav.tsx` (신규) | D | 하단 네비게이션 |
| 6 | `FactoryDashboardPage.tsx` | C | L241, L266, L483 className 추가 |
| 7 | `PartnerDashboardPage.tsx` | C | L89, L125, L195, L229 className 추가 |
| 8 | `PartnerEvaluationPage.tsx` | C | L198 className 추가 |
| 9 | `PartnerAllocationPage.tsx` | C | L115 className 추가 |
| 10 | `DefectAnalysisPage.tsx` | C | L168, L204, L406, L447 className 추가 |
| 11 | `CtAnalysisPage.tsx` | C | L197 className 추가 |
| 12 | `ProductionPerformancePage.tsx` | C | L572 className 추가 |
| 13 | `ShipmentHistoryPage.tsx` | C | L52 className 추가 |
| 14 | `ProductionPlanPage.tsx` | C | L384 className 추가 |
| 15 | `AnalyticsDashboardPage.tsx` | C | L143, L201 className 추가 |
| 16 | `QrManagementPage.tsx` | C | L397 className 추가 |
| 17 | `EtlChangeLogPage.tsx` | C | L180 className 추가 |
| 18 | `PermissionsPage.tsx` | C | L145 className 추가 |

---

## 7. 구현 우선순위

태블릿 우선이면 이 순서로 진행:

### Step 1: Phase B (사이드바 접기) — 영향 가장 큼
태블릿에서 260px 사이드바가 콘텐츠를 압축하는 게 가장 큰 문제.
사이드바만 접어도 태블릿 체감이 크게 개선됨.
수정 파일: Layout.tsx, Sidebar.tsx, index.css (3개)

### Step 2: Phase C (KPI/차트 반응형) — 페이지별 작업
사이드바 접힌 상태에서 남은 그리드 깨짐을 className으로 해결.
수정 파일: 14개 페이지 + index.css

### Step 3: Phase D (모바일 네비) — 선택적
태블릿 먼저라면 Phase D는 후순위.
모바일 앱(OPS APP)이 있으므로 VIEW의 모바일 대응은 참고용.

---

## 8. 검증 체크리스트

### Phase B 검증
- [ ] `npm run build` 에러 없음
- [ ] 1440px: 사이드바 펼침 260px, 전체 정상
- [ ] 1024px: 사이드바 자동 접힘 64px, 아이콘 표시
- [ ] 사이드바 토글 버튼 동작 + localStorage 유지
- [ ] 접힌 상태에서 hover 시 메뉴 라벨 표시
- [ ] 하위 메뉴 팝오버 정상 동작

### Phase C 검증
- [ ] 1200px: KPI 2열, 차트 1열 스택
- [ ] 1024px: 사이드바 접힌 + KPI 2열 조합 확인
- [ ] 768px: KPI 1열, 차트 1열
- [ ] EtlChangeLogPage: 7열 → 4열 → 2열 축소 확인
- [ ] ProductionPlanPage: 동적 스테이지 그리드 축소 확인
- [ ] ProductionPerformancePage: 탭 전환 시 반응형 유지 확인
- [ ] SNStatusPage: 기존 auto-fill 깨지지 않음 확인

### Phase D 검증
- [ ] 768px 이하: 하단 탭 바 표시, 사이드바 숨김
- [ ] 햄버거 버튼으로 오버레이 사이드바 열기/닫기
- [ ] 터치 타겟 44x44px 이상
- [ ] padding-bottom 72px 적용

---

## 부록: v1 대비 변경 이력

### 신규 추가된 페이지 (v1 문서에 없던 것)
| 페이지 | 그리드 수 | 반응형 대응 필요 |
|--------|:---:|:---:|
| AnalyticsDashboardPage | 2 | O |
| PartnerAllocationPage | 1 | O |
| PartnerEvaluationPage | 1 | O |
| ProductionPlanPage | 1 | O |
| SNStatusPage | 2 | X (이미 반응형) |
| AttendancePage | 0 | X (CSS 클래스) |
| ChecklistManagePage | 0 | X |

### 기존 대비 변경된 사항
| 항목 | v1 (2026-03-16) | v2 (2026-03-27) |
|------|-----------------|-----------------|
| 총 페이지 수 | 11 | 18 |
| 인라인 그리드 수 | 9 | 24 |
| 수정 대상 파일 | ~15 | ~20 |
| EtlChangeLogPage 열 수 | 6열 | 7열 |
| ProductionPerformancePage | 5열 고정 | 3~4열 동적 (탭 의존) |
| DefectAnalysisPage 그리드 | 1개 | 4개 |
| PartnerDashboardPage 그리드 | 1개 | 4개 |
| FactoryDashboardPage 그리드 | 1개 | 3개 |
| 기준 버전 | v1.8.0 | v1.15.2 |
