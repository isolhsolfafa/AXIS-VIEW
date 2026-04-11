// src/pages/LoginPage.tsx
// 관리자 로그인 페이지 — G-AXIS 디자인 시스템 완전 적용

import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/store/authStore';
import logoImage from '@/assets/images/g-axis-2.png';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // 모든 역할 → 공장 대시보드 (Summary)
      navigate('/factory', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('이메일(또는 관리자 ID)과 비밀번호를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('로그인 성공');
      // navigate는 useEffect에서 user 상태 변경 시 자동 처리
    } catch (err: unknown) {
      // 한글 에러 메시지 매핑 — 시스템 영문 메시지 사용자 노출 방지
      const raw = err instanceof Error ? err.message : '';
      const status = (err as any)?.response?.status;
      const msg = raw.includes('대시보드 접근 권한이 없습니다')
        ? raw
        : status === 401
          ? '이메일 또는 비밀번호가 올바르지 않습니다.'
          : status === 403
            ? '접근 권한이 없습니다. 관리자에게 문의해주세요.'
            : status === 404
              ? '등록되지 않은 계정입니다.'
              : status === 429
                ? '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.'
                : status >= 500
                  ? '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
                  : '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';

      // 권한 없는 사용자 → 모달 팝업
      if (msg.includes('대시보드 접근 권한이 없습니다')) {
        setShowAccessDenied(true);
        return;
      }

      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as unknown as FormEvent);
    }
  };

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
          maxWidth: '420px',
          background: 'var(--gx-white)',
          borderRadius: 'var(--radius-gx-xl)',
          padding: '40px 36px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* 로고 + 브랜드 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '80px',
              height: '60px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
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
          <span
            style={{
              fontSize: '20px',
              fontWeight: 300,
              letterSpacing: '6px',
              color: 'var(--gx-charcoal)',
              lineHeight: 1,
            }}
          >
            AXIS-VIEW
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 400,
              letterSpacing: '0.5px',
              color: 'var(--gx-steel)',
              marginTop: '6px',
            }}
          >
            Manufacturing Execution Platform
          </span>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--gx-slate)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              이메일
            </label>
            <input
              type="text"
              placeholder="이메일 또는 관리자 ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocusEmail(true)}
              onBlur={() => setFocusEmail(false)}
              disabled={submitting}
              autoComplete="email"
              autoFocus
              style={{
                height: '42px',
                padding: '0 14px',
                fontSize: '14px',
                color: 'var(--gx-charcoal)',
                background: 'var(--gx-white)',
                border: `1px solid ${focusEmail ? 'var(--gx-accent)' : 'var(--gx-mist)'}`,
                borderRadius: 'var(--radius-gx-md)',
                outline: 'none',
                boxShadow: focusEmail ? '0 0 0 3px var(--gx-accent-glow)' : 'none',
                transition: 'all 0.15s ease',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--gx-slate)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              비밀번호
            </label>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocusPassword(true)}
              onBlur={() => setFocusPassword(false)}
              disabled={submitting}
              autoComplete="current-password"
              style={{
                height: '42px',
                padding: '0 14px',
                fontSize: '14px',
                color: 'var(--gx-charcoal)',
                background: 'var(--gx-white)',
                border: `1px solid ${focusPassword ? 'var(--gx-accent)' : 'var(--gx-mist)'}`,
                borderRadius: 'var(--radius-gx-md)',
                outline: 'none',
                boxShadow: focusPassword ? '0 0 0 3px var(--gx-accent-glow)' : 'none',
                transition: 'all 0.15s ease',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-gx-md)',
                background: 'var(--gx-danger-bg)',
                color: 'var(--gx-danger)',
                fontSize: '13px',
              }}
            >
              {error}
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              height: '44px',
              background: submitting ? 'var(--gx-silver)' : 'var(--gx-accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-gx-md)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
              marginTop: '4px',
            }}
          >
            {submitting ? (
              <>
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }}
                />
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            fontSize: '11px',
            color: 'var(--gx-steel)',
            marginTop: '20px',
          }}
        >
          관리자 및 협력사 관리자 계정으로 접근 가능합니다
        </p>
      </div>

      {/* 접근 권한 없음 모달 */}
      {showAccessDenied && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '0 16px',
          }}
          onClick={() => setShowAccessDenied(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              background: 'var(--gx-white)',
              borderRadius: 'var(--radius-gx-xl)',
              padding: '32px 28px 24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 아이콘 */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--gx-danger-bg, #FEF2F2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gx-danger, #DC2626)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h3
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--gx-charcoal)',
                margin: '0 0 8px',
              }}
            >
              접근 권한 없음
            </h3>

            <p
              style={{
                fontSize: '14px',
                color: 'var(--gx-slate)',
                margin: '0 0 8px',
                lineHeight: 1.5,
              }}
            >
              대시보드는 <strong>관리자</strong> 또는 <strong>협력사 관리자</strong>만
              접근할 수 있습니다.
            </p>

            <p
              style={{
                fontSize: '12px',
                color: 'var(--gx-steel)',
                margin: '0 0 24px',
                lineHeight: 1.5,
              }}
            >
              접근 권한이 필요하시면 관리자에게 문의하세요.
            </p>

            <button
              onClick={() => setShowAccessDenied(false)}
              style={{
                width: '100%',
                height: '42px',
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
              확인
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
