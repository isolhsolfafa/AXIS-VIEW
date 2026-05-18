// src/pages/factory/components/StageCompletionCard.tsx
// 공장 대시보드 우측 패널 — 공정별 완료율 (Sprint 44: FactoryDashboardPage 인라인 JSX 추출)

export interface StageItem {
  label: string;
  value: number;
}

export interface StageCompletionCardProps {
  stageData: StageItem[];
  weekLabel: string;
}

export default function StageCompletionCard({ stageData, weekLabel }: StageCompletionCardProps) {
  return (
    <div style={{
      background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
      boxShadow: 'var(--shadow-card)', padding: '24px',
    }}>
      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '4px' }}>공정별 완료율</div>
      <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginBottom: '24px' }}>{weekLabel}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {stageData.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-slate)', width: '44px', textAlign: 'right', flexShrink: 0 }}>{s.label}</span>
            <div style={{ flex: 1, height: '8px', background: 'var(--gx-cloud)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${s.value}%`, borderRadius: '4px',
                background: s.value >= 80 ? 'var(--gx-success)' : s.value >= 40 ? 'var(--gx-warning)' : 'var(--gx-danger)',
                transition: 'width 0.5s',
              }} />
            </div>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
              fontWeight: 600, color: 'var(--gx-graphite)', minWidth: '40px',
            }}>{s.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
