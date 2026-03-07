// src/types/announcement.ts
// 공지사항 관련 TypeScript 타입 정의

export type AnnouncementPriority = 'normal' | 'important' | 'urgent';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  is_active: boolean;
  created_by: string;       // 작성자 이름
  created_at: string;       // ISO8601
  updated_at: string;       // ISO8601
}

export interface AnnouncementListResponse {
  announcements: Announcement[];
  total: number;
}
