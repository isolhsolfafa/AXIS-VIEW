// src/components/layout/Sidebar.tsx
// 좌측 사이드바 — G-AXIS 디자인 시스템 + Sprint 21 반응형 (접기/모바일)

import { useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import { useEtlChanges } from '@/hooks/useEtlChanges';
import { APP_VERSION } from '@/version';
import logoImage from '@/assets/images/g-axis-2.png';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface SubNavItem {
  label: string;
  to: string;
  preparing?: boolean;
  badge?: number;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to?: string;
  disabled?: boolean;
  badge?: string;
  preparing?: boolean;
  children?: SubNavItem[];
  roles?: ('admin' | 'manager' | 'gst')[];
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

const ChecklistIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 4a1 1 0 000 2h.01a1 1 0 000-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zM7 10a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3zM7 14a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd"/>
  </svg>
);

const ChartBarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
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
      { label: '공장 대시보드', icon: <FactoryIcon />, to: '/factory', roles: ['admin', 'manager', 'gst'] },
      {
        label: '협력사 관리',
        icon: <UsersIcon />,
        to: '/partner',
        roles: ['admin', 'manager'],
        children: [
          { label: '대시보드', to: '/partner', preparing: true },
          { label: '평가지수', to: '/partner/evaluation', preparing: true },
          { label: '물량할당', to: '/partner/allocation', preparing: true },
          { label: '근태 관리', to: '/partner/attendance' },
        ],
      },
      {
        label: '생산관리',
        icon: <CalendarIcon />,
        to: '/production/plan',
        roles: ['admin', 'manager', 'gst'],
        children: [
          { label: '생산일정', to: '/production/plan' },
          { label: '생산현황', to: '/production/status' },
          { label: '생산실적', to: '/production/performance', preparing: true },
          { label: '출하이력', to: '/production/shipment', preparing: true },
        ],
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        label: 'QR 관리',
        icon: <QrIcon />,
        to: '/qr',
        roles: ['admin', 'manager', 'gst'],
        children: [
          { label: 'QR Registry', to: '/qr' },
          { label: '변경 이력', to: '/qr/changes' },
        ],
      },
      { label: '체크리스트 관리', icon: <ChecklistIcon />, to: '/checklist', roles: ['admin', 'manager', 'gst'] },
      { label: '권한 관리', icon: <ShieldIcon />, to: '/admin/permissions', roles: ['admin', 'manager'] },
      { label: '비활성 사용자', icon: <ShieldIcon />, to: '/admin/inactive', roles: ['admin'] },
    ],
  },
  {
    title: 'Analysis',
    items: [
      { label: '불량 분석', icon: <AlertIcon />, to: '/defect', preparing: true, roles: ['admin', 'gst'] },
      { label: 'CT 분석', icon: <ClockIcon />, to: '/ct', preparing: true, roles: ['admin', 'gst'] },
      { label: '사용자 분석', icon: <ChartBarIcon />, to: '/analytics', roles: ['admin'] },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { label: 'AI 예측', icon: <BellIcon />, disabled: true, roles: ['admin', 'gst'] },
      { label: 'AI 챗봇', icon: <ChatIcon />, disabled: true, roles: ['admin', 'gst'] },
    ],
  },
];

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    style={{ transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
  >
    <path d="M5 3l4 4-4 4" />
  </svg>
);

const CollapseToggleIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
    style={{ transition: 'transform 0.2s', transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}>
    <path d="M10 3L5 8l5 5" />
  </svg>
);

export default function Sidebar({ collapsed, onToggle, isMobile, mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  // ETL 변경이력 unread 카운트
  const { data: etlData } = useEtlChanges({ days: 1 });
  const etlUnreadCount = useMemo(() => {
    const changes = etlData?.changes ?? [];
    if (changes.length === 0) return 0;
    try {
      const lastSeenId = Number(localStorage.getItem('axis_view_last_seen_change_id') || '0');
      return changes.filter((c) => c.id > lastSeenId).length;
    } catch {
      return changes.length;
    }
  }, [etlData]);

  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (location.pathname.startsWith('/qr')) initial.add('QR 관리');
    if (location.pathname.startsWith('/partner')) initial.add('협력사 관리');
    if (location.pathname.startsWith('/production')) initial.add('생산관리');
    return initial;
  });

  // role 필터링 + ETL 뱃지 주입
  const dynamicNavGroups = useMemo(() => {
    const isAdmin = user?.is_admin ?? false;
    const isManager = user?.is_manager ?? false;
    const isGst = user?.company === 'GST';

    return navGroups
      .map((group) => ({
        ...group,
        items: group.items
          .filter((item) => {
            if (!item.roles) return true;
            return (item.roles.includes('admin') && isAdmin) ||
                   (item.roles.includes('manager') && isManager) ||
                   (item.roles.includes('gst') && isGst);
          })
          .map((item) => {
            if (item.label === 'QR 관리' && item.children) {
              return {
                ...item,
                children: item.children.map((child) =>
                  child.to === '/qr/changes'
                    ? { ...child, badge: etlUnreadCount }
                    : child
                ),
              };
            }
            return item;
          }),
      }))
      .filter((group) => group.items.length > 0);
  }, [etlUnreadCount, user]);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  // collapsed + children 클릭 → 펼침 전환
  const handleParentClick = (item: NavItem) => {
    if (collapsed && item.children) {
      onToggle();
      setExpandedMenus((prev) => {
        const next = new Set(prev);
        next.add(item.label);
        return next;
      });
      return;
    }
    toggleMenu(item.label);
  };

  const initials = user?.name
    ? user.name.length >= 2
      ? user.name.slice(-2)
      : user.name.charAt(0)
    : 'DK';

  const sidebarW = isMobile ? '260px' : collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';

  const sidebarContent = (
    <aside
      style={{
        width: sidebarW,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: 'var(--gx-white)',
        borderRight: '1px solid var(--gx-mist)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* 브랜드 영역 */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          padding: collapsed && !isMobile ? '0 12px' : '0 20px',
          gap: '14px',
          borderBottom: '1px solid var(--gx-mist)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: collapsed && !isMobile ? '36px' : '54px',
            height: '40px',
            flexShrink: 0,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'width 0.2s ease',
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
        {(!collapsed || isMobile) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '17px', fontWeight: 300, letterSpacing: '5px', color: 'var(--gx-charcoal)', lineHeight: 1 }}>
              AXIS-VIEW
            </span>
            <span style={{ fontSize: '8px', fontWeight: 400, letterSpacing: '0.5px', color: 'var(--gx-steel)', lineHeight: 1.2 }}>
              Manufacturing Execution Platform
            </span>
          </div>
        )}
      </div>

      {/* 네비게이션 */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {dynamicNavGroups.map((group) => (
          <div key={group.title} style={{ padding: collapsed && !isMobile ? '20px 8px 8px' : '20px 16px 8px' }}>
            {(!collapsed || isMobile) && (
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gx-steel)', padding: '0 8px', marginBottom: '8px' }}>
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
              const isCollapsedIcon = collapsed && !isMobile;

              // 완전 비활성 (자물쇠)
              if (item.disabled) {
                return (
                  <div
                    key={item.label}
                    title={isCollapsedIcon ? item.label : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: isCollapsedIcon ? 'center' : 'flex-start',
                      gap: '12px', padding: isCollapsedIcon ? '10px 0' : '10px 12px',
                      borderRadius: 'var(--radius-gx-md)', color: 'var(--gx-slate)',
                      fontSize: '13.5px', fontWeight: 500, opacity: 0.5, cursor: 'not-allowed',
                    }}
                  >
                    <span style={{ opacity: 0.6, flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                    {!isCollapsedIcon && <span style={{ flex: 1 }}>{item.label}</span>}
                    {!isCollapsedIcon && <span style={{ color: 'var(--gx-steel)', flexShrink: 0 }}><LockIcon /></span>}
                  </div>
                );
              }

              // 준비중
              if (item.preparing) {
                return (
                  <NavLink
                    key={item.label}
                    to={item.to || '/'}
                    title={isCollapsedIcon ? item.label : undefined}
                    onClick={isMobile ? onMobileClose : undefined}
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center', justifyContent: isCollapsedIcon ? 'center' : 'flex-start',
                      gap: '12px', padding: isCollapsedIcon ? '10px 0' : '10px 12px',
                      borderRadius: 'var(--radius-gx-md)',
                      color: isActive ? 'var(--gx-slate)' : 'var(--gx-slate)',
                      background: isActive ? 'var(--gx-cloud)' : 'transparent',
                      fontSize: '13.5px', fontWeight: 500, opacity: 0.5,
                      textDecoration: 'none', transition: 'all 0.15s ease',
                    })}
                  >
                    <span style={{ opacity: 0.6, flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                    {!isCollapsedIcon && <span style={{ flex: 1 }}>{item.label}</span>}
                    {!isCollapsedIcon && (
                      <span style={{ fontSize: '9px', fontWeight: 600, padding: '2px 7px', borderRadius: '10px', background: 'var(--gx-warning-bg)', color: 'var(--gx-warning)', flexShrink: 0 }}>
                        준비중
                      </span>
                    )}
                  </NavLink>
                );
              }

              // 하위 메뉴가 있는 항목
              if (item.children && item.children.length > 0) {
                const isExpanded = expandedMenus.has(item.label);
                const isChildActive = item.children.some((c) => location.pathname === c.to);

                return (
                  <div key={item.label}>
                    <button
                      onClick={() => handleParentClick(item)}
                      title={isCollapsedIcon ? item.label : undefined}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: isCollapsedIcon ? 'center' : 'flex-start',
                        gap: '12px', padding: isCollapsedIcon ? '10px 0' : '10px 12px',
                        borderRadius: 'var(--radius-gx-md)',
                        color: isChildActive ? 'var(--gx-accent)' : 'var(--gx-slate)',
                        background: 'transparent', fontSize: '13.5px', fontWeight: 500,
                        textDecoration: 'none', transition: 'all 0.15s ease',
                        width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <span style={{ opacity: isChildActive ? 1 : 0.6, flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                      {!isCollapsedIcon && <span style={{ flex: 1 }}>{item.label}</span>}
                      {!isCollapsedIcon && (
                        <span style={{ color: 'var(--gx-steel)', flexShrink: 0, display: 'flex' }}>
                          <ChevronIcon open={isExpanded} />
                        </span>
                      )}
                    </button>

                    {isExpanded && !isCollapsedIcon && (
                      <div style={{ paddingLeft: '20px', marginTop: '2px' }}>
                        {item.children.map((child) => (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            end={child.to === '/qr' || child.to === '/partner' || child.to === '/production/plan'}
                            onClick={isMobile ? onMobileClose : undefined}
                            style={({ isActive }) => ({
                              display: 'flex', alignItems: 'center', gap: '8px',
                              padding: '7px 12px', borderRadius: 'var(--radius-gx-md)',
                              color: isActive ? 'var(--gx-accent)' : 'var(--gx-steel)',
                              background: isActive ? 'var(--gx-accent-soft)' : 'transparent',
                              fontSize: '12.5px', fontWeight: isActive ? 500 : 400,
                              textDecoration: 'none', transition: 'all 0.15s ease',
                              opacity: child.preparing ? 0.5 : 1,
                            })}
                          >
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor', flexShrink: 0, opacity: 0.5 }} />
                            <span>{child.label}</span>
                            {child.badge != null && child.badge > 0 && (
                              <span style={{ fontSize: '10px', fontWeight: 700, minWidth: '18px', height: '18px', borderRadius: '9px', background: 'var(--gx-danger, #EF4444)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', flexShrink: 0, marginLeft: 'auto', lineHeight: 1 }}>
                                {child.badge}
                              </span>
                            )}
                            {child.preparing && (
                              <span style={{ fontSize: '9px', fontWeight: 600, padding: '1px 6px', borderRadius: '10px', background: 'var(--gx-warning-bg)', color: 'var(--gx-warning)', flexShrink: 0, marginLeft: 'auto' }}>
                                준비중
                              </span>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // 일반 활성 메뉴
              return (
                <NavLink
                  key={item.label}
                  to={item.to || '/'}
                  title={isCollapsedIcon ? item.label : undefined}
                  onClick={isMobile ? onMobileClose : undefined}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', justifyContent: isCollapsedIcon ? 'center' : 'flex-start',
                    gap: '12px', padding: isCollapsedIcon ? '10px 0' : '10px 12px',
                    borderRadius: 'var(--radius-gx-md)',
                    color: isActive ? 'var(--gx-accent)' : 'var(--gx-slate)',
                    background: isActive ? 'var(--gx-accent-soft)' : 'transparent',
                    fontSize: '13.5px', fontWeight: 500, textDecoration: 'none',
                    transition: 'all 0.15s ease', position: 'relative',
                  })}
                  className={({ isActive }) => isActive ? 'nav-item-active' : ''}
                >
                  {({ isActive }) => (
                    <>
                      <span style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                      {!isCollapsedIcon && <span style={{ flex: 1 }}>{item.label}</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* 사용자 카드 */}
      <div style={{ marginTop: 'auto', padding: collapsed && !isMobile ? '8px' : '16px', borderTop: '1px solid var(--gx-mist)', flexShrink: 0 }}>
        {collapsed && !isMobile ? (
          // 접힌 상태: 아바타만
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gx-accent), #818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '13px' }}>
              {initials}
            </div>
            <button onClick={logout} title="로그아웃" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gx-steel)', display: 'flex', padding: '4px' }}>
              <LogOutIcon />
            </button>
          </div>
        ) : (
          // 펼친 상태: 전체 카드
          <>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-gx-md)', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--gx-cloud)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gx-accent), #818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '13px', flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gx-charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || '관리자'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--gx-steel)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.company || 'GST'} · {user?.role || 'ADMIN'}
                </div>
              </div>
              <button
                onClick={logout}
                title="로그아웃"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gx-steel)', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px', transition: 'color 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--gx-danger)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--gx-steel)'; }}
              >
                <LogOutIcon />
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '10px', color: 'var(--gx-silver)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.5px' }}>
              {APP_VERSION}
            </div>
          </>
        )}
      </div>

      {/* 토글 버튼 — 사이드바 내부 하단 (모바일이 아닌 경우만) */}
      {!isMobile && (
        <button
          onClick={onToggle}
          className="sidebar-toggle-btn"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '6px',
            width: '100%',
            padding: '10px 0',
            background: 'transparent',
            border: 'none', borderTop: '1px solid var(--gx-mist)',
            cursor: 'pointer', color: 'var(--gx-steel)',
            fontSize: '11px', fontWeight: 500,
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--gx-cloud)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--gx-accent)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--gx-steel)';
          }}
        >
          <CollapseToggleIcon collapsed={collapsed} />
          {(!collapsed) && <span>사이드바 접기</span>}
        </button>
      )}
    </aside>
  );

  // 모바일: 오버레이 + 슬라이드 인
  if (isMobile) {
    if (!mobileOpen) return null;
    return (
      <>
        <div
          onClick={onMobileClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99, transition: 'opacity 0.2s' }}
        />
        {sidebarContent}
      </>
    );
  }

  return sidebarContent;
}
