import { useMemo } from 'react'
import { Download, CheckCircle, XCircle } from 'lucide-react'
import { PageWrapper } from '../components/layout'
import { GlassCard, VAAvatar, ProgressBar, ConfirmModal, EmptyState } from '../components/ui'
import { useVAStore, useEntryStore, useCycleStore } from '../store'
import { getCycleTotal, getDailySummary } from '../lib/salary'
import { formatDate, getDaysInCycle, getTodayDate } from '../lib/utils'
import { DEFAULT_SETTINGS, CYCLE_DAYS } from '../lib/constants'
import { useState } from 'react'

export function CycleSummary() {
  const vas = useVAStore(state => state.vas)
  const entries = useEntryStore(state => state.entries)
  const currentCycleStart = useCycleStore(state => state.currentCycleStart)
  const closeCycle = useCycleStore(state => state.closeCycle)
  
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const today = getTodayDate()
  const daysElapsed = getDaysInCycle(currentCycleStart)
  
  const cycleData = useMemo(() => {
    return vas.map(va => {
      const cycleTotal = getCycleTotal(va, entries, currentCycleStart)
      const todaySummary = getDailySummary(va, today, entries)
      
      // Count days with coherence bonus
      let coherenceDays = 0
      
      return {
        va,
        cycleTotal,
        daysActive: daysElapsed,
        coherenceDays,
        isCapped: cycleTotal >= DEFAULT_SETTINGS.cycleCap
      }
    })
  }, [vas, entries, currentCycleStart, today, daysElapsed])
  
  const totalPayout = cycleData.reduce((sum, d) => sum + d.cycleTotal, 0)
  
  const handleExport = () => {
    // Create CSV
    const headers = ['VA', 'Jours actifs', 'Total', 'Bonus cohérence', 'Plafond atteint']
    const rows = cycleData.map(d => [
      d.va.name,
      d.daysActive.toString(),
      d.cycleTotal.toFixed(2),
      d.coherenceDays.toString(),
      d.isCapped ? 'Oui' : 'Non'
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cycle-${currentCycleStart}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const handleCloseCycle = () => {
    closeCycle()
    setShowCloseConfirm(false)
  }
  
  if (vas.length === 0) {
    return (
      <PageWrapper title="Cycle" subtitle="Résumé des paiements du cycle">
        <EmptyState
          title="Aucun assistant trouvé"
          description="Ajoutez des assistants pour voir les données du cycle"
        />
      </PageWrapper>
    )
  }
  
  return (
    <PageWrapper
      title="Cycle"
      subtitle={`Cycle du ${formatDate(currentCycleStart)} - Jour ${daysElapsed}/${CYCLE_DAYS}`}
      action={
        <div className="flex gap-3">
          <button onClick={handleExport} className="glass-button secondary">
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
          <button onClick={() => setShowCloseConfirm(true)} className="glass-button">
            Clôturer le cycle
          </button>
        </div>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <GlassCard className="p-5">
          <p className="text-sm text-white/50 mb-1">Total payout cycle</p>
          <p className="text-3xl font-bold font-mono">${totalPayout.toFixed(2)}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-sm text-white/50 mb-1">VAs actifs</p>
          <p className="text-3xl font-bold">{vas.length}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-sm text-white/50 mb-1">Progression</p>
          <p className="text-3xl font-bold">{daysElapsed}/{CYCLE_DAYS} jours</p>
        </GlassCard>
      </div>
      
      {/* Table */}
      <GlassCard className="overflow-hidden">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Assistant</th>
              <th>Jours actifs</th>
              <th>Total gagné</th>
              <th>Cohérence</th>
              <th>Plafond</th>
              <th>Progression</th>
            </tr>
          </thead>
          <tbody>
            {cycleData.map(({ va, cycleTotal, daysActive, coherenceDays, isCapped }) => (
              <tr key={va.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <VAAvatar name={va.name} size="sm" />
                    <span className="font-medium">{va.name}</span>
                  </div>
                </td>
                <td>{daysActive}</td>
                <td className="font-mono font-bold">${cycleTotal.toFixed(2)}</td>
                <td>{coherenceDays} jours</td>
                <td>
                  {isCapped ? (
                    <span className="flex items-center gap-1 text-amber-400">
                      <XCircle className="w-4 h-4" />
                      Atteint
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-white/50">
                      <CheckCircle className="w-4 h-4" />
                      Non
                    </span>
                  )}
                </td>
                <td className="w-32">
                  <ProgressBar
                    value={cycleTotal}
                    max={DEFAULT_SETTINGS.cycleCap}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
      
      {/* Close Cycle Modal */}
      <ConfirmModal
        isOpen={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        onConfirm={handleCloseCycle}
        title="Clôturer le cycle"
        message={`Êtes-vous sûr de vouloir clôturer le cycle actuel? Un nouveau cycle de 15 jours sera démarré.`}
        confirmText="Clôturer"
        variant="danger"
      />
    </PageWrapper>
  )
}
