import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Wallet, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/vas', icon: Users, label: 'Assistants' },
  { path: '/entry', icon: ClipboardList, label: 'Saisie' },
  { path: '/cycle', icon: Wallet, label: 'Cycle' },
  { path: '/settings', icon: Settings, label: 'Paramètres' },
]

export function Sidebar() {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div 
      className={`sidebar ${expanded ? 'expanded' : ''}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="p-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {expanded && (
            <span className="font-display font-bold text-lg whitespace-nowrap">
              VA Manager
            </span>
          )}
        </div>
      </div>
      
      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {expanded && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-white/8">
        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          {expanded ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
}
