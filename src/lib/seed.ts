import { useVAStore, useEntryStore, useCycleStore } from '../store'
import { generateId, getTodayDate, getCycleStartDate } from './utils'
import { format, subDays } from 'date-fns'
import type { VA, DailyEntry } from '../types'

export function seedDemoData() {
  const addVA = useVAStore.getState().addVA
  const addEntry = useEntryStore.getState().addEntry
  const setCycleStart = useCycleStore.getState()
  
  // Check if already seeded
  const existingVAs = useVAStore.getState().vas
  if (existingVAs.length > 0) return
  
  // Set cycle start date to 10 days ago
  const cycleStart = format(subDays(new Date(), 10), 'yyyy-MM-dd')
  useCycleStore.setState({ currentCycleStart: cycleStart })
  
  // Create VA 1: Sophie M. - 3 accounts: 15k/8k/200 views today
  const sophie = addVA('Sophie M.', [
    { name: 'Compte A', platform: 'TikTok', isActive: true },
    { name: 'Compte B', platform: 'Instagram', isActive: true },
    { name: 'Compte C', platform: 'YouTube', isActive: true }
  ])
  
  // Create VA 2: Jean K. - 3 accounts: 55k/12k/3k views today
  const jean = addVA('Jean K.', [
    { name: 'Compte principal', platform: 'TikTok', isActive: true },
    { name: 'Compte backup', platform: 'Instagram', isActive: true },
    { name: 'Compte pro', platform: 'YouTube', isActive: true }
  ])
  
  // Create VA 3: Amira T. - 2 accounts: 9k/500 views today
  const amira = addVA('Amira T.', [
    { name: 'Compte A', platform: 'TikTok', isActive: true },
    { name: 'Compte B', platform: 'Instagram', isActive: true }
  ])
  
  const today = getTodayDate()
  
  // Generate historical entries for each VA
  const generateEntries = (va: VA, todayViews: number[]) => {
    const entries: Omit<DailyEntry, 'id' | 'submittedAt'>[] = []
    
    for (let dayOffset = 10; dayOffset >= 0; dayOffset--) {
      const date = format(subDays(new Date(), dayOffset), 'yyyy-MM-dd')
      const isToday = dayOffset === 0
      
      va.accounts.forEach((account, index) => {
        // Base views with some variation
        let baseViews = isToday ? todayViews[index] : Math.floor(Math.random() * 30000)
        
        // Add day-to-day variation
        if (!isToday) {
          baseViews = Math.floor(baseViews * (0.7 + Math.random() * 0.6))
        }
        
        entries.push({
          vaId: va.id,
          accountId: account.id,
          date,
          views: baseViews,
          isManual: false
        })
      })
    }
    
    return entries
  }
  
  // Sophie: 15k, 8k, 200 (one account invalid)
  const sophieEntries = generateEntries(sophie, [15000, 8000, 200])
  sophieEntries.forEach(e => addEntry(e))
  
  // Jean: 55k, 12k, 3k (all above threshold, gets coherence bonus)
  const jeanEntries = generateEntries(jean, [55000, 12000, 3000])
  jeanEntries.forEach(e => addEntry(e))
  
  // Amira: 9k, 500 (one account below threshold)
  const amiraEntries = generateEntries(amira, [9000, 500])
  amiraEntries.forEach(e => addEntry(e))
}
