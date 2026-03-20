import { useState, useEffect } from 'react'
import { getTier, getDailyRate, formatViews } from '../../lib/salary'
import type { TierName } from '../../types'
import { TierBadge } from '../ui/TierBadge'

interface ViewsInputProps {
  value: number
  onChange: (value: number) => void
  accountName?: string
  disabled?: boolean
}

export function ViewsInput({ value, onChange, accountName, disabled }: ViewsInputProps) {
  const [inputValue, setInputValue] = useState(value.toString())
  const [tier, setTier] = useState<TierName>('INVALIDE')
  const [rate, setRate] = useState(0)
  
  useEffect(() => {
    setTier(getTier(value))
    setRate(getDailyRate(value))
  }, [value])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setInputValue(val)
    const numVal = parseInt(val) || 0
    onChange(numVal)
  }
  
  const isInvalid = value < 250
  
  return (
    <div className="space-y-2">
      {accountName && (
        <label className="text-sm text-white/70">{accountName}</label>
      )}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder="0"
          className="glass-input font-mono text-right pr-16"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
          vues
        </span>
      </div>
      <div className="flex items-center justify-between">
        <TierBadge tier={tier} views={value} showTooltip={false} size="sm" />
        <span className={`text-sm font-mono ${isInvalid ? 'text-white/30' : 'text-emerald-400'}`}>
          {isInvalid ? '—' : `+$${rate.toFixed(2)}`}
        </span>
      </div>
    </div>
  )
}
