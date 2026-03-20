import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getCycleStartDate, getDaysInCycle } from '../lib/utils'
import { DEFAULT_SETTINGS } from '../lib/constants'

interface CycleState {
  currentCycleStart: string
  closeCycle: () => void
  getDaysElapsed: () => number
  isInCycle: (date: string) => boolean
}

export const useCycleStore = create<CycleState>()(
  persist(
    (set, get) => ({
      currentCycleStart: getCycleStartDate(),
      
      closeCycle: () => {
        // Start a new cycle
        const now = new Date()
        const dayOfMonth = now.getDate()
        
        let newStartDate: Date
        if (dayOfMonth >= 16) {
          // Next cycle starts on 1st of next month
          newStartDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        } else {
          // Next cycle starts on 16th of current month
          newStartDate = new Date(now.getFullYear(), now.getMonth(), 16)
        }
        
        set({ currentCycleStart: newStartDate.toISOString().split('T')[0] })
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
      }
    }),
    {
      name: 'va-salary-manager-cycle'
    }
  )
)
