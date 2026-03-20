import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/layout'
import { Dashboard, VAList, VADetail, VANew, DailyEntry, CycleSummary, Settings } from './pages'
import { seedDemoData } from './lib/seed'
import './styles/globals.css'

function App() {
  useEffect(() => {
    seedDemoData()
  }, [])

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
