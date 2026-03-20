import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface DailyHeatmapProps {
  data: { date: string; value: number }[]
  maxValue?: number
}

export function DailyHeatmap({ data, maxValue = 10 }: DailyHeatmapProps) {
  const dataMap = new Map(data.map(d => [d.date, d.value]))
  
  // Get last 15 days
  const days: Date[] = []
  const today = new Date()
  for (let i = 14; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    days.push(date)
  }
  
  const getIntensity = (value: number) => {
    const ratio = value / maxValue
    if (ratio === 0) return 'bg-white/5'
    if (ratio < 0.25) return 'bg-primary/20'
    if (ratio < 0.5) return 'bg-primary/40'
    if (ratio < 0.75) return 'bg-primary/60'
    return 'bg-primary/80'
  }
  
  return (
    <div className="grid grid-cols-15 gap-1">
      {days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const value = dataMap.get(dateStr) ?? 0
        const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        
        return (
          <div
            key={dateStr}
            className={`
              aspect-square rounded-md flex items-center justify-center text-xs
              ${getIntensity(value)}
              ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-transparent' : ''}
              cursor-pointer transition-transform hover:scale-110
            `}
            title={`${format(day, 'dd MMM', { locale: fr })}: $${value.toFixed(2)}`}
          >
            <span className="text-white/70 font-mono">
              {value > 0 ? `$${value.toFixed(0)}` : '-'}
            </span>
          </div>
        )
      })}
    </div>
  )
}
