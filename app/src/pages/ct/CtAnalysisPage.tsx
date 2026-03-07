// src/pages/ct/CtAnalysisPage.tsx
// CT 분석 — API 연동 준비 중 (샘플 데이터)

import Layout from '@/components/layout/Layout';

const PROCESS_SUMMARY = [
  { name: '기구', iqr: '0.0h', avg: '0.0h', color: 'var(--gx-steel)' },
  { name: '전장', iqr: '31.6h', avg: '34.5h', color: 'var(--gx-accent)' },
  { name: '검사', iqr: '4.6h', avg: '4.4h', color: 'var(--gx-success)' },
  { name: '기타', iqr: '0.0h', avg: '0.0h', color: 'var(--gx-steel)' },
];

const ELEC_TASKS = [
  { task: '판넬 제작 작업', iqr: 9.4, avg: 9.5, confidence: '높음', diff: -1.1 },
  { task: '판넬 취부 및 선분리', iqr: 6.0, avg: 6.4, confidence: '높음', diff: -6.3 },
  { task: '탱크 도킹 후 결선 작업', iqr: 4.4, avg: 4.9, confidence: '보통', diff: -10.2 },
  { task: '프레임 전장 배선', iqr: 3.9, avg: 4.5, confidence: '보통', diff: -13.3 },
  { task: '메인 컨트롤러 설치', iqr: 3.0, avg: 3.5, confidence: '높음', diff: -14.3 },
  { task: '센서 캘리브레이션', iqr: 2.5, avg: 2.6, confidence: '높음', diff: -3.8 },
  { task: '최종 점검 및 라벨링', iqr: 2.4, avg: 3.1, confidence: '낮음', diff: -22.6 },
];

const INSPECT_TASKS = [
  { task: '가압 검사', iqr: 2.4, avg: 2.2, confidence: '높음', diff: 9.1 },
  { task: '자주 검사', iqr: 1.6, avg: 1.7, confidence: '높음', diff: -5.9 },
  { task: '외관 검사', iqr: 0.6, avg: 0.5, confidence: '보통', diff: 20.0 },
];

const maxIqr = Math.max(...ELEC_TASKS.map(t => t.iqr));

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

function ConfidenceBadge({ level }: { level: string }) {
  const color = level === '높음' ? 'var(--gx-success)' : level === '보통' ? 'var(--gx-warning)' : 'var(--gx-danger)';
  return (
    <span style={{
      padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 600,
      background: `${color}18`, color,
    }}>{level}</span>
  );
}

function TaskSection({ title, color, iqr, avg, samples, diff, tasks, maxVal }: {
  title: string; color: string; iqr: string; avg: string; samples: string; diff: string;
  tasks: typeof ELEC_TASKS; maxVal: number;
}) {
  return (
    <div style={{
      background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
      boxShadow: 'var(--shadow-card)', overflow: 'hidden', marginBottom: '24px',
    }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gx-mist)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-gx-sm)', fontSize: '12px', fontWeight: 600, background: `${color}15`, color }}>{title}</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'IQR', value: iqr },
            { label: '평균', value: avg },
            { label: '샘플', value: samples },
            { label: '차이', value: diff },
          ].map(c => (
            <div key={c.label} style={{
              padding: '6px 14px', borderRadius: 'var(--radius-gx-sm)',
              background: 'var(--gx-cloud)', fontSize: '12px',
            }}>
              <span style={{ color: 'var(--gx-steel)' }}>{c.label}: </span>
              <span style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: 'var(--gx-charcoal)' }}>{c.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '8px 0' }}>
        {tasks.map((t, i) => (
          <div key={t.task} style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '12px 24px', borderBottom: i < tasks.length - 1 ? '1px solid var(--gx-cloud)' : 'none',
          }}>
            <span style={{ width: '200px', fontSize: '13px', color: 'var(--gx-charcoal)', flexShrink: 0 }}>{t.task}</span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'var(--gx-cloud)', position: 'relative' }}>
                <div style={{
                  width: `${(t.iqr / maxVal) * 100}%`, height: '100%', borderRadius: '4px',
                  background: color, opacity: 0.7,
                }} />
              </div>
            </div>
            <span style={{ width: '60px', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textAlign: 'right' }}>{t.iqr}h</span>
            <span style={{ width: '60px', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--gx-steel)', textAlign: 'right' }}>{t.avg}h</span>
            <span style={{ width: '50px' }}><ConfidenceBadge level={t.confidence} /></span>
            <span style={{
              width: '50px', fontSize: '11px', fontWeight: 600, textAlign: 'right',
              fontFamily: "'JetBrains Mono', monospace",
              color: t.diff < 0 ? 'var(--gx-success)' : 'var(--gx-danger)',
            }}>{t.diff > 0 ? '+' : ''}{t.diff}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CtAnalysisPage() {
  return (
    <Layout title="CT 분석">
      <div style={{ padding: '28px 32px', maxWidth: '1400px' }}>
        <PrepareBanner />

        {/* Filter Bar */}
        <div style={{
          display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px',
          padding: '16px 20px', background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ display: 'flex', gap: '4px', padding: '3px', background: 'var(--gx-cloud)', borderRadius: 'var(--radius-gx-sm)' }}>
            {['단일월', '기간합산'].map((t, i) => (
              <div key={t} style={{
                padding: '6px 14px', borderRadius: 'var(--radius-gx-sm)', fontSize: '12px', fontWeight: 500,
                background: i === 0 ? 'var(--gx-white)' : 'transparent',
                color: i === 0 ? 'var(--gx-accent)' : 'var(--gx-steel)',
                boxShadow: i === 0 ? 'var(--shadow-card)' : 'none', cursor: 'pointer',
              }}>{t}</div>
            ))}
          </div>
          <select disabled style={{
            padding: '8px 12px', borderRadius: 'var(--radius-gx-md)',
            border: '1px solid var(--gx-mist)', fontSize: '13px',
            color: 'var(--gx-charcoal)', background: 'var(--gx-cloud)',
          }}>
            <option>2026년 01월</option>
          </select>
          <select disabled style={{
            padding: '8px 12px', borderRadius: 'var(--radius-gx-md)',
            border: '1px solid var(--gx-mist)', fontSize: '13px',
            color: 'var(--gx-charcoal)', background: 'var(--gx-cloud)',
          }}>
            <option>DRAGON</option>
          </select>
          <button disabled style={{
            padding: '8px 18px', borderRadius: 'var(--radius-gx-md)',
            background: 'var(--gx-accent)', color: 'white', border: 'none',
            fontSize: '13px', fontWeight: 600, opacity: 0.5,
          }}>분석 실행</button>
        </div>

        {/* Section Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gx-charcoal)' }}>DRAGON — 2026-01 Task별 분석</div>
          <span style={{
            padding: '4px 10px', borderRadius: 'var(--radius-gx-sm)',
            fontSize: '11px', fontWeight: 600, background: 'var(--gx-accent-soft)', color: 'var(--gx-accent)',
          }}>IQR 군집도</span>
        </div>

        {/* Process Summary Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {PROCESS_SUMMARY.map(p => (
            <div key={p.name} style={{
              background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
              padding: '20px', boxShadow: 'var(--shadow-card)',
              borderTop: `3px solid ${p.color}`,
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '12px' }}>{p.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--gx-steel)', marginBottom: '4px' }}>IQR 시간</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: p.color, fontFamily: "'JetBrains Mono', monospace" }}>{p.iqr}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--gx-steel)', marginBottom: '4px' }}>평균 시간</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gx-charcoal)', fontFamily: "'JetBrains Mono', monospace" }}>{p.avg}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Task Sections */}
        <TaskSection
          title="전장" color="var(--gx-accent)"
          iqr="31.6h" avg="34.5h" samples="192개" diff="8.5%"
          tasks={ELEC_TASKS} maxVal={maxIqr}
        />
        <TaskSection
          title="검사" color="var(--gx-success)"
          iqr="4.6h" avg="4.4h" samples="84개" diff="4.5%"
          tasks={INSPECT_TASKS} maxVal={maxIqr}
        />
      </div>
    </Layout>
  );
}
