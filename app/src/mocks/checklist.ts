// src/mocks/checklist.ts
// MECH 체크리스트 목업 데이터 — Sprint 20
// 소스: BACKLOG.md MECH 양식 #1~#20 (20개 그룹, 60개 항목)

import type { ChecklistMasterItem, ChecklistStatusItem } from '@/types/checklist';

let nextId = 1;
function item(
  group: string,
  name: string,
  type: 'CHECK' | 'INPUT' = 'CHECK',
  spec: string | null = null,
  method: string | null = null,
): Omit<ChecklistMasterItem, 'id' | 'product_code' | 'category' | 'item_order' | 'is_active' | 'second_judgment_required' | 'created_at' | 'updated_at'> {
  return { inspection_group: group, item_name: name, item_type: type, spec_criteria: spec, inspection_method: method };
}

const MECH_ITEMS_RAW = [
  // #1 3Way V/V (2 CHECK)
  item('3Way V/V', 'Spec 확인', 'CHECK', '도면 1:1 확인', '육안 검사'),
  item('3Way V/V', '볼트 체결', 'CHECK', '조립 유동 여부', '촉수 검사'),
  // #2 WASTE GAS (2 CHECK)
  item('WASTE GAS', '배관 도면 일치', 'CHECK', '도면 1:1 확인', '육안 검사'),
  item('WASTE GAS', '클램프 체결', 'CHECK', '조립 유동 여부', '촉수 검사'),
  // #3 INLET (1 CHECK + 1 INPUT)
  item('INLET', '배관 도면 일치', 'CHECK', '도면 1:1 확인', '육안 검사'),
  item('INLET', '배관 S/N 확인 (Left/Right)', 'INPUT'),
  // #4 BURNER (3 CHECK)
  item('BURNER', 'SUS Fitting 조임', 'CHECK', '조립 유동 여부', '촉수 검사'),
  item('BURNER', 'Gas Nozzle Cover 휨', 'CHECK', '육안 확인', '육안 검사'),
  item('BURNER', '클램프 체결', 'CHECK', '조립 유동 여부', '촉수 검사'),
  // #5 REACTOR (4 CHECK)
  item('REACTOR', 'Fitting 조임', 'CHECK', '조립 유동 여부', '촉수 검사'),
  item('REACTOR', 'Tube 조립', 'CHECK', '도면 확인', '육안 검사'),
  item('REACTOR', '클램프 체결', 'CHECK', '조립 유동 여부', '촉수 검사'),
  item('REACTOR', 'Cir Line Tubing', 'CHECK', '배관 경로 확인', '육안 검사'),
  // #6 GN2 (4 CHECK + 2 INPUT)
  item('GN2', 'Sol V/V Spec 확인', 'CHECK', 'Spec 일치', '육안 검사'),
  item('GN2', 'Sol V/V Flow 방향', 'CHECK', '방향 표시 확인', '육안 검사'),
  item('GN2', 'SUS Fitting 조임', 'CHECK', '조립 유동 여부', '촉수 검사'),
  item('GN2', 'Speed Controller 방향', 'CHECK', '방향 표시 확인', '육안 검사'),
  item('GN2', 'Speed Controller 수량 (EA)', 'INPUT'),
  item('GN2', 'MFC Spec 정보', 'INPUT'),
  // #7 LNG (3 CHECK + 1 INPUT)
  item('LNG', 'MFC Spec/Flow 방향', 'CHECK', 'Spec 일치 + 방향 확인', '육안 검사'),
  item('LNG', 'SUS Fitting 조임', 'CHECK', '조립 유동 여부', '촉수 검사'),
  item('LNG', 'Part 조립', 'CHECK', '도면 확인', '육안 검사'),
  item('LNG', 'MFC Maker/Spec 정보', 'INPUT'),
  // #8 O2 (3 CHECK + 1 INPUT)
  item('O2', 'MFC Spec/Flow 방향', 'CHECK', 'Spec 일치 + 방향 확인', '육안 검사'),
  item('O2', 'SUS Fitting 조임', 'CHECK', '조립 유동 여부', '촉수 검사'),
  item('O2', 'Part 조립', 'CHECK', '도면 확인', '육안 검사'),
  item('O2', 'MFC Maker/Spec 정보', 'INPUT'),
  // #9 CDA (4 CHECK + 2 INPUT)
  item('CDA', 'Sol V/V Spec 확인', 'CHECK', 'Spec 일치', '육안 검사'),
  item('CDA', 'Sol V/V Flow 방향', 'CHECK', '방향 표시 확인', '육안 검사'),
  item('CDA', 'SUS Fitting 조임', 'CHECK', '조립 유동 여부', '촉수 검사'),
  item('CDA', 'Speed Controller 방향', 'CHECK', '방향 표시 확인', '육안 검사'),
  item('CDA', 'MFC Maker/Spec 정보', 'INPUT'),
  item('CDA', 'Speed Controller 수량 (EA)', 'INPUT'),
  // #10 BCW (4 CHECK + 1 INPUT)
  item('BCW', 'Flow Sensor Spec 확인', 'CHECK', 'Spec 일치', '육안 검사'),
  item('BCW', 'Flow Sensor 방향', 'CHECK', '방향 표시 확인', '육안 검사'),
  item('BCW', '공압 밸브 Flow', 'CHECK', 'Flow 방향 확인', '육안 검사'),
  item('BCW', 'SUS Fitting 조임', 'CHECK', '조립 유동 여부', '촉수 검사'),
  item('BCW', 'Flow Sensor Spec 정보', 'INPUT'),
  // #11 PCW-S (4 CHECK + 1 INPUT)
  item('PCW-S', 'Flow Sensor Spec 확인', 'CHECK', 'Spec 일치', '육안 검사'),
  item('PCW-S', 'Flow Sensor 방향', 'CHECK', '방향 표시 확인', '육안 검사'),
  item('PCW-S', '공압 밸브 Flow', 'CHECK', 'Flow 방향 확인', '육안 검사'),
  item('PCW-S', 'SUS Fitting 조임', 'CHECK', '조립 유동 여부', '촉수 검사'),
  item('PCW-S', 'Flow Sensor Spec 정보', 'INPUT'),
  // #12 PCW-R (4 CHECK + 1 INPUT)
  item('PCW-R', 'Flow Sensor Spec 확인', 'CHECK', 'Spec 일치', '육안 검사'),
  item('PCW-R', 'Flow Sensor 방향', 'CHECK', '방향 표시 확인', '육안 검사'),
  item('PCW-R', '공압 밸브 Flow', 'CHECK', 'Flow 방향 확인', '육안 검사'),
  item('PCW-R', 'SUS Fitting 조임', 'CHECK', '조립 유동 여부', '촉수 검사'),
  item('PCW-R', 'Flow Sensor Spec 정보', 'INPUT'),
  // #13 Exhaust (4 CHECK)
  item('Exhaust', 'Packing 조립', 'CHECK', '조립 상태 확인', '육안 검사'),
  item('Exhaust', 'Packing Guide 고정', 'CHECK', '고정 상태 확인', '촉수 검사'),
  item('Exhaust', 'SUS Fitting 조임', 'CHECK', '조립 유동 여부', '촉수 검사'),
  item('Exhaust', 'BCW Nozzle Spray', 'CHECK', '분사 방향 확인', '육안 검사'),
  // #14 TANK (3 CHECK)
  item('TANK', 'Cir Pump Spec 확인', 'CHECK', 'Spec 일치', '육안 검사'),
  item('TANK', 'Flow Sensor Swirl Orifice', 'CHECK', '조립 상태 확인', '육안 검사'),
  item('TANK', 'Tank 내부 이물질', 'CHECK', '이물질 없음 확인', '육안 검사'),
  // #15 PU (1 CHECK)
  item('PU', '버너 및 이그저스트 위치', 'CHECK', '도면 위치 확인', '육안 검사'),
  // #16 설비 상부 (3 CHECK)
  item('설비 상부', 'SUS Fitting 조임', 'CHECK', '조립 유동 여부', '촉수 검사'),
  item('설비 상부', 'Drain Nut 조립 상태', 'CHECK', '조립 상태 확인', '촉수 검사'),
  item('설비 상부', '미사용 Hole 막음', 'CHECK', '막음 상태 확인', '육안 검사'),
  // #17 설비 전면부 (1 CHECK)
  item('설비 전면부', 'Interface 스티커 부착', 'CHECK', '부착 위치/상태 확인', '육안 검사'),
  // #18 H/J (3 CHECK)
  item('H/J', '배관 H/J 완전체 조립', 'CHECK', '조립 상태 확인', '육안 검사'),
  item('H/J', '벨크로 체결', 'CHECK', '체결 상태 확인', '촉수 검사'),
  item('H/J', '케이블 정리', 'CHECK', '정리 상태 확인', '육안 검사'),
  // #19 Quenching (2 CHECK)
  item('Quenching', 'Flow Sensor Spec/방향', 'CHECK', 'Spec 일치 + 방향 확인', '육안 검사'),
  item('Quenching', 'Flow Sensor 위치', 'CHECK', '도면 위치 확인', '육안 검사'),
  // #20 눈관리 (1 CHECK)
  item('눈관리', '눈관리 스티커 위치', 'CHECK', '부착 위치 확인', '육안 검사'),
];

const now = new Date().toISOString();

export const MOCK_MECH_ITEMS: ChecklistMasterItem[] = MECH_ITEMS_RAW.map((raw, i) => ({
  id: nextId++,
  product_code: 'GAIA-I',
  category: 'MECH' as const,
  item_order: i + 1,
  is_active: true,
  second_judgment_required: false,
  created_at: now,
  updated_at: now,
  ...raw,
}));

// TM 목업 (15개 항목 — 간략)
const TM_ITEMS_RAW = [
  item('BURNER', 'Gas Line Fitting 조임', 'CHECK', '조립 유동 여부', '촉수 검사'),
  item('BURNER', 'Gas Nozzle 위치', 'CHECK', '도면 확인', '육안 검사'),
  item('BURNER', 'Igniter 조립', 'CHECK', '조립 상태 확인', '육안 검사'),
  item('REACTOR', 'Tube 삽입 깊이', 'CHECK', 'GAP GAUGE 확인', '측정 검사'),
  item('REACTOR', 'O-Ring 장착', 'CHECK', '장착 상태 확인', '육안 검사'),
  item('REACTOR', 'Clamp 체결', 'CHECK', '조립 유동 여부', '촉수 검사'),
  item('REACTOR', 'Reactor 내부 이물질', 'CHECK', '이물질 없음 확인', '육안 검사'),
  item('Exhaust', 'Packing 조립', 'CHECK', '조립 상태 확인', '육안 검사'),
  item('Exhaust', 'Packing Guide 고정', 'CHECK', '고정 상태 확인', '촉수 검사'),
  item('Exhaust', 'SUS Fitting 조임', 'CHECK', '조립 유동 여부', '촉수 검사'),
  item('Exhaust', 'Nozzle Spray 방향', 'CHECK', '분사 방향 확인', '육안 검사'),
  item('TANK', 'Cir Pump Spec', 'CHECK', 'Spec 일치', '육안 검사'),
  item('TANK', 'Flow Sensor 방향', 'CHECK', '방향 표시 확인', '육안 검사'),
  item('TANK', 'Tank 내부 이물질', 'CHECK', '이물질 없음 확인', '육안 검사'),
  item('TANK', 'Level Sensor 위치', 'CHECK', '도면 위치 확인', '육안 검사'),
];

export const MOCK_TM_ITEMS: ChecklistMasterItem[] = TM_ITEMS_RAW.map((raw, i) => ({
  id: nextId++,
  product_code: 'GAIA-I',
  category: 'TM' as const,
  item_order: i + 1,
  is_active: true,
  second_judgment_required: false,
  created_at: now,
  updated_at: now,
  ...raw,
}));

// ELEC 목업 (빈 배열 — 양식 수집 대기)
export const MOCK_ELEC_ITEMS: ChecklistMasterItem[] = [];

// Product code 옵션
export const MOCK_PRODUCT_CODES = ['GAIA-I', 'GAIA-I DUAL', 'GAIA-P'];

// S/N별 체크리스트 상태 목업 (GBWS-6804 MECH 예시 — 일부 완료)
export function getMockChecklistStatus(serialNumber: string, category: string): {
  items: ChecklistStatusItem[];
  summary: { total_check: number; completed: number; percent: number };
} {
  const masterItems = category === 'MECH' ? MOCK_MECH_ITEMS
    : category === 'TM' || category === 'TMS' ? MOCK_TM_ITEMS
      : MOCK_ELEC_ITEMS;

  const checkItems = masterItems.filter(m => m.item_type === 'CHECK');
  // 목업: 앞 60% 항목을 완료 처리
  const completedCount = Math.floor(checkItems.length * 0.6);

  const items: ChecklistStatusItem[] = masterItems.map((m, i) => ({
    master_id: m.id,
    inspection_group: m.inspection_group,
    item_name: m.item_name,
    item_type: m.item_type,
    spec_criteria: m.spec_criteria,
    record: (m.item_type === 'CHECK' && checkItems.indexOf(m) < completedCount) ? {
      id: 1000 + i,
      serial_number: serialNumber,
      master_id: m.id,
      status: 'PASS' as const,
      note: null,
      judgment_round: 1,
      worker_id: 42,
      worker_name: '김태영',
      checked_at: now,
    } : null,
  }));

  const totalCheck = checkItems.length;
  const completed = Math.min(completedCount, totalCheck);

  return {
    items,
    summary: {
      total_check: totalCheck,
      completed,
      percent: totalCheck > 0 ? Math.round((completed / totalCheck) * 100) : 0,
    },
  };
}
