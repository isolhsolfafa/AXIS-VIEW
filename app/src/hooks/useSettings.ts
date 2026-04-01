// src/hooks/useSettings.ts
// 대시보드 설정 관리 훅 — localStorage 동기화

import { useState, useCallback } from 'react';

export interface DashboardSettings {
  refreshInterval: number;        // 분 단위. 0 = 수동
  defaultView: 'card' | 'table';
  showHqSiteBreakdown: boolean;
  showTestSN: boolean;            // 테스트 S/N 표시 여부 (DOC_TEST-, TEST-)
}

const STORAGE_KEY = 'axis_view_settings';

const DEFAULT_SETTINGS: DashboardSettings = {
  refreshInterval: 5,
  defaultView: 'card',
  showHqSiteBreakdown: true,
  showTestSN: false,
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
