// src/api/production.ts
// 생산실적 API 호출

import apiClient from './client';
import type {
  PerformanceResponse, ConfirmRequest, ConfirmResponse,
  CancelConfirmResponse, MonthlySummaryResponse, ConfirmRecord,
} from '@/types/production';

export async function getPerformance(week?: string, month?: string): Promise<PerformanceResponse> {
  const params = new URLSearchParams();
  if (week) params.set('week', week);
  if (month) params.set('month', month);
  const query = params.toString();
  const { data } = await apiClient.get<PerformanceResponse>(
    `/api/admin/production/performance${query ? `?${query}` : ''}`,
  );

  // BE→FE 변환: partner_info 구성 + confirms 배열 변환
  data.orders = (data.orders ?? []).map(order => {
    const raw = order as any;

    // partner_info: BE flat → FE 객체
    const partnerInfo = order.partner_info ?? {
      mech: raw.mech_partner || '—',
      elec: raw.elec_partner || '—',
      mixed: (raw.mech_partner || '') !== (raw.elec_partner || ''),
    };

    // confirms: processes 내부 confirmed → ConfirmRecord[]
    const confirms: ConfirmRecord[] = order.confirms ?? [];
    if (confirms.length === 0 && order.processes) {
      for (const [pt, v] of Object.entries(order.processes)) {
        if (v?.confirmed) {
          confirms.push({
            id: v.confirm_id ?? 0,
            process_type: pt as any,
            confirmed_week: '',
            confirmed_by: v.confirmed_by ?? '',
            confirmed_at: v.confirmed_at ?? '',
          });
        }
      }
    }

    return { ...order, partner_info: partnerInfo, confirms };
  });

  return data;
}

export async function confirmProduction(body: ConfirmRequest): Promise<ConfirmResponse> {
  const { data } = await apiClient.post<ConfirmResponse>(
    '/api/admin/production/confirm', body,
  );
  return data;
}

export async function cancelConfirm(confirmId: number): Promise<CancelConfirmResponse> {
  const { data } = await apiClient.delete<CancelConfirmResponse>(
    `/api/admin/production/confirm/${confirmId}`,
  );
  return data;
}

export async function getMonthlySummary(month?: string): Promise<MonthlySummaryResponse> {
  const query = month ? `?month=${month}` : '';
  const { data } = await apiClient.get<MonthlySummaryResponse>(
    `/api/admin/production/monthly-summary${query}`,
  );
  return data;
}
