import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Settings, Users, Plus, Trash2 } from 'lucide-react'
import { PageWrapper } from '../components/layout'
import { GlassCard, VAAvatar, TierBadge, ProgressBar, CoherenceBadge, EmptyState } from '../components/ui'
import { DailyHeatmap } from '../components/charts'
import { useVAStore, useEntryStore, useCycleStore } from '../store'
import { getCycleTotal, getProjectedCycleTotal, getDailySummary, getTier } from '../lib/salary'
import { getTodayDate, getDaysInCycle, formatDate, getLast15Days } from '../lib/utils'
import { DEFAULT_SETTINGS, CYCLE_DAYS } from '../lib/constants'

type Tab = 'overview' | 'history' | 'accounts' | 'settings'

export function VADetail() {
  const { id } = useParams<{ id: string }>()
  const va = useVAStore(state => state.getVAById(id || ''))
  const entries = useEntryStore(state => state.entries)
  const currentCycleStart = useCycleStore(state => state.currentCycleStart)
  const updateVA = useVAStore(state => state.updateVA)
  const deleteVA = useVAStore(state => state.deleteVA)
  
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const today = getTodayDate()
  
  if (!va) {
    return (
      <PageWrapper title="Assistant non trouvé">
        <EmptyState
          title="Assistant non trouvé"
          description="Cet assistant n'existe pas"
          action={
            <Link to="/vas" className="glass-button">
              Retour à la liste
            </Link>
          }
        />
      </PageWrapper>
    )
  }
  
  const cycleTotal = getCycleTotal(va, entries, currentCycleStart)
  const projectedTotal = getProjectedCycleTotal(va, entries, currentCycleStart)
  const daysElapsed = getDaysInCycle(currentCycleStart)
  const todaySummary = getDailySummary(va, today, entries)
  
  // Heatmap data
  const heatmapData = getLast15Days().map(date => {
    const summary = getDailySummary(va, date, entries)
    return { date, value: summary.totalPay + summary.coherenceBonus }
  })
  
  const tabs = [
    { id: 'overview' as Tab, label: 'Aperçu' },
    { id: 'history' as Tab, label: 'Historique' },
    { id: 'accounts' as Tab, label: 'Comptes' },
    { id: 'settings' as Tab, label: 'Paramètres' },
  ]
  
  return (
    <PageWrapper
      title={va.name}
      subtitle={`Cycle: ${formatDate(currentCycleStart)} - Jour ${daysElapsed}/${CYCLE_DAYS}`}
      action={
        <Link to="/vas" className="glass-button secondary">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
      }
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary/20 text-primary'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Cycle Progress */}
          <GlassCard className="p-6">
            <h3 className="font-semibold mb-4">Progression du cycle</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Jour {daysElapsed} sur {CYCLE_DAYS}</span>
                <span>${cycleTotal.toFixed(2)} / ${DEFAULT_SETTINGS.cycleCap}</span>
              </div>
              <ProgressBar
                value={cycleTotal}
                max={DEFAULT_SETTINGS.cycleCap}
                showLabel
                color={cycleTotal >= 95 ? 'warning' : 'primary'}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold font-mono">${cycleTotal.toFixed(2)}</p>
                <p className="text-xs text-white/50">Total actuel</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-primary">${projectedTotal.toFixed(2)}</p>
                <p className="text-xs text-white/50">Projeté</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-emerald-400">
                  ${(DEFAULT_SETTINGS.cycleCap - cycleTotal).toFixed(2)}
                </p>
                <p className="text-xs text-white/50">Restant</p>
              </div>
            </div>
          </GlassCard>
          
          {/* Account Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {va.accounts.filter(a => a.isActive).map(account => {
              const entry = todaySummary.entries.find(e => e.accountId === account.id)
              const views = entry?.views || 0
              const tier = getTier(views)
              
              return (
                <GlassCard key={account.id} className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{account.name}</h4>
                      <p className="text-xs text-white/50">{account.platform}</p>
                    </div>
                    <TierBadge tier={tier} views={views} />
                  </div>
                  <p className="text-3xl font-bold font-mono mb-2">
                    {views.toLocaleString()}
                  </p>
                  <p className="text-sm text-white/60">vues aujourd'hui</p>
                </GlassCard>
              )
            })}
          </div>
          
          {/* Today's Summary */}
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Résumé du jour</h3>
              <CoherenceBadge active={todaySummary.coherenceBonus > 0} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-white/50">Base</p>
                <p className="text-xl font-mono font-bold">${todaySummary.totalPay.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-white/50">Total</p>
                <p className="text-xl font-mono font-bold text-emerald-400">
                  ${(todaySummary.totalPay + todaySummary.coherenceBonus).toFixed(2)}
                </p>
              </div>
            </div>
            {todaySummary.missingAccounts.length > 0 && (
              <p className="text-sm text-amber-400 mt-3">
                Comptes manquants: {todaySummary.missingAccounts.join(', ')}
              </p>
            )}
          </GlassCard>
        </div>
      )}
      
      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-semibold mb-4">15 derniers jours</h3>
            <DailyHeatmap data={heatmapData} maxValue={10} />
          </GlassCard>
        </div>
      )}
      
      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Comptes</h3>
            <button className="glass-button secondary text-sm">
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>
          <div className="space-y-3">
            {va.accounts.map(account => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
              >
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-sm text-white/50">{account.platform}</p>
                </div>
                <button className="p-2 text-white/40 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
      
      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">Paramètres</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Nom</label>
              <input
                type="text"
                value={va.name}
                onChange={e => updateVA(va.id, { name: e.target.value })}
                className="glass-input"
              />
            </div>
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  if (confirm('Êtes-vous sûr de vouloir supprimer cet assistant?')) {
                    deleteVA(va.id)
                  }
                }}
                className="glass-button danger"
              >
                Supprimer l'assistant
              </button>
            </div>
          </div>
        </GlassCard>
      )}
    </PageWrapper>
  )
}
