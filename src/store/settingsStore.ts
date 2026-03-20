import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings } from '../types'
import { DEFAULT_SETTINGS } from '../lib/constants'

interface SettingsState extends AppSettings {
  updateSettings: (updates: Partial<AppSettings>) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      
      updateSettings: (updates) => {
        set(state => ({ ...state, ...updates }))
      },
      
      resetSettings: () => {
        set(DEFAULT_SETTINGS)
      }
    }),
    {
      name: 'va-salary-manager-settings'
    }
  )
)
