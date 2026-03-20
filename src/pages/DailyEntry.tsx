import { PageWrapper } from '../components/layout'
import { EntryForm } from '../components/forms'
import { GlassCard } from '../components/ui'
import { useVAStore } from '../store'
import toast from 'react-hot-toast'

export function DailyEntry() {
  const vas = useVAStore(state => state.vas)
  
  
  const handleSuccess = () => {
    toast.success('Entrées sauvegardées avec succès!')
  }
  
  return (
    <PageWrapper
      title="Saisie quotidienne"
      subtitle="Enregistrez les vues de vos assistants"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EntryForm onSuccess={handleSuccess} />
        
        {/* Quick Stats */}
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">Guide des paliers</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                <span>INVALIDE</span>
              </div>
              <span className="text-white/60">&lt; 250 vues</span>
              <span className="font-mono">$0.00</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>FAIBLE</span>
              </div>
              <span className="text-white/60">250 - 999 vues</span>
              <span className="font-mono">$0.50</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-500"></span>
                <span>MOYEN</span>
              </div>
              <span className="text-white/60">1,000 - 9,999 vues</span>
              <span className="font-mono">$1.00</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-violet-500"></span>
                <span>ÉLEVÉ</span>
              </div>
              <span className="text-white/60">10,000 - 49,999</span>
              <span className="font-mono">$1.50</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                <span>VIRAL</span>
              </div>
              <span className="text-white/60">50,000+ vues</span>
              <span className="font-mono">$3.00</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/10">
            <h4 className="font-semibold mb-2">Bonus de cohérence</h4>
            <p className="text-sm text-white/60">
              +$0.50/jour si tous les comptes (min 3) ont au moins 250 vues
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <h4 className="font-semibold mb-2">Plafond</h4>
            <p className="text-sm text-white/60">
              Maximum $100 par cycle de 15 jours
            </p>
          </div>
        </GlassCard>
      </div>
    </PageWrapper>
  )
}
