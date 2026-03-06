// src/components/layout/Layout.tsx
// 공통 레이아웃 — 사이드바 + 헤더 + 메인 콘텐츠 래퍼

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
  return (
    <div style={{ minHeight: '100vh', background: 'var(--gx-cloud)', display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, minHeight: '100vh' }}>
        <Header
          title={title}
          lastUpdated={lastUpdated}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
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
