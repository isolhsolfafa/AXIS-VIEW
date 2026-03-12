// src/pages/production/ShipmentHistoryPage.tsx
// 출하이력 — 스켈레톤 (데이터 소스 미확정)
// actual_ship_date 있으나 realtime 아님, 추후 확정

import Layout from '@/components/layout/Layout';

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
        <strong>데이터 소스 확정 대기</strong> · 출하 데이터의 실시간 연동 방안이 확정되면 구현 예정입니다.
      </div>
      <div style={{
        marginLeft: 'auto', padding: '4px 12px', borderRadius: 'var(--radius-gx-sm)',
        fontSize: '11px', fontWeight: 600, color: 'var(--gx-warning)', background: 'rgba(245, 158, 11, 0.12)',
      }}>미정</div>
    </div>
  );
}

const SAMPLE_SHIPMENTS = [
  { on: '6201', model: 'GAIA-I DUAL', customer: 'MICRON', snCount: 2, planDate: '2026-02-28', actualDate: '2026-02-27', status: 'shipped' as const },
  { on: '6205', model: 'GAIA-I DUAL', customer: 'SEC', snCount: 3, planDate: '2026-03-05', actualDate: '2026-03-04', status: 'shipped' as const },
  { on: '6210', model: 'O3 Destructor', customer: 'SEC', snCount: 1, planDate: '2026-03-07', actualDate: '2026-03-07', status: 'shipped' as const },
  { on: '6238', model: 'GAIA-I DUAL', customer: 'MICRON', snCount: 3, planDate: '2026-03-14', actualDate: null, status: 'planned' as const },
  { on: '6312', model: 'GAIA-I DUAL', customer: 'MICRON', snCount: 1, planDate: '2026-03-18', actualDate: null, status: 'planned' as const },
  { on: '6401', model: 'GAIA-I DUAL', customer: 'SEC', snCount: 2, planDate: '2026-03-21', actualDate: null, status: 'planned' as const },
  { on: '6405', model: 'GAIA-P DUAL', customer: 'SAMSUNG', snCount: 5, planDate: '2026-03-28', actualDate: null, status: 'planned' as const },
];

const STATUS_STYLE = {
  shipped: { label: '출하 완료', bg: 'rgba(16,185,129,0.08)', color: 'var(--gx-success)' },
  planned: { label: '출하 예정', bg: 'rgba(59,130,246,0.08)', color: 'var(--gx-info)' },
};

export default function ShipmentHistoryPage() {
  const shipped = SAMPLE_SHIPMENTS.filter(s => s.status === 'shipped').length;
  const planned = SAMPLE_SHIPMENTS.filter(s => s.status === 'planned').length;

  return (
    <Layout title="출하이력">
      <div style={{ padding: '28px 32px', maxWidth: '1600px' }}>
        <PrepareBanner />

        {/* KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: '3월 출하 완료', value: `${shipped}건`, color: 'var(--gx-success)' },
            { label: '출하 예정', value: `${planned}건`, color: 'var(--gx-info)' },
            { label: '총 S/N', value: `${SAMPLE_SHIPMENTS.reduce((s, r) => s + r.snCount, 0)}대`, color: 'var(--gx-accent)' },
            { label: '납기 준수율', value: '100%', color: 'var(--gx-success)' },
          ].map(k => (
            <div key={k.label} style={{
              background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
              padding: '18px 20px', boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{ fontSize: '10.5px', fontWeight: 500, color: 'var(--gx-steel)', marginBottom: '8px' }}>{k.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--gx-charcoal)', fontFamily: "'JetBrains Mono', monospace" }}>{k.value}</div>
              <div style={{ marginTop: '8px', height: '3px', borderRadius: '2px', background: 'var(--gx-cloud)' }}>
                <div style={{ width: '50%', height: '100%', borderRadius: '2px', background: k.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* 테이블 */}
        <div style={{ background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--gx-cloud)' }}>
                  {['O/N', '모델', '고객사', 'S/N 수', '출하 예정일', '실제 출하일', '상태'].map(h => (
                    <th key={h} style={{
                      padding: '11px 16px', textAlign: h === '상태' ? 'center' : 'left',
                      fontSize: '10px', fontWeight: 600, color: 'var(--gx-steel)',
                      letterSpacing: '0.5px', textTransform: 'uppercase',
                      borderBottom: '2px solid var(--gx-mist)', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAMPLE_SHIPMENTS.map(row => {
                  const st = STATUS_STYLE[row.status];
                  return (
                    <tr key={row.on} style={{ borderBottom: '1px solid var(--gx-cloud)' }}>
                      <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 700, color: 'var(--gx-charcoal)' }}>{row.on}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gx-charcoal)', fontSize: '12px' }}>{row.model}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--gx-graphite)', fontSize: '12px' }}>{row.customer}</td>
                      <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--gx-graphite)' }}>{row.snCount}</td>
                      <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--gx-graphite)' }}>{row.planDate}</td>
                      <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: row.actualDate ? 'var(--gx-success)' : 'var(--gx-silver)' }}>
                        {row.actualDate || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '10px',
                          background: st.bg, color: st.color,
                        }}>{st.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
