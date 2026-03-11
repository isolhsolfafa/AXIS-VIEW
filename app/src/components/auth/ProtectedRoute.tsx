// src/components/auth/ProtectedRoute.tsx
// 인증 가드 — 비인증 또는 권한 없는 사용자 접근 차단
// allowedRoles 미지정 시 기존 동작 유지 (is_admin || is_manager)

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'manager')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
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

  // role 기반 접근 제어 (GST 소속은 전체 접근 허용)
  const isGst = user?.company === 'GST';
  if (allowedRoles) {
    const hasAccess =
      isGst ||
      (allowedRoles.includes('admin') && user?.is_admin) ||
      (allowedRoles.includes('manager') && user?.is_manager);
    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  } else {
    // allowedRoles 미지정 → is_admin || is_manager || GST
    if (!user?.is_admin && !user?.is_manager && !isGst) {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}
