// src/components/checklist/ChecklistFilterBar.tsx
// 체크리스트 필터: Product Code 드롭다운 + Category 탭 — Sprint 26

interface ChecklistFilterBarProps {
  productCodes: string[];
  selectedProduct: string;
  onProductChange: (code: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  hideProductDropdown?: boolean;
}

const CATEGORIES = ['MECH', 'ELEC', 'TM'] as const;
const BLUR_CATEGORIES = new Set(['MECH']);

export default function ChecklistFilterBar({
  productCodes,
  selectedProduct,
  onProductChange,
  selectedCategory,
  onCategoryChange,
  hideProductDropdown,
}: ChecklistFilterBarProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Product Code 드롭다운 또는 COMMON 표시 */}
      {!hideProductDropdown ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gx-charcoal)', minWidth: '100px' }}>
            Product Code
          </label>
          <select
            value={selectedProduct}
            onChange={e => onProductChange(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-gx-md, 10px)',
              border: '1px solid var(--gx-mist)',
              fontSize: '13px',
              color: 'var(--gx-charcoal)',
              background: 'var(--gx-white)',
              minWidth: '200px',
              outline: 'none',
            }}
          >
            <option value="">선택하세요</option>
            {productCodes.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
            항목 범위
          </span>
          <span style={{
            padding: '6px 12px', borderRadius: '8px',
            background: 'var(--gx-cloud)', fontSize: '13px',
            color: 'var(--gx-slate)', fontFamily: "'JetBrains Mono', monospace",
          }}>
            COMMON (전 모델 공통)
          </span>
        </div>
      )}

      {/* Category 탭 */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat;
          const isDisabled = BLUR_CATEGORIES.has(cat);
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              style={{
                padding: '6px 18px',
                borderRadius: '16px',
                border: 'none',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--gx-white)' : isDisabled ? 'var(--gx-silver)' : 'var(--gx-slate)',
                background: isActive
                  ? (isDisabled ? 'var(--gx-steel)' : 'var(--gx-accent)')
                  : 'var(--gx-cloud)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat} {isDisabled && '🔒'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
