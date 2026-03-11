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
  { model: 'GAIA-I DUAL', sn: 'SN-5892', start: '02-10', target: '02-14', progress: 100, status: 'completed' as const, partner: 'BAT' },
  { model: 'GAIA-I DUAL', sn: 'SN-5893', start: '02-10', target: '02-14', progress: 92, status: 'in-progress' as const, partner: 'C&A' },
  { model: 'GAIA-P', sn: 'SN-5894', start: '02-11', target: '02-18', progress: 64, status: 'in-progress' as const, partner: 'FNI' },
  { model: 'GAIA-P DUAL', sn: 'SN-5895', start: '02-12', target: '02-19', progress: 45, status: 'in-progress' as const, partner: 'P&S' },
  { model: 'SWS-I', sn: 'SN-5896', start: '02-13', target: '02-21', progress: 18, status: 'pending' as const, partner: 'TMS(E)' },
];

const SAMPLE_CHART = [
  { model: 'GAIA-I DUAL', count: 30 },
  { model: 'GAIA-P DUAL', count: 2 },
  { model: 'GAIA-P', count: 3 },
  { model: 'GAIA-I', count: 3 },
  { model: 'GAIA-II DUAL', count: 1 },
  { model: 'DRAGON DUAL', count: 0 },
  { model: 'SWS-I', count: 1 },
];

const SAMPLE_ACTIVITIES = [
  { color: 'var(--gx-success)', text: '<strong>SN-5892</strong> GAIA-I DUAL 생산 완료', time: '19분 전' },
  { color: 'var(--gx-warning)', text: '<strong>SN-5890</strong> 검사 공정 불량 감지 — 외관 스크래치', time: '43분 전' },
  { color: 'var(--gx-accent)', text: '<strong>AI 예측</strong> GAIA-P DUAL 불량 확률 12.3% 경고', time: '1시간 전' },
  { color: 'var(--gx-info)', text: '<strong>데이터 동기화</strong> ERP → G-AXIS 파이프라인 완료 (82건)', time: '2시간 전' },
  { color: 'var(--gx-success)', text: '<strong>SN-5888</strong> ~ <strong>SN-5891</strong> 출하 처리 완료 (4대)', time: '3시간 전' },
];

const MONTHLY_MODELS = [
  { model: 'GAIA-I DUAL', count: 81, pct: 82, colorClass: 'linear-gradient(90deg, #6366F1, #818CF8)' },
  { model: 'GAIA-P DUAL', count: 12, pct: 12, colorClass: 'linear-gradient(90deg, #3B82F6, #60A5FA)' },
  { model: 'GAIA-P', count: 10, pct: 10, colorClass: 'linear-gradient(90deg, #10B981, #34D399)' },
  { model: 'GAIA-I', count: 8, pct: 8, colorClass: 'linear-gradient(90deg, #F59E0B, #FBBF24)' },
  { model: 'DRAGON DUAL', count: 5, pct: 5, colorClass: 'linear-gradient(90deg, #8B5CF6, #A78BFA)' },
  { model: 'SWS-I', count: 3, pct: 3, colorClass: 'linear-gradient(90deg, #EC4899, #F472B6)' },
];

const maxCount = Math.max(...SAMPLE_CHART.map(c => c.count));

/* ── progress 색상 유틸 ─── */
function progressLevel(pct: number): { bar: string; text: string } {
  if (pct >= 80) return { bar: 'var(--gx-success)', text: 'var(--gx-success)' };
  if (pct >= 40) return { bar: 'var(--gx-warning)', text: 'var(--gx-warning)' };
  return { bar: 'var(--gx-danger)', text: 'var(--gx-danger)' };
}

/* ── 상태 뱃지 ─── */
const STATUS_CONFIG = {
  completed: { label: '완료', bg: 'rgba(16,185,129,0.08)', color: 'var(--gx-success)' },
  'in-progress': { label: '진행중', bg: 'rgba(59,130,246,0.08)', color: 'var(--gx-info)' },
  pending: { label: '초기', bg: 'rgba(245,158,11,0.08)', color: 'var(--gx-warning)' },
};

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
      <div style={{ padding: '28px 32px', maxWidth: '1440px' }}>
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
              주간 생산 지표 [Planned Finish]
            </div>
            <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginBottom: '24px' }}>모델별 생산 완료 현황</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '180px' }}>
              {SAMPLE_CHART.map(c => (
                <div key={c.model} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gx-charcoal)', fontFamily: "'JetBrains Mono', monospace" }}>{c.count}</span>
                  <div style={{
                    width: '100%', maxWidth: '48px',
                    height: `${Math.max((c.count / maxCount) * 150, 4)}px`,
                    background: c.count === 0
                      ? 'linear-gradient(180deg, var(--gx-mist) 0%, #D1D5E0 100%)'
                      : 'linear-gradient(180deg, var(--gx-accent) 0%, #818CF8 100%)',
                    borderRadius: '6px 6px 2px 2px',
                    opacity: c.count === 0 ? 0.5 : 1,
                  }} />
                  <span style={{ fontSize: '9px', color: 'var(--gx-steel)', textAlign: 'center', lineHeight: 1.2 }}>{c.model}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Donut */}
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

        {/* 생산 현황 상세 Table */}
        <div style={{
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)', overflow: 'hidden', marginBottom: '24px',
        }}>
          <div style={{ padding: '20px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>생산 현황 상세</div>
              <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>모델별 진행 현황 및 일정 추적</div>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--gx-cloud)' }}>
                {['모델명', 'S/N', '시작일', '목표일', '진행률', '상태', '담당 협력사'].map(h => (
                  <th key={h} style={{
                    padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600,
                    color: 'var(--gx-steel)', letterSpacing: '0.5px', textTransform: 'uppercase' as const,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMPLE_TABLE.map(r => {
                const pLevel = progressLevel(r.progress);
                const sCfg = STATUS_CONFIG[r.status];
                return (
                  <tr key={r.sn} style={{ borderBottom: '1px solid var(--gx-cloud)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>{r.model}</td>
                    <td style={{ padding: '14px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--gx-graphite)' }}>{r.sn}</td>
                    <td style={{ padding: '14px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--gx-graphite)' }}>{r.start}</td>
                    <td style={{ padding: '14px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--gx-graphite)' }}>{r.target}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'var(--gx-mist)', minWidth: '80px', overflow: 'hidden' }}>
                          <div style={{ width: `${r.progress}%`, height: '100%', borderRadius: '3px', background: pLevel.bar }} />
                        </div>
                        <span style={{
                          fontSize: '12px', fontWeight: 600, color: pLevel.text,
                          fontFamily: "'JetBrains Mono', monospace", minWidth: '42px', textAlign: 'right' as const,
                        }}>{r.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                        background: sCfg.bg, color: sCfg.color,
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
                        {sCfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--gx-graphite)' }}>{r.partner}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Grid: 최근 활동 + 월간 생산 지표 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* 최근 활동 */}
          <div style={{
            background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
            boxShadow: 'var(--shadow-card)', overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 24px 0' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>최근 활동</div>
              <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>실시간 생산 이벤트</div>
            </div>
            <div style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {SAMPLE_ACTIVITIES.map((a, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '14px', padding: '14px 0',
                    borderBottom: i < SAMPLE_ACTIVITIES.length - 1 ? '1px solid var(--gx-cloud)' : 'none',
                    alignItems: 'flex-start',
                  }}>
                    <div style={{ paddingTop: '2px' }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: a.color, flexShrink: 0,
                      }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{ fontSize: '13px', color: 'var(--gx-graphite)', lineHeight: 1.5 }}
                        dangerouslySetInnerHTML={{ __html: a.text }}
                      />
                      <div style={{ fontSize: '11px', color: 'var(--gx-silver)', marginTop: '3px' }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 월간 생산 지표 */}
          <div style={{
            background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
            boxShadow: 'var(--shadow-card)', overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 24px 0' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>월간 생산 지표 [Planned Mech]</div>
              <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>2월 모델별 누적 현황</div>
            </div>
            <div style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {MONTHLY_MODELS.map(m => (
                  <div key={m.model} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: 500, color: 'var(--gx-slate)',
                      width: '100px', textAlign: 'right' as const, flexShrink: 0,
                    }}>{m.model}</span>
                    <div style={{
                      flex: 1, height: '24px', background: 'var(--gx-cloud)',
                      borderRadius: '6px', overflow: 'hidden', position: 'relative' as const,
                    }}>
                      <div style={{
                        height: '100%', width: `${m.pct}%`, borderRadius: '6px',
                        background: m.colorClass,
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                        paddingRight: '10px',
                        fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
                        fontWeight: 600, color: '#fff',
                        minWidth: 'fit-content',
                      }}>
                        {m.count}
                      </div>
                    </div>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
                      fontWeight: 600, color: 'var(--gx-graphite)',
                      minWidth: '40px',
                    }}>{m.count}대</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
