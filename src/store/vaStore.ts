import { create } from 'zustand'
import type { VA, Account } from '../types'
import { generateId, getCycleStartDate } from '../lib/utils'
import { getAllVAs, saveVA as dbSaveVA, deleteVA as dbDeleteVA, getAllEntries, saveEntry as dbSaveEntry, deleteEntry as dbDeleteEntry, getSettings as dbGetSettings, saveSettings as dbSaveSettings, getCycle as dbGetCycle, saveCycle as dbSaveCycle, clearAllData } from '../lib/db'
import { DEFAULT_SETTINGS } from '../lib/constants'

interface VAState {
  vas: VA[]
  isLoading: boolean
  initialize: () => Promise<void>
  addVA: (name: string, accounts: Omit<Account, 'id'>[]) => VA
  updateVA: (id: string, updates: Partial<VA>) => void
  deleteVA: (id: string) => void
  getVAById: (id: string) => VA | undefined
  addAccount: (vaId: string, account: Omit<Account, 'id'>[]) => void
  updateAccount: (vaId: string, accountId: string, updates: Partial<Account>) => void
  deleteAccount: (vaId: string, accountId: string) => void
}

export const useVAStore = create<VAState>()((set, get) => ({
  vas: [],
  isLoading: true,
  
  initialize: async () => {
    try {
      const vas = await getAllVAs()
      set({ vas, isLoading: false })
    } catch (error) {
      console.error('Failed to initialize:', error)
      set({ isLoading: false })
    }
  },
  
  addVA: (name, accounts) => {
    const newVA: VA = {
      id: generateId(),
      name,
      accounts: accounts.map(a => ({ ...a, id: generateId() })),
      cycleStartDate: getCycleStartDate(),
      createdAt: new Date().toISOString()
    }
    set(state => ({ vas: [...state.vas, newVA] }))
    dbSaveVA(newVA)
    return newVA
  },
  
  updateVA: (id, updates) => {
    set(state => ({
      vas: state.vas.map(va => {
        if (va.id === id) {
          const updated = { ...va, ...updates }
          dbSaveVA(updated)
          return updated
        }
        return va
      })
    }))
  },
  
  deleteVA: (id) => {
    set(state => ({ vas: state.vas.filter(va => va.id !== id) }))
    dbDeleteVA(id)
  },
  
  getVAById: (id) => {
    return get().vas.find(va => va.id === id)
  },
  
  addAccount: (vaId, newAccounts) => {
    set(state => ({
      vas: state.vas.map(va => {
        if (va.id === vaId) {
          const updated = {
            ...va,
            accounts: [...va.accounts, ...newAccounts.map(a => ({ ...a, id: generateId() }))]
          }
          dbSaveVA(updated)
          return updated
        }
        return va
      })
    }))
  },
  
  updateAccount: (vaId, accountId, updates) => {
    set(state => ({
      vas: state.vas.map(va => {
        if (va.id === vaId) {
          const updated = {
            ...va,
            accounts: va.accounts.map(acc =>
              acc.id === accountId ? { ...acc, ...updates } : acc
            )
          }
          dbSaveVA(updated)
          return updated
        }
        return va
      })
    }))
  },
  
  deleteAccount: (vaId, accountId) => {
    set(state => ({
      vas: state.vas.map(va => {
        if (va.id === vaId) {
          const updated = {
            ...va,
            accounts: va.accounts.filter(acc => acc.id !== accountId)
          }
          dbSaveVA(updated)
          return updated
        }
        return va
      })
    }))
  }
}))
