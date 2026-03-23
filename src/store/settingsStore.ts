import { create } from 'zustand'
import type { AppSettings } from '../types'
import { DEFAULT_SETTINGS } from '../lib/constants'
import { getSettings as dbGetSettings, saveSettings as dbSaveSettings } from '../lib/db'

interface SettingsState extends AppSettings {
  isLoading: boolean
  initialize: () => Promise<void>
  updateSettings: (updates: Partial<AppSettings>) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoading: true,
  
  initialize: async () => {
    try {
      const settings = await dbGetSettings()
      if (settings) {
        set({ ...settings, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      console.error('Failed to initialize settings:', error)
      set({ isLoading: false })
    }
  },
  
  updateSettings: (updates) => {
    set(state => {
      const newState = { ...state, ...updates }
      dbSaveSettings(newState)
      return newState
    })
  },
  
  resetSettings: () => {
    set(DEFAULT_SETTINGS)
    dbSaveSettings(DEFAULT_SETTINGS)
  }
}))
