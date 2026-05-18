// src/components/sn-status/SNStatusSettingsPanel.tsx
// 생산현황 설정 드롭다운 패널 — Sprint 25 / Sprint 46(PI·QI·SI 공정 토글)

import { useEffect, useRef } from 'react';
import { useAuth } from '@/store/authStore';
import type { DashboardSettings } from '@/hooks/useSettings';
import type { ProcessToggles } from '@/utils/processToggleFilter';

interface SNStatusSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  settings: DashboardSettings;
  onUpdate: <K extends keyof DashboardSettings>(key: K, value: DashboardSettings[K]) => void;
}

// 토글 1행 (라벨 + 설명 + 스위치)
function ToggleRow({ label, desc, checked, onToggle }: {
  label: string;
  desc: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
      <div>
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-charcoal)' }}>{label}</span>
        <div style={{ fontSize: '10px', color: 'var(--gx-steel)', marginTop: '2px' }}>{desc}</div>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: '40px', height: '22px', borderRadius: '11px', border: 'none',
          cursor: 'pointer', position: 'relative', flexShrink: 0,
          background: checked ? 'var(--gx-accent)' : 'var(--gx-silver)',
          transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: '2px',
          left: checked ? '20px' : '2px',
          width: '18px', height: '18px', borderRadius: '50%',
          background: 'var(--gx-white)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );
}

export default function SNStatusSettingsPanel({ open, onClose, settings, onUpdate }: SNStatusSettingsPanelProps) {
  const { user } = useAuth();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const isAdmin = !!user?.is_admin;
  const isGstOrAdmin = isAdmin || user?.company === 'GST';

  // Sprint 46: PI/QI/SI 공정 토글 (다중 선택)
  const toggleProcess = (key: keyof ProcessToggles) => {
    onUpdate('processFilters', { ...settings.processFilters, [key]: !settings.processFilters[key] });
  };

  return (
    <div ref={panelRef} style={{
      position: 'absolute', top: '40px', right: '0', width: '260px', zIndex: 100,
      background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-md)',
      border: '1px solid var(--gx-mist)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
      padding: '16px',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--gx-mist)',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
          생산현황 설정
        </span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--gx-steel)', fontSize: '16px',
        }}>&#10005;</button>
      </div>

      {/* Sprint 46: 공정 토글 (GST + admin) — 다중 선택, 전부 OFF = 전체보기 */}
      {isGstOrAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gx-slate)' }}>
            공정 필터 <span style={{ fontWeight: 400, color: 'var(--gx-steel)' }}>(전부 OFF = 전체)</span>
          </div>
          <ToggleRow
            label="PI"
            desc="PI 진행 중 / 오늘 완료"
            checked={settings.processFilters.PI}
            onToggle={() => toggleProcess('PI')}
          />
          <ToggleRow
            label="QI"
            desc="QI 진행 중 / 오늘 완료"
            checked={settings.processFilters.QI}
            onToggle={() => toggleProcess('QI')}
          />
          <ToggleRow
            label="SI"
            desc="SI 미완료 (출하 대기)"
            checked={settings.processFilters.SI}
            onToggle={() => toggleProcess('SI')}
          />
        </div>
      )}

      {/* 테스트 S/N 전용 보기 (admin) */}
      {isAdmin && (
        <div style={{ marginTop: isGstOrAdmin ? '14px' : '0', paddingTop: isGstOrAdmin ? '14px' : '0', borderTop: isGstOrAdmin ? '1px solid var(--gx-mist)' : 'none' }}>
          <ToggleRow
            label="테스트 S/N 전용 보기"
            desc="ON: 테스트 S/N(TEST- / DOC_TEST-)만 / OFF: 운영 S/N만"
            checked={settings.showTestSN}
            onToggle={() => onUpdate('showTestSN', !settings.showTestSN)}
          />
        </div>
      )}

      {!isGstOrAdmin && (
        <div style={{ fontSize: '12px', color: 'var(--gx-steel)', textAlign: 'center', padding: '8px 0' }}>
          설정 가능한 항목이 없습니다.
        </div>
      )}
    </div>
  );
}
