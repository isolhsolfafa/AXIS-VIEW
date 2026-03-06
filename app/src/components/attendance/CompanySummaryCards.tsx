// src/components/attendance/CompanySummaryCards.tsx
// 협력사 상세 카드 — 컨셉 HTML 완전 적용 (3열 그리드)

import type { CompanySummary } from '@/types/attendance';

interface ExtendedCompanySummary extends CompanySummary {
  hq_count?: number;
  site_count?: number;
  alert_type?: 'warning' | 'danger' | 'ok';
  icon_class?: string;
  sub_locations?: Array<{ name: string; count: number }>;
}

interface CompanySummaryCardsProps {
  companies: ExtendedCompanySummary[];
}

const COMPANY_STYLES: Record<string, { iconClass: string; gradient: string }> = {
  'C&A':    { iconClass: 'c1', gradient: 'linear-gradient(135deg, #6366F1, #818CF8)' },
  'FNI':    { iconClass: 'c2', gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)' },
  'BAT':    { iconClass: 'c3', gradient: 'linear-gradient(135deg, #EF4444, #F87171)' },
  'TMS(E)': { iconClass: 'c4', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
  'TMS(M)': { iconClass: 'c5', gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' },
  'NONE':   { iconClass: 'c6', gradient: 'linear-gradient(135deg, #64748B, #94A3B8)' },
  'P&S':    { iconClass: 'c7', gradient: 'linear-gradient(135deg, #10B981, #34D399)' },
};

function getCompanyIconLabel(company: string): string {
  if (company === 'TMS(E)' || company === 'TMS(M)') return 'TMS';
  if (company === 'NONE') return 'N/A';
  return company;
}

const InfoCircleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
    <path d="M6 1a5 5 0 100 10A5 5 0 006 1zM5.5 4h1v3h-1V4zm0 4h1v1h-1V8z"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10 3.5L5 8.5 2.5 6"/>
  </svg>
);

function AlertBadge({ type, notChecked }: { type: 'warning' | 'danger' | 'ok'; notChecked: number }) {
  if (type === 'ok' || notChecked === 0) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 600,
          background: 'var(--gx-success-bg)',
          color: 'var(--gx-success)',
        }}
      >
        <CheckCircleIcon />
        전원 체크
      </div>
    );
  }
  const bgColor = type === 'danger' ? 'var(--gx-danger-bg)' : 'var(--gx-warning-bg)';
  const textColor = type === 'danger' ? 'var(--gx-danger)' : 'var(--gx-warning)';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 600,
        background: bgColor,
        color: textColor,
      }}
    >
      <InfoCircleIcon />
      미체크 {notChecked}명
    </div>
  );
}

export default function CompanySummaryCards({ companies }: CompanySummaryCardsProps) {
  return (
    <div
      className="company-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {companies.map((company) => {
        const style = COMPANY_STYLES[company.company] || { gradient: 'linear-gradient(135deg, #64748B, #94A3B8)' };
        const hqSite = {
          hq: company.hq_count ?? 0,
          site: company.site_count ?? (company.total_workers - (company.hq_count ?? 0)),
          subLocations: company.sub_locations ?? [],
        };
        const notChecked = company.not_checked;
        const alertType = company.alert_type ?? (notChecked > 0 ? 'warning' : 'ok');

        return (
          <div
            key={company.company}
            style={{
              background: 'var(--gx-white)',
              borderRadius: 'var(--radius-gx-lg)',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden',
              transition: 'all 0.2s',
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
            {/* 카드 헤더 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 20px 14px',
                borderBottom: '1px solid var(--gx-cloud)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-gx-md)',
                    background: style.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'white',
                    flexShrink: 0,
                  }}
                >
                  {getCompanyIconLabel(company.company)}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
                    {company.company}
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '11px',
                      color: 'var(--gx-steel)',
                      marginTop: '2px',
                    }}
                  >
                    총 {company.total_workers}명
                  </div>
                </div>
              </div>
              <AlertBadge type={alertType} notChecked={notChecked} />
            </div>

            {/* 카드 바디 */}
            <div style={{ padding: '16px 20px 18px' }}>
              {/* 본사/현장 통계 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--gx-steel)', fontWeight: 500 }}>본사</div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--gx-charcoal)',
                    }}
                  >
                    {hqSite.hq}
                    <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--gx-steel)', marginLeft: '2px' }}>명</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--gx-steel)', fontWeight: 500 }}>현장</div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--gx-charcoal)',
                    }}
                  >
                    {hqSite.site}
                    <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--gx-steel)', marginLeft: '2px' }}>명</span>
                  </div>
                </div>
              </div>

              {/* 상세 chips */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--gx-cloud)',
                  flexWrap: 'wrap',
                }}
              >
                {hqSite.subLocations.map((sub) => (
                  <div
                    key={sub.name}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: 'var(--gx-slate)',
                      background: 'var(--gx-cloud)',
                    }}
                  >
                    {sub.name}{' '}
                    <strong style={{ fontWeight: 600, color: 'var(--gx-graphite)' }}>{sub.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
