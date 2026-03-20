export type TierName = 'INVALIDE' | 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ' | 'VIRAL'

export interface Account {
  id: string
  name: string
  platform: string
  isActive: boolean
}

export interface VA {
  id: string
  name: string
  avatar?: string
  accounts: Account[]
  cycleStartDate: string
  createdAt: string
}

export interface DailyEntry {
  id: string
  vaId: string
  accountId: string
  date: string
  views: number
  screenshotUrl?: string
  submittedAt: string
  isManual: boolean
}

export interface DailySummary {
  date: string
  vaId: string
  entries: DailyEntry[]
  totalPay: number
  coherenceBonus: number
  tier: Record<string, TierName>
  missingAccounts: string[]
}

export interface TierConfig {
  name: TierName
  minViews: number
  maxViews: number
  dailyRate: number
  color: string
}

export interface AppSettings {
  tiers: TierConfig[]
  coherenceBonus: number
  cycleCap: number
  language: 'fr' | 'en'
}

export interface CycleInfo {
  startDate: string
  endDate: string
  isActive: boolean
}
