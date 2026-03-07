// src/components/layout/Sidebar.tsx
// 좌측 사이드바 (260px) — G-AXIS 디자인 시스템 완전 적용

import { NavLink } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import logoImage from '@/assets/images/g-axis-2.png';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to?: string;
  disabled?: boolean;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const FactoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.97 5.97 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.97 5.97 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
  </svg>
);

const QrIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zm5-12a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V5zm2 2V6h1v1h-1zM9 9a1 1 0 000 2h.01a1 1 0 000-2H9zm.01 4a1 1 0 100-2H9a1 1 0 000 2h.01zM11 9a1 1 0 000 2h.01a1 1 0 000-2H11zm0 4a1 1 0 100-2H11a1 1 0 000 2h.01zm2-4a1 1 0 100 2h.01a1 1 0 100-2H13z" clipRule="evenodd"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.828a1 1 0 101.415-1.414L11 9.586V6z" clipRule="evenodd"/>
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
  </svg>
);

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="6" width="8" height="6" rx="1.5"/>
    <path d="M5 6V4.5a2 2 0 014 0V6"/>
  </svg>
);

const LogOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10 11.5l3-3-3-3M13 8.5H6M6 13.5H3.5a1 1 0 01-1-1v-9a1 1 0 011-1H6"/>
  </svg>
);

const navGroups: NavGroup[] = [
  {
    title: 'Dashboard',
    items: [
      { label: '공장 대시보드', icon: <FactoryIcon />, to: '/factory' },
      { label: '협력사 대시보드', icon: <UsersIcon />, to: '/attendance' },
      { label: '생산일정', icon: <CalendarIcon />, to: '/plan' },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'QR 관리', icon: <QrIcon />, to: '/qr' },
    ],
  },
  {
    title: 'Analysis',
    items: [
      { label: '불량 분석', icon: <AlertIcon />, to: '/defect' },
      { label: 'CT 분석', icon: <ClockIcon />, to: '/ct' },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { label: 'AI 예측', icon: <BellIcon />, disabled: true },
      { label: 'AI 챗봇', icon: <ChatIcon />, disabled: true },
    ],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.length >= 2
      ? user.name.slice(-2)
      : user.name.charAt(0)
    : 'DK';

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: 'var(--gx-white)',
        borderRight: '1px solid var(--gx-mist)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
      }}
    >
      {/* 브랜드 영역 */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '14px',
          borderBottom: '1px solid var(--gx-mist)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '54px',
            height: '40px',
            flexShrink: 0,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={logoImage}
            alt="G-AXIS"
            style={{
              width: '150%',
              height: 'auto',
              filter: 'brightness(1.3) contrast(1.8)',
              mixBlendMode: 'multiply',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span
            style={{
              fontSize: '17px',
              fontWeight: 300,
              letterSpacing: '5px',
              color: 'var(--gx-charcoal)',
              lineHeight: 1,
            }}
          >
            AXIS-VIEW
          </span>
          <span
            style={{
              fontSize: '8px',
              fontWeight: 400,
              letterSpacing: '0.5px',
              color: 'var(--gx-steel)',
              lineHeight: 1.2,
            }}
          >
            Manufacturing Execution Platform
          </span>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {navGroups.map((group) => (
          <div key={group.title} style={{ padding: '20px 16px 8px' }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: 'var(--gx-steel)',
                padding: '0 8px',
                marginBottom: '8px',
              }}
            >
              {group.title}
            </div>
            {group.items.map((item) => {
              if (item.disabled) {
                return (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-gx-md)',
                      color: 'var(--gx-slate)',
                      fontSize: '13.5px',
                      fontWeight: 500,
                      opacity: 0.5,
                      cursor: 'not-allowed',
                    }}
                  >
                    <span style={{ opacity: 0.6, flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span
                        style={{
                          background: 'var(--gx-danger)',
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: '10px',
                          marginLeft: 'auto',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {!item.badge && (
                      <span style={{ color: 'var(--gx-steel)', flexShrink: 0 }}>
                        <LockIcon />
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.label}
                  to={item.to || '/'}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-gx-md)',
                    color: isActive ? 'var(--gx-accent)' : 'var(--gx-slate)',
                    background: isActive ? 'var(--gx-accent-soft)' : 'transparent',
                    fontSize: '13.5px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  })}
                  className={({ isActive }) => isActive ? 'nav-item-active' : ''}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        style={{
                          opacity: isActive ? 1 : 0.6,
                          flexShrink: 0,
                          display: 'flex',
                        }}
                      >
                        {item.icon}
                      </span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* 사용자 카드 */}
      <div
        style={{
          marginTop: 'auto',
          padding: '16px',
          borderTop: '1px solid var(--gx-mist)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: 'var(--radius-gx-md)',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = 'var(--gx-cloud)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = 'transparent';
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gx-accent), #818CF8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: '13px',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--gx-charcoal)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.name || '관리자'}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--gx-steel)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.company || 'GST'} · {user?.role || 'ADMIN'}
            </div>
          </div>
          <button
            onClick={logout}
            title="로그아웃"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--gx-steel)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '6px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--gx-danger)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--gx-steel)';
            }}
          >
            <LogOutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}
