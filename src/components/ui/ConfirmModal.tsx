import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'default'
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="modal-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              {variant === 'danger' && (
                <div className="p-3 rounded-full bg-red-500/20 text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-white/60 mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                  <button 
                    onClick={onClose}
                    className="glass-button secondary"
                  >
                    {cancelText}
                  </button>
                  <button 
                    onClick={() => {
                      onConfirm()
                      onClose()
                    }}
                    className={`glass-button ${variant === 'danger' ? 'danger' : ''}`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
