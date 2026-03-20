import { useState, useEffect } from 'react'
import { useVAStore, useEntryStore, useCycleStore } from '../../store'
import { getDailySummary, getCoherenceBonusWithEntries } from '../../lib/salary'
import { getTodayDate } from '../../lib/utils'
import { ViewsInput } from './ViewsInput'
import { GlassCard, TierBadge, CoherenceBadge } from '../ui'
import { ChevronDown } from 'lucide-react'

interface EntryFormProps {
  vaId?: string
  date?: string
  onSuccess?: () => void
}

export function EntryForm({ vaId, date, onSuccess }: EntryFormProps) {
  const vas = useVAStore(state => state.vas)
  const addEntry = useEntryStore(state => state.addEntry)
  const currentCycleStart = useCycleStore(state => state.currentCycleStart)
  
  const [selectedVAId, setSelectedVAId] = useState(vaId || '')
  const [selectedDate, setSelectedDate] = useState(date || getTodayDate())
  const [views, setViews] = useState<Record<string, number>>({})
  const [showVANotFound, setShowVANotFound] = useState(false)
  
  const selectedVA = vas.find(v => v.id === selectedVAId)
  
  useEffect(() => {
    if (vaId) setSelectedVAId(vaId)
  }, [vaId])
  
  useEffect(() => {
    if (date) setSelectedDate(date)
  }, [date])
  
  // Load existing entries for today
  useEffect(() => {
    if (selectedVA && selectedDate) {
      const entries = useEntryStore.getState().getEntriesByVA(selectedVA.id)
      const todayEntries = entries.filter(e => e.date === selectedDate)
      
      const existingViews: Record<string, number> = {}
      for (const entry of todayEntries) {
        existingViews[entry.accountId] = entry.views
      }
      setViews(existingViews)
    }
  }, [selectedVA, selectedDate])
  
  const handleViewChange = (accountId: string, value: number) => {
    setViews(prev => ({ ...prev, [accountId]: value }))
  }
  
  const calculateTotal = () => {
    if (!selectedVA) return 0
    
    let total = 0
    for (const account of selectedVA.accounts) {
      const viewCount = views[account.id] || 0
      const tier = getTierFromViews(viewCount)
      if (tier !== 'INVALIDE' && account.isActive) {
        total += getRateFromViews(viewCount)
      }
    }
    
    // Check coherence bonus
    const entries = Object.entries(views).map(([accountId, viewCount]) => ({
      accountId,
      views: viewCount
    }))
    
    const activeAccounts = selectedVA.accounts.filter(a => a.isActive)
    if (activeAccounts.length >= 3) {
      const allAboveMin = activeAccounts.every(a => {
        const entry = entries.find(e => e.accountId === a.id)
        return entry && entry.views >= 250
      })
      if (allAboveMin) {
        total += 0.50
      }
    }
    
    return total
  }
  
  const getTierFromViews = (v: number) => {
    if (v < 250) return 'INVALIDE'
    if (v < 1000) return 'FAIBLE'
    if (v < 10000) return 'MOYEN'
    if (v < 50000) return 'ÉLEVÉ'
    return 'VIRAL'
  }
  
  const getRateFromViews = (v: number) => {
    if (v < 250) return 0
    if (v < 1000) return 0.50
    if (v < 10000) return 1.00
    if (v < 50000) return 1.50
    return 3.00
  }
  
  const hasCoherence = () => {
    if (!selectedVA) return false
    const activeAccounts = selectedVA.accounts.filter(a => a.isActive)
    if (activeAccounts.length < 3) return false
    
    return activeAccounts.every(a => {
      const viewCount = views[a.id] || 0
      return viewCount >= 250
    })
  }
  
  const handleSubmit = () => {
    if (!selectedVA) return
    
    for (const account of selectedVA.accounts) {
      const viewCount = views[account.id]
      if (viewCount !== undefined && viewCount > 0) {
        addEntry({
          vaId: selectedVA.id,
          accountId: account.id,
          date: selectedDate,
          views: viewCount,
          isManual: false
        })
      }
    }
    
    onSuccess?.()
  }
  
  if (vas.length === 0) {
    return (
      <GlassCard className="p-6 text-center">
        <p className="text-white/60">Aucun assistant trouvé. Ajoutez d'abord un VA.</p>
      </GlassCard>
    )
  }
  
  return (
    <GlassCard className="p-6 space-y-6">
      {/* VA Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Assistant</label>
        <div className="relative">
          <select
            value={selectedVAId}
            onChange={e => setSelectedVAId(e.target.value)}
            className="glass-input appearance-none pr-10"
          >
            <option value="">Sélectionner un VA</option>
            {vas.map(va => (
              <option key={va.id} value={va.id}>{va.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
        </div>
      </div>
      
      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="glass-input"
        />
      </div>
      
      {/* Account Views */}
      {selectedVA && (
        <div className="space-y-4">
          <h3 className="font-semibold">Vues par compte</h3>
          {selectedVA.accounts.filter(a => a.isActive).map(account => (
            <ViewsInput
              key={account.id}
              accountName={account.name}
              value={views[account.id] || 0}
              onChange={v => handleViewChange(account.id, v)}
            />
          ))}
        </div>
      )}
      
      {/* Summary */}
      {selectedVA && (
        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/60">Total du jour</span>
            <span className="font-mono font-bold text-xl">
              ${calculateTotal().toFixed(2)}
            </span>
          </div>
          {hasCoherence() && (
            <CoherenceBadge active={true} />
          )}
        </div>
      )}
      
      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!selectedVA || Object.keys(views).length === 0}
        className="glass-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Sauvegarder les entrées
      </button>
    </GlassCard>
  )
}
