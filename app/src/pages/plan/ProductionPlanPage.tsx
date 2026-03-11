// src/pages/plan/ProductionPlanPage.tsx
// 생산일정 — G-AXIS 컨셉 HTML 기반 목업
// 공정 파이프라인 + 범례 + 필터 + 날짜 색상 테이블

import { useState } from 'react';
import Layout from '@/components/layout/Layout';

/* ── KPI ─── */
const KPI_ITEMS = [
  { label: '2월 기구시작', value: '193' },
  { label: '필터된 결과', value: '43' },
  { label: '고객사 수', value: '16' },
  { label: '모델 수', value: '17' },
  { label: '총 데이터수', value: '590' },
];

/* ── 공정 파이프라인 ─── */
const PIPELINE_STEPS = [
  { label: '기압', count: 11, type: 'danger' as const },
  { label: '자주검사', count: 6, type: 'active' as const },
  { label: '공정', count: 9, type: 'active' as const },
  { label: '포장', count: 7, type: 'neutral' as const },
  { label: '출하', count: 17, type: 'success' as const },
];

const CIRCLE_STYLES = {
  danger: { background: 'var(--gx-danger)', color: '#fff', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' },
  active: { background: 'var(--gx-accent)', color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' },
  success: { background: 'var(--gx-success)', color: '#fff', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' },
  neutral: { background: 'var(--gx-cloud)', color: 'var(--gx-graphite)', boxShadow: 'none', border: '2px solid var(--gx-mist)' },
};

/* ── 필터 탭 ─── */
const FILTER_TABS = ['오늘 공정', '이번주', '다음주', '2주후', '전체'];

/* ── 테이블 ─── */
const TABLE_COLS = ['O/N', '제품번호', 'S/N', '모델', '고객사', '라인', '기구업체', '전장업체', '기구시작', '기구종료', '전장시작', '전장종료', '가압시작', '자주검사', '공정시작', '마무리시작', '출하'];

// 오늘 날짜 (샘플 기준)
const TODAY = '2026-02-13';

type DateType = 'past' | 'today' | 'future' | 'done' | 'today-highlight' | 'danger-highlight' | 'empty';

interface TableRow {
  on: string;
  pn: string;
  sn: string;
  model: string;
  customer: string;
  line: string;
  mechVendor: string;
  elecVendor: string;
  dates: { value: string; type: DateType }[];
}

const SAMPLE_DATA: TableRow[] = [
  {
    on: '6203', pn: '41000558', sn: '0363', model: 'O3 Destructor', customer: 'SEC', line: '15L', mechVendor: 'SH', elecVendor: 'TMS',
    dates: [
      { value: '2026-01-14', type: 'past' }, { value: '2026-01-19', type: 'past' },
      { value: '2026-01-05', type: 'past' }, { value: '2026-01-20', type: 'past' },
      { value: '2026-01-21', type: 'past' }, { value: '', type: 'empty' },
      { value: '2026-01-22', type: 'past' }, { value: '2026-02-12', type: 'past' },
      { value: TODAY, type: 'today-highlight' },
    ],
  },
  {
    on: '6203', pn: '41000558', sn: '0364', model: 'O3 Destructor', customer: 'SEC', line: '15L', mechVendor: 'SH', elecVendor: 'TMS',
    dates: [
      { value: '2026-01-14', type: 'past' }, { value: '2026-01-19', type: 'past' },
      { value: '2026-01-05', type: 'past' }, { value: '2026-01-20', type: 'past' },
      { value: '2026-01-21', type: 'past' }, { value: '', type: 'empty' },
      { value: '2026-01-22', type: 'past' }, { value: '2026-02-12', type: 'past' },
      { value: TODAY, type: 'today-highlight' },
    ],
  },
  {
    on: '6238', pn: '41100538', sn: '6627', model: 'GAIA-I DUAL', customer: 'MICRON', line: 'JP(F15)', mechVendor: 'BAT', elecVendor: 'P&S',
    dates: [
      { value: '2026-01-26', type: 'past' }, { value: '2026-02-04', type: 'done' },
      { value: '2026-01-12', type: 'past' }, { value: '2026-02-05', type: 'past' },
      { value: '2026-02-11', type: 'past' }, { value: '2026-02-12', type: 'past' },
      { value: TODAY, type: 'danger-highlight' }, { value: TODAY, type: 'danger-highlight' },
      { value: '2026-03-13', type: 'future' },
    ],
  },
  {
    on: '6312', pn: '41100286', sn: '6620', model: 'GAIA-I DUAL', customer: 'MICRON', line: 'JP(F15)', mechVendor: 'BAT', elecVendor: 'TMS',
    dates: [
      { value: '2026-01-23', type: 'past' }, { value: '2026-02-02', type: 'done' },
      { value: '2026-01-12', type: 'past' }, { value: '2026-02-03', type: 'done' },
      { value: '2026-02-04', type: 'past' }, { value: '2026-02-05', type: 'past' },
      { value: '2026-02-06', type: 'past' }, { value: '2026-02-06', type: 'past' },
      { value: TODAY, type: 'today-highlight' },
    ],
  },
  {
    on: '6315', pn: '41100538', sn: '6631', model: 'GAIA-I DUAL', customer: 'MICRON', line: 'JP(F15)', mechVendor: 'BAT', elecVendor: 'C&A',
    dates: [
      { value: '2026-01-27', type: 'past' }, { value: '2026-02-05', type: 'done' },
      { value: '2026-01-15', type: 'past' }, { value: '2026-02-07', type: 'past' },
      { value: '2026-02-10', type: 'past' }, { value: '2026-02-11', type: 'past' },
      { value: '2026-02-12', type: 'past' }, { value: TODAY, type: 'today-highlight' },
      { value: '2026-02-17', type: 'future' },
    ],
  },
  {
    on: '6401', pn: '41100286', sn: '6635', model: 'GAIA-I DUAL', customer: 'SEC', line: '15L', mechVendor: 'C&A', elecVendor: 'TMS',
    dates: [
      { value: '2026-02-03', type: 'past' }, { value: '2026-02-10', type: 'past' },
      { value: '2026-01-22', type: 'past' }, { value: '2026-02-10', type: 'past' },
      { value: '2026-02-11', type: 'past' }, { value: '2026-02-12', type: 'past' },
      { value: TODAY, type: 'today-highlight' }, { value: '2026-02-14', type: 'future' },
      { value: '2026-02-18', type: 'future' },
    ],
  },
  {
    on: '6405', pn: '41100538', sn: '6640', model: 'GAIA-P DUAL', customer: 'SAMSUNG', line: 'JP(F15)', mechVendor: 'FNI', elecVendor: 'P&S',
    dates: [
      { value: '2026-02-05', type: 'past' }, { value: '2026-02-11', type: 'past' },
      { value: '2026-01-28', type: 'past' }, { value: '2026-02-12', type: 'past' },
      { value: TODAY, type: 'today-highlight' }, { value: '2026-02-14', type: 'future' },
      { value: '2026-02-17', type: 'future' }, { value: '2026-02-18', type: 'future' },
      { value: '2026-02-21', type: 'future' },
    ],
  },
];

/* ── 날짜 셀 렌더링 ─── */
function DateCell({ value, type }: { value: string; type: DateType }) {
  if (type === 'empty') return <td style={{ padding: '11px 14px' }} />;

  const display = value.slice(5); // MM-DD

  if (type === 'today-highlight') {
    return (
      <td style={{ padding: '11px 14px' }}>
        <span style={{
          background: 'var(--gx-warning)', color: '#fff', fontWeight: 700,
          padding: '3px 8px', borderRadius: '4px', display: 'inline-block',
          fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px',
        }}>{display}</span>
      </td>
    );
  }

  if (type === 'danger-highlight') {
    return (
      <td style={{ padding: '11px 14px' }}>
        <span style={{
          background: 'var(--gx-danger)', color: '#fff', fontWeight: 700,
          padding: '3px 8px', borderRadius: '4px', display: 'inline-block',
          fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px',
        }}>{display}</span>
      </td>
    );
  }

  if (type === 'done') {
    return (
      <td style={{ padding: '11px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px' }}>
        <span style={{ color: 'var(--gx-success)' }}>{display}</span>
        <span style={{ color: 'var(--gx-success)', fontWeight: 700, marginLeft: '3px' }}>&#10003;</span>
      </td>
    );
  }

  const colorMap: Record<string, string> = {
    past: 'var(--gx-danger)',
    future: 'var(--gx-success)',
  };

  return (
    <td style={{
      padding: '11px 14px',
      fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px',
      color: colorMap[type] || 'var(--gx-graphite)',
      whiteSpace: 'nowrap',
    }}>
      {display}
    </td>
  );
}

/* ── 범례 칩 ─── */
function LegendChip({ label, bg, color, border }: { label: string; bg: string; color: string; border?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 500,
      background: bg, color, border: border || 'none',
    }}>{label}</span>
  );
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

/* ── 메인 컴포넌트 ─── */
export default function ProductionPlanPage() {
  const [activeTab, setActiveTab] = useState('오늘 공정');

  return (
    <Layout title="생산일정">
      <div style={{ padding: '28px 32px', maxWidth: '1600px' }}>
        <PrepareBanner />

        {/* Status Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', background: 'var(--gx-white)',
          borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gx-success)',
              animation: 'pulse 2s infinite',
            }} />
            <div style={{ fontSize: '13px', color: 'var(--gx-slate)' }}>
              <strong style={{ color: 'var(--gx-charcoal)', fontWeight: 600 }}>SCR 일정관리_W7(REV).xlsx</strong> · 데이터 로드 완료
            </div>
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
            color: 'var(--gx-steel)', background: 'var(--gx-cloud)',
            padding: '4px 12px', borderRadius: '6px',
          }}>2026-02-13 15:43:13 KST</div>
        </div>

        {/* KPI Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {KPI_ITEMS.map(k => (
            <div key={k.label} style={{
              background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
              padding: '18px 20px', boxShadow: 'var(--shadow-card)', textAlign: 'center',
              transition: 'all 0.2s', cursor: 'default',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--gx-steel)', letterSpacing: '0.3px', marginBottom: '8px' }}>{k.label}</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--gx-charcoal)', fontVariantNumeric: 'tabular-nums' }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Process Pipeline */}
        <div style={{
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)', overflow: 'hidden', marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 0' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>오늘 공정 현황</div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
              color: 'var(--gx-accent)', background: 'rgba(99,102,241,0.08)',
              padding: '4px 10px', borderRadius: '6px',
            }}>{TODAY}</div>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
            padding: '20px 24px 24px', position: 'relative',
          }}>
            {/* 연결선 */}
            <div style={{
              position: 'absolute', top: '50%', left: '60px', right: '60px',
              height: '2px', background: 'var(--gx-mist)', transform: 'translateY(-4px)',
            }} />
            {PIPELINE_STEPS.map(step => {
              const style = CIRCLE_STYLES[step.type];
              return (
                <div key={step.label} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '10px', position: 'relative', zIndex: 1,
                }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                    ...style,
                  }}>{step.count}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gx-slate)', textAlign: 'center' }}>{step.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend Strip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
          padding: '14px 20px', background: 'var(--gx-white)',
          borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--gx-slate)' }}>
            <span style={{ fontWeight: 600, color: 'var(--gx-graphite)', marginRight: '4px' }}>날짜 색상:</span>
            <LegendChip label="● 지난 날짜" bg="rgba(239,68,68,0.08)" color="var(--gx-danger)" />
            <LegendChip label="★ 오늘" bg="rgba(245,158,11,0.08)" color="var(--gx-warning)" border="1px solid var(--gx-warning)" />
            <LegendChip label="● 예정 날짜" bg="rgba(16,185,129,0.08)" color="var(--gx-success)" />
          </div>
          <div style={{ width: '1px', height: '20px', background: 'var(--gx-mist)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--gx-slate)' }}>
            <span style={{ fontWeight: 600, color: 'var(--gx-graphite)', marginRight: '4px' }}>공정 중복:</span>
            <LegendChip label="2개" bg="rgba(59,130,246,0.1)" color="#3B82F6" />
            <LegendChip label="3개" bg="rgba(245,158,11,0.1)" color="#F59E0B" />
            <LegendChip label="4개" bg="rgba(239,68,68,0.1)" color="#EF4444" />
          </div>
          <div style={{ width: '1px', height: '20px', background: 'var(--gx-mist)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--gx-slate)' }}>
            <span style={{ fontWeight: 600, color: 'var(--gx-graphite)', marginRight: '4px' }}>공정→마무리:</span>
            <LegendChip label="동일" bg="rgba(99,102,241,0.08)" color="var(--gx-accent)" />
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
          padding: '14px 20px', background: 'var(--gx-white)',
          borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '7px 16px', borderRadius: '10px',
                  fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.15s', border: '1px solid',
                  ...(activeTab === tab
                    ? { background: 'var(--gx-accent)', color: '#fff', borderColor: 'var(--gx-accent)' }
                    : { background: 'transparent', color: 'var(--gx-slate)', borderColor: 'var(--gx-mist)' }),
                }}
              >{tab}</button>
            ))}
          </div>
          <div style={{ width: '1px', height: '28px', background: 'var(--gx-mist)' }} />
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-steel)' }}>기준:</span>
          <select style={{
            padding: '7px 12px', borderRadius: '10px',
            border: '1px solid var(--gx-mist)', background: 'var(--gx-white)',
            fontSize: '12px', color: 'var(--gx-graphite)', cursor: 'pointer',
          }}>
            <option>기구시작</option>
            <option>전장시작</option>
            <option>출하</option>
          </select>
          <div style={{ width: '1px', height: '28px', background: 'var(--gx-mist)' }} />
          <input
            type="text"
            placeholder="오더번호, 모델, S/N 검색..."
            style={{
              padding: '7px 12px', borderRadius: '10px',
              border: '1px solid var(--gx-mist)', background: 'var(--gx-snow)',
              fontSize: '12px', color: 'var(--gx-graphite)', minWidth: '200px',
            }}
          />
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-steel)' }}>고객사:</span>
          <select style={{
            padding: '7px 12px', borderRadius: '10px',
            border: '1px solid var(--gx-mist)', background: 'var(--gx-white)',
            fontSize: '12px', color: 'var(--gx-graphite)', cursor: 'pointer',
          }}>
            <option>전체</option>
          </select>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-steel)' }}>기구업체:</span>
          <select style={{
            padding: '7px 12px', borderRadius: '10px',
            border: '1px solid var(--gx-mist)', background: 'var(--gx-white)',
            fontSize: '12px', color: 'var(--gx-graphite)', cursor: 'pointer',
          }}>
            <option>전체</option>
          </select>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-steel)' }}>전장업체:</span>
          <select style={{
            padding: '7px 12px', borderRadius: '10px',
            border: '1px solid var(--gx-mist)', background: 'var(--gx-white)',
            fontSize: '12px', color: 'var(--gx-graphite)', cursor: 'pointer',
          }}>
            <option>전체</option>
          </select>
        </div>

        {/* Table */}
        <div style={{
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)', overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
              <thead>
                <tr style={{ background: 'var(--gx-cloud)' }}>
                  {TABLE_COLS.map(h => (
                    <th key={h} style={{
                      padding: '11px 14px', textAlign: 'left',
                      fontSize: '10.5px', fontWeight: 600, color: 'var(--gx-steel)',
                      letterSpacing: '0.5px', textTransform: 'uppercase' as const,
                      whiteSpace: 'nowrap', borderBottom: '2px solid var(--gx-mist)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAMPLE_DATA.map((row, i) => (
                  <tr key={`${row.sn}-${i}`} style={{ borderBottom: '1px solid var(--gx-cloud)' }}>
                    <td style={{ padding: '11px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px', color: 'var(--gx-graphite)' }}>{row.on}</td>
                    <td style={{ padding: '11px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px', color: 'var(--gx-graphite)' }}>{row.pn}</td>
                    <td style={{ padding: '11px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px', color: 'var(--gx-graphite)' }}>{row.sn}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--gx-charcoal)', whiteSpace: 'nowrap' }}>{row.model}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--gx-graphite)', fontSize: '12.5px' }}>{row.customer}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--gx-graphite)', fontSize: '12.5px' }}>{row.line}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--gx-graphite)', fontSize: '12.5px' }}>{row.mechVendor}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--gx-graphite)', fontSize: '12.5px' }}>{row.elecVendor}</td>
                    {row.dates.map((d, j) => (
                      <DateCell key={j} value={d.value} type={d.type} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* pulse animation */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
            50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(16,185,129,0); }
          }
        `}</style>
      </div>
    </Layout>
  );
}
