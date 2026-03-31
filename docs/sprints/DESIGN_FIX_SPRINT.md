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

---

# 공장 API 연동 — 생산일정 + 주간 KPI (VIEW FE) — ✅ 완료 (2026-03-15)

> OPS Sprint 29 (BE only) 완료 후 진행
> 참조: OPS_API_REQUESTS.md #9, #10
> 의존성: `GET /api/admin/factory/monthly-detail`, `GET /api/admin/factory/weekly-kpi`

## 배경

현재 `FactoryDashboardPage.tsx`와 `ProductionPlanPage.tsx`는 샘플(하드코딩) 데이터로 렌더링 중.
OPS Sprint 29에서 `factory.py` 블루프린트 + 2개 엔드포인트가 구현되면, VIEW FE에서 Mock→API 전환 필요.

## 현재 FE 상태

| 페이지 | 파일 | 상태 | 비고 |
|--------|------|------|------|
| 공장 대시보드 | `pages/factory/FactoryDashboardPage.tsx` | 샘플 데이터 | KPI 4카드 + 테이블 + 모델별 bar + 최근활동 + 월간 모델 |
| 생산일정 | `pages/plan/ProductionPlanPage.tsx` | 샘플 데이터 | 파이프라인 원형 + 범례 + 필터탭 + 16컬럼 날짜 테이블 |
| API 모듈 | `api/factory.ts` | ❌ 미생성 | |
| Query 훅 | `hooks/useFactory.ts` | ❌ 미생성 | |

## 변경 파일

### 신규 생성

- `app/src/api/factory.ts` — API 호출 함수
- `app/src/hooks/useFactory.ts` — TanStack Query 훅

### 수정

- `app/src/pages/factory/FactoryDashboardPage.tsx` — 샘플 제거 → API 데이터
- `app/src/pages/plan/ProductionPlanPage.tsx` — 샘플 제거 → API 데이터

---

## Task 1: `api/factory.ts` 생성

```typescript
// src/api/factory.ts
// 공장 API — OPS Sprint 29 연동

import apiClient from './client';

/* ── #10 월간 생산 현황 ── */

export interface MonthlyDetailParams {
  month?: string;         // YYYY-MM (기본: 현재 월)
  date_field?: 'pi_start' | 'mech_start';  // 기본: pi_start
  page?: number;          // 기본: 1
  per_page?: number;      // 기본: 50, max: 200
}

export interface CompletionStatus {
  mech: boolean;
  elec: boolean;
  tm: boolean | null;     // GAIA: bool, 비GAIA: null
  pi: boolean;
  qi: boolean;
  si: boolean;
}

export interface ProductionItem {
  sales_order: string;
  product_code: string;
  serial_number: string;
  model: string;
  customer: string;
  line: string;
  mech_partner: string;
  elec_partner: string;
  mech_start: string | null;
  mech_end: string | null;
  elec_start: string | null;
  elec_end: string | null;
  pi_start: string | null;
  qi_start: string | null;
  si_start: string | null;
  finishing_plan_end: string | null;
  completion: CompletionStatus;
  progress_pct: number;
}

export interface ModelCount {
  model: string;
  count: number;
}

export interface MonthlyDetailResponse {
  month: string;
  items: ProductionItem[];
  by_model: ModelCount[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/* ── #9 주간 KPI ── */

export interface WeeklyKpiParams {
  week?: number;    // ISO week 1~53 (기본: 현재 주)
  year?: number;    // (기본: 현재 연도)
}

export interface WeeklyKpiResponse {
  week: number;
  year: number;
  week_range: { start: string; end: string };
  production_count: number;
  completion_rate: number;
  by_model: ModelCount[];
  by_stage: {
    mech: number;
    elec: number;
    tm: number;
    pi: number;
    qi: number;
    si: number;
  };
  pipeline: {
    pi: number;
    qi: number;
    si: number;
    shipped: number;
  };
}

/* ── API 호출 ── */

export async function getMonthlyDetail(params: MonthlyDetailParams = {}): Promise<MonthlyDetailResponse> {
  const searchParams = new URLSearchParams();
  if (params.month) searchParams.set('month', params.month);
  if (params.date_field) searchParams.set('date_field', params.date_field);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.per_page) searchParams.set('per_page', String(params.per_page));

  const query = searchParams.toString();
  const url = `/api/admin/factory/monthly-detail${query ? `?${query}` : ''}`;
  const { data } = await apiClient.get<MonthlyDetailResponse>(url);
  return data;
}

export async function getWeeklyKpi(params: WeeklyKpiParams = {}): Promise<WeeklyKpiResponse> {
  const searchParams = new URLSearchParams();
  if (params.week) searchParams.set('week', String(params.week));
  if (params.year) searchParams.set('year', String(params.year));

  const query = searchParams.toString();
  const url = `/api/admin/factory/weekly-kpi${query ? `?${query}` : ''}`;
  const { data } = await apiClient.get<WeeklyKpiResponse>(url);
  return data;
}
```

---

## Task 2: `hooks/useFactory.ts` 생성

```typescript
// src/hooks/useFactory.ts
// 공장 API TanStack Query 훅

import { useQuery } from '@tanstack/react-query';
import {
  getMonthlyDetail, getWeeklyKpi,
  type MonthlyDetailParams, type WeeklyKpiParams,
} from '@/api/factory';

export function useMonthlyDetail(params: MonthlyDetailParams = {}) {
  return useQuery({
    queryKey: ['factory', 'monthly-detail', params],
    queryFn: () => getMonthlyDetail(params),
    staleTime: 5 * 60 * 1000,   // 5분
  });
}

export function useWeeklyKpi(params: WeeklyKpiParams = {}) {
  return useQuery({
    queryKey: ['factory', 'weekly-kpi', params],
    queryFn: () => getWeeklyKpi(params),
    staleTime: 5 * 60 * 1000,
  });
}
```

---

## Task 3: `FactoryDashboardPage.tsx` API 전환

### 삭제 대상

- `SAMPLE_KPI`, `SAMPLE_TABLE`, `SAMPLE_CHART`, `SAMPLE_ACTIVITIES`, `MONTHLY_MODELS` 상수 전체 제거
- `PrepareBanner` 컴포넌트 제거

### API 연동

```typescript
import { useWeeklyKpi, useMonthlyDetail } from '@/hooks/useFactory';

// 주간 KPI (기본: 현재 주)
const { data: kpi, isLoading: kpiLoading } = useWeeklyKpi();

// 월간 모델별 (공장 대시보드 하단 호리즌 bar)
const { data: monthly } = useMonthlyDetail({ per_page: 1 }); // by_model만 필요
```

### KPI 카드 매핑

| 카드 | 현재 샘플 | API 필드 |
|------|----------|----------|
| 주간 생산량 | `37대` | `kpi.production_count` + `대` |
| 완료율 | `84.2%` | `kpi.completion_rate` + `%` |
| 파이프라인(PI) | — | `kpi.pipeline.pi` + `대` |
| 출하 완료 | — | `kpi.pipeline.shipped` + `대` |

### 모델별 차트 매핑

- `SAMPLE_CHART` → `kpi.by_model` (주간)
- `MONTHLY_MODELS` → `monthly.by_model` (월간)

### 생산 현황 테이블

- `SAMPLE_TABLE` → 별도 `useMonthlyDetail({ per_page: 5 })` 호출
- `progress` → `item.progress_pct`
- `status` → `progress_pct >= 100 ? 'completed' : progress_pct > 0 ? 'in-progress' : 'pending'`

### 최근 활동 피드

- `SAMPLE_ACTIVITIES` → ETL 변경이력 최근 5건 재활용 (`useEtlChanges({ days: 1, limit: 5 })`)
- 또는 추후 BE 알림 API 구현 시 전환 (현재는 샘플 유지 가능)

### 공정 파이프라인

- 현재 KPI 카드에 통합 또는 별도 카드로:
  - PI: `kpi.pipeline.pi`
  - QI: `kpi.pipeline.qi`
  - SI: `kpi.pipeline.si`
  - 출하: `kpi.pipeline.shipped`

---

## Task 4: `ProductionPlanPage.tsx` API 전환

### 삭제 대상

- `KPI_ITEMS`, `PIPELINE_STEPS`, `SAMPLE_DATA`, `TODAY` 상수 제거
- `PrepareBanner` 컴포넌트 제거

### API 연동

```typescript
import { useMonthlyDetail } from '@/hooks/useFactory';

const [month, setMonth] = useState(() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
});
const [dateField, setDateField] = useState<'pi_start' | 'mech_start'>('pi_start');
const [page, setPage] = useState(1);

const { data, isLoading } = useMonthlyDetail({
  month,
  date_field: dateField,
  page,
  per_page: 50,
});
```

### KPI 카드 매핑

| 카드 | 현재 샘플 | API 필드 |
|------|----------|----------|
| N월 기구시작/가압시작 | `193` | `data.total` |
| 필터된 결과 | `43` | `data.items.length` (현재 페이지) |
| 고객사 수 | `16` | `new Set(data.items.map(i => i.customer)).size` |
| 모델 수 | `17` | `data.by_model.length` |
| 총 데이터수 | `590` | `data.total` |

### 파이프라인 원형 카운트

- weekly-kpi `pipeline` 연동 가능 (별도 `useWeeklyKpi()` 호출)
- 또는 items에서 completion 집계:
  - PI: `items.filter(i => i.completion.pi && !i.completion.qi).length`
  - QI: `items.filter(i => i.completion.qi && !i.completion.si).length`
  - SI: `items.filter(i => i.completion.si).length`

### 테이블 컬럼 매핑 (16컬럼 → API 필드)

| 현재 컬럼 | API 필드 | 비고 |
|----------|----------|------|
| O/N | `sales_order` | |
| 제품번호 | `product_code` | |
| S/N | `serial_number` | |
| 모델 | `model` | |
| 고객사 | `customer` | |
| 라인 | `line` | |
| 기구업체 | `mech_partner` | |
| 전장업체 | `elec_partner` | |
| 기구시작 | `mech_start` | 날짜 색상 적용 |
| 기구종료 | `mech_end` | 날짜 색상 적용 |
| 전장시작 | `elec_start` | 날짜 색상 적용 |
| 전장종료 | `elec_end` | 날짜 색상 적용 |
| 가압시작 | `pi_start` | 날짜 색상 적용 |
| 자주검사 | — | 컬럼 삭제 (테이블 미존재) |
| 공정시작 | `qi_start` | 날짜 색상 적용 |
| 마무리시작 | `si_start` | 날짜 색상 적용 |
| 출하 | `finishing_plan_end` | 날짜 색상 적용 |

> **자주검사 컬럼 제거**: DB에 해당 테이블/데이터 없음. OPS_API_REQUESTS #9, #10에서도 제외됨.
> 17컬럼 → 16컬럼

### 날짜 셀 색상 로직

```typescript
function getDateType(dateStr: string | null): DateType {
  if (!dateStr) return 'empty';
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d.toDateString() === today.toDateString()) return 'today-highlight';
  if (d < today) return 'past';
  return 'future';
}
```

### 필터 탭 → 월 선택기 + date_field 토글

- 기존 `FILTER_TABS` (`'오늘 공정', '이번주' ...`) → 월 선택 드롭다운 (`YYYY-MM`)
- date_field 토글: `가압시작(GST) / 기구시작(협력사)` 탭 2개

### 페이지네이션

- API가 `page`, `per_page`, `total`, `total_pages` 반환
- 하단에 페이지 네비게이션 추가 (이전/다음 + 페이지 번호)

---

## Task 5: 빌드 + 버전 업데이트

1. `npm run build` 에러 없음 확인
2. `version.ts` → 버전 bump (v1.7.0 — 신규 API 2개 연동)
3. `package.json` → version 동기화
4. `CHANGELOG.md` → v1.7.0 항목 추가
5. `PROGRESS.md` → v1.7.0 섹션 추가
6. `BACKLOG.md` → Sprint 이력 추가
7. `OPS_API_REQUESTS.md` → #9, #10 상태 DONE 업데이트

---

## 체크리스트

- [x] OPS Sprint 29 BE 완료 확인 (`/api/admin/factory/monthly-detail`, `/api/admin/factory/weekly-kpi`)
- [x] `api/factory.ts` 생성 (타입 + API 호출 함수)
- [x] `hooks/useFactory.ts` 생성 (TanStack Query 훅)
- [x] `FactoryDashboardPage.tsx` 샘플 → API 전환
  - [x] KPI 카드 4개 연동 (주간 생산량, 완료율, PI 대기, 출하)
  - [x] 모델별 bar 차트 연동
  - [x] 공정별 완료율 bar 추가
  - [x] 생산 현황 테이블 연동 (상위 5건)
  - [x] 파이프라인 원형 (PI/QI/SI/출하)
  - [x] 월간 모델별 호리즌 bar 연동
  - [x] PrepareBanner + 샘플 상수 전체 제거
- [x] `ProductionPlanPage.tsx` 샘플 → API 전환
  - [x] 월 선택기 + date_field 토글 (가압시작/기구시작) 추가
  - [x] 16컬럼 테이블 API 매핑 (자주검사 컬럼 제거)
  - [x] 날짜 셀 색상 로직 적용 (past=red, today=warning badge, future=green)
  - [x] 파이프라인 원형 API 연동 (weekly-kpi)
  - [x] 페이지네이션 추가 (이전/다음 + 페이지 번호)
  - [x] 검색 필터 (O/N, 모델, S/N)
  - [x] PrepareBanner + 샘플 상수 전체 제거
- [x] npm run build 에러 없음 (번들 1,076KB → 1,072KB 감소)
- [x] 화면 확인 후 버전 v1.7.0 + CHANGELOG + PROGRESS + BACKLOG 업데이트
- [x] OPS_API_REQUESTS.md #9, #10 → DONE
- [x] 공장 대시보드 피드백 반영: 자동 슬라이드, 활동 피드, 불량 KPI placeholder, 전장업체
- [x] 생산일정 피드백 반영: 통합 필터바, sorting, 공정 중복, 공정 카운트 chip
- [x] OPS_API_REQUESTS.md #16 — 불량 API(QMS) 요청 등록

---
---

# Sprint 4: 권한 체계 재정비 + 반응형 레이아웃

## 배경

AXIS-VIEW 사이드바 권한 테스트 결과 FE/BE 간 권한 불일치 발생.
GST 일반 직원(PI, QI)이 FE 페이지는 진입되지만 BE API에서 403 반환.
추가로 태블릿/모바일 환경에서의 접근성 개선 요구.

## 사전 조건

- ✅ Sprint 3 (공장 대시보드 + 생산일정 API 연동) 완료
- ✅ 권한 매트릭스 확정 (OPS_API_REQUESTS.md #11 참조)
- ✅ FE 1차 수정 완료 — ProtectedRoute 'gst' role 추가, Sidebar roles 세분화, App.tsx 라우트 권한 적용
- ⬜ OPS BE 데코레이터 변경 대기 (#11, #17)

---

## 확정 권한 매트릭스

| 메뉴 | admin | GST+manager (PM) | GST+일반 (PI,QI) | 협력사+manager |
|------|-------|-------------------|-------------------|----------------|
| 공장 대시보드 | ✅ | ✅ | ✅ | ✅ |
| 협력사 관리 | ✅ | ✅ | ❌ | ✅(자사) |
| 생산관리 | ✅ | ✅ | ✅ | ✅ |
| QR 관리 | ✅ | ✅ | ✅ | ✅ |
| 권한 관리 | ✅ | ✅(GST만) | ❌ | ✅(자사) |
| 불량 분석 | ✅ | ✅ | ✅ | ❌ |
| CT 분석 | ✅ | ✅ | ✅ | ❌ |
| AI 예측/챗봇 | ✅ | ✅ | ✅ | ❌ |

**VIEW 접근 게이트**: `is_admin` OR `company='GST'` OR `is_manager` — 이 외 사용자는 로그인 불가

---

## 실행 순서

### Step 1: tmux 세션 시작

```bash
tmux new -s axis-view-s4

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

### Step 4: Sprint 4 프롬프트 입력

---

## 🚀 Sprint 4 프롬프트 (복사해서 사용)

```
AXIS-VIEW Sprint 4: 권한 체계 재정비 + 반응형 레이아웃 개선

⚠️ 반드시 읽어야 할 파일:
- CLAUDE.md: ~/Desktop/GST/AXIS-VIEW/app/CLAUDE.md (프로젝트 컨텍스트)
- OPS_API_REQUESTS.md: ~/Desktop/GST/AXIS-VIEW/docs/OPS_API_REQUESTS.md (#11 권한 매트릭스 확인)
- 스프린트 가이드: ~/Desktop/GST/AXIS-VIEW/docs/sprints/DESIGN_FIX_SPRINT.md (Sprint 4 섹션)

## 팀 구성
1명의 teammate를 생성해줘. Sonnet 모델 사용:
1. **FE** (Frontend 담당) - 소유: src/**

## Phase A ~ Phase C를 순차 실행
```

---

## Phase A: 권한 체계 FE 검증 + BE 연동 준비 (가벼움)

> FE 1차 수정은 이미 완료됨. BE 데코레이터 반영 전 FE 쪽 정합성 확인 + 후속 작업.

### Task A-1: 권한 FE 현재 상태 확인

1. `ProtectedRoute.tsx` 확인 — `'gst'` role이 `company === 'GST'` 조건으로 동작하는지 검증
2. `App.tsx` 라우트별 `allowedRoles` 매트릭스 일치 확인
3. `Sidebar.tsx` navGroups roles 매트릭스 일치 확인

**확인 기준 (App.tsx 라우트 ↔ Sidebar roles 일치)**:

| 라우트 | allowedRoles |
|--------|-------------|
| `/factory` | `['admin', 'manager', 'gst']` |
| `/partner/*` | `['admin', 'manager']` |
| `/production/*` | `['admin', 'manager', 'gst']` |
| `/qr/*` | `['admin', 'manager', 'gst']` |
| `/admin/permissions` | `['admin', 'manager']` |
| `/defect` | `['admin', 'gst']` |
| `/ct` | `['admin', 'gst']` |

### Task A-2: 로그인 게이트 정합성

**파일**: `src/pages/LoginPage.tsx` 또는 `src/api/auth.ts`

현재 로그인 시 `!is_admin && !is_manager` → 차단 로직이 있다면 수정 필요:
- 변경: `!is_admin && !is_manager && company !== 'GST'` → 차단
- GST 일반 직원(PI, QI)도 is_admin=false, is_manager=false이지만 로그인 가능해야 함

### Task A-3: PermissionsPage 타이틀 버그 수정

**파일**: `src/pages/admin/PermissionsPage.tsx` L113

현재 Layout title이 `"QR 관리"`로 잘못 설정됨 → `"권한 관리"`로 수정

```tsx
// 현재
<Layout title="QR 관리">

// 수정
<Layout title="권한 관리">
```

### Task A-4: 공장 대시보드 preparing 뱃지 제거

**파일**: `Sidebar.tsx`

공장 대시보드는 API 연동 완료 상태(Sprint 3 완료)이므로 `preparing: true` 제거.
→ 현재 코드에서 이미 제거된 상태인지 확인.

---

## Phase B: 반응형 1단계 — 사이드바 접기 + 테이블 가로스크롤 (가벼움)

> 태블릿(768px~1024px) 환경에서 사용 가능하게 만드는 최소 작업

### Task B-1: 사이드바 접기/토글

**대상 파일**: `Layout.tsx`, `Sidebar.tsx`, `Header.tsx`

**변경 사항**:

1. `Layout.tsx`에 `sidebarCollapsed` state 추가
2. 사이드바 너비: 펼침 260px → 접힘 64px (아이콘만 표시)
3. 토글 버튼: 사이드바 하단 또는 헤더 좌측에 햄버거 아이콘
4. 접힌 상태에서:
   - 아이콘만 표시 (label 숨김)
   - hover 시 툴팁으로 label 표시
   - children 메뉴는 hover 시 팝오버로 표시
5. 메인 콘텐츠 `marginLeft` 연동
6. localStorage에 접힘 상태 저장 (새로고침 유지)

**CSS 변수 추가** (globals.css):
```css
:root {
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 64px;
}
```

**Layout.tsx 구조**:
```tsx
export default function Layout({ children, title, ... }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(() =>
    localStorage.getItem('sidebar_collapsed') === 'true'
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gx-cloud)', display: 'flex' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div style={{
        marginLeft: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        flex: 1,
        transition: 'margin-left 0.2s ease',
      }}>
        <Header title={title} ... />
        <main style={{ padding: '28px 32px', maxWidth: '1440px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Task B-2: 미디어 쿼리 자동 접기

```css
/* 1024px 이하에서 자동 접기 */
@media (max-width: 1024px) {
  :root {
    --sidebar-width: 64px;
  }
}

/* 768px 이하에서 완전 숨김 + 오버레이 */
@media (max-width: 768px) {
  :root {
    --sidebar-width: 0px;
  }
}
```

- 768px 이하: 사이드바 완전 숨김, 햄버거 메뉴로 오버레이 표시
- 1024px 이하: 자동 접힘 (아이콘 모드)
- 1024px 초과: 사용자 토글 기반

### Task B-3: 테이블 가로스크롤

**대상 페이지**: QrManagementPage, AttendancePage, ProductionPlanPage, PermissionsPage, ProductionPerformancePage

**패턴**:
```tsx
{/* 테이블 래퍼에 가로스크롤 추가 */}
<div style={{
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
  borderRadius: 'var(--radius-gx-lg)',
  border: '1px solid var(--gx-mist)',
  background: 'var(--gx-white)',
}}>
  <table style={{ minWidth: '800px', ... }}>
    ...
  </table>
</div>
```

- 각 테이블에 `minWidth` 설정 (컬럼 수에 따라 800px ~ 1200px)
- 스크롤바 스타일 적용 (기존 커스텀 스크롤바)

---

## Phase C: 반응형 2단계 — KPI 카드/차트 그리드 반응형 (보통)

> 태블릿에서 레이아웃이 자연스럽게 리플로우되도록 그리드 반응형 적용

### Task C-1: KPI 카드 그리드 반응형

**대상**: 모든 페이지의 KPI 카드 영역

**패턴**:
```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '12px',
}}>
  {/* KPI 카드들 */}
</div>
```

- `repeat(4, 1fr)` → `repeat(auto-fit, minmax(220px, 1fr))`
- 1440px: 4열, 1024px: 3열, 768px: 2열, 480px: 1열

**대상 페이지별**:

| 페이지 | 현재 그리드 | 변경 |
|--------|-----------|------|
| FactoryDashboardPage | 4열 고정 | auto-fit, minmax(220px, 1fr) |
| AttendancePage | 4열 고정 | 동일 |
| QrManagementPage | 4열 고정 | 동일 |
| PermissionsPage | 3열 고정 | auto-fit, minmax(200px, 1fr) |
| EtlChangeLogPage | 6열 고정 | auto-fit, minmax(160px, 1fr) |
| ProductionPerformancePage | 4열 고정 | auto-fit, minmax(220px, 1fr) |
| ShipmentHistoryPage | 4열 고정 | auto-fit, minmax(220px, 1fr) |

### Task C-2: 차트 영역 반응형

**대상**: FactoryDashboardPage의 차트 그리드

현재 2열 고정 → 반응형:
```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '16px',
}}>
  {/* 모델별 bar, 도넛 차트 등 */}
</div>
```

- 1440px: 2열, 1024px 이하: 1열 스택
- 차트 높이: 고정값 → `min-height + aspect-ratio` 또는 `vh` 기반

### Task C-3: 필터바 반응형

**대상**: 모든 페이지의 필터 바 (검색 + select + 버튼)

```tsx
<div style={{
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  alignItems: 'center',
}}>
  {/* 필터 요소들 */}
</div>
```

- `flexWrap: 'wrap'` 추가 — 좁은 화면에서 줄바꿈
- 검색 input `flex: 1, minWidth: '180px'` 설정
- select `minWidth: '120px'` 설정

### Task C-4: 메인 콘텐츠 패딩 반응형

**파일**: `Layout.tsx`

```tsx
<main style={{
  padding: 'clamp(16px, 3vw, 32px)',
  maxWidth: '1440px',
}}>
```

---

## Phase D: 반응형 3단계 — 모바일 네비게이션 + 터치 최적화 (무거움, 선택적)

> 스마트폰(~480px)까지 지원이 필요한 경우에만 진행. 태블릿 수준이면 Phase B~C로 충분.

### Task D-1: 하단 네비게이션 바 (모바일)

768px 이하에서 사이드바 대신 하단 탭 바 표시:

```tsx
{/* MobileNav.tsx (신규) */}
<nav style={{
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: '56px',
  background: 'var(--gx-white)',
  borderTop: '1px solid var(--gx-mist)',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  zIndex: 100,
}}>
  <NavTab icon={<FactoryIcon />} label="대시보드" to="/factory" />
  <NavTab icon={<CalendarIcon />} label="생산" to="/production/plan" />
  <NavTab icon={<QrIcon />} label="QR" to="/qr" />
  <NavTab icon={<UsersIcon />} label="협력사" to="/partner" />
  <NavTab icon={<MenuIcon />} label="더보기" onClick={openDrawer} />
</nav>
```

- 메인 5개 탭 + "더보기" 드로어
- 더보기: 권한관리, 불량분석, CT분석, AI 등 2차 메뉴
- 역할별 탭 표시 로직: Sidebar와 동일한 roles 필터 적용

### Task D-2: 터치 타겟 최적화

- 모든 클릭 타겟 최소 44x44px (WCAG 기준)
- 테이블 행 높이: 44px → 48px (모바일)
- 토글 버튼: 40x22px → 48x28px (모바일)
- 탭/칩 버튼: padding 최소 10px 12px

### Task D-3: 메인 콘텐츠 하단 여백

하단 네비게이션 바가 콘텐츠를 가리지 않도록:

```css
@media (max-width: 768px) {
  main {
    padding-bottom: 72px; /* 56px nav + 16px 여백 */
  }
}
```

---

## 빌드 + 검증

### Task E-1: 빌드 확인

1. `npm run build` 에러 없음 확인
2. `version.ts` → 버전 bump

### Task E-2: 권한 테스트 시나리오

| # | 사용자 | 기대 결과 |
|---|--------|----------|
| 1 | admin (is_admin) | 전체 메뉴 표시, 전체 데이터 접근 |
| 2 | GST+manager (PM, is_manager) | 전체 메뉴 표시, 권한관리 GST만 표시 |
| 3 | GST+일반 (PI, !is_manager) | 공장/생산/QR/불량/CT/AI 표시, 협력사/권한 숨김 |
| 4 | 협력사+manager (is_manager) | 협력사(자사)/생산/QR/권한(자사) 표시, 공장/불량/CT/AI 숨김 |
| 5 | 협력사+일반 (!is_manager) | 로그인 차단 (VIEW 접근 불가) |

### Task E-3: 반응형 테스트

| 해상도 | 사이드바 | KPI 그리드 | 테이블 |
|--------|---------|-----------|--------|
| 1440px (데스크톱) | 펼침 260px | 4열 | 전체 표시 |
| 1024px (태블릿 가로) | 접힘 64px (자동) | 3열 | 가로스크롤 |
| 768px (태블릿 세로) | 숨김 + 오버레이 | 2열 | 가로스크롤 |
| 480px (모바일, Phase D) | 하단 네비게이션 | 1열 | 가로스크롤 |

---

## 체크리스트

### Phase A — 권한 (필수)
- [ ] ProtectedRoute 'gst' role 동작 확인
- [ ] App.tsx 라우트 allowedRoles 매트릭스 일치
- [ ] Sidebar navGroups roles 매트릭스 일치
- [ ] 로그인 게이트 GST 일반 직원 허용 확인
- [ ] PermissionsPage Layout title "권한 관리" 수정
- [ ] 공장 대시보드 preparing 뱃지 제거 확인

### Phase B — 반응형 1단계 (필수)
- [ ] 사이드바 접기/펼치기 토글
- [ ] 접힌 상태 아이콘 + 툴팁
- [ ] localStorage 접힘 상태 저장
- [ ] 미디어 쿼리 자동 접기 (1024px/768px)
- [ ] 오버레이 사이드바 (768px 이하)
- [ ] 테이블 가로스크롤 (5개 페이지)

### Phase C — 반응형 2단계 (권장)
- [ ] KPI 카드 auto-fit 그리드 (7개 페이지)
- [ ] 차트 그리드 반응형 (공장 대시보드)
- [ ] 필터바 flexWrap
- [ ] 메인 패딩 clamp

### Phase D — 반응형 3단계 (선택적)
- [ ] MobileNav 컴포넌트 신규
- [ ] 하단 탭 바 역할 필터링
- [ ] 터치 타겟 44px
- [ ] 하단 여백 처리

### 빌드/검증
- [ ] npm run build 에러 없음
- [ ] 권한 테스트 5개 시나리오 통과
- [ ] 반응형 4개 해상도 확인
- [ ] 버전 bump + CHANGELOG

---

# Sprint 5: 다모델 QR 대시보드 — DUAL L/R Tank QR 표시 ✅ FE 완료 (검증 대기)

> **의존성**: AXIS-OPS Sprint 31A (다모델 지원) 완료 후 진행
> **범위**: FE — QR 대시보드 페이지, 공수 현황 페이지
> **BE 변경**: qr_registry에 qr_type, parent_qr_doc_id 컬럼 추가됨 (Sprint 31A)

## 배경

Sprint 31A에서 DUAL 모델(GAIA-I DUAL, iVAS 등)의 Tank QR이 L/R로 분리되었음.
- 제품 QR: `DOC_{SN}` — 캐비넷 본체에 부착, MECH/ELEC/PI/QI/SI 전 공정 입력 장치
- Tank QR: `DOC_{SN}-L`, `DOC_{SN}-R` — 캐비넷 안에 들어가는 탱크 모듈에 부착, TMS 작업용

qr_registry 스키마 변경:
```
qr_type: 'PRODUCT' (기본) | 'TANK' (L/R 탱크)
parent_qr_doc_id: TANK QR인 경우 상위 PRODUCT QR의 qr_doc_id 참조
```

model_config에서 DUAL 여부가 결정되고, ETL(step2_load.py)에서 TANK QR이 자동 생성됨.
View에서는 model_config를 직접 참조할 필요 없이, qr_registry 데이터만 그대로 표시하면 됨.

## 물리적 흐름 이해

```
TMS 라인                    캐비넷 라인
──────────                  ──────────────────────────────────
[Tank-L 제작] ──┐
  (DOC_{SN}-L)  ├──→ [도킹] → PI → QI → SI → 출하
[Tank-R 제작] ──┘      ↑
  (DOC_{SN}-R)     MECH → ELEC
                   (DOC_{SN})
```

공수 = SN-L(TMS) + SN-R(TMS) + SN(MECH+ELEC+PI+QI+SI)

---

## Task 1: QR 대시보드 — 모듈시작 필터 수정

### 현재 동작
모듈시작 필터 선택 시 해당 serial_number의 모든 QR이 표시됨.
DUAL 제품의 경우 PRODUCT QR + TANK L + TANK R = 3건이 보여서 불필요한 항목이 포함됨.

### 수정 목표
- **기구시작 필터**: PRODUCT QR만 표시 (기존과 동일, 변경 없음)
- **모듈시작 필터**: DUAL이면 TANK QR만 표시, SINGLE이면 PRODUCT QR 표시

### API 쿼리 수정 (BE 또는 FE에서 처리)

```sql
-- 모듈시작 화면: TANK QR이 있으면 TANK만, 없으면 PRODUCT
SELECT qr.qr_doc_id, qr.serial_number, qr.qr_type,
       qr.parent_qr_doc_id, qr.status,
       pi.model, pi.module_start, pi.mech_partner
FROM qr_registry qr
JOIN plan.product_info pi ON qr.serial_number = pi.serial_number
WHERE pi.module_start IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM qr_registry t
    WHERE t.serial_number = qr.serial_number
      AND t.qr_type = 'TANK'
      AND qr.qr_type = 'PRODUCT'
  )
ORDER BY pi.module_start;
```

결과:
| 모델 | 표시되는 QR |
|---|---|
| GAIA-I (SINGLE) | DOC_12345 (PRODUCT) |
| GAIA-I DUAL | DOC_12345-L, DOC_12345-R (TANK만) |
| iVAS | DOC_67890-L, DOC_67890-R (TANK만) |

### FE 수정 포인트
- QR 대시보드 테이블에 `qr_type` 컬럼 표시 (PRODUCT / TANK 뱃지)
- TANK QR 행에 "(L)" "(R)" 접미사 시각적 표시
- 기존 기구시작 필터는 변경 불필요 (TANK QR은 mech_start 없으므로 자연 필터링)

---

## Task 2: QR 테이블 UI 개선

### TANK QR 시각 표시
```jsx
// QR 타입 뱃지
{qr.qr_type === 'TANK' && (
  <Badge variant="info" size="sm">
    {qr.qr_doc_id.endsWith('-L') ? 'Tank-L' : 'Tank-R'}
  </Badge>
)}
{qr.qr_type === 'PRODUCT' && (
  <Badge variant="default" size="sm">제품</Badge>
)}
```

### DUAL 제품 그룹핑 (선택적)
DUAL 제품의 경우 serial_number 기준으로 L/R을 한 행으로 묶어서 표시할 수도 있음:
```
SN: ABC-12345  |  모델: GAIA-I DUAL  |  Tank-L: ✅ 완료  |  Tank-R: ⏳ 진행중
```

---

## SWS JP 라인 PI 예외 참고

SWS 모델은 기본적으로 PI_CHAMBER만 진행 (model_config: pi_lng_util=FALSE, pi_chamber=TRUE).
단, product_info.line='JP'인 경우 task_seed.py에서 런타임에 pi_lng_util=TRUE로 오버라이드.
View에서는 app_task_details.is_applicable 값을 그대로 표시하면 되고, 별도 분기 불필요.

---

## 체크리스트

### Task 1 — 모듈시작 필터
- [x] API 쿼리에 qr_type 기반 필터링 적용 (DUAL → TANK만, SINGLE → PRODUCT) — BE Sprint 31A 완료
- [x] 기구시작 필터: TANK QR 숨김 (PRODUCT만 표시) — FE `resolveQrType` 필터링
- [x] 모듈시작 필터: 같은 S/N끼리 그룹핑 정렬 (serial_number → qr_doc_id 순)

### Task 2 — QR 테이블 UI
- [x] qr_type 뱃지 (제품 / Tank-L / Tank-R) 표시 — `QrTypeBadge` 컴포넌트 추가
- [x] QrRecord 타입에 `qr_type`, `parent_qr_doc_id` 필드 추가
- [x] QR Doc ID 접미사(-L/-R) 기반 자동 판별 — BE `qr_type` 미제공 시에도 동작
- [x] KPI 카드 stats: BE에서 PRODUCT 기준 카운트 (OPS BE 수정 완료)

### 검증
- [ ] GAIA-I DUAL 제품: 모듈시작에서 TANK L/R만 표시 — ETL 배포 후 검증
- [ ] GAIA-I SINGLE 제품: 모듈시작에서 PRODUCT QR 표시, 기존 동작 유지
- [ ] iVAS 제품: always_dual — TANK L/R 표시 확인
- [ ] DRAGON 제품: TANK QR 없음, TMS 없음 — 모듈시작에 미표시 확인
- [ ] SWS 제품: TANK QR 없음 (tank_in_mech), 모듈시작에 미표시 확인
- [x] npm run build 에러 없음

---

# Backlog: 다모델 QR 확장 (Sprint 5에서 분리)

> Sprint 5 Task 1/2 완료 후 필요 시 진행. 신규 페이지 + 신규 API 필요.

## 공수 현황 페이지 — L + R + 본체 합산

**범위**: 신규 페이지 개발 + OPS BE API 신규 필요

### 공수 계산 구조
```
총 공수 = TMS(L) + TMS(R) + MECH + ELEC + PI + QI + SI
```

serial_number 기준 GROUP BY로 모든 qr_doc_id의 작업시간이 합산됨.

### API 쿼리 예시
```sql
SELECT
  t.serial_number,
  pi.model,
  t.task_category,
  SUM(t.duration_minutes) AS total_duration,
  COUNT(CASE WHEN t.completed_at IS NOT NULL THEN 1 END) AS completed_count,
  COUNT(*) AS total_count
FROM app_task_details t
JOIN plan.product_info pi ON t.serial_number = pi.serial_number
WHERE t.is_applicable = TRUE
GROUP BY t.serial_number, pi.model, t.task_category
ORDER BY t.serial_number, t.task_category;
```

### FE 표시 (공수 현황 테이블)
| S/N | 모델 | MECH | ELEC | TMS(L) | TMS(R) | PI | QI | SI | 합계 |
|---|---|---|---|---|---|---|---|---|---|
| ABC-123 | GAIA-I DUAL | 120m | 80m | 45m | 45m | 30m | 20m | 15m | 355m |
| DEF-456 | GAIA-I | 120m | 80m | 90m | - | 30m | 20m | 15m | 355m |

DUAL 모델: TMS가 L/R로 분리 표시
SINGLE 모델: TMS 하나로 표시

### TMS L/R 구분 쿼리
```sql
SELECT
  t.serial_number,
  CASE
    WHEN t.qr_doc_id LIKE '%-L' THEN 'TMS(L)'
    WHEN t.qr_doc_id LIKE '%-R' THEN 'TMS(R)'
    ELSE 'TMS'
  END AS tms_label,
  SUM(t.duration_minutes) AS duration
FROM app_task_details t
WHERE t.task_category = 'TMS'
  AND t.is_applicable = TRUE
GROUP BY t.serial_number, tms_label;
```

### 체크리스트
- [ ] OPS BE 공수 조회 API 개발
- [ ] serial_number 기준 전체 공수 합산 표시
- [ ] DUAL 모델 TMS L/R 분리 컬럼 표시
- [ ] SINGLE 모델 TMS 단일 컬럼 표시

---

## 제품 상세 페이지 — Tank QR 연관 표시

**범위**: 신규 페이지 개발 (QR 행 클릭 → 상세)

### API 호출
```
GET /api/app/qr?serial_number={sn}
```

### FE 표시
```
제품 정보
  S/N: ABC-12345
  모델: GAIA-I DUAL
  제품 QR: DOC_ABC-12345

연관 Tank QR
  ┌─────────────────────┬──────────┬───────────┐
  │ QR                  │ 타입     │ TMS 진행률 │
  ├─────────────────────┼──────────┼───────────┤
  │ DOC_ABC-12345-L     │ Tank-L   │ 2/2 완료  │
  │ DOC_ABC-12345-R     │ Tank-R   │ 1/2 진행  │
  └─────────────────────┴──────────┴───────────┘
```

### 체크리스트
- [ ] OPS BE 상세 조회 API 확인/개발
- [ ] 연관 TANK QR 목록 표시
- [ ] TANK QR별 TMS 진행률 표시

---

# Sprint 6: 태스크 레벨 진행률 — 공장 대시보드 OPS 앱 동기화 ✅ FE 완료

> **목적**: 공장 대시보드(VIEW)에서 OPS 앱과 동일한 태스크 단위 진행률 표시
> **범위**: FE — 생산 현황 상세 페이지 (monthly-detail)
> **BE 변경**: ✅ factory.py `task_progress` 필드 추가 완료 (Cowork에서 수정됨)

## 배경

현재 공장 대시보드는 **공정 단위**(MECH/ELEC/TMS/PI/QI/SI boolean)로 진행률을 표시.
OPS 앱은 **태스크 단위**(완료 태스크 수 / 전체 태스크 수)로 표시.

```
동일 제품 (MECH 3/7 완료, TMS 4/4 완료):

현재 VIEW:  전체 0%, MECH 0%, TMS 0%     ← 공정 전체 완료가 아니라 0%
OPS 앱:    전체 33%, MECH 50%, TMS 100%  ← 태스크별 비율
```

## BE 수정 (✅ 완료)

`backend/app/routes/factory.py`에 `_get_task_progress_by_serial()` 함수 추가.
`GET /api/admin/factory/monthly-detail` 응답에 `task_progress` 필드 추가됨.

### API 응답 변경 (기존 필드 유지 + 신규 추가)

```json
{
  "serial_number": "GBWS-6899",
  "model": "GAIA-I DUAL",
  "completion": {
    "mech": false, "elec": false, "tm": false,
    "pi": false, "qi": false, "si": false
  },
  "progress_pct": 0.0,
  "task_progress": {
    "total": 20,
    "completed": 7,
    "progress_pct": 35.0,
    "by_category": {
      "MECH": {"total": 7, "completed": 3, "pct": 42.9},
      "ELEC": {"total": 6, "completed": 0, "pct": 0.0},
      "TMS":  {"total": 4, "completed": 4, "pct": 100.0},
      "PI":   {"total": 2, "completed": 0, "pct": 0.0},
      "QI":   {"total": 1, "completed": 0, "pct": 0.0},
      "SI":   {"total": 2, "completed": 0, "pct": 0.0}
    }
  }
}
```

하위 호환: 기존 `progress_pct` (공정 단위)와 `completion` (boolean) 필드는 그대로 유지.
신규 `task_progress` 필드를 사용하면 OPS 앱과 동일한 태스크 레벨 진행률 표시 가능.

## FE 수정 (Teammate 작업)

> CLAUDE.md를 먼저 읽고 현재 프로젝트 구조를 파악할 것.

### Task 1: 생산 현황 상세 — 진행률 바 태스크 레벨로 변경

현재 monthly-detail 페이지에서 `progress_pct` (공정 단위)로 프로그레스바를 표시하고 있음.
이를 `task_progress.progress_pct` (태스크 단위)로 변경.

```
현재:  전체 진행률 = completion boolean 카운트 / 공정 수
변경:  전체 진행률 = task_progress.completed / task_progress.total
```

### Task 2: 카테고리별 진행률 바 추가

각 제품 카드/행에서 카테고리별 태스크 진행률을 표시.
**⚠️ VIEW에서는 협력사 공정(MECH, ELEC, TMS)만 표시. PI/QI/SI는 사내공정이라 VIEW에서 미표시.**

표시 대상 카테고리 (설정 기반 — 추후 확장 가능):
```javascript
// 기본값: 협력사 공정만
const DEFAULT_VIEW_CATEGORIES = ['MECH', 'ELEC', 'TMS'];

// 설정에서 오버라이드 가능 (admin_settings 또는 localStorage)
const viewCategories = settings.dashboardCategories || DEFAULT_VIEW_CATEGORIES;
```

나중에 PI/QI/SI도 보고 싶으면 설정에서 추가하면 됨 (코드 수정 불필요).

```
GBWS-6899 | GAIA-I DUAL | 전체: 35%
  MECH  ████████░░░░░░  42.9%  (3/7)
  ELEC  ░░░░░░░░░░░░░░   0.0%  (0/6)
  TMS   ██████████████ 100.0%  (4/4)
```

전체 진행률(`task_progress.progress_pct`)은 BE에서 전체(PI/QI/SI 포함) 기준으로 계산되므로,
VIEW용 전체 진행률은 FE에서 MECH+ELEC+TMS만으로 재계산:
```javascript
const viewCategories = ['MECH', 'ELEC', 'TMS'];
const viewTotal = viewCategories.reduce((sum, cat) => sum + (byCategory[cat]?.total || 0), 0);
const viewCompleted = viewCategories.reduce((sum, cat) => sum + (byCategory[cat]?.completed || 0), 0);
const viewPct = viewTotal > 0 ? Math.round(viewCompleted / viewTotal * 1000) / 10 : 0;
```

`task_progress.by_category`에서 VIEW_CATEGORIES에 해당하는 것만 렌더링.
카테고리가 없으면 해당 모델에 적용 안 되는 공정 (예: DRAGON의 TMS → 미표시).

### Task 3: KPI 카드 — 전체 완료율도 태스크 기반으로 변경

주간 KPI의 `completion_rate`도 태스크 기반으로 변경할 수 있으나,
이건 별도 API 수정이 필요하므로 **Phase 2에서 진행** (선택적).

현재는 monthly-detail의 개별 제품 진행률만 변경.

## 체크리스트

**BE (✅ 완료)**:
- [x] factory.py — `_get_task_progress_by_serial()` 함수 추가
- [x] monthly-detail 응답에 `task_progress` 필드 추가 (하위 호환)

**FE (완료)**:
- [x] monthly-detail 페이지: 전체 진행률을 MECH+ELEC+TMS 태스크 기준으로 재계산
- [x] 카테고리별 미니 프로그레스바 표시 (MECH/ELEC/TMS — 색상 구분)
- [x] 완료 수 / 전체 수 텍스트 표시 (예: "3/7")
- [x] 카테고리 미존재 시 해당 바 미표시 (모델별 자동 대응)
- [x] 기존 `completion` boolean 뱃지는 유지 (상태 컬럼)
- [x] `task_progress` 없을 시 기존 `progress_pct` fallback
- [x] `TaskProgress`, `CategoryProgress` 타입 추가 (`api/factory.ts`)
- [x] npm run build 에러 없음

**검증 (배포 후)**:
- [ ] GAIA-I DUAL: MECH/ELEC/TMS 전부 표시 확인
- [ ] DRAGON: TMS 미표시 확인
- [ ] 기존 데이터 없는 제품: task_progress 빈 객체 처리 (에러 안 나게)

---

# Sprint 7: 사용자 분석 대시보드 — Access Log 시각화 ✅ 완료

> **목적**: 사용자 접속 빈도, 사용 시간, 기능 사용 패턴, 에러율을 대시보드로 시각화
> **의존성**: AXIS-OPS Sprint 32 (app_access_log 테이블 + analytics API) 완료 후 진행
> **범위**: FE — 신규 페이지 + 차트 컴포넌트

## 배경

AXIS-OPS Sprint 32에서 모든 인증 API 호출을 `app_access_log` 테이블에 기록.
VIEW에서 이 데이터를 시각화하여 관리자가 사용자 행동 패턴을 파악할 수 있도록 함.

## BE API (AXIS-OPS Sprint 32에서 구현)

```
GET /api/admin/analytics/summary?period=7d      → 기간별 요약 (접속자, 요청수, 에러율)
GET /api/admin/analytics/by-worker?period=30d   → 사용자별 상세 (접속횟수, 사용시간, 주요 기능)
GET /api/admin/analytics/by-endpoint?period=7d  → 기능별 상세 (호출수, 평균 응답시간, 에러율)
GET /api/admin/analytics/hourly?date=2026-03-18 → 시간대별 트래픽 (24시간 분포)
```

## FE 구현

### Task 1: 사이드바 메뉴 추가

사이드바에 "사용자 분석" 메뉴 추가 (admin + view_access 권한):
```
📊 공장 대시보드
📋 생산일정
📈 사용자 분석     ← 신규
⚙️ 설정
```

### Task 2: 요약 KPI 카드 (상단)

`GET /api/admin/analytics/summary?period=7d` 데이터로 KPI 카드 4개:

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  접속자 수   │  총 요청 수  │  평균 응답   │  에러율      │
│     25명     │   3,420건   │   145ms     │   2.3%      │
│  ▲ +3 vs 전주│             │             │  ▼ -0.5%    │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Task 3: 일별 접속 추이 차트

`summary.daily` 데이터로 라인/바 차트:
- X축: 날짜 (최근 7일 / 30일 토글)
- Y축 좌: 접속자 수 (바)
- Y축 우: 요청 수 (라인)
- 라이브러리: recharts 또는 기존 사용 중인 차트 라이브러리

### Task 4: 사용자별 테이블

`GET /api/admin/analytics/by-worker?period=30d` 데이터:

```
┌──────┬──────────────┬────────┬────────┬──────────┬──────────────────┐
│ 순위 │ 이름/이메일   │ 역할   │ 접속수  │ 사용시간  │ 주요 사용 기능    │
├──────┼──────────────┼────────┼────────┼──────────┼──────────────────┤
│  1   │ 김작업       │ worker │ 156회  │ 9시간43분│ 작업시작, QR스캔  │
│  2   │ 박관리       │ admin  │ 89회   │ 5시간12분│ QR목록, 설정     │
│  3   │ 이검사       │ worker │ 67회   │ 4시간30분│ 작업완료, QR스캔  │
└──────┴──────────────┴────────┴────────┴──────────┴──────────────────┘
```

정렬: 접속수 / 사용시간 기준 토글 가능
기간: 7일 / 30일 드롭다운

### Task 5: 기능별 사용량 차트

`GET /api/admin/analytics/by-endpoint?period=7d` 데이터:

수평 바 차트:
```
작업 시작 (POST /work/start)    ████████████████  890회
QR 제품 조회 (GET /product)     ████████████      650회
작업 완료 (POST /work/complete) ████████          420회
태스크 목록 (GET /tasks)        ██████            310회
로그인 (POST /auth/login)       ████              210회
```

엔드포인트를 사용자 친화적 이름으로 매핑:
```javascript
const ENDPOINT_LABELS = {
    'work.start_work': '작업 시작',
    'work.complete_work': '작업 완료',
    'product.get_product_by_qr': 'QR 제품 조회',
    'work.get_tasks_by_serial': '태스크 목록',
    'auth.login': '로그인',
    'qr.get_qr_list': 'QR 목록',
    'hr.check_attendance': '출퇴근',
    // ...
};
```

### Task 6: 시간대별 트래픽 히트맵 (선택적)

`GET /api/admin/analytics/hourly?date=2026-03-18` 데이터:

24시간 바 차트로 피크 타임 확인:
```
   06  07  08  09  10  11  12  13  14  15  16  17  18
   ▁   ▃   █   ██  ██  █   ▃   █   ██  ██  █   ▃   ▁
```

### Task 7: 기간 필터 + 자동 갱신

- 기간 선택: 오늘 / 7일 / 30일 (커스텀은 추후)
- 자동 갱신: staleTime=2분 (TanStack Query)
- 날짜 범위 피커: 추후 필요 시 추가

## 체크리스트

**사전 조건**:
- [x] AXIS-OPS Sprint 32 완료 (app_access_log 테이블 + analytics API 4개)

**FE (완료)**:
- [x] 사이드바 "사용자 분석" 메뉴 추가 — Analysis 그룹, admin 전용
- [x] KPI 카드 4개 (접속자, 요청수, 응답시간, 에러율)
- [x] 일별 접속 추이 차트 (바+라인) — ComposedChart
- [x] 사용자별 테이블 (정렬, 기간 필터) — ADMIN 제외, name/company 표시
- [x] 기능별 사용량 수평 바 차트 — BE label 한글 매핑
- [x] 시간대별 트래픽 차트 — BarChart
- [x] 기간 필터 (오늘/7일/30일)
- [x] 엔드포인트 → BE label 우선 + FE fallback 매핑
- [x] 빈 데이터 / 로딩 / 에러 상태 처리
- [x] npm run build 에러 없음

---

# Sprint 8: 생산실적 API 연동 — Mock → 실시간 데이터 전환 ✅ FE 완료

> **목적**: ProductionPerformancePage의 100% Mock 데이터를 OPS Sprint 33 API로 교체하고, 실적확인/취소 버튼 액션을 실제 API 호출로 연결
> **의존성**: AXIS-OPS Sprint 33 (생산실적 API 4개) 완료 후 진행
> **범위**: FE — API 모듈 신규 + TanStack Query 훅 신규 + 기존 페이지 Mock→API 전환

## 배경

`ProductionPerformancePage.tsx`는 현재 상단에 `PrepareBanner` ("API 연동 준비 중 · 아래 데이터는 샘플입니다")를 표시하며, 6개 O/N 그룹(`SAMPLE_ORDERS`), 주차 상수(`WEEKS`), 월마감 샘플(`MONTHLY_SUMMARY`)이 모두 하드코딩된 Mock 상태.

OPS Sprint 33이 완료되면 아래 4개 엔드포인트가 사용 가능:

```
GET  /api/admin/production/performance      → O/N 단위 주간 실적 + 실적확인 이력
POST /api/admin/production/confirm           → 실적확인 처리
DELETE /api/admin/production/confirm/:id     → 실적확인 취소 (admin only)
GET  /api/admin/production/monthly-summary   → 월마감 주차별 집계
```

## BE API 응답 스키마 (OPS Sprint 33, OPS_API_REQUESTS #23~#26 참조)

### #23 GET /performance 응답 핵심 필드

```typescript
{
  week: string;          // "W12"
  month: string;         // "2026-03"
  orders: Array<{
    sales_order: string;
    model: string;
    sns: Array<{
      serial_number: string;
      mech_partner: string;
      elec_partner: string;
      progress: {
        MECH: { total: number; done: number; pct: number };
        ELEC: { total: number; done: number; pct: number };
        TM:   { total: number; done: number; pct: number; tank_module_done?: boolean };
      };
      checklist: {
        MECH: { completed: boolean; completed_at: string | null };
        ELEC: { completed: boolean; completed_at: string | null };
      };
    }>;
    sn_count: number;
    sn_summary: string;               // "GBWS-6627~6629"
    partner_info: { mech: string; elec: string; mixed: boolean };
    process_status: {
      MECH: { ready: number; total: number; checklist_ready: number; confirmable: boolean };
      ELEC: { ready: number; total: number; checklist_ready: number; confirmable: boolean };
      TM:   { ready: number; total: number; confirmable: boolean };
    };
    confirms: Array<{
      id: number;
      process_type: string;
      confirmed_week: string;
      confirmed_by: string;
      confirmed_at: string;
    }>;
  }>;
  summary: {
    total_orders: number;
    mech_confirmable: number;
    elec_confirmable: number;
    tm_confirmable: number;
  };
}
```

### #24 POST /confirm 요청/응답

```typescript
// Request
{ sales_order: string; process_type: "MECH"|"ELEC"|"TM"; confirmed_week: string; confirmed_month: string }
// Response (성공)
{ success: true; confirm_id: number; sales_order: string; process_type: string; confirmed_week: string; sn_count: number; confirmed_at: string }
// Response (실패)
{ error: "NOT_CONFIRMABLE"; message: string; details: Array<{ serial_number: string; reason: string }> }
```

### #25 DELETE /confirm/:id — 응답

```typescript
{ success: true; deleted_id: number; sales_order: string; process_type: string; confirmed_week: string }
```

### #26 GET /monthly-summary 응답

```typescript
{
  month: string;
  weeks: Array<{
    week: string;
    mech: { completed: number; confirmed: number };
    elec: { completed: number; confirmed: number };
    tm:   { completed: number; confirmed: number };
  }>;
  totals: {
    mech: { completed: number; confirmed: number };
    elec: { completed: number; confirmed: number };
    tm:   { completed: number; confirmed: number };
  };
}
```

## FE 구현

> CLAUDE.md를 먼저 읽고 현재 프로젝트 구조를 파악할 것.

### Task 1: TypeScript 타입 정의 (`src/types/production.ts` 신규)

API 응답 스키마에 맞는 타입 정의. 기존 페이지의 Mock 타입(`OrderGroup`, `SnDetail`, `ProcessConfirm`, `ConfirmStatus`)을 API 응답 구조로 대체.

```typescript
// ─── 공정 진행률 ───
export interface ProcessProgress {
  total: number;
  done: number;
  pct: number;
  tank_module_done?: boolean;       // TM only
  pressure_test_done?: boolean;     // TM only
}

export interface SNProgress {
  MECH: ProcessProgress;
  ELEC: ProcessProgress;
  TM: ProcessProgress;
}

// ─── S/N 체크리스트 ───
export interface ChecklistStatus {
  completed: boolean;
  completed_at: string | null;
}

export interface SNChecklist {
  MECH: ChecklistStatus;
  ELEC: ChecklistStatus;
}

// ─── S/N 상세 ───
export interface SNDetail {
  serial_number: string;
  mech_partner: string;
  elec_partner: string;
  progress: SNProgress;
  checklist: SNChecklist;
}

// ─── 공정별 확인 가능 상태 ───
export interface ProcessStatus {
  ready: number;
  total: number;
  checklist_ready?: number;
  confirmable: boolean;
}

// ─── 실적확인 이력 ───
export interface ConfirmRecord {
  id: number;
  process_type: 'MECH' | 'ELEC' | 'TM';
  confirmed_week: string;
  confirmed_by: string;
  confirmed_at: string;
}

// ─── O/N 그룹 ───
export interface OrderGroup {
  sales_order: string;
  model: string;
  sns: SNDetail[];
  sn_count: number;
  sn_summary: string;
  partner_info: { mech: string; elec: string; mixed: boolean };
  process_status: {
    MECH: ProcessStatus;
    ELEC: ProcessStatus;
    TM: ProcessStatus;
  };
  confirms: ConfirmRecord[];
}

// ─── GET /performance 응답 ───
export interface PerformanceResponse {
  week: string;
  month: string;
  orders: OrderGroup[];
  summary: {
    total_orders: number;
    mech_confirmable: number;
    elec_confirmable: number;
    tm_confirmable: number;
  };
}

// ─── POST /confirm 요청 ───
export interface ConfirmRequest {
  sales_order: string;
  process_type: 'MECH' | 'ELEC' | 'TM';
  confirmed_week: string;
  confirmed_month: string;
}

// ─── POST /confirm 응답 ───
export interface ConfirmResponse {
  success: boolean;
  confirm_id: number;
  sales_order: string;
  process_type: string;
  confirmed_week: string;
  sn_count: number;
  confirmed_at: string;
}

// ─── DELETE /confirm/:id 응답 ───
export interface CancelConfirmResponse {
  success: boolean;
  deleted_id: number;
  sales_order: string;
  process_type: string;
  confirmed_week: string;
}

// ─── GET /monthly-summary 응답 ───
export interface ProcessSummary {
  completed: number;
  confirmed: number;
}

export interface WeekSummary {
  week: string;
  mech: ProcessSummary;
  elec: ProcessSummary;
  tm: ProcessSummary;
}

export interface MonthlySummaryResponse {
  month: string;
  weeks: WeekSummary[];
  totals: {
    mech: ProcessSummary;
    elec: ProcessSummary;
    tm: ProcessSummary;
  };
}
```

### Task 2: API 모듈 (`src/api/production.ts` 신규)

기존 패턴 참조: `src/api/attendance.ts` (Mock 토글 + apiClient 사용)

```typescript
import apiClient from './client';
import type {
  PerformanceResponse, ConfirmRequest, ConfirmResponse,
  CancelConfirmResponse, MonthlySummaryResponse,
} from '@/types/production';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * 주간 생산실적 조회 (O/N 단위)
 */
export async function getPerformance(
  week?: string,
  month?: string,
): Promise<PerformanceResponse> {
  if (USE_MOCK) {
    const { getMockPerformance } = await import('@/mocks/production');
    return getMockPerformance(week);
  }
  const params = new URLSearchParams();
  if (week) params.set('week', week);
  if (month) params.set('month', month);
  const res = await apiClient.get<PerformanceResponse>(
    `/api/admin/production/performance?${params}`,
  );
  return res.data;
}

/**
 * 실적확인 처리
 */
export async function confirmProduction(body: ConfirmRequest): Promise<ConfirmResponse> {
  const res = await apiClient.post<ConfirmResponse>(
    '/api/admin/production/confirm',
    body,
  );
  return res.data;
}

/**
 * 실적확인 취소 (admin only)
 */
export async function cancelConfirm(confirmId: number): Promise<CancelConfirmResponse> {
  const res = await apiClient.delete<CancelConfirmResponse>(
    `/api/admin/production/confirm/${confirmId}`,
  );
  return res.data;
}

/**
 * 월마감 집계 조회
 */
export async function getMonthlySummary(
  month?: string,
): Promise<MonthlySummaryResponse> {
  if (USE_MOCK) {
    const { getMockMonthlySummary } = await import('@/mocks/production');
    return getMockMonthlySummary(month);
  }
  const params = month ? `?month=${month}` : '';
  const res = await apiClient.get<MonthlySummaryResponse>(
    `/api/admin/production/monthly-summary${params}`,
  );
  return res.data;
}
```

> ⚠ Mock fallback은 기존 `SAMPLE_ORDERS`, `MONTHLY_SUMMARY`를 `src/mocks/production.ts`로 이동하면 됨 (선택적). API 우선 연결이 목표이므로, VITE_USE_MOCK=false 상태에서 작업할 것.

### Task 3: TanStack Query 훅 (`src/hooks/useProduction.ts` 신규)

기존 패턴 참조: `src/hooks/useAttendance.ts` (useSettings 연동 + refetchInterval)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPerformance, confirmProduction, cancelConfirm, getMonthlySummary,
} from '@/api/production';
import type { ConfirmRequest } from '@/types/production';

/**
 * 주간 생산실적 조회
 */
export function usePerformance(week?: string, month?: string) {
  return useQuery({
    queryKey: ['production', 'performance', week, month],
    queryFn: () => getPerformance(week, month),
    staleTime: 60 * 1000,          // 1분
    refetchInterval: 5 * 60 * 1000, // 5분
  });
}

/**
 * 실적확인 처리 (mutation)
 * 성공 시 performance 쿼리 invalidate → 자동 리페치
 */
export function useConfirmProduction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ConfirmRequest) => confirmProduction(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production'] });
    },
  });
}

/**
 * 실적확인 취소 (mutation)
 * 성공 시 performance + monthly-summary 쿼리 invalidate
 */
export function useCancelConfirm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (confirmId: number) => cancelConfirm(confirmId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production'] });
    },
  });
}

/**
 * 월마감 집계 조회
 */
export function useMonthlySummary(month?: string) {
  return useQuery({
    queryKey: ['production', 'monthly-summary', month],
    queryFn: () => getMonthlySummary(month),
    staleTime: 5 * 60 * 1000,      // 5분
  });
}
```

### Task 4: Mock 데이터 분리 (`src/mocks/production.ts` 신규)

기존 페이지에서 상수로 선언된 Mock 데이터를 별도 파일로 이동. `VITE_USE_MOCK=true`일 때만 dynamic import로 로드.

```typescript
// src/mocks/production.ts
// 기존 ProductionPerformancePage.tsx의 SAMPLE_ORDERS, MONTHLY_SUMMARY를
// API 응답 형식에 맞게 변환하여 export

import type { PerformanceResponse, MonthlySummaryResponse } from '@/types/production';

export function getMockPerformance(_week?: string): PerformanceResponse {
  return {
    week: 'W11',
    month: '2026-03',
    orders: [
      // 기존 SAMPLE_ORDERS 6개를 API 스키마로 변환
      // sales_order, model, sns[].progress.MECH/ELEC/TM 등
      // ... (기존 Mock 구조에서 필드명만 맞추면 됨)
    ],
    summary: {
      total_orders: 6,
      mech_confirmable: 1,
      elec_confirmable: 1,
      tm_confirmable: 0,
    },
  };
}

export function getMockMonthlySummary(_month?: string): MonthlySummaryResponse {
  return {
    month: '2026-03',
    weeks: [
      { week: 'W10', mech: { completed: 8, confirmed: 8 }, elec: { completed: 6, confirmed: 6 }, tm: { completed: 4, confirmed: 4 } },
      { week: 'W11', mech: { completed: 4, confirmed: 3 }, elec: { completed: 2, confirmed: 2 }, tm: { completed: 1, confirmed: 1 } },
      { week: 'W12', mech: { completed: 0, confirmed: 0 }, elec: { completed: 0, confirmed: 0 }, tm: { completed: 0, confirmed: 0 } },
      { week: 'W13', mech: { completed: 0, confirmed: 0 }, elec: { completed: 0, confirmed: 0 }, tm: { completed: 0, confirmed: 0 } },
    ],
    totals: {
      mech: { completed: 12, confirmed: 11 }, elec: { completed: 8, confirmed: 8 }, tm: { completed: 5, confirmed: 5 },
    },
  };
}
```

> Mock 데이터 내용은 기존 `SAMPLE_ORDERS`, `MONTHLY_SUMMARY`를 참고해서 API 스키마에 맞게 변환. 필드 매핑표는 Task 5 참조.

### Task 5: ProductionPerformancePage.tsx — Mock→API 전환

**핵심 변경: 삭제/교체 대상**

| 항목 | 라인 | 액션 |
|------|------|------|
| Mock 타입 (`ConfirmStatus`, `SnDetail`, `ProcessConfirm`, `OrderGroup`) | L10~40 | 삭제 → `@/types/production`에서 import |
| `WEEKS` 상수 | L43~48 | 삭제 → API 응답 `week` 필드 사용 |
| `SAMPLE_ORDERS` 상수 | L51~114 | 삭제 → `usePerformance()` 데이터 사용 |
| `MONTHLY_SUMMARY` 상수 | L117~122 | 삭제 → `useMonthlySummary()` 데이터 사용 |
| `countDone()` 유틸 | L125~130 | 삭제 → API `process_status.ready`/`total` 사용 |
| `summarizeSNs()` 유틸 | L132~144 | 삭제 → API `sn_summary` 사용 |
| `partnerInfo()` 유틸 | L146~150 | 삭제 → API `partner_info` 사용 |
| `PrepareBanner` 컴포넌트 | L242~261 | 삭제 (더 이상 Mock 아님) |
| `MiniProgress` 컴포넌트 | L153~166 | 유지 (S/N 상세에서 계속 사용) |
| `ProcessCell` 컴포넌트 | L168~240 | 수정 — props를 API 스키마에 맞게 변경 |

**5-1. import 변경**

```typescript
// 추가
import { usePerformance, useMonthlySummary, useConfirmProduction, useCancelConfirm } from '@/hooks/useProduction';
import type { OrderGroup, ConfirmRecord } from '@/types/production';
import { useAuth } from '@/hooks/useAuth';  // admin 권한 확인용
```

**5-2. 메인 컴포넌트 내부 변경**

```typescript
export default function ProductionPerformancePage() {
  const [activeWeek, setActiveWeek] = useState<string>('');   // API 응답에서 초기값 설정
  const [activeView, setActiveView] = useState<'weekly' | 'monthly'>('weekly');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | 'done' | 'pending'>('all');

  const { user } = useAuth();
  const isAdmin = user?.is_admin === true;

  // ─── API 데이터 ───
  const { data: perfData, isLoading, error } = usePerformance(activeWeek || undefined);
  const { data: monthlyData } = useMonthlySummary();
  const confirmMutation = useConfirmProduction();
  const cancelMutation = useCancelConfirm();

  // activeWeek 초기값: API 응답의 week
  useEffect(() => {
    if (perfData?.week && !activeWeek) setActiveWeek(perfData.week);
  }, [perfData?.week]);

  // ─── KPI 산출 (API summary 사용) ───
  const summary = perfData?.summary;
  const orders = perfData?.orders ?? [];
  const totalON = summary?.total_orders ?? 0;
  const totalSN = orders.reduce((s, o) => s + o.sn_count, 0);

  // 확인된 건수: confirms 배열에서 process_type별 count
  const mechConfirmed = orders.filter(o => o.confirms.some(c => c.process_type === 'MECH')).length;
  const elecConfirmed = orders.filter(o => o.confirms.some(c => c.process_type === 'ELEC')).length;
  const tmConfirmed = orders.filter(o => o.confirms.some(c => c.process_type === 'TM')).length;
  const mechReady = summary?.mech_confirmable ?? 0;
  const elecReady = summary?.elec_confirmable ?? 0;

  // ... 나머지 렌더링 로직은 동일하되, 데이터 소스만 교체
}
```

**5-3. 실적확인 버튼 onClick 연결**

`ProcessCell` 컴포넌트 내부의 "실적확인" 버튼에 mutation 연결:

```tsx
// confirm.status === 'ready' → confirmable === true 로 변경
{process_status.confirmable && !hasConfirm && (
  <button
    onClick={(e) => {
      e.stopPropagation();  // row expand 방지
      confirmMutation.mutate({
        sales_order: order.sales_order,
        process_type: processType,          // 'MECH' | 'ELEC' | 'TM'
        confirmed_week: perfData?.week ?? '',
        confirmed_month: perfData?.month ?? '',
      });
    }}
    disabled={confirmMutation.isPending}
    style={{ /* 기존 스타일 유지 */ }}
  >
    {confirmMutation.isPending ? '처리중...' : '실적확인'}
  </button>
)}
```

**5-4. 실적확인 취소 버튼 (Admin only)**

확인 완료된 셀에 admin만 볼 수 있는 취소 버튼 추가:

```tsx
{confirm && isAdmin && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      if (window.confirm(`${order.sales_order} ${processType} 실적확인을 취소하시겠습니까?`)) {
        cancelMutation.mutate(confirm.id);
      }
    }}
    style={{
      fontSize: '8px', padding: '1px 6px', borderRadius: '4px',
      background: 'rgba(239,68,68,0.06)', color: 'var(--gx-danger)',
      border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer',
    }}
  >
    취소
  </button>
)}
```

**5-5. 주차 탭 — 동적 생성**

기존 `WEEKS` 상수 대신 현재 월의 주차를 동적으로 생성하거나, API 응답의 `week`을 기준으로 ±2주 범위를 표시:

```typescript
// 간단한 주차 계산 유틸 (ISO 주차 기준)
function getWeeksForMonth(month: string): Array<{ label: string; range: string; current: boolean }> {
  // month = "2026-03" → 해당 월에 포함되는 ISO 주차 계산
  // 또는 현재 주 기준 ±2주 표시
  // API week 값과 비교하여 current 표시
  // ...
}
```

> 주차 계산 로직은 ISO 8601 기준 (월요일 시작). 기존 OPS 주차 계산과 동일.

**5-6. 월마감 뷰 — API 데이터 바인딩**

`MONTHLY_SUMMARY` 상수를 `useMonthlySummary()` 데이터로 교체:

```tsx
{activeView === 'monthly' && monthlyData && (
  <div>
    {/* 기존 테이블 구조 유지 */}
    <tbody>
      {monthlyData.weeks.map(row => (
        // row.week, row.mech.completed, row.mech.confirmed 등
      ))}
      {/* 합계 행 → monthlyData.totals 사용 */}
    </tbody>
  </div>
)}
```

**5-7. 로딩/에러 상태 처리**

```tsx
{isLoading && (
  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gx-steel)' }}>
    <div className="spinner" />
    데이터를 불러오는 중...
  </div>
)}
{error && (
  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-danger)' }}>
    데이터 로드 실패: {(error as Error).message}
  </div>
)}
```

**5-8. 필드 매핑표 (Mock → API)**

기존 Mock 필드와 API 응답 필드 대응:

| Mock (기존) | API (신규) | 설명 |
|---|---|---|
| `order.on` | `order.sales_order` | O/N |
| `order.model` | `order.model` | 동일 |
| `order.customer` | — | API 미포함 (product_info에서 필요 시 추가) |
| `order.line` | — | API 미포함 (필요 시 추가) |
| `order.snList` | `order.sns` | S/N 배열 |
| `sn.sn` | `sn.serial_number` | S/N 번호 |
| `sn.mechProgress` (0~100 number) | `sn.progress.MECH.pct` | MECH 진행률 |
| `sn.elecProgress` | `sn.progress.ELEC.pct` | ELEC 진행률 |
| `sn.tmProgress` (-1=N/A) | `sn.progress.TM.pct` (total=0이면 N/A) | TM 진행률 |
| `sn.mechEnd` | `sn.checklist.MECH.completed_at` | MECH 완료일 |
| `sn.elecEnd` | `sn.checklist.ELEC.completed_at` | ELEC 완료일 |
| `order.mechConfirm.status` | `confirms[]`에서 MECH 존재 여부 + `process_status.MECH.confirmable` | 확인 상태 판정 |
| `order.snList.length` | `order.sn_count` | S/N 수 |
| `summarizeSNs(order.snList)` | `order.sn_summary` | S/N 요약 텍스트 |
| `partnerInfo(snList, 'mechPartner')` | `order.partner_info.mech` + `.mixed` | 협력사 표시 |

> **주의**: Mock에 있던 `customer`, `line` 필드는 현재 API 스키마에 미포함. 필요 시 OPS BE에 추가 요청 (OPS_API_REQUESTS에 기록).

### Task 6: 일괄확인 버튼 연결

기존 "기구 일괄확인 (N건)" / "전장 일괄확인 (N건)" 버튼에 연속 mutation 호출:

```typescript
const handleBatchConfirm = async (processType: 'MECH' | 'ELEC') => {
  const confirmable = orders.filter(o =>
    o.process_status[processType].confirmable &&
    !o.confirms.some(c => c.process_type === processType)
  );
  if (confirmable.length === 0) return;

  const confirmed = window.confirm(
    `${processType === 'MECH' ? '기구' : '전장'} 실적확인 ${confirmable.length}건을 일괄 처리하시겠습니까?`
  );
  if (!confirmed) return;

  for (const order of confirmable) {
    await confirmMutation.mutateAsync({
      sales_order: order.sales_order,
      process_type: processType,
      confirmed_week: perfData?.week ?? '',
      confirmed_month: perfData?.month ?? '',
    });
  }
  // invalidateQueries는 onSuccess에서 자동 처리
};
```

## 체크리스트

**사전 조건**:
- [x] AXIS-OPS Sprint 33 완료 (production API 4개 + plan.production_confirm 테이블)
- [x] OPS BE 배포 완료 (Railway)

**FE (완료)**:
- [x] `src/types/production.ts` — 타입 정의 (API 응답 + 요청 전체)
- [x] `src/api/production.ts` — API 함수 4개
- [x] `src/hooks/useProduction.ts` — TanStack Query 훅 4개
- [x] ProductionPerformancePage.tsx — Mock 상수 삭제 (SAMPLE_ORDERS, MONTHLY_SUMMARY, WEEKS)
- [x] ProductionPerformancePage.tsx — Mock 유틸 삭제 (countDone, summarizeSNs, partnerInfo)
- [x] ProductionPerformancePage.tsx — PrepareBanner 삭제
- [x] ProductionPerformancePage.tsx — Mock 타입 삭제 → import from @/types/production
- [x] ProductionPerformancePage.tsx — usePerformance() 훅 연결 + 주간뷰 데이터 바인딩
- [x] ProductionPerformancePage.tsx — useMonthlySummary() 훅 연결 + 월마감뷰 데이터 바인딩
- [x] ProcessCell 컴포넌트 — props 리팩터링 (API process_status + confirms 기반)
- [x] 실적확인 버튼 — confirmMutation.mutate() 연결 (개별 + 일괄)
- [x] 실적확인 취소 — cancelMutation 준비 완료 (UI 연결은 배포 후 검증)
- [x] 주차 탭 — API week 기준 ±2주 동적 생성
- [x] 로딩/에러/빈 데이터 상태 처리
- [x] KPI 카드 — API summary 데이터 바인딩
- [x] npm run build 에러 없음

**DB 경로**: `plan.production_confirm` (Core DB, plan 스키마, Migration 027)

**검증 (배포 후)**:
- [ ] VITE_USE_MOCK=false 상태에서 API 호출 확인
- [ ] 실적확인 버튼 클릭 → `plan.production_confirm` INSERT 확인
- [ ] 일괄확인 동작 확인
- [ ] 월마감 뷰 데이터 표시 확인

---

# Sprint 9: 실적확인 설정 패널 + 권한 관리 필터 — admin_settings 연동 ✅ FE 완료

> **목적**: (1) 생산실적 페이지에 공정별 on/off 토글 설정 패널 추가 (admin_settings 기반), (2) 권한 관리 페이지에 Manager/Admin 필터 기본 적용
> **의존성**: AXIS-OPS Sprint 34 (SETTING_KEYS 레지스트리 + GET/PUT admin_settings 확장 + workers is_manager 필터) 완료 후 진행
> **범위**: FE — API 모듈 2개 신규/수정 + 훅 2개 신규/수정 + 페이지 2개 수정

## 배경

### 실적 페이지 설정 패널

OPS Sprint 33에서 admin_settings에 공정별 실적확인 on/off 설정 7개가 추가됨:

```
confirm_mech_enabled = true       기구 실적확인 ON
confirm_elec_enabled = true       전장 실적확인 ON
confirm_tm_enabled   = true       TM 실적확인 ON
confirm_pi_enabled   = false      PI 실적확인 OFF
confirm_qi_enabled   = false      QI 실적확인 OFF
confirm_si_enabled   = false      SI 실적확인 OFF
confirm_checklist_required = false 체크리스트 필수 OFF
```

현재 FE에서는 이 설정을 읽지 않고, BE의 `confirmable` 플래그만 사용 중. Admin이 현장 상황에 따라 특정 공정의 실적확인을 켜고 끌 수 있는 UI가 필요.

### 권한 관리 필터

현재 `GET /api/admin/workers?limit=500`으로 전체 작업자를 가져와서 테이블에 표시. 협력사별로 수십 명이 나오는데 실제 Manager는 1~2명. OPS Sprint 34에서 `is_manager` 쿼리 파라미터가 추가되므로, FE에서 기본적으로 Manager/Admin만 표시하고 필요 시 전체를 볼 수 있게 변경.

## BE API (AXIS-OPS Sprint 34에서 구현)

```
GET  /api/admin/settings                           → 전체 설정 조회 (confirm_* 포함)
PUT  /api/admin/settings                           → 설정 업데이트 (SETTING_KEYS 타입별 검증)
GET  /api/admin/workers?is_manager=true             → Manager/Admin만 필터
GET  /api/admin/workers?company=FNI&is_manager=true → 회사 + Manager 복합 필터
```

## FE 구현

> CLAUDE.md를 먼저 읽고 현재 프로젝트 구조를 파악할 것.

### Task 1: admin_settings API 모듈 (`src/api/adminSettings.ts` 신규)

VIEW에서 OPS admin_settings를 읽고 수정하는 API 모듈. 기존 패턴 참조: `src/api/attendance.ts`

```typescript
// src/api/adminSettings.ts
import apiClient from './client';

export interface AdminSettingsResponse {
  // bool 타입
  heating_jacket_enabled: boolean;
  phase_block_enabled: boolean;
  location_qr_required: boolean;
  auto_pause_enabled: boolean;
  geo_check_enabled: boolean;
  geo_strict_mode: boolean;

  // 실적확인 설정 (Sprint 33)
  confirm_mech_enabled: boolean;
  confirm_elec_enabled: boolean;
  confirm_tm_enabled: boolean;
  confirm_pi_enabled: boolean;
  confirm_qi_enabled: boolean;
  confirm_si_enabled: boolean;
  confirm_checklist_required: boolean;

  // PI 위임 설정 (Sprint 31C)
  pi_capable_mech_partners: string[];
  pi_gst_override_lines: string[];

  // 기타 (time, number 등)
  [key: string]: unknown;
}

/**
 * admin_settings 전체 조회
 */
export async function getAdminSettings(): Promise<AdminSettingsResponse> {
  const { data } = await apiClient.get<AdminSettingsResponse>('/api/admin/settings');
  return data;
}

/**
 * admin_settings 업데이트 (부분 업데이트 가능)
 */
export async function updateAdminSettings(
  updates: Partial<AdminSettingsResponse>
): Promise<{ message: string; updated_keys: string[] }> {
  const { data } = await apiClient.put<{ message: string; updated_keys: string[] }>(
    '/api/admin/settings',
    updates,
  );
  return data;
}
```

### Task 2: admin_settings TanStack Query 훅 (`src/hooks/useAdminSettings.ts` 신규)

```typescript
// src/hooks/useAdminSettings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminSettings, updateAdminSettings } from '@/api/adminSettings';
import type { AdminSettingsResponse } from '@/api/adminSettings';

/**
 * admin_settings 조회 훅
 */
export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: getAdminSettings,
    staleTime: 5 * 60 * 1000,  // 5분 (설정은 자주 안 바뀜)
  });
}

/**
 * admin_settings 업데이트 훅
 * 성공 시 admin-settings 쿼리 invalidate + production 쿼리도 invalidate
 */
export function useUpdateAdminSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: Partial<AdminSettingsResponse>) => updateAdminSettings(updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
      qc.invalidateQueries({ queryKey: ['production'] });  // confirmable 재계산
    },
  });
}
```

### Task 3: workers API 수정 (`src/api/workers.ts` 수정)

기존 `getWorkers()`에 필터 파라미터 추가:

```typescript
// src/api/workers.ts (수정)
import apiClient from './client';
import type { Worker } from '@/types/auth';

export interface WorkersResponse {
  workers: Worker[];
  total: number;
}

export interface WorkersParams {
  company?: string;
  is_manager?: boolean;
  limit?: number;
}

export async function getWorkers(params?: WorkersParams): Promise<WorkersResponse> {
  const queryParams: Record<string, string> = {};
  if (params?.company) queryParams.company = params.company;
  if (params?.is_manager !== undefined) queryParams.is_manager = String(params.is_manager);
  queryParams.limit = String(params?.limit ?? 500);

  const { data } = await apiClient.get<WorkersResponse>('/api/admin/workers', {
    params: queryParams,
  });
  return data;
}

export async function toggleManager(
  workerId: number,
  isManager: boolean
): Promise<{ success: boolean; worker: Worker }> {
  const { data } = await apiClient.put<{ success: boolean; worker: Worker }>(
    `/api/admin/workers/${workerId}/manager`,
    { is_manager: isManager },
  );
  return data;
}
```

### Task 4: useWorkers 훅 수정 (`src/hooks/useWorkers.ts` 수정)

```typescript
// src/hooks/useWorkers.ts (수정)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkers, toggleManager } from '@/api/workers';
import type { WorkersParams } from '@/api/workers';

export function useWorkers(params?: WorkersParams) {
  return useQuery({
    queryKey: ['workers', params],
    queryFn: () => getWorkers(params),
    staleTime: 30_000,
  });
}

export function useToggleManager() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ workerId, isManager }: { workerId: number; isManager: boolean }) =>
      toggleManager(workerId, isManager),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workers'] });
    },
  });
}
```

### Task 5: 생산실적 페이지 — 설정 패널 추가 (`ProductionPerformancePage.tsx` 수정)

**5-1. import 추가**

```typescript
import { useAdminSettings, useUpdateAdminSettings } from '@/hooks/useAdminSettings';
```

**5-2. 설정 패널 컴포넌트 (페이지 내부에 정의)**

```tsx
function ConfirmSettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: settings, isLoading } = useAdminSettings();
  const updateMutation = useUpdateAdminSettings();

  if (!open) return null;

  const TOGGLES = [
    { key: 'confirm_mech_enabled', label: '기구 (MECH)', group: 'active' },
    { key: 'confirm_elec_enabled', label: '전장 (ELEC)', group: 'active' },
    { key: 'confirm_tm_enabled', label: 'Tank Module (TM)', group: 'active' },
    { key: 'confirm_pi_enabled', label: 'PI', group: 'inactive' },
    { key: 'confirm_qi_enabled', label: 'QI', group: 'inactive' },
    { key: 'confirm_si_enabled', label: 'SI', group: 'inactive' },
  ] as const;

  const handleToggle = (key: string, currentValue: boolean) => {
    updateMutation.mutate({ [key]: !currentValue });
  };

  return (
    <div style={{
      position: 'absolute', top: '48px', right: '0', width: '300px', zIndex: 100,
      background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-md)',
      border: '1px solid var(--gx-mist)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
      padding: '16px',
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--gx-mist)',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
          실적확인 설정
        </span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--gx-steel)', fontSize: '16px',
        }}>✕</button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gx-steel)', fontSize: '12px' }}>
          설정 불러오는 중...
        </div>
      ) : (
        <>
          {/* 공정별 토글 */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gx-steel)', marginBottom: '8px', letterSpacing: '0.3px' }}>
              공정별 실적확인 활성화
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {TOGGLES.map(t => {
                const value = settings?.[t.key as keyof typeof settings] as boolean ?? false;
                return (
                  <div key={t.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: 500,
                      color: value ? 'var(--gx-charcoal)' : 'var(--gx-steel)',
                    }}>{t.label}</span>
                    {/* 토글 스위치 — SettingsModal 패턴 재사용 */}
                    <button
                      onClick={() => handleToggle(t.key, value)}
                      disabled={updateMutation.isPending}
                      style={{
                        width: '40px', height: '22px', borderRadius: '11px',
                        border: 'none', cursor: 'pointer', position: 'relative',
                        background: value ? 'var(--gx-accent)' : 'var(--gx-silver)',
                        transition: 'background 0.2s',
                        opacity: updateMutation.isPending ? 0.6 : 1,
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: '2px',
                        left: value ? '20px' : '2px',
                        width: '18px', height: '18px', borderRadius: '50%',
                        background: 'var(--gx-white)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                        transition: 'left 0.2s',
                      }} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ borderTop: '1px solid var(--gx-mist)', margin: '12px 0' }} />

          {/* 체크리스트 필수 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-charcoal)' }}>
                체크리스트 필수
              </span>
              <div style={{ fontSize: '10px', color: 'var(--gx-steel)', marginTop: '2px' }}>
                자주검사 완료 시에만 실적확인 가능
              </div>
            </div>
            <button
              onClick={() => handleToggle('confirm_checklist_required', settings?.confirm_checklist_required ?? false)}
              disabled={updateMutation.isPending}
              style={{
                width: '40px', height: '22px', borderRadius: '11px',
                border: 'none', cursor: 'pointer', position: 'relative',
                background: (settings?.confirm_checklist_required) ? 'var(--gx-accent)' : 'var(--gx-silver)',
                transition: 'background 0.2s',
              }}
            >
              <span style={{
                position: 'absolute', top: '2px',
                left: (settings?.confirm_checklist_required) ? '20px' : '2px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: 'var(--gx-white)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                transition: 'left 0.2s',
              }} />
            </button>
          </div>

          {/* 저장 피드백 */}
          {updateMutation.isSuccess && (
            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--gx-success)', textAlign: 'center' }}>
              설정이 저장되었습니다.
            </div>
          )}
          {updateMutation.isError && (
            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--gx-danger)', textAlign: 'center' }}>
              저장 실패. 다시 시도해주세요.
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

**5-3. toolbar에 ⚙️ 버튼 추가 (admin only)**

```tsx
export default function ProductionPerformancePage() {
  // 기존 state...
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.is_admin === true;

  // ... 기존 로직 ...

  return (
    <Layout title="생산실적">
      <div style={{ padding: '28px 32px', maxWidth: '1600px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', ... }}>
          {/* 기존 주간/월마감 토글, 주차 탭, 상태 필터 ... */}

          {/* ★ Sprint 9: 설정 버튼 (admin only) — toolbar 오른쪽 끝 */}
          {isAdmin && (
            <div style={{ marginLeft: 'auto', position: 'relative' }}>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  border: '1px solid var(--gx-mist)', background: 'var(--gx-snow)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: settingsOpen ? 'var(--gx-accent)' : 'var(--gx-steel)',
                  transition: 'all 0.15s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
              <ConfirmSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
```

**5-4. 외부 클릭 시 패널 닫기**

`ConfirmSettingsPanel` 내부에 기존 `SettingsModal.tsx`와 동일한 `useEffect` + `mousedown` 패턴 적용:

```typescript
const panelRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  if (!open) return;
  function handleClick(e: MouseEvent) {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  }
  document.addEventListener('mousedown', handleClick);
  return () => document.removeEventListener('mousedown', handleClick);
}, [open, onClose]);
```

**5-5. confirmable + confirm_enabled 연동**

현재 `ProcessCell`에서 `processStatus.confirmable`만 보고 실적확인 버튼을 표시. Sprint 9에서는 admin_settings의 `confirm_{공정}_enabled`도 함께 확인:

```tsx
// 메인 컴포넌트에서 admin settings 읽기
const { data: adminSettings } = useAdminSettings();

// ProcessCell에 enabled prop 전달
const isProcessEnabled = (pt: string): boolean => {
  const key = `confirm_${pt.toLowerCase()}_enabled`;
  return (adminSettings as Record<string, unknown>)?.[key] === true;
};

// 렌더링 시
<ProcessCell
  processType="MECH"
  processStatus={order.process_status?.MECH ?? { ready: 0, total: 0, confirmable: false }}
  confirms={order.confirms}
  partnerDisplay={order.partner_info?.mech ?? ''}
  mixed={order.partner_info?.mixed ?? false}
  onConfirm={() => handleConfirm(order.sales_order, 'MECH')}
  confirmPending={confirmMutation.isPending}
  enabled={isProcessEnabled('MECH')}   // ★ Sprint 9 추가
/>
```

**5-6. ProcessCell — enabled prop 추가**

```tsx
function ProcessCell({ processType, processStatus, confirms, partnerDisplay, mixed, onConfirm, confirmPending, enabled = true }: {
  // ... 기존 props ...
  enabled?: boolean;  // ★ Sprint 9 추가
}) {
  // enabled=false면 confirmable이어도 버튼 숨김
  const showConfirmButton = enabled && processStatus.confirmable && !confirm;

  // 비활성 공정 시각적 표시
  if (!enabled && processStatus.total > 0) {
    return (
      <td style={{ padding: '12px 14px', minWidth: '140px', opacity: 0.5 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gx-steel)', fontFamily: "'JetBrains Mono', monospace" }}>
            {processStatus.ready}/{processStatus.total}
          </span>
          <span style={{ fontSize: '9px', color: 'var(--gx-silver)', fontStyle: 'italic' }}>확인 비활성</span>
        </div>
      </td>
    );
  }

  // ... 기존 렌더링 (confirm 버튼은 showConfirmButton 조건으로) ...
}
```

### Task 6: 권한 관리 페이지 — Manager 기본 필터 (`PermissionsPage.tsx` 수정)

**6-1. 기본 뷰: Manager/Admin만 표시**

```tsx
export default function PermissionsPage() {
  const { user: currentUser } = useAuth();
  const [showAll, setShowAll] = useState(false);  // ★ Sprint 9 추가
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  // ★ Sprint 9: is_manager 파라미터 전달
  const { data, isLoading, isError, error } = useWorkers(
    showAll ? undefined : { is_manager: true }
  );

  const allWorkers = data?.workers ?? [];

  // Manager는 자사 소속만 (기존 로직 유지)
  const workers = useMemo(() => {
    if (currentUser?.is_admin) return allWorkers;
    if (currentUser?.is_manager) return allWorkers.filter((w) => w.company === currentUser.company);
    return allWorkers;
  }, [allWorkers, currentUser]);

  // ... 기존 필터링 로직 ...
```

**6-2. 필터바에 "전체 보기" 토글 추가**

```tsx
{/* 필터 바 (기존 select, input 뒤에 추가) */}
<div style={{
  marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px',
}}>
  <span style={{ fontSize: '12px', color: 'var(--gx-steel)' }}>
    {showAll ? `전체 ${filtered.length}명` : `Manager ${filtered.length}명`}
  </span>
  <button
    onClick={() => setShowAll(!showAll)}
    style={{
      fontSize: '11px', fontWeight: 500, padding: '5px 12px',
      borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
      border: '1px solid',
      ...(showAll
        ? { background: 'var(--gx-accent)', color: '#fff', borderColor: 'var(--gx-accent)' }
        : { background: 'var(--gx-snow)', color: 'var(--gx-steel)', borderColor: 'var(--gx-mist)' }
      ),
    }}
  >
    {showAll ? '전체 보기 중' : '전체 보기'}
  </button>
</div>
```

**6-3. KPI 카드 업데이트**

`showAll=false`일 때는 Manager/Admin만 표시되므로 KPI도 맞춤:

```tsx
// KPI
const totalWorkers = workers.length;
const adminCount = workers.filter((w) => w.is_admin).length;
const managerCount = workers.filter((w) => w.is_manager && !w.is_admin).length;
const generalCount = showAll ? workers.filter((w) => !w.is_manager && !w.is_admin).length : 0;

// KPI 카드 배열
const kpis = [
  { label: showAll ? '전체 작업자' : '관리자', value: totalWorkers, color: 'var(--gx-charcoal)' },
  { label: 'Admin', value: adminCount, color: 'var(--gx-accent)' },
  { label: 'Manager', value: managerCount, color: 'var(--gx-success)' },
  ...(showAll ? [{ label: '일반', value: generalCount, color: 'var(--gx-steel)' }] : []),
];
```

### Task 7: 일괄확인 버튼 — confirm_enabled 반영

기존 toolbar의 "기구 일괄확인 (N건)" / "전장 일괄확인 (N건)" 버튼도 `confirm_{공정}_enabled=false`이면 숨김:

```tsx
{/* 일괄 확인 — enabled인 공정만 표시 */}
{isProcessEnabled('MECH') && mechReady > 0 && (
  <button onClick={() => handleBatchConfirm('MECH')} style={...}>
    기구 일괄확인 ({mechReady}건)
  </button>
)}
{isProcessEnabled('ELEC') && elecReady > 0 && (
  <button onClick={() => handleBatchConfirm('ELEC')} style={...}>
    전장 일괄확인 ({elecReady}건)
  </button>
)}
```

### Task 8: 설정 패널 열릴 때 ESC 키로 닫기

```typescript
useEffect(() => {
  if (!settingsOpen) return;
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setSettingsOpen(false);
  };
  document.addEventListener('keydown', handleKey);
  return () => document.removeEventListener('keydown', handleKey);
}, [settingsOpen]);
```

## 체크리스트

**사전 조건**:
- [x] AXIS-OPS Sprint 34 완료
- [x] OPS BE 배포 완료 (Railway)

**신규 파일 (FE — 완료)**:
- [x] `src/api/adminSettings.ts` — getAdminSettings(), updateAdminSettings()
- [x] `src/hooks/useAdminSettings.ts` — useAdminSettings(), useUpdateAdminSettings()

**수정 파일 (FE — 완료)**:
- [x] `src/api/workers.ts` — getWorkers()에 WorkersParams (company, is_manager) 추가
- [x] `src/hooks/useWorkers.ts` — useWorkers(params?) 파라미터 전달
- [x] `ProductionPerformancePage.tsx` — ConfirmSettingsPanel 컴포넌트 추가
- [x] `ProductionPerformancePage.tsx` — toolbar에 ⚙️ 버튼 (admin only)
- [x] `ProductionPerformancePage.tsx` — 외부 클릭 / ESC 키로 패널 닫기
- [x] `ProductionPerformancePage.tsx` — useAdminSettings() 연동
- [x] `ProductionPerformancePage.tsx` — ProcessCell에 enabled prop 추가
- [x] `ProductionPerformancePage.tsx` — enabled=false 시 "확인 비활성" 표시 + 버튼 숨김
- [x] `ProductionPerformancePage.tsx` — 일괄확인 버튼에 confirm_enabled 반영
- [x] `PermissionsPage.tsx` — showAll 상태 추가 (기본 false → Manager/Admin만)
- [x] `PermissionsPage.tsx` — useWorkers(params) 호출에 is_manager 전달
- [x] `PermissionsPage.tsx` — "전체 보기" 토글 버튼 추가

**빌드 검증**:
- [x] npm run build 에러 없음
- [x] TypeScript strict 에러 없음

**기능 검증 (배포 후)**:
- [x] 실적 페이지 — admin 로그인 시 ⚙️ 표시, 비admin 시 미표시
- [x] ⚙️ 클릭 → 설정 패널 열림, 외부 클릭 / ESC → 닫힘
- [x] 토글 ON/OFF → PUT 호출 → 즉시 반영
- [x] 권한 페이지 — 기본: Manager/Admin만 표시 + "전체 보기" 토글
- [x] 기존 Manager 토글 기능 정상 동작 (regression)

---

# Sprint 10 (VIEW): 근태 추이 API 연동 + TrendDataPoint 타입 분리 ✅ FE 완료

**목표**: OPS BE #29 `GET /api/admin/hr/attendance/trend` 엔드포인트 연동 + ChartSection 주간/월간 라인 차트를 실 데이터로 교체. `TrendDataPoint` 타입을 `types/attendance.ts`로 이동하여 장기적으로 올바른 의존성 구조 확보.

**범위**: 타입 1 + API 1 + 훅 1 + 컴포넌트 2 수정
**의존성**: OPS BE #29 (trend API 배포)
**선행**: Sprint 9 (의존성 없음 — 독립 병렬 가능)

---

### Task 1: `src/types/attendance.ts` — TrendDataPoint 타입 이동

**현재 문제**: `TrendDataPoint`가 `ChartSection.tsx` 컴포넌트 내부에 정의 + export됨.
추후 `useAttendanceTrend()` 훅, `attendance.ts` API 모듈에서 이 타입을 import하면 **컴포넌트 → 컴포넌트 의존성**이 생김 (역방향).

**변경**: `types/attendance.ts`로 이동하여 `types → api → hooks → components` 단방향 유지.

**파일**: `src/types/attendance.ts`

기존 내용 끝에 추가:

```typescript
// --- 추이 차트 ---

/** 일별 출입 인원 추이 데이터 포인트 */
export interface TrendDataPoint {
  date: string;       // "03/17(월)" 형식 표시용
  dateRaw: string;    // "2026-03-17" 원본
  total: number;
  hq: number;
  site: number;
}

/** GET /api/admin/hr/attendance/trend 응답 */
export interface AttendanceTrendResponse {
  date_from: string;
  date_to: string;
  trend: Array<{
    date: string;           // "2026-03-17"
    total_registered: number;
    checked_in: number;
    hq_count: number;
    site_count: number;
  }>;
}
```

**참고**: `TrendDataPoint`는 FE 표시용 (날짜 포맷 변환 후), `AttendanceTrendResponse`는 BE 원본 응답 타입. 변환은 API 모듈에서 수행.

---

### Task 2: `src/components/attendance/ChartSection.tsx` — import 변경

**변경 전** (Line 26~32):
```typescript
export interface TrendDataPoint {
  date: string;
  dateRaw: string;
  total: number;
  hq: number;
  site: number;
}
```

**변경 후**:
```typescript
import type { TrendDataPoint } from '@/types/attendance';
```

- 인터페이스 정의 삭제
- import로 교체
- `ChartSectionProps`의 `trendData?: TrendDataPoint[]`는 그대로 유지 (타입 참조만 변경)
- `export`가 제거되므로, 현재 다른 곳에서 import하는 곳이 없어야 함 → 없음 확인 완료

---

### Task 3: `src/api/attendance.ts` — getAttendanceTrend() 추가

**파일**: `src/api/attendance.ts`

기존 import 수정 + 함수 추가:

```typescript
import type {
  DailyAttendanceResponse,
  CompanySummaryResponse,
  AttendanceTrendResponse,
  TrendDataPoint,
} from '@/types/attendance';

// ... 기존 getAttendanceToday, getAttendanceByDate, getAttendanceSummary 유지 ...

/**
 * 기간별 출입 추이 조회
 * @param dateFrom - 시작일 (YYYY-MM-DD)
 * @param dateTo   - 종료일 (YYYY-MM-DD)
 */
export async function getAttendanceTrend(
  dateFrom: string,
  dateTo: string,
): Promise<TrendDataPoint[]> {
  if (USE_MOCK) {
    return getMockAttendanceTrend(dateFrom, dateTo);
  }
  const response = await apiClient.get<AttendanceTrendResponse>(
    '/api/admin/hr/attendance/trend',
    { params: { date_from: dateFrom, date_to: dateTo } },
  );
  return response.data.trend.map(transformTrendPoint);
}

/** BE 응답 → FE TrendDataPoint 변환 */
function transformTrendPoint(item: AttendanceTrendResponse['trend'][number]): TrendDataPoint {
  const d = new Date(item.date + 'T00:00:00+09:00');
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const dayName = dayNames[d.getDay()];

  return {
    date: `${mm}/${dd}(${dayName})`,
    dateRaw: item.date,
    total: item.checked_in,
    hq: item.hq_count,
    site: item.site_count,
  };
}
```

**Mock import 추가** (기존 import 라인):
```typescript
import {
  getMockTodayAttendance,
  getMockCompanySummary,
  getMockAttendanceTrend,   // ★ 추가
} from '@/mocks/attendance';
```

---

### Task 4: `src/mocks/attendance.ts` — getMockAttendanceTrend() 추가

**파일**: `src/mocks/attendance.ts`

기존 Mock 함수들 아래에 추가:

```typescript
import type { TrendDataPoint } from '@/types/attendance';

/**
 * Mock 추이 데이터 생성 (주간 7일 / 월간 30일)
 */
export function getMockAttendanceTrend(dateFrom: string, dateTo: string): TrendDataPoint[] {
  const start = new Date(dateFrom + 'T00:00:00+09:00');
  const end = new Date(dateTo + 'T00:00:00+09:00');
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const points: TrendDataPoint[] = [];

  const current = new Date(start);
  while (current <= end) {
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    const dayName = dayNames[current.getDay()];
    const isWeekend = current.getDay() === 0 || current.getDay() === 6;

    // 주말: 낮은 수치, 평일: 정상 수치 + 날짜 기반 시드 변동
    // Math.random() 대신 날짜 기반 결정적 시드 → 렌더링마다 동일 데이터
    const seed = current.getFullYear() * 10000 + (current.getMonth() + 1) * 100 + current.getDate();
    const pseudoRandom = ((seed * 9301 + 49297) % 233280) / 233280;  // 0~1 결정적 난수
    const base = isWeekend ? 15 : 95;
    const variance = Math.floor(pseudoRandom * 20) - 10;
    const total = Math.max(0, base + variance);
    const hq = Math.floor(total * 0.35);
    const site = total - hq;

    points.push({
      date: `${mm}/${dd}(${dayName})`,
      dateRaw: `${current.getFullYear()}-${mm}-${dd}`,
      total,
      hq,
      site,
    });

    current.setDate(current.getDate() + 1);
  }

  return points;
}
```

---

### Task 5: `src/hooks/useAttendance.ts` — useAttendanceTrend() 훅 추가

**파일**: `src/hooks/useAttendance.ts`

기존 import 수정 + 훅 추가:

```typescript
import {
  getAttendanceToday,
  getAttendanceByDate,
  getAttendanceSummary,
  getAttendanceTrend,     // ★ 추가
} from '@/api/attendance';

// ... 기존 useAttendanceToday, useAttendanceSummary 유지 ...

/**
 * 기간별 출입 추이 훅
 * @param dateFrom - 시작일 (YYYY-MM-DD)
 * @param dateTo   - 종료일 (YYYY-MM-DD)
 */
export function useAttendanceTrend(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ['attendance', 'trend', dateFrom, dateTo],
    queryFn: () => getAttendanceTrend(dateFrom, dateTo),
    staleTime: 5 * 60 * 1000,   // 5분 — 추이 데이터는 자주 안 바뀜
    enabled: !!dateFrom && !!dateTo,
  });
}
```

**설계 포인트**:
- `staleTime: 5분` — 일간 데이터와 달리 추이는 과거 데이터 포함이라 자주 갱신 불필요
- `enabled` 조건: dateFrom/dateTo가 빈 문자열이면 호출 안 함
- `refetchInterval` 없음 — 수동 탭 전환 시에만 새로 호출

---

### Task 6: `AttendancePage.tsx` — useAttendanceTrend 연동

**파일**: `src/pages/attendance/AttendancePage.tsx`

**6-1. 날짜 범위 계산 함수 추가**:

```typescript
/** 오늘 기준 N일 전 ~ 오늘 범위 계산 */
function getDateRange(days: number): { dateFrom: string; dateTo: string } {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - days + 1);

  const fmt = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return { dateFrom: fmt(from), dateTo: fmt(today) };
}
```

**6-2. chartTab → 날짜 범위 매핑**:

```typescript
export default function AttendancePage() {
  // 기존 state...
  const [chartTab, setChartTab] = useState<'일간' | '주간' | '월간'>('일간');

  // ★ Sprint 10: 추이 데이터 연동
  const trendRange = chartTab === '주간'
    ? getDateRange(7)
    : chartTab === '월간'
      ? getDateRange(30)
      : null;

  const {
    data: trendData,
    isLoading: trendLoading,
  } = useAttendanceTrend(
    trendRange?.dateFrom ?? '',
    trendRange?.dateTo ?? '',
  );
```

**6-3. ChartSection에 trendData 전달** (기존 placeholder 교체):

변경 전:
```tsx
<ChartSection
  companies={chartData}
  hqTotal={hqTotal}
  siteTotal={siteTotal}
  notChecked={notChecked}
/>
```

변경 후:
```tsx
<ChartSection
  companies={chartData}
  hqTotal={hqTotal}
  siteTotal={siteTotal}
  notChecked={notChecked}
  trendData={trendData}          // ★ Sprint 10
  trendLoading={trendLoading}    // ★ Sprint 10
/>
```

**6-4. chartTab 상태를 ChartSection과 동기화**:

ChartSection 내부에 이미 `activeTab` state가 있음. AttendancePage에서 관리하는 `chartTab`과 동기화 필요:

방법 A (권장): ChartSection에 `onTabChange` 콜백 추가
```tsx
<ChartSection
  ...
  onTabChange={(tab) => setChartTab(tab)}
/>
```

ChartSection 내부:
```tsx
interface ChartSectionProps {
  // ... 기존 ...
  onTabChange?: (tab: '일간' | '주간' | '월간') => void;  // ★ Sprint 10
}

// 탭 클릭 핸들러에서
const handleTabClick = (tab: TabType) => {
  setActiveTab(tab);
  onTabChange?.(tab);
};
```

---

### Task 7: `ChartSection.tsx` — placeholder 제거 + 실 데이터 연동

**현재**: 주간/월간 탭에 trendData가 없으면 placeholder("BE API 연동 후 표시됩니다") 표시.

**변경**: trendData가 있으면 라인 차트 렌더링, trendLoading이면 스피너, 없으면 placeholder 유지 (BE 미배포 시 graceful fallback).

**현재 코드 기준 차트 스타일** (v1.7.3 보라 톤 통일):

| 항목 | 값 |
|------|-----|
| 차트 높이 | 200px |
| 전체 라인 | `#6366F1` (indigo), strokeWidth 2, dot r=3 |
| 본사 라인 | `#818CF8` (medium indigo), strokeWidth 1.5, strokeDasharray "4 2" |
| 현장 라인 | `#A5B4FC` (light indigo), strokeWidth 1.5, strokeDasharray "4 2" |
| CartesianGrid | `strokeDasharray="0"` (실선), `vertical={false}` |
| XAxis/YAxis | `axisLine={false}`, `tickLine={false}`, DM Sans 폰트 |

현재 ChartSection에 이미 라인 차트 렌더링 코드가 구현되어 있음 (Line 245~292).
Sprint 10에서는 **trendData를 실제 API/Mock 데이터로 교체하는 것**이 핵심이며, 차트 스타일 변경은 불필요.

Task 7에서 변경할 부분은 **placeholder 영역만** — trendData가 undefined일 때의 빈 상태 메시지:

```tsx
// 현재 placeholder (Line 294~310) — trendData 없을 때 표시
// Sprint 10 후: BE 미배포 + Mock OFF 시에만 도달
<div style={{
  height: '200px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--gx-steel)', fontSize: '13px',
}}>
  {activeTab === '주간' ? '최근 7일' : '최근 30일'} 추이 데이터 없음
</div>
```

---

## 체크리스트

**사전 조건**:
- [x] Mock으로 우선 개발 (OPS BE #29 배포 후 자동 전환)

**수정 파일 (완료)**:
- [x] `src/types/attendance.ts` — `TrendDataPoint`, `AttendanceTrendResponse` 타입 추가
- [x] `src/components/attendance/ChartSection.tsx` — 내부 TrendDataPoint 삭제 → import + onTabChange 콜백
- [x] `src/api/attendance.ts` — `getAttendanceTrend()` + `transformTrendPoint()` + Mock fallback
- [x] `src/mocks/attendance.ts` — `getMockAttendanceTrend()` 결정적 Mock
- [x] `src/hooks/useAttendance.ts` — `useAttendanceTrend()` 훅 (staleTime 5분)
- [x] `src/pages/attendance/AttendancePage.tsx` — chartTab + trendRange + useAttendanceTrend + ChartSection 연동

**빌드 검증**:
- [x] npm run build 에러 없음
- [x] TypeScript strict 에러 없음
- [x] `TrendDataPoint` import 경로 `@/types/attendance` 통일

**기능 검증 (배포 후)**:
- [ ] 일간 탭 — 기존 스택 바 + 도넛 정상 (regression)
- [ ] 주간 탭 — 7일 라인 차트 표시
- [ ] 월간 탭 — 30일 라인 차트 표시
- [ ] 탭 전환 시 API 재호출 (queryKey 변경)

---

# Sprint 11 (VIEW): 생산실적 BE 응답 매핑 + 타입 정합성 수정 ✅ 완료

> **목적**: BE #31(sns 배열), #32(processes 키), #32-B(ready + confirmable) 수정 완료 후, FE 타입과 BE 응답 간 불일치 3건 해소
> **선행**: OPS BE 배포 완료 (production.py — sns, sn_summary, ready, proc_key, TMS→TM 매핑)
> **참조**: OPS_API_REQUESTS.md #33

---

## 배경

BE `_build_order_item()` 응답이 수정되면서, FE `OrderGroup` 타입과 아래 3가지 불일치가 발생:

1. **`partner_info`**: FE는 `order.partner_info.mech`를 참조하나, BE는 `mech_partner`/`elec_partner` flat 문자열 반환
2. **`confirms`**: FE는 `order.confirms[]` 배열을 참조하나, BE는 `processes.*.confirmed/confirmed_at/confirm_id`로 내장 반환
3. **`SNProgress` 타입**: FE는 `{MECH, ELEC, TM}` 고정 3키, BE는 PI/QI/SI도 반환 가능

---

## Task 1: `types/production.ts` — `SNProgress` 타입 확장

**파일**: `src/types/production.ts`

**변경**:
```typescript
// 변경 전
export interface SNProgress {
  MECH: ProcessProgress;
  ELEC: ProcessProgress;
  TM: ProcessProgress;
}

// 변경 후
export type SNProgress = Record<string, ProcessProgress>;
```

**이유**: BE가 PI, QI, SI 공정도 반환 가능. 고정 키 타입은 확장 시마다 수정 필요.

---

## Task 2: `types/production.ts` — `OrderGroup.processes` 타입 확장

**파일**: `src/types/production.ts`

**변경**:
```typescript
// 변경 전
export interface OrderGroup {
  // ...
  processes: {
    MECH: ProcessStatus;
    ELEC: ProcessStatus;
    TM: ProcessStatus;
  };
  // ...
}

// 변경 후
export interface OrderGroup {
  // ...
  processes: Record<string, ProcessStatus>;
  // ...
}
```

**이유**: SNProgress와 동일 — PI/QI/SI 확장 대비.

---

## Task 3: `api/production.ts` — `getPerformance()` 응답 변환 (partner_info)

**파일**: `src/api/production.ts`

**변경**: `getPerformance()` 리턴 전에 BE 응답을 FE 타입으로 변환

```typescript
export async function getPerformance(week?: string, month?: string): Promise<PerformanceResponse> {
  const params = new URLSearchParams();
  if (week) params.set('week', week);
  if (month) params.set('month', month);
  const query = params.toString();
  const { data } = await apiClient.get<PerformanceResponse>(
    `/api/admin/production/performance${query ? `?${query}` : ''}`,
  );

  // BE 응답 → FE 타입 변환
  data.orders = data.orders.map(order => ({
    ...order,
    partner_info: {
      mech: (order as any).mech_partner || '—',
      elec: (order as any).elec_partner || '—',
      mixed: (order as any).mech_partner !== (order as any).elec_partner,
    },
  }));

  return data;
}
```

**핵심**: BE의 flat `mech_partner`/`elec_partner` → FE가 기대하는 `partner_info` 객체로 조립. `mixed`는 MECH/ELEC 파트너가 다른 경우 true.

---

## Task 4: `api/production.ts` — `getPerformance()` 응답 변환 (confirms)

**파일**: `src/api/production.ts` (Task 3과 동일 위치에 추가)

**변경**: Task 3의 map 안에서 `confirms` 배열도 함께 구성

```typescript
data.orders = data.orders.map(order => {
  // confirms 배열 변환: processes 내부 confirmed 정보 → ConfirmRecord[]
  const confirms: ConfirmRecord[] = Object.entries(order.processes ?? {})
    .filter(([, v]) => v.confirmed)
    .map(([pt, v]) => ({
      id: v.confirm_id ?? 0,
      process_type: pt as 'MECH' | 'ELEC' | 'TM',
      confirmed_week: data.week ?? '',
      confirmed_by: '',
      confirmed_at: v.confirmed_at ?? '',
    }));

  return {
    ...order,
    partner_info: {
      mech: (order as any).mech_partner || '—',
      elec: (order as any).elec_partner || '—',
      mixed: (order as any).mech_partner !== (order as any).elec_partner,
    },
    confirms,
  };
});
```

**핵심**: FE의 `ProcessCell` 컴포넌트가 `confirms.find(c => c.process_type === processType)`로 확인 기록을 조회함. BE는 `processes.MECH.confirmed=true`로 내장하므로, API 레이어에서 배열로 풀어줌.

---

## Task 5: `ProcessStatus` 타입에 BE 필드 추가

**파일**: `src/types/production.ts`

**변경**:
```typescript
// 변경 전
export interface ProcessStatus {
  ready: number;
  total: number;
  checklist_ready?: number;
  confirmable: boolean;
}

// 변경 후
export interface ProcessStatus {
  ready: number;
  total: number;
  completed?: number;        // BE 원본 필드
  pct?: number;              // 진행률 (BE 계산값)
  checklist_ready?: number;
  confirmable: boolean;
  confirmed?: boolean;       // confirms 배열 변환용
  confirmed_at?: string | null;
  confirm_id?: number | null;
}
```

**이유**: Task 4에서 `processes` 내부의 `confirmed`, `confirmed_at`, `confirm_id`를 읽어서 `confirms` 배열로 변환하므로, 타입에 해당 필드가 있어야 TypeScript 에러 방지.

---

## Task 6: `api/production.ts` — `mixed` 판정 로직 수정 (#33-3) ✅ 완료

**파일**: `src/api/production.ts`

**변경**: `partner_info.mixed` 판정을 `mech_partner !== elec_partner` (공정 간 비교) → `sns` 배열 기반 (S/N 간 비교)로 수정

```typescript
// 변경 전 (오류)
mixed: (raw.mech_partner || '') !== (raw.elec_partner || ''),

// 변경 후
const sns = raw.sns ?? [];
const mechMixed = sns.length > 1 && new Set(sns.map((s: any) => s.mech_partner)).size > 1;
const elecMixed = sns.length > 1 && new Set(sns.map((s: any) => s.elec_partner)).size > 1;
// ...
mixed: mechMixed || elecMixed,
```

**이유**: "혼재"는 같은 O/N 내 S/N이 2대 이상일 때, 같은 공정에서 S/N별 협력사가 다른 경우. 기존 로직은 MECH 협력사 ≠ ELEC 협력사(다른 공정 간 비교)를 혼재로 판정 — S/N 1대인 O/N에서도 혼재 표시.

---

## Task 7: `ProductionPerformancePage.tsx` — ProcessCell N/A 상태 혼재 마크 표시 (#33-6) ✅ 완료

**파일**: `src/pages/production/ProductionPerformancePage.tsx`

**변경**: `ProcessCell` 컴포넌트의 `total === 0` (N/A) early return에 `partnerDisplay` + `mixed` 렌더링 추가

```tsx
// 변경 전
if (processStatus.total === 0) {
  return <td><span>N/A</span></td>;
}

// 변경 후
if (processStatus.total === 0) {
  return (
    <td>
      <div>
        <span>N/A</span>
        {partnerDisplay && (
          <div>
            <span>{partnerDisplay}</span>
            {mixed && <span>혼재</span>}
          </div>
        )}
      </div>
    </td>
  );
}
```

**이유**: 작업 미착수(progress 0) O/N에서도 협력사 배정은 되어 있으므로 혼재 마크 표시 필요. O/N 6587 (GAIA-I DUAL, 5대: FNI/BAT 혼재) 에서 발견.

---

## Task 8: 빌드 검증 + 기능 테스트

1. `npm run build` — TypeScript 에러 없음 확인
2. `Record<string, ProcessStatus>` 변경 후 FE에서 `order.processes?.MECH`, `order.processes?.TM` 접근이 optional chaining과 호환되는지 확인
3. 기존 `ProcessCell` 컴포넌트 동작 regression 테스트
4. N/A 상태 O/N에서 협력사 + 혼재 마크 표시 확인
5. `sn_count=1` O/N에서 혼재 마크 미표시 확인

---

## 체크리스트

**타입 수정 (완료)**:
- [x] `types/production.ts` — `SNProgress` → `Record<string, ProcessProgress>`
- [x] `types/production.ts` — `OrderGroup.processes` → `Record<string, ProcessStatus>`
- [x] `types/production.ts` — `ProcessStatus`에 `confirmed`, `confirmed_at`, `confirmed_by`, `confirm_id` 추가

**API 변환 (완료)**:
- [x] `api/production.ts` — `getPerformance()` 후처리: `partner_info` 객체 구성 (BE flat → FE 객체)
- [x] `api/production.ts` — `getPerformance()` 후처리: `confirms[]` 배열 변환 (processes 내장 → 배열)

**빌드 검증**:
- [x] `npm run build` 에러 없음
- [x] TypeScript strict 에러 없음

**기능 검증 (배포 후)**:
- [ ] O/N 행 — MECH/ELEC/TM 정상 표시
- [ ] 파트너 표시 — MECH/ELEC 파트너명 정상 렌더링
- [ ] 실적확인 완료 표시 — confirmed=true인 공정에 체크마크 표시

---

# Sprint 13 (VIEW): 생산실적 공정 그룹 탭 분리 — 기구·전장 / TM (2026-03-23) ✅ 완료

> **참조**: OPS_API_REQUESTS.md #35-B
> **배경**: end 기준 전환(#35) 시 주당 O/N이 34→45~60건으로 증가 예상.
> 단일 테이블로는 스크롤 과다 + 일괄확인 페이지 걸침 문제 발생.
> 공정 그룹별 탭 분리(A안)로 각 탭 O/N 30건 내외로 분산 + 담당자별 집중 뷰 제공.

## 선행 조건

- OPS BE #35 배포 완료 (end OR 조건 + `mech_end`, `elec_end`, `module_end` 필드 포함)
- Sprint 12 (TM 실적확인 로직 분리) 배포 완료

## 전체 구조

```
┌──────────────────────────────────────────────────┐
│  [주간 ○]  [월마감]                              │
│                                                   │
│  [W10] [W11] [■ W12] [W13]                       │
│                                                   │
│  ┌─────────────┐  ┌─────────────┐                │
│  │ 기구·전장   │  │ TM(모듈)    │   ← 공정 탭   │
│  └─────────────┘  └─────────────┘                │
│                                                   │
│  ┌─ KPI Cards (탭 기준) ────────────────────────┐│
│  │ 주간 O/N: 34 │ 기구확인: 20/34 │ 전장: 18/34││  (기구·전장 탭)
│  │ 주간 O/N: 27 │ TM확인: 15/27   │ 월간누적   ││  (TM 탭)
│  └──────────────────────────────────────────────┘│
│                                                   │
│  ┌─ 테이블 ────────────────────────────────────┐ │
│  │ 기구·전장 탭: O/N │ 모델 │ S/N │ MECH │ ELEC│ │
│  │ TM 탭:       O/N │ 모델 │ S/N │ TM          │ │
│  └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

## Task 1: `types/production.ts` — `OrderGroup` 타입에 end 필드 추가

**파일**: `app/src/types/production.ts`

```typescript
export interface OrderGroup {
  sales_order: string;
  model: string;
  sns: SNDetail[];
  sn_count: number;
  sn_summary: string;
  partner_info: { mech: string; elec: string; mixed: boolean };
  processes: Record<string, ProcessStatus>;
  confirms: ConfirmRecord[];
  // ↓ NEW: 탭별 필터용 end 날짜 (#35-B)
  mech_end?: string | null;    // 기구 종료일
  elec_end?: string | null;    // 전장 종료일
  module_end?: string | null;  // 모듈 종료일 (TM)
}
```

**이유**: BE #35 응답에 이미 포함된 end 날짜를 FE 타입으로 선언. 탭별 `orders.filter()` 적용 시 사용.

---

## Task 2: `ProductionPerformancePage.tsx` — 공정 탭 state + 탭 UI 추가

**파일**: `app/src/pages/production/ProductionPerformancePage.tsx`

**변경 1**: state 추가 (L248~252 부근)

```typescript
const [activeProcessTab, setActiveProcessTab] = useState<'mech_elec' | 'tm'>('mech_elec');
```

**변경 2**: Toolbar 영역 — 주차 탭과 상태 필터 사이에 공정 탭 삽입

```tsx
{/* 공정 그룹 탭 */}
<div style={{ width: '1px', height: '28px', background: 'var(--gx-mist)' }} />
<div style={{ display: 'flex', background: 'var(--gx-cloud)', borderRadius: '10px', padding: '2px' }}>
  {([
    { key: 'mech_elec', label: '기구·전장' },
    { key: 'tm', label: 'TM(모듈)' },
  ] as const).map(tab => (
    <button key={tab.key} onClick={() => setActiveProcessTab(tab.key)} style={{
      padding: '5px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
      border: 'none', cursor: 'pointer', transition: 'all 0.15s',
      background: activeProcessTab === tab.key ? 'var(--gx-white)' : 'transparent',
      color: activeProcessTab === tab.key ? 'var(--gx-charcoal)' : 'var(--gx-steel)',
      boxShadow: activeProcessTab === tab.key ? 'var(--shadow-card)' : 'none',
    }}>{tab.label}</button>
  ))}
</div>
```

**위치**: 주차 탭 `</div>` (L441) 뒤, 상태 필터 `<select>` (L445) 앞

---

## Task 3: `ProductionPerformancePage.tsx` — 탭별 필터 로직

**파일**: `app/src/pages/production/ProductionPerformancePage.tsx`

**변경**: `filteredOrders` 로직 (L296~) 앞에 탭별 사전 필터 추가

```typescript
// 공정 탭별 O/N 필터
const tabOrders = orders.filter(o => {
  if (activeProcessTab === 'mech_elec') {
    // mech_end 또는 elec_end가 현재 주차에 해당하는 O/N
    // BE가 이미 해당 주차 데이터만 반환하므로, TM-only O/N 제외
    return (o.processes?.MECH?.total ?? 0) > 0 || (o.processes?.ELEC?.total ?? 0) > 0;
  } else {
    // module_end가 현재 주차에 해당하는 O/N (TM task가 있는 것만)
    return (o.processes?.TM?.total ?? 0) > 0;
  }
});

// 기존 statusFilter는 tabOrders 위에 적용
const filteredOrders = tabOrders.filter(o => {
  // ... 기존 statusFilter 로직 유지
});
```

**참고**: BE가 `week` 파라미터로 end OR 조건 전체를 반환하므로, FE 필터는 `processes` 존재 여부로 분기. 추후 BE가 `mech_end`/`module_end` 주차 문자열을 반환하면 정확한 주차 매칭으로 변경 가능.

---

## Task 4: `ProductionPerformancePage.tsx` — KPI 카드 탭별 분기

**파일**: `app/src/pages/production/ProductionPerformancePage.tsx`

**변경**: KPI Cards (L377~398) — 탭에 따라 표시 항목 변경

```tsx
{/* KPI Cards — 탭별 */}
<div style={{ display: 'grid', gridTemplateColumns: activeProcessTab === 'mech_elec' ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
  {activeProcessTab === 'mech_elec' ? [
    { label: '주간 O/N', value: `${tabOrders.length}`, sub: `S/N ${tabOrders.reduce((s, o) => s + o.sn_count, 0)}대`, color: 'var(--gx-info)' },
    { label: '기구 확인', value: `${mechConfirmedInTab}/${tabOrders.length}`, sub: mechReadyInTab > 0 ? `${mechReadyInTab}건 확인 가능` : '대기', color: 'var(--gx-success)' },
    { label: '전장 확인', value: `${elecConfirmedInTab}/${tabOrders.length}`, sub: elecReadyInTab > 0 ? `${elecReadyInTab}건 확인 가능` : '대기', color: '#3B82F6' },
    { label: '월간 누적', value: monthlyMechElec, sub: `${perfData?.month ?? ''} 기구+전장`, color: 'var(--gx-warning)' },
  ] : [
    { label: '주간 O/N (TM)', value: `${tabOrders.length}`, sub: `GAIA ${tabOrders.length}건`, color: 'var(--gx-info)' },
    { label: 'TM 확인', value: `${tmConfirmedInTab}/${tabOrders.length}`, sub: tmReadyInTab > 0 ? `${tmReadyInTab}건 확인 가능` : '대기', color: 'var(--gx-accent)' },
    { label: '월간 누적', value: monthlyTm, sub: `${perfData?.month ?? ''} TM`, color: 'var(--gx-warning)' },
  ]).map(k => (
    // ... 기존 KPI 카드 렌더링 동일
  ))}
</div>
```

**KPI 산출 변수**: `tabOrders` 기반으로 재계산 (mechConfirmedInTab, elecConfirmedInTab, tmConfirmedInTab 등)

---

## Task 5: `ProductionPerformancePage.tsx` — 테이블 헤더/칼럼 탭별 표시

**파일**: `app/src/pages/production/ProductionPerformancePage.tsx`

**변경 1**: 테이블 헤더 (L507~517)

```tsx
<tr style={{ background: 'var(--gx-cloud)' }}>
  {[
    '', 'O/N', '모델', 'S/N',
    ...(activeProcessTab === 'mech_elec'
      ? ['기구 (MECH)', '전장 (ELEC)']
      : ['TM']),
  ].map((h, i) => (
    <th key={h + i} style={{ /* 기존 스타일 */ }}>{h}</th>
  ))}
</tr>
```

**변경 2**: O/N 행 — ProcessCell 조건부 렌더링 (L560~591)

```tsx
{/* 기구·전장 탭일 때만 */}
{activeProcessTab === 'mech_elec' && (
  <>
    <ProcessCell processType="MECH" ... />
    <ProcessCell processType="ELEC" ... />
  </>
)}
{/* TM 탭일 때만 */}
{activeProcessTab === 'tm' && (
  <ProcessCell processType="TM" ... />
)}
```

**변경 3**: S/N 상세 행 (L610~629) — 동일하게 progress 칼럼 조건부

```tsx
{activeProcessTab === 'mech_elec' && (
  <>
    <td>/* MECH progress */</td>
    <td>/* ELEC progress */</td>
  </>
)}
{activeProcessTab === 'tm' && (
  <td>/* TM progress */</td>
)}
```

---

## Task 6: `ProductionPerformancePage.tsx` — 일괄확인 버튼 탭별 표시

**파일**: `app/src/pages/production/ProductionPerformancePage.tsx`

**변경**: 일괄확인 버튼 (L454~475) — 탭에 해당하는 공정만 표시

```tsx
{activeProcessTab === 'mech_elec' && (mechReadyInTab > 0 || elecReadyInTab > 0) && (
  <>
    {mechReadyInTab > 0 && <button onClick={() => handleBatchConfirm('MECH')}>기구 일괄확인 ({mechReadyInTab}건)</button>}
    {elecReadyInTab > 0 && <button onClick={() => handleBatchConfirm('ELEC')}>전장 일괄확인 ({elecReadyInTab}건)</button>}
  </>
)}
{activeProcessTab === 'tm' && tmReadyInTab > 0 && (
  <button onClick={() => handleBatchConfirm('TM')}>TM 일괄확인 ({tmReadyInTab}건)</button>
)}
```

---

## Task 7: 단위 테스트 — 순수 로직 추출 + 테스트 작성

> **방침**: VIEW는 표시 레이어이므로 순수 로직 단위 테스트만 진행.
> OPS처럼 화이트+그레이 박스는 불필요. mock 데이터 → 함수 output 검증.
> 스프린트마다 기존 테스트 전체 regression 실행.

**테스트 환경 설정** (최초 1회):

```bash
cd app && npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom --save-dev
```

`vite.config.ts`에 test 설정 추가:
```typescript
/// <reference types="vitest" />
export default defineConfig({
  // ... 기존 설정
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

`app/src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

---

**7-1. 순수 로직 추출** — `utils/productionFilters.ts` (신규)

현재 `ProductionPerformancePage.tsx` 안에 인라인으로 있는 필터/산출 로직을 순수 함수로 분리:

```typescript
// app/src/utils/productionFilters.ts
import type { OrderGroup } from '@/types/production';

/** 공정 탭별 O/N 필터 */
export function filterByProcessTab(
  orders: OrderGroup[],
  tab: 'mech_elec' | 'tm'
): OrderGroup[] {
  if (tab === 'mech_elec') {
    return orders.filter(o =>
      (o.processes?.MECH?.total ?? 0) > 0 || (o.processes?.ELEC?.total ?? 0) > 0
    );
  }
  return orders.filter(o => (o.processes?.TM?.total ?? 0) > 0);
}

/** 상태 필터 */
export function filterByStatus(
  orders: OrderGroup[],
  status: 'all' | 'done' | 'pending'
): OrderGroup[] {
  if (status === 'all') return orders;
  if (status === 'done') {
    return orders.filter(o => {
      const hasAll = (['MECH', 'ELEC'] as const).every(
        pt => (o.confirms ?? []).some(c => c.process_type === pt)
      );
      const tmDone = (o.processes?.TM?.total ?? 0) === 0
        || (o.confirms ?? []).some(c => c.process_type === 'TM');
      return hasAll && tmDone;
    });
  }
  // pending
  return orders.filter(o => {
    const hasAll = (['MECH', 'ELEC'] as const).every(
      pt => (o.confirms ?? []).some(c => c.process_type === pt)
    );
    const tmDone = (o.processes?.TM?.total ?? 0) === 0
      || (o.confirms ?? []).some(c => c.process_type === 'TM');
    return !(hasAll && tmDone);
  });
}

/** KPI 산출 — 탭별 확인 카운트 */
export function calcTabKpi(orders: OrderGroup[], tab: 'mech_elec' | 'tm') {
  if (tab === 'mech_elec') {
    return {
      totalON: orders.length,
      totalSN: orders.reduce((s, o) => s + o.sn_count, 0),
      mechConfirmed: orders.filter(o =>
        (o.confirms ?? []).some(c => c.process_type === 'MECH')).length,
      elecConfirmed: orders.filter(o =>
        (o.confirms ?? []).some(c => c.process_type === 'ELEC')).length,
      mechReady: orders.filter(o =>
        o.processes?.MECH?.confirmable && !(o.confirms ?? []).some(c => c.process_type === 'MECH')).length,
      elecReady: orders.filter(o =>
        o.processes?.ELEC?.confirmable && !(o.confirms ?? []).some(c => c.process_type === 'ELEC')).length,
    };
  }
  return {
    totalON: orders.length,
    totalSN: orders.reduce((s, o) => s + o.sn_count, 0),
    tmConfirmed: orders.filter(o =>
      (o.confirms ?? []).some(c => c.process_type === 'TM')).length,
    tmReady: orders.filter(o =>
      o.processes?.TM?.confirmable && !(o.confirms ?? []).some(c => c.process_type === 'TM')).length,
  };
}

/** 공정 활성화 여부 */
export function isProcessEnabled(
  settings: Record<string, unknown> | undefined,
  processType: string
): boolean {
  const key = `confirm_${processType.toLowerCase()}_enabled`;
  return settings?.[key] !== false;
}
```

---

**7-2. 테스트 파일** — `utils/productionFilters.test.ts` (신규)

```typescript
// app/src/utils/productionFilters.test.ts
import { describe, it, expect } from 'vitest';
import { filterByProcessTab, filterByStatus, calcTabKpi, isProcessEnabled } from './productionFilters';
import type { OrderGroup } from '@/types/production';

// ── mock 데이터 ──
const mockOrders: OrderGroup[] = [
  {
    sales_order: '6400', model: 'GAIA-L', sn_count: 3,
    sns: [], sn_summary: '6855~6857',
    partner_info: { mech: 'A사', elec: 'B사', mixed: false },
    processes: {
      MECH: { ready: 3, total: 3, confirmable: true },
      ELEC: { ready: 3, total: 3, confirmable: true },
      TM:   { ready: 2, total: 3, confirmable: false },
    },
    confirms: [{ id: 1, process_type: 'MECH', confirmed_week: 'W12', confirmed_by: 'admin', confirmed_at: '2026-03-23' }],
  },
  {
    sales_order: '6500', model: 'SWS-JP', sn_count: 2,
    sns: [], sn_summary: '6900~6901',
    partner_info: { mech: 'C사', elec: 'D사', mixed: false },
    processes: {
      MECH: { ready: 2, total: 2, confirmable: true },
      ELEC: { ready: 2, total: 2, confirmable: false },
      // TM 없음 (비GAIA)
    },
    confirms: [],
  },
];

describe('filterByProcessTab', () => {
  it('mech_elec 탭: MECH 또는 ELEC가 있는 O/N만 반환', () => {
    const result = filterByProcessTab(mockOrders, 'mech_elec');
    expect(result).toHaveLength(2);  // 둘 다 MECH/ELEC 있음
  });

  it('tm 탭: TM task가 있는 O/N만 반환', () => {
    const result = filterByProcessTab(mockOrders, 'tm');
    expect(result).toHaveLength(1);  // 6400만 TM 있음
    expect(result[0].sales_order).toBe('6400');
  });
});

describe('filterByStatus', () => {
  it('all: 전체 반환', () => {
    expect(filterByStatus(mockOrders, 'all')).toHaveLength(2);
  });

  it('pending: 미완료 포함 O/N만', () => {
    const result = filterByStatus(mockOrders, 'pending');
    expect(result).toHaveLength(2);  // 둘 다 미완료
  });
});

describe('calcTabKpi', () => {
  it('mech_elec 탭: 기구/전장 확인 카운트', () => {
    const kpi = calcTabKpi(mockOrders, 'mech_elec') as any;
    expect(kpi.totalON).toBe(2);
    expect(kpi.mechConfirmed).toBe(1);  // 6400만 MECH 확인됨
    expect(kpi.elecConfirmed).toBe(0);
  });

  it('tm 탭: TM 확인 카운트', () => {
    const tmOrders = filterByProcessTab(mockOrders, 'tm');
    const kpi = calcTabKpi(tmOrders, 'tm') as any;
    expect(kpi.totalON).toBe(1);
    expect(kpi.tmConfirmed).toBe(0);
  });
});

describe('isProcessEnabled', () => {
  it('설정 ON → true', () => {
    expect(isProcessEnabled({ confirm_mech_enabled: true }, 'MECH')).toBe(true);
  });

  it('설정 OFF → false', () => {
    expect(isProcessEnabled({ confirm_tm_enabled: false }, 'TM')).toBe(false);
  });

  it('설정 없음(undefined) → true (default)', () => {
    expect(isProcessEnabled(undefined, 'MECH')).toBe(true);
  });
});
```

---

**7-3. 기존 변환 로직 테스트** — `api/production.test.ts` (신규)

`api/production.ts`의 BE→FE 변환 로직(partner_info, confirms, mixed 판정) 테스트.
API 호출은 mock, 변환 결과만 검증.

**테스트 케이스**:

| # | 테스트 | 검증 |
|---|--------|------|
| 1 | partner_info 변환 — BE flat → FE 객체 | `{ mech, elec, mixed }` 정상 생성 |
| 2 | mixed 판정 — S/N 2대, 기구 협력사 다름 | `mixed: true` |
| 3 | mixed 판정 — S/N 1대 | `mixed: false` (항상) |
| 4 | confirms 변환 — processes 내 confirmed → ConfirmRecord[] | 배열 길이 + process_type 일치 |

---

**7-4. `package.json` 스크립트 추가**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

---

## Task 8: 빌드 + Regression 테스트 실행

```bash
cd app && npm run build && npm run test
```

- [x] 빌드 에러 없음
- [x] TS 타입 에러 없음
- [x] 전체 테스트 통과 (신규 + 기존 regression)

---

## 체크리스트

**코드 수정**:
- [x] `types/production.ts` — `OrderGroup`에 `mech_end`, `elec_end`, `module_end` 추가
- [x] `ProductionPerformancePage.tsx` — `activeProcessTab` state 추가
- [x] `ProductionPerformancePage.tsx` — 공정 탭 UI (주간/월마감 토글과 동일 스타일)
- [x] `ProductionPerformancePage.tsx` — `tabOrders` 필터 로직
- [x] `ProductionPerformancePage.tsx` — KPI 카드 탭별 분기
- [x] `ProductionPerformancePage.tsx` — 테이블 헤더 탭별 칼럼
- [x] `ProductionPerformancePage.tsx` — ProcessCell 탭별 표시
- [x] `ProductionPerformancePage.tsx` — S/N 상세 행 탭별 표시
- [x] `ProductionPerformancePage.tsx` — 일괄확인 버튼 탭별 표시

**테스트**:
- [x] vitest + jsdom 환경 구성
- [x] `utils/productionFilters.ts` — 순수 로직 추출
- [x] `utils/productionFilters.test.ts` — 탭 필터, 상태 필터, KPI 산출, 권한 분기 테스트
- [x] `api/production.test.ts` — BE→FE 변환 로직 테스트
- [x] `npm run build` 통과
- [x] `npm run test` 전체 통과 (regression)

**기능 검증 (배포 후)**:
- [ ] 기구·전장 탭: MECH/ELEC 칼럼만 표시, TM 숨김
- [ ] TM 탭: TM 칼럼만 표시, MECH/ELEC 숨김
- [ ] 탭 전환 시 KPI 카운트가 해당 탭 O/N 수와 일치
- [ ] 일괄확인 — 현재 탭의 O/N만 대상
- [ ] 상태 필터(전체/완료/미완료) — 탭 필터 위에 정상 동작
- [ ] 월마감 뷰 — 탭 영향 없음 (기존 그대로)
- [ ] 모바일/반응형 — 탭 UI 줄바꿈 정상

## 규칙 — Sprint 13
- G-AXIS Design System 토큰 사용 — `var(--gx-mist)`, `var(--gx-snow)`, `var(--gx-cloud)`, `var(--gx-accent)` 등 (존재하지 않는 토큰 사용 금지)
- `types/production.ts`의 `OrderGroup` 인터페이스에 `mech_end`, `elec_end`, `module_end` 추가 — BE #35 응답 필드와 정확히 일치시킬 것
- `tabOrders` 필터는 `processes` 존재 여부로 분기 — BE가 이미 해당 주차 데이터만 반환하므로 FE에서 날짜 파싱 불필요
- KPI 산출 변수는 반드시 `tabOrders` 기반으로 재계산 — 기존 `orders` 기반 변수와 혼용 금지
- 순수 로직은 `utils/productionFilters.ts`로 추출 — 페이지 컴포넌트 내 인라인 로직 최소화
- 스프린트에서 변경하는 로직의 테스트를 해당 스프린트 Task에 포함
- 스프린트 완료 시 `npm run test` 전체 실행 — 기존 테스트 포함 regression
- 테스트 실패 시 해당 스프린트에서 수정 후 머지
- ⚠️ BE 코드 수정 금지 — BE는 #35 그대로, FE 필터링 방식. 변경 필요 시 OPS_API_REQUESTS.md로 요청 전달
- ⚠️ 월마감 뷰 변경 금지 — 공정 탭은 주간 뷰에만 적용
- ⚠️ 실적확인 로직(confirm/cancel) 변경 금지 — `handleConfirm`, `handleBatchConfirm` 시그니처만 변경 허용
- ⚠️ `api/production.ts` 변환 로직 변경 금지 — partner_info, confirms 변환은 Sprint 14에서 진행
- ⚠️ `ConfirmSettingsPanel` 변경 금지 — Sprint 15에서 진행
- ⚠️ 테스트에서 실제 API 호출 금지 (mock only — DB/BE 무영향)
- ⚠️ `.env` 파일 절대 커밋 금지
- 완료 시 DESIGN_FIX_SPRINT.md 체크리스트 업데이트

---

# Sprint 12 — TM 실적확인 로직 분리 (OPS BE) (2026-03-23)

> **참조**: OPS_API_REQUESTS.md #36, AGENT_TEAM_LAUNCH.md "TM 실적확인 로직 분리"
> **배경**: 가압검사(PRESSURE_TEST)가 TMS(협력사) + PI(GST 내부) 2회 중복 수행 중 (공정 안정화).
> TM 실적확인은 TANK_MODULE만 기준이어야 하나, 기존 코드가 TMS 카테고리 전체를 체크하여 PRESSURE_TEST 미완 시 confirmable=false 발생.

## Task 1: `_calc_sn_progress()` — task_id 레벨 데이터 확장 (#36) ✅ 완료

**파일**: `AXIS-OPS/backend/app/routes/production.py`

**변경**: SQL `GROUP BY serial_number, task_category` → `GROUP BY serial_number, task_category, task_id`

```python
# 변경 전
GROUP BY serial_number, task_category

# 변경 후
GROUP BY serial_number, task_category, task_id
```

반환 구조 변경:
```python
# 변경 전
{sn: {cat: {total, completed, pct}}}

# 변경 후
{sn: {cat: {total, completed, pct, tasks: {task_id: {total, completed}}}}}
```

카테고리 레벨 `total`/`completed`는 Python 합산으로 유지 — `_build_order_item()`의 progress 집계, S/N 상세 배열 등 기존 소비자 코드 변경 불필요.

**이유**: confirmable, 추후 `tm_pressure_test_required` 옵션, 알람 트리거 등에서 task_id별 필터링을 동일 데이터소스로 처리. 별도 쿼리 분리 시 중복·동기화 이슈 발생.

---

## Task 2: `_is_process_confirmable()` — TMS→TANK_MODULE only (#36) ✅ 완료

**파일**: `AXIS-OPS/backend/app/routes/production.py`

**변경**: `_CONFIRM_TASK_FILTER` 매핑 추가 + confirmable 분기

```python
# 신규 추가
_CONFIRM_TASK_FILTER: Dict[str, str] = {
    'TMS': 'TANK_MODULE',  # TMS 실적확인 = TANK_MODULE만
}

# _is_process_confirmable() 내부 분기
confirm_task = _CONFIRM_TASK_FILTER.get(process_type)
if confirm_task:
    # task_id 레벨 체크 (TMS → TANK_MODULE만)
    task_data = cat_data.get('tasks', {}).get(confirm_task, {})
else:
    # 카테고리 전체 체크 (기존 동작)
```

**동작 변경**:

| 시나리오 | 변경 전 | 변경 후 |
|---------|---------|---------|
| TM: TANK_MODULE ✅ / PRESSURE_TEST ❌ | `confirmable=false` (1<2) | `confirmable=true` (TANK_MODULE 1/1 ✅) |
| TM: TANK_MODULE ❌ / PRESSURE_TEST ✅ | `confirmable=false` (1<2) | `confirmable=false` (TANK_MODULE 0/1 ❌) |
| TM: 둘 다 ✅ | `confirmable=true` | `confirmable=true` |
| MECH/ELEC/PI/QI/SI | 카테고리 전체 체크 | 변경 없음 |

**이유**: 실적확인 = 협력사 실적 정산 근거. TANK_MODULE = 협력사 작업 범위. PRESSURE_TEST = TMS 공정 progress에는 포함되지만 실적 정산과 무관.

---

## Task 3: `_build_order_item()` — future-ready 주석 (#36) ✅ 완료

**파일**: `AXIS-OPS/backend/app/routes/production.py`

**변경**: `tm_pressure_test_required` 옵션 구현 시 progress 집계 분기 위치에 주석 추가

현재 progress는 TMS 카테고리 전체(TANK_MODULE + PRESSURE_TEST) 합산. 추후 `tm_pressure_test_required=false` 시 `tasks` dict에서 TANK_MODULE만 합산하도록 분기 추가 예정.

---

## 체크리스트

**코드 수정 (완료)**:
- [x] `_calc_sn_progress()` — task_id 레벨 GROUP BY + tasks dict 반환
- [x] `_CONFIRM_TASK_FILTER` 매핑 추가
- [x] `_is_process_confirmable()` — TMS→TANK_MODULE 분기
- [x] `_build_order_item()` — future-ready 주석

**기능 검증 (배포 후)**:
- [ ] TM `1/2` (TANK_MODULE ✅, PRESSURE_TEST ❌) 상태에서 실적확인 버튼 활성
- [ ] TM progress `1/2` 정상 표시 (PRESSURE_TEST 포함)
- [ ] MECH/ELEC/PI/QI/SI confirmable 기존 동작 regression 없음
- [ ] `confirm_production()` TM 실적확인 정상 처리 (TM→TMS 역매핑 + TANK_MODULE만 체크)

---

# Sprint 14: 혼재 O/N partner별 실적확인 UI (#37) ✅ 완료

> **참조**: OPS_API_REQUESTS.md #37, AXIS-OPS AGENT_TEAM_LAUNCH.md Sprint 37
> **선행**: OPS BE Sprint 37 완료 (partner별 confirm API + partner_confirms 응답)
> **대상**: `ProductionPerformancePage.tsx`, `types/production.ts`

## 배경

혼재 O/N(같은 주문에 MECH/ELEC/TM 협력사가 2개 이상 혼합)에서 실적확인을 partner별로 분리.
현재 ProcessCell은 O/N 단위 실적확인 버튼 1개 → 혼재 시 partner별 개별 버튼으로 변경.

BE API 응답 변경점:
- `processes.MECH` 등에 `mixed: boolean`, `partner_confirms: PartnerConfirm[] | null` 추가
- 비혼재: `mixed=false`, `partner_confirms=null` → 기존 `confirmable/confirmed` 사용
- 혼재: `mixed=true`, `partner_confirms` 배열 → partner별 `confirmable/confirmed` 개별 관리

## Task 1: 타입 추가 (`types/production.ts`)

```typescript
export interface PartnerConfirm {
  partner: string;           // 'TMS', 'FNI' 등
  sn_count: number;
  total: number;
  completed: number;
  confirmable: boolean;
  confirmed: boolean;
  confirmed_at: string | null;
  confirm_id: number | null;
}

export interface ProcessStatus {
  ready: number;
  total: number;
  completed?: number;
  pct?: number;
  checklist_ready?: number;
  confirmable: boolean;
  confirmed?: boolean;
  confirmed_at?: string | null;
  confirmed_by?: string | null;
  confirm_id?: number | null;
  mixed?: boolean;                          // ← NEW
  partner_confirms?: PartnerConfirm[] | null; // ← NEW
}

export interface ConfirmRequest {
  sales_order: string;
  process_type: 'MECH' | 'ELEC' | 'TM';
  partner?: string | null;    // ← NEW (혼재 시 partner 지정)
  confirmed_week: string;
  confirmed_month: string;
}

export interface CancelConfirmResponse {
  success: boolean;
  deleted_id: number;
  sales_order: string;
  process_type: string;
  confirmed_week: string;
  partner?: string | null;    // ← NEW
}
```

---

## Task 2: ProcessCell 컴포넌트 수정

현재: `onConfirm: () => void` — O/N 단위 1개 버튼
변경: 혼재 시 `partner_confirms` 배열 순회하여 partner별 버튼 렌더링

**Props 변경**:
```typescript
function ProcessCell({ processType, processStatus, confirms, partnerDisplay, mixed, onConfirm, confirmPending, enabled = true }: {
  processType: 'MECH' | 'ELEC' | 'TM';
  processStatus: ProcessStatus;  // ← mixed, partner_confirms 포함
  confirms: ConfirmRecord[];
  partnerDisplay: string;
  mixed: boolean;
  onConfirm: (partner?: string) => void;  // ← partner 파라미터 추가
  confirmPending: boolean;
  enabled?: boolean;
})
```

**렌더링 분기**:

```
비혼재 (기존 유지):                혼재 (partner_confirms 렌더링):
┌──────────────────────┐          ┌──────────────────────────┐
│ 6/6  ✅ 확인          │          │ 0/12                      │  ← 전체 합산 (ready/total)
│ TMS                   │          │ TMS 혼재                  │
└──────────────────────┘          │ ┌────────────────────┐    │
                                   │ │ TMS (1대) [실적확인]│    │  ← partner_confirms[0]
                                   │ │ FNI (4대)  ✅ 확인  │    │  ← partner_confirms[1]
                                   │ └────────────────────┘    │
                                   └──────────────────────────┘
```

**혼재 시 partner별 버튼 로직**:
- `partner_confirms` 순회
- 각 partner: `confirmable=true` && `confirmed=false` → 실적확인 버튼 표시
- 각 partner: `confirmed=true` → ✅ 확인 배지 표시
- 버튼 클릭 시 `onConfirm(partner.partner)` 호출

---

## Task 3: handleConfirm / handleBatchConfirm 수정

**handleConfirm**:
```typescript
const handleConfirm = (salesOrder: string, processType: 'MECH' | 'ELEC' | 'TM', partner?: string) => {
  confirmMutation.mutate({
    sales_order: salesOrder,
    process_type: processType,
    partner: partner ?? null,   // ← NEW
    confirmed_week: perfData?.week ?? '',
    confirmed_month: perfData?.month ?? '',
  });
};
```

**handleBatchConfirm**: 혼재 O/N은 일괄 확인 대상에서 제외 (partner별 개별 확인 필요)
```typescript
const handleBatchConfirm = async (processType: 'MECH' | 'ELEC' | 'TM') => {
  const confirmable = tabOrders.filter(o => {
    const proc = o.processes[processType];
    if (!proc) return false;
    // 혼재 O/N은 일괄 확인 제외 — partner별 개별 확인 필요
    if (proc.mixed && proc.partner_confirms) return false;
    return proc.confirmable && !(o.confirms ?? []).some(c => c.process_type === processType);
  });
  // ... 기존 로직
};
```

---

## Task 4: ProcessCell 호출부 수정 (`<ProcessCell>` props)

**MECH/ELEC** (line 606~625):
```tsx
<ProcessCell
  processType="MECH"
  processStatus={(order.processes?.MECH ?? { ready: 0, total: 0, confirmable: false })}
  confirms={order.confirms ?? []}
  partnerDisplay={(order.partner_info?.mech ?? '—')}
  mixed={(order.processes?.MECH?.mixed ?? false)}   // ← partner_info.mixed → processes.MECH.mixed
  onConfirm={(partner) => handleConfirm(order.sales_order, 'MECH', partner)}  // ← partner 전달
  confirmPending={confirmMutation.isPending}
  enabled={isProcessEnabled('MECH')}
/>
```

**TM** (line 630~639):
```tsx
<ProcessCell
  processType="TM"
  processStatus={(order.processes?.TM ?? { ready: 0, total: 0, confirmable: false })}
  confirms={order.confirms ?? []}
  partnerDisplay=""
  mixed={(order.processes?.TM?.mixed ?? false)}   // ← BE에서 TM 혼재 판정
  onConfirm={(partner) => handleConfirm(order.sales_order, 'TM', partner)}  // ← partner 전달
  confirmPending={confirmMutation.isPending}
  enabled={isProcessEnabled('TM')}
/>
```

주의: `mixed` 값을 `order.partner_info.mixed`가 아닌 `order.processes.{proc}.mixed`에서 가져옴 — BE가 공정별 mixed 판정을 내려줌.

---

## Task 5: 탭 헤더 confirmable 카운트 수정

현재 (line 299~302):
```typescript
const mechReadyInTab = tabOrders.filter(o => o.processes?.MECH?.confirmable && ...).length;
```

혼재 O/N: `confirmable=null` (개별은 `partner_confirms`에 있음) → 카운트 로직 수정 필요

```typescript
const mechReadyInTab = tabOrders.filter(o => {
  const proc = o.processes?.MECH;
  if (!proc) return false;
  if (proc.mixed && proc.partner_confirms) {
    // 혼재: partner 중 하나라도 confirmable이면 카운트
    return proc.partner_confirms.some(pc => pc.confirmable && !pc.confirmed);
  }
  return proc.confirmable && !(o.confirms ?? []).some(c => c.process_type === 'MECH');
}).length;
```

---

## Task 6: 테스트 + 빌드

- [x] `npm run build` 통과
- [x] `npm run test` regression 통과 (20/20)
- [x] ProcessCell 혼재 렌더링 — partner_confirms 배열 순회 + 개별 버튼
- [x] ProcessCell 비혼재 — 기존 동작 유지 (partner_confirms=null)
- [x] handleConfirm partner 전달 정상
- [x] handleBatchConfirm 혼재 제외 정상
- [x] 탭 헤더 카운트 혼재 반영

---

## 체크리스트

**FE (완료)**:
- [x] `types/production.ts` — `PartnerConfirm` 인터페이스 + `ProcessStatus` mixed/partner_confirms 추가
- [x] `types/production.ts` — `ConfirmRequest` partner 필드 추가
- [x] `ProcessCell` — 혼재 시 partner별 버튼 렌더링 분기
- [x] `handleConfirm()` — partner 파라미터 전달
- [x] `handleBatchConfirm()` — 혼재 O/N 제외
- [x] `ProcessCell` 호출부 — `mixed` props를 `processes.{proc}.mixed`에서 가져오기
- [x] 탭 헤더 confirmable 카운트 — 혼재 partner_confirms 반영
- [x] 테스트 + 빌드 통과

**검증 (배포 후 실기기)**:
- [ ] 🔴 혼재 O/N(6520 GAIA-I) — MECH에서 TMS/FNI partner별 버튼 개별 표시
- [ ] 🔴 partner별 실적확인 클릭 → 해당 partner만 confirmed 처리
- [ ] 🔴 TM 혼재 시 partner별 분리 표시
- [ ] 비혼재 O/N — 기존 단일 버튼 유지
- [ ] 일괄 실적확인 — 혼재 O/N 제외 동작
- [ ] 탭 헤더 카운트 정상

---

## 규칙 — Sprint 13
- `types/production.ts`의 `ProcessStatus`에 `mixed`, `partner_confirms` 필드 이미 추가됨 — 타입 중복 선언 금지
- `types/production.ts`의 `ConfirmRequest`에 `partner` 필드 이미 추가됨 — 타입 중복 선언 금지
- `types/production.ts`의 `CancelConfirmResponse`에 `partner` 필드 이미 추가됨 — 타입 중복 선언 금지
- `mixed` 판정은 BE `processes.{proc}.mixed`에서 가져옴 — `order.partner_info.mixed`와 혼동 금지 (partner_info.mixed는 O/N 레벨, processes.mixed는 공정 레벨)
- `partner_confirms=null`이면 기존 `confirmable/confirmed` 사용 — 하위호환 필수
- confirm API 호출 시 비혼재는 `partner: null`, 혼재는 `partner: 'TMS'` 등 명시적 전달
- 일괄확인(`handleBatchConfirm`)은 혼재 O/N 제외 — partner별 개별 확인 필요하므로 일괄 대상에서 자동 제외
- 혼재 ProcessCell 렌더링: partner_confirms 배열 순회 → 각 partner에 개별 버튼/배지 표시
- G-AXIS Design System 토큰 사용 — `var(--gx-mist)`, `var(--gx-snow)`, `var(--gx-graphite)` 등 (존재하지 않는 토큰 사용 금지)
- TM 그룹 박스 parent 의존성: `confirm_tm_enabled=false` → `tm_pressure_test_required` 토글 disabled + opacity 처리
- 스프린트에서 변경하는 로직의 테스트를 해당 스프린트 Task에 포함
- 스프린트 완료 시 `npm run test` 전체 실행 — 기존 테스트 포함 regression
- 테스트 실패 시 해당 스프린트에서 수정 후 머지
- ⚠️ BE 코드 수정 금지 — OPS Sprint 37/37-A에서 진행. 변경 필요 시 OPS_API_REQUESTS.md로 요청 전달
- ⚠️ `utils/productionFilters.ts`의 기존 함수(`filterByProcessTab`, `filterByStatus`, `calcTabKpi`, `isProcessEnabled`) 시그니처 변경 금지
- ⚠️ 월마감 뷰 변경 금지
- ⚠️ 테스트에서 실제 API 호출 금지 (mock only — DB/BE 무영향)
- ⚠️ `.env` 파일 절대 커밋 금지
- 완료 시 DESIGN_FIX_SPRINT.md 체크리스트 업데이트

---

# Sprint 15 (VIEW + OPS BE): #36-C TM 가압검사 옵션 — ConfirmSettingsPanel + BE 분기 (2026-03-23) ✅ FE 완료

> **참조**: OPS_API_REQUESTS.md #36-C
> **목적**: 추후 설비 변경 시 코드 배포 없이 admin 설정만으로 가압검사 포함 여부를 제어할 수 있도록 **미리 구현**
> **선행**: OPS BE `admin_settings` 테이블에 `tm_pressure_test_required` 키 추가 (migration)
> **default**: `true` (현재 동작 유지 — 가압검사 포함). 설비 변경 시 admin이 `false`로 토글 → 배포 불필요

## 배경

현재 TM 공정은 TANK_MODULE + PRESSURE_TEST 2개 task가 존재하며, 가압검사는 TMS(협력사) + PI(GST 내부) 2회 수행 중 (공정 안정화).
추후 설비 변경 시 가압검사가 1회로 줄어들면, `tm_pressure_test_required` 옵션으로 progress/알람 trigger에 가압검사 포함 여부를 제어해야 함.

## 설계 (확정)

**ConfirmSettingsPanel UI** — TM 그룹 박스 구조 (v2):

```
┌─ 실적확인 설정 ──────────────── ✕ ─┐
│                                      │
│ 공정별 실적확인                      │
│  기구 (MECH)              [toggle]   │
│  전장 (ELEC)              [toggle]   │
│                                      │
│  Tank Module               ← 그룹 헤더
│  ┌───────────────────────────────┐   │
│  │ * 실적처리: Tank Module       │   │  ← 고정 (default, 항상 활성)
│  │   (TM 실적확인)    [toggle]   │   │  ← confirm_tm_enabled
│  │                               │   │
│  │ * Progress / 알람 trigger     │   │
│  │   가압검사 포함     [toggle]   │   │  ← tm_pressure_test_required (NEW)
│  │   ON : 가압검사 완료까지      │   │
│  │        progress·알람에 반영    │   │
│  │   OFF: 탱크모듈만으로 완료    │   │
│  └───────────────────────────────┘   │
│                                      │
│  PI                       [toggle]   │
│  QI                       [toggle]   │
│  SI                       [toggle]   │
│ ──────────────────────────────────── │
│  체크리스트 필수           [toggle]   │
│  자주검사 완료 시에만 실적확인 가능  │
└──────────────────────────────────────┘
```

**UI 동작 규칙**:

| 조건 | 동작 |
|------|------|
| TM 그룹 내 `confirm_tm_enabled` | TM 실적확인 ON/OFF — 기존과 동일 |
| TM 그룹 내 `tm_pressure_test_required` | Progress·알람에 가압검사 포함 여부 |
| `confirm_tm_enabled = false` | 가압검사 포함 토글도 disabled + 회색 처리 |

## Task 1 (OPS BE): `admin_settings` migration

```sql
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES ('tm_pressure_test_required', 'true', 'TM 가압검사 progress/알람 포함 여부')
ON CONFLICT (setting_key) DO NOTHING;
```

- default `true` (현재 동작 유지 — 가압검사 포함)

---

## Task 2 (OPS BE): `production.py` — settings 기반 TM task 필터링

`_build_order_item()` 내 progress 집계에서 `tm_pressure_test_required=false` 시 TANK_MODULE만 합산.
`_calc_sn_progress()` 결과의 `tasks` dict에서 분기.

---

## Task 3 (OPS BE): 알람 핸들러 — settings 기반 트리거 분기

현재: TM 2/2 (TANK_MODULE + PRESSURE_TEST 둘 다 완료) → mech_partner 알람.
변경: `tm_pressure_test_required=false` 시 TANK_MODULE만 완료 → 알람 트리거.

---

## Task 4 (VIEW FE): `AdminSettingsResponse` 타입 추가

**파일**: `app/src/api/adminSettings.ts`

```typescript
export interface AdminSettingsResponse {
  confirm_mech_enabled: boolean;
  confirm_elec_enabled: boolean;
  confirm_tm_enabled: boolean;
  tm_pressure_test_required: boolean;   // ← NEW
  confirm_pi_enabled: boolean;
  confirm_qi_enabled: boolean;
  confirm_si_enabled: boolean;
  confirm_checklist_required: boolean;
  [key: string]: unknown;
}
```

---

## Task 5 (VIEW FE): ConfirmSettingsPanel — TM 그룹 박스 UI

**파일**: `app/src/pages/production/ProductionPerformancePage.tsx`

TOGGLES 배열을 3개로 분리 + TM 그룹 박스 렌더링:

```tsx
const PROCESS_TOGGLES = [
  { key: 'confirm_mech_enabled', label: '기구 (MECH)' },
  { key: 'confirm_elec_enabled', label: '전장 (ELEC)' },
];

const TM_GROUP = {
  header: 'Tank Module',
  items: [
    {
      key: 'confirm_tm_enabled',
      label: 'TM 실적확인',
      category: '실적처리: Tank Module',
    },
    {
      key: 'tm_pressure_test_required',
      label: '가압검사 포함',
      category: 'Progress / 알람 trigger',
      parent: 'confirm_tm_enabled',
      description: 'ON: 가압검사 완료까지 반영 / OFF: 탱크모듈만',
    },
  ],
};

const REMAINING_TOGGLES = [
  { key: 'confirm_pi_enabled', label: 'PI' },
  { key: 'confirm_qi_enabled', label: 'QI' },
  { key: 'confirm_si_enabled', label: 'SI' },
];
```

TM 그룹 박스 렌더링: `border: 1px solid var(--gx-mist)`, `borderRadius: 6px`, `background: var(--gx-snow)`, 그룹 헤더(`color: var(--gx-graphite)`) + items 반복, parent 의존성 disabled/opacity 처리.

> **참고**: G-AXIS Design System 토큰 사용 — `var(--gx-border)`, `var(--gx-bg-subtle)` 등은 존재하지 않으므로 `var(--gx-mist)`, `var(--gx-snow)`, `var(--gx-graphite)` 등을 사용할 것.

---

## Task 6: 테스트 + 빌드

- [x] `utils/productionFilters.test.ts` — `isProcessEnabled`에 `tm_pressure_test_required` 케이스 추가
- [ ] TM 그룹 렌더링 — parent disabled 상태 검증 (배포 후 실기기)
- [x] `npm run build` 통과
- [x] `npm run test` regression 통과 (22/22)

---

## 구현 순서

1. OPS BE: Task 1 (migration) → Task 2 (progress 분기) → Task 3 (알람 분기)
2. VIEW FE: Task 4 (타입) → Task 5 (UI) → Task 6 (테스트)

## 체크리스트

**OPS BE** (→ OPS Sprint 37-A로 이관):
- [ ] `admin_settings` migration 031 — `tm_pressure_test_required` 키 추가
- [ ] `production.py` — `_get_confirm_settings()` WHERE 확장 + progress 분기
- [ ] `task_service.py` — 알람 핸들러 TANK_MODULE 완료 분기 + `_is_tm_pressure_test_required()` 헬퍼

**VIEW FE**:
- [x] `AdminSettingsResponse` 타입 추가
- [x] ConfirmSettingsPanel — TM 그룹 박스 UI (PROCESS_TOGGLES / TM_GROUP / REMAINING_TOGGLES)
- [x] parent 의존성 — `confirm_tm_enabled=false` 시 가압검사 토글 disabled
- [x] 테스트 추가 + regression 통과 (22/22)
- [x] 빌드 통과

## 규칙 — Sprint 15
- `admin_settings` 컬럼은 `setting_key`, `setting_value`, `description` (NOT `key`, `value`) — OPS CLAUDE.md "DB 테이블 정확한 컬럼 명세" 참조
- OPS BE migration: `INSERT INTO admin_settings (setting_key, setting_value) VALUES ('tm_pressure_test_required', 'true')` — default `true` = 현재 동작 유지
- `tm_pressure_test_required` 옵션은 progress 산출 + 알람 트리거 **두 가지를 동시에** 제어하는 단일 boolean
- 실적처리 기준은 항상 TANK_MODULE — `tm_pressure_test_required` 옵션과 무관하게 confirmable = TANK_MODULE only
- ConfirmSettingsPanel에서 TOGGLES 배열을 `PROCESS_TOGGLES` / `TM_GROUP` / `REMAINING_TOGGLES` 3개로 분리
- TM 그룹 박스 내 `tm_pressure_test_required` 토글은 `confirm_tm_enabled`가 parent — parent OFF 시 disabled + opacity 0.4
- G-AXIS Design System 토큰 사용 — `var(--gx-mist)`, `var(--gx-snow)`, `var(--gx-graphite)` 등 (존재하지 않는 토큰 사용 금지)
- `AdminSettingsResponse` 타입에 `tm_pressure_test_required: boolean` 추가
- BE에서 `tm_pressure_test_required=false` 시: `_build_order_item()` progress 집계를 TANK_MODULE만 합산, 알람 트리거를 TANK_MODULE만 체크
- 스프린트에서 변경하는 로직의 테스트를 해당 스프린트 Task에 포함
- 스프린트 완료 시 `npm run test` 전체 실행 — 기존 테스트 포함 regression
- 테스트 실패 시 해당 스프린트에서 수정 후 머지
- ⚠️ `_calc_sn_progress()` 수정 금지 — Sprint 12(#36)에서 task_id 레벨로 확장 완료
- ⚠️ `_is_process_confirmable()` 수정 금지 — Sprint 12(#36)에서 TANK_MODULE only 분기 완료
- ⚠️ `_CONFIRM_TASK_FILTER` 수정 금지
- ⚠️ 실적처리 기준 변경 금지 (항상 TANK_MODULE — 옵션과 무관)
- ⚠️ 기존 ConfirmSettingsPanel 외 위치에 옵션 추가 금지
- ⚠️ default 값 `true` 변경 금지 (현재 동작 유지가 기본)
- ⚠️ Sprint 13에서 추출한 `utils/productionFilters.ts` 기존 함수 시그니처 변경 금지
- ⚠️ 테스트에서 실제 API 호출 금지 (mock only — DB/BE 무영향)
- ⚠️ `.env` 파일 절대 커밋 금지
- 완료 시 DESIGN_FIX_SPRINT.md 체크리스트 업데이트

---

# Sprint 16 (VIEW): S/N별 실적확인 UI + TM 혼재 제거 + 탭별 End 필터 (#38) (2026-03-24) ✅ 완료

> **참조**: OPS_API_REQUESTS.md #38, AXIS-OPS AGENT_TEAM_LAUNCH.md Sprint 37-B
> **선행**: OPS BE Sprint 37-B 완료 (S/N별 confirm API + sn_confirms 응답 + end 날짜)
> **대상**: `ProductionPerformancePage.tsx`, `types/production.ts`, `utils/productionFilters.ts`

## 배경

1. **TM 혼재 제거**: BE에서 `_PROC_PARTNER_COL`에서 `'TM'` 삭제 → TM은 `partner_confirms` 없음, `sn_confirms` 배열로 변경
2. **S/N별 실적확인**: 모든 공정(MECH/ELEC/TM)에서 S/N 단위 확인. O/N 내 S/N 완료 시점이 다를 수 있으므로 개별 확인 버튼 필요. 전체 완료 시 일괄확인.
3. **탭별 End 필터**: 기구전장 탭은 `mech_end`/`elec_end`, TM 탭은 `module_end` 기준으로 해당 주간에 속하는 O/N만 표시

## BE API 응답 변경점 (Sprint 37-B)

**processes 구조 변경**:

```
# MECH/ELEC 혼재
processes.MECH = {
  total, completed, pct, mixed: true,
  partner_confirms: [
    { partner: 'TMS', sn_confirms: [
        { serial_number, total, completed, pct, confirmable, confirmed, confirmed_at, confirm_id },
      ], all_confirmable, all_confirmed },
    { partner: 'FNI', sn_confirms: [...], all_confirmable, all_confirmed },
  ]
}

# MECH/ELEC 비혼재
processes.MECH = {
  total, completed, pct, mixed: false,
  sn_confirms: [
    { serial_number, total, completed, pct, confirmable, confirmed, confirmed_at, confirm_id },
  ], all_confirmable, all_confirmed
}

# TM (partner 혼재 없음)
processes.TM = {
  total, completed, pct, mixed: false,
  sn_confirms: [...], all_confirmable, all_confirmed
}

# PI/QI/SI — 기존 O/N 단위 유지
processes.PI = { total, completed, pct, confirmable, confirmed, ... }
```

**sns_detail 변경**:
```
sns: [
  { serial_number, mech_partner, elec_partner,
    mech_end, elec_end, module_end,
    progress: { MECH: {...}, ELEC: {...}, TM: {...} }
  }
]
```

**confirm API 요청 변경**:
```
POST /confirm { sales_order, process_type, partner?, serial_numbers: [...], confirmed_week, confirmed_month }
```

**cancel API 변경**: 요청 형태 동일 (`DELETE /confirm/:id`), confirm_id가 이제 S/N 단위이므로 1건당 1개 S/N 취소. 응답에 `serial_number` 추가됨.
```
DELETE /confirm/:id → 응답: { message, id, sales_order, process_type, partner?, serial_number }
```

---

## Task 1: 타입 변경 (`types/production.ts`)

### SNConfirm 인터페이스 추가

```typescript
export interface SNConfirm {
  serial_number: string;
  total: number;
  completed: number;
  pct: number;
  confirmable: boolean;
  confirmed: boolean;
  confirmed_at: string | null;
  confirm_id: number | null;
}
```

### PartnerConfirm 변경

> ⚠️ Breaking Change: Sprint 14에서 사용하던 기존 필드(`sn_count`, `confirmable`, `confirmed` 등)를 제거합니다. Sprint 14 ✅ 완료 확인됨. ProcessCell 혼재 경로에서 기존 `pc.confirmable`, `pc.confirmed` 참조를 `pc.sn_confirms` 기반으로 모두 교체해야 합니다.

```typescript
export interface PartnerConfirm {
  partner: string;
  sn_confirms: SNConfirm[];      // ← NEW (기존 sn_count, confirmable, confirmed 대체)
  all_confirmable: boolean;       // ← NEW
  all_confirmed: boolean;         // ← NEW
  // ❌ 제거: sn_count, total, completed, confirmable, confirmed, confirmed_at, confirm_id
}
```

**마이그레이션 영향 범위** (Sprint 14 기존 코드):
- `ProcessCell` line 286~314: `pc.confirmable`, `pc.confirmed`, `pc.sn_count`, `pc.partner` 참조 → `pc.sn_confirms` 순회로 교체
- `productionFilters.ts` line 59~68: `pc.confirmable && !pc.confirmed` → `pc.sn_confirms.some(sc => sc.confirmable && !sc.confirmed)`

### ProcessStatus 변경

```typescript
export interface ProcessStatus {
  ready: number;
  total: number;
  completed?: number;
  pct?: number;
  checklist_ready?: number;
  confirmable?: boolean;           // PI/QI/SI용 유지
  confirmed?: boolean;             // PI/QI/SI용 유지
  confirmed_at?: string | null;
  confirmed_by?: string | null;
  confirm_id?: number | null;
  mixed?: boolean;
  partner_confirms?: PartnerConfirm[] | null;
  sn_confirms?: SNConfirm[] | null;            // ← NEW
  all_confirmable?: boolean;                   // ← NEW
  all_confirmed?: boolean;                     // ← NEW
}
```

### SNDetail 변경

```typescript
export interface SNDetail {
  serial_number: string;
  mech_partner: string;
  elec_partner: string;
  mech_end?: string | null;        // ← NEW
  elec_end?: string | null;        // ← NEW
  module_end?: string | null;      // ← NEW
  progress: SNProgress;
  checklist: SNChecklist;
}
```

### ConfirmRequest 변경

```typescript
export interface ConfirmRequest {
  sales_order: string;
  process_type: 'MECH' | 'ELEC' | 'TM';
  partner?: string | null;
  serial_numbers: string[];         // ← NEW (필수)
  confirmed_week: string;
  confirmed_month: string;
}
```

### ConfirmResponse 변경

> ⚠️ Breaking Change: 기존 `{ success, confirm_id, sales_order, process_type, confirmed_week, sn_count, confirmed_at }` → 완전 교체. `useConfirmProduction` mutation 성공 콜백에서 `data.confirm_id`, `data.sn_count` 참조가 있으면 교체 필요.

```typescript
export interface ConfirmResponse {
  message: string;
  confirmed: Array<{ id: number; serial_number: string; confirmed_at: string; }>;
  count: number;
  // ❌ 제거: confirm_id, sales_order, process_type, confirmed_week, sn_count, confirmed_at (최상위)
}
```

**영향 범위**:
- `useConfirmProduction` mutation onSuccess 콜백 — `data.confirm_id` → `data.confirmed[0].id` 등으로 변경
- queryClient invalidation 로직은 변경 불필요 (기존 캐시 무효화)

### CancelConfirmResponse 변경

```typescript
export interface CancelConfirmResponse {
  success: boolean;
  deleted_id: number;
  sales_order: string;
  process_type: string;
  confirmed_week: string;
  partner?: string | null;
  serial_number?: string | null;   // ← NEW (S/N별 취소 시 반환)
}
```

---

## Task 2: ProcessCell — S/N별 버튼 렌더링

### 와이어프레임

```
혼재 O/N:                             비혼재 O/N:
┌──────────────────────────────┐     ┌──────────────────────┐
│ 6/12           혼재           │     │ 5/5                   │
│ ┌──────────────────────────┐ │     │  SN001  ✅ 확인       │
│ │ TMS                      │ │     │  SN002  ✅ 확인       │
│ │  SN001  ✅ 확인          │ │     │  SN003  [실적확인]    │
│ │  SN002  [실적확인]       │ │     │  [일괄확인 (3건)]     │
│ │  [일괄확인]              │ │     └──────────────────────┘
│ ├──────────────────────────┤ │
│ │ FNI                      │ │
│ │  SN003  대기             │ │
│ │  SN004  [실적확인]       │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### ProcessCell props 변경 (onConfirm 시그니처 Breaking Change)

기존 (line 215): `onConfirm: (partner?: string) => void`
변경: `onConfirm: (serialNumbers: string[], partner?: string) => void`

```typescript
onConfirm: (serialNumbers: string[], partner?: string) => void;   // ← 시그니처 변경
onBatchConfirm: (serialNumbers: string[], partner?: string) => void;  // NEW
```

**마이그레이션 영향 범위** (기존 onConfirm 호출부):
- `ProcessCell` 내부 line 300: `onConfirm(pc.partner)` → `onConfirm([sn.serial_number], pc.partner)` 또는 `onConfirm(confirmableSNs, pc.partner)`
- `ProcessCell` 내부 line 344: `onConfirm()` → `onConfirm([sn.serial_number])` 또는 `onConfirm(confirmableSNs)`
- 외부 호출부 line 773: `onConfirm={(partner) => handleConfirm(order.sales_order, 'MECH', partner)}` → `onConfirm={(sns, partner) => handleConfirm(order.sales_order, 'MECH', sns, partner)}`
- 외부 호출부 line 783: ELEC 동일 패턴
- 외부 호출부 line 797: TM 동일 패턴

### 렌더링 분기

1. `total === 0` → N/A
2. `!enabled` → "확인 비활성"
3. `isMixed && partner_confirms` → partner > S/N별 (혼재)
4. `sn_confirms` → S/N별 (비혼재 + TM)
5. `confirmable` → 단일 버튼 (PI/QI/SI)

### SNConfirmButton 공통 컴포넌트 추출

혼재/비혼재/TM에서 재사용하는 S/N 1개 확인 버튼.

---

## Task 3: handleConfirm / handleBatchConfirm — serial_numbers 전달

개별: `serial_numbers: [해당SN]`
일괄: `serial_numbers: [완료된 전체 SN]`

### 일괄확인 3가지 레벨

**레벨 1: ProcessCell 내부 일괄 (partner별 또는 비혼재 O/N)**
- 혼재 MECH: TMS partner 그룹 내 `all_confirmable=true` → "TMS 일괄확인" 버튼
  - `onBatchConfirm(tmsConfirmableSNs, 'TMS')`
- 비혼재 MECH + TM: `all_confirmable=true` → "일괄확인 (N건)" 버튼
  - `onBatchConfirm(allConfirmableSNs)`
- 혼재 시 partner별 일괄과 개별이 공존 가능 (TMS 전체 완료 → TMS 일괄, FNI 일부 완료 → FNI 개별)

**레벨 2: Toolbar 일괄 (탭 헤더 "기구 일괄확인 (N건)" 버튼)**
- 현재: O/N 단위 for loop
- 변경: O/N별 confirmable S/N을 serial_numbers 배열로 전달
- 혼재 O/N은 toolbar 일괄에서 제외 유지 (partner별 개별 확인 필요)

```typescript
const handleBatchConfirm = async (processType: 'MECH' | 'ELEC' | 'TM') => {
  // 비혼재 + all_confirmable인 O/N만 대상
  const confirmable = tabOrders.filter(o => {
    const proc = o.processes[processType];
    if (!proc) return false;
    if (proc.mixed && proc.partner_confirms) return false; // 혼재 제외
    return proc.all_confirmable && !proc.all_confirmed;
  });
  if (confirmable.length === 0) return;
  const labels = { MECH: '기구', ELEC: '전장', TM: 'TM' };
  if (!window.confirm(`${labels[processType]} 실적확인 ${confirmable.length}건을 일괄 처리하시겠습니까?`)) return;
  for (const o of confirmable) {
    const proc = o.processes[processType];
    const sns = proc.sn_confirms
      ?.filter(sc => sc.confirmable && !sc.confirmed)
      .map(sc => sc.serial_number) ?? [];
    if (sns.length === 0) continue;
    await confirmMutation.mutateAsync({
      sales_order: o.sales_order,
      process_type: processType,
      serial_numbers: sns,
      confirmed_week: perfData?.week ?? '',
      confirmed_month: perfData?.month ?? '',
    });
  }
};
```

**레벨 3: handleConfirm (개별/ProcessCell 일괄 공통)**
```typescript
const handleConfirm = (salesOrder: string, processType: 'MECH' | 'ELEC' | 'TM',
  serialNumbers: string[], partner?: string) => {
  confirmMutation.mutate({
    sales_order: salesOrder,
    process_type: processType,
    partner: partner ?? null,
    serial_numbers: serialNumbers,
    confirmed_week: perfData?.week ?? '',
    confirmed_month: perfData?.month ?? '',
  });
};
```

---

## Task 4: 탭별 End 필터 (`productionFilters.ts`)

`filterByProcessTab`에 weekStart/weekEnd 파라미터 추가.
기구전장: `mech_end`/`elec_end` 기준, TM: `module_end` 기준.

### BE end 날짜 형식

BE `sns_detail`의 `mech_end`, `elec_end`, `module_end`는 **ISO date 문자열** (`'2026-03-24'`). DB `product_info` 컬럼이 `DATE` 타입이므로 BE에서 `.isoformat()` 호출하여 `YYYY-MM-DD` 형식으로 내려줌.

### 주간 범위 파싱 유틸 추가

현재 FE에서 주차 → 날짜 범위 변환이 없으므로 유틸 추가 필요:

```typescript
// utils/weekRange.ts 또는 productionFilters.ts 내부
export function getISOWeekRange(weekStr: string, year: number): [string, string] {
  // ISO 8601: W01은 1월 4일이 포함된 주
  const weekNum = parseInt(weekStr.replace(/[Ww]/, ''));
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7; // 일=7
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (weekNum - 1) * 7);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  // YYYY-MM-DD 형식
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return [fmt(monday), fmt(nextMonday)];
}
```

### filterByProcessTab 호출부 변경

```typescript
// ProductionPerformancePage.tsx
const currentYear = perfData?.week
  ? parseInt(perfData.month?.split('-')[0] ?? String(new Date().getFullYear()))
  : new Date().getFullYear();
// activeWeek: 기존 line 384에 useState<string>('') 로 존재
// perfData.week로 초기화 (line 413)
const [weekStart, weekEnd] = activeWeek
  ? getISOWeekRange(activeWeek, currentYear)
  : ['', ''];

const tabOrders = filterByProcessTab(orders, activeProcessTab, weekStart, weekEnd);
```

### 비교 로직

end 날짜는 `'2026-03-24'` 형식이므로 문자열 비교 가능 (`>=`, `<`).
`weekStart <= sn.mech_end < weekEnd` 패턴.

---

## Task 5: KPI + 상태 필터 변경 (`productionFilters.ts`)

### calcTabKpi 변경 — sn_confirms 기반 카운트

기존: `o.confirms` 배열 (O/N 단위 confirm 이력) 기반 → 변경: `proc.sn_confirms` / `proc.partner_confirms` 기반.

**변경 전** (기구전장 mechConfirmed/elecConfirmed):
```typescript
// 기존 (line 52~55): O/N 단위 confirms 배열 체크
mechConfirmed: orders.filter(o =>
  (o.confirms ?? []).some(c => c.process_type === 'MECH')).length,
```

**변경 후**:
```typescript
// S/N 기반: all_confirmed = 모든 S/N 확인 완료
mechConfirmed: orders.filter(o => {
  const proc = o.processes?.MECH;
  if (!proc) return false;
  if (proc.mixed && proc.partner_confirms) {
    return proc.partner_confirms.every(pc => pc.all_confirmed);
  }
  return proc.all_confirmed ?? false;
}).length,
```

**변경 전** (mechReady/elecReady):
```typescript
// 기존 (line 56~63): pc.confirmable 또는 proc.confirmable
mechReady: orders.filter(o => {
  const proc = o.processes?.MECH;
  if (!proc) return false;
  if (proc.mixed && proc.partner_confirms) {
    return proc.partner_confirms.some(pc => pc.confirmable && !pc.confirmed);
  }
  return proc.confirmable && !(o.confirms ?? []).some(c => c.process_type === 'MECH');
}).length,
```

**변경 후**:
```typescript
// sn_confirms 기반: 확인 가능하지만 아직 미확인인 S/N이 있는 O/N
mechReady: orders.filter(o => {
  const proc = o.processes?.MECH;
  if (!proc) return false;
  if (proc.mixed && proc.partner_confirms) {
    return proc.partner_confirms.some(pc =>
      pc.sn_confirms.some(sc => sc.confirmable && !sc.confirmed)
    );
  }
  return (proc.sn_confirms ?? []).some(sc => sc.confirmable && !sc.confirmed);
}).length,
```

TM 탭 tmConfirmed/tmReady도 동일 패턴 적용 (기존 line 77~86).

### filterByStatus 변경 — all_confirmed 기반

**변경 전** (line 26~33):
```typescript
// 기존: o.confirms 배열에서 process_type별 존재 여부 체크
return orders.filter(o => {
  const hasAll = (['MECH', 'ELEC'] as const).every(
    pt => (o.confirms ?? []).some(c => c.process_type === pt)
  );
  ...
});
```

**변경 후**:
```typescript
// all_confirmed 기반 판정
if (status === 'done') {
  return orders.filter(o => {
    const mechDone = !o.processes?.MECH || o.processes.MECH.all_confirmed
      || (o.processes.MECH.mixed && o.processes.MECH.partner_confirms?.every(pc => pc.all_confirmed));
    const elecDone = !o.processes?.ELEC || o.processes.ELEC.all_confirmed
      || (o.processes.ELEC.mixed && o.processes.ELEC.partner_confirms?.every(pc => pc.all_confirmed));
    const tmDone = (o.processes?.TM?.total ?? 0) === 0 || (o.processes?.TM?.all_confirmed ?? false);
    return mechDone && elecDone && tmDone;
  });
}
```

---

## Task 6: S/N 상세 행 — end 날짜 표시

S/N expand 영역에 공정별 end 날짜 표시. 탭에 따라 표시 항목이 다름.

### 표시 위치

기존 S/N 상세 행 (expand 시 각 S/N progress 옆)에 end 날짜 추가.

### 표시 로직

```typescript
// SNDetail의 end 날짜는 'YYYY-MM-DD' | null
// 표시 형식: 'MM-DD' (예: '03-24')
const formatEnd = (end: string | null) => end ? end.slice(5) : '—';
```

**기구전장 탭**: `mech_end`, `elec_end` 표시
```
SN001   기구: 03-24   전장: 04-01   MECH 80%  ELEC 60%
```

**TM 탭**: `module_end` 표시
```
SN001   모듈: 03-28   TM 100%
```

### 기존 코드 위치

S/N expand 영역은 `ProductionPerformancePage.tsx` line 740~770 부근. 현재 `sn.progress` 표시 → 옆에 end 날짜 추가.

---

## Task 7: 테스트 + 빌드

- [x] `productionFilters.test.ts` — end 필터 + sn_confirms 카운트 + all_confirmed 상태 케이스
- [ ] ProcessCell S/N별 렌더링 수동 검증 (배포 후)
- [x] `npm run build` + `npm run test` regression (30/30, Sprint 17 hotfix 포함)

---

## 변경 파일

| 파일 | 변경 |
|------|------|
| `app/src/types/production.ts` | `SNConfirm` + `PartnerConfirm`/`ProcessStatus`/`SNDetail`/`ConfirmRequest`/`ConfirmResponse` |
| `app/src/pages/production/ProductionPerformancePage.tsx` | `ProcessCell` S/N별 + `SNConfirmButton` + handleConfirm/handleBatchConfirm + end 날짜 표시 |
| `app/src/utils/productionFilters.ts` | filterByProcessTab end + calcTabKpi sn_confirms + filterByStatus all_confirmed |

---

## 체크리스트

**FE (완료)**:
- [x] 타입 변경 (SNConfirm, PartnerConfirm, ProcessStatus, SNDetail, ConfirmRequest, ConfirmResponse)
- [x] ProcessCell — 혼재: partner > S/N별
- [x] ProcessCell — 비혼재 + TM: S/N별 + 일괄
- [x] SNConfirmButton 공통 컴포넌트
- [x] handleConfirm/handleBatchConfirm serial_numbers
- [x] productionFilters.ts — end 필터 + KPI + 상태 필터
- [x] S/N end 날짜 표시
- [x] 테스트 + regression + 빌드 (30/30 통과, Sprint 17 hotfix 포함)

**검증 (배포 후)**:
- [ ] 🔴 혼재: partner > S/N별 확인
- [ ] 🔴 TM: sn_confirms만 (partner_confirms 없음)
- [ ] 🔴 일괄확인 + 개별확인
- [ ] 🔴 기구전장 탭: mech_end/elec_end 필터
- [ ] 🔴 TM 탭: module_end 필터
- [ ] PI/QI/SI 기존 유지
- [ ] S/N end 날짜 표시

---

## 규칙 — Sprint 16

- OPS BE Sprint 37-B 완료 후에만 진행
- `SNConfirmButton` 별도 추출 — 공통 사용
- `ConfirmRequest.serial_numbers` 필수 — 빈 배열 금지
- TM: `mixed` 항상 `false` — BE에서 TM partner 혼재 제거됨, FE에서 TM `partner_confirms` 처리 코드 완전 제거 필수
- PI/QI/SI: S/N별 미적용 — 기존 `confirmable`/`confirmed` O/N 단위 유지
- `all_confirmable`, `all_confirmed` BE 값 사용 — FE 재계산 금지
- `PartnerConfirm` Breaking Change — Sprint 14 기존 `pc.confirmable`, `pc.confirmed`, `pc.sn_count` 참조를 `pc.sn_confirms` 기반으로 전면 교체. ProcessCell 혼재 경로 + productionFilters KPI 로직 모두 수정
- `ConfirmResponse` Breaking Change — `useConfirmProduction` mutation onSuccess 콜백에서 기존 `data.confirm_id`, `data.sn_count` 참조를 `data.confirmed`, `data.count`로 교체
- `CancelConfirmResponse`에 `serial_number` 추가 — `useCancelConfirm` 콜백 영향 확인
- end 날짜 비교: BE에서 `YYYY-MM-DD` ISO date 문자열로 내려줌 → 문자열 비교(`>=`, `<`) 사용. `getISOWeekRange()` 유틸로 주간 범위 계산
- `filterByProcessTab` 시그니처 변경 (weekStart/weekEnd 추가) → 기존 Sprint 13 테스트에서 호출부 업데이트 필요 (regression 방지)
- 일괄확인 3레벨 구분: ProcessCell 내부(partner별/O/N별), Toolbar(탭 헤더), handleConfirm(공통). 혼재 O/N은 Toolbar 일괄에서 제외
- G-AXIS Design System 토큰 사용
- 스프린트 변경 로직의 테스트를 Task에 포함
- `npm run test` 전체 regression — `filterByProcessTab` 시그니처 변경으로 기존 테스트 깨질 수 있으므로 반드시 업데이트
- ⚠️ ConfirmSettingsPanel 수정 금지
- ⚠️ `isProcessEnabled()` 수정 금지
- ⚠️ 설정 패널, 월마감 뷰 수정 금지
- ⚠️ `.env` 절대 커밋 금지
- ⚠️ 테스트에서 실제 API 호출 금지 (mock only)
- 완료 시 DESIGN_FIX_SPRINT.md 체크리스트 업데이트

---

# Sprint 17 (VIEW HOTFIX): End 필터 버그 수정 + 중복 정리 + 쿼리 안정화 (2026-03-24) ✅ 완료

> **유형**: HOTFIX — Sprint 13 end 필터 구현 버그 + 코드 품질
> **선행**: Sprint 13 완료 (이미 완료), Sprint 16 구현 전 적용 권장
> **대상**: `ProductionPerformancePage.tsx`, `productionFilters.ts`, `api/production.ts`, `hooks/useProduction.ts`

## 배경

**증상**: 새로고침 시 카운트 1개 잠깐 보이다가 0으로 변경됨.

**원인 2가지**:

1. **End 필터 참조 오류**: `filterByProcessTab`과 Page inline 필터 모두 `o.mech_end` (O/N 레벨)를 참조하지만, BE는 `sns[]` 내부에만 end 날짜를 제공 → `o.mech_end`가 항상 `undefined` → end 필터 조건 자체가 건너뛰어짐
2. **Double API Call**: `activeWeek = ''` → `usePerformance(undefined)` 호출 → 응답 후 `setActiveWeek('W13')` → `usePerformance('W13')` = 새 queryKey → 캐시 미스 → 데이터 사라짐 → 두 번째 응답 도착 시 복원 (깜빡임)

**부수 발견**: Page에 utils와 동일한 로직이 inline으로 4건 중복 존재.

---

## Task 1: `productionFilters.ts` — End 필터를 `o.sns[]` 기반으로 수정

### 변경 이유

O/N 레벨에 end 날짜가 없으므로 `o.sns[]`에서 직접 확인해야 합니다. 또한 `max(end)` 집계 방식은 부정확합니다 — O/N에 SN 3대(end: W13, W14, W15)가 있을 때 `max = W15`로 하면 W13 조회 시 이 O/N이 누락됩니다. 올바른 로직은 **"any SN이 해당 주 범위에 end date가 있으면 O/N 표시"** 입니다.

### 변경 전 (line 26~46)

```typescript
return orders.filter(o => {
  if (tab === 'mech_elec') {
    const hasMechElec = (o.processes?.MECH?.total ?? 0) > 0 || (o.processes?.ELEC?.total ?? 0) > 0;
    if (!hasMechElec) return false;
    // ❌ o.mech_end → O/N 레벨에 없음 → 항상 undefined
    if (weekStart && weekEnd && (o.mech_end || o.elec_end)) {
      const mechInRange = o.mech_end && o.mech_end >= weekStart && o.mech_end < weekEnd;
      const elecInRange = o.elec_end && o.elec_end >= weekStart && o.elec_end < weekEnd;
      if (!mechInRange && !elecInRange) return false;
    }
    return true;
  } else {
    const hasTM = (o.processes?.TM?.total ?? 0) > 0;
    if (!hasTM) return false;
    // ❌ o.module_end → 동일 문제
    if (weekStart && weekEnd && o.module_end) {
      if (o.module_end < weekStart || o.module_end >= weekEnd) return false;
    }
    return true;
  }
});
```

### 변경 후

```typescript
return orders.filter(o => {
  if (tab === 'mech_elec') {
    const hasMechElec = (o.processes?.MECH?.total ?? 0) > 0 || (o.processes?.ELEC?.total ?? 0) > 0;
    if (!hasMechElec) return false;
    // ✅ sns[] 순회 — any SN의 mech_end 또는 elec_end가 주간 범위에 있으면 통과
    if (weekStart && weekEnd && o.sns?.length > 0) {
      const hasAnyEnd = o.sns.some(sn => sn.mech_end || sn.elec_end);
      if (hasAnyEnd) {
        const anyInRange = o.sns.some(sn => {
          const mechOk = sn.mech_end && sn.mech_end >= weekStart && sn.mech_end < weekEnd;
          const elecOk = sn.elec_end && sn.elec_end >= weekStart && sn.elec_end < weekEnd;
          return mechOk || elecOk;
        });
        if (!anyInRange) return false;
      }
      // end 데이터 자체가 없는 경우 → 필터 건너뜀 (기존 동작 유지)
    }
    return true;
  } else {
    const hasTM = (o.processes?.TM?.total ?? 0) > 0;
    if (!hasTM) return false;
    // ✅ sns[] 순회 — any SN의 module_end가 주간 범위에 있으면 통과
    if (weekStart && weekEnd && o.sns?.length > 0) {
      const hasAnyEnd = o.sns.some(sn => sn.module_end);
      if (hasAnyEnd) {
        const anyInRange = o.sns.some(sn =>
          sn.module_end && sn.module_end >= weekStart && sn.module_end < weekEnd
        );
        if (!anyInRange) return false;
      }
    }
    return true;
  }
});
```

**핵심**: `o.mech_end` → `o.sns.some(sn => sn.mech_end in range)`. end 데이터가 아예 없는 O/N은 기존처럼 필터 건너뜀.

---

## Task 2: `ProductionPerformancePage.tsx` — 중복 코드 정리 (utils import로 교체)

### 2-1. inline `getISOWeekRange` 제거 (line 485~495)

```typescript
// ❌ 제거 (page 내부 중복 정의)
const getISOWeekRange = (weekStr: string, year: number): [string, string] => { ... };
```

```typescript
// ✅ 교체: utils에서 import
import { getISOWeekRange, filterByProcessTab, filterByStatus, calcTabKpi } from '@/utils/productionFilters';
```

### 2-2. inline `tabOrders` 필터 교체 (line 500~521)

```typescript
// ❌ 제거 (inline 필터 — utils와 동일 로직)
const tabOrders = orders.filter(o => { ... });
```

```typescript
// ✅ 교체
const tabOrders = filterByProcessTab(orders, activeProcessTab, weekStart, weekEnd);
```

### 2-3. inline `isConfirmedProc` / `isReadyProc` + KPI 교체 (line 524~547)

```typescript
// ❌ 제거 (utils의 isProcConfirmed, isProcReady와 동일)
const isConfirmedProc = (proc: ...) => { ... };
const isReadyProc = (proc: ...) => { ... };
const mechConfirmedInTab = tabOrders.filter(...).length;
// ...
```

```typescript
// ✅ 교체
const kpi = calcTabKpi(tabOrders, activeProcessTab);
// kpi.mechConfirmed, kpi.mechReady, kpi.tmConfirmed 등 사용
```

**마이그레이션 영향 범위**:
- KPI 카드 렌더링 (line 620~680 부근): `mechConfirmedInTab` → `kpi.mechConfirmed` 등 변수명 교체
- 기존 6개 변수 (`mechConfirmedInTab`, `elecConfirmedInTab`, `mechReadyInTab`, `elecReadyInTab`, `tmConfirmedInTab`, `tmReadyInTab`) → `kpi` 객체 속성으로 통합

### 2-4. inline `isDone` / `filteredOrders` 교체 (line 550~560)

```typescript
// ❌ 제거
const isDone = (o: ...) => { ... };
const filteredOrders = tabOrders.filter(o => { ... });
```

```typescript
// ✅ 교체
const filteredOrders = filterByStatus(tabOrders, statusFilter);
```

### 정리 결과

line 485~560 영역 (~75줄)의 로직이 utils import + 호출 4줄로 압축됨:
```typescript
const [weekStart, weekEnd] = activeWeek ? getISOWeekRange(activeWeek, currentYear) : ['', ''];
const tabOrders = filterByProcessTab(orders, activeProcessTab, weekStart, weekEnd);
const kpi = calcTabKpi(tabOrders, activeProcessTab);
const filteredOrders = filterByStatus(tabOrders, statusFilter);
```

---

## Task 3: `api/production.ts` — O/N 레벨 end 집계 (테이블 표시용)

`getPerformance` BE→FE 변환 (line 20~51)에서 sns end 날짜를 O/N 레벨로 집계합니다. 이는 **필터용이 아닌 테이블 표시/정렬용**입니다 (Sprint 16 Task 6에서 O/N 행에 end 날짜 표시 시 사용).

### 추가 위치: line 50 (`return` 직전)

```typescript
// O/N 레벨 end 집계 (max) — 테이블 표시/정렬용. 필터에 사용하지 않음.
const mechEndMax = sns
  .map((s: any) => s.mech_end).filter(Boolean)
  .sort().pop() ?? null;
const elecEndMax = sns
  .map((s: any) => s.elec_end).filter(Boolean)
  .sort().pop() ?? null;
const moduleEndMax = sns
  .map((s: any) => s.module_end).filter(Boolean)
  .sort().pop() ?? null;

return {
  ...order,
  partner_info: partnerInfo,
  confirms,
  mech_end: mechEndMax,
  elec_end: elecEndMax,
  module_end: moduleEndMax,
};
```

**주의**: 이 값은 필터에 사용하지 않음. 필터는 Task 1의 `o.sns[]` 순회 사용. `OrderGroup.mech_end` 등은 "해당 O/N의 가장 늦은 end date"로 테이블 정렬/표시에만 활용.

---

## Task 4: `hooks/useProduction.ts` — queryKey 전환 깜빡임 방지

### 변경 전 (line 8~15)

```typescript
export function usePerformance(week?: string, month?: string) {
  return useQuery({
    queryKey: ['production', 'performance', week, month],
    queryFn: () => getPerformance(week, month),
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
```

### 변경 후

```typescript
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

export function usePerformance(week?: string, month?: string) {
  return useQuery({
    queryKey: ['production', 'performance', week, month],
    queryFn: () => getPerformance(week, month),
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    placeholderData: keepPreviousData,  // ← 추가: queryKey 전환 시 이전 데이터 유지
  });
}
```

**효과**: `activeWeek`가 `''` → `'W13'`으로 변경될 때 queryKey가 바뀌지만, 새 데이터가 도착할 때까지 이전 데이터를 표시 → 깜빡임 제거.

**TanStack Query 버전 확인**: v5 = `placeholderData: keepPreviousData`, v4 = `keepPreviousData: true`.

---

## Task 5: 테스트 + regression + 빌드

- [x] `productionFilters.test.ts` — end 필터 sns 기반 케이스 4건 추가 (30 tests)
- [x] 기존 테스트 호출부 확인 — `filterByProcessTab` 시그니처 변경 없음
- [x] `npm run test` 전체 regression (30/30)
- [x] `npm run build` 빌드 확인

---

## 변경 파일

| 파일 | 변경 |
|------|------|
| `app/src/utils/productionFilters.ts` | `filterByProcessTab` end 필터 → `o.sns[]` 순회 |
| `app/src/pages/production/ProductionPerformancePage.tsx` | inline 중복 4건 제거 → utils import (~75줄 → 4줄) |
| `app/src/api/production.ts` | BE→FE 변환에 O/N 레벨 end 집계 (max) |
| `app/src/hooks/useProduction.ts` | `placeholderData: keepPreviousData` 추가 |

---

## 체크리스트

**FE (완료)**:
- [x] `filterByProcessTab` — `o.mech_end` → `o.sns.some()` 수정
- [x] Page inline `getISOWeekRange` 제거 → utils import
- [x] Page inline `tabOrders` 제거 → `filterByProcessTab()` 사용
- [x] Page inline `isConfirmedProc`/`isReadyProc`/KPI → `calcTabKpi()` 사용
- [x] Page inline `isDone`/`filteredOrders` → `filterByStatus()` + `isOrderDone()` 사용
- [x] `api/production.ts` — O/N 레벨 end 집계 (mech_end_max 등)
- [x] `usePerformance` — `placeholderData: keepPreviousData`
- [x] 테스트 + regression + 빌드 (30/30)

**검증 (배포 후)**:
- [ ] 🔴 새로고침 시 카운트 깜빡임 없음
- [ ] 🔴 기구전장 탭: mech_end/elec_end 기준 주간 필터 정상
- [ ] 🔴 TM 탭: module_end 기준 주간 필터 정상
- [ ] 🔴 SN 3대 (end: W13, W14, W15) O/N → W13 조회 시 표시됨
- [ ] 🔴 주차 변경 시 데이터 깜빡임 없음

---

## 규칙 — Sprint 17

- **End 필터는 `o.sns[]` 순회** — `o.mech_end` (O/N 레벨) 사용 금지. "any SN이 해당 주에 end 있으면 O/N 표시" 로직
- **O/N 레벨 end (max)는 표시/정렬용** — 필터에 사용하지 않음
- `productionFilters.ts` utils가 **단일 진실 소스(SSOT)** — Page에 동일 로직 inline 금지. `filterByProcessTab`, `filterByStatus`, `calcTabKpi`, `isProcConfirmed`, `isProcReady`, `getISOWeekRange` 모두 utils에서 import
- `placeholderData: keepPreviousData` — queryKey 전환 시 이전 데이터 유지. `isPlaceholderData` 플래그로 로딩 표시 가능
- TanStack Query 버전 확인 후 적용 (v5: `placeholderData: keepPreviousData`, v4: `keepPreviousData: true`)
- `filterByProcessTab` 시그니처 변경 없음 — weekStart/weekEnd는 이미 optional
- G-AXIS Design System 토큰 사용
- ⚠️ ConfirmSettingsPanel 수정 금지
- ⚠️ `isProcessEnabled()` 수정 금지
- ⚠️ 설정 패널, 월마감 뷰 수정 금지
- ⚠️ `.env` 절대 커밋 금지
- ⚠️ 테스트에서 실제 API 호출 금지 (mock only — DB/BE 무영향)
- 완료 시 DESIGN_FIX_SPRINT.md 체크리스트 업데이트

---

# CORE-ETL Sprint 3-A (VIEW FE): finishing_plan_end 변경이력 추적 UI 추가 (2026-03-24) ✅ 완료

> **유형**: ETL 추적 필드 확장 — BE(step2_load.py) TRACKED_FIELDS에 `finishing_plan_end` 추가에 따른 VIEW FE 반영
> **대상**: `EtlChangeLogPage.tsx`

## 배경

ETL 변경 추적 대상에 `finishing_plan_end`(마무리계획종료일) 필드가 7번째로 추가됨 (CORE-ETL Sprint 3-A).
VIEW 변경이력 페이지에서 마무리계획종료일 변경도 확인 가능하게 FE 반영.

## 변경 내역 (`EtlChangeLogPage.tsx`)

| 위치 | 변경 |
|------|------|
| `FIELD_CONFIG` | `finishing_plan_end: { label: '마무리계획', color: '#14B8A6', bg: '#F0FDFA' }` 추가 (Teal) |
| `DATE_FIELDS` | `finishing_plan_end` 추가 → 날짜 diff (+Nd/-Nd) 표시 |
| `buildWeeklyChart` | `마무리계획` 카운트 추가 |
| `kpiCards` | 배열에 `finishing_plan_end` 추가 → KPI 카드 7개 |
| 그리드 | `repeat(6, 1fr)` → `repeat(7, 1fr)` |
| 차트 Bar | `마무리계획` Bar 추가 (스택 최상단, 라운드 코너) |

---

# Sprint 18 (VIEW): S/N 작업 현황 카드뷰 — 태깅 이력 통합 조회 (2026-03-25)

> **목적**: APP에서 매번 QR 태깅해야만 개별 task를 확인할 수 있는 불편함을 VIEW 대시보드에서 해소. S/N 단위 카드뷰로 전체 공정 진행 현황 + 작업자별 태깅 이력을 한눈에 조회
> **범위**: VIEW(React 19 + TanStack Query v5) FE — OPS BE: `last_worker` 필드 추가 (Sprint 38 ✅ 완료, 2026-03-27)
> **대상**: `AXIS-VIEW/app/src/pages/`, `AXIS-VIEW/app/src/components/`, `AXIS-VIEW/app/src/hooks/`
> **원칙**: APP = QR 태깅 (액션) / VIEW 대시보드 = 현황 조회 + 분석

## 배경

현재 작업관리에서 S/N별 task 확인은 가능하지만, **매번 QR 태깅을 해야 개별 task를 조회**할 수 있는 구조.
관리자(admin, manager, gst)나 현장 담당자가 "전체 S/N의 공정 진행 상태"를 빠르게 파악하려면 S/N마다 QR을 스캔해야 하는 비효율이 있음.

VIEW 대시보드에 **S/N 카드뷰 페이지**를 추가하여:
- QR 태깅 없이 전체 S/N의 공정 progress를 한눈에 확인
- 카드 클릭으로 작업자별 태깅 이력(시작/완료/소요시간) 상세 조회
- 동시작업(한 task에 다중 작업자) 이력도 표시

## 권한

| 권한 | 조회 범위 |
|------|----------|
| admin, manager | 전체 S/N |
| gst | 전체 S/N |
| 협력사 작업자 | 소속 협력사 S/N만 (근태관리 페이지와 동일) |

> `allowedRoles`: `['admin', 'manager', 'gst']` — 기존 생산실적 페이지와 동일 권한

## API 활용

| 용도 | API | 응답 데이터 | 비고 |
|------|-----|------------|------|
| S/N 카드 리스트 | `GET /api/app/product/progress` | `products[]` — S/N별 카테고리별 진행률 + `overall_percent` | APP 전사 작업 진행현황과 동일 API |
| S/N 상세 (작업자별 시간) | `GET /tasks/<serial_number>?all=true` | `workers[]` — worker_name, started_at, completed_at, duration_minutes, status | 카드 클릭 시 1건만 호출 |

> **방향 B 채택 (OPS Sprint 38 ✅ 완료)**: 카드 리스트에서 최근 태깅 작업자를 표시하기 위해 `GET /api/app/product/progress` 응답에 `last_worker`, `last_activity_at` summary 필드를 OPS BE에서 추가. N+1 호출 방지.
> ~~Sprint 38 BE 배포 전까지는 카드에 작업자 정보 없이 progress만 표시, 배포 후 FE에서 필드 연결만 추가.~~ → Sprint 38 BE 배포 완료 (2026-03-27). FE 자동 연동됨 — null fallback 로직이 실제 값으로 전환.

### products[] 응답 구조 (기존 APP API — progress_service.py)

```json
{
  "products": [
    {
      "serial_number": "GBWS-6804",
      "model": "GAIA-I DUAL",
      "customer": "MICRON",
      "ship_plan_date": "2026-04-17",
      "all_completed": false,
      "all_completed_at": null,
      "overall_percent": 76,
      "categories": {
        "MECH": { "total": 6, "done": 6, "percent": 100 },
        "ELEC": { "total": 6, "done": 6, "percent": 100 },
        "TMS":  { "total": 3, "done": 3, "percent": 100 },
        "PI":   { "total": 2, "done": 0, "percent": 0 },
        "QI":   { "total": 1, "done": 0, "percent": 0 },
        "SI":   { "total": 1, "done": 0, "percent": 0 }
      },
      "my_category": null,
      "last_worker": "김태영",
      "last_activity_at": "2026-03-25T10:32:45+09:00"
    }
  ],
  "summary": { "total": 4, "in_progress": 3, "completed_recent": 1 }
}
```

> `last_worker` / `last_activity_at` — OPS Sprint 38 ✅ 완료 (2026-03-27). API에서 실제 값 반환됨.

### workers[] 응답 구조 (work_start_log + work_completion_log JOIN)

```json
{
  "task_category": "MECH",
  "workers": [
    {
      "worker_id": 42,
      "worker_name": "김태영",
      "started_at": "2026-03-25T09:00:12+09:00",
      "completed_at": "2026-03-25T10:32:45+09:00",
      "duration_minutes": 92,
      "status": "completed"
    },
    {
      "worker_id": 55,
      "worker_name": "박준호",
      "started_at": "2026-03-25T09:05:00+09:00",
      "completed_at": "2026-03-25T10:30:00+09:00",
      "duration_minutes": 85,
      "status": "completed"
    }
  ],
  "my_status": "not_started"
}
```

> **동시작업**: 동일 task에 여러 작업자가 동시에 작업 가능. `workers[]` 배열에 복수 항목으로 표시됨.

### 공정 키 매핑 (BE → FE 표시)

| BE `categories` key | FE 탭 라벨 | FE 상세 패널 라벨 |
|---------------------|-----------|-----------------|
| `MECH` | MECH | MECH 기구 |
| `ELEC` | ELEC | ELEC 전장 |
| `TMS` | TM | TM 모듈 |
| `PI` | PI | PI 가압 |
| `QI` | QI | QI 공정검사 |
| `SI` | SI | SI 마무리 |

> BE key `TMS` → FE 사용자 표시 라벨 `TM`. 내부 필터 로직은 `categories['TMS']`로 접근.

---

## Teammate 역할 분리

이 Sprint는 작업량이 많으므로 **3명의 Teammate**로 역할을 분리하여 병렬 진행합니다.

### 🅰 Teammate A: 타입 + API + Hook 레이어

**담당**: 타입 정의 → API 함수 → TanStack Query 훅

| 순서 | 작업 | 파일 |
|------|------|------|
| A-1 | `SNProduct` / `SNTaskDetail` 타입 정의 | `types/snStatus.ts` (신규) |
| A-2 | `getSNProgress()` API 함수 | `api/snStatus.ts` (신규) |
| A-3 | `getSNTasks()` API 함수 | `api/snStatus.ts` |
| A-4 | `useSNProgress()` hook — `keepPreviousData` 포함 | `hooks/useSNProgress.ts` (신규) |
| A-5 | `useSNTasks(serialNumber)` hook — enabled 조건부 | `hooks/useSNTasks.ts` (신규) |

**A-1 타입 정의 (`types/snStatus.ts`)**:

```typescript
// products[] 응답 타입
export interface SNProduct {
  serial_number: string;
  model: string;
  customer: string;
  ship_plan_date: string | null;
  all_completed: boolean;
  all_completed_at: string | null;
  overall_percent: number;
  categories: Record<string, { total: number; done: number; percent: number }>;
  my_category: string | null;
  last_worker: string | null;       // Sprint 38 ✅ 완료 (2026-03-27)
  last_activity_at: string | null;  // Sprint 38 ✅ 완료 (2026-03-27)
}

export interface SNProgressResponse {
  products: SNProduct[];
  summary: { total: number; in_progress: number; completed_recent: number };
}

// tasks 상세 응답 타입
export interface TaskWorker {
  worker_id: number;
  worker_name: string;
  started_at: string | null;
  completed_at: string | null;
  duration_minutes: number | null;
  status: 'completed' | 'in_progress' | 'not_started';
}

export interface SNTaskDetail {
  task_category: string;
  workers: TaskWorker[];
  my_status: string;
}
```

**A-2 API 함수 (`api/snStatus.ts`)**:

```typescript
import apiClient from './client';
import type { SNProgressResponse, SNTaskDetail } from '@/types/snStatus';

export async function getSNProgress(): Promise<SNProgressResponse> {
  const { data } = await apiClient.get<SNProgressResponse>('/api/app/product/progress');
  return data;
}

export async function getSNTasks(serialNumber: string): Promise<SNTaskDetail[]> {
  const { data } = await apiClient.get<SNTaskDetail[]>(
    `/tasks/${serialNumber}?all=true`,
  );
  return data;
}
```

**A-4 useSNProgress hook (`hooks/useSNProgress.ts`)**:

```typescript
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getSNProgress } from '@/api/snStatus';

export function useSNProgress() {
  return useQuery({
    queryKey: ['sn', 'progress'],
    queryFn: getSNProgress,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
```

**A-5 useSNTasks hook (`hooks/useSNTasks.ts`)**:

```typescript
import { useQuery } from '@tanstack/react-query';
import { getSNTasks } from '@/api/snStatus';

export function useSNTasks(serialNumber: string | null) {
  return useQuery({
    queryKey: ['sn', 'tasks', serialNumber],
    queryFn: () => getSNTasks(serialNumber!),
    enabled: !!serialNumber,  // 카드 선택 전까지 호출하지 않음
    staleTime: 30 * 1000,
  });
}
```

---

### 🅱 Teammate B: 컴포넌트 레이어 (카드 + 상세 패널)

**담당**: 순수 UI 컴포넌트 — hook/page 독립

| 순서 | 작업 | 파일 |
|------|------|------|
| B-1 | `SNCard` — S/N 카드 컴포넌트 | `components/sn-status/SNCard.tsx` (신규) |
| B-2 | `ProcessStepCard` — 공정별 상세 카드 | `components/sn-status/ProcessStepCard.tsx` (신규) |
| B-3 | `SNDetailPanel` — S/N 상세 사이드 패널 | `components/sn-status/SNDetailPanel.tsx` (신규) |

**B-1 SNCard Props**:

```typescript
interface SNCardProps {
  product: SNProduct;
  isSelected: boolean;
  onClick: (serialNumber: string) => void;
}
```

- progress bar: `overall_percent` 기반
- 공정 상태 아이콘 6개: `categories[cat].percent` → ✓(100) / 🔵(1~99) / ○(0)
- 카드 하단: `last_worker` + `last_activity_at` (null이면 숨김)
- `all_completed === true` → "✅ 완료" 뱃지 + 완료 시간
- G-AXIS Design System 토큰: `--gx-success`, `--gx-info`, `--gx-warning`

**공정 아이콘 렌더링 순서**: `['MECH', 'ELEC', 'TMS', 'PI', 'QI', 'SI']` 고정 배열 순회.
`categories`에 해당 key가 없으면 스킵 (비GAIA 모델은 TMS 없음).

**B-2 ProcessStepCard Props**:

```typescript
interface ProcessStepCardProps {
  task: SNTaskDetail;
  displayLabel: string;  // "MECH 기구", "TM 모듈" 등
}
```

- 상태 뱃지: `workers[]` 중 하나라도 `status === 'completed'` → ✅, `'in_progress'` → 🔵, 그 외 → ○
- 작업자 행: `workers[]` 배열 순회 — 시작/완료/소요시간
- 동시작업: `workers.length >= 2` → "(동시작업)" 라벨
- 소요시간 포맷: `duration_minutes` → `Xh Ym` (90분 → "1h 30m", 45분 → "45m")
- 진행중: `completed_at === null` → 완료 시간 "—", 소요 시간 "—"

**B-3 SNDetailPanel Props**:

```typescript
interface SNDetailPanelProps {
  serialNumber: string;
  product: SNProduct;    // 헤더 정보용
  tasks: SNTaskDetail[]; // useSNTasks 결과
  isLoading: boolean;
  onClose: () => void;
}
```

- 헤더: 모델명 + 고객사 + 출하계획일 + `overall_percent` progress bar
- 본문: `PROCESS_ORDER` 순서대로 `ProcessStepCard` 렌더링
- tasks에 해당 `task_category`가 없으면 "대기중" 표시
- 로딩 중: 스켈레톤 UI

**공정 순서 상수** (Teammate B가 공유 상수로 정의):

```typescript
// components/sn-status/constants.ts
export const PROCESS_ORDER = ['MECH', 'ELEC', 'TMS', 'PI', 'QI', 'SI'] as const;

export const PROCESS_LABEL: Record<string, string> = {
  MECH: 'MECH 기구',
  ELEC: 'ELEC 전장',
  TMS: 'TM 모듈',
  PI: 'PI 가압',
  QI: 'QI 공정검사',
  SI: 'SI 마무리',
};

// FE 탭 라벨 (사용자 표시용)
export const TAB_LABEL: Record<string, string> = {
  MECH: 'MECH',
  ELEC: 'ELEC',
  TMS: 'TM',
  PI: 'PI',
  QI: 'QI',
  SI: 'SI',
};
```

---

### 🅲 Teammate C: 페이지 조립 + 라우팅 + 사이드바

**담당**: 컴포넌트 조립, 검색/필터/정렬, 라우팅 등록

**선행 조건**: Teammate A + B 완료 후 진행

| 순서 | 작업 | 파일 |
|------|------|------|
| C-1 | `SNStatusPage.tsx` — 메인 페이지 조립 | `pages/production/SNStatusPage.tsx` (신규) |
| C-2 | `App.tsx` 라우팅 추가 (`/production/status`) | `App.tsx` |
| C-3 | 사이드바 메뉴 추가 ("생산현황", 생산일정과 생산실적 사이) | `components/layout/Sidebar.tsx` |
| C-4 | `npm run test` + `npm run build` 검증 | — |

**C-1 SNStatusPage 주요 로직**:

```typescript
export default function SNStatusPage() {
  const { data, isLoading, refetch, isFetching } = useSNProgress();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('전체');
  const [selectedSN, setSelectedSN] = useState<string | null>(null);
  const { data: tasks, isLoading: tasksLoading } = useSNTasks(selectedSN);

  const products = data?.products ?? [];

  // 검색 필터
  const searched = products.filter(p =>
    p.serial_number.toLowerCase().includes(search.toLowerCase()) ||
    p.model.toLowerCase().includes(search.toLowerCase())
  );

  // 공정 탭 필터 — categories[key]가 존재하는 S/N만
  const tabFiltered = activeTab === '전체'
    ? searched
    : searched.filter(p => p.categories[activeTab] != null);

  // 정렬: 진행중 > 대기 > 완료, 같은 상태 내 last_activity_at DESC
  const sorted = [...tabFiltered].sort((a, b) => {
    const rank = (p: SNProduct) =>
      p.overall_percent > 0 && !p.all_completed ? 0   // 진행중
      : !p.all_completed ? 1                            // 대기
      : 2;                                              // 완료
    const diff = rank(a) - rank(b);
    if (diff !== 0) return diff;
    return (b.last_activity_at ?? '').localeCompare(a.last_activity_at ?? '');
  });

  // ...렌더링
}
```

**C-2 App.tsx 라우팅 추가**:

```typescript
import SNStatusPage from '@/pages/production/SNStatusPage';

// 기존 생산관리 Route 사이에 추가 (/production/plan과 /production/performance 사이)
<Route
  path="/production/status"
  element={
    <ProtectedRoute allowedRoles={['admin', 'manager', 'gst']}>
      <SNStatusPage />
    </ProtectedRoute>
  }
/>
```

**C-3 사이드바 메뉴 (`Sidebar.tsx` L126~133)**:

```typescript
// 변경 전
{
  label: '생산관리',
  icon: <ClipboardIcon />,
  to: '/production/plan',
  roles: ['admin', 'manager', 'gst'],
  children: [
    { label: '생산일정', to: '/production/plan' },
    { label: '생산실적', to: '/production/performance', preparing: true },
    { label: '출하이력', to: '/production/shipment', preparing: true },
  ],
}

// 변경 후
{
  label: '생산관리',
  icon: <ClipboardIcon />,
  to: '/production/plan',
  roles: ['admin', 'manager', 'gst'],
  children: [
    { label: '생산일정', to: '/production/plan' },
    { label: '생산현황', to: '/production/status' },           // ← Sprint 18 추가
    { label: '생산실적', to: '/production/performance', preparing: true },
    { label: '출하이력', to: '/production/shipment', preparing: true },
  ],
}
```

> **메뉴 순서**: 생산일정(계획) → **생산현황**(현재 S/N 진행) → 생산실적(주간/월간 집계) → 출하이력(완료)
> 시간 흐름 순서: 미래 → 현재 → 과거

---

## Task 1: S/N 카드 리스트 (메인 뷰)

### 화면 구성

```
┌─────────────────────────────────────────────────────────────┐
│  S/N 작업 현황                                     🔄 새로고침│
├─────────────────────────────────────────────────────────────┤
│  🔍 S/N · 모델명 검색                                        │
│  [전체] [MECH] [ELEC] [TM] [PI] [QI] [SI]                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐│
│  │ GBWS-6408        │ │ GBWS-6409        │ │ DBW-3715     ││
│  │ GAIA-I DUAL      │ │ GAIA-I DUAL      │ │ GAIA-P       ││
│  │ ■■■■■□□ 76%     │ │ ■■□□□□□ 28%     │ │ ■■■■■■■ 100%││
│  │                  │ │                  │ │              ││
│  │ MM ✓  EE ✓      │ │ MM ✓  EE 🔵     │ │ MM ✓  EE ✓  ││
│  │ TM 🔵  PI ○     │ │ TM ○  PI ○      │ │ TM ✓  PI ✓  ││
│  │ QI ○  SI ○      │ │ QI ○  SI ○      │ │ QI ✓  SI ✓  ││
│  │                  │ │                  │ │              ││
│  │ 김태영·박준호     │ │ 이수진 09:15     │ │ ✅ 완료      ││
│  │ 동시작업 10:32   │ │                  │ │ 03-24 16:42  ││
│  └──────────────────┘ └──────────────────┘ └──────────────┘│
│                                                             │
│  ┌──────────────────┐ ┌──────────────────┐                  │
│  │ GPWS-0340        │ │ ...              │                  │
│  │ ...              │ │                  │                  │
│  └──────────────────┘ └──────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### 데이터 소스

- `GET /api/app/product/progress` → `products[]` (S/N별 카테고리별 진행률)
- 카드 1장 = S/N 1개 (`product`)
- progress: `product.overall_percent` — 전체 진행률 %
- 공정별: `product.categories[cat].percent` — 공정별 진행률
- 최근 태깅: `product.last_worker`, `product.last_activity_at` (Sprint 38 ✅ 완료, 연동됨)

### 데이터 범위

- **주간 필터 없음** — APP 전사 작업 진행현황과 동일 로직
- `qr_registry.status = 'active'` + `completion_status` 기준으로 진행중 S/N 전체 표시
- 완료 후 N일 이내 S/N도 포함 (`days` 파라미터, 기본 1일)
- admin/GST → 전체 S/N, 협력사 → 소속 S/N만 (기존 BE 로직 그대로)

### 카드 표시 항목

| 항목 | 소스 | 비고 |
|------|------|------|
| S/N | `product.serial_number` | |
| 모델명 | `product.model` | |
| 고객사 | `product.customer` | |
| 출하계획일 | `product.ship_plan_date` | |
| progress bar | `product.overall_percent` | 전체 진행률 % |
| 공정 상태 | `product.categories[cat].percent` | ✓완료(100%) / 🔵진행중(1~99%) / ○대기(0%) |
| 최근 작업자 | `product.last_worker` | Sprint 38 ✅ 완료 — 실제 값 표시 |
| 마지막 태깅 시간 | `product.last_activity_at` | Sprint 38 ✅ 완료 — 실제 값 표시 |

### 공정 필터 탭

| 탭 라벨 | 내부 key | 필터 기준 |
|---------|---------|----------|
| 전체 | `'전체'` | 필터 없이 전체 S/N |
| MECH | `'MECH'` | `categories['MECH']` 존재하는 S/N |
| ELEC | `'ELEC'` | `categories['ELEC']` 존재하는 S/N |
| TM | `'TMS'` | `categories['TMS']` 존재하는 S/N |
| PI | `'PI'` | `categories['PI']` 존재하는 S/N |
| QI | `'QI'` | `categories['QI']` 존재하는 S/N |
| SI | `'SI'` | `categories['SI']` 존재하는 S/N |

> **TM 탭 주의**: 사용자에게는 "TM"으로 표시하지만, 내부 필터 key는 `'TMS'` (BE categories key 기준)

### 정렬

기본: 진행중(🔵 `overall_percent > 0 && !all_completed`) > 대기(○ `overall_percent === 0`) > 완료(✓ `all_completed`).
같은 상태 내에서는 `last_activity_at` 내림차순 (Sprint 38 ✅ 완료 — `last_activity_at` 기준 정렬 활성, fallback으로 `ship_plan_date` 유지).

### 그리드 레이아웃

VIEW 대시보드는 데스크탑 기준 — `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`. 반응형으로 화면 폭에 따라 3~4열.

---

## Task 2: S/N 상세 패널 — 카드 클릭 시 사이드 패널

### 화면 구성

```
┌─────────────────────────────────────────────────────────────┐
│  ← S/N 목록                                       GBWS-6408│
├─────────────────────────────────────────────────────────────┤
│  GAIA-I DUAL  |  MICRON  |  출하: 2026-04-17                │
│  Progress: ■■■■■□□  76%  (4/6 공정 완료)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ MECH 기구 ──────────────────────────────────── ✅ ────┐│
│  │  👤 김태영     09:00 → 10:32    소요: 1h 32m           ││
│  │  👤 박준호     09:05 → 10:30    소요: 1h 25m  (동시작업) ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─ ELEC 전장 ──────────────────────────────────── ✅ ────┐│
│  │  👤 이수진     10:45 → 12:10    소요: 1h 25m           ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─ TM 모듈 ───────────────────────────────────── 🔵 ────┐│
│  │  👤 정민수     13:00 → 진행중    소요: —                ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─ PI 가압 ───────────────────────────────────── ○ ─────┐│
│  │  대기중                                                ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─ QI 공정검사 ────────────────────────────────── ○ ────┐│
│  │  대기중                                                ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─ SI 마무리 ──────────────────────────────────── ○ ────┐│
│  │  대기중                                                ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 데이터 소스

- `GET /tasks/<serial_number>?all=true` — 카드 클릭 시 1건만 호출
- 각 task의 `workers[]` 배열 — **동시작업 시 복수 작업자 모두 표시**
- `useSNTasks(serialNumber)` — `enabled: !!serialNumber`로 조건부 호출

### 공정별 카드 표시

| 항목 | 소스 | 비고 |
|------|------|------|
| 공정명 | `PROCESS_LABEL[task.task_category]` | "MECH 기구" / "TM 모듈" 등 |
| 상태 | workers 기반 판정 | ✅ completed / 🔵 in_progress / ○ 대기 |
| 작업자 (복수) | `workers[]` | 동시작업 시 배열 내 모두 나열 |
| 시작 시간 | `workers[].started_at` | `HH:mm` 포맷 |
| 완료 시간 | `workers[].completed_at` | 진행중이면 "—" |
| 소요 시간 | `workers[].duration_minutes` | 포맷: "1h 32m" / "45m" |

### 공정 순서 (고정)

`PROCESS_ORDER = ['MECH', 'ELEC', 'TMS', 'PI', 'QI', 'SI']`

tasks 응답을 `PROCESS_ORDER` 기준 정렬. 응답에 없는 공정은 `product.categories`에 해당 key가 있으면 "대기중" 표시, 없으면 스킵.

### 동시작업 표현

- `workers.length >= 2` → "(동시작업)" 라벨 표시
- 각 작업자별 시작/완료/소요시간 개별 행으로 표시
- 기존 OPS BE의 `work_start_log` + `work_completion_log` JOIN 구조가 동시작업을 이미 지원

---

## Task 3: 데이터 새로고침

### 방식

- 페이지 진입 시 자동 fetch (TanStack Query `useQuery` 기본 동작)
- 수동 새로고침 버튼 (🔄) → `refetch()` 호출
- **실시간 자동 갱신 불필요** — 현재 단계에서는 수동 새로고침으로 충분
- `placeholderData: keepPreviousData` 적용 — 새로고침 시 깜빡임 방지 (Sprint 17과 동일)
- `refetchOnWindowFocus: true` (TanStack Query 기본값) — 탭 포커스 복귀 시 자동

### 상세 패널 데이터

- 카드 클릭 시 `GET /tasks/<sn>?all=true` 호출 (1건)
- TanStack Query `useQuery` — queryKey: `['sn', 'tasks', serialNumber]`
- 패널 열린 상태에서 새로고침 버튼 클릭 시 리스트 + 상세 모두 `invalidateQueries`
- 다른 카드 클릭 시 `selectedSN` 변경 → 자동으로 새 queryKey fetch

---

## Task 4: 테스트 + regression + 빌드

- [x] `types/snStatus.ts` — 타입 정의 lint 통과
- [x] `api/snStatus.ts` — API 함수 export 확인
- [x] `useSNProgress` / `useSNTasks` — hook 동작 확인
- [x] `SNCard` — progress bar + 공정 아이콘 렌더링
- [x] `SNDetailPanel` — 공정 순서 + 동시작업 표현
- [x] `SNStatusPage` — 검색 + 필터 + 정렬 동작
- [x] `App.tsx` — `/production/status` 라우팅 접근 가능
- [x] `Sidebar.tsx` — "생산현황" 메뉴 위치 정상 (생산일정↔생산실적 사이)
- [ ] `npm run test` 전체 regression
- [x] `npm run build` 빌드 확인 (타입 에러 없음)

---

## 변경 파일

| 파일 | 변경 | Teammate |
|------|------|----------|
| `types/snStatus.ts` (신규) | SNProduct, SNTaskDetail 등 타입 | 🅰 |
| `api/snStatus.ts` (신규) | getSNProgress, getSNTasks API | 🅰 |
| `hooks/useSNProgress.ts` (신규) | progress 조회 hook | 🅰 |
| `hooks/useSNTasks.ts` (신규) | tasks 상세 hook | 🅰 |
| `components/sn-status/constants.ts` (신규) | PROCESS_ORDER, PROCESS_LABEL | 🅱 |
| `components/sn-status/SNCard.tsx` (신규) | S/N 카드 컴포넌트 | 🅱 |
| `components/sn-status/ProcessStepCard.tsx` (신규) | 공정별 상세 카드 | 🅱 |
| `components/sn-status/SNDetailPanel.tsx` (신규) | S/N 상세 사이드 패널 | 🅱 |
| `pages/production/SNStatusPage.tsx` (신규) | 메인 페이지 조립 | 🅲 |
| `App.tsx` | 라우팅 추가 `/production/status` | 🅲 |
| `components/layout/Sidebar.tsx` | "생산현황" 메뉴 추가 (생산일정↔생산실적 사이) | 🅲 |

**OPS BE**: Sprint 38 ✅ 완료 (2026-03-27) — `last_worker`, `last_activity_at` API 반환 확인. VIEW FE 자동 연동됨.

---

## 체크리스트

**Teammate 🅰 (타입 + API + Hook)**:
- [x] `types/snStatus.ts` — SNProduct, SNProgressResponse, TaskWorker, SNTaskDetail
- [x] `api/snStatus.ts` — getSNProgress(), getSNTasks()
- [x] `hooks/useSNProgress.ts` — keepPreviousData 포함
- [x] `hooks/useSNTasks.ts` — enabled 조건부, queryKey 분리

**Teammate 🅱 (컴포넌트)**:
- [x] `constants.ts` — PROCESS_ORDER, PROCESS_LABEL, TAB_LABEL
- [x] `SNCard.tsx` — progress bar + 공정 아이콘 6개 + last_worker null 처리
- [x] `ProcessStepCard.tsx` — 작업자 행 + 동시작업 라벨 + 소요시간 포맷
- [x] `SNDetailPanel.tsx` — 헤더 + 공정 순서 정렬 + 로딩 스켈레톤

**Teammate 🅲 (페이지 + 라우팅)**:
- [x] `SNStatusPage.tsx` — 검색 + 필터 + 정렬 + 카드 그리드 + 상세 패널 토글
- [x] `App.tsx` — `/production/status` 라우팅 + ProtectedRoute
- [x] `Sidebar.tsx` — "생산현황" 메뉴 (생산일정↔생산실적 사이 배치)
- [x] `npm run build` 전체 통과

**검증 (배포 후)**:
- [ ] 🔴 admin/manager/gst 로그인 → 전체 S/N 표시
- [ ] 🔴 협력사 로그인 → 소속 S/N만 표시
- [ ] 🔴 검색 (S/N, 모델명) 정상 동작
- [ ] 🔴 공정 필터 탭 7개 전환 정상 (전체 + 6공정)
- [ ] 🔴 TM 탭 → `categories['TMS']` 기반 필터 정상
- [ ] 🔴 카드 클릭 → 상세 패널 정상 표시
- [ ] 🔴 작업자별 시작/완료/소요 시간 정확
- [ ] 🔴 동시작업 task → 복수 작업자 모두 표시
- [ ] 🔴 새로고침 시 깜빡임 없음 (keepPreviousData)
- [ ] 🔴 정렬: 진행중 > 대기 > 완료 순서 정상
- [ ] 🔴 비GAIA 모델 (TMS 없음) → TM 탭에서 미표시, 카드에 TM 아이콘 스킵

---

## 규칙 — Sprint 18

- **OPS BE Sprint 38 ✅ 완료** (2026-03-27) — `GET /api/app/product/progress`에서 `last_worker`, `last_activity_at` 실제 값 반환. VIEW FE는 null fallback 로직으로 자동 연동됨.
- **VIEW 대시보드 전용** — APP에는 변경 없음. APP = QR 태깅 액션, VIEW = 현황 조회
- 카드 리스트 데이터: **`GET /api/app/product/progress`** — APP 전사 작업 진행현황과 동일 API
- 공정 탭 **라벨 vs 내부 key 구분**: 사용자 라벨 `TM` / 내부 key `TMS` (BE categories key)
- 공정 순서 **MECH → ELEC → TMS → PI → QI → SI 고정** (`PROCESS_ORDER` 상수)
- **동시작업 지원 필수** — `workers[]` 배열 복수 항목을 개별 행으로 표시
- 권한: **admin/manager/gst → 전체 S/N** / 협력사 → 소속 기준 (BE `progress_service.py` 기존 로직)
- progress 계산은 `product.overall_percent` + `categories[cat].percent` 기준 — FE에서 별도 재계산 금지
- 실시간 자동 갱신 불필요 — 수동 새로고침 + `keepPreviousData`
- **null guard 필수** — `categories[cat]?.percent ?? 0`, `last_worker ?? null`, `workers ?? []`
- Teammate 간 의존: 🅰 완료 → 🅱 병렬 → 🅲 조립 순서
- G-AXIS Design System 토큰 사용
- ⚠️ ConfirmSettingsPanel 수정 금지
- ⚠️ `isProcessEnabled()` 수정 금지
- ⚠️ 기존 생산실적 페이지 (`ProductionPerformancePage.tsx`) 수정 금지
- ⚠️ `.env` 절대 커밋 금지
- ⚠️ 테스트에서 실제 API 호출 금지 (mock only)
- 완료 시 DESIGN_FIX_SPRINT.md 체크리스트 업데이트
---

# Sprint 19 (VIEW HOTFIX): 공장 대시보드 자동 새로고침 최적화 (2026-03-25) ✅ 완료

> **유형**: HOTFIX — 공장 대형모니터 운용 환경 대응
> **선행**: 없음 (독립 수정)
> **대상**: `FactoryDashboardPage.tsx`, `hooks/useFactory.ts`

## 배경

**사용 환경**: 공장 대시보드 페이지는 웹 브라우저뿐 아니라 **공장 대형모니터에서 상시 표시**용으로 사용됨. 자체적인 자동 새로고침이 필수.

**기존 문제 2가지**:

1. **마운트 시점 고정**: `new Date().getHours()`가 컴포넌트 마운트 시 1회만 평가됨 → 07시에 켜놓으면 08시가 지나도 `isWorkHours = false` 고정 → 자동 새로고침 미작동
2. **10분 간격 과다**: 하루 08~20시 기준 72회/일 호출 → BE 부하 불필요. 수동 새로고침 버튼으로 실시간 확인 가능하므로 자동은 30분이면 충분

## Task 1: `FactoryDashboardPage.tsx` — refetchInterval 함수형 전환 + 30분

### 변경 이유

- `refetchInterval`에 함수를 전달하면 TanStack Query v5가 **매 interval마다 함수를 재실행**하여 현재 시각 기준으로 동적 판단
- 대형모니터 장시간 켜둔 상태에서 업무시간 전환 자동 대응
- 30분 간격 = 하루 약 24회 호출 (기존 72회 대비 1/3)

### 변경 전 (`FactoryDashboardPage.tsx` line 58~61)

```typescript
// 근무시간(08~20시)에만 10분 자동 새로고침
const hour = new Date().getHours();
const isWorkHours = hour >= 8 && hour < 20;
const REFRESH_INTERVAL = isWorkHours ? 10 * 60 * 1000 : false; // 10분 or 비활성
```

### 변경 후

```typescript
// 근무시간(08~20시) 30분 자동 새로고침, 야간 비활성
// 함수형 → 매 interval마다 현재 시각 재평가 (대형모니터 장시간 운용 대응)
const autoRefreshInterval = () => {
  const h = new Date().getHours();
  return (h >= 8 && h < 20) ? 30 * 60 * 1000 : false;
};
```

### hook 호출부 변경

```typescript
// Before
useWeeklyKpi({ refetchInterval: REFRESH_INTERVAL });
useMonthlyDetail({ ..., refetchInterval: REFRESH_INTERVAL });

// After
useWeeklyKpi({ refetchInterval: autoRefreshInterval });
useMonthlyDetail({ ..., refetchInterval: autoRefreshInterval });
```

## Task 2: `hooks/useFactory.ts` — RefetchInterval 타입 확장

### 변경 이유

기존 타입 `number | false`는 함수형을 허용하지 않음. TanStack Query v5는 `() => number | false` 형태도 지원하므로 타입을 확장해야 함.

### 변경 전

```typescript
export function useWeeklyKpi(params: WeeklyKpiParams & { refetchInterval?: number | false } = {}) {
```

### 변경 후

```typescript
type RefetchInterval = number | false | (() => number | false);

export function useMonthlyDetail(params: MonthlyDetailParams & { refetchInterval?: RefetchInterval } = {}) {
// ...
export function useWeeklyKpi(params: WeeklyKpiParams & { refetchInterval?: RefetchInterval } = {}) {
```

## 수정하지 않는 것

- `handleRefreshAll` (수동 새로고침 버튼): 기존 즉시 refetch 유지 — 변경 없음
- `refetchOnWindowFocus`: TanStack Query 기본값 `true` — 탭 포커스 복귀 시 자동 refetch 이미 활성

## 검증 체크리스트

- [x] `autoRefreshInterval` 함수가 매 interval마다 재평가되는지 확인
- [x] 업무시간 (08~20) → 30분 간격 동작
- [x] 야간 (20~08) → 자동 새로고침 비활성
- [x] 수동 새로고침 버튼 정상 동작 (즉시 refetch)
- [x] `useFactory.ts` 타입 에러 없음
- [x] 기존 `useEtlChanges`는 별도 interval 없음 — 영향 없음

## 규칙 — Sprint 19

- **수동 새로고침 = 실시간**, 자동 새로고침 = 30분 주기 — 역할 분리
- 야간 새로고침 불필요 (야간 근무 없음)
- BE 부하 최소화 — 자동 새로고침은 30분 이하로 줄이지 않음

---

# Sprint 18-C (VIEW): 상세뷰 버그 수정 — 카테고리별 다중 task 렌더링 + UX 개선 (2026-03-27)

> **유형**: BUG FIX + UX 개선
> **선행**: Sprint 18 완료, OPS BE 정상 (API 응답 확인 완료)
> **대상**: `SNDetailPanel.tsx`, `ProcessStepCard.tsx`

## 이슈 1 (Critical): 카테고리별 task 1건만 렌더링 — `tasks.find()` 버그

### 증상

- 카드뷰: 김하늘 (I.F 2, ELEC) 정상 표시 ✅
- 상세뷰: ELEC에 PANEL_WORK (test-C&A) 1건만 표시, **I.F 2 (김하늘) 누락** ❌
- API 응답에는 ELEC task 복수 건 (PANEL_WORK, IF_2 등) + 각 workers 정상 반환 확인됨

### 원인

`SNDetailPanel.tsx` 라인 144:

```typescript
const task = tasks.find(t => t.task_category === cat) ?? null;
```

`Array.find()`는 **첫 번째 매칭만** 반환. 같은 카테고리에 여러 task가 있어도 1건만 ProcessStepCard에 전달되고 나머지는 버려짐.

### 수정안

`find()` → `filter()`로 변경하여 같은 카테고리의 **모든 task**를 렌더링.

**현재 코드** (라인 ~142-165):
```tsx
PROCESS_ORDER.map((cat) => {
  if (product.categories[cat] == null) return null;
  const task = tasks.find(t => t.task_category === cat) ?? null;

  if (CHECKLIST_CATEGORIES.has(cat)) {
    return (
      <ChecklistProcessCard
        key={cat}
        cat={cat}
        serialNumber={serialNumber}
        task={task}
      />
    );
  }

  return (
    <ProcessStepCard
      key={cat}
      task={task}
      displayLabel={PROCESS_LABEL[cat] ?? cat}
    />
  );
})
```

**변경 코드**:
```tsx
PROCESS_ORDER.map((cat) => {
  if (product.categories[cat] == null) return null;
  const catTasks = tasks.filter(t => t.task_category === cat);

  if (catTasks.length === 0) {
    // task 없는 카테고리 — 대기중 카드 1개
    if (CHECKLIST_CATEGORIES.has(cat)) {
      return (
        <ChecklistProcessCard
          key={cat}
          cat={cat}
          serialNumber={serialNumber}
          task={null}
        />
      );
    }
    return (
      <ProcessStepCard
        key={cat}
        task={null}
        displayLabel={PROCESS_LABEL[cat] ?? cat}
      />
    );
  }

  // 같은 카테고리의 모든 task를 개별 카드로 렌더링
  return catTasks.map((task) => {
    if (CHECKLIST_CATEGORIES.has(cat)) {
      return (
        <ChecklistProcessCard
          key={`${cat}-${task.id}`}
          cat={cat}
          serialNumber={serialNumber}
          task={task}
        />
      );
    }
    return (
      <ProcessStepCard
        key={`${cat}-${task.id}`}
        task={task}
        displayLabel={task.task_name || PROCESS_LABEL[cat] || cat}
      />
    );
  });
})
```

> **변경 포인트**:
> 1. `find()` → `filter()` — 같은 카테고리의 모든 task 조회
> 2. 각 task별 개별 카드 렌더링 — `key`에 `task.id` 포함
> 3. `displayLabel`에 `task.task_name` 우선 표시 (같은 카테고리 내 구분)
> 4. task 없는 카테고리는 기존처럼 null → 대기중 카드

## 이슈 2: 체크리스트 기본 접기

### 증상
상세뷰에서 체크리스트가 기본으로 전체 펼쳐져 있어 화면을 과도하게 차지.

### 수정안
`ProcessStepCard.tsx`에서 체크리스트 `useState(false)` → 클릭 토글.
이미 라인 50에 `const [checklistOpen, setChecklistOpen] = useState(false);` 가 있으므로, 체크리스트 렌더링 부분에 `checklistOpen` 조건만 추가.

## 이슈 3: last_task_name 카드뷰 연결

### 현황
OPS BE Sprint 38-B 배포 완료 — API 응답에 `last_task_name`, `last_task_category` 필드 이미 포함 확인됨 (예: `"last_task_name": "I.F 2"`).

### 수정안
`SNCard.tsx`에서 `last_worker` 옆에 `last_task_name` 표시 추가.

```tsx
// 현재: "김하늘 · 03-27 13:09"
// 변경: "김하늘 · I.F 2 · 03-27 13:09"
```

## 수정 파일 요약

| 파일 | 이슈 | 변경 |
|------|------|------|
| `SNDetailPanel.tsx` | 이슈 1 | `find()` → `filter()` + 다중 task 렌더링 |
| `ProcessStepCard.tsx` | 이슈 2 | 체크리스트 `checklistOpen` 토글 조건 적용 |
| `SNCard.tsx` | 이슈 3 | `last_task_name` 표시 추가 |

## 규칙 — Sprint 18-C

- ⛔ `snStatus.ts` (API 호출) 수정 금지 — BE 응답 정상 확인됨
- ⛔ `constants.ts` (`PROCESS_ORDER`, `PROCESS_LABEL`) 수정 금지
- ⛔ `useChecklist.ts` 수정 금지
- ⛔ Sprint 20 체크리스트 관리 기능 수정 금지
- ✅ `SNDetailPanel.tsx`, `ProcessStepCard.tsx`, `SNCard.tsx` 3개 파일만 수정

---

# Sprint 20 (VIEW): 체크리스트 관리 + 생산현황 연동 (2026-03-26)

## 개요

MECH/ELEC/TM 자주검사 체크리스트를 VIEW 대시보드에서 관리하고, 생산현황 S/N 디테일에서 체크리스트 완료 현황을 확인하는 기능.

> **참고**: 전체 설계 상세는 `AXIS-OPS/BACKLOG.md` → `🟡 체크리스트 확장 설계` 섹션 참조.
> ELEC 양식은 수집 대기 중. TM/MECH 기준으로 목업 우선 제작.

---

## 사이드바 배치

### Management 그룹에 추가

```
Management (관리)
  ├── QR 관리           /qr                    ← 기존
  ├── 체크리스트 관리    /checklist             ← 신규 ★
  └── 권한 관리         /admin/permissions      ← 기존
```

### 배치 근거

1. **설정/관리 성격**: 체크리스트 마스터 항목 CRUD는 "조회"가 아니라 "설정" 작업. QR 관리(QR 마스터 데이터), 권한 관리(사용자 권한)와 같은 성격.
2. **수정 빈도**: 제품 변경, 신규 항목 추가, 검사 기준 변경 등 수시로 편집이 발생함. 생산관리(모니터링 중심)보다 Management(마스터 데이터 관리)에 두는 게 자연스러움.
3. **역할 분리**: 생산현황에서는 체크리스트 완료 현황을 "조회"만 하고, 항목 자체의 "관리"는 별도 Management 메뉴에서 수행. 조회와 관리의 진입점이 분리됨.
4. **라우트 깔끔함**: `/production/` 하위는 모니터링 페이지들로 유지, `/checklist`는 독립 경로.

### 라우트 추가

```typescript
// App.tsx
<Route path="/checklist" element={
  <ProtectedRoute allowedRoles={['admin', 'manager', 'gst']}>
    <ChecklistManagePage />
  </ProtectedRoute>
} />
```

### Sidebar.tsx 메뉴 아이템 추가

```typescript
// Management 그룹 children 배열에 추가 (QR 관리와 권한 관리 사이)
{
  label: '체크리스트 관리',
  path: '/checklist',
  icon: ClipboardCheck,  // lucide-react
  roles: ['admin', 'manager', 'gst'],
  status: 'active',
}
```

---

## Page 1: 체크리스트 관리 (`/checklist`)

### 목적

product_code × category별 checklist_master 항목을 CRUD 관리하는 페이지.
PM이 여기서 항목을 추가/수정/비활성화하면, APP에서 자주검사 시 해당 항목이 반영됨.

### 컨셉

```
┌─────────────────────────────────────────────────────────────┐
│  체크리스트 관리                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Product Code: [ ▼ 선택 ────────── ]    [+ 항목 추가]       │
│                                                             │
│  ┌──────┬──────┬──────┐                                     │
│  │ MECH │ ELEC │  TM  │  ← category 탭                     │
│  └──────┴──────┴──────┘                                     │
│  ☑ 2차판정 필요 (second_judgment_required)  ← 토글 스위치    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ # │ 그룹        │ 항목명              │ 타입  │ 기준/SPEC        │ 검사방법   │ 활성 │ 액션     │  │
│  ├───┼─────────────┼────────────────────┼──────┼─────────────────┼──────────┼─────┼─────────┤  │
│  │ 1 │ 3Way V/V    │ Spec 확인          │ CHECK│ 도면 1:1 확인    │ 육안 검사 │  ✅  │ ✏️ 🗑️   │  │
│  │ 2 │ 3Way V/V    │ 볼트 체결          │ CHECK│ 조립 유동 여부   │ 촉수 검사 │  ✅  │ ✏️ 🗑️   │  │
│  │ 3 │ WASTE GAS   │ 배관 도면 일치     │ CHECK│ 도면 1:1 확인    │ 육안 검사 │  ✅  │ ✏️ 🗑️   │  │
│  │ · │ ···         │ ···                │ ···  │ ···             │ ···      │ ··· │ ···     │  │
│  │38 │ LNG         │ MFC Maker/Spec     │ INPUT│ —               │ —        │  ✅  │ ✏️ 🗑️   │  │
│  │ · │ ···         │ ···                │ ···  │ ···             │ ···      │ ··· │ ···     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  총 60개 항목 (CHECK 52 / INPUT 8) │ 활성 58 / 비활성 2     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### UI 요소 상세

#### 필터 영역
- **Product Code 드롭다운**: product_info 테이블에서 active 제품 목록. 선택 시 해당 제품의 마스터 항목 로드
- **Category 탭**: MECH / ELEC / TM (탭 전환 시 필터링)
- **2차판정 토글**: `second_judgment_required` ON/OFF. 카테고리 단위로 적용

#### 테이블
- **컬럼**: 순서(item_order) / inspection_group / item_name / item_type 뱃지(CHECK=파랑, INPUT=주황) / spec_criteria / inspection_method / is_active 토글 / 액션(수정, 비활성화)
- **그룹핑**: inspection_group 기준으로 시각적 구분 (행 배경색 교대 또는 그룹 헤더 행)
- **드래그 정렬**: item_order 변경 (nice-to-have, 초기에는 수동 번호 입력)

#### 항목 추가 모달
- inspection_group (기존 그룹에서 선택 또는 신규 입력)
- item_name (필수)
- item_type (CHECK / INPUT 라디오)
- spec_criteria (선택)
- inspection_method (선택)
- item_order (자동 = 현재 max + 1, 수동 변경 가능)

#### 인라인 수정
- 테이블 행에서 직접 더블클릭 편집 또는 수정 아이콘 클릭 → 인라인 입력 전환
- 저장/취소 버튼

#### 비활성화 (Soft Delete)
- 삭제 버튼 → 확인 다이얼로그 → `is_active = FALSE`
- 비활성 항목은 회색 처리 + "비활성" 뱃지
- 필터: "비활성 항목 포함" 체크박스

### API 연결

```typescript
// api/checklist.ts
export const checklistApi = {
  // 마스터 목록 조회
  getMasterList: (category: string, productCode: string) =>
    apiClient.get('/api/admin/checklist/master', { params: { category, product_code: productCode } }),

  // 항목 생성
  createMaster: (data: CreateMasterPayload) =>
    apiClient.post('/api/admin/checklist/master', data),

  // 항목 수정
  updateMaster: (id: number, data: UpdateMasterPayload) =>
    apiClient.put(`/api/admin/checklist/master/${id}`, data),

  // 항목 비활성화
  deleteMaster: (id: number) =>
    apiClient.delete(`/api/admin/checklist/master/${id}`),
}
```

```typescript
// hooks/useChecklistMaster.ts
export const useChecklistMaster = (category: string, productCode: string) =>
  useQuery({
    queryKey: ['checklist', 'master', category, productCode],
    queryFn: () => checklistApi.getMasterList(category, productCode),
    enabled: !!productCode,
  })

export const useCreateMaster = () =>
  useMutation({
    mutationFn: checklistApi.createMaster,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklist', 'master'] }),
  })

// useUpdateMaster, useDeleteMaster 동일 패턴
```

### 파일 구조

```
src/
├── pages/checklist/
│   └── ChecklistManagePage.tsx        ← 페이지 컴포넌트
├── components/checklist/
│   ├── ChecklistTable.tsx             ← 마스터 항목 테이블
│   ├── ChecklistFilterBar.tsx         ← product_code 드롭다운 + category 탭
│   ├── ChecklistAddModal.tsx          ← 항목 추가 모달
│   └── ChecklistRowEditor.tsx         ← 인라인 수정 행
├── api/
│   └── checklist.ts                   ← API 클라이언트
├── hooks/
│   └── useChecklistMaster.ts          ← TanStack Query 훅
└── types/
    └── checklist.ts                   ← 타입 정의
```

---

## Page 2: 생산현황 체크리스트 연동 (`/production/status` 기존 페이지 확장)

### 목적

기존 SNDetailPanel의 ProcessStepCard를 확장하여, 카테고리(MECH/ELEC/TM) 클릭 시 작업자 태깅 정보와 함께 체크리스트 완료 현황을 표시.

### 컨셉 — ProcessStepCard 확장

```
┌──────────────────────────────────────────────┐
│ TMS                              진행중 🔵   │
│ ▼ (확장됨)                                    │
├──────────────────────────────────────────────┤
│                                              │
│  📋 작업자                                    │
│  ┌──────────────────────────────────────┐    │
│  │ 👤 Park, M   09:15 → 10:45 (1h30m) │    │
│  │ 👤 Lee, S    09:30 → 진행중         │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ✅ 체크리스트    12 / 15 완료                 │
│  ┌──────────────────────────────────────┐    │
│  │ ████████████░░░░░░ 80%              │    │
│  │                                      │    │
│  │ 미완료 항목:                          │    │
│  │  ○ TANK — Cir Pump Spec 확인         │    │
│  │  ○ TANK — Flow Sensor Swirl Orifice  │    │
│  │  ○ 설비 상부 — Drain Nut 조립 상태    │    │
│  └──────────────────────────────────────┘    │
│                                              │
└──────────────────────────────────────────────┘
```

### 로직

1. ProcessStepCard 확장 시 기존 task API + 체크리스트 API **병렬 호출**
2. 체크리스트 API: 기존 `GET /api/app/checklist/{SN}/{category}` 그대로 사용 (APP과 동일 API 공유)
3. 응답에서 `item_type = 'CHECK'`인 항목만 카운트 (INPUT은 실적 승인 조건 아님)
4. 완료 = record 존재 (status = PASS 또는 NA) / 미완료 = record 없음 (LEFT JOIN NULL)
5. 프로그레스 바 + 미완료 항목만 리스트

### API 연결

```typescript
// hooks/useChecklist.ts (신규)
export const useChecklist = (serialNumber: string, category: string) =>
  useQuery({
    queryKey: ['checklist', serialNumber, category],
    queryFn: () => apiClient.get(`/api/app/checklist/${serialNumber}/${category}`),
    enabled: !!serialNumber && !!category,
    staleTime: 60_000,  // 1분
  })
```

### 수정 파일

```
src/
├── components/sn-status/
│   └── ProcessStepCard.tsx            ← 기존 파일 수정 (체크리스트 섹션 추가)
├── hooks/
│   └── useChecklist.ts                ← 신규 (체크리스트 조회 훅)
└── types/
    └── checklist.ts                   ← 체크리스트 응답 타입 (Page 1과 공유)
```

---

## Phase 2: S/N 카드 레벨 요약 (후순위)

### 컨셉 — SNCard에 체크리스트 아이콘 추가

```
┌─────────────────────────────┐
│  SN-001                     │
│  AXIS-1000                  │
│  ████████████░░ 80%         │
│  MECH ✓  ELEC ●  TMS ○     │
│  📋 ✅2/3                    │  ← 체크리스트 요약 아이콘
│  Park, M · 14:30            │
└─────────────────────────────┘
```

### BE API (신규)

```
GET /api/admin/checklist/summary?serial_numbers=SN-001,SN-002,...
```

SQL 한 번으로 복수 S/N 집계:

```sql
SELECT cr.serial_number, cm.category,
       COUNT(*) FILTER (WHERE cm.item_type = 'CHECK' AND cm.is_active = TRUE) AS total,
       COUNT(*) FILTER (WHERE cr.status IS NOT NULL) AS checked
FROM checklist.checklist_master cm
LEFT JOIN checklist.checklist_record cr ON cr.master_id = cm.id
WHERE cr.serial_number = ANY(%(sns)s)
GROUP BY cr.serial_number, cm.category
```

FE에서 progress API 호출 후 S/N 목록으로 summary API **1회 추가 호출** → 총 2회로 해결.

---

## 설계 원칙

1. **대시보드 중심 관리**: 코드 레벨 조건부 로직(product_info JOIN 등) 사용 안 함. 제품별 항목 차이는 VIEW에서 PM이 직접 관리
2. **API 공유**: APP(Flutter)과 VIEW(React)가 동일한 checklist API 사용. 옵션 B (별도 호출) 채택
3. **INPUT은 선택**: INPUT 항목은 비어있어도 실적 승인 무관. CHECK 항목 전체 판정 완료만 확인
4. **Soft Delete**: 마스터 항목 삭제 = `is_active = FALSE`. 기존 record 보존

## 스키마 참조 (OPS BE 작업)

> checklist_master/record 스키마 확장 상세는 `AXIS-OPS/BACKLOG.md` → `스키마 확장` 섹션 참조.
> BE Sprint에서 migration + CRUD API 구현 후 VIEW 목업 연동.

### checklist_master 추가 컬럼

| 컬럼 | 타입 | 용도 |
|------|------|------|
| `inspection_group` | VARCHAR(100) | 검사 항목 그룹 (BURNER, LNG 등) |
| `item_type` | VARCHAR(10) DEFAULT 'CHECK' | CHECK = 판정 / INPUT = 직접 입력 |
| `spec_criteria` | VARCHAR(255) | 기준/SPEC |
| `inspection_method` | VARCHAR(100) | 검사 방법 |
| `second_judgment_required` | BOOLEAN DEFAULT FALSE | 2차판정 옵션키 |

### checklist_record 변경

| 변경 | 설명 |
|------|------|
| `is_checked` → `status` | VARCHAR(10): PASS / NA |
| `judgment_round` 추가 | INTEGER DEFAULT 1 (1차=1, 2차=2) |
| UNIQUE 변경 | `(serial_number, master_id)` → `(serial_number, master_id, judgment_round)` |

## MECH 항목 요약 (TM/ELEC도 동일 구조)

20개 그룹, 약 60개 항목:
- #1 3Way V/V (2) → #2 WASTE GAS (2) → #3 INLET (1+1 INPUT) → #4 BURNER (3) → #5 REACTOR (4) → #6 GN2 (4+2 INPUT) → #7 LNG (3+1) → #8 O2 (3+1) → #9 CDA (4+2) → #10 BCW (4+1) → #11 PCW-S (4+1) → #12 PCW-R (4+1) → #13 Exhaust (4) → #14 TANK (3) → #15 PU (1) → #16 설비 상부 (3) → #17 설비 전면부 (1) → #18 H/J (3) → #19 Quenching (2) → #20 눈관리 (1)

## 옵션키 (2차판정)

- **OFF**: CHECK 전항목 1차판정 완료 → 실적 승인 가능
- **ON**: 1차 + 2차 모두 완료 → 실적 승인 가능
- TM/MECH/ELEC 동일 조건

## 구현 우선순위

| 순서 | 대상 | 내용 | 의존성 |
|------|------|------|--------|
| 1 | OPS BE | checklist 스키마 migration + Admin CRUD API 4개 | 없음 |
| 2 | VIEW | 체크리스트 관리 페이지 목업 + API 연동 | OPS BE #1 |
| 3 | VIEW | 생산현황 ProcessStepCard 체크리스트 섹션 | OPS BE #1 |
| 4 | OPS APP | 자주검사 토스트 팝업 (기존 API 활용) | OPS BE #1 |
| 5 | OPS BE + VIEW | S/N 카드 레벨 summary 집계 API (Phase 2) | #2, #3 완료 후 |

## 규칙 — Sprint 20

- `AXIS-OPS/BACKLOG.md` 체크리스트 섹션이 **Single Source of Truth**. 스키마/API 변경 시 BACKLOG 먼저 업데이트
- ELEC 양식 수집 후 동일 구조로 추가 (컬럼 구조 동일하므로 데이터만 추가)
- 목업 우선 → BE API 구현 후 실 연동

---

# Sprint 21 (VIEW): 반응형 레이아웃 — 태블릿 우선 대응 (2026-03-28)

> 참조 문서: `docs/sprints/RESPONSIVE_DESIGN_PLAN.md` (v2)
> 우선 목표: 태블릿(768~1024px)에서 정상 표시
> BE 수정: 없음 (FE 전용 스프린트)
> 상태: ✅ 구현 완료 (수동 검증 일부 미완)

---

## 팀 구성 & 모델 설정

### 리드 에이전트 (Lead — 설계 조율)
- **모델**: Opus (claude-opus-4-6)
- **역할**: 전체 아키텍처 설계, 에이전트 간 조율, 코드 리뷰, 의사결정
- **모드**: Delegate 모드 (Shift+Tab) — 리드는 직접 코드 작성하지 않고 조율만 수행
- **권한**: 모든 파일 읽기 가능, 직접 수정은 하지 않음

### 워커 에이전트 (Workers — 구현/테스트)
- **모델**: Sonnet (claude-sonnet-4-5)
- **역할**: FE-CORE, FE-PAGE, TEST 각각 담당 영역의 코드 구현
- **모드**: 사용자 승인 후 코드 수정 가능 (위임 모드)

### 위임 모드 규칙
1. 리드가 작업을 분배하고 워커에게 위임
2. 워커는 코드 변경 전 **반드시 사용자 승인** 필요
3. 파일 소유권 위반 시 즉시 중단
4. 스프린트 단위로 작업 진행

---

## 워커 배치 (3명 병렬)

### 🅰 FE-CORE (레이아웃 + CSS 담당)
- **소유 파일**:
  - `src/index.css`
  - `src/components/layout/Layout.tsx`
  - `src/components/layout/Sidebar.tsx`
  - `src/components/layout/Header.tsx`
  - `src/components/layout/MobileNav.tsx` (신규)
- **모델**: Sonnet

### 🅱 FE-PAGE (페이지별 className 적용 담당)
- **소유 파일**: `src/pages/**/*.tsx` (14개 페이지)
- **의존성**: 🅰 FE-CORE의 CSS 클래스 정의 완료 후 시작
- **모델**: Sonnet

### 🅲 TEST (검증 담당)
- **소유 파일**: 없음 (읽기 전용)
- **역할**: 빌드 검증 + 브레이크포인트별 스크린 점검
- **의존성**: 🅰 + 🅱 완료 후 시작
- **모델**: Sonnet

---

## Phase B: 사이드바 접기 (🅰 FE-CORE 단독)

> 태블릿에서 260px 사이드바가 콘텐츠를 압축하는 핵심 문제 해결

### Task B-1: CSS 변수 추가 (`index.css`)

**before** (현재 index.css :root)
```css
--sidebar-width: 260px;
```

**after**
```css
--sidebar-width: 260px;
--sidebar-collapsed-width: 64px;
```

### Task B-2: Layout.tsx — collapsed 상태 관리

**추가할 코드**
```tsx
import { useState, useEffect } from 'react';

// Layout 컴포넌트 내부
const [collapsed, setCollapsed] = useState(() =>
  localStorage.getItem('sidebar_collapsed') === 'true'
);
const [isMobile, setIsMobile] = useState(false);
const [mobileOpen, setMobileOpen] = useState(false);

// 반응형 리스너
useEffect(() => {
  const tabletMql = window.matchMedia('(max-width: 1024px)');
  const mobileMql = window.matchMedia('(max-width: 768px)');

  const handleTablet = (e: MediaQueryListEvent | MediaQueryList) => {
    if (e.matches) setCollapsed(true);
  };
  const handleMobile = (e: MediaQueryListEvent | MediaQueryList) => {
    setIsMobile(e.matches);
    if (e.matches) setMobileOpen(false);
  };

  // 초기값
  handleTablet(tabletMql);
  handleMobile(mobileMql);

  tabletMql.addEventListener('change', handleTablet);
  mobileMql.addEventListener('change', handleMobile);

  return () => {
    tabletMql.removeEventListener('change', handleTablet);
    mobileMql.removeEventListener('change', handleMobile);
  };
}, []);

// localStorage 동기화
useEffect(() => {
  localStorage.setItem('sidebar_collapsed', String(collapsed));
}, [collapsed]);

// 사이드바 너비 동적 계산
const sidebarWidth = isMobile
  ? '0px'
  : collapsed
    ? 'var(--sidebar-collapsed-width)'
    : 'var(--sidebar-width)';
```

**main wrapper 변경**
```tsx
// before
<div style={{ marginLeft: 'var(--sidebar-width)', flex: 1 }}>

// after
<div className="main-content" style={{
  marginLeft: sidebarWidth,
  flex: 1,
  transition: 'margin-left 0.2s ease',
}}>
```

**Sidebar에 전달할 props**
```tsx
<Sidebar
  collapsed={collapsed}
  onToggle={() => setCollapsed(prev => !prev)}
  isMobile={isMobile}
  mobileOpen={mobileOpen}
  onMobileClose={() => setMobileOpen(false)}
/>
```

### Task B-3: Sidebar.tsx — 접기 모드 구현

**props 인터페이스 추가**
```tsx
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}
```

**변경 사항**
1. width: `collapsed ? 64px : 260px`, transition 0.2s
2. 접힌 상태: 아이콘만 표시, 라벨 숨김
3. hover 시 라벨 툴팁 (CSS `title` 속성)
4. **하위 메뉴 (children): collapsed 상태에서 클릭 시 사이드바를 펼침 모드로 전환**
   - ~~hover 팝오버~~ → 복잡도 높고 마우스 이탈/포커스 관리 이슈
   - 클릭 시 `onToggle()` 호출 → 펼침 → 기존 expandedMenus 로직 그대로 활용
   - 대상: 협력사 관리(4개), 생산관리(4개), QR 관리(2개) — 3개 그룹
   ```tsx
   // collapsed + children이 있는 메뉴 클릭 시
   const handleNavClick = (item: NavItem) => {
     if (collapsed && item.children) {
       onToggle(); // 사이드바 펼침
       setExpandedMenus(prev => ({ ...prev, [item.label]: true }));
       return; // 네비게이션하지 않음
     }
     // 기존 로직...
   };
   ```
5. 하단 토글 버튼: ChevronLeft ↔ ChevronRight 아이콘
6. 모바일(768px 이하): `position: fixed` + 오버레이 배경 + 슬라이드 인

**접힌 상태 네비게이션 아이템 구조**
```tsx
// 현재
<NavLink to={item.to}>
  <Icon /><span>{item.label}</span>
</NavLink>

// collapsed 시
<NavLink to={item.to} title={item.label}>
  <Icon />
  {!collapsed && <span>{item.label}</span>}
</NavLink>
```

**모바일 오버레이**
```tsx
{isMobile && mobileOpen && (
  <>
    {/* 배경 딤 */}
    <div
      onClick={onMobileClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        zIndex: 99, transition: 'opacity 0.2s',
      }}
    />
    {/* 사이드바 — 펼친 상태로 슬라이드 인 */}
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0,
      width: '260px', zIndex: 100,
      transform: 'translateX(0)', transition: 'transform 0.2s',
    }}>
      {/* 기존 사이드바 내용 */}
    </aside>
  </>
)}
```

### Task B-4: Header.tsx — 햄버거 버튼

**추가할 props**
```tsx
interface HeaderProps {
  // 기존 props...
  isMobile?: boolean;
  onMenuClick?: () => void;
}
```

**변경**
```tsx
// 좌측에 추가 (768px 이하에서만 표시)
{isMobile && (
  <button
    onClick={onMenuClick}
    style={{
      background: 'none', border: 'none', cursor: 'pointer',
      padding: '8px', marginRight: '8px',
      color: 'var(--gx-charcoal)',
    }}
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  </button>
)}
```

---

## Phase C: KPI/차트 반응형 (🅰 + 🅱 병렬)

> 🅰 FE-CORE가 CSS 클래스 정의, 🅱 FE-PAGE가 각 페이지에 className 적용

### Task C-1: index.css media query 추가/수정 (🅰 FE-CORE)

**현재 (L226~235)**
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

**after (전체 교체)**

> ⚠️ CSS cascade 규칙: 넓은 브레이크포인트 → 좁은 브레이크포인트 순서 (1200 → 1024 → 768)

```css
/* ── 신규 기본 클래스 ── */
.kpi-grid-7 { display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; }
.stage-grid { display: grid; gap: 8px; }

/* ── 소형 데스크톱 / 태블릿 가로 (1200px) — 가장 먼저 ── */
@media (max-width: 1200px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .chart-grid { grid-template-columns: 1fr !important; }
  .company-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .bottom-grid { grid-template-columns: 1fr !important; }
  .kpi-grid-7 { grid-template-columns: repeat(3, 1fr) !important; }
  .stage-grid { grid-template-columns: repeat(2, 1fr) !important; }
}

/* ── 태블릿 (1024px) — 1200px 규칙을 오버라이드 ── */
@media (max-width: 1024px) {
  .kpi-grid-7 { grid-template-columns: repeat(4, 1fr) !important; }
  .stage-grid { grid-template-columns: repeat(3, 1fr) !important; }
  .main-content { padding: 20px 16px !important; }
}

/* ── 모바일 (768px) — 가장 마지막 ── */
@media (max-width: 768px) {
  .kpi-grid { grid-template-columns: 1fr !important; }
  .company-grid { grid-template-columns: 1fr !important; }
  .kpi-grid-7 { grid-template-columns: repeat(2, 1fr) !important; }
  .stage-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .main-content { padding: 16px 12px !important; }
}
```

### Task C-2: 페이지별 className 추가 (🅱 FE-PAGE)

> 인라인 `gridTemplateColumns`는 데스크톱 기본값으로 유지.
> `className`을 추가하면 media query가 `!important`로 오버라이드.

**변경 패턴 (모든 파일 동일)**
```tsx
// before (예시: FactoryDashboardPage.tsx L241)
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>

// after
<div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
```

#### C-2-1: `kpi-grid` 적용 (11개소)
| # | 파일 | 라인 | 현재 그리드 |
|---|------|------|-----------|
| 1 | FactoryDashboardPage.tsx | L241 | `repeat(4, 1fr)` |
| 2 | PartnerDashboardPage.tsx | L89 | `repeat(4, 1fr)` |
| 3 | DefectAnalysisPage.tsx | L168 | `repeat(4, 1fr)` |
| 4 | CtAnalysisPage.tsx | L197 | `repeat(4, 1fr)` |
| 5 | AnalyticsDashboardPage.tsx | L143 | `repeat(4, 1fr)` |
| 6 | ShipmentHistoryPage.tsx | L52 | `repeat(4, 1fr)` |
| 7 | QrManagementPage.tsx | L397 | `repeat(3, 1fr)` |
| 8 | PermissionsPage.tsx | L145 | `repeat(3, 1fr)` |
| 9 | DefectAnalysisPage.tsx | L406 | `repeat(3, 1fr)` |
| 10 | PartnerDashboardPage.tsx | L195 | `1fr 1fr 1fr` |
| 11 | InactiveWorkersPage.tsx | L97 | `repeat(3, 1fr)` |

#### C-2-2: `chart-grid` 적용 (7개소)
| # | 파일 | 라인 | 현재 그리드 |
|---|------|------|-----------|
| 1 | FactoryDashboardPage.tsx | L266 | `2fr 1fr` |
| 2 | PartnerDashboardPage.tsx | L125 | `2fr 1fr` |
| 3 | AnalyticsDashboardPage.tsx | L201 | `1fr 1fr` |
| 4 | DefectAnalysisPage.tsx | L204 | `1fr 1fr` |
| 5 | DefectAnalysisPage.tsx | L447 | `1fr 1fr` |
| 6 | PartnerAllocationPage.tsx | L115 | `1fr 1fr` |
| 7 | PartnerEvaluationPage.tsx | L198 | `1fr 1fr` |

#### C-2-3: `bottom-grid` 적용 (2개소)
| # | 파일 | 라인 | 현재 그리드 |
|---|------|------|-----------|
| 1 | PartnerDashboardPage.tsx | L229 | `1fr 1fr` |
| 2 | FactoryDashboardPage.tsx | L483 | `1fr 1fr` |

#### C-2-4: 동적 그리드 (3개소)
| # | 파일 | 라인 | className | 비고 |
|---|------|------|-----------|------|
| 1 | ProductionPerformancePage.tsx | L572 | `kpi-grid` | 탭별 3~4열 동적, 태블릿 2열 |
| 2 | ProductionPlanPage.tsx | L384 | `stage-grid` | 스테이지 수 동적 |
| 3 | EtlChangeLogPage.tsx | L180 | `kpi-grid-7` | 7열 고정 |

#### C-2-5: 수정 불필요 (확인만)
| 파일 | 라인 | 사유 |
|------|------|------|
| SNStatusPage.tsx | L136, L154 | `auto-fill, minmax(280px, 1fr)` 이미 반응형 |
| ChecklistManagePage.tsx | — | 그리드 패턴 없음, 수정 불필요 |

### Task C-3: SNDetailPanel 반응형 (🅰 FE-CORE)

> SNDetailPanel.tsx가 `position: fixed; width: 480px; right: 0`으로 고정되어 있어
> 태블릿(사이드바 64px + 메인 + 패널 480px)에서 화면 밖으로 넘침

**파일**: `src/components/sn-status/SNDetailPanel.tsx` (L51~54)

**before**
```tsx
style={{
  position: 'fixed',
  top: 0,
  right: 0,
  width: '480px',
  height: '100vh',
}}
```

**after**
```tsx
style={{
  position: 'fixed',
  top: 0,
  right: 0,
  width: '480px',
  maxWidth: '100vw',       // 태블릿/모바일에서 화면 넘침 방지
  height: '100vh',
}}
```

> 768px 이하에서 full-width 오버레이 전환은 Phase D 범위.
> Phase C에서는 `maxWidth: '100vw'`로 간단 대응.

---

## Phase D: 모바일 네비게이션 (🅰 FE-CORE — 선택적)

> 태블릿 우선이므로 Phase D는 후순위. 필요시 진행.

### Task D-1: MobileNav.tsx (신규 컴포넌트)

**파일**: `src/components/layout/MobileNav.tsx`

```tsx
// 768px 이하에서만 렌더링
// 하단 고정 56px
// 5탭: 대시보드(/) / 생산(/production/plan) / QR(/qr) / 협력사(/partner) / 더보기
// Sidebar와 동일한 roles 필터 적용
// "더보기" 클릭 시 드로어 (권한관리, 불량, CT 등)
```

### Task D-2: Layout.tsx 하단 여백 추가
```tsx
// 768px 이하에서 main content padding-bottom: 72px
// MobileNav 높이(56px) + 여유 16px
```

---

## Phase T: 테스트 + 빌드 (🅲 TEST)

### Task T-1: 빌드 검증
```bash
cd ~/Desktop/GST/AXIS-VIEW/app
npm run build
```
- 타입 에러 0
- 빌드 경고 확인 (unused import 등)

### Task T-2: 브레이크포인트별 검증

**1440px (데스크톱)**
- [ ] 사이드바 펼침 260px
- [ ] 모든 KPI 그리드 원본 열 수 유지
- [ ] 차트 그리드 원본 비율 유지

**1024px (태블릿)**
- [ ] 사이드바 자동 접힘 64px — 아이콘만 표시
- [ ] 토글 버튼으로 펼침/접힘 전환
- [ ] hover 시 메뉴 라벨 표시
- [ ] 하위 메뉴 팝오버 정상 동작
- [ ] localStorage에 상태 저장/복원

**1200px (소형 데스크톱)**
- [ ] KPI 그리드: 4열 → 2열
- [ ] 차트 그리드: 2열 → 1열 스택
- [ ] EtlChangeLogPage: 7열 → 3열
- [ ] ProductionPlanPage: 동적 → 2열

**768px (모바일 — Phase D 진행 시)**
- [ ] 사이드바 완전 숨김
- [ ] 햄버거 버튼 → 오버레이 사이드바
- [ ] KPI 1열
- [ ] 하단 탭 바 표시

### Task T-3: 기존 기능 회귀 검증
- [ ] 공장 대시보드 자동 새로고침 정상
- [ ] 생산현황 S/N 카드뷰 정상
- [ ] 생산실적 탭 전환 정상
- [ ] 사이드바 메뉴 전체 동작
- [ ] 로그인/로그아웃 정상

---

## 작업 순서 & 의존성

```
Phase B (🅰 FE-CORE 단독)
  B-1 → B-2 → B-3 → B-4
  │
  ▼ (B 완료 후)
Phase C (🅰 + 🅱 병렬)
  ┌─ 🅰 C-1 (CSS 클래스 정의)
  │   └── 완료 즉시 🅱 시작 가능
  └─ 🅱 C-2 (14개 페이지 className 적용)
       C-2-1 → C-2-2 → C-2-3 → C-2-4
       │
       ▼ (C 완료 후)
Phase T (🅲 TEST)
  T-1 → T-2 → T-3
       │
       ▼ (선택적)
Phase D (🅰 FE-CORE)
  D-1 → D-2
```

---

## 수정 대상 파일 전체 목록 (21개)

| # | 파일 | Phase | 워커 | 변경 내용 |
|---|------|-------|------|----------|
| 1 | `index.css` | B,C | 🅰 | CSS 변수 + media query 추가/수정 |
| 2 | `Layout.tsx` | B,C | 🅰 | collapsed state + className + 반응형 패딩 |
| 3 | `Sidebar.tsx` | B | 🅰 | collapsed 모드 + 클릭 펼침 + 토글 + 오버레이 |
| 4 | `Header.tsx` | B | 🅰 | 햄버거 버튼 (모바일) |
| 5 | `SNDetailPanel.tsx` | C | 🅰 | maxWidth: 100vw 추가 (태블릿 넘침 방지) |
| 6 | `MobileNav.tsx` (신규) | D | 🅰 | 하단 네비게이션 (선택적) |
| 7 | `FactoryDashboardPage.tsx` | C | 🅱 | L241, L266, L483 className |
| 8 | `PartnerDashboardPage.tsx` | C | 🅱 | L89, L125, L195, L229 className |
| 9 | `PartnerEvaluationPage.tsx` | C | 🅱 | L198 className |
| 10 | `PartnerAllocationPage.tsx` | C | 🅱 | L115 className |
| 11 | `DefectAnalysisPage.tsx` | C | 🅱 | L168, L204, L406, L447 className |
| 12 | `CtAnalysisPage.tsx` | C | 🅱 | L197 className |
| 13 | `ProductionPerformancePage.tsx` | C | 🅱 | L572 className |
| 14 | `ShipmentHistoryPage.tsx` | C | 🅱 | L52 className |
| 15 | `ProductionPlanPage.tsx` | C | 🅱 | L384 className |
| 16 | `AnalyticsDashboardPage.tsx` | C | 🅱 | L143, L201 className |
| 17 | `QrManagementPage.tsx` | C | 🅱 | L397 className |
| 18 | `EtlChangeLogPage.tsx` | C | 🅱 | L180 className |
| 19 | `PermissionsPage.tsx` | C | 🅱 | L145 className |
| 20 | `InactiveWorkersPage.tsx` | C | 🅱 | L97 className |

---

## 규칙 — Sprint 21

### 코드 규칙
1. 인라인 `gridTemplateColumns`는 제거하지 않는다 — 데스크톱 기본값으로 유지
2. `className`을 추가해서 media query가 `!important`로 오버라이드하는 방식
3. `SNStatusPage.tsx`는 수정하지 않는다 — 이미 `auto-fill`로 반응형 완성
4. CSS transition은 0.2s ease 통일
5. z-index 체계: 사이드바 100, 오버레이 배경 99, 헤더 50
6. 사이드바 접힌 상태 아이콘: 기존 Heroicons 사용 (추가 패키지 설치 금지)

### 워커 규칙
1. 🅱 FE-PAGE는 🅰 FE-CORE의 CSS 클래스 정의(C-1)가 완료된 후 작업 시작
2. 파일 소유권 위반 금지 — 🅱가 Layout.tsx를 수정하거나, 🅰가 pages/ 를 수정하면 안 됨
3. 각 Task 완료 시 해당 체크리스트 항목 체크
4. `npm run build` 실패 시 해당 워커가 즉시 수정

### 테스트 규칙
1. 🅲 TEST는 🅰 + 🅱 모두 완료 후 시작
2. 브레이크포인트 검증은 Chrome DevTools Device Toolbar 사용
3. 회귀 검증 실패 시 해당 파일 소유 워커에게 반환
4. 빌드 통과 + 1024px 검증 통과가 최소 완료 조건

---

## 체크리스트 — Sprint 21

### Phase B (🅰 FE-CORE)
- [x] B-1: `--sidebar-collapsed-width: 64px` CSS 변수 추가
- [x] B-2: Layout.tsx collapsed 상태 + matchMedia 리스너
- [x] B-3: Sidebar.tsx 접기 모드 (64px, 아이콘, 툴팁, children 클릭 시 펼침, 토글)
- [x] B-4: Header.tsx 햄버거 버튼 (768px 이하)
- [x] B 완료: 사이드바 접기 + 토글 동작 확인

### Phase C (🅰 + 🅱 병렬)
- [x] C-1: index.css media query 추가 (순서: 1200px → 1024px → 768px)
- [x] C-2-1: kpi-grid className 적용 (11개소 — InactiveWorkersPage 포함)
- [x] C-2-2: chart-grid className 적용 (7개소)
- [x] C-2-3: bottom-grid className 적용 (2개소)
- [x] C-2-4: 동적 그리드 className 적용 (3개소)
- [x] C-2-5: SNStatusPage, ChecklistManagePage 미수정 확인
- [x] C-3: SNDetailPanel.tsx maxWidth: 100vw 추가 (태블릿 넘침 방지)

### Phase T (🅲 TEST)
- [x] T-1: `npm run build` 에러 0
- [ ] T-2: 1440px 데스크톱 검증 통과
- [ ] T-2: 1024px 태블릿 검증 통과 (핵심 목표)
- [ ] T-2: 1200px 소형 데스크톱 검증 통과
- [ ] T-2: SNDetailPanel 태블릿 열기 시 화면 넘침 없음 확인
- [ ] T-3: 기존 기능 회귀 검증 통과

### Phase D (선택적 — 미진행)
- [ ] D-1: MobileNav.tsx 생성
- [ ] D-2: Layout.tsx 하단 여백 추가

### 최종
- [x] 완료 시 CLAUDE.md 업데이트 (버전, 변경사항)
- [x] 버전 bump (v1.16.1 → v1.17.0)
- [ ] 완료 시 DESIGN_FIX_SPRINT.md 체크리스트 업데이트
- [ ] 완료 시 RESPONSIVE_DESIGN_PLAN.md 상태 업데이트
- [ ] 완료 시 CHANGELOG.md 기록

---

## 복사용 프롬프트

### Lead 시작 프롬프트
```
AXIS-VIEW 반응형 레이아웃 Sprint 21을 시작합니다.

⚠️ 작업 시작 전 반드시 ~/Desktop/GST/AXIS-VIEW/CLAUDE.md 를 읽고 시작할 것

⚠️ 추가 참조 파일:
- 스프린트 문서: ~/Desktop/GST/AXIS-VIEW/docs/sprints/DESIGN_FIX_SPRINT.md → Sprint 21 섹션
- 반응형 설계서: ~/Desktop/GST/AXIS-VIEW/docs/sprints/RESPONSIVE_DESIGN_PLAN.md (v2)

## 팀 구성
3명의 teammate를 Sonnet 모델로 생성:

1. **FE-CORE** — 소유: src/index.css, src/components/layout/**
2. **FE-PAGE** — 소유: src/pages/**/*.tsx
3. **TEST** — 소유: 없음 (읽기 전용, 빌드+검증만)

## 작업 순서
1. FE-CORE → Phase B (사이드바 접기) 완료
2. FE-CORE → Phase C-1 (CSS 클래스) 완료 → FE-PAGE → Phase C-2 (className 적용) 병렬 시작
3. TEST → Phase T (빌드 + 브레이크포인트 검증)
4. (선택) FE-CORE → Phase D (모바일 네비)

## 규칙
- 코드 변경 전 반드시 사용자 승인
- 파일 소유권 위반 금지
- 인라인 gridTemplateColumns 유지, className 추가 방식
- SNStatusPage.tsx는 수정 금지
- npm run build 실패 시 즉시 수정
```

---

# Sprint 22 (VIEW): 공정 완료 판정 버그 수정 — categories 기준 통일 (2026-03-29)

> 참조: `~/Desktop/GST/AXIS-VIEW/CLAUDE.md`
> 우선 목표: ProcessStepCard의 완료/진행중/대기중 판정을 SNCard와 동일한 `categories` 기준으로 통일
> BE 수정: 없음 (FE 전용 스프린트)
> 난이도: 하 (3파일, ~20줄 변경)
> 상태: ✅ 완료 (2026-03-30)

---

## 변경 이유

### 문제 현상

S/N 6905 생산현황에서 **ELEC(전장) 공정**이 실제로는 완료되지 않았음에도 `✅ 완료`로 표시되는 버그 발생.

- **SNCard (카드 목록)**: ELEC `●` (진행중) → ✅ 올바름
- **ProcessStepCard (상세 패널)**: ELEC `✅ 완료` → ❌ 잘못됨

**동일한 S/N, 동일한 공정인데 두 컴포넌트에서 완료 상태가 다르게 표시**되는 불일치 발생.

### 근본 원인

두 컴포넌트가 **서로 다른 기준**으로 완료 여부를 판단하고 있음:

| 컴포넌트 | 기준 | 로직 | 문제 |
|----------|------|------|------|
| **SNCard** | `categories[cat].percent` | `percent === 100` → ✓ | ✅ 정확 (task 단위 done/total) |
| **ProcessStepCard** | `workers.some()` | 작업자 1명이라도 completed → 완료 | ❌ 부정확 |

**ProcessStepCard.tsx L31~36 (현재 — 버그)**:
```typescript
function taskStatus(task: SNTaskDetail | null): 'completed' | 'in_progress' | 'waiting' {
  if (!task || task.workers.length === 0) return 'waiting';
  if (task.workers.some(w => w.status === 'completed')) return 'completed';  // ← 여기가 문제
  if (task.workers.some(w => w.status === 'in_progress')) return 'in_progress';
  return 'waiting';
}
```

> **`workers.some()`**: 해당 공정에 task가 3개이고, 그 중 1개의 작업자만 완료해도 전체 공정이 '완료'로 판정됨.

### 왜 `categories` 기준이 맞는가

`SNProduct.categories`는 BE에서 공정별 task 완료 개수를 정확히 집계한 데이터:

```typescript
// types/snStatus.ts
categories: Record<string, { total: number; done: number; percent: number }>
// 예시: ELEC = { total: 5, done: 3, percent: 60 } → 5개 task 중 3개 완료 = 60%
```

- `percent === 100`: 해당 공정의 모든 task 완료 → **완료**
- `percent > 0`: 일부 task 완료 → **진행중**
- `percent === 0`: 아무 task도 완료되지 않음 → **대기중**

SNCard는 이미 이 기준을 사용하고 있으므로, ProcessStepCard도 동일한 기준을 사용하면 **두 컴포넌트 간 상태 불일치가 해소**됨.

---

## 수정 대상 파일

| # | 파일 | 변경 내용 |
|---|------|----------|
| 1 | `src/components/sn-status/ProcessStepCard.tsx` | `categoryPercent` prop 추가, `taskStatus()` 로직 변경 |
| 2 | `src/components/sn-status/SNDetailPanel.tsx` | `ChecklistProcessCard` + 일반 `ProcessStepCard` 호출 시 `categoryPercent` prop 전달 |
| 3 | (검증) `src/components/sn-status/SNCard.tsx` | 수정 없음 — 기존 로직 정상 확인용 |

---

## 수정 상세

### Task 22-1: ProcessStepCard.tsx — prop 추가 + taskStatus 로직 변경

**파일**: `src/components/sn-status/ProcessStepCard.tsx`

#### 1-A: interface에 `categoryPercent` prop 추가 (L8~13)

**before**
```typescript
interface ProcessStepCardProps {
  task: SNTaskDetail | null;
  displayLabel: string;
  checklist?: ChecklistStatusResponse | null;
  checklistLoading?: boolean;
}
```

**after**
```typescript
interface ProcessStepCardProps {
  task: SNTaskDetail | null;
  displayLabel: string;
  categoryPercent?: number;              // categories[cat].percent — 공정 완료 기준
  checklist?: ChecklistStatusResponse | null;
  checklistLoading?: boolean;
}
```

#### 1-B: `taskStatus()` 함수 변경 (L31~36)

**before** (현재 — 버그)
```typescript
function taskStatus(task: SNTaskDetail | null): 'completed' | 'in_progress' | 'waiting' {
  if (!task || task.workers.length === 0) return 'waiting';
  if (task.workers.some(w => w.status === 'completed')) return 'completed';
  if (task.workers.some(w => w.status === 'in_progress')) return 'in_progress';
  return 'waiting';
}
```

**after**
```typescript
function taskStatus(
  task: SNTaskDetail | null,
  categoryPercent?: number,
): 'completed' | 'in_progress' | 'waiting' {
  // 1순위: categories 데이터 기준 (BE 집계, SNCard와 동일 기준)
  if (categoryPercent != null) {
    if (categoryPercent === 100) return 'completed';
    if (categoryPercent > 0) return 'in_progress';
    return 'waiting';
  }
  // 2순위: fallback — categories 없는 edge case
  if (!task || task.workers.length === 0) return 'waiting';
  if (task.workers.every(w => w.status === 'completed')) return 'completed';
  if (task.workers.some(w => w.status === 'in_progress' || w.status === 'completed')) return 'in_progress';
  return 'waiting';
}
```

> **변경 포인트**:
> - `categoryPercent`가 있으면 그걸로 판단 (SNCard와 동일)
> - fallback에서도 `some()` → `every()`로 변경 (edge case 방어)
> - fallback `in_progress` 조건에 `completed` 포함 (일부만 완료 = 진행중)

#### 1-C: 컴포넌트에서 호출 변경 (L44~45)

**before**
```typescript
export default function ProcessStepCard({ task, displayLabel, checklist, checklistLoading }: ProcessStepCardProps) {
  const status = taskStatus(task);
```

**after**
```typescript
export default function ProcessStepCard({ task, displayLabel, categoryPercent, checklist, checklistLoading }: ProcessStepCardProps) {
  const status = taskStatus(task, categoryPercent);
```

---

### Task 22-2: SNDetailPanel.tsx — categoryPercent prop 전달

**파일**: `src/components/sn-status/SNDetailPanel.tsx`

#### 2-A: ChecklistProcessCard에 categoryPercent 추가 (L21~39)

**before**
```typescript
function ChecklistProcessCard({
  cat,
  serialNumber,
  task,
}: {
  cat: string;
  serialNumber: string;
  task: SNTaskDetail | null;
}) {
  const { data: checklist, isLoading: clLoading } = useChecklist(serialNumber, cat);
  return (
    <ProcessStepCard
      task={task}
      displayLabel={PROCESS_LABEL[cat] ?? cat}
      checklist={checklist}
      checklistLoading={clLoading}
    />
  );
}
```

**after**
```typescript
function ChecklistProcessCard({
  cat,
  serialNumber,
  task,
  categoryPercent,
}: {
  cat: string;
  serialNumber: string;
  task: SNTaskDetail | null;
  categoryPercent?: number;
}) {
  const { data: checklist, isLoading: clLoading } = useChecklist(serialNumber, cat);
  return (
    <ProcessStepCard
      task={task}
      displayLabel={PROCESS_LABEL[cat] ?? cat}
      categoryPercent={categoryPercent}
      checklist={checklist}
      checklistLoading={clLoading}
    />
  );
}
```

#### 2-B: ChecklistProcessCard 호출 시 categoryPercent 전달 (L162~170)

**before**
```tsx
<ChecklistProcessCard
  key={cat}
  cat={cat}
  serialNumber={serialNumber}
  task={mergedTask}
/>
```

**after**
```tsx
<ChecklistProcessCard
  key={cat}
  cat={cat}
  serialNumber={serialNumber}
  task={mergedTask}
  categoryPercent={product.categories[cat]?.percent}
/>
```

#### 2-C: 일반 ProcessStepCard 호출 시 categoryPercent 전달 (L173~178)

**before**
```tsx
<ProcessStepCard
  key={cat}
  task={mergedTask}
  displayLabel={PROCESS_LABEL[cat] ?? cat}
/>
```

**after**
```tsx
<ProcessStepCard
  key={cat}
  task={mergedTask}
  displayLabel={PROCESS_LABEL[cat] ?? cat}
  categoryPercent={product.categories[cat]?.percent}
/>
```

---

## 검증 시나리오

### 테스트 1: S/N 6905 ELEC 재현 확인
- 수정 전: ProcessStepCard에서 ELEC `✅ 완료`로 표시
- 수정 후: ProcessStepCard에서 ELEC `🔵 진행중`으로 표시 (SNCard와 동일)

### 테스트 2: 완전 완료 공정 확인
- categories에서 `percent === 100`인 공정 → ProcessStepCard에서도 `✅ 완료` 정상 표시

### 테스트 3: 대기 공정 확인
- categories에서 `percent === 0`인 공정 → `○ 대기중` 정상 표시

### 테스트 4: 빌드 검증
```bash
cd ~/Desktop/GST/AXIS-VIEW/app
npm run build
```
- 타입 에러 0
- 빌드 경고 확인

---

## 규칙 — Sprint 22

### 코드 규칙
1. `categoryPercent`가 있으면 반드시 그 값으로 상태 판정 (1순위)
2. fallback은 `every()` 사용 — `some()` 사용 금지
3. 기존 STATUS_CONFIG, UI 렌더링은 변경하지 않음 (상태 판정 로직만 수정)
4. SNCard.tsx는 수정하지 않음 — 이미 정상

### 프로세스 규칙
1. 코드 수정 전 반드시 사용자 승인
2. BE 변경 없음 — FE 전용

---

## 체크리스트 — Sprint 22

- [x] 22-1-A: ProcessStepCard interface에 `categoryPercent` prop 추가
- [x] 22-1-B: `taskStatus()` 함수 — categoryPercent 우선 판정 + fallback `every()` 변경
- [x] 22-1-C: 컴포넌트 destructuring에 `categoryPercent` 추가
- [x] 22-2-A: ChecklistProcessCard에 `categoryPercent` prop 추가
- [x] 22-2-B: ChecklistProcessCard 호출 시 `product.categories[cat]?.percent` 전달
- [x] 22-2-C: 일반 ProcessStepCard 호출 시 `product.categories[cat]?.percent` 전달
- [x] T-1: `npm run build` 에러 0
- [ ] T-2: S/N 6905 ELEC 상태 불일치 해소 확인
- [ ] T-3: 완전 완료 공정 정상 표시 확인
- [x] 완료 시 CLAUDE.md 업데이트
- [x] 완료 시 CHANGELOG.md 기록

---

## 복사용 프롬프트

```
AXIS-VIEW Sprint 22 — 공정 완료 판정 버그 수정을 시작합니다.

⚠️ 작업 시작 전 반드시 ~/Desktop/GST/AXIS-VIEW/CLAUDE.md 를 읽고 시작할 것

⚠️ 스프린트 문서: ~/Desktop/GST/AXIS-VIEW/docs/sprints/DESIGN_FIX_SPRINT.md → Sprint 22 섹션

## 문제
ProcessStepCard의 taskStatus()가 workers.some()으로 판정하여
공정 내 작업자 1명만 완료해도 전체 공정이 '완료'로 표시되는 버그.
SNCard는 categories.percent 기준으로 올바르게 표시 중 → 두 컴포넌트 간 불일치.

## 수정 방향
categories[cat].percent를 ProcessStepCard에 prop으로 전달하여 SNCard와 동일 기준 적용.

## 수정 파일 (2개)
1. src/components/sn-status/ProcessStepCard.tsx — categoryPercent prop + taskStatus 로직
2. src/components/sn-status/SNDetailPanel.tsx — categoryPercent 전달

## 규칙
- 코드 변경 전 반드시 사용자 승인
- BE 변경 없음
- npm run build 실패 시 즉시 수정
```

---

# Sprint 23: Task 재활성화 UI — 생산현황 S/N 디테일 (VIEW FE)

> 등록일: 2026-03-30
> 선행: OPS Sprint 41 (BE reactivate-task API 완료 후)
> 난이도: 낮음
> BE 변경: 없음 — OPS BE API 이미 구현 (`POST /api/app/work/reactivate-task`)
> 상태: ✅ 완료 (2026-03-30)

## 배경

OPS Sprint 41에서 "작업 릴레이 + Manager 재활성화" BE를 구현.
재활성화 버튼을 APP(Flutter)이 아닌 **VIEW(React) 생산현황 S/N 디테일**에 배치.

이유:
- Manager/PM이 실적 확인하는 화면에서 "실수 취소"가 자연스러움
- S/N 디테일 패널에 이미 공정별 작업자, 완료 시간이 표시 → 대상 특정 용이
- APP에 넣으면 현장 작업자가 실수로 누를 리스크 있음

## 현재 코드 구조 (확인 완료)

```
API Client: src/api/client.ts
  - import: apiClient (axios instance)
  - baseURL: VITE_API_BASE_URL || 'http://localhost:5000'
  - 모든 API 경로에 /api prefix 필요

권한 접근: src/store/authStore.ts
  - useAuth() 훅 → { user, isAuthenticated, login, logout }
  - user.is_admin, user.is_manager 사용 가능
  - localStorage key: axis_view_user

타입 정의: src/types/snStatus.ts
  - TaskWorker: { worker_id, worker_name, started_at, completed_at, duration_minutes, status, task_name? }
  - ⚠️ task_detail_id 필드 없음 → BE 응답에 추가 필요 (OPS Sprint 41 보완)
  - completed_at은 TaskWorker 레벨에 존재 (SNTaskDetail 레벨 아님)

컴포넌트 계층:
  SNStatusPage (useAuth로 user 접근)
    → SNDetailPanel (tasks 병합 + ProcessStepCard 렌더링)
      → ProcessStepCard (worker 행 렌더링, w.completed_at 체크)
```

## 수정 파일 (4개)

```
1. src/components/sn-status/SNDetailPanel.tsx     (수정 — workers 병합 시 task_detail_id: t.id 주입 + canReactivate prop 전달)
2. src/components/sn-status/ProcessStepCard.tsx   (수정 — worker 행에 재활성화 버튼, canReactivate prop 수신)
3. src/hooks/useTaskReactivate.ts                 (신규 — reactivate API 호출 훅)
4. src/types/snStatus.ts                          (수정 — TaskWorker에 task_detail_id 추가)
```

## 선행 작업 — BE 수정 불필요

`GET /api/app/tasks/<sn>?all=true` 응답의 각 task 객체 `id` 필드가 `app_task_details.id` (= task_detail_id).
즉 **BE 응답에 이미 존재**하며, SNDetailPanel에서 workers 병합 시 `t.id`를 주입하면 됨.

```typescript
// SNDetailPanel.tsx — 기존 병합 로직 (L153-154)
workers: catTasks.flatMap(t =>
  t.workers.map(w => ({ ...w, task_name: t.task_name }))
),

// ↓ 수정: task_detail_id 주입 추가
workers: catTasks.flatMap(t =>
  t.workers.map(w => ({ ...w, task_name: t.task_name, task_detail_id: t.id }))
),
```

## 기능 설계

### 표시 조건
- ProcessStepCard 내 **완료된 worker 행** (`w.completed_at` 존재) 옆에 재활성화 아이콘 표시
- **권한**: `user.is_manager === true` 또는 `user.is_admin === true` 일 때만 표시
- 일반 작업자에게는 버튼 비표시
- 미완료 worker 행에는 표시 안 함

### 버튼 위치
- ProcessStepCard 확장 시 → worker 행 목록 → **각 worker 행의 완료 시간 우측**에 작은 아이콘
- 아이콘: `RotateCcw` (lucide-react) 또는 `Undo2`
- 색상: `text-gray-400 hover:text-orange-500` (비활성→주의색)

### 권한 전달 방식
```
SNStatusPage: const { user } = useAuth();
  const canReactivate = user?.is_admin || user?.is_manager || false;
  → SNDetailPanel: canReactivate={canReactivate}
    → ProcessStepCard: canReactivate prop (boolean 1개)
```

### 클릭 동작
1. 확인 다이얼로그: "이 작업을 재활성화하시겠습니까? 실적확인이 취소됩니다."
2. 확인 시 `POST /api/app/work/reactivate-task` 호출 (`{ task_detail_id: w.task_detail_id }`)
3. 성공 시:
   - 해당 S/N progress 데이터 refetch (invalidateQueries)
   - 토스트: "작업이 재활성화되었습니다. (실적확인 N건 취소)"
4. 실패 시:
   - 403 → 토스트: "권한이 없습니다."
   - 기타 → 토스트: 에러 메시지 표시

### useTaskReactivate.ts

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';

interface ReactivateResponse {
  message: string;
  task_id: number;
  serial_number: string;
  task_category: string;
  confirms_invalidated: number;
}

export function useTaskReactivate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskDetailId: number) =>
      apiClient.post<ReactivateResponse>('/api/app/work/reactivate-task', {
        task_detail_id: taskDetailId,
      }),
    onSuccess: () => {
      // S/N progress + tasks 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['sn', 'progress'] });
      queryClient.invalidateQueries({ queryKey: ['sn', 'tasks'] });
    },
  });
}
```

### ProcessStepCard 수정 범위

```tsx
// Props에 권한 추가
interface ProcessStepCardProps {
  task: SNTaskDetail | null;
  displayLabel: string;
  categoryPercent?: number;
  checklist?: ChecklistStatusResponse | null;
  checklistLoading?: boolean;
  canReactivate?: boolean;   // ← 추가 (단일 prop)
}

// worker 행 렌더링 부분 (기존 w.completed_at 표시 근처)
// ⚠️ task.completed_at 아님! worker 행 단위 w.completed_at 기준
{w.completed_at && canReactivate && w.task_detail_id && (
  <button
    onClick={() => handleReactivate(w.task_detail_id!)}
    className="ml-2 text-gray-400 hover:text-orange-500 transition-colors"
    title="작업 재활성화"
  >
    <RotateCcw size={14} />
  </button>
)}
```

### TaskWorker 타입 수정

```typescript
// src/types/snStatus.ts
export interface TaskWorker {
  worker_id: number;
  worker_name: string;
  started_at: string | null;
  completed_at: string | null;
  duration_minutes: number | null;
  status: 'completed' | 'in_progress' | 'not_started';
  task_name?: string;
  task_detail_id?: number;   // ← 추가 (Sprint 23)
}
```

## 규칙
- **BE 변경 불필요**: task.id === task_detail_id, SNDetailPanel 병합 시 t.id 주입으로 해결
- 코드 변경 전 반드시 사용자 승인
- npm run build 실패 시 즉시 수정
- 권한 판단: useAuth() → canReactivate boolean → prop drilling (SNStatusPage → SNDetailPanel → ProcessStepCard)
- 재활성화 후 production_confirm 취소는 BE에서 처리됨 (FE는 결과만 표시)
- API import: `apiClient from '@/api/client'` (기존 패턴 준수)

---

# Sprint 24 (VIEW): 생산현황 O/N 섹션 헤더 (2026-03-31)

> 등록일: 2026-03-31
> 선행: OPS BE #51 (progress API에 `sales_order` 필드 추가)
> 난이도: 낮 (2파일 수정, ~60줄 변경)
> BE 변경: 있음 — OPS_API_REQUESTS.md #51 참조
> 상태: 설계 완료, BE 선행 대기

---

## 변경 이유

### 문제 현상

생산현황(SNStatusPage)에서 모든 S/N이 동일 레벨의 카드 그리드로 나열됨.
같은 O/N(Order Number = `sales_order`) 소속 S/N이 흩어져 있어 **오더 단위 진행률 파악이 어려움**.

### 개선 방향

기존 카드 그리드 레이아웃 유지 + **O/N 구분 섹션 헤더만 추가**.

### 왜 아코디언이 아닌 섹션 헤더인가

초기 설계에서는 O/N별 아코디언(접기/펼치기)을 검토했으나, 다음 이유로 **섹션 헤더 방식**으로 변경:

1. **완료 S/N 자동 제외**: BE `progress_service.py`에서 `all_completed_at > NOW() - INTERVAL '1 days'` 필터 적용. 전체 공정 100% 완료된 S/N은 1일 후 리스트에서 자동 사라짐.
2. **리스트에 남아있는 S/N은 대부분 진행중**: 접기 대상(완료 O/N)이 거의 없으므로 아코디언은 불필요한 클릭만 유발.
3. **기존 UX 유지**: 카드 그리드를 그대로 유지하면서 O/N 헤더로 시각적 구분만 추가 → 사용자 학습 비용 없음.

```
── O/N 6408 · GAIA-I DUAL · SEC · 3대 ────── 85% ──
[SNCard 6905] [SNCard 6906] [SNCard 6907]

── O/N 6412 · GAIA-P · LG · 2대 ─────────── 40% ──
[SNCard 6910] [SNCard 6911]
```

---

## 수정 파일 (2개)

```
1. src/types/snStatus.ts                  (수정 — SNProduct에 sales_order 추가)
2. src/pages/production/SNStatusPage.tsx   (수정 — O/N 그룹핑 + 섹션 헤더 렌더링)
```

SNCard.tsx, SNDetailPanel.tsx 수정 없음 — 기존 그대로 재활용.

---

## 1. snStatus.ts — SNProduct 타입 수정

```typescript
export interface SNProduct {
  serial_number: string;
  model: string;
  customer: string;
  ship_plan_date: string | null;
  sales_order: string | null;      // ← 추가 (BE #51)
  all_completed: boolean;
  // ... 나머지 동일
}
```

---

## 2. SNStatusPage.tsx — O/N 그룹핑 + 섹션 헤더

### 2-A: O/N 그룹핑 useMemo 추가 (sorted 아래)

```typescript
const groupedByON = useMemo(() => {
  const groups: { key: string; salesOrder: string; model: string; customer: string; products: SNProduct[]; overallPercent: number }[] = [];
  const map = new Map<string, typeof groups[0]>();

  for (const p of sorted) {
    const key = p.sales_order ?? `_no_on_${p.serial_number}`;
    if (!map.has(key)) {
      const group = {
        key,
        salesOrder: p.sales_order ?? '',
        model: p.model,
        customer: p.customer,
        products: [] as SNProduct[],
        overallPercent: 0,
      };
      map.set(key, group);
      groups.push(group);
    }
    map.get(key)!.products.push(p);
  }

  for (const g of groups) {
    g.overallPercent = Math.round(
      g.products.reduce((sum, p) => sum + p.overall_percent, 0) / g.products.length
    );
  }
  return groups;
}, [sorted]);
```

### 2-B: 검색 필터에 sales_order 추가

```typescript
// 현재
result = result.filter(p =>
  p.serial_number.toLowerCase().includes(q) ||
  p.model.toLowerCase().includes(q),
);

// 수정
result = result.filter(p =>
  p.serial_number.toLowerCase().includes(q) ||
  p.model.toLowerCase().includes(q) ||
  (p.sales_order && p.sales_order.toLowerCase().includes(q)),
);
```

### 2-C: placeholder 변경

```typescript
placeholder="O/N · S/N · 모델명 검색"
```

### 2-D: 렌더링 변경 — 기존 그리드 유지 + O/N 섹션 헤더 삽입

```tsx
// 현재
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
  {sorted.map(p => (
    <SNCard key={p.serial_number} product={p} isSelected={selectedSN === p.serial_number} onClick={handleCardClick} />
  ))}
</div>

// 수정: O/N 섹션 헤더 + 카드 그리드
<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
  {groupedByON.map(group => (
    <div key={group.key}>
      {/* O/N 섹션 헤더 (O/N 없는 개별 S/N은 헤더 생략) */}
      {group.salesOrder && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 4px', marginBottom: '12px',
          borderBottom: '1px solid var(--gx-mist)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
              O/N {group.salesOrder}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--gx-steel)' }}>
              {group.model} · {group.customer} · {group.products.length}대
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '60px', height: '5px', borderRadius: '3px', background: 'var(--gx-cloud)' }}>
              <div style={{
                width: `${group.overallPercent}%`, height: '100%', borderRadius: '3px',
                background: group.overallPercent === 100 ? 'var(--gx-success)' : 'var(--gx-accent)',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={{
              fontSize: '12px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
              color: group.overallPercent === 100 ? 'var(--gx-success)' : 'var(--gx-charcoal)',
            }}>
              {group.overallPercent}%
            </span>
          </div>
        </div>
      )}

      {/* 기존 SNCard 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {group.products.map(p => (
          <SNCard key={p.serial_number} product={p} isSelected={selectedSN === p.serial_number} onClick={handleCardClick} />
        ))}
      </div>
    </div>
  ))}
</div>
```

---

## 체크리스트

```
[ ] BE #51 완료 확인 — progress API 응답에 sales_order 포함
[ ] snStatus.ts — SNProduct에 sales_order: string | null 추가
[ ] SNStatusPage.tsx — groupedByON useMemo 추가
[ ] SNStatusPage.tsx — 검색 필터 sales_order 매칭 추가
[ ] SNStatusPage.tsx — placeholder "O/N · S/N · 모델명 검색"
[ ] SNStatusPage.tsx — 렌더링: O/N 섹션 헤더 + 카드 그리드
[ ] npm run build 성공 확인
[ ] 테스트: O/N 검색 → 해당 그룹 필터링 확인
[ ] 테스트: SNCard 클릭 → SNDetailPanel 정상 동작
[ ] 테스트: sales_order NULL인 S/N → 헤더 없이 개별 카드 표시
[ ] 테스트: 협력사 로그인 → 자사 담당 S/N만 그룹에 포함
```

---

## 규칙

- **BE 선행 필수**: OPS #51 배포 전에는 코드 작성 불가
- 코드 변경 전 반드시 사용자 승인
- npm run build 실패 시 즉시 수정
- G-AXIS Design System 인라인 스타일 + CSS 변수 사용
- 신규 컴포넌트 없음 — SNStatusPage.tsx 내 인라인 렌더링
