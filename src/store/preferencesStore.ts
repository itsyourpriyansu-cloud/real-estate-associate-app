import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/prototype';
import { setHapticsEnabled } from '@/services/haptics';
import { storage } from '@/services/storage';

/** Reduce Motion: follow the OS setting, or force it on/off for QA. */
export type ReduceMotionPreference = 'system' | 'on' | 'off';

interface PreferencesState {
  notificationsEnabled: boolean;
  hapticsEnabled: boolean;
  reduceMotion: ReduceMotionPreference;
  setNotificationsEnabled: (value: boolean) => void;
  setHapticsEnabled: (value: boolean) => void;
  setReduceMotion: (value: ReduceMotionPreference) => void;
}

/** User preferences. Appearance is intentionally absent: Phase 1 is dark-only (spec §14.16). */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      hapticsEnabled: true,
      reduceMotion: 'system',
      setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),
      setHapticsEnabled: (value) => {
        setHapticsEnabled(value);
        set({ hapticsEnabled: value });
      },
      setReduceMotion: (value) => set({ reduceMotion: value }),
    }),
    {
      name: STORAGE_KEYS.preferences,
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        notificationsEnabled: state.notificationsEnabled,
        hapticsEnabled: state.hapticsEnabled,
        reduceMotion: state.reduceMotion,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) setHapticsEnabled(state.hapticsEnabled);
      },
    },
  ),
);
