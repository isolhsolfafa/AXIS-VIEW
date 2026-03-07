// src/pages/plan/ProductionPlanPage.tsx
// 생산일정 — API 연동 준비 중 (샘플 데이터)

import Layout from '@/components/layout/Layout';

const SAMPLE_KPI = [
  { label: '2월 기구시작', value: '193' },
  { label: '필터된 결과', value: '43' },
  { label: '고객사 수', value: '16' },
  { label: '모델 수', value: '17' },
  { label: '총 데이터수', value: '590' },
];

const PIPELINE = [
  { stage: '기구', count: 11, color: 'var(--gx-danger)' },
  { stage: '전장', count: 6, color: 'var(--gx-accent)' },
  { stage: '가압', count: 9, color: 'var(--gx-info)' },
  { stage: '포장', count: 7, color: 'var(--gx-steel)' },
  { stage: '출하', count: 17, color: 'var(--gx-success)' },
];

const SAMPLE_TABLE = [
  { on: 'ORD-2601', pn: 'SCR-100', sn: 'S2601-001', model: 'GAIA-I DUAL', customer: 'Samsung', line: 'L1', mechVendor: 'FNI', elecVendor: 'TMS(E)', mechStart: '02-10', mechEnd: '02-14', elecStart: '02-15', elecEnd: '02-18', pressure: '02-19', inspect: '02-20', process: '02-21', finish: '02-22', ship: '02-24' },
  { on: 'ORD-2602', pn: 'SCR-101', sn: 'S2601-002', model: 'GAIA-P DUAL', customer: 'LG', line: 'L2', mechVendor: 'BAT', elecVendor: 'P&S', mechStart: '02-11', mechEnd: '02-15', elecStart: '02-16', elecEnd: '02-19', pressure: '02-20', inspect: '02-21', process: '02-22', finish: '02-23', ship: '02-25' },
  { on: 'ORD-2603', pn: 'SCR-102', sn: 'S2601-003', model: 'GAIA-I', customer: 'SK', line: 'L1', mechVendor: 'FNI', elecVendor: 'C&A', mechStart: '02-12', mechEnd: '02-16', elecStart: '02-17', elecEnd: '02-20', pressure: '02-21', inspect: '—', process: '—', finish: '—', ship: '—' },
];

const TABLE_COLS = ['O/N', '제품번호', 'S/N', '모델', '고객사', '라인', '기구업체', '전장업체', '기구시작', '기구종료', '전장시작', '전장종료', '가압', '자주검사', '공정', '마무리', '출하'];

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

export default function ProductionPlanPage() {
  return (
    <Layout title="생산일정">
      <div style={{ padding: '28px 32px', maxWidth: '1600px' }}>
        <PrepareBanner />

        {/* KPI Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {SAMPLE_KPI.map(k => (
            <div key={k.label} style={{
              background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
              padding: '16px 20px', boxShadow: 'var(--shadow-card)', textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginBottom: '8px' }}>{k.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--gx-charcoal)', fontFamily: "'JetBrains Mono', monospace" }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Process Pipeline */}
        <div style={{
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)', padding: '24px', marginBottom: '24px',
        }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '4px' }}>오늘 공정 현황</div>
          <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginBottom: '20px' }}>SCR 생산 파이프라인</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {PIPELINE.map((p, i) => (
              <div key={p.stage} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  flex: 1, padding: '16px', borderRadius: 'var(--radius-gx-md)',
                  background: `${p.color}12`, border: `1px solid ${p.color}30`,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: p.color, fontFamily: "'JetBrains Mono', monospace" }}>{p.count}</div>
                  <div style={{ fontSize: '11px', color: 'var(--gx-slate)', marginTop: '4px' }}>{p.stage}</div>
                </div>
                {i < PIPELINE.length - 1 && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--gx-silver)" strokeWidth="1.5">
                    <path d="M6 4l4 4-4 4"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)', overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gx-mist)' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>생산 일정 상세</div>
            <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>SCR 생산 현황 · W07</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '1400px' }}>
              <thead>
                <tr style={{ background: 'var(--gx-cloud)', borderBottom: '1px solid var(--gx-mist)' }}>
                  {TABLE_COLS.map(h => (
                    <th key={h} style={{ padding: '10px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--gx-steel)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAMPLE_TABLE.map((r, i) => (
                  <tr key={r.sn} style={{ borderBottom: '1px solid var(--gx-mist)', background: i % 2 === 1 ? 'rgba(248,250,252,0.5)' : 'transparent' }}>
                    <td style={{ padding: '10px', color: 'var(--gx-slate)' }}>{r.on}</td>
                    <td style={{ padding: '10px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--gx-slate)' }}>{r.pn}</td>
                    <td style={{ padding: '10px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'var(--gx-accent)' }}>{r.sn}</td>
                    <td style={{ padding: '10px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>{r.model}</td>
                    <td style={{ padding: '10px', color: 'var(--gx-slate)' }}>{r.customer}</td>
                    <td style={{ padding: '10px', color: 'var(--gx-steel)' }}>{r.line}</td>
                    <td style={{ padding: '10px', color: 'var(--gx-slate)' }}>{r.mechVendor}</td>
                    <td style={{ padding: '10px', color: 'var(--gx-slate)' }}>{r.elecVendor}</td>
                    {[r.mechStart, r.mechEnd, r.elecStart, r.elecEnd, r.pressure, r.inspect, r.process, r.finish, r.ship].map((d, j) => (
                      <td key={j} style={{ padding: '10px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: d === '—' ? 'var(--gx-silver)' : 'var(--gx-slate)' }}>{d}</td>
                    ))}
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
