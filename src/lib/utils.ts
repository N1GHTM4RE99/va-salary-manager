import { format, parseISO, subDays, addDays, isToday, isYesterday } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatDate(date: string | Date, formatStr: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: fr })
}

export function formatDateShort(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  if (isToday(dateObj)) return "Aujourd'hui"
  if (isYesterday(dateObj)) return 'Hier'
  
  return format(dateObj, 'dd MMM', { locale: fr })
}

export function getTodayDate(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getCycleStartDate(): string {
  const today = new Date()
  const dayOfMonth = today.getDate()
  
  // Cycle starts on 1st or 16th of month
  if (dayOfMonth >= 16) {
    return format(new Date(today.getFullYear(), today.getMonth(), 16), 'yyyy-MM-dd')
  }
  return format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd')
}

export function getCycleDates(startDate: string): { start: Date; end: Date } {
  const start = parseISO(startDate)
  const end = addDays(start, 14)
  return { start, end }
}

export function getDaysInCycle(cycleStartDate: string): number {
  const today = new Date()
  const start = parseISO(cycleStartDate)
  const diffTime = today.getTime() - start.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.min(Math.max(diffDays, 0), 15)
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    days.push(format(subDays(new Date(), i), 'yyyy-MM-dd'))
  }
  return days
}

export function getLast15Days(): string[] {
  const days: string[] = []
  for (let i = 14; i >= 0; i--) {
    days.push(format(subDays(new Date(), i), 'yyyy-MM-dd'))
  }
  return days
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
