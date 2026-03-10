// src/api/notices.ts
// 공지사항 API 호출 — GET /api/notices

import apiClient from './client';
import type { NoticeListResponse } from '@/types/announcement';

export interface NoticeListParams {
  page?: number;
  limit?: number;
  is_pinned?: boolean;
}

export async function getNotices(params: NoticeListParams = {}): Promise<NoticeListResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.is_pinned !== undefined) searchParams.set('is_pinned', String(params.is_pinned));

  const query = searchParams.toString();
  const url = `/api/notices${query ? `?${query}` : ''}`;

  const { data } = await apiClient.get<NoticeListResponse>(url);
  return data;
}
