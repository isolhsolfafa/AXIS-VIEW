// src/pages/factory/FactoryDashboardPage.tsx
// 공장 대시보드 — API 연동 준비 중 (샘플 데이터)

import Layout from '@/components/layout/Layout';

const SAMPLE_KPI = [
  { label: '주간 생산량', value: '37대', color: 'var(--gx-info)', sub: 'Planned Finish 기준', change: '+12.1%' },
  { label: '완료율', value: '84.2%', color: 'var(--gx-success)', sub: '목표 대비 실적', change: '+5.3%' },
  { label: '불량 건수', value: '4건', color: 'var(--gx-warning)', sub: '주간 누적', change: '-2건' },
  { label: '평균 CT', value: '72.5h', color: 'var(--gx-accent)', sub: 'Cycle Time', change: '-8.2%' },
];

const SAMPLE_TABLE = [
  { model: 'GAIA-I DUAL', sn: 'GID-2026-0301', start: '2026-02-10', target: '2026-02-17', progress: 92, status: '진행중', partner: 'FNI' },
  { model: 'GAIA-I DUAL', sn: 'GID-2026-0302', start: '2026-02-10', target: '2026-02-17', progress: 100, status: '완료', partner: 'BAT' },
  { model: 'GAIA-P DUAL', sn: 'GPD-2026-0115', start: '2026-02-11', target: '2026-02-18', progress: 67, status: '진행중', partner: 'TMS(M)' },
  { model: 'GAIA-P', sn: 'GP-2026-0088', start: '2026-02-12', target: '2026-02-19', progress: 45, status: '진행중', partner: 'FNI' },
  { model: 'GAIA-I', sn: 'GI-2026-0201', start: '2026-02-12', target: '2026-02-20', progress: 30, status: '진행중', partner: 'BAT' },
];

const SAMPLE_CHART = [
  { model: 'GAIA-I DUAL', count: 30 },
  { model: 'GAIA-P DUAL', count: 2 },
  { model: 'GAIA-P', count: 3 },
  { model: 'GAIA-I', count: 3 },
  { model: 'GAIA-II DUAL', count: 1 },
  { model: 'SWS-I', count: 1 },
];

const maxCount = Math.max(...SAMPLE_CHART.map(c => c.count));

function PrepareBanner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '14px 20px', marginBottom: '24px',
      background: 'var(--gx-warning-bg)', borderRadius: 'var(--radius-gx-lg)',
      border: '1px solid rgba(245, 158, 11, 0.2)',
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gx-warning)', flexShrink: 0 }} />
      <div style={{ fontSize: '13px', color: 'var(--gx-graphite)' }}>
        <strong>API 연동 준비 중</strong> · 아래 데이터는 샘플입니다. 실제 데이터는 API 연동 후 표시됩니다.
      </div>
      <div style={{
        marginLeft: 'auto', padding: '4px 12px', borderRadius: 'var(--radius-gx-sm)',
        fontSize: '11px', fontWeight: 600, color: 'var(--gx-warning)', background: 'rgba(245, 158, 11, 0.12)',
      }}>
        Phase 3
      </div>
    </div>
  );
}

export default function FactoryDashboardPage() {
  return (
    <Layout title="공장 대시보드">
      <div style={{ padding: '28px 32px', maxWidth: '1400px' }}>
        <PrepareBanner />

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {SAMPLE_KPI.map(k => (
            <div key={k.label} style={{
              background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
              padding: '20px 24px', boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-steel)', marginBottom: '12px' }}>{k.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--gx-charcoal)', lineHeight: 1.1 }}>{k.value}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--gx-steel)' }}>{k.sub}</span>
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  color: k.change.startsWith('-') ? 'var(--gx-success)' : 'var(--gx-accent)',
                }}>{k.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Donut */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* Bar Chart */}
          <div style={{
            background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
            boxShadow: 'var(--shadow-card)', padding: '24px',
          }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '4px' }}>
              주간 생산 지표
            </div>
            <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginBottom: '24px' }}>모델별 생산 완료 현황 [Planned Finish]</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '180px' }}>
              {SAMPLE_CHART.map(c => (
                <div key={c.model} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gx-charcoal)', fontFamily: "'JetBrains Mono', monospace" }}>{c.count}</span>
                  <div style={{
                    width: '100%', maxWidth: '48px',
                    height: `${Math.max((c.count / maxCount) * 150, 4)}px`,
                    background: 'var(--gx-accent)', borderRadius: '4px 4px 0 0',
                    opacity: c.count === 0 ? 0.2 : 1,
                  }} />
                  <span style={{ fontSize: '9px', color: 'var(--gx-steel)', textAlign: 'center', lineHeight: 1.2 }}>{c.model}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Donut placeholder */}
          <div style={{
            background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
            boxShadow: 'var(--shadow-card)', padding: '24px',
          }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '4px' }}>모델 비율</div>
            <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginBottom: '24px' }}>W07 생산 구성</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}>
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                background: 'conic-gradient(var(--gx-accent) 0% 81%, var(--gx-info) 81% 89%, var(--gx-steel) 89% 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%', background: 'var(--gx-white)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: 700, color: 'var(--gx-charcoal)',
                }}>37</div>
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--gx-slate)' }}><span style={{ color: 'var(--gx-accent)' }}>●</span> GAIA-I DUAL</span>
                <span style={{ fontWeight: 600 }}>81%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--gx-slate)' }}><span style={{ color: 'var(--gx-info)' }}>●</span> GAIA-P / I</span>
                <span style={{ fontWeight: 600 }}>8.1%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)', overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gx-mist)' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>생산 진행 현황</div>
            <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>모델별 제작 진행률</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--gx-cloud)', borderBottom: '1px solid var(--gx-mist)' }}>
                {['모델명', 'S/N', '시작일', '목표일', '진행률', '상태', '담당 협력사'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--gx-steel)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMPLE_TABLE.map((r, i) => (
                <tr key={r.sn} style={{ borderBottom: '1px solid var(--gx-mist)', background: i % 2 === 1 ? 'rgba(248,250,252,0.5)' : 'transparent' }}>
                  <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>{r.model}</td>
                  <td style={{ padding: '11px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--gx-accent)' }}>{r.sn}</td>
                  <td style={{ padding: '11px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--gx-slate)' }}>{r.start}</td>
                  <td style={{ padding: '11px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--gx-slate)' }}>{r.target}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'var(--gx-cloud)' }}>
                        <div style={{ width: `${r.progress}%`, height: '100%', borderRadius: '3px', background: r.progress === 100 ? 'var(--gx-success)' : 'var(--gx-accent)' }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gx-charcoal)', fontFamily: "'JetBrains Mono', monospace" }}>{r.progress}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                      background: r.status === '완료' ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.1)',
                      color: r.status === '완료' ? '#16a34a' : 'var(--gx-accent)',
                    }}>{r.status}</span>
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--gx-slate)' }}>{r.partner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
