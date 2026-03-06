// src/components/layout/Header.tsx
// 상단 헤더 (64px) — G-AXIS 디자인 시스템 완전 적용

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import SettingsModal from './SettingsModal';
import { useSettings } from '@/hooks/useSettings';

interface HeaderProps {
  title?: string;
  lastUpdated?: Date | null;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

export default function Header({
  title = '협력사 대시보드',
  lastUpdated: _lastUpdated,
  selectedDate,
  onDateChange,
}: HeaderProps) {
  const [now, setNow] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, updateSetting } = useSettings();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const displayDate = selectedDate || format(now, 'yyyy-MM-dd');
  const displayDateKO = format(new Date(displayDate + 'T00:00:00'), 'yyyy. MM. dd');

  return (
    <header
      style={{
        height: 'var(--header-height)',
        background: 'var(--gx-white)',
        borderBottom: '1px solid var(--gx-mist)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* 좌측: 페이지 제목 + 브레드크럼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--gx-charcoal)',
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--gx-steel)',
            }}
          >
            <span>출입 현황</span>
            <span>/</span>
            <span style={{ color: 'var(--gx-accent)', fontWeight: 500 }}>
              {displayDateKO}
            </span>
          </div>
        </div>
      </div>

      {/* 우측: 날짜 선택기 + 아이콘 버튼들 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* 날짜 선택기 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-gx-md)',
            border: '1px solid var(--gx-mist)',
            background: 'var(--gx-white)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--gx-graphite)',
            cursor: 'pointer',
            transition: 'all 0.15s',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = 'var(--gx-accent)';
            el.style.background = 'var(--gx-accent-soft)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = 'var(--gx-mist)';
            el.style.background = 'var(--gx-white)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--gx-steel)" strokeWidth="1.5">
            <rect x="2" y="3" width="12" height="11" rx="2"/>
            <path d="M2 7h12M5 1v4M11 1v4"/>
          </svg>
          {onDateChange ? (
            <input
              type="date"
              value={displayDate}
              onChange={(e) => onDateChange(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--gx-graphite)',
                cursor: 'pointer',
                outline: 'none',
                width: '100px',
              }}
            />
          ) : (
            <span>{displayDateKO}</span>
          )}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="var(--gx-steel)">
            <path d="M4 5.5l3 3 3-3"/>
          </svg>
        </div>

        {/* 검색 버튼 */}
        <button
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-gx-md)',
            border: '1px solid var(--gx-mist)',
            background: 'var(--gx-white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s',
            color: 'var(--gx-slate)',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = 'var(--gx-cloud)';
            el.style.borderColor = 'var(--gx-silver)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = 'var(--gx-white)';
            el.style.borderColor = 'var(--gx-mist)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14.25 14.25L11.5 11.5M12.75 8.25a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/>
          </svg>
        </button>

        {/* 알림 버튼 */}
        <button
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-gx-md)',
            border: '1px solid var(--gx-mist)',
            background: 'var(--gx-white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s',
            color: 'var(--gx-slate)',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = 'var(--gx-cloud)';
            el.style.borderColor = 'var(--gx-silver)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = 'var(--gx-white)';
            el.style.borderColor = 'var(--gx-mist)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13.73 11.455A6.75 6.75 0 009 2.25a6.75 6.75 0 00-4.73 9.205L2.25 15.75l4.295-1.98A6.75 6.75 0 0013.73 11.455z"/>
          </svg>
          <span
            style={{
              position: 'absolute',
              top: '7px',
              right: '7px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'var(--gx-danger)',
              border: '1.5px solid var(--gx-white)',
            }}
          />
        </button>

        {/* 설정 버튼 */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setSettingsOpen((prev) => !prev)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-gx-md)',
              border: `1px solid ${settingsOpen ? 'var(--gx-accent)' : 'var(--gx-mist)'}`,
              background: settingsOpen ? 'var(--gx-accent-soft)' : 'var(--gx-white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
              color: settingsOpen ? 'var(--gx-accent)' : 'var(--gx-slate)',
            }}
            onMouseEnter={(e) => {
              if (!settingsOpen) {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = 'var(--gx-cloud)';
                el.style.borderColor = 'var(--gx-silver)';
              }
            }}
            onMouseLeave={(e) => {
              if (!settingsOpen) {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = 'var(--gx-white)';
                el.style.borderColor = 'var(--gx-mist)';
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="9" r="2.25"/>
              <path d="M14.85 11.1a1.2 1.2 0 00.24 1.32l.044.043a1.455 1.455 0 11-2.058 2.058l-.043-.043a1.2 1.2 0 00-1.32-.24 1.2 1.2 0 00-.727 1.098v.122a1.455 1.455 0 11-2.91 0v-.065A1.2 1.2 0 007.35 14.1a1.2 1.2 0 00-1.32.24l-.043.044a1.455 1.455 0 11-2.058-2.058l.043-.043a1.2 1.2 0 00.24-1.32 1.2 1.2 0 00-1.098-.728h-.122a1.455 1.455 0 110-2.91h.065a1.2 1.2 0 001.246-.727 1.2 1.2 0 00-.24-1.32l-.044-.043A1.455 1.455 0 116.077 3.18l.043.043a1.2 1.2 0 001.32.24h.06a1.2 1.2 0 00.727-1.098v-.122a1.455 1.455 0 012.91 0v.065a1.2 1.2 0 00.727 1.246 1.2 1.2 0 001.32-.24l.043-.044a1.455 1.455 0 012.058 2.058l-.043.043a1.2 1.2 0 00-.24 1.32v.06a1.2 1.2 0 001.098.727h.122a1.455 1.455 0 010 2.91h-.065a1.2 1.2 0 00-1.246.727z"/>
            </svg>
          </button>
          <SettingsModal
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            settings={settings}
            onUpdate={updateSetting}
          />
        </div>
      </div>
    </header>
  );
}
