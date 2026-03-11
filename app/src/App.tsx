// src/App.tsx
// 라우터 설정 — 페이지별 Role 기반 접근 제어

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import AttendancePage from '@/pages/attendance/AttendancePage';
import QrManagementPage from '@/pages/qr/QrManagementPage';
import EtlChangeLogPage from '@/pages/qr/EtlChangeLogPage';
import FactoryDashboardPage from '@/pages/factory/FactoryDashboardPage';
import ProductionPlanPage from '@/pages/plan/ProductionPlanPage';
import DefectAnalysisPage from '@/pages/defect/DefectAnalysisPage';
import CtAnalysisPage from '@/pages/ct/CtAnalysisPage';
import PermissionsPage from '@/pages/admin/PermissionsPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gx-cloud flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl font-bold text-gx-mist mb-3">404</p>
        <p className="text-gx-steel text-sm">페이지를 찾을 수 없습니다</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 루트 → 로그인으로 */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 로그인 (비인증 전용 처리는 LoginPage 내부 useEffect에서) */}
        <Route path="/login" element={<LoginPage />} />

        {/* 접근 거부 페이지 */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* ── admin + manager 공통 ── */}
        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/qr"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <QrManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/qr/changes"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <EtlChangeLogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plan"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <ProductionPlanPage />
            </ProtectedRoute>
          }
        />

        {/* ── admin only ── */}
        <Route
          path="/factory"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <FactoryDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/defect"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DefectAnalysisPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ct"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CtAnalysisPage />
            </ProtectedRoute>
          }
        />

        {/* ── 권한 관리 (admin + manager) ── */}
        <Route
          path="/admin/permissions"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <PermissionsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
