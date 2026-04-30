// src/components/sn-status/InProgressModelChips.tsx
// Sprint 38 (v1.38.0): S/N 작업 현황 진행 중 모델별 카운트 칩 + linear-gradient 미니 진행 바
// SNStatusPage 의 JSX return 한도 위반 악화 차단을 위해 별도 컴포넌트 추출 (Codex M1 회피 + A1 옵션 A 채택)

interface InProgressModelChipsProps {
  items: ReadonlyArray<readonly [string, number]>;  // [model, count][] — 카운트 내림차순 정렬됨
  activeModel: string;                                // 현재 정확매칭 active 모델 ('' = 비활성)
  total: number;
  onToggle: (model: string) => void;
}

export default function InProgressModelChips({
  items, activeModel, total, onToggle,
}: InProgressModelChipsProps) {
  // CLS 완화 (Codex A2): 빈 배열일 때 내용만 비우고 컨테이너는 항상 렌더 (minHeight 예약)
  const isEmpty = items.length === 0;
  const maxCount = items[0]?.[1] ?? 1;

  return (
    <div
      role="group"
      aria-label="모델별 진행 중 필터"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
        marginBottom: '20px',
        minHeight: '32px',  // CLS 완화 — 칩 등장 시 카드 영역 밀림 방지
      }}
    >
      {!isEmpty && (
        <>
          <span style={{
            fontSize: '12px', color: 'var(--gx-steel)',
            fontWeight: 500, marginRight: '4px',
          }}>
            진행 중 <strong style={{
              color: 'var(--gx-charcoal)',
              fontFamily: "'JetBrains Mono', monospace",
            }}>{total}</strong>대
          </span>
          {items.map(([model, count]) => {
            const percent = Math.round((count / maxCount) * 100);
            const isActive = activeModel === model;
            return (
              <button
                key={model}
                type="button"
                onClick={() => onToggle(model)}
                aria-pressed={isActive}
                aria-label={
                  `${model} ${count}대 (전체 대비 ${percent}%, ` +
                  `${isActive ? '필터 적용 중 (클릭 시 해제)' : '클릭 시 필터 적용'})`
                }
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 500,
                  border: `1px solid ${isActive ? 'var(--gx-accent)' : 'var(--gx-mist)'}`,
                  color: isActive ? 'white' : 'var(--gx-charcoal)',
                  background: isActive
                    ? 'var(--gx-accent)'
                    : `linear-gradient(to right,
                        rgba(99, 102, 241, 0.18) 0%,
                        rgba(99, 102, 241, 0.18) ${percent}%,
                        var(--gx-cloud) ${percent}%,
                        var(--gx-cloud) 100%)`,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                  fontFamily: 'inherit',
                }}
              >
                {model} · <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                }}>{count}</span>
              </button>
            );
          })}
        </>
      )}
    </div>
  );
}
