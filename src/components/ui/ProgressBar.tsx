import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  max: number
  showLabel?: boolean
  className?: string
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

export function ProgressBar({ 
  value, 
  max, 
  showLabel = false,
  className = '',
  color = 'primary'
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const colorClasses = {
    primary: 'bg-gradient-to-r from-[#a78bfa] to-[#f472b6]',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-red-400'
  }
  
  return (
    <div className={className}>
      <div className="progress-bar">
        <motion.div 
          className={`progress-bar-fill ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-white/50">
          <span>${value.toFixed(2)}</span>
          <span>${max.toFixed(2)}</span>
        </div>
      )}
    </div>
  )
}
