import { create } from 'zustand';
import type { SettingsTab } from '../core/ui';

interface UIState {
  activeTab: SettingsTab;
  attach: () => void;
  detach: () => void;
  setActiveTab: (tab: SettingsTab) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'render',
  
  attach: () => {
    set({ activeTab: 'render' });
  },
  detach: () => {
    set({ activeTab: 'render' });
  },
  setActiveTab: (tab) => set({ activeTab: tab }),
}));