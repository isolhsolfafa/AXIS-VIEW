// app/src/components/checklist/__tests__/ChecklistEditModal.test.tsx
// Sprint 42 hotfix v1.43.1 — 방향 A 자재코드 input + spec 표시 + 자재 검색 도움 버튼 TC
// v1.43.4 (Codex M-02): SELECT 항목 최소 1자재 invariant TC 추가

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as materialsApi from '@/api/materials';
import type { ChecklistMasterItem } from '@/types/checklist';
import type { Material, MaterialListResponse } from '@/api/materials';
import ChecklistEditModal from '@/components/checklist/ChecklistEditModal';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

// Codex [신규-1]: QueryClientProvider wrapper 헬퍼 (useQuery 사용 영역 필수)
const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

// M GAP-F: ChecklistMasterItem 필수 필드 헬퍼 (strict: true 빌드 통과)
const mockItem = (overrides: Partial<ChecklistMasterItem> = {}): ChecklistMasterItem => ({
  id: 42,
  product_code: 'COMMON',
  category: 'MECH',
  item_group: 'GN2',
  item_name: 'MFC Maker',
  item_type: 'SELECT',
  item_order: 1,
  description: null,
  is_active: true,
  phase1_applicable: false,
  qi_check_required: false,
  select_options: [12, 14, 18],
  remarks: null,
  ...overrides,
});

const mockMaterial = (overrides: Partial<Material>): Material => ({
  id: 0,
  item_code: '',
  item_name: '',
  is_active: true,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
  ...overrides,
});

const mockMaterialsResponse: MaterialListResponse = {
  items: [
    mockMaterial({ id: 12, item_code: '1110006700', item_name: 'MFC', category: 'MFC', spec_1: 'MRC | 25 SLM', spec_2: 'P:0.2~1', description: 'LNG' }),
    mockMaterial({ id: 14, item_code: '1120094300', item_name: 'MFC', category: 'MFC', spec_1: 'HORIBA | 50 SLM', spec_2: 'P:1~1.5', description: 'LNG' }),
    mockMaterial({ id: 18, item_code: '1110298800', item_name: 'MFC', category: 'MFC', spec_1: 'MKP | 50 SLM', spec_2: 'P:0.3~2.5 / W:0.3', description: 'LNG', is_active: false }),
  ],
  total: 3,
  page: 1,
};

describe('ChecklistEditModal — 방향 A 자재코드 input 영역 (HOTFIX-SPRINT42 v1.43.1)', () => {
  beforeEach(() => {
    vi.spyOn(materialsApi, 'listMaterials').mockResolvedValue(mockMaterialsResponse);
  });

  test('자재코드 input 변경 + debounce → matched 자재 spec 표시 + [비활성] marker', async () => {
    renderWithQueryClient(
      <ChecklistEditModal item={mockItem()} category="MECH" onSubmit={vi.fn()} onClose={vi.fn()} />
    );

    // hydrate useEffect 가 numeric id → item_code 변환 → input 자동 채워짐
    // 또는 사용자 직접 입력 trigger (debounce 500ms 대기)
    const input = await screen.findByPlaceholderText(/1110006700/);
    fireEvent.change(input, { target: { value: '1110006700, 1120094300, 1110298800' } });

    // Codex [9]: waitFor 2000ms (debounce 500ms + query + render 합산, CI flaky 방지)
    await waitFor(() => {
      // A-5차-2: regex 매칭 (실 jsx = "✓ 1110006700 = MFC | MRC | 25 SLM | P:0.2~1" 단일 텍스트 노드)
      expect(screen.getByText(/1110006700.*MRC \| 25 SLM/)).toBeInTheDocument();
      expect(screen.getByText(/1120094300.*HORIBA \| 50 SLM/)).toBeInTheDocument();
      expect(screen.getByText('[비활성]')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('미등록 자재코드 → 빨간색 marker (✗ 표시)', async () => {
    renderWithQueryClient(
      <ChecklistEditModal item={mockItem({ select_options: [] })} category="MECH" onSubmit={vi.fn()} onClose={vi.fn()} />
    );

    const input = await screen.findByPlaceholderText(/1110006700/);
    fireEvent.change(input, { target: { value: '1110006700, 9999999999' } });

    await waitFor(() => {
      expect(screen.getByText(/9999999999.*미등록 자재/)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('🔍 자재 검색 도움 버튼 클릭 → ChecklistOptionMapModal 호출', async () => {
    renderWithQueryClient(
      <ChecklistEditModal item={mockItem()} category="MECH" onSubmit={vi.fn()} onClose={vi.fn()} />
    );

    // A-5차-1: button 텍스트 "자재 검색 도움" (방향 A jsx 정합)
    const helpButton = await screen.findByText(/자재 검색 도움/);
    fireEvent.click(helpButton);

    // I2: specific selector — getByRole + dialog (label 영역 매칭 회피)
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /자재 매핑/ })).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});

describe('ChecklistEditModal — Codex 사후 검토 M-02 (v1.43.4)', () => {
  beforeEach(() => {
    vi.spyOn(materialsApi, 'listMaterials').mockResolvedValue(mockMaterialsResponse);
    vi.mocked(toast.error).mockClear();
  });

  test('SELECT 항목인데 매핑 0개 + 다른 필드만 수정 후 저장 → toast.error + onSubmit 미호출', async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    renderWithQueryClient(
      <ChecklistEditModal
        item={mockItem({ select_options: [] })}
        category="MECH"
        onSubmit={onSubmit}
        onClose={onClose}
      />
    );

    // 항목명만 변경
    const nameInput = screen.getByDisplayValue('MFC Maker');
    fireEvent.change(nameInput, { target: { value: 'MFC Maker 변경' } });

    // 저장 클릭 (자재코드 input 은 비워둠)
    const saveButton = screen.getByText('저장');
    fireEvent.click(saveButton);

    // M-02 invariant: toast.error 호출 + onSubmit 차단
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('SELECT 항목은 최소 1자재 매핑이 필요합니다')
      );
    });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  test('SELECT 항목 기존 매핑 1+ 개 + 다른 필드만 수정 후 저장 → 차단 없이 진행', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    renderWithQueryClient(
      <ChecklistEditModal
        item={mockItem({ select_options: [12] })}
        category="MECH"
        onSubmit={onSubmit}
        onClose={onClose}
      />
    );

    const nameInput = screen.getByDisplayValue('MFC Maker');
    fireEvent.change(nameInput, { target: { value: 'MFC Maker v2' } });

    const saveButton = screen.getByText('저장');
    fireEvent.click(saveButton);

    // 기존 매핑 1개 — M-02 차단 X, onSubmit 정상 호출
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ item_name: 'MFC Maker v2' })
      );
    });
    expect(toast.error).not.toHaveBeenCalledWith(
      expect.stringContaining('SELECT 항목은 최소 1자재')
    );
  });
});
