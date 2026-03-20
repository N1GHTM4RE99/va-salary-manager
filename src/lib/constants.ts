import type { TierConfig } from '../types'

export const DEFAULT_TIERS: TierConfig[] = [
  {
    name: 'INVALIDE',
    minViews: 0,
    maxViews: 249,
    dailyRate: 0,
    color: '#6b7280'
  },
  {
    name: 'FAIBLE',
    minViews: 250,
    maxViews: 999,
    dailyRate: 0.50,
    color: '#f59e0b'
  },
  {
    name: 'MOYEN',
    minViews: 1000,
    maxViews: 9999,
    dailyRate: 1.00,
    color: '#38bdf8'
  },
  {
    name: 'ÉLEVÉ',
    minViews: 10000,
    maxViews: 49999,
    dailyRate: 1.50,
    color: '#a78bfa'
  },
  {
    name: 'VIRAL',
    minViews: 50000,
    maxViews: Infinity,
    dailyRate: 3.00,
    color: '#f472b6'
  }
]

export const DEFAULT_SETTINGS = {
  tiers: DEFAULT_TIERS,
  coherenceBonus: 0.50,
  cycleCap: 100.00,
  language: 'fr' as const
}

export const CYCLE_DAYS = 15

export const PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'Facebook', 'Twitter/X', 'LinkedIn', 'Other']
