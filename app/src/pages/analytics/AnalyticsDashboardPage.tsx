// src/pages/analytics/AnalyticsDashboardPage.tsx
// 사용자 분석 대시보드 — Access Log 시각화

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import Layout from '@/components/layout/Layout';
import {
  useAnalyticsSummary,
  useWorkerAnalytics,
  useEndpointAnalytics,
  useHourlyTraffic,
} from '@/hooks/useAnalytics';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Legend,
} from 'recharts';

/* ── 기간 옵션 ── */
const PERIOD_OPTIONS = [
  { value: '1d', label: '오늘' },
  { value: '7d', label: '7일' },
  { value: '30d', label: '30일' },
];

/* ── 엔드포인트 → 사용자 친화적 이름 매핑 ── */
const ENDPOINT_LABELS: Record<string, string> = {
  'work.start_work': '작업 시작',
  'work.complete_work': '작업 완료',
  'product.get_product_by_qr': 'QR 제품 조회',
  'work.get_tasks_by_serial': '태스크 목록',
  'auth.login': '로그인',
  'qr.get_qr_list': 'QR 목록',
  'hr.check_attendance': '출퇴근',
  'factory.get_weekly_kpi': '주간 KPI',
  'factory.get_monthly_detail': '월간 상세',
  'admin.get_workers': '작업자 목록',
  'notices.get_notices': '공지사항',
};

function getEndpointLabel(endpoint: string): string {
  return ENDPOINT_LABELS[endpoint] || endpoint;
}

/* ── KPI 카드 ── */
function KpiCard({ label, value, sub, color, trend }: {
  label: string; value: string; sub: string; color: string; trend?: string;
}) {
  const isUp = trend?.startsWith('+') || trend?.startsWith('▲');
  const trendColor = isUp ? 'var(--gx-danger)' : 'var(--gx-success)';
  return (
    <div style={{
      background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
      padding: '20px 24px', boxShadow: 'var(--shadow-card)',
      transition: 'all 0.2s', cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: 'var(--radius-gx-md)',
          background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '16px',
        }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
          </svg>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-steel)', letterSpacing: '0.3px' }}>{label}</span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--gx-charcoal)', lineHeight: 1.1 }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
        <span style={{ fontSize: '11px', color: 'var(--gx-steel)' }}>{sub}</span>
        {trend && <span style={{ fontSize: '11px', fontWeight: 600, color: trendColor }}>{trend}</span>}
      </div>
    </div>
  );
}

/* ── 메인 컴포넌트 ── */
export default function AnalyticsDashboardPage() {
  const [period, setPeriod] = useState('7d');
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: summaryData, isLoading: summaryLoading } = useAnalyticsSummary(period);
  const { data: workerData, isLoading: workerLoading } = useWorkerAnalytics(period);
  const { data: endpointData, isLoading: endpointLoading } = useEndpointAnalytics(period);
  const { data: hourlyData } = useHourlyTraffic(today);

  // API 응답이 { summary: {...} } 또는 직접 {...} 형태 모두 대응
  const summary = (summaryData as any)?.summary ?? summaryData ?? null;
  const workers: any[] = (workerData as any)?.workers ?? (Array.isArray(workerData) ? workerData : []);
  const endpoints: any[] = (endpointData as any)?.endpoints ?? (Array.isArray(endpointData) ? endpointData : []);
  const hourly: any[] = (hourlyData as any)?.hourly ?? (Array.isArray(hourlyData) ? hourlyData : []);

  // 사용자별 정렬
  const [workerSort, setWorkerSort] = useState<'access' | 'duration'>('access');
  const sortedWorkers = useMemo(() => {
    return [...workers].sort((a, b) =>
      workerSort === 'access' ? b.access_count - a.access_count : b.total_duration_min - a.total_duration_min
    );
  }, [workers, workerSort]);

  // 기능별 상위 10개
  const topEndpoints = useMemo(() => {
    return [...endpoints].sort((a, b) => b.call_count - a.call_count).slice(0, 10);
  }, [endpoints]);

  // 기능별 최대값 (바 비율 계산용)
  const maxCallCount = topEndpoints.length > 0 ? topEndpoints[0].call_count : 1;

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 'var(--radius-gx-md)',
    border: '1px solid var(--gx-mist)', fontSize: '13px',
    color: 'var(--gx-charcoal)', background: 'var(--gx-cloud)', cursor: 'pointer',
  };

  const isLoading = summaryLoading || workerLoading || endpointLoading;

  return (
    <Layout title="사용자 분석">
      <div style={{ padding: '28px 32px', maxWidth: '1400px' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gx-charcoal)', margin: 0 }}>
              사용자 분석
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--gx-steel)', margin: '4px 0 0' }}>
              OPS 앱 사용자 접속 빈도, 사용 시간, 기능 사용 패턴
            </p>
          </div>
          <select value={period} onChange={e => setPeriod(e.target.value)} style={selectStyle}>
            {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* KPI 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <KpiCard
            label="접속자 수"
            value={summaryLoading ? '—' : `${summary?.unique_workers ?? 0}명`}
            sub="고유 사용자"
            color="var(--gx-accent)"
            trend={summary?.prev_unique_workers != null ? `${summary.unique_workers - summary.prev_unique_workers >= 0 ? '▲' : '▼'} ${Math.abs(summary.unique_workers - summary.prev_unique_workers)} vs 전기간` : undefined}
          />
          <KpiCard
            label="총 요청 수"
            value={summaryLoading ? '—' : `${Number(summary?.total_requests ?? 0).toLocaleString()}건`}
            sub="API 호출"
            color="var(--gx-info)"
          />
          <KpiCard
            label="평균 응답"
            value={summaryLoading ? '—' : `${summary?.avg_response_ms ?? 0}ms`}
            sub="API 응답 시간"
            color="var(--gx-success)"
          />
          <KpiCard
            label="에러율"
            value={summaryLoading ? '—' : `${summary?.error_rate ?? 0}%`}
            sub="4xx + 5xx"
            color="var(--gx-danger)"
            trend={summary?.prev_error_rate != null ? `${(summary.error_rate - summary.prev_error_rate) <= 0 ? '▼' : '▲'} ${Math.abs(Math.round((summary.error_rate - summary.prev_error_rate) * 10) / 10)}%` : undefined}
          />
        </div>

        {/* 일별 접속 추이 */}
        <div style={{
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)', padding: '20px 24px', marginBottom: '24px',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)', margin: '0 0 16px' }}>
            일별 접속 추이
          </h3>
          {!summary?.daily?.length ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-steel)', fontSize: '13px' }}>
              {isLoading ? '로딩 중...' : '데이터가 없습니다'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={summary.daily} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gx-mist)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--gx-steel)' }} tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--gx-steel)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--gx-steel)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--gx-mist)', fontSize: '12px' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                <Bar yAxisId="left" dataKey="unique_workers" name="접속자" fill="var(--gx-accent)" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" dataKey="total_requests" name="요청 수" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 2열 그리드: 사용자별 테이블 + 기능별 바 차트 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* 사용자별 테이블 */}
          <div style={{
            background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
            boxShadow: 'var(--shadow-card)', overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gx-mist)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)', margin: 0 }}>
                사용자별 현황
              </h3>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['access', 'duration'] as const).map(s => (
                  <button key={s} onClick={() => setWorkerSort(s)} style={{
                    padding: '4px 10px', borderRadius: 'var(--radius-gx-sm)', border: 'none',
                    fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                    background: workerSort === s ? 'var(--gx-accent)' : 'var(--gx-cloud)',
                    color: workerSort === s ? '#fff' : 'var(--gx-steel)',
                  }}>
                    {s === 'access' ? '접속수' : '사용시간'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--gx-cloud)' }}>
                    {['#', '이름', '역할', '접속수', '사용시간'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--gx-steel)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workerLoading ? (
                    <tr><td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--gx-steel)' }}>로딩 중...</td></tr>
                  ) : sortedWorkers.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--gx-steel)' }}>데이터 없음</td></tr>
                  ) : sortedWorkers.slice(0, 15).map((w, i) => (
                    <tr key={w.worker_id} style={{ borderBottom: '1px solid var(--gx-cloud)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: i < 3 ? 'var(--gx-accent)' : 'var(--gx-steel)' }}>{i + 1}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--gx-charcoal)' }}>
                        <div>{w.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--gx-steel)' }}>{w.company}</div>
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--gx-slate)' }}>{w.role}</td>
                      <td style={{ padding: '10px 14px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'var(--gx-charcoal)' }}>{w.access_count}</td>
                      <td style={{ padding: '10px 14px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--gx-slate)' }}>
                        {w.total_duration_min >= 60 ? `${Math.floor(w.total_duration_min / 60)}h ${w.total_duration_min % 60}m` : `${w.total_duration_min}m`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 기능별 사용량 */}
          <div style={{
            background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
            boxShadow: 'var(--shadow-card)', padding: '20px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)', margin: '0 0 16px' }}>
              기능별 사용량 TOP 10
            </h3>
            {endpointLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-steel)', fontSize: '13px' }}>로딩 중...</div>
            ) : topEndpoints.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-steel)', fontSize: '13px' }}>데이터 없음</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topEndpoints.map((ep, i) => (
                  <div key={ep.endpoint} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, color: i < 3 ? 'var(--gx-accent)' : 'var(--gx-steel)',
                      minWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {getEndpointLabel(ep.endpoint)}
                    </span>
                    <div style={{ flex: 1, height: '18px', borderRadius: '4px', background: 'var(--gx-cloud)', overflow: 'hidden', position: 'relative' }}>
                      <div style={{
                        width: `${(ep.call_count / maxCallCount) * 100}%`, height: '100%',
                        borderRadius: '4px', background: i < 3 ? 'var(--gx-accent)' : 'var(--gx-mist)',
                        transition: 'width 0.3s',
                      }} />
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, color: 'var(--gx-charcoal)',
                      fontFamily: "'JetBrains Mono', monospace", minWidth: '50px', textAlign: 'right',
                    }}>
                      {Number(ep.call_count ?? 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 시간대별 트래픽 */}
        <div style={{
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)', padding: '20px 24px',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)', margin: '0 0 16px' }}>
            오늘 시간대별 트래픽
          </h3>
          {!hourly.length ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-steel)', fontSize: '13px' }}>
              데이터가 없습니다
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={hourly} barCategoryGap="15%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gx-mist)" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'var(--gx-steel)' }} tickFormatter={h => `${h}시`} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--gx-steel)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--gx-mist)', fontSize: '12px' }} labelFormatter={h => `${h}시`} />
                <Bar dataKey="count" name="요청 수" fill="var(--gx-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Layout>
  );
}
