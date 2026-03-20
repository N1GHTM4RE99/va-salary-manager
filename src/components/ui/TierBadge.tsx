import { Info } from 'lucide-react'
import type { TierName } from '../../types'
import { getDailyRate } from '../../lib/salary'

interface TierBadgeProps {
  tier: TierName
  views?: number
  showTooltip?: boolean
  size?: 'sm' | 'md'
}

const tierLabels: Record<TierName, string> = {
  INVALIDE: 'Invalide',
  FAIBLE: 'Faible',
  MOYEN: 'Moyen',
  ÉLEVÉ: 'Élevé',
  VIRAL: 'Viral'
}

const tierThresholds: Record<TierName, string> = {
  INVALIDE: '< 250 vues',
  FAIBLE: '250 - 999 vues',
  MOYEN: '1,000 - 9,999 vues',
  ÉLEVÉ: '10,000 - 49,999 vues',
  VIRAL: '50,000+ vues'
}

export function TierBadge({ tier, views, showTooltip = true, size = 'md' }: TierBadgeProps) {
  const tierKey = tier.toLowerCase().replace('é', 'e').replace('é', 'e') as 'invalide' | 'faible' | 'moyen' | 'eleve' | 'viral'
  const rate = getDailyRate(views ?? 0)
  
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-1' : 'text-xs px-3 py-1.5'
  
  return (
    <div className="tooltip">
      <span className={`tier-badge ${tierKey} ${sizeClasses}`}>
        {tierLabels[tier]}
      </span>
      {showTooltip && (
        <div className="tooltip-content">
          <div className="font-semibold">{tierThresholds[tier]}</div>
          <div className="text-white/70">${rate.toFixed(2)}/jour</div>
        </div>
      )}
    </div>
  )
}
