// src/pages/partner/PartnerDashboardPage.tsx
// 협력사 관리 — 대시보드 (KPI 요약 + NaN 히트맵 + 출퇴근 + 주간 NaN 추이)

import Layout from '@/components/layout/Layout';

/* ── 샘플 데이터 ── */
const SAMPLE_KPI = [
  { label: '등록 협력사', value: '6', unit: '개사', color: 'var(--gx-charcoal)', sub: '기구 3사 + 전장 3사' },
  { label: '오늘 출근율', value: '87.5%', unit: '', color: 'var(--gx-success)', sub: '42 / 48명', alert: 'P&S 50%' },
  { label: '평균 NaN 비율', value: '2.8', unit: '%', color: 'var(--gx-charcoal)', sub: 'W10~W12 기준', alert: 'P&S 13.6%' },
  { label: '이번 달 불량', value: 'QMS 연동 대기', unit: '', color: 'var(--gx-steel)', sub: 'API 준비 중', phase: 'Phase 3' },
];

const HEATMAP_DATES = ['3/3', '3/4', '3/5', '3/6', '3/7', '3/9', '3/10', '3/11', '3/12'];
const HEATMAP_DATA: { partner: string; values: (number | null)[] }[] = [
  { partner: 'BAT', values: [2.1, 0.8, 0, 3.4, 0, 1.6, 0, 0, null] },
  { partner: 'FNI', values: [0, 0, 0, 0, 0, 0, 0, 0, null] },
  { partner: 'TMS(M)', values: [0, 0, 0, 0, 0, 0, 0, 0, null] },
  { partner: '', values: [] }, // separator
  { partner: 'C&A', values: [0.5, 0, 0, 0, 0, 0.2, 0, 0, null] },
  { partner: 'P&S', values: [9.4, 15.2, 11.3, 14.8, 10.2, 9.8, 16.1, 11.5, null] },
  { partner: 'TMS(E)', values: [0, 0, 0, 0, 0, 0, 0, 0, null] },
];

const ATTENDANCE_BARS = [
  { partner: 'BAT', pct: 93 },
  { partner: 'FNI', pct: 100 },
  { partner: 'TMS', pct: 100 },
  { partner: 'C&A', pct: 100 },
  { partner: 'P&S', pct: 50 },
];

const NAN_BARS = [
  { partner: 'BAT', value: 2.8, pct: 28, grade: 'B', color: 'linear-gradient(90deg,#F59E0B,#FBBF24)', gradeColor: '#D97706' },
  { partner: 'FNI', value: 0.0, pct: 2, grade: 'A', color: 'linear-gradient(90deg,#10B981,#34D399)', gradeColor: '#059669' },
  { partner: 'TMS(M)', value: 0.0, pct: 2, grade: 'A', color: 'linear-gradient(90deg,#10B981,#34D399)', gradeColor: '#059669' },
  { partner: '_sep', value: 0, pct: 0, grade: '', color: '', gradeColor: '' },
  { partner: 'C&A', value: 0.2, pct: 3, grade: 'A', color: 'linear-gradient(90deg,#10B981,#34D399)', gradeColor: '#059669' },
  { partner: 'P&S', value: 13.6, pct: 90, grade: 'D', color: 'linear-gradient(90deg,#EF4444,#F87171)', gradeColor: '#DC2626' },
  { partner: 'TMS(E)', value: 0.0, pct: 2, grade: 'A', color: 'linear-gradient(90deg,#10B981,#34D399)', gradeColor: '#059669' },
];

/* ── 히트맵 레벨 유틸 ── */
function hmLevel(v: number | null): { bg: string; color: string } {
  if (v === null) return { bg: 'var(--gx-cloud)', color: 'var(--gx-silver)' };
  if (v === 0) return { bg: '#F0FDF4', color: '#166534' };
  if (v < 1) return { bg: '#DCFCE7', color: '#166534' };
  if (v < 3) return { bg: '#FEF9C3', color: '#854D0E' };
  if (v < 6) return { bg: '#FDE68A', color: '#854D0E' };
  if (v < 10) return { bg: '#FECACA', color: '#991B1B' };
  return { bg: '#FCA5A5', color: '#991B1B' };
}

function progressColor(pct: number): string {
  if (pct >= 80) return 'var(--gx-success)';
  if (pct >= 60) return 'var(--gx-warning)';
  return 'var(--gx-danger)';
}

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

export default function PartnerDashboardPage() {
  return (
    <Layout title="협력사 관리">
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
              <div style={{
                fontSize: k.phase ? '20px' : '28px',
                fontWeight: k.phase ? 400 : 700,
                color: k.color, lineHeight: 1.1,
              }}>
                {k.value !== 'QMS 연동 대기' ? (
                  <>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{k.value}</span>
                    {k.unit && <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--gx-steel)', marginLeft: '4px' }}>{k.unit}</span>}
                  </>
                ) : k.value}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--gx-steel)' }}>{k.sub}</span>
                {k.alert && (
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gx-danger)' }}>{k.alert}</span>
                )}
                {k.phase && (
                  <span style={{
                    padding: '2px 8px', borderRadius: 'var(--radius-gx-sm)',
                    fontSize: '10px', fontWeight: 600, color: 'var(--gx-accent)', background: 'rgba(99,102,241,0.12)',
                  }}>{k.phase}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: NaN 히트맵 + 출퇴근 */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* NaN 히트맵 */}
          <div style={{ background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>NaN 히트맵</div>
                  <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>일별 협력사 NaN 비율 (%) · finishing_plan_end 기준</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: 'var(--gx-steel)' }}>
                  {[{ bg: '#F0FDF4', border: '#BBF7D0', label: '0%' }, { bg: '#FEF9C3', border: '#FDE68A', label: '1~3%' }, { bg: '#FECACA', border: '#FCA5A5', label: '6%+' }].map(l => (
                    <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: l.bg, border: `1px solid ${l.border}` }} />
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: '12px 24px 24px' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '3px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '60px', fontSize: '10px', fontWeight: 500, color: 'var(--gx-steel)', textAlign: 'center', padding: '4px 2px' }} />
                    {HEATMAP_DATES.map((d, i) => (
                      <th key={d} style={{
                        fontSize: '10px', fontWeight: 500, color: 'var(--gx-steel)', textAlign: 'center', padding: '4px 2px',
                        borderLeft: i === 5 ? '2px solid var(--gx-mist)' : 'none',
                      }}>{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HEATMAP_DATA.map((row, ri) => {
                    if (!row.partner) return <tr key={ri}><td colSpan={10} style={{ height: '4px' }} /></tr>;
                    return (
                      <tr key={row.partner}>
                        <td style={{
                          textAlign: 'right', paddingRight: '8px', fontWeight: 600, fontSize: '12px', color: 'var(--gx-charcoal)',
                        }}>{row.partner}</td>
                        {row.values.map((v, ci) => {
                          const lv = hmLevel(v);
                          return (
                            <td key={ci} style={{
                              textAlign: 'center', padding: '6px 2px', borderRadius: '4px',
                              fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 500,
                              background: lv.bg, color: lv.color,
                              borderLeft: ci === 5 ? '2px solid var(--gx-mist)' : 'none',
                              transition: 'transform 0.1s',
                            }}>
                              {v === null ? '—' : v.toFixed(1)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 출퇴근 현황 */}
          <div style={{ background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 0' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>출퇴근 현황</div>
              <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>2026-03-12 (수) · 08:30 기준</div>
            </div>
            <div style={{ padding: '20px 24px 24px' }}>
              {/* 3 stat boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: '출근', count: 42, color: '#059669', bg: 'rgba(16,185,129,0.08)' },
                  { label: '지각', count: 3, color: '#D97706', bg: 'rgba(245,158,11,0.08)' },
                  { label: '미출근', count: 3, color: '#DC2626', bg: 'rgba(239,68,68,0.08)' },
                ].map(s => (
                  <div key={s.label} style={{ padding: '14px', borderRadius: 'var(--radius-gx-sm)', background: s.bg, textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: s.color, fontWeight: 500 }}>{s.label}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '22px', fontWeight: 700, color: s.color, marginTop: '4px' }}>{s.count}</div>
                  </div>
                ))}
              </div>
              {/* Partner bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ATTENDANCE_BARS.map(b => (
                  <div key={b.partner} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, width: '48px', textAlign: 'right' }}>{b.partner}</span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'var(--gx-mist)', overflow: 'hidden', minWidth: '60px' }}>
                        <div style={{ width: `${b.pct}%`, height: '100%', borderRadius: '3px', background: progressColor(b.pct) }} />
                      </div>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 600,
                        color: progressColor(b.pct), minWidth: '42px', textAlign: 'right' as const,
                      }}>{b.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: 주간 NaN 추이 + 불량 요약 (blurred) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* 주간 NaN 추이 */}
          <div style={{ background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>주간 NaN 추이</div>
                  <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>W10 ~ W12 협력사별 비율</div>
                </div>
                <span style={{
                  display: 'inline-flex', padding: '3px 10px', borderRadius: '20px',
                  fontSize: '10px', fontWeight: 600, letterSpacing: '0.3px',
                  background: 'rgba(245,158,11,0.08)', color: '#D97706',
                }}>가중치 30%</span>
              </div>
            </div>
            <div style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {NAN_BARS.map((b, i) => {
                  if (b.partner === '_sep') return <div key={i} style={{ height: '1px', background: 'var(--gx-mist)', margin: '4px 0' }} />;
                  return (
                    <div key={b.partner} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-slate)', width: '60px', textAlign: 'right', flexShrink: 0 }}>{b.partner}</span>
                      <div style={{ flex: 1, height: '24px', background: 'var(--gx-cloud)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${Math.max(b.pct, 2)}%`, borderRadius: '6px',
                          background: b.color, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                          paddingRight: '10px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
                          fontWeight: 600, color: '#fff', minWidth: '36px',
                        }}>{b.value.toFixed(1)}</div>
                      </div>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 600,
                        color: b.gradeColor, minWidth: '24px',
                      }}>{b.grade}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 불량 요약 - blurred */}
          <div style={{ position: 'relative', background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
            {/* Blur overlay */}
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 500, color: 'var(--gx-steel)', zIndex: 2,
              background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--radius-gx-lg)',
            }}>QMS 연동 준비 중</div>
            {/* Blurred content */}
            <div style={{ filter: 'blur(3px)', pointerEvents: 'none' }}>
              <div style={{ padding: '20px 24px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>이번 달 불량 현황</div>
                    <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>기구 + 전장 협력사</div>
                  </div>
                  <span style={{
                    display: 'inline-flex', padding: '3px 10px', borderRadius: '20px',
                    fontSize: '10px', fontWeight: 600, background: 'rgba(99,102,241,0.08)', color: 'var(--gx-accent)',
                  }}>가중치 70%</span>
                </div>
              </div>
              <div style={{ padding: '20px 24px 24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { p: 'BAT', v: '8.1%', w: 40, c: 'linear-gradient(90deg,#6366F1,#818CF8)', g: 'B' },
                    { p: 'FNI', v: '6.8%', w: 34, c: 'linear-gradient(90deg,#3B82F6,#60A5FA)', g: 'B' },
                    { p: 'TMS(M)', v: '18.2%', w: 70, c: 'linear-gradient(90deg,#F59E0B,#FBBF24)', g: 'C' },
                  ].map(b => (
                    <div key={b.p} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-slate)', width: '60px', textAlign: 'right', flexShrink: 0 }}>{b.p}</span>
                      <div style={{ flex: 1, height: '24px', background: 'var(--gx-cloud)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${b.w}%`, borderRadius: '6px', background: b.c,
                          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '10px',
                          fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, color: '#fff',
                        }}>{b.v}</div>
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 600, color: 'var(--gx-graphite)', minWidth: '24px' }}>{b.g}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
