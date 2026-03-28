// src/components/layout/Layout.tsx
// 공통 레이아웃 — 사이드바 + 헤더 + 메인 콘텐츠 래퍼 (Sprint 21 반응형)

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  lastUpdated?: Date | null;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

export default function Layout({ children, title, lastUpdated, selectedDate, onDateChange }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(() =>
    localStorage.getItem('sidebar_collapsed') === 'true'
  );
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const tabletMql = window.matchMedia('(max-width: 1024px)');
    const mobileMql = window.matchMedia('(max-width: 768px)');

    const handleTablet = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setCollapsed(true);
    };
    const handleMobile = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
      if (e.matches) setMobileOpen(false);
    };

    handleTablet(tabletMql);
    handleMobile(mobileMql);

    tabletMql.addEventListener('change', handleTablet);
    mobileMql.addEventListener('change', handleMobile);

    return () => {
      tabletMql.removeEventListener('change', handleTablet);
      mobileMql.removeEventListener('change', handleMobile);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  const sidebarWidth = isMobile
    ? '0px'
    : collapsed
      ? 'var(--sidebar-collapsed-width)'
      : 'var(--sidebar-width)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gx-cloud)', display: 'flex' }}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(prev => !prev)}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="main-content" style={{ marginLeft: sidebarWidth, flex: 1, minHeight: '100vh', transition: 'margin-left 0.2s ease' }}>
        <Header
          title={title}
          lastUpdated={lastUpdated}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          isMobile={isMobile}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main
          style={{
            padding: '28px 32px',
            maxWidth: '1440px',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
