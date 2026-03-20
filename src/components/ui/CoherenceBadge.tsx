import { Sparkles } from 'lucide-react'

interface CoherenceBadgeProps {
  active: boolean
  bonus?: number
}

export function CoherenceBadge({ active, bonus = 0.50 }: CoherenceBadgeProps) {
  if (!active) return null
  
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shimmer">
      <Sparkles className="w-3.5 h-3.5" />
      <span>Cohérence</span>
      <span className="text-white/60">+${bonus.toFixed(2)}</span>
    </div>
  )
}
