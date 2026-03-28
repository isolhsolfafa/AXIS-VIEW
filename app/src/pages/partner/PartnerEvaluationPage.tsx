// src/pages/partner/PartnerEvaluationPage.tsx
// 협력사 관리 — 평가지수 (기구/전장 상세 테이블 + 주차별 작업기록 누락률)

import Layout from '@/components/layout/Layout';

/* ── 등급 뱃지 컬러 ── */
const GRADE_STYLE: Record<string, { bg: string; color: string }> = {
  A: { bg: 'rgba(16,185,129,0.08)', color: '#059669' },
  B: { bg: 'rgba(59,130,246,0.08)', color: '#2563EB' },
  C: { bg: 'rgba(245,158,11,0.08)', color: '#D97706' },
  D: { bg: 'rgba(239,68,68,0.08)', color: '#DC2626' },
  E: { bg: 'rgba(124,58,237,0.08)', color: '#7C3AED' },
};

function GradeBadge({ grade, large }: { grade: string; large?: boolean }) {
  const s = GRADE_STYLE[grade] || GRADE_STYLE.D;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: large ? '5px 12px' : '4px 10px', borderRadius: '20px',
      fontSize: large ? '12px' : '11px', fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
      {grade}
    </span>
  );
}

/* ── 샘플 데이터 ── */
interface EvalRow {
  rank: number; partner: string; production: string; defect: string;
  defectRate: string; defectGrade: string; nan: string; nanGrade: string;
  score: string; finalGrade: string; nanDanger?: boolean;
}

const MECH_DATA: EvalRow[] = [
  { rank: 1, partner: 'FNI', production: '88대', defect: '6건', defectRate: '6.8%', defectGrade: 'B', nan: '0.0%', nanGrade: 'A', score: '8.25', finalGrade: 'A' },
  { rank: 2, partner: 'BAT', production: '135대', defect: '11건', defectRate: '8.1%', defectGrade: 'B', nan: '2.8%', nanGrade: 'B', score: '7.50', finalGrade: 'B' },
  { rank: 3, partner: 'TMS(M)', production: '11대', defect: '2건', defectRate: '18.2%', defectGrade: 'C', nan: '0.0%', nanGrade: 'A', score: '6.50', finalGrade: 'B' },
];

const ELEC_DATA: EvalRow[] = [
  { rank: 1, partner: 'TMS(E)', production: '24대', defect: '0건', defectRate: '0.0%', defectGrade: 'A', nan: '0.0%', nanGrade: 'A', score: '10.00', finalGrade: 'A' },
  { rank: 2, partner: 'C&A', production: '95대', defect: '1건', defectRate: '1.1%', defectGrade: 'B', nan: '0.2%', nanGrade: 'A', score: '8.25', finalGrade: 'A' },
  { rank: 3, partner: 'P&S', production: '78대', defect: '4건', defectRate: '5.1%', defectGrade: 'C', nan: '13.6%', nanGrade: 'D', score: '4.25', finalGrade: 'C', nanDanger: true },
];

interface WeeklyNanRow { partner: string; w10: string; w11: string; w12: string; w13: string; avg: string; avgColor?: string }

const MECH_NAN: WeeklyNanRow[] = [
  { partner: 'BAT', w10: '3.2', w11: '2.8', w12: '2.1', w13: '—', avg: '2.79' },
  { partner: 'FNI', w10: '0.0', w11: '0.0', w12: '0.0', w13: '—', avg: '0.00', avgColor: '#059669' },
  { partner: 'TMS(M)', w10: '0.0', w11: '0.0', w12: '0.0', w13: '—', avg: '0.00', avgColor: '#059669' },
];

const ELEC_NAN: WeeklyNanRow[] = [
  { partner: 'C&A', w10: '0.5', w11: '0.2', w12: '0.0', w13: '—', avg: '0.23' },
  { partner: 'P&S', w10: '15.2', w11: '12.8', w12: '12.6', w13: '—', avg: '13.61', avgColor: 'var(--gx-danger)' },
  { partner: 'TMS(E)', w10: '0.0', w11: '0.0', w12: '0.0', w13: '—', avg: '0.00', avgColor: '#059669' },
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

function EvalTable({ title, subtitle, data }: { title: string; subtitle: string; data: EvalRow[] }) {
  return (
    <div style={{ background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>{title}</div>
          <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: 'rgba(99,102,241,0.08)', color: 'var(--gx-accent)' }}>불량 70%</span>
          <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: 'rgba(245,158,11,0.08)', color: '#D97706' }}>누락 30%</span>
        </div>
      </div>
      <div style={{ padding: '16px 24px 24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {['순위', '협력사', '생산', '불량', '불량률', '불량등급', '누락률', '누락등급', '최종점수', '최종등급'].map(h => (
                <th key={h} style={{ ...thStyle, width: h === '순위' ? '44px' : undefined, textAlign: h === '순위' ? 'center' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(r => (
              <tr key={r.partner} style={{ transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--gx-snow)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ ...tdStyle, fontSize: '16px', textAlign: 'center' }}>{r.rank}</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{r.partner}</td>
                <td style={numStyle}>{r.production}</td>
                <td style={numStyle}>{r.defect}</td>
                <td style={numStyle}>{r.defectRate}</td>
                <td style={tdStyle}><GradeBadge grade={r.defectGrade} /></td>
                <td style={{
                  ...numStyle,
                  ...(r.nanDanger ? { color: 'var(--gx-danger)', fontWeight: 600 } : {}),
                }}>{r.nan}</td>
                <td style={tdStyle}><GradeBadge grade={r.nanGrade} /></td>
                <td style={{ ...numStyle, fontWeight: 700, fontSize: '14px' }}>{r.score}</td>
                <td style={tdStyle}><GradeBadge grade={r.finalGrade} large /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WeeklyNanTable({ title, data }: { title: string; data: WeeklyNanRow[] }) {
  return (
    <div style={{ background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>{title}</div>
      </div>
      <div style={{ padding: '12px 24px 24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {['협력사', 'W10', 'W11', 'W12', 'W13', '월평균'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(r => (
              <tr key={r.partner}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--gx-snow)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ ...tdStyle, fontWeight: 600 }}>{r.partner}</td>
                {[r.w10, r.w11, r.w12].map((v, i) => (
                  <td key={i} style={{
                    ...numStyle,
                    ...(parseFloat(v) > 10 ? { color: 'var(--gx-danger)' } : {}),
                  }}>{v}</td>
                ))}
                <td style={{ ...numStyle, color: 'var(--gx-silver)' }}>{r.w13}</td>
                <td style={{ ...numStyle, fontWeight: 700, color: r.avgColor || 'var(--gx-graphite)' }}>{r.avg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PrepareBanner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '14px 20px', marginBottom: '24px',
      background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-gx-lg)',
      border: '1px solid rgba(99,102,241,0.12)',
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gx-accent)', flexShrink: 0 }} />
      <div style={{ fontSize: '13px', color: 'var(--gx-graphite)' }}>
        <strong>평가 산출</strong> · 불량률(70%) + 작업기록 누락률(30%) = 최종 가중평균 → 등급 · 3월 평가 → 5월 물량할당
      </div>
      <div style={{
        marginLeft: 'auto', padding: '4px 12px', borderRadius: 'var(--radius-gx-sm)',
        fontSize: '11px', fontWeight: 600, color: 'var(--gx-accent)', background: 'rgba(99,102,241,0.12)',
      }}>W10 ~ W13</div>
    </div>
  );
}

export default function PartnerEvaluationPage() {
  return (
    <Layout title="협력사 관리">
      <div style={{ padding: '28px 32px', maxWidth: '1440px' }}>
        <PrepareBanner />

        {/* 기구 협력사 평가 */}
        <EvalTable title="기구 협력사 평가" subtitle="2026년 3월 · 생산대수 = Chamber 기준" data={MECH_DATA} />

        {/* 전장 협력사 평가 */}
        <EvalTable title="전장 협력사 평가" subtitle="2026년 3월 · 전장은 기구보다 엄격한 기준" data={ELEC_DATA} />

        {/* 주차별 누락률 상세 */}
        <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
          <WeeklyNanTable title="기구 — 주차별 누락률 (%)" data={MECH_NAN} />
          <WeeklyNanTable title="전장 — 주차별 누락률 (%)" data={ELEC_NAN} />
        </div>
      </div>
    </Layout>
  );
}
