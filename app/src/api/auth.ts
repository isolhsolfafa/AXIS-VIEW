// src/api/auth.ts
// 인증 API — 로그인, 토큰 갱신

import apiClient, { getDeviceId } from './client';
import type { LoginResponse } from '@/types/auth';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * Mock 로그인 — 개발용, VITE_USE_MOCK=true일 때 사용
 */
async function mockLogin(email: string, password: string): Promise<LoginResponse> {
  await new Promise((r) => setTimeout(r, 500)); // 네트워크 지연 시뮬레이션

  // 아무 이메일/비밀번호나 입력하면 관리자로 로그인
  if (!email || !password) {
    throw new Error('이메일과 비밀번호를 입력해주세요.');
  }

  return {
    access_token: 'mock_access_token_' + Date.now(),
    refresh_token: 'mock_refresh_token_' + Date.now(),
    worker: {
      id: 1,
      name: '관리자',
      email,
      role: 'ADMIN',
      company: 'GST',
      is_admin: true,
      is_manager: true,
      approval_status: 'approved',
      email_verified: true,
    },
  };
}

/**
 * 로그인 API
 * is_admin 또는 is_manager가 아니면 에러를 throw
 * - GST 관리자: is_admin=true → 접속 가능
 * - 협력사 관리자: is_manager=true → 접속 가능
 * - 일반 작업자: 둘 다 false → 접속 차단
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  if (USE_MOCK) {
    return mockLogin(email, password);
  }

  // prefix 로그인: @ 없으면 BE가 prefix로 자동 매칭
  const loginEmail = email.includes('@') ? email : email.trim();

  const response = await apiClient.post<LoginResponse>('/api/auth/login', {
    email: loginEmail,
    password,
    device_id: getDeviceId(),
  });

  const data = response.data;

  if (!data.worker.is_admin && !data.worker.is_manager && data.worker.company !== 'GST') {
    throw new Error('대시보드 접근 권한이 없습니다. 관리자 또는 협력사 관리자 계정으로 로그인해주세요.');
  }

  return data;
}

/**
 * 액세스 토큰 갱신 API
 */
export async function refreshToken(refresh: string): Promise<{ access_token: string; refresh_token?: string }> {
  const response = await apiClient.post('/api/auth/refresh', {
    refresh_token: refresh,
    device_id: getDeviceId(),
  });
  return response.data;
}
