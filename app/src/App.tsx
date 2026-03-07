// src/App.tsx
// 라우터 설정 — 로그인, 출퇴근 대시보드, 404

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import AttendancePage from '@/pages/attendance/AttendancePage';
import QrManagementPage from '@/pages/qr/QrManagementPage';
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

        {/* 출퇴근 대시보드 (관리자 전용) */}
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />

        {/* QR 관리 (관리자/매니저 전용) */}
        <Route
          path="/qr"
          element={
            <ProtectedRoute>
              <QrManagementPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
