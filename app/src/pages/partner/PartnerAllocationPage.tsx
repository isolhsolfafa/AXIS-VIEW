// src/pages/partner/PartnerAllocationPage.tsx
// 협력사 관리 — 물량할당 (시뮬레이션 + 이력)

import Layout from '@/components/layout/Layout';

/* ── 등급 뱃지 ── */
const GRADE_STYLE: Record<string, { bg: string; color: string }> = {
  A: { bg: 'rgba(16,185,129,0.08)', color: '#059669' },
  B: { bg: 'rgba(59,130,246,0.08)', color: '#2563EB' },
  C: { bg: 'rgba(245,158,11,0.08)', color: '#D97706' },
};

function GradeBadge({ grade }: { grade: string }) {
  const s = GRADE_STYLE[grade] || GRADE_STYLE.C;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '2px 6px', borderRadius: '20px', fontSize: '10px', fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor' }} />
      {grade}
    </span>
  );
}

/* ── 샘플 데이터 ── */
const MECH_SIM = [
  { grade: 'A', partner: 'FNI', pct: 40, count: 48, color: 'linear-gradient(90deg,#10B981,#34D399)' },
  { grade: 'B', partner: 'BAT', pct: 40, count: 48, color: 'linear-gradient(90deg,#6366F1,#818CF8)' },
  { grade: 'B', partner: 'TMS(M)', pct: 20, count: 24, color: 'linear-gradient(90deg,#F59E0B,#FBBF24)' },
];

const ELEC_SIM = [
  { grade: 'A', partner: 'TMS(E)', pct: 35, count: 28, color: 'linear-gradient(90deg,#10B981,#34D399)' },
  { grade: 'A', partner: 'C&A', pct: 40, count: 32, color: 'linear-gradient(90deg,#6366F1,#818CF8)' },
  { grade: 'C', partner: 'P&S', pct: 25, count: 20, color: 'linear-gradient(90deg,#F59E0B,#FBBF24)' },
];

interface HistoryRow { evalMonth: string; allocMonth: string; bat: string; fni: string; tms: string; status: string; statusStyle: { bg: string; color: string } }

const MECH_HISTORY: HistoryRow[] = [
  { evalMonth: '2026-03', allocMonth: '2026-05', bat: '40%', fni: '40%', tms: '20%', status: '조정 중', statusStyle: { bg: 'rgba(245,158,11,0.08)', color: '#D97706' } },
  { evalMonth: '2026-02', allocMonth: '2026-04', bat: '45%', fni: '35%', tms: '20%', status: '확정', statusStyle: { bg: 'rgba(16,185,129,0.08)', color: '#059669' } },
  { evalMonth: '2026-01', allocMonth: '2026-03', bat: '42%', fni: '38%', tms: '20%', status: '확정', statusStyle: { bg: 'rgba(16,185,129,0.08)', color: '#059669' } },
];

/* ── 공통 테이블 스타일 ── */
const thStyle: React.CSSProperties = {
  padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600,
  color: 'var(--gx-steel)', letterSpacing: '0.5px', textTransform: 'uppercase',
  background: 'var(--gx-cloud)', borderBottom: '1px solid var(--gx-mist)',
};
const tdStyle: React.CSSProperties = {
  padding: '14px 20px', borderBottom: '1px solid var(--gx-cloud)', color: 'var(--gx-graphite)',
};
const numStyle: React.CSSProperties = {
  ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
};

function SimCard({ title, subtitle, data }: { title: string; subtitle: string; data: typeof MECH_SIM }) {
  return (
    <div style={{ background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>{title}</div>
        <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>{subtitle}</div>
      </div>
      <div style={{ padding: '20px 24px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.map(b => (
            <div key={b.partner} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ width: '28px', flexShrink: 0 }}><GradeBadge grade={b.grade} /></span>
              <span style={{ fontSize: '12px', fontWeight: 600, width: '48px' }}>{b.partner}</span>
              <div style={{ flex: 1, height: '24px', background: 'var(--gx-cloud)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${b.pct}%`, borderRadius: '6px', background: b.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '10px',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, color: '#fff',
                }}>{b.pct}%</div>
              </div>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 600,
                color: 'var(--gx-graphite)', minWidth: '50px',
              }}>{b.count}대</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PartnerAllocationPage() {
  return (
    <Layout title="협력사 관리">
      <div style={{ padding: '28px 32px', maxWidth: '1440px' }}>
        {/* Warning banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 20px', marginBottom: '24px',
          background: 'rgba(245,158,11,0.08)', borderRadius: 'var(--radius-gx-lg)',
          border: '1px solid rgba(245,158,11,0.15)',
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gx-warning)', flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: 'var(--gx-graphite)' }}>
            <strong>3월 평가 → 5월 물량할당</strong> · 등급 기반 자동 산출 → 관리자 미세 조정 → 확정
          </div>
          <div style={{
            marginLeft: 'auto', padding: '4px 12px', borderRadius: 'var(--radius-gx-sm)',
            fontSize: '11px', fontWeight: 600, color: '#D97706', background: 'rgba(245,158,11,0.15)',
          }}>Draft</div>
        </div>

        {/* 시뮬레이션 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <SimCard title="기구 물량할당 시뮬레이션" subtitle="5월 예상 총 물량: 120대" data={MECH_SIM} />
          <SimCard title="전장 물량할당 시뮬레이션" subtitle="5월 예상 총 물량: 80대" data={ELEC_SIM} />
        </div>

        {/* 할당 이력 */}
        <div style={{ background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px 0' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>물량할당 이력</div>
            <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>기구 협력사 기준</div>
          </div>
          <div style={{ padding: '0 24px 24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '16px' }}>
              <thead>
                <tr>
                  {['평가월', '할당월', 'BAT', 'FNI', 'TMS(M)', '상태'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MECH_HISTORY.map(r => (
                  <tr key={r.evalMonth}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--gx-snow)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={tdStyle}>{r.evalMonth}</td>
                    <td style={tdStyle}>{r.allocMonth}</td>
                    <td style={numStyle}>{r.bat}</td>
                    <td style={numStyle}>{r.fni}</td>
                    <td style={numStyle}>{r.tms}</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                        background: r.statusStyle.bg, color: r.statusStyle.color,
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
