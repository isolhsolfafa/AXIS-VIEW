# AXIS-VIEW 스프린트 문서

---

# Sprint 1: 디자인 수정 — G-AXIS Design System 완전 적용 ✅ 완료

## 목적
현재 로컬 실행 화면이 컨셉 HTML(`G-AXIS VIEW(협력사).html`)과 크게 다름.
이 프롬프트는 **컨셉 HTML을 100% 기준으로** 현재 React 구현체를 수정하는 스프린트임.

## 사전 조건
- ✅ Sprint 1 기본 구현 완료 (로그인 + 대시보드 페이지 존재)
- ✅ 컨셉 HTML: `~/Desktop/GST/AXIS-VIEW/docs/concepts/G-AXIS VIEW(협력사).html`
- ✅ G-AXIS 로고: `~/Desktop/GST/AXIS-OPS/frontend/build/web/assets/assets/images/g-axis-2.png`

---

## 실행 순서

### Step 1: tmux 세션 시작
```bash
tmux new -s axis-view-fix

# 2분할 세로
Ctrl+B, %
```

결과: 2개 패널
```
┌──────────┬──────────┐
│  Lead    │   FE     │
└──────────┴──────────┘
```

### Step 2: 왼쪽 패널(Lead)에서 Claude Code 시작
```bash
cd ~/Desktop/GST/AXIS-VIEW/app
claude
```

### Step 3: accept edits on 확인
- 하단에 `accept edits on` 표시 확인
- 아니면 **Shift+Tab** 으로 전환

### Step 4: 디자인 수정 프롬프트 입력

---

## 🚀 디자인 수정 프롬프트 (복사해서 사용)

```
AXIS-VIEW의 현재 구현이 컨셉 HTML과 크게 다릅니다. 컨셉 HTML을 기준으로 전면 디자인을 수정해주세요.

⚠️ 반드시 읽어야 할 파일:
- CLAUDE.md: ~/Desktop/GST/AXIS-VIEW/app/CLAUDE.md (프로젝트 컨텍스트)
- 컨셉 HTML: ~/Desktop/GST/AXIS-VIEW/docs/concepts/G-AXIS VIEW(협력사).html ← 이 파일이 **완벽한 디자인 기준**. 반드시 처음부터 끝까지 읽고 모든 CSS 스타일/구조를 참고할 것.
- 로드맵: ~/Desktop/GST/AXIS-VIEW/docs/AXIS_VIEW_ROADMAP.md

⚠️ 로고 파일:
- 경로: ~/Desktop/GST/AXIS-OPS/frontend/build/web/assets/assets/images/g-axis-2.png
- 이 로고를 src/assets/images/g-axis-2.png로 복사해서 사용
- 적용 위치: ① 로그인 페이지 중앙 상단, ② 사이드바 좌상단 (AXIS-VIEW 텍스트 옆)

## 팀 구성
1명의 teammate를 생성해줘. Sonnet 모델 사용:

1. **FE** (Frontend 담당) - 소유: src/**

---

## Phase A: 로고 세팅 + 글로벌 디자인 토큰 수정

### A-1. 로고 파일 복사
```bash
mkdir -p src/assets/images
cp ~/Desktop/GST/AXIS-OPS/frontend/build/web/assets/assets/images/g-axis-2.png src/assets/images/g-axis-2.png
```

### A-2. CSS 변수 (G-AXIS Design System) — globals.css 또는 index.css에 반영

⚠️ 컨셉 HTML의 :root 변수를 **그대로** 사용할 것. 현재 코드에 이미 있으면 값을 일치시키고, 없으면 추가:

```css
:root {
  /* 9-Step Grey Scale */
  --gx-charcoal: #2A2D35;
  --gx-graphite: #3D4150;
  --gx-slate: #5A5F72;
  --gx-steel: #8B90A0;
  --gx-silver: #B8BCC8;
  --gx-mist: #E8EAF0;
  --gx-cloud: #F3F4F7;
  --gx-snow: #FAFBFD;
  --gx-white: #FFFFFF;

  /* Accent (Indigo) */
  --gx-accent: #6366F1;
  --gx-accent-soft: rgba(99, 102, 241, 0.08);
  --gx-accent-medium: rgba(99, 102, 241, 0.15);
  --gx-accent-glow: rgba(99, 102, 241, 0.25);

  /* Semantic Colors */
  --gx-success: #10B981;
  --gx-success-bg: rgba(16, 185, 129, 0.08);
  --gx-warning: #F59E0B;
  --gx-warning-bg: rgba(245, 158, 11, 0.08);
  --gx-danger: #EF4444;
  --gx-danger-bg: rgba(239, 68, 68, 0.08);
  --gx-info: #3B82F6;
  --gx-info-bg: rgba(59, 130, 246, 0.08);

  /* Layout */
  --sidebar-width: 260px;
  --header-height: 64px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;

  /* Shadow */
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
  --shadow-card: 0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04);
}
```

### A-3. 글로벌 폰트 설정
```css
/* Google Fonts 로드 (index.html <head>에 추가) */
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

/* 기본 폰트: DM Sans */
body {
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--gx-cloud);
  color: var(--gx-charcoal);
  -webkit-font-smoothing: antialiased;
  font-size: 14px;
}

/* 숫자/데이터에는 반드시 JetBrains Mono */
/* .table-mono, .kpi-value, .status-time, .company-stat-value 등 */
```

### A-4. 커스텀 스크롤바
```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--gx-silver); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--gx-steel); }
```

---

## Phase B: 로그인 페이지 수정

### B-1. 로그인 페이지에 로고 추가
- 로그인 폼 상단 중앙에 G-AXIS 로고 표시
- 로고 아래 "AXIS-VIEW" 텍스트 + "Manufacturing Execution Platform" 서브타이틀
- 로고 스타일:
  ```tsx
  <div className="flex flex-col items-center mb-8">
    <div className="w-[80px] h-[60px] overflow-hidden flex items-center justify-center mb-3">
      <img
        src={logoImage}
        alt="G-AXIS"
        className="w-[150%] h-auto"
        style={{ filter: 'brightness(1.3) contrast(1.8)', mixBlendMode: 'multiply' }}
      />
    </div>
    <span style={{ fontSize: '20px', fontWeight: 300, letterSpacing: '6px', color: 'var(--gx-charcoal)' }}>
      AXIS-VIEW
    </span>
    <span style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.5px', color: 'var(--gx-steel)', marginTop: '4px' }}>
      Manufacturing Execution Platform
    </span>
  </div>
  ```

### B-2. 로그인 페이지 전체 디자인
- 배경: `var(--gx-cloud)` (연한 회색)
- 카드: `var(--gx-white)`, `box-shadow: var(--shadow-lg)`, `border-radius: var(--radius-xl)`
- 입력 필드 포커스: `border-color: var(--gx-accent)`, `box-shadow: 0 0 0 3px var(--gx-accent-glow)`
- 로그인 버튼: `background: var(--gx-accent)`, hover시 밝게, `border-radius: var(--radius-md)`
- 에러 메시지: `color: var(--gx-danger)`, `background: var(--gx-danger-bg)`

---

## Phase C: 사이드바 수정

### C-1. 사이드바 브랜드 영역 (최상단)
```
┌─────────────────────────┐
│ [로고] AXIS-VIEW        │
│         Manufacturing   │
│         Execution Plat  │
├─────────────────────────┤
│  DASHBOARD              │
│  ...                    │
```

구현 사양:
- `sidebar-brand`: height=64px, display:flex, align-items:center, padding:0 20px, gap:14px
- `brand-logo`: width=54px, height=40px, overflow:hidden, 안에 `<img>` 넣기
  - img 스타일: `width: 150%, height: auto, filter: brightness(1.3) contrast(1.8), mix-blend-mode: multiply`
- `brand-text-group`: flex-direction:column, gap:3px
  - `brand-text`: font-size:17px, font-weight:300, letter-spacing:5px, color: var(--gx-charcoal)
  - `brand-subtitle`: font-size:8px, font-weight:400, letter-spacing:0.5px, color: var(--gx-steel)
- `border-bottom: 1px solid var(--gx-mist)` 구분선

```tsx
import logoImage from '@/assets/images/g-axis-2.png';

<div className="sidebar-brand" style={{
  height: '64px', display: 'flex', alignItems: 'center',
  padding: '0 20px', gap: '14px',
  borderBottom: '1px solid var(--gx-mist)'
}}>
  <div style={{ width: '54px', height: '40px', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <img src={logoImage} alt="G-AXIS" style={{ width: '150%', height: 'auto', filter: 'brightness(1.3) contrast(1.8)', mixBlendMode: 'multiply' }} />
  </div>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
    <span style={{ fontSize: '17px', fontWeight: 300, letterSpacing: '5px', color: 'var(--gx-charcoal)', lineHeight: 1 }}>AXIS-VIEW</span>
    <span style={{ fontSize: '8px', fontWeight: 400, letterSpacing: '0.5px', color: 'var(--gx-steel)', lineHeight: 1.2 }}>Manufacturing Execution Platform</span>
  </div>
</div>
```

### C-2. 사이드바 전체 스타일
- 너비: 260px, height: 100vh, position: fixed, left:0, top:0
- 배경: var(--gx-white), border-right: 1px solid var(--gx-mist)
- display: flex, flex-direction: column

### C-3. 사이드바 섹션 라벨
- 섹션 라벨 (Dashboard, Analysis 등):
  - font-size: 10px, font-weight: 600, letter-spacing: 1.5px, text-transform: uppercase
  - color: var(--gx-steel), padding: 0 8px, margin-bottom: 8px

### C-4. 네비게이션 아이템 (핵심 수정)
- `.nav-item`: padding: 10px 12px, border-radius: var(--radius-md), gap: 12px
  - 기본 색상: var(--gx-slate), font-size: 13.5px, font-weight: 500
  - hover: background: var(--gx-cloud), color: var(--gx-charcoal)

- **`.nav-item.active` (현재 누락된 핵심 스타일)**:
  - background: var(--gx-accent-soft)
  - color: var(--gx-accent)
  - **`::before` pseudo-element로 좌측 인디케이터 바 추가**:
    ```css
    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      border-radius: 0 3px 3px 0;
      background: var(--gx-accent);
    }
    ```
  - nav-item에 `position: relative` 필수

- 아이콘: width: 20px, height: 20px, opacity: 0.6 (active시 opacity: 1)

### C-5. 네비게이션 뱃지
- 불량 분석 옆 "3" 뱃지: background: var(--gx-danger), color: white
  - font-size: 10px, font-weight: 600, padding: 2px 7px, border-radius: 10px, margin-left: auto

### C-6. 사이드바 하단 유저 카드
```css
.sidebar-footer { margin-top: auto; padding: 16px; border-top: 1px solid var(--gx-mist); }
.user-card { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: var(--radius-md); }
.user-card:hover { background: var(--gx-cloud); }
.user-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, var(--gx-accent), #818CF8); color: white; font-weight: 600; font-size: 13px; /* 이니셜 표시 */ }
.user-name { font-size: 13px; font-weight: 600; color: var(--gx-charcoal); }
.user-role { font-size: 11px; color: var(--gx-steel); }
```

---

## Phase D: 헤더 수정

### D-1. 헤더 레이아웃
- height: 64px, background: var(--gx-white), border-bottom: 1px solid var(--gx-mist)
- position: sticky, top: 0, z-index: 50
- padding: 0 32px

### D-2. 헤더 좌측
- 페이지 제목: font-size: 16px, font-weight: 600, color: var(--gx-charcoal)
- 브레드크럼: font-size: 12px, color: var(--gx-steel), 현재 페이지는 color: var(--gx-accent), font-weight: 500

### D-3. 헤더 우측
- 날짜 선택기: border: 1px solid var(--gx-mist), border-radius: var(--radius-md), padding: 6px 14px
  - hover: border-color: var(--gx-accent), background: var(--gx-accent-soft)
- 아이콘 버튼들: width: 38px, height: 38px, border-radius: var(--radius-md), border: 1px solid var(--gx-mist)
  - hover: background: var(--gx-cloud), border-color: var(--gx-silver)
  - 알림 dot: width: 7px, height: 7px, background: var(--gx-danger), border: 1.5px solid white, position: absolute

---

## Phase E: 대시보드 컨텐츠 영역 수정

### E-1. 전체 레이아웃
- `.main-wrapper`: margin-left: 260px (사이드바 너비)
- `.dashboard`: padding: 28px 32px, max-width: 1440px

### E-2. Status Bar (실시간 동기화 상태 — 현재 누락)
**새로 추가 필요:**
```tsx
<div className="status-bar">
  <div className="status-left">
    <div className="status-dot" /> {/* 녹색 펄스 애니메이션 */}
    <div className="status-text">
      <strong>출입 데이터 동기화 완료</strong> · 일자별 독립 관리
    </div>
  </div>
  <div className="status-right">
    <div className="management-badge">
      <CalendarIcon /> 일자별 독립 관리
    </div>
    <div className="status-time">{currentTime} KST</div>
  </div>
</div>
```

CSS:
```css
.status-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; background: var(--gx-white);
  border-radius: var(--radius-lg); box-shadow: var(--shadow-card);
  margin-bottom: 24px;
}
.status-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--gx-success);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
  50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(16,185,129,0); }
}
.status-time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; color: var(--gx-steel);
  background: var(--gx-cloud); padding: 4px 12px;
  border-radius: var(--radius-sm);
}
.management-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 12px; border-radius: var(--radius-sm);
  font-size: 12px; font-weight: 500;
  color: var(--gx-accent); background: var(--gx-accent-soft);
}
```

### E-3. KPI 카드 수정

**레이아웃:**
- grid: 4열, gap: 16px, margin-bottom: 24px

**각 카드 스타일:**
- background: var(--gx-white), border-radius: var(--radius-lg)
- padding: 22px 24px, box-shadow: var(--shadow-card)
- **hover: box-shadow: var(--shadow-md), transform: translateY(-1px)** ← transition: all 0.2s ease

**아이콘 래퍼 (현재 누락):**
- `.kpi-icon-wrap`: width: 34px, height: 34px, border-radius: var(--radius-md)
- 카드별 배경색:
  - primary (등록 협력사): background: var(--gx-accent-soft), color: var(--gx-accent)
  - success (출입 인원): background: var(--gx-success-bg), color: var(--gx-success)
  - warning (퇴근 미체크): background: var(--gx-warning-bg), color: var(--gx-warning)
  - info (평균 출근율): background: var(--gx-info-bg), color: var(--gx-info)

**KPI 값:**
- font-size: 28px, font-weight: 700, color: var(--gx-charcoal)
- **font-variant-numeric: tabular-nums** (숫자 정렬)
- unit 스타일: font-size: 14px, font-weight: 500, color: var(--gx-steel)

**KPI 하단:**
- 서브 텍스트: font-size: 12px, color: var(--gx-slate)
- 변화 표시: .up → color: var(--gx-success), .down → color: var(--gx-danger)

### E-4. 차트 영역 수정

**레이아웃:** grid 2fr 1fr, gap: 16px

**차트 카드:**
- background: var(--gx-white), border-radius: var(--radius-lg), box-shadow: var(--shadow-card)

**차트 헤더:**
- title: font-size: 14px, font-weight: 600
- subtitle: font-size: 11px, color: var(--gx-steel)
- 탭 버튼: padding: 5px 12px, font-size: 12px, active → color: var(--gx-accent), background: var(--gx-accent-soft)

**범례:**
- `.legend-dot`: width: 10px, height: 10px, border-radius: 3px
- `.legend-label`: font-size: 12px, color: var(--gx-slate)
- `.legend-value`: font-family: 'JetBrains Mono', font-size: 12px, font-weight: 600

**Stacked Bar Chart (Recharts 사용):**
- 본사: linear-gradient(180deg, #6366F1, #818CF8)
- 현장: linear-gradient(180deg, #A5B4FC, #C7D2FE)
- 라벨: JetBrains Mono로 숫자 표시

**Donut Chart (Recharts PieChart 사용):**
- 본사: #6366F1, 현장: #A5B4FC
- 중앙에 총 인원 표시: font-size: 32px, font-weight: 700
- stroke-width: 22 (두꺼운 도넛)

### E-5. 협력사 상세 카드 (3열 그리드)

**카드 구조:**
```
┌────────────────────────────┐
│ [아이콘] C&A     미체크 5명 │  ← header
├────────────────────────────┤
│ 본사        현장            │  ← body (2col grid)
│ 16명        6명             │
│ ───────────────────────────│
│ 본사 10 | 본사CHI_1 5 | ...│  ← detail chips
└────────────────────────────┘
```

- 아이콘: 38px, border-radius: var(--radius-md), gradient 배경, 흰색 텍스트
  - 회사별 gradient: c1(#6366F1→#818CF8), c2(#3B82F6→#60A5FA), c3(#EF4444→#F87171), c4(#F59E0B→#FBBF24), c5(#8B5CF6→#A78BFA), c6(#64748B→#94A3B8), c7(#10B981→#34D399)
- 회사명: font-size: 15px, font-weight: 600
- 총 인원: JetBrains Mono, font-size: 11px, color: var(--gx-steel)
- 알림 뱃지: border-radius: 20px, font-size: 11px
  - warning: background: var(--gx-warning-bg), color: var(--gx-warning)
  - ok: background: var(--gx-success-bg), color: var(--gx-success)
  - danger: background: var(--gx-danger-bg), color: var(--gx-danger)
- 통계 값: JetBrains Mono, font-size: 18px, font-weight: 700
- detail-chip: padding: 3px 8px, border-radius: 4px, font-size: 11px, background: var(--gx-cloud)

### E-6. 테이블 수정

**테이블 카드:**
- background: var(--gx-white), border-radius: var(--radius-lg), box-shadow: var(--shadow-card)

**thead:**
- background: var(--gx-cloud)
- th: padding: 12px 20px, font-size: 11px, font-weight: 600, color: var(--gx-steel)
  - letter-spacing: 0.5px, text-transform: uppercase

**tbody:**
- td: padding: 14px 20px, font-size: 13px, color: var(--gx-graphite)
  - border-bottom: 1px solid var(--gx-cloud)
- hover: background: var(--gx-accent-soft)
- 마지막 행: border-bottom: none

**숫자 셀:**
- font-family: 'JetBrains Mono', monospace, font-size: 12px (`table-mono` 클래스)

**Progress Bar:**
- 높이 6px, border-radius: 3px, background: var(--gx-mist)
- high (≥80%): var(--gx-success)
- mid (50~79%): var(--gx-warning)
- low (<50%): var(--gx-danger)
- transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1)

**Status Badge:**
- border-radius: 20px, font-size: 11px, font-weight: 600
- active: background: var(--gx-success-bg), color: var(--gx-success)
- alert: background: var(--gx-warning-bg), color: var(--gx-warning)
- inactive: background: var(--gx-cloud), color: var(--gx-steel)

### E-7. 하단 그리드 (Bottom Grid — 2열)

**퇴근 미체크 리스트:**
- 아바타: 32px, border-radius: 50%, gradient 배경
- 이름: font-size: 13px, font-weight: 600
- 메타: font-size: 11px, color: var(--gx-steel)
- 시간: JetBrains Mono, 12px
- 미체크: color: var(--gx-danger), font-weight: 600

**근무지 요약 (Location Bars):**
- 수평 바: height: 24px, border-radius: 6px
- 본사: gradient(90deg, #6366F1, #818CF8), 흰색 텍스트
- 현장: gradient(90deg, #C7D2FE, #DDD6FE), var(--gx-slate) 텍스트
- 라벨: font-size: 12px, width: 80px
- 숫자: JetBrains Mono, 12px, font-weight: 600

---

## Phase F: 애니메이션 적용

### F-1. fadeInUp 애니메이션 (컨셉 HTML과 동일)
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-in { animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards; }
```

각 섹션에 순차 딜레이:
- Status Bar: 0.05s
- KPI Cards: 0.1s
- Filter/Controls: 0.15s
- Chart Row: 0.2s
- Company Section Title: 0.25s
- Company Cards: 0.3s
- Table: 0.35s
- Bottom Grid: 0.4s

### F-2. 인터랙션 애니메이션
- 카드 hover: box-shadow 확대 + translateY(-1px), transition: all 0.2s ease
- 사이드바 nav-item hover/active: transition: all 0.15s ease
- Progress bar fill: transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1)
- 도넛 차트 stroke: transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)
- Status dot: pulse 2s infinite

---

## Phase G: 반응형 수정

```css
@media (max-width: 1200px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .chart-grid { grid-template-columns: 1fr; }
  .company-grid { grid-template-columns: repeat(2, 1fr); }
  .bottom-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .main-wrapper { margin-left: 0; }
  .dashboard { padding: 20px 16px; }
  .kpi-grid { grid-template-columns: 1fr; }
  .company-grid { grid-template-columns: 1fr; }
  .header { padding: 0 16px; }
}
```

---

## Sprint 1 검증 기준

### ✅ 필수 체크리스트 (모두 완료)
1. [x] 로고가 `src/assets/images/g-axis-2.png`에 존재
2. [x] 로그인 페이지에 로고 + "AXIS-VIEW" + 서브타이틀 표시
3. [x] 사이드바 좌상단에 로고 + "AXIS-VIEW" + "Manufacturing Execution Platform" 표시
4. [x] 사이드바 active nav-item에 좌측 3px indigo 바 표시 (::before)
5. [x] CSS 변수가 컨셉 HTML :root와 100% 일치
6. [x] 폰트: DM Sans (기본) + JetBrains Mono (숫자/데이터)
7. [x] KPI 카드에 아이콘 래퍼 + hover 효과 + semantic 컬러 분리
8. [x] Status Bar 추가 (녹색 펄스 + 동기화 텍스트 + KST 시간)
9. [x] 테이블 thead: cloud 배경, uppercase, 0.5px letter-spacing
10. [x] 테이블 tbody hover: accent-soft 배경
11. [x] 테이블 숫자 셀: JetBrains Mono
12. [x] 협력사 카드: 3열 그리드, gradient 아이콘, detail-chip
13. [x] Progress bar: 색상 3단계 (success/warning/danger)
14. [x] fadeInUp 순차 애니메이션 적용
15. [x] 반응형 breakpoint 2단계 (1200px, 768px)
16. [x] `npm run build` 에러 없음
17. [x] `npm run dev`로 실행 후 컨셉 HTML과 비교 확인

### ⚠️ 금지 사항
- shadcn/ui 기본 테마를 그대로 사용하지 말 것 → G-AXIS 토큰으로 완전 덮어쓰기
- Tailwind 기본 색상(blue-500 등) 직접 사용 금지 → 반드시 CSS 변수 사용
- 숫자/데이터에 DM Sans 사용 금지 → 반드시 JetBrains Mono
- AXIS-OPS BE 코드 수정 금지
```

---

## Sprint 1 보조 프롬프트 (필요시 추가 입력)

### 보조 1: 차트 라이브러리 커스터마이징
```
Recharts 차트를 G-AXIS 디자인에 맞게 커스터마이징해줘:
- Stacked Bar: 본사 #6366F1→#818CF8 그라데이션, 현장 #A5B4FC→#C7D2FE
- Donut (PieChart): innerRadius=58, outerRadius=80, 중앙 텍스트 오버레이
- 공통: tooltip은 var(--gx-white) 배경, var(--shadow-md), border-radius: var(--radius-md)
- 축: tick은 DM Sans 11px var(--gx-steel), 그리드라인은 var(--gx-mist)
```

### 보조 2: Mock 데이터 확인
```
현재 VITE_USE_MOCK=true 상태에서 모든 컴포넌트가 컨셉 HTML과 동일한 데이터로 렌더링되는지 확인해줘:
- 7개 협력사: C&A(22명), FNI(22명), BAT(20명), TMS(E)(17명), TMS(M)(8명), NONE(5명), P&S(4명)
- 총 98명 (본사 32명, 현장 66명)
- 퇴근 미체크: 12명
- 평균 출근율: 87.8%
```

### Sprint 1 수정 이력
- **레이아웃 순서 변경**: AttendancePage.tsx에서 작업자 출퇴근 현황 테이블을 최하단으로 이동 (BottomGrid → FilterBar → AttendanceTable)
- **헤더 marginLeft 중복 제거**: Header.tsx에서 `marginLeft: var(--sidebar-width)` 제거 (Layout.tsx 부모에서 이미 적용)

---
---

# Sprint 2: API 연동 + 설정 메뉴 — AXIS-OPS BE 통합 ✅ FE 완료

> 작성일: 2026-03-04
> 완료일: 2026-03-06 (FE 작업 완료, BE 엔드포인트 미구현)
> 대상: AXIS-VIEW (React 관리자 대시보드) → AXIS-OPS BE (Railway Flask)
> 예상 사용자: 약 150명 (관리자 + 협력사 작업자)
> 사전 조건: Sprint 1 디자인 수정 완료

---

## 목적
AXIS-VIEW FE를 AXIS-OPS BE API와 연동하기 위한 준비 작업.
Mock 데이터 기반에서 실제 API 기반으로 전환하고, 설정(옵션) 메뉴를 추가한다.

---

## Phase H: 인증 (Authentication)

### H-1. 로그인 응답 필드 수정

**현재 FE (`types/auth.ts`):**
```ts
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;  // ← 불일치
}
```

**실제 BE 응답:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "worker": { "id", "name", "email", "role", "company", "is_admin", "is_manager", "approval_status", "email_verified" }
}
```

**수정 사항:**
- `LoginResponse.user` → `LoginResponse.worker`
- `User` 인터페이스에 `approval_status`, `email_verified` 필드 추가
- `auth.ts` 51번째 줄: `data.user.is_admin` → `data.worker.is_admin`

---

### H-2. Refresh Token Rotation — ⏳ 별도 보안 스프린트로 분리

> **Sprint 2에서 제외.** 별도 보안 스프린트에서 진행 예정.
>
> **AXIS-OPS FE 검토 완료 (2026-03-04):**
> `auth_service.dart` 251~254번째 줄에 이미 대응 로직이 있음:
> ```dart
> // 새 refresh_token이 응답에 포함되면 함께 저장
> if (response['refresh_token'] != null) {
>   await saveRefreshToken(response['refresh_token']);
> }
> ```
> **결론: BE만 Rotation 켜면 양쪽 FE(OPS + VIEW) 모두 수정 없이 동작.**
>
> **별도 스프린트 진행 시 포함 사항:**
> - BE: `auth.refresh_tokens` 테이블 + Rotation 로직 + 탈취 감지 (무효화된 토큰 재사용 시 전체 무효화)
> - AXIS-OPS FE: ✅ 수정 불필요 (이미 새 refresh_token 저장 로직 있음)
> - AXIS-VIEW FE: ✅ 수정 불필요 (`client.ts` 72~76번째 줄 동일 패턴)
> - 테스트: BE Rotation 로직 단위 테스트 + E2E (access_token 만료 → 새 토큰 쌍 발급 → 이전 토큰 무효화)

---

## Phase I: 출퇴근 API 엔드포인트 (신규 추가)

### I-1. 추가할 엔드포인트 3개

기존 `/api/hr/` 경로는 그대로 유지. 관리자 전용으로 `/api/admin/hr/` 하위에 추가.

#### `GET /api/admin/hr/attendance/today`

```python
@admin_bp.route("/hr/attendance/today", methods=["GET"])
@jwt_required
@admin_required
def get_admin_attendance_today():
    """관리자용 — 오늘 전체 협력사 출퇴근 현황"""
```

**응답:**
```json
{
  "date": "2026-03-04",
  "records": [
    {
      "worker_id": 5,
      "worker_name": "탁재훈",
      "company": "C&A",
      "role": "ELEC",
      "check_in_time": "2026-03-04T08:15:00+09:00",
      "check_out_time": "2026-03-04T17:30:00+09:00",
      "status": "left",
      "work_site": "GST",
      "product_line": "SCR"
    }
  ],
  "summary": {
    "total_registered": 98,
    "checked_in": 86,
    "checked_out": 34,
    "currently_working": 52,
    "not_checked": 12
  }
}
```

**핵심 SQL (IN/OUT 피봇):**
```sql
SELECT
  w.id AS worker_id,
  w.name AS worker_name,
  w.company,
  w.role,
  MAX(CASE WHEN pa.check_type = 'in'  THEN pa.check_time END) AS check_in_time,
  MAX(CASE WHEN pa.check_type = 'out' THEN pa.check_time END) AS check_out_time,
  MAX(CASE WHEN pa.check_type = 'in'  THEN pa.work_site END) AS work_site,
  MAX(CASE WHEN pa.check_type = 'in'  THEN pa.product_line END) AS product_line
FROM workers w
LEFT JOIN hr.partner_attendance pa
  ON w.id = pa.worker_id
  AND pa.check_time >= {today_start_kst}
  AND pa.check_time <  {tomorrow_start_kst}
WHERE w.company != 'GST'
GROUP BY w.id, w.name, w.company, w.role
ORDER BY w.company, w.name
```
> 기존 `pa_in` 별도 JOIN 제거 — `pa`에서 `CASE WHEN check_type='in'`으로 work_site/product_line 추출

**status 계산 (Python):**
```python
if check_in_time is None:
    status = 'not_checked'
elif check_out_time is None:
    status = 'working'
else:
    status = 'left'
```

#### `GET /api/admin/hr/attendance?date=YYYY-MM-DD`

위와 동일한 로직, `date` 파라미터로 날짜만 변경.

#### `GET /api/admin/hr/attendance/summary`

```python
@admin_bp.route("/hr/attendance/summary", methods=["GET"])
@jwt_required
@admin_required
def get_admin_attendance_summary():
    """관리자용 — 회사별 출퇴근 요약"""
```

**응답:**
```json
{
  "date": "2026-03-04",
  "by_company": [
    {
      "company": "C&A",
      "total_workers": 22,
      "checked_in": 17,
      "checked_out": 7,
      "currently_working": 10,
      "not_checked": 5
    }
  ]
}
```

---

## Phase J: FE 타입 수정 사항

### J-1. `types/auth.ts`

```ts
// 변경 전
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// 변경 후
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  worker: Worker;
}

interface Worker {
  id: number;
  name: string;
  email: string;
  role: string;       // MECH | ELEC | TM | PI | QI | SI | ADMIN
  company: string;    // FNI | BAT | TMS(M) | TMS(E) | P&S | C&A | GST
  is_admin: boolean;
  is_manager: boolean;
  approval_status: string;   // pending | approved | rejected
  email_verified: boolean;
}
```

### J-2. `types/attendance.ts` — 추가 필드

```ts
interface AttendanceRecord {
  worker_id: number;
  worker_name: string;
  company: string;
  role: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: 'working' | 'left' | 'not_checked';
  work_site?: string;       // 추가: GST | HQ
  product_line?: string;    // 추가: SCR | CHI
}
```

---

## Phase K: 설정(옵션) 메뉴

헤더 우측 ⚙️ 버튼 클릭 → 설정 패널 또는 모달 표시

### K-1. Sprint 2 범위 — 대시보드 핵심 설정 (3개)

> 근무 설정(식사시간, 지각/조퇴 기준 등)은 BE 연동이 필요하므로 별도 스프린트로 분리.
> Sprint 2에서는 FE localStorage만으로 동작하는 대시보드 설정 3개만 구현.
> ※ 위치 보안 설정(반경, soft/strict 모드)은 보안 Sprint 19-B에서 OPS admin 설정 페이지에 추가 예정.

| 항목 | 설명 | 기본값 | UI |
|------|------|--------|-----|
| 자동 새로고침 | 데이터 갱신 주기 | 5분 | Select: 1분 / 3분 / 5분 / 수동 |
| 기본 뷰 | 협력사 상세 기본 표시 방식 | 카드뷰 | Toggle: 카드뷰 / 테이블 |
| 본사/현장 구분 | 본사/현장 분류 표시 여부 | ON | Toggle |

### K-2. 별도 스프린트 범위 — 근무 설정 + 알림 설정 (미정)

> 아래 항목은 BE 연동이 필요하며, VIEW Sprint 3가 아직 정의되지 않음. 별도 스프린트에서 진행:
> - 근무 설정: 식사시간, 출근 마감 기준, 정규 퇴근 시간, 야간 퇴근 인정
> - 알림 설정: 미체크 알림 기준, 출근율 경고 기준
> - 시스템: API 서버 상태, 언어, 테마

### K-3. 설정 저장 방식 (Sprint 2)

```
localStorage 저장 (axis_view_settings)
  → 사용자별 브라우저 로컬 저장
  → BE 변경 불필요
```

**FE 구현:**
```ts
// hooks/useSettings.ts
interface DashboardSettings {
  // Sprint 2 범위
  refreshInterval: number;     // 5 (분), 0 = 수동
  defaultView: 'card' | 'table';
  showHqSiteBreakdown: boolean;
}

const DEFAULT_SETTINGS: DashboardSettings = {
  refreshInterval: 5,
  defaultView: 'card',
  showHqSiteBreakdown: true,
};
```

---

## Phase L: CORS 설정

> **현재 AXIS-OPS BE `__init__.py`의 CORS가 `origins: "*"` (와일드카드) 상태.**
> 모든 origin이 이미 허용되어 있으므로 Sprint 2에서는 CORS 수정 불필요.
> 추후 보안 강화 시 특정 도메인으로 제한할 때 아래 참고:

| 환경 | Origin | 상태 |
|------|--------|------|
| 개발 | `http://localhost:5173` | 현재 `*`로 허용 중 |
| 운영 | `https://{axis-view}.netlify.app` | 현재 `*`로 허용 중, 추후 제한 시 추가 |

```python
# 추후 보안 강화 시 (현재는 불필요):
CORS(app, origins=[
    "http://localhost:5173",
    "https://gaxis-ops.netlify.app",
    "https://{axis-view-domain}.netlify.app"
], supports_credentials=True)
```

---

## Sprint 2 체크리스트

### BE 작업 (AXIS-OPS)

- [x] `GET /api/admin/hr/attendance/today` 엔드포인트 추가
- [x] `GET /api/admin/hr/attendance?date=` 엔드포인트 추가
- [x] `GET /api/admin/hr/attendance/summary` 엔드포인트 추가
- [x] IN/OUT 피봇 쿼리 + status 계산 로직 구현

> ~~Refresh Token Rotation~~ → 별도 보안 스프린트로 분리 (AXIS-OPS FE 동시 검토 필요)
> ~~CORS 수정~~ → 현재 `origins: "*"` 상태로 수정 불필요

### FE 작업 (AXIS-VIEW) — ✅ 전체 완료 (2026-03-06 코드 검증)

- [x] `LoginResponse.user` → `LoginResponse.worker` 필드명 변경
- [x] `Worker` 인터페이스에 `approval_status`, `email_verified` 추가
- [x] `auth.ts` login 함수: `data.worker.is_admin` 체크
- [x] `AttendanceRecord`에 `work_site`, `product_line` 옵셔널 필드 추가
- [x] 설정 메뉴 컴포넌트 구현 (`SettingsModal.tsx`) — 3개 항목
- [x] `useSettings` 훅 구현 (`axis_view_settings` localStorage 저장)
- [x] `useAttendance` 훅에 설정의 `refreshInterval` 연동
- [x] `.env.production`에 `VITE_API_BASE_URL=https://axis-ops-api.up.railway.app` 설정

### Sprint 2 검증 기준

- [x] Mock ↔ Real API 전환이 `VITE_USE_MOCK` 환경변수로 정상 동작
- [x] 로그인 → BE 인증 → 대시보드 진입 정상
- [x] access_token 만료 → 기존 refresh 방식으로 자동 갱신 정상 (Rotation은 별도)
- [x] 설정 메뉴에서 새로고침 주기 / 기본 뷰 / 본사현장 구분 변경 후 대시보드 반영 확인
- [x] `npm run build` 에러 없음

### ⚠️ Sprint 2 금지 사항
- Refresh Token Rotation 구현 금지 (별도 스프린트)
- AXIS-OPS BE CORS 설정 변경 금지 (현재 `*` 유지)
- 근무 설정(식사시간, 지각/조퇴 기준) 구현 금지 (별도 스프린트)
- device_id 관련 코드 추가 금지 (보안 Sprint 19-A Phase B에서 진행)

### 🔗 보안 Sprint 19-A/B 연계 메모 (2026-03-05 업데이트)

> Sprint 2 완료 후 보안 스프린트가 순차 진행. OPS Sprint 19-A/B에서 VIEW FE도 수정됨.
>
> | 보안 Phase | VIEW FE 변경 | 상태 |
> |---|---|---|
> | A (Rotation) | 수정 불필요 — `client.ts`에 이미 대응 있음 | ✅ 자동 대응 |
> | B (Device ID) | `client.ts`에 `getDeviceId()` + login/refresh에 전송 추가 | 19-A에서 수정됨 |
> | C (DB Token + Logout) | `auth.ts` logout에 `/auth/logout` API 호출 추가 | 19-B에서 수정됨 |
> | D (Geolocation) | VIEW 무관 — OPS admin 설정에서 관리 | 영향 없음 |
>
> **실 데이터 연결**: `VITE_USE_MOCK=false` + `VITE_API_BASE_URL` 설정으로 전환.
> 상세 가이드는 `AXIS_VIEW_ROADMAP.md` "실 데이터 연결 가이드" 섹션 참고.

### 📍 GST 공장 GPS 좌표 (2026-03-05)

> OPS admin 설정(Section 5)에서 관리. VIEW에서는 설정하지 않음.
> - 주소: 경기도 화성시 동탄구 동탄산단6길 15-13
> - 좌표 (추정): 위도 37.171, 경도 127.088
> - 반경: 1km (1000m)
> - 모드: soft (초기 2~4주 경고만) → strict (차단) 전환 예정
> - 현장 실측 후 OPS admin 페이지에서 정확한 값으로 수정

---
---

# 실 데이터 연결 점검 (2026-03-06)

> Sprint 2 완료 + OPS Sprint 19-A/B 완료 후 실 DB 연결 전환 가능 여부 점검

## 점검 결과 요약

| 항목 | 상태 | 파일 |
|------|------|------|
| 환경변수 분기 (`VITE_USE_MOCK`) | ✅ 준비 완료 | `.env.development` / `.env.production` |
| API 서비스 mock/real 분기 | ✅ 준비 완료 | `src/api/attendance.ts`, `src/api/auth.ts` |
| JWT 인증 + 자동 갱신 | ✅ 준비 완료 | `src/api/client.ts` (401 자동 refresh + 큐) |
| Token Rotation 대응 | ✅ 준비 완료 | `client.ts:74` — 새 refresh_token 자동 저장 |
| 타입 정의 (Worker, Attendance) | ✅ BE 스키마 일치 | `src/types/auth.ts`, `src/types/attendance.ts` |
| TanStack Query + 자동 새로고침 | ✅ 준비 완료 | `src/hooks/useAttendance.ts` |
| **device_id 전송** | ❌ **미구현** | `auth.ts`, `client.ts` — device_id 없음 |
| **logout API 호출** | ❌ **미구현** | `authStore.ts:69` — localStorage만 삭제, BE 호출 없음 |

## 필수 수정 2건 (실 데이터 연결 전)

### 1. device_id 추가 — `client.ts` + `auth.ts`

OPS Sprint 19-A에서 BE가 `device_id`를 요구함. VIEW에서도 login/refresh 시 전송 필요.

```ts
// src/api/client.ts — 상단에 추가
function getDeviceId(): string {
  const KEY = 'axis_view_device_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

// 요청 인터셉터에 device_id 헤더 추가
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(LOCAL_KEYS.ACCESS);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-Device-ID'] = getDeviceId();
  return config;
});
```

```ts
// src/api/auth.ts — login 함수 수정
const response = await apiClient.post<LoginResponse>('/api/auth/login', {
  email,
  password,
  device_id: getDeviceId(),  // 추가
});

// refreshToken 함수 수정
const response = await apiClient.post('/api/auth/refresh', {
  refresh_token: refresh,
  device_id: getDeviceId(),  // 추가
});
```

### 2. logout API 호출 — `authStore.ts`

OPS Sprint 19-B에서 BE에 `POST /api/auth/logout` 추가됨. 서버 토큰 무효화 필요.

```ts
// src/store/authStore.ts — logout 수정
const logout = useCallback(async () => {
  try {
    const token = localStorage.getItem(LOCAL_KEYS.ACCESS);
    if (token) {
      await apiClient.post('/api/auth/logout');  // BE 토큰 무효화
    }
  } catch (e) {
    // 로그아웃 API 실패해도 로컬은 정리
    console.warn('Logout API failed:', e);
  }
  localStorage.removeItem(LOCAL_KEYS.ACCESS);
  localStorage.removeItem(LOCAL_KEYS.REFRESH);
  localStorage.removeItem(LOCAL_KEYS.USER);
  setState({ user: null, isAuthenticated: false, isLoading: false });
}, []);
```

## 실 데이터 전환 절차

```
1. 위 필수 수정 2건 반영 (device_id + logout)
2. VITE_USE_MOCK=false 설정
3. VITE_API_BASE_URL=https://axis-ops-api.up.railway.app 확인
4. npm run dev로 로컬 테스트:
   - 로그인 (admin 계정) → 대시보드 진입
   - 출퇴근 데이터 로딩 확인
   - token 자동 갱신 확인
   - 로그아웃 → BE 토큰 무효화 확인
5. npm run build → 배포
```

## VIEW cowork 진행 시 참고

- Sprint 1 (디자인): ✅ 완료
- Sprint 2 (API 준비): ✅ FE 완료 (mock 기반 동작 중)
- **다음 작업**: 실 데이터 연결 스프린트 (아래 프롬프트 사용)
- OPS BE API 경로: `/api/admin/hr/attendance/today`, `/api/admin/hr/attendance?date=`, `/api/admin/hr/attendance/summary`
- CORS: BE가 `origins: "*"` 상태이므로 추가 설정 불필요
- ROADMAP 상세: `AXIS_VIEW_ROADMAP.md` "실 데이터 연결 가이드" 섹션 참조

---
---

# Sprint 3: 실 데이터 연결 — device_id + logout + 스키마 정합성 + 실 데이터 검증

> 사전 조건: Sprint 1 ✅ + Sprint 2 FE ✅ + OPS Sprint 19-A/B ✅ + OPS BE admin attendance API 추가 ✅
> 목적: Mock → Real API 전환을 위한 FE 필수 수정 + 스키마 정합성 보정 + 실 데이터 연결 검증

---

## 📋 FE Mock ↔ DB 스키마 정합성 점검 결과 (2026-03-06)

### 확인 완료 항목 (gap 없음)

| 항목 | DB (현재) | FE Mock | 결과 |
|------|-----------|---------|------|
| role | `role_enum: MECH, ELEC, TM, PI, QI, SI, ADMIN` (migration 006에서 MM→MECH, EE→ELEC 변경 완료) | `'MECH' / 'ELEC'` | ✅ 일치 |
| worker_id → 이름/회사 | `public.workers` (id, name, company, role) | JOIN 필요 | ✅ 구조 맞음 |
| check_type | `'in' / 'out'` (별도 row) | `check_in_time / check_out_time` (단일 row) | ✅ BE에서 pivot 처리됨 |

### 보정 필요 항목

#### 1. work_site 값 매핑 — 옵션 B 확정
- **DB 값**: `GST` (GST공장/현장), `HQ` (협력사 본사)
- **FE Mock 현재값**: `'현장'`, `'본사'`
- **결정**: BE는 `GST`/`HQ` 원본값 그대로 응답 → FE에서 표시용 라벨 매핑
- **FE 매핑 테이블**:
  ```ts
  const WORK_SITE_LABEL: Record<string, string> = {
    GST: 'GST공장',   // 현장
    HQ: '협력사본사',  // 본사
  };
  ```

#### 2. product_line (CHI 제외) — 확정
- **DB**: `product_line VARCHAR(10) CHECK (product_line IN ('SCR', 'CHI'))`, DEFAULT `'SCR'`
- **현재 운영**: SCR만 사용, CHI는 추후 확장용으로 예약됨
- **결정**: CHI 데이터는 카운트에서 제외, 확장 시점에 추가
- **FE 처리**: API 응답에서 FE 필터링으로 CHI 제외
- **Mock 정리**: sub_location에 CHI 포함된 항목 → 카운트에서 제외

#### 3. sub_location 개념 — FE 전용
- **DB**: `work_site` + `product_line` 별도 컬럼 (sub_location 컬럼 없음)
- **FE Mock**: `'본사CHI_1'`, `'현장SCR_2'` 같은 조합 문자열 사용
- **처리**: FE에서 `${WORK_SITE_LABEL[work_site]}_${product_line}` 형태로 생성하거나, 대시보드에서는 work_site + product_line 그룹핑으로 대체

---

## BE API 엔드포인트 현황

> OPS에서 admin attendance API 3개 추가 완료 가정

| 엔드포인트 | 상태 | 비고 |
|---|---|---|
| `POST /api/auth/login` | ✅ | `device_id` 선택적 (없으면 'unknown') |
| `POST /api/auth/refresh` | ✅ | Rotation 대응 (새 refresh_token 반환 시 자동 저장) |
| `POST /api/auth/logout` | ✅ | JWT 필요, refresh_token 무효화 |
| `GET /api/admin/hr/attendance/today` | ✅ | 오늘 전체 협력사 출퇴근 현황 (KST 기준 IN/OUT pivot) |
| `GET /api/admin/hr/attendance?date=YYYY-MM-DD` | ✅ | 특정 날짜 조회 |
| `GET /api/admin/hr/attendance/summary` | ✅ | 회사별 출퇴근 요약 |
| CORS | `origins: "*"` | 모든 origin 허용 중 |

### BE 응답 스키마 (FE가 기대하는 구조)

**`GET /api/admin/hr/attendance/today` 응답:**
```json
{
  "date": "2026-03-06",
  "records": [
    {
      "worker_id": 5,
      "worker_name": "탁재훈",
      "company": "C&A",
      "role": "ELEC",
      "check_in_time": "2026-03-06T08:15:00+09:00",
      "check_out_time": "2026-03-06T17:30:00+09:00",
      "status": "left",
      "work_site": "GST",
      "product_line": "SCR"
    }
  ],
  "summary": {
    "total_registered": 98,
    "checked_in": 86,
    "checked_out": 34,
    "currently_working": 52,
    "not_checked": 12
  }
}
```

**`GET /api/admin/hr/attendance/summary` 응답:**
```json
{
  "date": "2026-03-06",
  "by_company": [
    {
      "company": "C&A",
      "total_workers": 22,
      "checked_in": 17,
      "checked_out": 7,
      "currently_working": 10,
      "not_checked": 5
    }
  ]
}
```

> BE pivot 쿼리는 KST 기준 (today_start_kst / tomorrow_start_kst)으로 처리.
> `check_time::date = CURRENT_DATE` 방식은 UTC 이슈 있으므로 사용하지 않음.

---

## 🚀 실 데이터 연결 프롬프트 (복사해서 사용)

```
AXIS-VIEW를 실 데이터(AXIS-OPS BE)와 연결합니다.
BE API는 모두 준비 완료 상태이며, FE 수정 + 스키마 정합성 보정 + 실 데이터 연결 검증까지 진행합니다.

⚠️ 반드시 읽어야 할 파일:
- CLAUDE.md: ~/Desktop/GST/AXIS-VIEW/app/CLAUDE.md (프로젝트 컨텍스트)
- 스프린트 문서: ~/Desktop/GST/AXIS-VIEW/docs/sprints/DESIGN_FIX_SPRINT.md (Sprint 3 섹션 전체)
- 로드맵: ~/Desktop/GST/AXIS-VIEW/docs/AXIS_VIEW_ROADMAP.md

## 팀 구성
1명의 teammate를 생성해줘. Sonnet 모델 사용:
1. **FE** (Frontend 담당) - 소유: src/**

---

## Task 1: device_id 추가 — `client.ts` + `auth.ts`

AXIS-OPS BE Sprint 19-A에서 device_id를 요구함. 현재 VIEW 코드에 device_id 관련 코드가 전혀 없음.

### 1-1. `src/api/client.ts` — getDeviceId 함수 + 인터셉터 수정

- 파일 상단에 `getDeviceId()` 함수 추가:
  - `localStorage`에서 `axis_view_device_id` 키로 UUID 관리
  - 없으면 `crypto.randomUUID()`로 생성 후 저장
- 기존 request 인터셉터에 `X-Device-ID` 헤더 추가
- `getDeviceId`를 export하여 auth.ts에서도 사용 가능하게

```ts
export function getDeviceId(): string {
  const KEY = 'axis_view_device_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
```

인터셉터 수정:
```ts
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(LOCAL_KEYS.ACCESS);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-Device-ID'] = getDeviceId();
  return config;
});
```

### 1-2. `src/api/auth.ts` — login + refresh에 device_id 전송

- `login()` 함수의 POST body에 `device_id: getDeviceId()` 추가
- `refreshToken()` 함수의 POST body에 `device_id: getDeviceId()` 추가
- client.ts의 응답 인터셉터 내 refresh 호출에도 device_id 추가

```ts
// login
const response = await apiClient.post<LoginResponse>('/api/auth/login', {
  email,
  password,
  device_id: getDeviceId(),
});

// refreshToken
export async function refreshToken(refresh: string) {
  const response = await apiClient.post('/api/auth/refresh', {
    refresh_token: refresh,
    device_id: getDeviceId(),
  });
  return response.data;
}
```

⚠️ `client.ts`의 응답 인터셉터(line 67~70) 내부 refresh 호출에도 device_id를 추가해야 함:
```ts
const response = await axios.post(
  `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/refresh`,
  { refresh_token: refreshToken, device_id: getDeviceId() }
);
```

---

## Task 2: logout API 호출 — `authStore.ts`

현재 logout은 `localStorage.removeItem`만 수행. BE 토큰 무효화가 안 됨.

### 2-1. `src/store/authStore.ts` — logout 수정

- logout 함수를 async로 변경
- `apiClient.post('/api/auth/logout')` 호출 추가
- API 호출 실패해도 로컬 정리는 반드시 수행 (try-catch)
- `apiClient`를 import해야 함 (현재 없을 수 있음)

```ts
import apiClient, { LOCAL_KEYS } from '@/api/client';

const logout = useCallback(async () => {
  try {
    const token = localStorage.getItem(LOCAL_KEYS.ACCESS);
    if (token) {
      await apiClient.post('/api/auth/logout');
    }
  } catch (e) {
    console.warn('Logout API failed:', e);
  }
  localStorage.removeItem(LOCAL_KEYS.ACCESS);
  localStorage.removeItem(LOCAL_KEYS.REFRESH);
  localStorage.removeItem(LOCAL_KEYS.USER);
  setState({ user: null, isAuthenticated: false, isLoading: false });
}, []);
```

⚠️ `LOCAL_KEYS`가 client.ts에서 export되어 있는지 확인. 안 되어 있으면 export 추가.

---

## Task 3: work_site 매핑 유틸 + 대시보드 연동

### 3-1. `src/utils/workSiteMapping.ts` (신규 생성)

```ts
/** DB work_site 값 → 표시용 라벨 매핑 */
export const WORK_SITE_LABEL: Record<string, string> = {
  GST: 'GST공장',
  HQ: '협력사본사',
};

/** product_line 중 현재 운영 대상 */
export const ACTIVE_PRODUCT_LINES = ['SCR'] as const;

export function getWorkSiteLabel(workSite: string): string {
  return WORK_SITE_LABEL[workSite] ?? workSite;
}

export function isActiveProductLine(productLine: string): boolean {
  return (ACTIVE_PRODUCT_LINES as readonly string[]).includes(productLine);
}
```

### 3-2. 대시보드 데이터 처리 적용

- `src/api/attendance.ts`: API 응답의 `records`에서 `isActiveProductLine()` 필터 적용 → CHI 제외
- 대시보드 카드/테이블에서 `getWorkSiteLabel(record.work_site)` 사용
- 기존 mock의 `location: '본사'/'현장'` 표시를 `getWorkSiteLabel()`로 대체
- 협력사 상세 카드의 본사/현장 분류: `work_site === 'HQ'` → 본사, `work_site === 'GST'` → 현장

---

## Task 4: Mock 모드 검증

수정 완료 후 먼저 Mock 모드에서 기존 기능이 깨지지 않았는지 확인:

1. `npm run build` — TypeScript 에러 없음 확인
2. `npm run dev` — 로컬 실행 확인 (VITE_USE_MOCK=true 상태)
3. Mock 모드에서:
   - 로그인 → 대시보드 진입 정상
   - KPI 카드 숫자 + 차트 + 협력사 카드 정상 렌더링
   - 설정 메뉴 동작 정상
   - 로그아웃 정상 (API 호출은 mock이라 실패해도 로컬 정리됨)
4. 변경된 파일 목록 출력

---

## Task 5: 실 데이터 연결 + 전체 검증

Mock 검증 통과 후, 실제 AXIS-OPS BE(Railway)에 연결해서 전체 플로우를 검증한다.

### 5-1. 환경변수 전환

`.env.development`를 수정:
```
VITE_API_BASE_URL=https://axis-ops-api.up.railway.app
VITE_USE_MOCK=false
```

### 5-2. 실 데이터 테스트 항목

`npm run dev`로 로컬 실행 후 아래 항목을 순서대로 테스트:

#### 테스트 1: 로그인
- admin 계정으로 로그인 시도
- 확인: access_token + refresh_token이 localStorage에 저장
- 확인: device_id가 localStorage에 생성/저장
- 실패 시: 에러 메시지 캡처 (CORS? 401? 네트워크?)

#### 테스트 2: 대시보드 데이터 로딩
- 로그인 후 대시보드에 출퇴근 데이터가 표시되는지 확인
- KPI 카드: 등록 협력사 / 출입 인원 / 퇴근 미체크 / 평균 출근율 숫자 확인
- 협력사 상세 카드: 회사별 본사/현장 인원 분류 정상
- 테이블: 작업자 목록 + status(working/left/not_checked) 뱃지 정상
- work_site 매핑: `GST` → `GST공장`, `HQ` → `협력사본사` 표시 확인
- ⚠️ 데이터가 0건인 경우 (아직 출퇴근 기록 없음): 빈 상태 UI가 정상 표시되는지 확인

#### 테스트 3: 날짜별 조회
- 헤더 날짜 선택기에서 다른 날짜 선택
- `GET /api/admin/hr/attendance?date=YYYY-MM-DD` 호출 확인
- 해당 날짜 데이터로 대시보드 갱신 확인

#### 테스트 4: 자동 새로고침
- 설정에서 새로고침 주기 1분으로 변경
- 1분 후 Network 탭에서 attendance API 재호출 확인
- 수동 모드 전환 시 자동 호출 중지 확인

#### 테스트 5: 토큰 자동 갱신
- DevTools > Application > localStorage에서 access_token 값을 변조 (끝 몇 글자 변경)
- 대시보드 새로고침 → 401 발생 → 자동 refresh → 새 access_token 발급 확인
- 실패 시: 로그인 화면으로 리다이렉트 확인

#### 테스트 6: 로그아웃
- 로그아웃 버튼 클릭
- Network 탭에서 `POST /api/auth/logout` 호출 확인
- localStorage에서 토큰 + user 정보 삭제 확인
- 로그인 화면으로 이동 확인

### 5-3. 테스트 결과 정리

각 테스트 결과를 아래 형식으로 콘솔에 출력:
```
========================================
AXIS-VIEW 실 데이터 연결 테스트 결과
========================================
BE URL: https://axis-ops-api.up.railway.app
날짜: {현재 날짜/시간}
VIEW 버전: Sprint 3
OPS 버전: v1.4.0

[테스트 1: 로그인]          → ✅/❌ (에러: ...)
[테스트 2: 대시보드 데이터]  → ✅/❌ (에러: ...)
[테스트 3: 날짜별 조회]      → ✅/❌ (에러: ...)
[테스트 4: 자동 새로고침]    → ✅/❌ (에러: ...)
[테스트 5: 토큰 자동 갱신]   → ✅/❌ (에러: ...)
[테스트 6: 로그아웃]         → ✅/❌ (에러: ...)

전체 통과 시: .env.production 확인 후 Netlify 배포 가능
========================================
```

### 5-4. 배포 판단

- 6개 테스트 모두 통과 → `npm run build` → Netlify 배포
- 실패 항목 있으면 → 에러 분석 후 수정 → 재테스트

---

## DB 스키마 정합성 요약

| 항목 | DB 실제값 | FE 표시값 | 변환 위치 |
|------|-----------|-----------|-----------|
| role | `MECH` / `ELEC` | `MECH` / `ELEC` | 변환 불필요 (일치) |
| work_site | `GST` / `HQ` | `GST공장` / `협력사본사` | FE (workSiteMapping.ts) |
| product_line | `SCR` / `CHI` | SCR만 카운트 | FE 필터 (CHI 제외) |
| check_type | IN/OUT 별도 row | check_in/out 단일 row | BE pivot 쿼리 (KST 기준) |
| check_time | TIMESTAMPTZ (UTC) | KST 표시 | BE에서 KST 변환 후 응답 |

## Sprint 3 실행 결과 (2026-03-06)

### Task 1~4 완료 (FE 코드 수정 + 빌드 검증)

| 태스크 | 상태 | 요약 |
|--------|------|------|
| Task 1: device_id 추가 | ✅ 완료 | `client.ts`에 `getDeviceId()` 추가 + 요청 인터셉터 `X-Device-ID` 헤더 + 응답 인터셉터 refresh body에 device_id + `auth.ts` login/refresh body에 device_id |
| Task 2: logout API 호출 | ✅ 완료 | `authStore.ts` logout을 async로 변경, `POST /api/auth/logout` 호출 추가 (try-catch로 실패해도 로컬 정리 보장) |
| Task 3: work_site 매핑 | ✅ 완료 | `src/utils/workSiteMapping.ts` 신규 생성 (GST→GST공장, HQ→협력사본사 매핑 + CHI 제외 필터), `attendance.ts` 실 API 응답에 CHI 필터 적용 |
| Task 4: 빌드 검증 | ✅ 완료 | `npm run build` 에러 0건 통과 |

### 변경 파일 목록

| 파일 | 변경 유형 | 주요 내용 |
|------|-----------|-----------|
| `src/api/client.ts` | 수정 | `getDeviceId()` 함수 추가(export), 요청 인터셉터에 `X-Device-ID` 헤더, 응답 인터셉터 refresh에 `device_id` |
| `src/api/auth.ts` | 수정 | `getDeviceId` import, login/refreshToken POST body에 `device_id` 추가 |
| `src/store/authStore.ts` | 수정 | `apiClient` import, logout async화 + `POST /api/auth/logout` 호출, `AuthContextType` logout 타입 `Promise<void>`로 변경 |
| `src/api/attendance.ts` | 수정 | `isActiveProductLine` import, 실 API 응답에서 CHI product_line 레코드 필터링 |
| `src/utils/workSiteMapping.ts` | **신규** | `WORK_SITE_LABEL`, `ACTIVE_PRODUCT_LINES`, `getWorkSiteLabel()`, `isActiveProductLine()` |

### Task 5: 실 데이터 연결 테스트 — ✅ 완료

- [x] 테스트 1: 로그인 (admin 계정)
- [x] 테스트 2: 대시보드 데이터 로딩
- [x] 테스트 3: 날짜별 조회
- [x] 테스트 4: 자동 새로고침
- [x] 테스트 5: 토큰 자동 갱신
- [x] 테스트 6: 로그아웃 BE 호출 + 로컬 정리

## Sprint 3 체크리스트

- [x] Task 1: client.ts에 getDeviceId + X-Device-ID 헤더 추가
- [x] Task 1: auth.ts login/refresh body에 device_id 추가
- [x] Task 1: client.ts 응답 인터셉터 내 refresh에 device_id 추가
- [x] Task 2: authStore.ts logout에 BE API 호출 추가
- [x] Task 3: workSiteMapping.ts 생성 + 대시보드 적용
- [x] Task 4: npm run build 에러 없음 (Mock 모드)
- [x] Task 4: npm run dev Mock 모드 정상 동작
- [x] Task 5: 실 데이터 로그인 성공
- [x] Task 5: 대시보드 데이터 로딩 성공
- [x] Task 5: 날짜별 조회 성공
- [x] Task 5: 자동 새로고침 동작
- [x] Task 5: 토큰 자동 갱신 동작
- [x] Task 5: 로그아웃 BE 호출 + 로컬 정리
- [x] npm run build 최종 빌드 성공

## ⚠️ 금지 사항
- Refresh Token Rotation 로직 자체 구현 금지 (BE에서 처리, FE는 자동 대응됨)
- 설정 메뉴 수정 금지 (Sprint 2에서 완료)
- 디자인/스타일 변경 금지 (Sprint 1에서 완료)
- BE 코드 수정 금지 (AXIS-OPS 저장소 건드리지 않기)
- 타입 정의 구조 변경 금지 (이미 올바르게 구현됨)
- .env.production 수정 금지 (이미 올바르게 설정됨)
```

---
---

# Phase 3-A: ETL 변경이력 알림 뱃지 + Admin 간편 로그인

> 작성일: 2026-03-11
> 대상: AXIS-VIEW (React 관리자 대시보드) — FE만 수정, BE 변경 없음
> 사전 조건: Phase 3 ✅ 완료, OPS Sprint 22-D ✅ (ETL API + Admin prefix 로그인 BE 구현 완료)
> OPS 현재 버전: v1.7.0

---

## 목적

1. ETL 변경이력 발생 시 Header 알림 + 사이드바 뱃지로 unread 건수 표시
2. Admin 로그인 시 전체 이메일 없이 "admin"만 입력해도 prefix 매칭 로그인

---

## 🚀 Phase 3-A 프롬프트 (복사해서 사용)

```
AXIS-VIEW에 ETL 변경이력 알림 뱃지와 Admin 간편 로그인을 추가합니다.
BE API는 모두 AXIS-OPS에서 구현 완료 상태이며, VIEW FE만 수정합니다.

⚠️ 반드시 읽어야 할 파일:
- CLAUDE.md: ~/Desktop/GST/AXIS-VIEW/app/CLAUDE.md (프로젝트 컨텍스트)
- 스프린트 문서: ~/Desktop/GST/AXIS-VIEW/docs/sprints/DESIGN_FIX_SPRINT.md (Phase 3-A 섹션 전체)

## 팀 구성
1명의 teammate를 생성해줘. Sonnet 모델 사용:
1. **FE** (Frontend 담당) - 소유: src/**

---

## Task 1: ETL 변경이력 unread count 관리 — Header 알림 뱃지

### 1-1. 배경

현재 Header.tsx에는 **공지사항(notices) unread 뱃지**가 이미 구현되어 있음:
- `useNotices()` 훅으로 공지 목록 조회
- `localStorage('axis_view_read_announcements')` — 읽은 공지 ID Set 저장
- `unreadCount`: 전체 notices - 읽은 notices = 미읽음 건수

이와 **동일한 패턴**으로 ETL 변경이력 unread 뱃지를 추가한다.

### 1-2. ETL 변경이력 unread 로직

**BE API (이미 구현됨)**: `GET /api/admin/etl/changes?days=1`
- 응답: `{ changes: [...], summary: { total_changes, by_field: {...} } }`
- `summary.total_changes`: 최근 1일 변경 건수

**FE unread 추적 방식**:
- `localStorage` 키: `axis_view_last_seen_change_count`
- 값: 마지막으로 확인한 시점의 total_changes 숫자
- unread = API의 `total_changes` - localStorage 저장값
- 사용자가 변경이력 페이지(`/qr/changes`)에 진입하면 현재 total_changes를 localStorage에 저장 (읽음 처리)

**대안 방식 (더 정확)**: `last_seen_change_id` 방식
- `localStorage` 키: `axis_view_last_seen_change_id`
- 값: 마지막으로 확인한 change_log의 최신 ID
- ETL changes API 응답의 `changes[0].id` (가장 최근 ID)와 비교
- unread = changes 배열에서 id > last_seen_change_id인 항목 수
- 이 방식이 더 정확함 → **이 방식으로 구현**

### 1-3. Header.tsx 수정

현재 Header에 **알림 벨 아이콘**(line 197-239)이 있음. 여기에 ETL unread 뱃지를 추가.

기존 알림 벨에는 빨간 dot만 있고 숫자 뱃지가 없음 → **ETL unread count > 0 일 때 숫자 뱃지 표시**

```tsx
// useEtlChanges 훅은 이미 존재함 (Phase 2-2에서 추가)
const { data: etlData } = useEtlChanges({ days: 1 });

const etlUnreadCount = useMemo(() => {
  const changes = etlData?.changes ?? [];
  if (changes.length === 0) return 0;
  try {
    const lastSeenId = Number(localStorage.getItem('axis_view_last_seen_change_id') ?? '0');
    return changes.filter((c: { id: number }) => c.id > lastSeenId).length;
  } catch {
    return changes.length;
  }
}, [etlData]);
```

**알림 벨 뱃지 렌더링** (공지사항 뱃지와 동일한 스타일):
```tsx
{etlUnreadCount > 0 && (
  <span style={{
    position: 'absolute', top: '-4px', right: '-4px',
    minWidth: '16px', height: '16px',
    background: 'var(--gx-danger)', color: 'white',
    fontSize: '9px', fontWeight: 700,
    borderRadius: '8px', border: '2px solid var(--gx-white)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 3px',
  }}>
    {etlUnreadCount > 99 ? '99+' : etlUnreadCount}
  </span>
)}
```

### 1-4. 알림 벨 클릭 → ETL 변경 드롭다운 (선택적)

**최소 구현**: 알림 벨 클릭 시 `/qr/changes` 페이지로 이동
```tsx
onClick={() => navigate('/qr/changes')}
```

**확장 구현 (권장)**: 알림 벨 클릭 시 드롭다운으로 최근 변경 3~5건 표시 + "전체 보기" 링크
- 드롭다운 스타일: 공지사항 AnnouncementPanel과 유사한 패턴
- 각 항목: `[필드명] S/N 변경됨` + 시간
- "전체 보기" → `/qr/changes` 이동

**구현 수준은 최소 구현으로 진행하되**, 드롭다운이 가능하면 확장 구현으로 진행.

---

## Task 2: 사이드바 "변경 이력" 뱃지 — Sidebar.tsx

### 2-1. 배경

현재 Sidebar.tsx의 QR 관리 서브메뉴:
```typescript
// line 104-112
{
  label: 'QR 관리',
  icon: <QrIcon />,
  to: '/qr',
  children: [
    { label: 'QR Registry', to: '/qr' },
    { label: '변경 이력', to: '/qr/changes' },
  ],
},
```

"변경 이력" 항목 옆에 ETL unread count 빨간 뱃지를 표시한다.
(참고 이미지: 불량 분석 옆 숫자 3 빨간 뱃지와 동일한 스타일)

### 2-2. SubNavItem 인터페이스 확장

```typescript
interface SubNavItem {
  label: string;
  to: string;
  preparing?: boolean;
  badge?: number;        // 추가: 숫자 뱃지 (0이면 미표시)
}
```

### 2-3. 뱃지 데이터 전달

Sidebar에서 ETL unread count를 알아야 함. 방법:

**방법 A**: Sidebar 내부에서 `useEtlChanges()` 직접 호출
**방법 B**: Layout에서 props로 전달
**방법 C**: Context/Store로 공유

**방법 A가 가장 간단** → Sidebar.tsx 내부에서:
```tsx
import { useEtlChanges } from '@/hooks/useEtlChanges';

// Sidebar 컴포넌트 내부
const { data: etlData } = useEtlChanges({ days: 1 });
const etlUnreadCount = useMemo(() => {
  const changes = etlData?.changes ?? [];
  if (changes.length === 0) return 0;
  try {
    const lastSeenId = Number(localStorage.getItem('axis_view_last_seen_change_id') ?? '0');
    return changes.filter((c: { id: number }) => c.id > lastSeenId).length;
  } catch {
    return changes.length;
  }
}, [etlData]);
```

그리고 children에 badge 전달:
```typescript
children: [
  { label: 'QR Registry', to: '/qr' },
  { label: '변경 이력', to: '/qr/changes', badge: etlUnreadCount },
],
```

### 2-4. 뱃지 렌더링 (서브메뉴 아이템)

기존 `preparing` 뱃지 렌더링 코드(line 407-422) 옆에 추가:
```tsx
{child.badge != null && child.badge > 0 && (
  <span style={{
    fontSize: '10px',
    fontWeight: 600,
    padding: '2px 7px',
    borderRadius: '10px',
    background: 'var(--gx-danger)',
    color: 'white',
    flexShrink: 0,
    marginLeft: 'auto',
  }}>
    {child.badge > 99 ? '99+' : child.badge}
  </span>
)}
```

---

## Task 3: ETL 변경이력 읽음 처리

### 3-1. `/qr/changes` 페이지 진입 시 읽음 처리

변경이력 페이지 컴포넌트(QrChangesPage 또는 해당 페이지)에서:

```tsx
useEffect(() => {
  if (etlData?.changes?.length) {
    const latestId = Math.max(...etlData.changes.map((c: { id: number }) => c.id));
    localStorage.setItem('axis_view_last_seen_change_id', String(latestId));
    // Header와 Sidebar의 뱃지가 자동으로 0으로 업데이트되도록
    // 필요 시 상태 갱신 트리거 (예: readVersion 패턴 사용)
  }
}, [etlData]);
```

### 3-2. 뱃지 갱신 트리거

공지사항에서 사용하는 `readVersion` 패턴과 동일하게:
- localStorage 변경 후 컴포넌트 리렌더 트리거 필요
- 방법: `useState` 카운터 증가 or `window.dispatchEvent(new Event('storage'))` 활용
- 또는 TanStack Query의 `queryClient.invalidateQueries(['etl-changes'])` 사용

---

## Task 4: Admin 간편 로그인 (prefix 매칭)

### 4-1. 배경

OPS Sprint 22-D에서 BE에 `get_admin_by_email_prefix()` 2단계 매칭 구현 완료:
- 1단계: `WHERE email LIKE '{prefix}@%'` (prefix@ 매칭)
- 2단계: `WHERE email LIKE '{prefix}%'` (prefix로 시작하는 전체 매칭)
- 결과 1건 → 해당 worker로 로그인 처리
- 결과 0건 또는 2건+ → 기존 방식으로 fallback

### 4-2. auth.ts 수정

현재 login 함수 (line 44-62):
```typescript
export async function login(email: string, password: string): Promise<LoginResponse> {
  if (USE_MOCK) return mockLogin(email, password);
  const response = await apiClient.post<LoginResponse>('/api/auth/login', {
    email, password, device_id: getDeviceId(),
  });
  // ...
}
```

**수정**: `email`에 `@`가 포함되지 않으면 prefix 로그인으로 전환

```typescript
export async function login(emailOrPrefix: string, password: string): Promise<LoginResponse> {
  if (USE_MOCK) return mockLogin(emailOrPrefix, password);

  // @ 미포함 → prefix 로그인 (OPS Sprint 22-D BE 기능)
  const isPrefix = !emailOrPrefix.includes('@');

  const response = await apiClient.post<LoginResponse>('/api/auth/login', {
    email: emailOrPrefix,
    password,
    device_id: getDeviceId(),
    ...(isPrefix && { login_type: 'prefix' }),
  });

  const data = response.data;
  if (!data.worker.is_admin && !data.worker.is_manager) {
    throw new Error('대시보드 접근 권한이 없습니다. 관리자 또는 협력사 관리자 계정으로 로그인해주세요.');
  }
  return data;
}
```

⚠️ **BE 동작 확인**: OPS BE의 `/api/auth/login`이 `login_type: 'prefix'` 파라미터를 받는지 확인 필요.
만약 BE가 email 필드에 `@` 없으면 자동으로 prefix 매칭하는 방식이라면 `login_type` 파라미터 불필요 → 그냥 email 필드에 prefix 값을 그대로 전송하면 됨.

### 4-3. LoginPage.tsx 수정

**이메일 입력 필드 안내 변경**:
- placeholder: `이메일 또는 관리자 ID` (기존: `이메일을 입력하세요`)
- input type: `email` → `text` (prefix 입력 시 브라우저 email 유효성 검사 우회)

```tsx
<input
  type="text"                    // email → text 변경
  placeholder="이메일 또는 관리자 ID"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  autoComplete="email"
  // ... 기존 스타일 유지
/>
```

**폼 유효성 검증 수정** (line 31-34):
```typescript
// 기존: !email → prefix도 허용
if (!email.trim() || !password) {
  setError('이메일(또는 ID)과 비밀번호를 입력해주세요.');
  return;
}
```

---

## Task 5: 빌드 검증 + 실 데이터 테스트

### 5-1. 빌드 검증
```bash
npm run build
```
- TypeScript 에러 0건 확인

### 5-2. 실 데이터 테스트 항목

`.env.development`에서 `VITE_USE_MOCK=false` 확인 후:

#### 테스트 1: Admin prefix 로그인
- "admin" + 비밀번호로 로그인 시도
- 성공 확인 (admin@... 계정으로 매칭)
- 기존 전체 이메일 로그인도 정상 동작 확인

#### 테스트 2: ETL 알림 뱃지 — Header
- 로그인 후 Header 알림 벨에 ETL unread 숫자 뱃지 표시 확인
- ETL 변경이력이 0건이면 뱃지 미표시 확인

#### 테스트 3: ETL 알림 뱃지 — 사이드바
- 사이드바 QR 관리 > "변경 이력" 옆 빨간 숫자 뱃지 표시 확인
- Header 뱃지와 같은 숫자인지 확인

#### 테스트 4: 읽음 처리
- `/qr/changes` 페이지 진입
- Header + 사이드바 뱃지가 0으로 변경 (사라짐) 확인
- 페이지 새로고침 후에도 뱃지 0 유지 (localStorage 저장됨)

#### 테스트 5: 기존 기능 확인
- 공지사항 뱃지 정상 동작 확인
- 대시보드 데이터 로딩 정상
- 로그아웃 정상

---

## 파일 목록

```
src/components/layout/Header.tsx    — ETL unread 뱃지 추가 (수정)
src/components/layout/Sidebar.tsx   — SubNavItem badge 확장 + 변경이력 뱃지 (수정)
src/pages/LoginPage.tsx             — input type 변경 + placeholder 변경 (수정)
src/api/auth.ts                     — prefix 로그인 분기 (수정)
src/pages/QrChangesPage.tsx         — 읽음 처리 useEffect 추가 (수정, 파일명 확인 필요)
```

## 체크리스트

- [x] Header.tsx: ETL unread count 계산 + 알림 벨 숫자 뱃지 표시
- [x] Sidebar.tsx: SubNavItem에 badge 필드 추가 + "변경 이력" 뱃지 렌더링
- [x] EtlChangeLogPage: 페이지 진입 시 last_seen_change_id 저장 (읽음 처리)
- [x] 읽음 후 Header + Sidebar 뱃지 동시 갱신
- [x] LoginPage.tsx: input type=text + placeholder 변경
- [x] auth.ts: @ 미포함 시 prefix 로그인 전송
- [ ] Admin prefix 로그인 테스트 ("admin" + 비밀번호) — 실 데이터 테스트 필요
- [ ] 기존 이메일 로그인 정상 동작 확인 — 실 데이터 테스트 필요
- [x] npm run build 에러 없음

## ⚠️ 금지 사항
- BE 코드 수정 금지 (AXIS-OPS 저장소 건드리지 않기)
- 공지사항 기존 unread 로직 변경 금지
- 디자인 시스템(G-AXIS) 토큰 변경 금지
- .env.production 수정 금지
```

---

# Phase 4: 페이지별 Role 기반 접근 제어 + OPS 권한 부여 연동

> **시작일**: 2026-03-11
> **목표**: 페이지마다 접근 가능한 role을 설정하고, OPS의 관리자 권한 부여 기능을 VIEW에서도 사용 가능하게 연동

---

## 배경

현재 `ProtectedRoute`는 `is_admin || is_manager`만 체크하여 모든 페이지에 동일 접근 허용.
페이지별로 접근 가능한 role을 구분해야 함. 또한 OPS에 구현된 Manager 권한 위임 기능을 VIEW에서도 관리할 수 있어야 함.

---

## 페이지별 Role 매핑

| 페이지 | 경로 | 접근 가능 role | 비고 |
|--------|------|---------------|------|
| 협력사 대시보드 | `/attendance` | `admin`, `manager` | manager → 자사 데이터만 (BE 필터) |
| QR Registry | `/qr` | `admin`, `manager` | manager → 자사 담당 S/N만 (BE 필터) |
| 변경 이력 | `/qr/changes` | `admin`, `manager` | 전체 접근 허용 (필터 불필요) |
| 생산 일정 | `/plan` | `admin`, `manager` | manager 접근 허용 |
| 공장 대시보드 | `/factory` | `admin` only | GST 내부 전용 |
| 불량 분석 | `/defect` | `admin` only | GST 내부 전용 |
| CT 분석 | `/ct` | `admin` only | GST 내부 전용 |
| 권한 관리 | `/admin/permissions` | `admin`, `manager` | **신규 페이지** — OPS 권한 위임 연동 |

> 추후 추가될 AI 예측, AI 챗봇 페이지도 `admin` only 예정

---

## Task 1: ProtectedRoute에 role 기반 접근 제어 추가

**수정 파일**: `src/components/auth/ProtectedRoute.tsx`

**현재 코드** (참고):
```tsx
// 현재: is_admin || is_manager만 체크
if (!user.is_admin && !user.is_manager) {
  return <Navigate to="/login" />;
}
```

**변경 내용**:
```tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'manager')[];  // ← 추가
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  // 기본: admin + manager 모두 허용 (기존 동작 유지)
  if (!allowedRoles) {
    if (!user.is_admin && !user.is_manager) return <Navigate to="/login" />;
  } else {
    const hasAccess =
      (allowedRoles.includes('admin') && user.is_admin) ||
      (allowedRoles.includes('manager') && user.is_manager);
    if (!hasAccess) return <Navigate to="/unauthorized" />;  // 또는 /login
  }
  return <>{children}</>;
}
```

**핵심**: `allowedRoles` 미지정 시 기존 동작 유지 (하위 호환성)

---

## Task 2: App.tsx 라우트에 role 적용

**수정 파일**: `src/App.tsx`

**변경 내용**: 각 라우트에 `allowedRoles` 지정

```tsx
{/* admin + manager 접근 */}
<Route path="/attendance" element={
  <ProtectedRoute allowedRoles={['admin', 'manager']}>
    <AttendancePage />
  </ProtectedRoute>
} />
<Route path="/qr" element={
  <ProtectedRoute allowedRoles={['admin', 'manager']}>
    <QrManagementPage />
  </ProtectedRoute>
} />
<Route path="/qr/changes" element={
  <ProtectedRoute allowedRoles={['admin', 'manager']}>
    <EtlChangeLogPage />
  </ProtectedRoute>
} />
<Route path="/plan" element={
  <ProtectedRoute allowedRoles={['admin', 'manager']}>
    <ProductionPlanPage />
  </ProtectedRoute>
} />

{/* admin only */}
<Route path="/factory" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <FactoryDashboardPage />
  </ProtectedRoute>
} />
<Route path="/defect" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <DefectAnalysisPage />
  </ProtectedRoute>
} />
<Route path="/ct" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <CtAnalysisPage />
  </ProtectedRoute>
} />

{/* 권한 관리 — admin + manager */}
<Route path="/admin/permissions" element={
  <ProtectedRoute allowedRoles={['admin', 'manager']}>
    <PermissionsPage />
  </ProtectedRoute>
} />
```

---

## Task 3: Sidebar 메뉴 role 기반 표시/숨김

**수정 파일**: `src/components/layout/Sidebar.tsx`

**현재**: 모든 메뉴가 동일하게 표시됨 (Lock 아이콘 메뉴 포함)

**변경 내용**:
1. NavItem 인터페이스에 `roles` 필드 추가:
```tsx
interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType;
  roles?: ('admin' | 'manager')[];  // ← 추가
  disabled?: boolean;
  children?: SubNavItem[];
}
```

2. 메뉴 정의에 role 지정:
```tsx
const navItems: NavItem[] = [
  { label: '협력사 대시보드', path: '/attendance', icon: UsersIcon, roles: ['admin', 'manager'] },
  { label: 'QR 관리', path: '/qr', icon: QrCodeIcon, roles: ['admin', 'manager'],
    children: [
      { label: 'QR Registry', path: '/qr' },
      { label: '변경 이력', path: '/qr/changes', badge: unreadCount },
    ]
  },
  { label: '생산 일정', path: '/plan', icon: CalendarIcon, roles: ['admin', 'manager'] },
  { label: '공장 대시보드', path: '/factory', icon: BuildingIcon, roles: ['admin'] },
  { label: '불량 분석', path: '/defect', icon: AlertTriangleIcon, roles: ['admin'] },
  { label: 'CT 분석', path: '/ct', icon: ClockIcon, roles: ['admin'] },
  { label: '권한 관리', path: '/admin/permissions', icon: ShieldIcon, roles: ['admin', 'manager'] },
];
```

3. 렌더링 시 현재 user role에 따라 필터링:
```tsx
const visibleItems = navItems.filter(item => {
  if (!item.roles) return true;
  return (item.roles.includes('admin') && user.is_admin) ||
         (item.roles.includes('manager') && user.is_manager);
});
```

**결과**:
- **Admin 로그인**: 모든 메뉴 표시
- **Manager 로그인**: 협력사 대시보드, QR 관리, 생산 일정, 권한 관리만 표시

---

## Task 4: 권한 관리 페이지 (OPS 연동)

**신규 파일**: `src/pages/admin/PermissionsPage.tsx`

**사용 API** (OPS에 이미 구현됨):
- `GET /api/admin/workers` — 작업자 목록 (is_admin → 전체, is_manager → 자사)
- `PUT /api/admin/workers/:id/manager` — Manager 권한 부여/해제

**화면 구성**:

1. **헤더**: "권한 관리" 타이틀 + 현재 로그인 회사명 표시 (manager인 경우)
2. **작업자 테이블**:
   | 이름 | 이메일 | 역할 | 회사 | Manager 권한 |
   |------|--------|------|------|-------------|
   | 홍길동 | hong@bat.com | MM | BAT | 🔘 Toggle |

3. **Toggle 동작**:
   - ON/OFF 스위치로 `is_manager` 부여/해제
   - API: `PUT /api/admin/workers/{id}/manager` body: `{ "is_manager": true/false }`
   - 성공 시 목록 자동 갱신
   - Admin 사용자 행은 Toggle 비활성화 (변경 불가 표시)

4. **Manager 제한**:
   - Manager 로그인 시: 자기 회사 소속만 표시 (BE에서 필터)
   - Admin 로그인 시: 전체 작업자 표시

**필요 API 훅**:
```tsx
// src/api/workers.ts — 신규
export async function getWorkers(): Promise<Worker[]> { ... }
export async function toggleManager(workerId: number, isManager: boolean): Promise<void> { ... }

// src/hooks/useWorkers.ts — 신규
export function useWorkers() { ... }  // TanStack Query
```

---

## Task 5: Unauthorized 페이지

**신규 파일**: `src/pages/UnauthorizedPage.tsx`

**내용**: role 부족으로 접근 거부된 경우 표시하는 페이지
- "접근 권한이 없습니다" 메시지
- "대시보드로 돌아가기" 버튼 (→ 기본 허용 페이지로 이동)

---

## Task 6: 빌드 검증 + 테스트

1. `npm run build` — 에러 없음 확인
2. Admin 로그인 → 모든 페이지 접근 가능
3. Manager 로그인:
   - 협력사 대시보드 ✅ 접근 가능
   - QR 관리 / 변경 이력 ✅ 접근 가능
   - 생산 일정 ✅ 접근 가능
   - 공장 대시보드 ❌ → Unauthorized 페이지
   - 불량 분석 ❌ → Unauthorized 페이지
   - CT 분석 ❌ → Unauthorized 페이지
   - 권한 관리 ✅ → 자사 작업자만 표시
4. Sidebar: Manager 로그인 시 admin-only 메뉴 숨김 확인
5. 권한 관리: Toggle 동작 확인

---

## 파일 목록

```
src/components/auth/ProtectedRoute.tsx     — allowedRoles prop 추가 (수정)
src/App.tsx                                — 라우트별 role 지정 (수정)
src/components/layout/Sidebar.tsx          — 메뉴 role 필터링 (수정)
src/pages/admin/PermissionsPage.tsx        — 권한 관리 페이지 (신규)
src/pages/UnauthorizedPage.tsx             — 접근 거부 페이지 (신규)
src/api/workers.ts                         — 작업자 API (신규)
src/hooks/useWorkers.ts                    — 작업자 훅 (신규)
```

## 체크리스트

- [x] ProtectedRoute에 allowedRoles prop 추가 (Task 1)
- [x] App.tsx 라우트별 role 지정 (Task 2)
- [x] Sidebar 메뉴 role 기반 필터링 (Task 3)
- [x] 권한 관리 페이지 — 작업자 목록 + Toggle (Task 4)
- [x] Unauthorized 페이지 (Task 5)
- [ ] Admin 로그인 — 전체 페이지 접근 확인 — 실 데이터 테스트 필요
- [ ] Manager 로그인 — admin-only 페이지 차단 확인 — 실 데이터 테스트 필요
- [ ] Manager 로그인 — Sidebar에서 admin-only 메뉴 숨김 확인 — 실 데이터 테스트 필요
- [x] 권한 Toggle 동작 확인 — API endpoint 수정 완료 (`/toggle-manager` → `/manager`)
- [x] Manager 자사 필터링 확인 — `PermissionsPage` company 필터 추가 완료
- [x] npm run build 에러 없음

## ⚠️ 금지 사항
- BE 코드 수정 금지 (AXIS-OPS 저장소 건드리지 않기)
- 기존 페이지 기능/디자인 변경 금지
- 디자인 시스템(G-AXIS) 토큰 변경 금지
- .env.production 수정 금지

---

# pi_start(가압시작) 변경이력 추적 추가 — ✅ VIEW FE 완료 (2026-03-14)

> OPS_API_REQUESTS #14 참조
> 의존성: AXIS-CORE ETL + AXIS-OPS BE 수정 완료 후 진행

## 변경 파일

**`app/src/pages/qr/EtlChangeLogPage.tsx`**

### 1. FIELD_CONFIG에 pi_start 추가

```typescript
// 기존 5개 → 6개
const FIELD_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ship_plan_date: { label: '출하예정', color: '#3B82F6', bg: '#EFF6FF' },
  mech_start:     { label: '기구시작', color: '#F59E0B', bg: '#FFFBEB' },
  pi_start:       { label: '가압시작', color: '#EC4899', bg: '#FDF2F8' },  // 신규
  mech_partner:   { label: '기구외주', color: '#10B981', bg: '#ECFDF5' },
  elec_partner:   { label: '전장외주', color: '#8B5CF6', bg: '#F5F3FF' },
  sales_order:    { label: '판매오더', color: '#EF4444', bg: '#FEF2F2' },
};
```

### 2. DATE_FIELDS에 pi_start 추가

```typescript
const DATE_FIELDS = new Set(['ship_plan_date', 'mech_start', 'pi_start']);
```

### 3. KPI 카드 그리드 6열로 변경

```typescript
// gridTemplateColumns: 'repeat(5, 1fr)' → 'repeat(6, 1fr)'
```

### 4. kpiCards 배열에 pi_start 추가

```typescript
const kpiCards = [
  { key: 'all', ... },
  ...['ship_plan_date', 'mech_start', 'pi_start', 'mech_partner', 'elec_partner'].map(...)
  //                                   ^^^^^^^^ 추가
];
```

### 5. 주간 추이 차트에 가압시작 카테고리 추가

```typescript
// buildWeeklyChart 함수에 '가압시작' 카운트 추가
if (!weeks[key]) weeks[key] = { 출하예정: 0, 기구시작: 0, 가압시작: 0, 협력사: 0, 판매오더: 0 };
if (c.field_name === 'pi_start') weeks[key]['가압시작']++;

// Bar 차트에 추가
<Bar dataKey="가압시작" stackId="a" fill="#EC4899" />
```

## 체크리스트

- [x] AXIS-CORE ETL: `TRACKED_FIELDS`에 `pressure_test: pi_start` 추가
- [x] AXIS-CORE ETL: `_prefetch_tracked_values()` SELECT에 `pi_start` 추가
- [x] AXIS-OPS BE: `_FIELD_LABELS`에 `pi_start: 가압시작` 추가
- [x] AXIS-VIEW FE: `FIELD_CONFIG`에 `pi_start` 추가
- [x] AXIS-VIEW FE: `DATE_FIELDS`에 `pi_start` 추가
- [x] AXIS-VIEW FE: KPI 그리드 5열 → 6열
- [x] AXIS-VIEW FE: kpiCards 배열에 `pi_start` 추가
- [x] AXIS-VIEW FE: 주간 차트에 가압시작 카테고리 + Bar 추가
- [x] npm run build 에러 없음
- [ ] ETL 실행 후 변경이력 페이지에서 가압시작 데이터 확인

---

# ETL 변경이력 O/N(오더넘버) 컬럼 추가 — ✅ 완료 (2026-03-14)

## 배경

변경 이력 테이블에 어떤 오더(sales_order)의 S/N인지 한눈에 확인할 수 있도록 O/N 컬럼 추가.

## 변경 내역

### 1. AXIS-OPS BE — `sales_order` 응답 추가 (커밋: `6551d54`)

```python
# backend/app/routes/admin.py — etl/changes 엔드포인트
# SELECT에 p.sales_order 추가
# 응답 dict에 'sales_order': row[col_idx] 추가
```

### 2. AXIS-VIEW FE — API 타입 + 테이블 컬럼

#### 2-1. `app/src/api/etl.ts`

```typescript
// ChangeLogEntry 인터페이스에 추가
export interface ChangeLogEntry {
  id: number;
  serial_number: string;
  sales_order: string | null;  // 신규
  model: string;
  // ...
}
```

#### 2-2. `app/src/pages/qr/EtlChangeLogPage.tsx`

```typescript
// 테이블 헤더 변경 (6열 → 7열)
['O/N', 'S/N', 'Model', '변경 항목', '이전 값', '변경 값', '변경일']

// 헤더 right-align 인덱스: 5 → 6 (변경일 컬럼)

// Loading/Empty state colSpan: 6 → 7

// 테이블 body에 O/N 셀 추가 (S/N 앞)
<td style={{ ... fontFamily: 'var(--font-mono)' }}>
  {c.sales_order || '—'}
</td>
```

## 컬럼 순서

| # | 컬럼 | 필드 | 비고 |
|---|------|------|------|
| 1 | O/N | `sales_order` | 신규 — mono 폰트 |
| 2 | S/N | `serial_number` | 기존 |
| 3 | Model | `model` | 기존 |
| 4 | 변경 항목 | `field_label` | 기존 — 뱃지 |
| 5 | 이전 값 | `old_value` | 기존 |
| 6 | 변경 값 | `new_value` | 기존 |
| 7 | 변경일 | `changed_at` | 기존 — right-align |

## 체크리스트

- [x] AXIS-OPS BE: SELECT + 응답에 `sales_order` 추가 (`6551d54`)
- [x] AXIS-VIEW FE: `ChangeLogEntry` 타입에 `sales_order` 추가
- [x] AXIS-VIEW FE: 테이블 헤더 7열 (`O/N` 추가)
- [x] AXIS-VIEW FE: 테이블 body에 O/N `<td>` 추가
- [x] AXIS-VIEW FE: Loading/Empty colSpan 6→7
- [x] npm run build 에러 없음
