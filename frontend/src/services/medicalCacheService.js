const DB_NAME = 'kit-ai-medical'
const STORE_NAME = 'medical-knowledge'
const META_KEY = 'meta'

const MEDICAL_SOURCE = import.meta.env.VITE_MEDICAL_SOURCE || 'static'
const MEDICAL_API_URL = import.meta.env.VITE_MEDICAL_API_URL || '/api/medical'
const MEDICAL_STATIC_URL = '/medical-knowledge.json'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

export async function getMedicalContext() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const entries = (request.result || []).filter((e) => e.id !== META_KEY)
      const content = entries
        .sort((a, b) => (a.id || '').localeCompare(b.id || ''))
        .map((e) => e.content)
        .filter(Boolean)
        .join('\n\n')
      resolve(content || 'No medical context available.')
    }
  })
}

export async function setMedicalKnowledge(entries) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const now = new Date().toISOString()
    for (const entry of entries) {
      if (!entry.id) continue
      store.put({
        id: entry.id,
        content: entry.content || '',
        version: entry.version,
        updatedAt: entry.updatedAt || now,
      })
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function getStoredVersion() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(META_KEY)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result?.version ?? 0)
  })
}

async function setStoredVersion(version) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.put({ id: META_KEY, version, updatedAt: new Date().toISOString() })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

const MEDICAL_SOURCES = [
  '/medical-knowledge.json',
  '/packs/learned.json' // Future "Topic Packs"
]

export async function fetchAndUpdate() {
  let updatedInRun = false
  
  for (const url of MEDICAL_SOURCES) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue // Skip if pack missing
      
      const data = await res.json()
      // Support both "entries" (legacy) and "guidelines" (Gemini) keys
      const entries = data.entries || data.guidelines
      
      const { version } = data
      if (!version || !Array.isArray(entries)) continue

      // We use the version of the CORE file (first one) as the "db version"
      // Or we just upsert everything and trust the individual item versions?
      // For now, let's just upsert everything we find.
      
      await setMedicalKnowledge(entries)
      updatedInRun = true

    } catch (err) {
      console.warn(`Failed to load pack ${url}:`, err)
    }
  }
  
  return updatedInRun
}
