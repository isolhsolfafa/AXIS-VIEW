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
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 갱신 중이면 대기 후 재시도
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
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
        refreshSubscribers = [];
        // 토큰 갱신 실패 → 로그아웃 처리
        localStorage.removeItem(LOCAL_KEYS.ACCESS);
        localStorage.removeItem(LOCAL_KEYS.REFRESH);
        localStorage.removeItem(LOCAL_KEYS.USER);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { LOCAL_KEYS };
