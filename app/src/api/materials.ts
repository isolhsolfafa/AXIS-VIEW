// src/api/materials.ts
// 자재 마스터 API — Sprint 42 (FEAT-AXIS-VIEW-MATERIALS-AND-CHECKLISTS-MGMT-20260507)
// OPS Sprint 66-BE Step 4 별 repo 분리 영역

import apiClient from './client';

export interface Material {
  id: number;
  item_code: string;
  item_name: string;
  category?: string;
  spec_1?: string;
  spec_2?: string;
  unit?: string;
  description?: string;     // MFC 가스 종류 LNG/CDA/O2/N2/'LNG,O2' — admin select_options 매핑 시 ILIKE 검색 보조
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaterialListResponse {
  items: Material[];
  total: number;
  page: number;
}

export interface MaterialChange {
  item_code: string;
  field: string;
  before: string | null;
  after: string | null;
}

export interface UploadPreview {
  new_materials: Material[];
  changed_materials: Array<{ item_code: string; before: Material; after: Partial<Material>; changes: MaterialChange[] }>;
  unchanged_materials: Material[];
  bom_mappings_new: number;
}

export interface UploadResult {
  inserted: number;
  updated: number;
  skipped: number;
  rejected: number;
  errors?: Array<{ row: number; reason: string }>;
}

export interface DeactivateResult {
  deactivated: boolean;
  mappings_kept: Array<{ id: number; item_name: string }>;
  note: string;
}

// ── CRUD ──

export async function listMaterials(params: {
  category?: string;
  keyword?: string;
  description?: string;  // 가스 필터 (ILIKE '%LNG%' 영역)
  page: number;
  per_page: number;
}): Promise<MaterialListResponse> {
  const { data } = await apiClient.get<MaterialListResponse>(
    '/api/admin/materials',
    { params },
  );
  return data;
}

export async function createMaterial(payload: Partial<Material>): Promise<Material> {
  const { data } = await apiClient.post<Material>('/api/admin/materials', payload);
  return data;
}

export async function updateMaterial(id: number, payload: Partial<Material>): Promise<Material> {
  const { data } = await apiClient.patch<Material>(`/api/admin/materials/${id}`, payload);
  return data;
}

export async function deactivateMaterial(id: number): Promise<DeactivateResult> {
  const { data } = await apiClient.patch<DeactivateResult>(`/api/admin/materials/${id}/deactivate`);
  return data;
}

// ── Excel 업로드 (FormData multipart 통일 — Codex M-NEW-1) ──

export async function uploadMaterialsPreview(file: File): Promise<UploadPreview> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('mode', 'preview');
  const { data } = await apiClient.post<UploadPreview>(
    '/api/admin/materials/upload', fd,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

export async function uploadMaterialsCommit(
  file: File,
  strategy: 'all' | 'selected' | 'skip',
  selectedItemCodes?: string[],  // Codex A-NEW-2: 'selected' 시 사용자 선택 영역 (item_code 기준 stable key)
): Promise<UploadResult> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('mode', 'commit');
  fd.append('strategy', strategy);
  if (selectedItemCodes && strategy === 'selected') {
    fd.append('selected_item_codes', JSON.stringify(selectedItemCodes));
  }
  const { data } = await apiClient.post<UploadResult>(
    '/api/admin/materials/upload', fd,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}
