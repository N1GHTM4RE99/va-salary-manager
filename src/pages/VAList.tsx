import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, ChevronDown } from 'lucide-react'
import { PageWrapper } from '../components/layout'
import { GlassCard, VAAvatar, TierBadge, EmptyState } from '../components/ui'
import { useVAStore, useEntryStore, useCycleStore } from '../store'
import { getCycleTotal, getDailySummary, getTier } from '../lib/salary'
import { getTodayDate } from '../lib/utils'
import type { TierName } from '../types'

export function VAList() {
  const vas = useVAStore(state => state.vas)
  const entries = useEntryStore(state => state.entries)
  const currentCycleStart = useCycleStore(state => state.currentCycleStart)
  const today = getTodayDate()
  
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<TierName | 'all'>('all')
  const [coherenceFilter, setCoherenceFilter] = useState<boolean | 'all'>('all')
  
  const filteredVAs = useMemo(() => {
    return vas.filter(va => {
      // Search filter
      if (search && !va.name.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      
      // Tier filter
      if (tierFilter !== 'all') {
        const todaySummary = getDailySummary(va, today, entries)
        const hasTier = Object.values(todaySummary.tier).includes(tierFilter)
        if (!hasTier) return false
      }
      
      // Coherence filter
      if (coherenceFilter !== 'all') {
        const todaySummary = getDailySummary(va, today, entries)
        const hasCoherence = todaySummary.coherenceBonus > 0
        if (coherenceFilter && !hasCoherence) return false
        if (!coherenceFilter && hasCoherence) return false
      }
      
      return true
    })
  }, [vas, entries, today, search, tierFilter, coherenceFilter])
  
  if (vas.length === 0) {
    return (
      <PageWrapper 
        title="Assistants" 
        subtitle="Gérez vos assistants virtuels"
        action={
          <Link to="/vas/new" className="glass-button">
            <Plus className="w-4 h-4" />
            Ajouter un VA
          </Link>
        }
      >
        <EmptyState
          icon={<Plus className="w-16 h-16" />}
          title="Aucun assistant trouvé"
          description="Commencez par ajouter votre premier assistant virtuel"
          action={
            <Link to="/vas/new" className="glass-button">
              Ajouter un VA
            </Link>
          }
        />
      </PageWrapper>
    )
  }
  
  return (
    <PageWrapper 
      title="Assistants" 
      subtitle="Gérez vos assistants virtuels"
      action={
        <Link to="/vas/new" className="glass-button">
          <Plus className="w-4 h-4" />
          Ajouter un VA
        </Link>
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="glass-input pl-10"
          />
        </div>
        
        <select
          value={tierFilter}
          onChange={e => setTierFilter(e.target.value as TierName | 'all')}
          className="glass-input w-auto"
        >
          <option value="all">Tous les paliers</option>
          <option value="VIRAL">VIRAL</option>
          <option value="ÉLEVÉ">ÉLEVÉ</option>
          <option value="MOYEN">MOYEN</option>
          <option value="FAIBLE">FAIBLE</option>
          <option value="INVALIDE">INVALIDE</option>
        </select>
        
        <select
          value={coherenceFilter === 'all' ? 'all' : coherenceFilter ? 'true' : 'false'}
          onChange={e => {
            if (e.target.value === 'all') setCoherenceFilter('all')
            else setCoherenceFilter(e.target.value === 'true')
          }}
          className="glass-input w-auto"
        >
          <option value="all">Cohérence</option>
          <option value="true">Avec bonus</option>
          <option value="false">Sans bonus</option>
        </select>
      </div>
      
      {/* VA Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {filteredVAs.map(va => {
          const cycleTotal = getCycleTotal(va, entries, currentCycleStart)
          const todaySummary = getDailySummary(va, today, entries)
          const tiers = va.accounts.map(a => {
            const entry = todaySummary.entries.find(e => e.accountId === a.id)
            return entry ? getTier(entry.views) : 'INVALIDE'
          })
          
          return (
            <Link key={va.id} to={`/vas/${va.id}`}>
              <GlassCard className="p-5 h-full">
                <div className="flex items-start gap-4 mb-4">
                  <VAAvatar name={va.name} size="lg" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{va.name}</h3>
                    <p className="text-sm text-white/50">
                      {va.accounts.filter(a => a.isActive).length} compte{va.accounts.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {tiers.map((tier, i) => (
                    <TierBadge key={i} tier={tier} size="sm" showTooltip={false} />
                  ))}
                </div>
                
                <div className="flex justify-between items-end pt-3 border-t border-white/10">
                  <div>
                    <p className="text-xs text-white/50">Cycle en cours</p>
                    <p className="font-mono font-bold text-xl">${cycleTotal.toFixed(2)}</p>
                  </div>
                  {todaySummary.coherenceBonus > 0 && (
                    <div className="text-right">
                      <span className="text-xs text-emerald-400">Bonus cohérence</span>
                      <p className="font-mono text-emerald-400">+${todaySummary.coherenceBonus.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </Link>
          )
        })}
      </div>
      
      {filteredVAs.length === 0 && (
        <EmptyState
          title="Aucun résultat"
          description="Essayez avec d'autres filtres"
        />
      )}
    </PageWrapper>
  )
}
