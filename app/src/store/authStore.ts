// src/store/authStore.ts
// 인증 상태 전역 관리 — React Context + localStorage

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Worker } from '@/types/auth';
import { login as loginApi } from '@/api/auth';
import apiClient, { LOCAL_KEYS } from '@/api/client';

interface AuthState {
  user: Worker | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // 앱 마운트 시 localStorage에서 인증 상태 복원
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem(LOCAL_KEYS.ACCESS);
    const userJson = localStorage.getItem(LOCAL_KEYS.USER);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as Worker;
        setState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        // JSON 파싱 실패 시 초기화
        localStorage.removeItem(LOCAL_KEYS.ACCESS);
        localStorage.removeItem(LOCAL_KEYS.REFRESH);
        localStorage.removeItem(LOCAL_KEYS.USER);
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const data = await loginApi(email, password);
      localStorage.setItem(LOCAL_KEYS.ACCESS, data.access_token);
      localStorage.setItem(LOCAL_KEYS.REFRESH, data.refresh_token);
      localStorage.setItem(LOCAL_KEYS.USER, JSON.stringify(data.worker));
      setState({ user: data.worker, isAuthenticated: true, isLoading: false });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logoutRef = React.useRef(false); // BUG-1 fix: 중복 logout 방지

  const logout = useCallback(async () => {
    if (logoutRef.current) return; // 이미 로그아웃 진행 중
    logoutRef.current = true;
    try {
      const token = localStorage.getItem(LOCAL_KEYS.ACCESS);
      if (token) {
        // timeout으로 BE 응답 지연/실패 시 빠르게 포기
        await Promise.race([
          apiClient.post('/api/auth/logout'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
        ]);
      }
    } catch (e) {
      console.warn('Logout API failed (ignored):', e);
    }
    localStorage.removeItem(LOCAL_KEYS.ACCESS);
    localStorage.removeItem(LOCAL_KEYS.REFRESH);
    localStorage.removeItem(LOCAL_KEYS.USER);
    setState({ user: null, isAuthenticated: false, isLoading: false });
    logoutRef.current = false;
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    checkAuth,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export default AuthContext;
