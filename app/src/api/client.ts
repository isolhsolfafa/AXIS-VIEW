// src/api/client.ts
// Axios 인스턴스 설정 + JWT 인터셉터 (자동 토큰 갱신)

import axios from 'axios';

const LOCAL_KEYS = {
  ACCESS: 'axis_view_access_token',
  REFRESH: 'axis_view_refresh_token',
  USER: 'axis_view_user',
};

export function getDeviceId(): string {
  const KEY = 'axis_view_device_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: Authorization 헤더 주입
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(LOCAL_KEYS.ACCESS);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Device-ID'] = getDeviceId();
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 시 토큰 갱신 후 원래 요청 재시도
let isRefreshing = false;
let isForceLogout = false; // BUG-1 fix: refresh 실패 후 중복 로그아웃 방지
let refreshSubscribers: Array<(token: string) => void> = [];

// auth 관련 URL은 401 retry 제외 (logout, refresh, login)
const AUTH_SKIP_URLS = ['/api/auth/logout', '/api/auth/refresh', '/api/auth/login'];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function forceLogout() {
  if (isForceLogout) return; // 중복 실행 차단
  isForceLogout = true;
  localStorage.removeItem(LOCAL_KEYS.ACCESS);
  localStorage.removeItem(LOCAL_KEYS.REFRESH);
  localStorage.removeItem(LOCAL_KEYS.USER);
  window.location.href = '/login';
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';

    // auth 관련 요청은 401 retry 하지 않음 (logout storm 방지)
    if (AUTH_SKIP_URLS.some(url => requestUrl.includes(url))) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      // 이미 강제 로그아웃 중이면 바로 reject
      if (isForceLogout) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // 갱신 중이면 대기 후 재시도
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            if (!token) {
              reject(error);
              return;
            }
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem(LOCAL_KEYS.REFRESH);
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/refresh`,
          { refresh_token: refreshToken, device_id: getDeviceId() }
        );

        const { access_token, refresh_token: newRefreshToken } = response.data;
        localStorage.setItem(LOCAL_KEYS.ACCESS, access_token);
        if (newRefreshToken) {
          localStorage.setItem(LOCAL_KEYS.REFRESH, newRefreshToken);
        }

        isRefreshing = false;
        onRefreshed(access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        // 대기 중이던 요청들에게 실패 알림 (빈 토큰)
        refreshSubscribers.forEach((cb) => cb(''));
        refreshSubscribers = [];
        // localStorage 정리 + 리다이렉트 (BE logout API 호출 안 함)
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { LOCAL_KEYS };
