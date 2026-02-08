const DB_NAME = 'kit-ai-medical'
const STORE_NAME = 'medical-knowledge'
const META_KEY = 'meta'

// Budget: ~2000 tokens for medical context ≈ 7000 characters.
// Leaves room for system prompt, chat history, user message, and model response
// within the 4096-token context window.
const MAX_CONTEXT_CHARS = 7000

const MEDICAL_SOURCE = import.meta.env.VITE_MEDICAL_SOURCE || 'static'
const MEDICAL_API_URL = import.meta.env.VITE_MEDICAL_API_URL || '/api/medical'
const MEDICAL_STATIC_URL = '/medical-knowledge.json'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2) // Bumped version to force re-populate
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

/**
 * Convert a structured guideline object into a readable text block
 * that a language model can use as reference material.
 */
function guidelineToContent(entry) {
  // If the entry already has a plain-text content string, use it as-is
  if (entry.content && typeof entry.content === 'string' && entry.content.trim()) {
    return entry.content
  }

  // Otherwise, build readable text from structured fields
  const parts = []
  const title = (entry.id || 'Unknown').replace(/_/g, ' ')
  parts.push(`## ${title}`)

  if (Array.isArray(entry.keywords) && entry.keywords.length > 0) {
    parts.push(`Related terms: ${entry.keywords.join(', ')}`)
  }

  if (Array.isArray(entry.steps) && entry.steps.length > 0) {
    parts.push('Steps:')
    entry.steps.forEach((step, i) => {
      parts.push(`${i + 1}. ${step}`)
    })
  }

  if (Array.isArray(entry.red_flags) && entry.red_flags.length > 0) {
    parts.push('Red flags (seek emergency help):')
    entry.red_flags.forEach((flag) => {
      parts.push(`- ${flag}`)
    })
  }

  return parts.join('\n')
}

/**
 * Load all entries from IndexedDB (excluding meta).
 */
async function getAllEntries() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const entries = (request.result || []).filter((e) => e.id !== META_KEY)
      resolve(entries)
    }
  })
}

/**
 * Get all medical context concatenated (used for checking if DB is populated).
 */
export async function getMedicalContext() {
  const entries = await getAllEntries()
  const content = entries
    .sort((a, b) => (a.id || '').localeCompare(b.id || ''))
    .map((e) => e.content)
    .filter(Boolean)
    .join('\n\n')
  return content || ''
}

/**
 * Score how relevant a stored entry is to the user's query.
 * Higher score = more relevant.
 */
function scoreEntry(entry, queryLower) {
  let score = 0
  const idLower = (entry.id || '').toLowerCase().replace(/_/g, ' ')

  // Direct ID match (strongest signal)
  if (queryLower.includes(idLower) || idLower.includes(queryLower)) {
    score += 10
  }

  // Keyword matches stored in the content text
  // Extract keywords from "Related terms: ..." line if present
  const content = (entry.content || '').toLowerCase()
  const relatedMatch = content.match(/related terms:\s*(.+)/i)
  if (relatedMatch) {
    const keywords = relatedMatch[1].split(',').map((k) => k.trim())
    for (const kw of keywords) {
      if (kw && queryLower.includes(kw)) {
        score += 5
      } else if (kw && kw.split(' ').some((word) => word.length > 2 && queryLower.includes(word))) {
        score += 2
      }
    }
  }

  // Check if individual query words appear in the content
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2)
  for (const word of queryWords) {
    if (content.includes(word)) {
      score += 1
    }
  }

  return score
}

/**
 * Retrieve medical context relevant to a user query, capped to fit within
 * the model's context window.
 *
 * @param {string} query - The user's message
 * @param {number} [maxChars] - Maximum characters to return
 * @returns {Promise<string>} Relevant medical context text
 */
export async function getRelevantMedicalContext(query, maxChars = MAX_CONTEXT_CHARS) {
  const entries = await getAllEntries()
  if (entries.length === 0) return ''

  const queryLower = (query || '').toLowerCase()

  // Score and sort entries by relevance
  const scored = entries
    .map((entry) => ({ entry, score: scoreEntry(entry, queryLower) }))
    .filter((s) => s.entry.content) // must have content
    .sort((a, b) => b.score - a.score)

  // Take top-scoring entries that fit within the character budget
  const selected = []
  let totalChars = 0

  for (const { entry, score } of scored) {
    // Only include entries with some relevance, or fill up to 3 if nothing matches
    if (score === 0 && selected.length >= 3) break

    const contentLen = entry.content.length
    if (totalChars + contentLen > maxChars && selected.length > 0) break

    selected.push(entry.content)
    totalChars += contentLen + 2 // +2 for the \n\n separator
  }

  return selected.join('\n\n')
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
        content: guidelineToContent(entry),
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

      await setMedicalKnowledge(entries)
      updatedInRun = true

    } catch (err) {
      console.warn(`Failed to load pack ${url}:`, err)
    }
  }

  return updatedInRun
}

/**
 * Ensure medical knowledge is populated in IndexedDB.
 * If the cache is empty, loads from the bundled static file.
 * This runs regardless of network status so first-time offline users have data.
 */
export async function ensureMedicalData() {
  try {
    const existing = await getMedicalContext()
    if (existing && existing.trim().length > 0) {
      return // Already populated
    }
    // Cache is empty — load from the static bundled file
    await fetchAndUpdate()
  } catch (err) {
    console.warn('Failed to ensure medical data:', err)
  }
}
