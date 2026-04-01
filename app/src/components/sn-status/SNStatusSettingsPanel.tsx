// src/components/sn-status/SNStatusSettingsPanel.tsx
// 생산현황 설정 드롭다운 패널 — Sprint 25

import { useEffect, useRef } from 'react';
import { useAuth } from '@/store/authStore';
import type { DashboardSettings } from '@/hooks/useSettings';

interface SNStatusSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  settings: DashboardSettings;
  onUpdate: <K extends keyof DashboardSettings>(key: K, value: DashboardSettings[K]) => void;
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

  const isAdmin = user?.is_admin;

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

      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-charcoal)' }}>
              테스트 S/N 표시
            </span>
            <div style={{ fontSize: '10px', color: 'var(--gx-steel)', marginTop: '2px' }}>
              DOC_TEST- / TEST- prefix S/N 포함
            </div>
          </div>
          <button
            onClick={() => onUpdate('showTestSN', !settings.showTestSN)}
            style={{
              width: '40px', height: '22px', borderRadius: '11px', border: 'none',
              cursor: 'pointer', position: 'relative',
              background: settings.showTestSN ? 'var(--gx-accent)' : 'var(--gx-silver)',
              transition: 'background 0.2s',
            }}
          >
            <span style={{
              position: 'absolute', top: '2px',
              left: settings.showTestSN ? '20px' : '2px',
              width: '18px', height: '18px', borderRadius: '50%',
              background: 'var(--gx-white)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              transition: 'left 0.2s',
            }} />
          </button>
        </div>
      )}

      {!isAdmin && (
        <div style={{ fontSize: '12px', color: 'var(--gx-steel)', textAlign: 'center', padding: '8px 0' }}>
          설정 가능한 항목이 없습니다.
        </div>
      )}
    </div>
  );
}
