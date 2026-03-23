import { useState } from 'react'
import { Download, Upload, RotateCcw } from 'lucide-react'
import { PageWrapper } from '../components/layout'
import { GlassCard, ConfirmModal } from '../components/ui'
import { useSettingsStore, useCycleStore } from '../store'

export function Settings() {
  const settings = useSettingsStore()
  const updateSettings = useSettingsStore(state => state.updateSettings)
  
  const exportData = useCycleStore(state => state.exportData)
  const importData = useCycleStore(state => state.importData)
  const resetAllData = useCycleStore(state => state.resetAllData)
  
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  
  const handleExportData = async () => {
    try {
      const data = await exportData()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `va-salary-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Erreur lors de l\'exportation')
    }
  }
  
  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      try {
        const text = await file.text()
        await importData(text)
        alert('Données importées avec succès!')
      } catch (err) {
        alert('Erreur lors de l\'importation')
      }
    }
    input.click()
  }
  
  const handleReset = async () => {
    await resetAllData()
  }

  return (
    <PageWrapper title="Paramètres" subtitle="Configurez l'application">
      <div className="max-w-2xl space-y-6">
        {/* Tiers Display */}
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">Paliers de rémunération</h3>
          <div className="space-y-3">
            {settings.tiers.map(tier => (
              <div
                key={tier.name}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tier.color }}
                  ></span>
                  <div>
                    <p className="font-medium">{tier.name}</p>
                    <p className="text-xs text-white/50">
                      {tier.minViews === 0 
                        ? `< ${tier.maxViews.toLocaleString()}` 
                        : tier.maxViews === Infinity
                          ? `>= ${tier.minViews.toLocaleString()}`
                          : `${tier.minViews.toLocaleString()} - ${tier.maxViews.toLocaleString()}`
                      } vues
                    </p>
                  </div>
                </div>
                <span className="font-mono">${tier.dailyRate.toFixed(2)}/jour</span>
              </div>
            ))}
          </div>
        </GlassCard>
        
        {/* Bonus & Cap */}
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">Paramètres du cycle</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Bonus de cohérence</p>
                <p className="text-xs text-white/50">
                  +$0.50/jour si tous les comptes (min 3) à 250+ vues
                </p>
              </div>
              <span className="font-mono">${settings.coherenceBonus.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Plafond du cycle</p>
                <p className="text-xs text-white/50">Maximum par cycle de 15 jours</p>
              </div>
              <span className="font-mono">${settings.cycleCap.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Langue</p>
                <p className="text-xs text-white/50">Langue de l'interface</p>
              </div>
              <select
                value={settings.language}
                onChange={e => updateSettings({ language: e.target.value as 'fr' | 'en' })}
                className="glass-input w-auto"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </GlassCard>
        
        {/* Data Management */}
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">Gestion des données (IndexedDB)</h3>
          <p className="text-sm text-white/50 mb-4">
            Vos données sont stockées de manière sécurisée dans votre navigateur. 
            Utilisez l'export pour sauvegarder et l'import pour restaurer.
          </p>
          <div className="space-y-3">
            <button onClick={handleExportData} className="glass-button secondary w-full justify-start">
              <Download className="w-4 h-4" />
              Exporter toutes les données (JSON)
            </button>
            <button onClick={handleImportData} className="glass-button secondary w-full justify-start">
              <Upload className="w-4 h-4" />
              Importer des données (JSON)
            </button>
            <button 
              onClick={() => setShowResetConfirm(true)} 
              className="glass-button danger w-full justify-start"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser toutes les données
            </button>
          </div>
        </GlassCard>
        
        {/* Reset Confirmation */}
        <ConfirmModal
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          onConfirm={handleReset}
          title="Réinitialiser les données"
          message="Êtes-vous sûr de vouloir supprimer toutes les données? Cette action est irréversible."
          confirmText="Réinitialiser"
          variant="danger"
        />
      </div>
    </PageWrapper>
  )
}
