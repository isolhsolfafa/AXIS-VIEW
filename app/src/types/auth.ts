// src/types/auth.ts
// 인증 관련 TypeScript 타입 정의

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  worker: Worker;
}

export interface Worker {
  id: number;
  name: string;
  email: string;
  role: string;
  company: string;
  is_admin: boolean;
  is_manager: boolean;
  approval_status: string;
  email_verified: boolean;
}

// 하위 호환
export type User = Worker;
