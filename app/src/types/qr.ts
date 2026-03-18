// src/types/qr.ts
// QR 관리 페이지 타입 정의

export interface QrRecord {
  qr_id: number;
  qr_doc_id: string;
  serial_number: string;
  status: 'active' | 'shipped' | 'revoked';
  qr_type: 'PRODUCT' | 'TANK';
  parent_qr_doc_id: string | null;
  qr_created_at: string | null;
  model: string;
  sales_order: string;
  customer: string;
  mech_partner: string;
  elec_partner: string;
  mech_start: string | null;
  module_start: string | null;
  ship_plan_date: string | null;
  prod_date: string | null;
}

export interface QrStats {
  total: number;
  active: number;
  shipped: number;
  revoked: number;
}

export interface QrListResponse {
  items: QrRecord[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  models: string[];
  stats: QrStats;
}

export interface QrListParams {
  search?: string;
  model?: string;
  status?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  date_field?: 'mech_start' | 'module_start';
  date_from?: string;
  date_to?: string;
}
