// src/api/etl.ts
// ETL 변경 이력 API 호출

import apiClient from './client';

export interface EtlChangesParams {
  days?: number;
  field?: string;
  serial_number?: string;
  limit?: number;
}

export interface ChangeLogEntry {
  id: number;
  serial_number: string;
  sales_order: string | null;
  model: string;
  field_name: string;
  field_label: string;
  old_value: string;
  new_value: string;
  changed_at: string;
}

export interface EtlChangesSummary {
  total_changes: number;
  by_field: Record<string, number>;
}

export interface EtlChangesResponse {
  changes: ChangeLogEntry[];
  summary: EtlChangesSummary;
}

export async function getEtlChanges(params: EtlChangesParams = {}): Promise<EtlChangesResponse> {
  const searchParams = new URLSearchParams();

  if (params.days) searchParams.set('days', String(params.days));
  if (params.field) searchParams.set('field', params.field);
  if (params.serial_number) searchParams.set('serial_number', params.serial_number);
  if (params.limit) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  const url = `/api/admin/etl/changes${query ? `?${query}` : ''}`;

  const { data } = await apiClient.get<EtlChangesResponse>(url);
  return data;
}
