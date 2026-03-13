// src/App.tsx
// 라우터 설정 — 페이지별 Role 기반 접근 제어

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import AttendancePage from '@/pages/attendance/AttendancePage';
import PartnerDashboardPage from '@/pages/partner/PartnerDashboardPage';
import PartnerEvaluationPage from '@/pages/partner/PartnerEvaluationPage';
import PartnerAllocationPage from '@/pages/partner/PartnerAllocationPage';
import QrManagementPage from '@/pages/qr/QrManagementPage';
import EtlChangeLogPage from '@/pages/qr/EtlChangeLogPage';
import FactoryDashboardPage from '@/pages/factory/FactoryDashboardPage';
import ProductionPlanPage from '@/pages/plan/ProductionPlanPage';
import ProductionPerformancePage from '@/pages/production/ProductionPerformancePage';
import ShipmentHistoryPage from '@/pages/production/ShipmentHistoryPage';
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

        {/* ── 협력사 관리 (admin + manager — GST 일반 제외) ── */}
        <Route
          path="/partner"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <PartnerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/evaluation"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <PartnerEvaluationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/allocation"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <PartnerAllocationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/attendance"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />

        {/* 기존 /attendance → /partner/attendance 리다이렉트 */}
        <Route path="/attendance" element={<Navigate to="/partner/attendance" replace />} />

        {/* ── QR 관리 (VIEW 전체 — GST 전직원 + 협력사 manager) ── */}
        <Route
          path="/qr"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'gst']}>
              <QrManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/qr/changes"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'gst']}>
              <EtlChangeLogPage />
            </ProtectedRoute>
          }
        />
        {/* ── 생산관리 (VIEW 전체) ── */}
        <Route
          path="/production/plan"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'gst']}>
              <ProductionPlanPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/production/performance"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'gst']}>
              <ProductionPerformancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/production/shipment"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'gst']}>
              <ShipmentHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* 기존 /plan → /production/plan 리다이렉트 */}
        <Route path="/plan" element={<Navigate to="/production/plan" replace />} />

        {/* ── 공장 대시보드 / 분석 (GST 전용 — 협력사 차단) ── */}
        <Route
          path="/factory"
          element={
            <ProtectedRoute allowedRoles={['admin', 'gst']}>
              <FactoryDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/defect"
          element={
            <ProtectedRoute allowedRoles={['admin', 'gst']}>
              <DefectAnalysisPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ct"
          element={
            <ProtectedRoute allowedRoles={['admin', 'gst']}>
              <CtAnalysisPage />
            </ProtectedRoute>
          }
        />

        {/* ── 권한 관리 (admin + manager — GST 일반 제외) ── */}
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
