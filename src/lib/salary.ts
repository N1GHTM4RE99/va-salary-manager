import type { Account, DailyEntry, DailySummary, TierName, VA } from '../types'
import { DEFAULT_SETTINGS, CYCLE_DAYS } from './constants'
import { eachDayOfInterval, format, isWithinInterval, parseISO, subDays } from 'date-fns'

export function getTier(views: number): TierName {
  if (views < 250) return 'INVALIDE'
  if (views < 1000) return 'FAIBLE'
  if (views < 10000) return 'MOYEN'
  if (views < 50000) return 'ÉLEVÉ'
  return 'VIRAL'
}

export function getDailyRate(views: number): number {
  const tier = getTier(views)
  const tierConfig = DEFAULT_SETTINGS.tiers.find(t => t.name === tier)
  return tierConfig?.dailyRate ?? 0
}

export function getCoherenceBonus(accounts: Account[]): number {
  const activeAccounts = accounts.filter(a => a.isActive)
  if (activeAccounts.length < 3) return 0
  
  const allAboveMin = activeAccounts.every(a => {
    return true // We'll check this with actual entries
  })
  
  // This function needs entries to determine actual coherence
  // Return placeholder - will be calculated in context
  return 0
}

export function getCoherenceBonusWithEntries(entries: DailyEntry[], accounts: Account[]): number {
  const activeAccounts = accounts.filter(a => a.isActive)
  if (activeAccounts.length < 3) return 0
  
  // Check if ALL active accounts have entries above 250 views
  const accountIds = new Set(activeAccounts.map(a => a.id))
  const entriesAboveMin = entries.filter(e => 
    accountIds.has(e.accountId) && e.views >= 250
  )
  
  // All accounts must have entries >= 250 views
  const uniqueAccountsWithEntries = new Set(entriesAboveMin.map(e => e.accountId))
  
  if (uniqueAccountsWithEntries.size === activeAccounts.length) {
    return DEFAULT_SETTINGS.coherenceBonus
  }
  
  return 0
}

export function getDailyTotal(accounts: Account[], entries: DailyEntry[]): number {
  const activeAccountIds = new Set(accounts.filter(a => a.isActive).map(a => a.id))
  
  let total = 0
  for (const entry of entries) {
    if (activeAccountIds.has(entry.accountId)) {
      total += getDailyRate(entry.views)
    }
  }
  
  return total
}

export function getDailySummary(
  va: VA,
  date: string,
  entries: DailyEntry[]
): DailySummary {
  const dayEntries = entries.filter(e => e.vaId === va.id && e.date === date)
  const accountIds = new Set(va.accounts.map(a => a.id))
  
  // Find missing accounts (no entry for this day)
  const accountsWithEntries = new Set(dayEntries.map(e => e.accountId))
  const missingAccounts = va.accounts
    .filter(a => a.isActive && !accountsWithEntries.has(a.id))
    .map(a => a.name)
  
  // Calculate tier per account
  const tier: Record<string, TierName> = {}
  for (const entry of dayEntries) {
    tier[entry.accountId] = getTier(entry.views)
  }
  
  // Calculate total pay
  const totalPay = getDailyTotal(va.accounts, dayEntries)
  
  // Calculate coherence bonus
  const coherenceBonus = getCoherenceBonusWithEntries(dayEntries, va.accounts)
  
  return {
    date,
    vaId: va.id,
    entries: dayEntries,
    totalPay,
    coherenceBonus,
    tier,
    missingAccounts
  }
}

export function getCycleTotal(
  va: VA,
  entries: DailyEntry[],
  cycleStartDate: string
): number {
  const cycleEndDate = format(
    addDays(parseISO(cycleStartDate), CYCLE_DAYS - 1),
    'yyyy-MM-dd'
  )
  
  const today = format(new Date(), 'yyyy-MM-dd')
  const endDate = today > cycleEndDate ? cycleEndDate : today
  
  const days = eachDayOfInterval({
    start: parseISO(cycleStartDate),
    end: parseISO(endDate)
  })
  
  let total = 0
  
  for (const day of days) {
    const dayStr = format(day, 'yyyy-MM-dd')
    const summary = getDailySummary(va, dayStr, entries)
    total += summary.totalPay + summary.coherenceBonus
  }
  
  // Apply cap
  return Math.min(total, DEFAULT_SETTINGS.cycleCap)
}

export function getProjectedCycleTotal(
  va: VA,
  entries: DailyEntry[],
  cycleStartDate: string
): number {
  const cycleEndDate = format(
    addDays(parseISO(cycleStartDate), CYCLE_DAYS - 1),
    'yyyy-MM-dd'
  )
  
  const today = format(new Date(), 'yyyy-MM-dd')
  const daysRemaining = differenceInDays(parseISO(cycleEndDate), parseISO(today))
  
  // Get current total
  const currentTotal = getCycleTotal(va, entries, cycleStartDate)
  
  // Estimate average daily earnings
  const todayDate = parseISO(today)
  const startDate = parseISO(cycleStartDate)
  const daysElapsed = differenceInDays(todayDate, startDate) + 1
  
  const recentEntries = entries.filter(e => {
    const entryDate = parseISO(e.date)
    return e.vaId === va.id && 
      isWithinInterval(entryDate, { start: startDate, end: todayDate })
  })
  
  const averageDaily = daysElapsed > 0 ? currentTotal / daysElapsed : 0
  const projectedRemaining = averageDaily * daysRemaining
  
  return Math.min(currentTotal + projectedRemaining, DEFAULT_SETTINGS.cycleCap)
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function differenceInDays(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date1.getTime() - date2.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}k`
  }
  return views.toString()
}

export function getInitials(name: string): string {
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export function getColorFromName(name: string): string {
  const colors = [
    '#a78bfa', '#f472b6', '#34d399', '#38bdf8', 
    '#fbbf24', '#f87171', '#818cf8', '#2dd4bf'
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
