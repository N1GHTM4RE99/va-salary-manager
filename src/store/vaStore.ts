import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { VA, Account } from '../types'
import { generateId, getCycleStartDate } from '../lib/utils'

interface VAState {
  vas: VA[]
  addVA: (name: string, accounts: Omit<Account, 'id'>[]) => VA
  updateVA: (id: string, updates: Partial<VA>) => void
  deleteVA: (id: string) => void
  getVAById: (id: string) => VA | undefined
  addAccount: (vaId: string, account: Omit<Account, 'id'>[]) => void
  updateAccount: (vaId: string, accountId: string, updates: Partial<Account>) => void
  deleteAccount: (vaId: string, accountId: string) => void
}

export const useVAStore = create<VAState>()(
  persist(
    (set, get) => ({
      vas: [],
      
      addVA: (name, accounts) => {
        const newVA: VA = {
          id: generateId(),
          name,
          accounts: accounts.map(a => ({ ...a, id: generateId() })),
          cycleStartDate: getCycleStartDate(),
          createdAt: new Date().toISOString()
        }
        set(state => ({ vas: [...state.vas, newVA] }))
        return newVA
      },
      
      updateVA: (id, updates) => {
        set(state => ({
          vas: state.vas.map(va => 
            va.id === id ? { ...va, ...updates } : va
          )
        }))
      },
      
      deleteVA: (id) => {
        set(state => ({ vas: state.vas.filter(va => va.id !== id) }))
      },
      
      getVAById: (id) => {
        return get().vas.find(va => va.id === id)
      },
      
      addAccount: (vaId, newAccounts) => {
        set(state => ({
          vas: state.vas.map(va =>
            va.id === vaId
              ? { ...va, accounts: [...va.accounts, ...newAccounts.map(a => ({ ...a, id: generateId() }))] }
              : va
          )
        }))
      },
      
      updateAccount: (vaId, accountId, updates) => {
        set(state => ({
          vas: state.vas.map(va =>
            va.id === vaId
              ? {
                  ...va,
                  accounts: va.accounts.map(acc =>
                    acc.id === accountId ? { ...acc, ...updates } : acc
                  )
                }
              : va
          )
        }))
      },
      
      deleteAccount: (vaId, accountId) => {
        set(state => ({
          vas: state.vas.map(va =>
            va.id === vaId
              ? { ...va, accounts: va.accounts.filter(acc => acc.id !== accountId) }
              : va
          )
        }))
      }
    }),
    {
      name: 'va-salary-manager-va'
    }
  )
)
