// src/components/attendance/ChartSection.tsx
// 차트 섹션 — 스택 바 차트 + 도넛 차트 (컨셉 HTML 완전 적용)

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface CompanyChartData {
  company: string;
  hq: number;
  site: number;
}

interface ChartSectionProps {
  companies: CompanyChartData[];
  hqTotal: number;
  siteTotal: number;
  notChecked: number;
}

const TABS = ['일간', '주간', '월간'] as const;

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        background: 'var(--gx-white)',
        borderRadius: 'var(--radius-gx-md)',
        boxShadow: 'var(--shadow-md)',
        padding: '10px 14px',
        fontSize: '12px',
      }}
    >
      <div style={{ fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '6px' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--gx-slate)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: p.color, display: 'inline-block' }} />
          {p.name}: <strong style={{ color: 'var(--gx-charcoal)', fontFamily: "'JetBrains Mono', monospace" }}>{p.value}명</strong>
        </div>
      ))}
    </div>
  );
}

export default function ChartSection({ companies, hqTotal, siteTotal, notChecked }: ChartSectionProps) {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('일간');
  const totalPeople = hqTotal + siteTotal;

  // 도넛 차트 데이터
  const donutData = [
    { name: '본사', value: hqTotal, color: '#6366F1' },
    { name: '현장', value: siteTotal, color: '#A5B4FC' },
  ];

  return (
    <div
      className="chart-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {/* 스택 바 차트 */}
      <div
        style={{
          background: 'var(--gx-white)',
          borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}
      >
        {/* 차트 헤더 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 0',
          }}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
              협력사별 출입 현황
            </div>
            <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>
              본사 / 현장 인원 분포
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-gx-sm)',
                  fontSize: '12px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  color: activeTab === tab ? 'var(--gx-accent)' : 'var(--gx-steel)',
                  background: activeTab === tab ? 'var(--gx-accent-soft)' : 'transparent',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 범례 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '3px',
                background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '12px', color: 'var(--gx-slate)' }}>본사</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '3px',
                background: 'linear-gradient(135deg, #A5B4FC, #C7D2FE)',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '12px', color: 'var(--gx-slate)' }}>현장</span>
          </div>
        </div>

        {/* 차트 바디 */}
        <div style={{ padding: '20px 24px 24px' }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={companies} barSize={40} barGap={4}>
              <CartesianGrid vertical={false} stroke="var(--gx-mist)" strokeDasharray="0" />
              <XAxis
                dataKey="company"
                tick={{ fontSize: 11, fill: 'var(--gx-slate)', fontFamily: 'DM Sans' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--gx-steel)', fontFamily: 'DM Sans' }}
                axisLine={false}
                tickLine={false}
                width={28}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--gx-accent-soft)' }} />
              <Bar dataKey="hq" name="본사" stackId="a" fill="#6366F1" radius={[0, 0, 0, 0]}>
                {companies.map((_, i) => (
                  <Cell key={i} fill="#6366F1" />
                ))}
              </Bar>
              <Bar dataKey="site" name="현장" stackId="a" fill="#A5B4FC" radius={[4, 4, 0, 0]}>
                {companies.map((_, i) => (
                  <Cell key={i} fill="#A5B4FC" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 도넛 차트 */}
      <div
        style={{
          background: 'var(--gx-white)',
          borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}
      >
        {/* 차트 헤더 */}
        <div style={{ padding: '20px 24px 0' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
            본사 / 현장 비율
          </div>
          <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>
            전체 출입 인원 구성
          </div>
        </div>

        {/* 차트 바디 */}
        <div
          style={{
            padding: '20px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* 도넛 */}
          <div style={{ position: 'relative', width: '180px', height: '180px', marginBottom: '20px' }}>
            <PieChart width={180} height={180}>
              <Pie
                data={donutData}
                cx={90}
                cy={90}
                innerRadius={58}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                {donutData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            {/* 중앙 텍스트 */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: 'var(--gx-charcoal)',
                  lineHeight: 1,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {totalPeople}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '4px' }}>
                총 인원
              </div>
            </div>
          </div>

          {/* 범례 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            {donutData.map((item) => (
              <div
                key={item.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 0',
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '3px',
                    background: item.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '12px', color: 'var(--gx-slate)', flex: 1 }}>{item.name}</span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--gx-charcoal)',
                    marginLeft: 'auto',
                  }}
                >
                  {item.value}명
                </span>
              </div>
            ))}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 0',
                marginTop: '4px',
                borderTop: '1px solid var(--gx-cloud)',
                paddingTop: '10px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '3px',
                  background: 'var(--gx-warning)',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '12px', color: 'var(--gx-slate)', flex: 1 }}>퇴근 미체크</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--gx-warning)',
                  marginLeft: 'auto',
                }}
              >
                {notChecked}명
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
