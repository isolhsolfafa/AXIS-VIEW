// src/api/qr.ts
// QR 관리 API 호출

import apiClient from './client';
import type { QrListResponse, QrListParams } from '@/types/qr';

export async function getQrList(params: QrListParams = {}): Promise<QrListResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set('search', params.search);
  if (params.model) searchParams.set('model', params.model);
  if (params.status) searchParams.set('status', params.status);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.per_page) searchParams.set('per_page', String(params.per_page));
  if (params.sort_by) searchParams.set('sort_by', params.sort_by);
  if (params.sort_order) searchParams.set('sort_order', params.sort_order);
  if (params.date_field) searchParams.set('date_field', params.date_field);
  if (params.date_from) searchParams.set('date_from', params.date_from);
  if (params.date_to) searchParams.set('date_to', params.date_to);

  const query = searchParams.toString();
  const url = `/api/admin/qr/list${query ? `?${query}` : ''}`;

  const { data } = await apiClient.get<QrListResponse>(url);
  return data;
}
