// src/components/auth/ProtectedRoute.tsx
// 인증 가드 — 비인증 또는 권한 없는 사용자 접근 차단
// 접근 허용: is_admin(GST 관리자) 또는 is_manager(협력사 관리자)

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // 인증 확인 중 로딩 스피너
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gx-cloud flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gx-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gx-steel">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // 비인증 → 로그인으로
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 관리자 또는 협력사 관리자가 아닌 경우 → 로그인으로
  if (!user?.is_admin && !user?.is_manager) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
