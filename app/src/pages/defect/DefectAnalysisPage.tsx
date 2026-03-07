// src/pages/defect/DefectAnalysisPage.tsx
// 불량 분석 — API 연동 준비 중 (샘플 데이터)

import Layout from '@/components/layout/Layout';

const SAMPLE_KPI = [
  { label: '총 불량 건수', value: '97건', color: 'var(--gx-danger)', sub: '가압검사 불량 기준' },
  { label: '총 검사 CH수', value: '435CH', color: 'var(--gx-info)', sub: '2026년 누적 검사' },
  { label: '평균 불량률', value: '22.3%', color: 'var(--gx-warning)', sub: '불량건수 / 검사CH수' },
  { label: '주요 외주사', value: '3개사', color: 'var(--gx-accent)', sub: '불량 데이터 보유 외주사' },
];

const PARTS_RANKING = [
  { part: 'BULKHEAD UNION', count: 12, pct: 15.4 },
  { part: 'UNION ELBOW', count: 11, pct: 14.1 },
  { part: 'MALE CONNECTOR', count: 9, pct: 11.5 },
  { part: 'UNION TEE', count: 7, pct: 8.97 },
  { part: 'ADJUSTABLE ELBOW', count: 5, pct: 6.41 },
  { part: 'MALE ELBOW', count: 4, pct: 5.13 },
];

const VENDORS = [
  { name: 'Vendor A', rate: 28.5, defects: 42, channels: 147 },
  { name: 'Vendor B', rate: 19.2, defects: 33, channels: 172 },
  { name: 'Vendor C', rate: 19.0, defects: 22, channels: 116 },
];

const maxDefect = Math.max(...PARTS_RANKING.map(p => p.count));

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

export default function DefectAnalysisPage() {
  return (
    <Layout title="불량 분석">
      <div style={{ padding: '28px 32px', maxWidth: '1400px' }}>
        <PrepareBanner />

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '24px',
          padding: '4px', background: 'var(--gx-cloud)', borderRadius: 'var(--radius-gx-md)', width: 'fit-content',
        }}>
          {['가압검사', '제조품질', '통합비교', '주차별 분석'].map((t, i) => (
            <div key={t} style={{
              padding: '8px 20px', borderRadius: 'var(--radius-gx-sm)',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              background: i === 0 ? 'var(--gx-white)' : 'transparent',
              color: i === 0 ? 'var(--gx-accent)' : 'var(--gx-steel)',
              boxShadow: i === 0 ? 'var(--shadow-card)' : 'none',
            }}>{t}</div>
          ))}
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {SAMPLE_KPI.map(k => (
            <div key={k.label} style={{
              background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
              padding: '20px 24px', boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-steel)', marginBottom: '12px' }}>{k.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--gx-charcoal)', lineHeight: 1.1 }}>{k.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '6px' }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* Donut */}
          <div style={{
            background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
            boxShadow: 'var(--shadow-card)', padding: '24px',
          }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '4px' }}>가압검사 부품별 분포</div>
            <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginBottom: '20px' }}>TOP 6 불량 부품</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '120px', height: '120px', borderRadius: '50%',
                background: 'conic-gradient(var(--gx-danger) 0% 15%, var(--gx-warning) 15% 29%, var(--gx-accent) 29% 41%, var(--gx-info) 41% 50%, var(--gx-success) 50% 56%, #8B5CF6 56% 61%, var(--gx-silver) 61% 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: '70px', height: '70px', borderRadius: '50%', background: 'var(--gx-white)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', fontWeight: 700, color: 'var(--gx-charcoal)',
                }}>97</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {PARTS_RANKING.slice(0, 4).map(p => (
                <div key={p.part} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: 'var(--gx-slate)' }}>{p.part}</span>
                  <span style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{p.count}건 ({p.pct}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking */}
          <div style={{
            background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
            boxShadow: 'var(--shadow-card)', padding: '24px',
          }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '4px' }}>불량 부품 순위</div>
            <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginBottom: '20px' }}>건수 기준 상위 부품</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {PARTS_RANKING.map((p, i) => (
                <div key={p.part} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700,
                    background: i < 3 ? 'var(--gx-danger-bg)' : 'var(--gx-cloud)',
                    color: i < 3 ? 'var(--gx-danger)' : 'var(--gx-steel)',
                  }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: '12px', color: 'var(--gx-charcoal)' }}>{p.part}</span>
                  <div style={{ width: '80px', height: '6px', borderRadius: '3px', background: 'var(--gx-cloud)' }}>
                    <div style={{ width: `${(p.count / maxDefect) * 100}%`, height: '100%', borderRadius: '3px', background: i < 3 ? 'var(--gx-danger)' : 'var(--gx-warning)' }} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: 'var(--gx-charcoal)', width: '40px', textAlign: 'right' }}>{p.count}건</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vendor Cards */}
        <div style={{
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)', padding: '24px',
        }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '4px' }}>외주사별 불량 현황</div>
          <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginBottom: '20px' }}>주요 3개 외주사 · 가압검사 기준</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {VENDORS.map(v => (
              <div key={v.name} style={{
                padding: '20px', borderRadius: 'var(--radius-gx-md)',
                border: '1px solid var(--gx-mist)', background: 'var(--gx-snow)',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '16px' }}>{v.name}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--gx-steel)' }}>불량률</span>
                    <span style={{ fontWeight: 700, color: v.rate > 25 ? 'var(--gx-danger)' : 'var(--gx-warning)', fontFamily: "'JetBrains Mono', monospace" }}>{v.rate}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--gx-steel)' }}>불량 건수</span>
                    <span style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{v.defects}건</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--gx-steel)' }}>검사 CH수</span>
                    <span style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{v.channels}CH</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
