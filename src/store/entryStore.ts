import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DailyEntry } from '../types'
import { generateId, getTodayDate } from '../lib/utils'

interface EntryState {
  entries: DailyEntry[]
  addEntry: (entry: Omit<DailyEntry, 'id' | 'submittedAt'>) => DailyEntry
  addEntries: (entries: Omit<DailyEntry, 'id' | 'submittedAt'>[]) => void
  updateEntry: (id: string, updates: Partial<DailyEntry>) => void
  deleteEntry: (id: string) => void
  getEntriesByVA: (vaId: string) => DailyEntry[]
  getEntriesByDate: (date: string) => DailyEntry[]
  getTodayEntries: () => DailyEntry[]
  getEntriesInCycle: (vaId: string, cycleStartDate: string) => DailyEntry[]
}

export const useEntryStore = create<EntryState>()(
  persist(
    (set, get) => ({
      entries: [],
      
      addEntry: (entry) => {
        const newEntry: DailyEntry = {
          ...entry,
          id: generateId(),
          submittedAt: new Date().toISOString()
        }
        set(state => ({ entries: [...state.entries, newEntry] }))
        return newEntry
      },
      
      addEntries: (newEntries) => {
        const entries = newEntries.map(entry => ({
          ...entry,
          id: generateId(),
          submittedAt: new Date().toISOString()
        }))
        set(state => ({ entries: [...state.entries, ...entries] }))
      },
      
      updateEntry: (id, updates) => {
        set(state => ({
          entries: state.entries.map(entry =>
            entry.id === id ? { ...entry, ...updates } : entry
          )
        }))
      },
      
      deleteEntry: (id) => {
        set(state => ({ entries: state.entries.filter(e => e.id !== id) }))
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
    }),
    {
      name: 'va-salary-manager-entries'
    }
  )
)
