// src/components/layout/SettingsModal.tsx
// 설정 드롭다운 패널 — 헤더 설정 버튼 클릭 시 표시

import { useEffect, useRef } from 'react';
import type { DashboardSettings } from '@/hooks/useSettings';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: DashboardSettings;
  onUpdate: <K extends keyof DashboardSettings>(key: K, value: DashboardSettings[K]) => void;
}

const REFRESH_OPTIONS = [
  { label: '1분', value: 1 },
  { label: '3분', value: 3 },
  { label: '5분', value: 5 },
  { label: '수동', value: 0 },
];

export default function SettingsModal({ open, onClose, settings, onUpdate }: SettingsModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // mousedown으로 처리해야 버튼 클릭과 충돌하지 않음
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        top: '48px',
        right: '0',
        width: '280px',
        background: 'var(--gx-white)',
        borderRadius: 'var(--radius-gx-md)',
        border: '1px solid var(--gx-mist)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
        zIndex: 100,
        padding: '16px',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--gx-charcoal)',
          marginBottom: '16px',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--gx-mist)',
        }}
      >
        대시보드 설정
      </div>

      {/* 1. 자동 새로고침 */}
      <div style={{ marginBottom: '14px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--gx-graphite)',
            marginBottom: '6px',
          }}
        >
          자동 새로고침
        </label>
        <select
          value={settings.refreshInterval}
          onChange={(e) => onUpdate('refreshInterval', Number(e.target.value))}
          style={{
            width: '100%',
            padding: '7px 10px',
            borderRadius: 'var(--radius-gx-sm)',
            border: '1px solid var(--gx-mist)',
            fontSize: '13px',
            color: 'var(--gx-charcoal)',
            background: 'var(--gx-snow)',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {REFRESH_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 2. 기본 뷰 */}
      <div style={{ marginBottom: '14px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--gx-graphite)',
            marginBottom: '6px',
          }}
        >
          기본 뷰
        </label>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['card', 'table'] as const).map((view) => (
            <button
              key={view}
              onClick={() => onUpdate('defaultView', view)}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 'var(--radius-gx-sm)',
                fontSize: '12px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                color: settings.defaultView === view ? 'var(--gx-accent)' : 'var(--gx-steel)',
                background: settings.defaultView === view ? 'var(--gx-accent-soft)' : 'var(--gx-snow)',
                transition: 'all 0.15s',
              }}
            >
              {view === 'card' ? '카드뷰' : '테이블'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. 본사/현장 구분 */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <label
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--gx-graphite)',
            }}
          >
            본사/현장 구분 표시
          </label>
          <button
            onClick={() => onUpdate('showHqSiteBreakdown', !settings.showHqSiteBreakdown)}
            style={{
              width: '40px',
              height: '22px',
              borderRadius: '11px',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              background: settings.showHqSiteBreakdown ? 'var(--gx-accent)' : 'var(--gx-silver)',
              transition: 'background 0.2s',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '2px',
                left: settings.showHqSiteBreakdown ? '20px' : '2px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'var(--gx-white)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                transition: 'left 0.2s',
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
