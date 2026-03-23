import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/layout'
import { Dashboard, VAList, VADetail, VANew, DailyEntry, CycleSummary, Settings } from './pages'
import { seedDemoData } from './lib/seed'
import { useVAStore, useEntryStore, useCycleStore, useSettingsStore } from './store'
import './styles/globals.css'

function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const vaInitialize = useVAStore(state => state.initialize)
  const entryInitialize = useEntryStore(state => state.initialize)
  const cycleInitialize = useCycleStore(state => state.initialize)
  const settingsInitialize = useSettingsStore(state => state.initialize)
  const vas = useVAStore(state => state.vas)
  
  useEffect(() => {
    const init = async () => {
      await Promise.all([
        vaInitialize(),
        entryInitialize(),
        cycleInitialize(),
        settingsInitialize()
      ])
      
      // Seed demo data if no VA exists
      if (vas.length === 0) {
        seedDemoData()
      }
      
      setIsInitialized(true)
    }
    
    init()
  }, [])
  
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-white/60">Chargement...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="bg-blobs">
        <div className="bg-blob bg-blob-1"></div>
        <div className="bg-blob bg-blob-2"></div>
        <div className="bg-blob bg-blob-3"></div>
      </div>
      
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="vas" element={<VAList />} />
          <Route path="vas/new" element={<VANew />} />
          <Route path="vas/:id" element={<VADetail />} />
          <Route path="entry" element={<DailyEntry />} />
          <Route path="cycle" element={<CycleSummary />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(20, 20, 30, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            color: 'white'
          }
        }}
      />
    </BrowserRouter>
  )
}

export default App
