// src/components/layout/NotificationPanel.tsx
// 알림 드롭다운 패널 — 알림 소스별 건수 + 바로가기

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── 알림 항목 타입 ──────────────────────────────────── */
export interface NotificationItem {
  key: string;
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  to: string;
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  items: NotificationItem[];
}

export default function NotificationPanel({ open, onClose, items }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    const t = setTimeout(() => document.addEventListener('mousedown', handleClick), 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open, onClose]);

  if (!open) return null;

  const totalCount = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        top: '48px',
        right: 0,
        width: '300px',
        background: 'var(--gx-white)',
        borderRadius: 'var(--radius-gx-lg, 12px)',
        border: '1px solid var(--gx-mist)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: '14px 20px 12px',
          borderBottom: '1px solid var(--gx-mist)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
          알림
        </span>
        {totalCount > 0 && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#fff',
              background: 'var(--gx-danger, #EF4444)',
              borderRadius: '10px',
              padding: '1px 7px',
              lineHeight: '18px',
            }}
          >
            {totalCount}
          </span>
        )}
      </div>

      {/* 알림 항목 목록 */}
      <div>
        {items.length === 0 ? (
          <div
            style={{
              padding: '32px 20px',
              textAlign: 'center',
              color: 'var(--gx-steel)',
              fontSize: '13px',
            }}
          >
            새로운 알림이 없습니다
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.key}
              onClick={() => {
                navigate(item.to);
                onClose();
              }}
              style={{
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'background 0.15s',
                borderBottom: '1px solid var(--gx-mist)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'var(--gx-cloud)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'var(--gx-white)';
              }}
            >
              {/* 아이콘 */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: item.bg,
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>

              {/* 텍스트 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--gx-charcoal)',
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--gx-steel)',
                    marginTop: '2px',
                  }}
                >
                  {item.count > 0 ? `${item.count}건의 새로운 변경` : '새로운 알림 없음'}
                </div>
              </div>

              {/* 건수 뱃지 */}
              {item.count > 0 && (
                <span
                  style={{
                    minWidth: '22px',
                    height: '22px',
                    borderRadius: '11px',
                    background: item.color,
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 6px',
                    flexShrink: 0,
                  }}
                >
                  {item.count > 99 ? '99+' : item.count}
                </span>
              )}

              {/* 화살표 */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="var(--gx-silver)"
                strokeWidth="1.5"
                style={{ flexShrink: 0 }}
              >
                <path d="M5 3l4 4-4 4" />
              </svg>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
