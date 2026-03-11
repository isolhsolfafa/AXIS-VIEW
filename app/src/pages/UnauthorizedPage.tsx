// src/pages/UnauthorizedPage.tsx
// 접근 권한 부족 시 표시되는 페이지

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/authStore';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // manager → 협력사 대시보드, admin → 협력사 대시보드
  const defaultPath = '/attendance';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--gx-cloud)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--gx-white)',
          borderRadius: 'var(--radius-gx-xl)',
          padding: '40px 36px',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
        }}
      >
        {/* 아이콘 */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--gx-warning-bg, rgba(245,158,11,0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gx-warning, #F59E0B)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>

        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--gx-charcoal)',
            margin: '0 0 8px',
          }}
        >
          접근 권한이 없습니다
        </h2>

        <p
          style={{
            fontSize: '14px',
            color: 'var(--gx-slate)',
            margin: '0 0 8px',
            lineHeight: 1.6,
          }}
        >
          이 페이지는 현재 계정의 권한으로 접근할 수 없습니다.
        </p>

        {user && (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--gx-steel)',
              margin: '0 0 24px',
            }}
          >
            현재 계정: {user.name} ({user.company})
          </p>
        )}

        <button
          onClick={() => navigate(defaultPath, { replace: true })}
          style={{
            width: '100%',
            height: '44px',
            background: 'var(--gx-accent)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-gx-md)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          대시보드로 돌아가기
        </button>
      </div>
    </div>
  );
}
