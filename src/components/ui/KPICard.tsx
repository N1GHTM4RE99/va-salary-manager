import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { GlassCard } from './GlassCard'

interface KPICardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function KPICard({ label, value, icon, trend, className = '' }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState('0')
  
  useEffect(() => {
    if (typeof value === 'number') {
      // Animate number counting up
      const duration = 600
      const steps = 20
      const increment = value / steps
      let current = 0
      
      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setDisplayValue(value.toFixed(value % 1 === 0 ? 0 : 2))
          clearInterval(timer)
        } else {
          setDisplayValue(current.toFixed(current % 1 === 0 ? 0 : 2))
        }
      }, duration / steps)
      
      return () => clearInterval(timer)
    } else {
      setDisplayValue(value.toString())
    }
  }, [value])
  
  return (
    <GlassCard className={`p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/50 text-sm font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold font-mono count-up">
            {typeof value === 'string' && value.startsWith('$') 
              ? `$${displayValue}` 
              : displayValue}
          </p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              trend.isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-white/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  )
}
