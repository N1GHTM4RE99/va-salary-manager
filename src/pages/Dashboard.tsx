import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, DollarSign, TrendingUp, Award, ArrowRight, AlertTriangle } from 'lucide-react'
import { PageWrapper } from '../components/layout'
import { KPICard, GlassCard, VAAvatar, TierBadge, ProgressBar, EmptyState, AlertBanner } from '../components/ui'
import { SparklineChart } from '../components/charts'
import { useVAStore, useEntryStore, useCycleStore } from '../store'
import { getCycleTotal, getDailySummary, getTier } from '../lib/salary'
import { getTodayDate, getLast7Days, formatDateShort, getDaysInCycle } from '../lib/utils'
import { DEFAULT_SETTINGS } from '../lib/constants'

export function Dashboard() {
  const vas = useVAStore(state => state.vas)
  const entries = useEntryStore(state => state.entries)
  const currentCycleStart = useCycleStore(state => state.currentCycleStart)
  const today = getTodayDate()
  
  // KPI Calculations
  const stats = useMemo(() => {
    const activeVAs = vas.filter(va => va.accounts.some(a => a.isActive))
    
    let totalPayout = 0
    let viralAccounts = 0
    let coherenceActive = 0
    
    for (const va of activeVAs) {
      totalPayout += getCycleTotal(va, entries, currentCycleStart)
      
      // Today's stats
      const todaySummary = getDailySummary(va, today, entries)
      for (const [, tier] of Object.entries(todaySummary.tier)) {
        if (tier === 'VIRAL') viralAccounts++
      }
      if (todaySummary.coherenceBonus > 0) coherenceActive++
    }
    
    return {
      activeVAs: activeVAs.length,
      totalPayout,
      viralAccounts,
      coherenceActive
    }
  }, [vas, entries, currentCycleStart, today])
  
  // Leaderboard
  const leaderboard = useMemo(() => {
    return vas.map(va => {
      const cycleTotal = getCycleTotal(va, entries, currentCycleStart)
      const todaySummary = getDailySummary(va, today, entries)
      
      // Get tiers for each account
      const tiers = va.accounts.map(a => {
        const entry = todaySummary.entries.find(e => e.accountId === a.id)
        return entry ? getTier(entry.views) : 'INVALIDE'
      })
      
      return {
        va,
        cycleTotal,
        dailyTotal: todaySummary.totalPay + todaySummary.coherenceBonus,
        tiers,
        isNearCap: cycleTotal >= 95
      }
    }).sort((a, b) => b.cycleTotal - a.cycleTotal)
  }, [vas, entries, currentCycleStart, today])
  
  // Chart data for last 7 days
  const chartData = useMemo(() => {
    const days = getLast7Days()
    return days.map(date => {
      let total = 0
      for (const va of vas) {
        const summary = getDailySummary(va, date, entries)
        total += summary.totalPay + summary.coherenceBonus
      }
      return {
        date: formatDateShort(date),
        amount: total
      }
    })
  }, [vas, entries])
  
  // Alerts
  const alerts = useMemo(() => {
    const alertList: { type: 'warning' | 'danger'; message: string }[] = []
    
    for (const va of vas) {
      const todaySummary = getDailySummary(va, today, entries)
      
      // Missing reports
      if (todaySummary.missingAccounts.length > 0) {
        alertList.push({
          type: 'warning',
          message: `${va.name}: ${todaySummary.missingAccounts.join(', ')} sans rapport aujourd'hui`
        })
      }
      
      // Near tier upgrade (9000-9999)
      for (const entry of todaySummary.entries) {
        if (entry.views >= 9000 && entry.views < 10000) {
          const account = va.accounts.find(a => a.id === entry.accountId)
          if (account) {
            alertList.push({
              type: 'warning',
              message: `${account.name} à ${entry.views.toLocaleString()} vues — proche d'ÉLÉVÉ!`
            })
          }
        }
      }
    }
    
    return alertList
  }, [vas, entries, today])
  
  if (vas.length === 0) {
    return (
      <PageWrapper title="Dashboard" subtitle="Vue d'ensemble de vos assistants">
        <EmptyState
          icon={<Users className="w-16 h-16" />}
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
    <PageWrapper title="Dashboard" subtitle="Vue d'ensemble de vos assistants">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        <KPICard
          label="VAs actifs"
          value={stats.activeVAs}
          icon={<Users className="w-6 h-6" />}
        />
        <KPICard
          label="Payout du cycle"
          value={stats.totalPayout}
          icon={<DollarSign className="w-6 h-6" />}
        />
        <KPICard
          label="Comptes VIRAL"
          value={stats.viralAccounts}
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <KPICard
          label="Bonus cohérence"
          value={stats.coherenceActive}
          icon={<Award className="w-6 h-6" />}
        />
      </div>
      
      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Classement</h2>
              <Link to="/cycle" className="text-primary text-sm flex items-center gap-1 hover:text-primary/80">
                Voir tout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {leaderboard.map(({ va, cycleTotal, dailyTotal, tiers, isNearCap }, index) => (
                <Link
                  key={va.id}
                  to={`/vas/${va.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <span className="text-2xl font-bold text-white/30 w-8">
                    {index + 1}
                  </span>
                  <VAAvatar name={va.name} size="md" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{va.name}</span>
                      {isNearCap && (
                        <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                          Plafond proche
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {tiers.map((tier, i) => (
                        <TierBadge key={i} tier={tier} size="sm" showTooltip={false} />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold">${cycleTotal.toFixed(2)}</p>
                    <p className="text-xs text-white/50">${dailyTotal.toFixed(2)}/jour</p>
                  </div>
                  <div className="w-24">
                    <ProgressBar
                      value={cycleTotal}
                      max={DEFAULT_SETTINGS.cycleCap}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>
        </div>
        
        {/* Mini Chart */}
        <div>
          <GlassCard className="p-6 h-full">
            <h2 className="text-xl font-semibold mb-4">7 derniers jours</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis 
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(20,20,30,0.95)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px'
                  }}
                  formatter={(value) => [`${Number(value).toFixed(2)}`, 'Total']}
                />
                <Bar dataKey="amount" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      </div>
      
      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <AlertBanner key={i} type={alert.type}>
                {alert.message}
              </AlertBanner>
            ))}
          </div>
        )}
        
        {/* Quick Entry */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-4">Saisie rapide</h2>
          <p className="text-white/60 mb-4">Enregistrez les vues du jour rapidement</p>
          <Link to="/entry" className="glass-button">
            Nouvelle entrée
          </Link>
        </GlassCard>
      </div>
    </PageWrapper>
  )
}
