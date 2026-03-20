import { AlertTriangle, Info, X } from 'lucide-react'
import type { ReactNode } from 'react'

interface AlertBannerProps {
  type?: 'info' | 'warning' | 'danger'
  title?: string
  children: ReactNode
  onClose?: () => void
}

export function AlertBanner({ type = 'info', title, children, onClose }: AlertBannerProps) {
  const typeClasses = {
    info: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
    warning: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    danger: 'bg-red-500/15 border-red-500/30 text-red-400'
  }
  
  const icons = {
    info: Info,
    warning: AlertTriangle,
    danger: AlertTriangle
  }
  
  const Icon = icons[type]
  
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${typeClasses[type]}`}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        {title && <p className="font-semibold mb-1">{title}</p>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
