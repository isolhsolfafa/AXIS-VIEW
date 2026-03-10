// src/types/announcement.ts
// 공지사항 관련 TypeScript 타입 정의

export type AnnouncementPriority = 'normal' | 'important' | 'urgent';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  version: string;
  is_pinned: boolean;
  created_by: number;
  author_name: string;
  created_at: string;       // ISO8601
  updated_at: string;       // ISO8601
}

export interface NoticeListResponse {
  notices: Announcement[];
  total: number;
  page: number;
  limit: number;
}
