import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageWrapper({ children, title, subtitle, action }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-1">{title}</h1>
          {subtitle && <p className="text-white/50">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  )
}
