import { create } from 'zustand'
import { getCycleStartDate, getDaysInCycle } from '../lib/utils'
import { DEFAULT_SETTINGS } from '../lib/constants'
import { getCycle as dbGetCycle, saveCycle as dbSaveCycle, getAllVAs, getAllEntries, getSettings as dbGetSettings, getVA, saveVA as dbSaveVA, saveEntry as dbSaveEntry, clearAllData, importData as dbImportData } from '../lib/db'

interface CycleState {
  currentCycleStart: string
  isLoading: boolean
  initialize: () => Promise<void>
  closeCycle: () => void
  getDaysElapsed: () => number
  isInCycle: (date: string) => boolean
  resetAllData: () => Promise<void>
  importData: (jsonData: string) => Promise<void>
  exportData: () => Promise<string>
}

export const useCycleStore = create<CycleState>()((set, get) => ({
  currentCycleStart: getCycleStartDate(),
  isLoading: true,
  
  initialize: async () => {
    try {
      const cycle = await dbGetCycle()
      if (cycle) {
        set({ currentCycleStart: cycle.currentCycleStart, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      console.error('Failed to initialize cycle:', error)
      set({ isLoading: false })
    }
  },
  
  closeCycle: () => {
    const now = new Date()
    const dayOfMonth = now.getDate()
    
    let newStartDate: Date
    if (dayOfMonth >= 16) {
      newStartDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    } else {
      newStartDate = new Date(now.getFullYear(), now.getMonth(), 16)
    }
    
    const newStart = newStartDate.toISOString().split('T')[0]
    set({ currentCycleStart: newStart })
    dbSaveCycle({ currentCycleStart: newStart })
  },
  
  getDaysElapsed: () => {
    return getDaysInCycle(get().currentCycleStart)
  },
  
  isInCycle: (date: string) => {
    const start = new Date(get().currentCycleStart)
    const end = new Date(start)
    end.setDate(end.getDate() + 14)
    const checkDate = new Date(date)
    return checkDate >= start && checkDate <= end
  },
  
  resetAllData: async () => {
    await clearAllData()
    set({ currentCycleStart: getCycleStartDate() })
    window.location.reload()
  },
  
  importData: async (jsonData: string) => {
    await dbImportData(jsonData)
    // Reinitialize stores
    window.location.reload()
  },
  
  exportData: async () => {
    const vas = await getAllVAs()
    const entries = await getAllEntries()
    const settings = await dbGetSettings()
    const cycle = await dbGetCycle()
    return JSON.stringify({ vas, entries, settings, cycle }, null, 2)
  }
}))
