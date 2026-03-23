import { create } from 'zustand'
import type { DailyEntry } from '../types'
import { generateId, getTodayDate } from '../lib/utils'
import { getAllEntries as dbGetAllEntries, saveEntry as dbSaveEntry, deleteEntry as dbDeleteEntry, getEntriesByVA as dbGetEntriesByVA, getEntriesByDate as dbGetEntriesByDate } from '../lib/db'

interface EntryState {
  entries: DailyEntry[]
  isLoading: boolean
  initialize: () => Promise<void>
  addEntry: (entry: Omit<DailyEntry, 'id' | 'submittedAt'>) => DailyEntry
  addEntries: (entries: Omit<DailyEntry, 'id' | 'submittedAt'>[]) => void
  updateEntry: (id: string, updates: Partial<DailyEntry>) => void
  deleteEntry: (id: string) => void
  getEntriesByVA: (vaId: string) => DailyEntry[]
  getEntriesByDate: (date: string) => DailyEntry[]
  getTodayEntries: () => DailyEntry[]
  getEntriesInCycle: (vaId: string, cycleStartDate: string) => DailyEntry[]
}

export const useEntryStore = create<EntryState>()((set, get) => ({
  entries: [],
  isLoading: true,
  
  initialize: async () => {
    try {
      const entries = await dbGetAllEntries()
      set({ entries, isLoading: false })
    } catch (error) {
      console.error('Failed to initialize entries:', error)
      set({ isLoading: false })
    }
  },
  
  addEntry: (entry) => {
    const newEntry: DailyEntry = {
      ...entry,
      id: generateId(),
      submittedAt: new Date().toISOString()
    }
    set(state => ({ entries: [...state.entries, newEntry] }))
    dbSaveEntry(newEntry)
    return newEntry
  },
  
  addEntries: (newEntries) => {
    const entries = newEntries.map(entry => ({
      ...entry,
      id: generateId(),
      submittedAt: new Date().toISOString()
    }))
    set(state => ({ entries: [...state.entries, ...entries] }))
    entries.forEach(e => dbSaveEntry(e))
  },
  
  updateEntry: (id, updates) => {
    set(state => ({
      entries: state.entries.map(entry => {
        if (entry.id === id) {
          const updated = { ...entry, ...updates }
          dbSaveEntry(updated)
          return updated
        }
        return entry
      })
    }))
  },
  
  deleteEntry: (id) => {
    set(state => ({ entries: state.entries.filter(e => e.id !== id) }))
    dbDeleteEntry(id)
  },
  
  getEntriesByVA: (vaId) => {
    return get().entries.filter(e => e.vaId === vaId)
  },
  
  getEntriesByDate: (date) => {
    return get().entries.filter(e => e.date === date)
  },
  
  getTodayEntries: () => {
    const today = getTodayDate()
    return get().entries.filter(e => e.date === today)
  },
  
  getEntriesInCycle: (vaId, cycleStartDate) => {
    const startDate = new Date(cycleStartDate)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 14)
    
    return get().entries.filter(e => {
      if (e.vaId !== vaId) return false
      const entryDate = new Date(e.date)
      return entryDate >= startDate && entryDate <= endDate
    })
  }
}))
