// src/components/checklist/ChecklistSettingsPanel.tsx
// TM 체크리스트 설정 드롭다운 패널 — Sprint 25

import { useEffect, useRef } from 'react';
import { useAdminSettings, useUpdateAdminSettings } from '@/hooks/useAdminSettings';

interface ChecklistSettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function ChecklistSettingsPanel({ open, onClose }: ChecklistSettingsPanelProps) {
  const { data: settings, isLoading } = useAdminSettings();
  const updateMutation = useUpdateAdminSettings();
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

  const s = settings as Record<string, unknown> | undefined;
  const checkerValue = (s?.tm_checklist_1st_checker as string) ?? 'is_manager';
  const issueAlert = (s?.tm_checklist_issue_alert as boolean) ?? true;
  const scope = (s?.tm_checklist_scope as string) ?? 'product_code';

  const handleToggle = (key: string, currentValue: boolean) => {
    updateMutation.mutate({ [key]: !currentValue });
  };

  return (
    <div ref={panelRef} style={{
      position: 'absolute', top: '40px', right: '0', width: '300px', zIndex: 100,
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
          TM 체크리스트 설정
        </span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--gx-steel)', fontSize: '16px',
        }}>&#10005;</button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gx-steel)', fontSize: '12px' }}>
          설정 불러오는 중...
        </div>
      ) : (
        <>
          {/* 1차 검수자 */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--gx-graphite)', marginBottom: '6px' }}>
              1차 검수자
            </label>
            <div style={{ fontSize: '10px', color: 'var(--gx-steel)', marginBottom: '6px' }}>
              TM 체크리스트를 작성할 수 있는 권한
            </div>
            <select
              value={checkerValue}
              onChange={(e) => updateMutation.mutate({ tm_checklist_1st_checker: e.target.value })}
              disabled={updateMutation.isPending}
              style={{
                width: '100%', padding: '7px 10px',
                borderRadius: 'var(--radius-gx-sm)',
                border: '1px solid var(--gx-mist)',
                fontSize: '13px', color: 'var(--gx-charcoal)',
                background: 'var(--gx-snow)', cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="is_manager">Manager만</option>
              <option value="user">모든 사용자</option>
            </select>
          </div>

          {/* ISSUE 알림 */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-charcoal)' }}>
                  ISSUE 알림
                </span>
                <div style={{ fontSize: '10px', color: 'var(--gx-steel)', marginTop: '2px' }}>
                  체크리스트 완료 시 ISSUE → MECH/ELEC 알림
                </div>
              </div>
              <button
                onClick={() => handleToggle('tm_checklist_issue_alert', issueAlert)}
                disabled={updateMutation.isPending}
                style={{
                  width: '40px', height: '22px', borderRadius: '11px', border: 'none',
                  cursor: 'pointer', position: 'relative',
                  background: issueAlert ? 'var(--gx-accent)' : 'var(--gx-silver)',
                  transition: 'background 0.2s',
                  opacity: updateMutation.isPending ? 0.6 : 1,
                }}
              >
                <span style={{
                  position: 'absolute', top: '2px',
                  left: issueAlert ? '20px' : '2px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: 'var(--gx-white)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>
          </div>

          {/* 체크리스트 범위 */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--gx-graphite)', marginBottom: '6px' }}>
              항목 범위
            </label>
            <div style={{ fontSize: '10px', color: 'var(--gx-steel)', marginBottom: '6px' }}>
              product_code별 맞춤 항목 vs 전체 공통 항목
            </div>
            <select
              value={scope}
              onChange={(e) => updateMutation.mutate({ tm_checklist_scope: e.target.value })}
              disabled={updateMutation.isPending}
              style={{
                width: '100%', padding: '7px 10px',
                borderRadius: 'var(--radius-gx-sm)',
                border: '1px solid var(--gx-mist)',
                fontSize: '13px', color: 'var(--gx-charcoal)',
                background: 'var(--gx-snow)', cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="product_code">모델별 (product_code)</option>
              <option value="all">전체 공통 (ALL)</option>
            </select>
          </div>

          {updateMutation.isSuccess && (
            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--gx-success)', textAlign: 'center' }}>
              설정이 저장되었습니다.
            </div>
          )}
          {updateMutation.isError && (
            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--gx-danger)', textAlign: 'center' }}>
              저장 실패
            </div>
          )}
        </>
      )}
    </div>
  );
}
