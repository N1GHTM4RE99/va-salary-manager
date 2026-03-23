import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { VA, DailyEntry, AppSettings } from '../types'

interface VASalaryDB extends DBSchema {
  vas: {
    key: string
    value: VA
  }
  entries: {
    key: string
    value: DailyEntry
    indexes: { 'by-va': string; 'by-date': string }
  }
  settings: {
    key: string
    value: AppSettings
  }
  cycle: {
    key: string
    value: { currentCycleStart: string }
  }
}

const DB_NAME = 'va-salary-db'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<VASalaryDB>> | null = null

export async function getDB(): Promise<IDBPDatabase<VASalaryDB>> {
  if (!dbPromise) {
    dbPromise = openDB<VASalaryDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // VA Store
        if (!db.objectStoreNames.contains('vas')) {
          db.createObjectStore('vas', { keyPath: 'id' })
        }
        
        // Entries Store
        if (!db.objectStoreNames.contains('entries')) {
          const entryStore = db.createObjectStore('entries', { keyPath: 'id' })
          entryStore.createIndex('by-va', 'vaId')
          entryStore.createIndex('by-date', 'date')
        }
        
        // Settings Store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }
        
        // Cycle Store
        if (!db.objectStoreNames.contains('cycle')) {
          db.createObjectStore('cycle', { keyPath: 'key' })
        }
      }
    })
  }
  return dbPromise
}

// VA Operations
export async function getAllVAs(): Promise<VA[]> {
  const db = await getDB()
  return db.getAll('vas')
}

export async function getVA(id: string): Promise<VA | undefined> {
  const db = await getDB()
  return db.get('vas', id)
}

export async function saveVA(va: VA): Promise<void> {
  const db = await getDB()
  await db.put('vas', va)
}

export async function deleteVA(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('vas', id)
}

// Entry Operations
export async function getAllEntries(): Promise<DailyEntry[]> {
  const db = await getDB()
  return db.getAll('entries')
}

export async function getEntriesByVA(vaId: string): Promise<DailyEntry[]> {
  const db = await getDB()
  return db.getAllFromIndex('entries', 'by-va', vaId)
}

export async function getEntriesByDate(date: string): Promise<DailyEntry[]> {
  const db = await getDB()
  return db.getAllFromIndex('entries', 'by-date', date)
}

export async function saveEntry(entry: DailyEntry): Promise<void> {
  const db = await getDB()
  await db.put('entries', entry)
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('entries', id)
}

// Settings Operations
export async function getSettings(): Promise<AppSettings | undefined> {
  const db = await getDB()
  return db.get('settings', 'app-settings')
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB()
  await db.put('settings', { ...settings, key: 'app-settings' } as AppSettings & { key: string })
}

// Cycle Operations
export async function getCycle(): Promise<{ currentCycleStart: string } | undefined> {
  const db = await getDB()
  return db.get('cycle', 'current')
}

export async function saveCycle(cycle: { currentCycleStart: string }): Promise<void> {
  const db = await getDB()
  await db.put('cycle', { ...cycle, key: 'current' } as { currentCycleStart: string; key: string })
}

// Export all data as JSON
export async function exportAllData(): Promise<string> {
  const vas = await getAllVAs()
  const entries = await getAllEntries()
  const settings = await getSettings()
  const cycle = await getCycle()
  
  return JSON.stringify({ vas, entries, settings, cycle }, null, 2)
}

// Import data from JSON
export async function importData(data: string): Promise<void> {
  const parsed = JSON.parse(data)
  const db = await getDB()
  
  const tx = db.transaction(['vas', 'entries', 'settings', 'cycle'], 'readwrite')
  
  if (parsed.vas) {
    for (const va of parsed.vas) {
      await tx.objectStore('vas').put(va)
    }
  }
  
  if (parsed.entries) {
    for (const entry of parsed.entries) {
      await tx.objectStore('entries').put(entry)
    }
  }
  
  if (parsed.settings) {
    await tx.objectStore('settings').put({ ...parsed.settings, key: 'app-settings' })
  }
  
  if (parsed.cycle) {
    await tx.objectStore('cycle').put({ ...parsed.cycle, key: 'current' })
  }
  
  await tx.done
}

// Clear all data
export async function clearAllData(): Promise<void> {
  const db = await getDB()
  await db.clear('vas')
  await db.clear('entries')
  await db.clear('settings')
  await db.clear('cycle')
}