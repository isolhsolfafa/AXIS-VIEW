// src/components/checklist/ChecklistFilterBar.tsx
// 체크리스트 필터: Product Code 드롭다운 + Category 탭 — Sprint 20

interface ChecklistFilterBarProps {
  productCodes: string[];
  selectedProduct: string;
  onProductChange: (code: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
}

const CATEGORIES = ['MECH', 'ELEC', 'TM'] as const;

export default function ChecklistFilterBar({
  productCodes,
  selectedProduct,
  onProductChange,
  selectedCategory,
  onCategoryChange,
}: ChecklistFilterBarProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Product Code 드롭다운 */}
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

      {/* Category 탭 */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat;
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
                color: isActive ? 'var(--gx-white)' : 'var(--gx-slate)',
                background: isActive ? 'var(--gx-accent)' : 'var(--gx-cloud)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
