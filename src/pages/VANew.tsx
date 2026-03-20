import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageWrapper } from '../components/layout'
import { GlassCard } from '../components/ui'
import { VAForm } from '../components/forms'
import { useVAStore } from '../store'

export function VANew() {
  const navigate = useNavigate()
  const addVA = useVAStore(state => state.addVA)
  
  const handleSubmit = (data: { name: string; accounts: { name: string; platform: string }[] }) => {
    addVA(
      data.name,
      data.accounts.map(a => ({ ...a, isActive: true }))
    )
    navigate('/vas')
  }
  
  return (
    <PageWrapper
      title="Nouvel assistant"
      subtitle="Ajoutez un nouvel assistant virtuel"
      action={
        <button onClick={() => navigate('/vas')} className="glass-button secondary">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
      }
    >
      <div className="max-w-xl">
        <GlassCard className="p-6">
          <VAForm onSubmit={handleSubmit} />
        </GlassCard>
      </div>
    </PageWrapper>
  )
}
