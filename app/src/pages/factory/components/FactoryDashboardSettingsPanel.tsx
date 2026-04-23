// src/pages/factory/components/FactoryDashboardSettingsPanel.tsx
// Sprint 35 Phase 2 (v1.35.0) 신규 — 공장 대시보드 설정 모달
// - 출하 완료 기준 3옵션 (실적/계획/실시간)
// - 월간 생산량 기준 4옵션 (기구 착수/완료 계획/출하 계획/실제 출하)
// - localStorage 저장 (axis_view_factory_shipped_basis / axis_view_factory_monthly_date_field)

import type { MonthlyKpiDateField, ShippedBasis } from '@/api/factory';

export interface FactoryDashboardSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  shippedBasis: ShippedBasis;
  onShippedBasisChange: (v: ShippedBasis) => void;
  monthlyDateField: MonthlyKpiDateField;
  onMonthlyDateFieldChange: (v: MonthlyKpiDateField) => void;
}

const SHIPPED_OPTIONS: Array<{ value: ShippedBasis; label: string; desc: string }> = [
  { value: 'actual', label: '실적 (기본)', desc: 'actual_ship_date — ETL 실적 데이터' },
  { value: 'plan',   label: '계획',        desc: 'ship_plan_date + si_completed — 계획 범위 내 완료분' },
  { value: 'ops',    label: '실시간',      desc: 'SI_SHIPMENT app — 베타 100% 전까진 loss 가능' },
];

const MONTHLY_FIELD_OPTIONS: Array<{ value: MonthlyKpiDateField; label: string; desc: string }> = [
  { value: 'mech_start',         label: '기구 착수 (기본)', desc: '이번 달 기구 작업 시작한 S/N' },
  { value: 'finishing_plan_end', label: '완료 계획',        desc: '이번 달 완료 예정 S/N' },
  { value: 'ship_plan_date',     label: '출하 계획',        desc: '이번 달 출하 예정 S/N' },
  { value: 'actual_ship_date',   label: '실제 출하',        desc: '이번 달 실제 출하된 S/N' },
];

export default function FactoryDashboardSettingsPanel({
  open, onClose,
  shippedBasis, onShippedBasisChange,
  monthlyDateField, onMonthlyDateFieldChange,
}: FactoryDashboardSettingsPanelProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(42, 45, 53, 0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)', padding: '24px',
          maxWidth: '440px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
            공장 대시보드 설정
          </h3>
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: '20px', color: 'var(--gx-steel)', lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* 출하 기준 */}
        <fieldset style={{ border: 'none', padding: 0, marginBottom: '20px' }}>
          <legend style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gx-graphite)', marginBottom: '10px' }}>
            출하 완료 기준
          </legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {SHIPPED_OPTIONS.map(opt => (
              <label
                key={opt.value}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer',
                  padding: '10px 12px', borderRadius: '6px',
                  background: shippedBasis === opt.value ? 'var(--gx-snow)' : 'transparent',
                  border: `1px solid ${shippedBasis === opt.value ? 'var(--gx-accent)' : 'var(--gx-mist)'}`,
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="radio"
                  name="shipped_basis"
                  checked={shippedBasis === opt.value}
                  onChange={() => onShippedBasisChange(opt.value)}
                  style={{ marginTop: '2px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--gx-charcoal)' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>
                    {opt.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* 월간 생산량 기준 */}
        <fieldset style={{ border: 'none', padding: 0, marginBottom: '16px' }}>
          <legend style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gx-graphite)', marginBottom: '10px' }}>
            월간 생산량 기준
          </legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {MONTHLY_FIELD_OPTIONS.map(opt => (
              <label
                key={opt.value}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer',
                  padding: '10px 12px', borderRadius: '6px',
                  background: monthlyDateField === opt.value ? 'var(--gx-snow)' : 'transparent',
                  border: `1px solid ${monthlyDateField === opt.value ? 'var(--gx-accent)' : 'var(--gx-mist)'}`,
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="radio"
                  name="monthly_date_field"
                  checked={monthlyDateField === opt.value}
                  onChange={() => onMonthlyDateFieldChange(opt.value)}
                  style={{ marginTop: '2px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--gx-charcoal)' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>
                    {opt.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginBottom: '12px', lineHeight: 1.5 }}>
          설정은 이 브라우저(모니터)에만 저장됩니다. 설비별 모니터 각각 독립 설정 가능.
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '10px', fontSize: '13px', fontWeight: 600,
            background: 'var(--gx-accent)', color: 'var(--gx-white)',
            border: 'none', borderRadius: '6px', cursor: 'pointer',
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
