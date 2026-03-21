// src/components/attendance/KpiCards.tsx
// KPI 카드 4개 — 컨셉 HTML 완전 적용

interface KpiSummary {
  total_registered: number;
  checked_in: number;
  checked_out: number;
  currently_working: number;
  not_checked: number;
  no_checkout_count?: number;
  hq_count?: number;
  site_count?: number;
  avg_attendance_rate?: number;
  company_count?: number;
  total_company_count?: number;
  yesterday_attendance_rate?: number | null;
}

interface KpiCardsProps {
  summary: KpiSummary;
}

const BuildingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 15.75V3.375A1.125 1.125 0 014.125 2.25h9.75A1.125 1.125 0 0115 3.375V15.75M3 15.75h12M6.75 5.625h1.125M6.75 8.25h1.125M10.125 5.625h1.125M10.125 8.25h1.125M6.75 15.75v-3.375a1.125 1.125 0 011.125-1.125h2.25a1.125 1.125 0 011.125 1.125V15.75"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12.75 15.75v-1.5a3 3 0 00-3-3h-4.5a3 3 0 00-3 3v1.5M8.25 8.25a3 3 0 100-6 3 3 0 000 6zM15.75 15.75v-1.5a3 3 0 00-2.25-2.902M12 2.348a3 3 0 010 5.804"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 6.75v3.375M9 13.5h.008M3.818 15.75h10.364c1.118 0 1.811-1.211 1.247-2.182L10.247 3.818a1.431 1.431 0 00-2.494 0L2.571 13.568c-.564.971.129 2.182 1.247 2.182z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M15 4.5l-8.25 8.25L3 9"/>
  </svg>
);

const UpArrow = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
    <path d="M6 2.5l4 5H2l4-5z"/>
  </svg>
);

const DownArrow = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
    <path d="M6 9.5l4-5H2l4 5z"/>
  </svg>
);

export default function KpiCards({ summary }: KpiCardsProps) {
  const companyCount = summary.company_count ?? 0;
  const hqCount = summary.hq_count ?? 0;
  const siteCount = summary.site_count ?? 0;
  const avgRate = summary.avg_attendance_rate ?? 0;

  // 어제 대비 출근율 변화 계산
  const yesterdayRate = summary.yesterday_attendance_rate;
  const rateChange = (() => {
    if (yesterdayRate == null || yesterdayRate === 0) return null;
    const diff = Math.round((avgRate - yesterdayRate) * 10) / 10;
    if (diff === 0) return null;
    return {
      dir: diff > 0 ? 'up' : 'down',
      label: `${diff > 0 ? '+' : ''}${diff}%`,
      note: 'vs 어제',
    };
  })();

  const cards = [
    {
      type: 'primary',
      label: '오늘 출입 협력사',
      icon: <BuildingIcon />,
      value: companyCount,
      unit: '개사',
      sub: summary.total_company_count ? `등록 ${summary.total_company_count}개사 중` : '오늘 기준',
      change: null,
      iconBg: 'var(--gx-accent-soft)',
      iconColor: 'var(--gx-accent)',
    },
    {
      type: 'success',
      label: '총 출입 인원',
      icon: <UsersIcon />,
      value: summary.checked_in,
      unit: '명',
      sub: `본사 ${hqCount}명 · 현장 ${siteCount}명`,
      subBold: [String(hqCount), String(siteCount)],
      change: null,
      iconBg: 'var(--gx-success-bg)',
      iconColor: 'var(--gx-success)',
    },
    {
      type: 'warning',
      label: '퇴근 미체크',
      icon: <AlertIcon />,
      value: summary.no_checkout_count ?? summary.currently_working,
      unit: '명',
      sub: `미출근 ${summary.not_checked}명`,
      change: summary.not_checked > 0 ? { dir: 'down', label: '주의 필요' } : null,
      iconBg: 'var(--gx-warning-bg)',
      iconColor: 'var(--gx-warning)',
    },
    {
      type: 'info',
      label: '평균 출근율',
      icon: <CheckIcon />,
      value: avgRate,
      unit: '%',
      sub: null,
      change: rateChange,
      iconBg: 'var(--gx-info-bg)',
      iconColor: 'var(--gx-info)',
    },
  ];

  return (
    <div
      className="kpi-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            background: 'var(--gx-white)',
            borderRadius: 'var(--radius-gx-lg)',
            padding: '22px 24px',
            boxShadow: 'var(--shadow-card)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.boxShadow = 'var(--shadow-md)';
            el.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.boxShadow = 'var(--shadow-card)';
            el.style.transform = 'translateY(0)';
          }}
        >
          {/* 헤더 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--gx-steel)',
                letterSpacing: '0.3px',
              }}
            >
              {card.label}
            </span>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-gx-md)',
                background: card.iconBg,
                color: card.iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {card.icon}
            </div>
          </div>

          {/* 값 */}
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--gx-charcoal)',
              lineHeight: 1,
              marginBottom: '8px',
              fontVariantNumeric: 'tabular-nums',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {card.value}
            <span
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--gx-steel)',
                marginLeft: '2px',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {card.unit}
            </span>
          </div>

          {/* 푸터 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {card.sub && (
              <span style={{ fontSize: '12px', color: 'var(--gx-slate)' }}>
                {card.subBold
                  ? (() => {
                      // 본사 32명 · 현장 66명
                      return (
                        <>
                          {'본사 '}
                          <strong style={{ color: 'var(--gx-charcoal)', fontWeight: 600 }}>
                            {hqCount}명
                          </strong>
                          {' · 현장 '}
                          <strong style={{ color: 'var(--gx-charcoal)', fontWeight: 600 }}>
                            {siteCount}명
                          </strong>
                        </>
                      );
                    })()
                  : card.sub}
              </span>
            )}
            {card.change && (
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  color: card.change.dir === 'up' ? 'var(--gx-success)' : 'var(--gx-danger)',
                }}
              >
                {card.change.dir === 'up' ? <UpArrow /> : <DownArrow />}
                {card.change.label}
              </span>
            )}
            {card.change && 'note' in card.change && card.change.note && (
              <span style={{ fontSize: '11px', color: 'var(--gx-silver)' }}>
                {card.change.note}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
