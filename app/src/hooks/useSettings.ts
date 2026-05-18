// src/hooks/useSettings.ts
// 대시보드 설정 관리 훅 — localStorage 동기화

import { useState, useCallback } from 'react';
import type { ProcessToggles } from '@/utils/processToggleFilter';
import { NO_PROCESS_TOGGLE } from '@/utils/processToggleFilter';

export interface DashboardSettings {
  refreshInterval: number;        // 분 단위. 0 = 수동
  defaultView: 'card' | 'table';
  showHqSiteBreakdown: boolean;
  showTestSN: boolean;            // 테스트 S/N 전용 보기 (Sprint 45: ON=테스트만 / OFF=운영만)
  processFilters: ProcessToggles; // Sprint 46: 생산현황 PI/QI/SI 공정 토글 (전부 OFF=전체보기)
}

const STORAGE_KEY = 'axis_view_settings';

const DEFAULT_SETTINGS: DashboardSettings = {
  refreshInterval: 5,
  defaultView: 'card',
  showHqSiteBreakdown: true,
  showTestSN: false,
  processFilters: { ...NO_PROCESS_TOGGLE },
};

function loadSettings(): DashboardSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // 파싱 실패 시 기본값
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: DashboardSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useSettings() {
  const [settings, setSettings] = useState<DashboardSettings>(loadSettings);

  const updateSetting = useCallback(<K extends keyof DashboardSettings>(
    key: K,
    value: DashboardSettings[K],
  ) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  return { settings, updateSetting } as const;
}
