import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const API_URL = process.env.MEDICAL_API_URL || 'http://localhost:3001/api/medical'
const API_KEY = process.env.MEDICAL_API_KEY

const defaultPath = join(__dirname, '../../frontend/public/medical-knowledge.json')
const jsonPath = process.argv[2] || defaultPath

async function ingest() {
  let data
  try {
    const content = readFileSync(jsonPath, 'utf-8')
    data = JSON.parse(content)
  } catch (err) {
    console.error('Failed to read JSON:', err.message)
    process.exit(1)
  }

  const { version, entries } = data
  if (!version || !Array.isArray(entries)) {
    console.error('Invalid format: need { version, entries }')
    process.exit(1)
  }

  const headers = { 'Content-Type': 'application/json' }
  if (API_KEY) headers['X-API-Key'] = API_KEY

  const res = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ version, entries }),
  })

  if (!res.ok) {
    console.error('POST failed:', res.status, await res.text())
    process.exit(1)
  }

  console.log('Ingested', entries.length, 'entries, version', version)
}

ingest().catch((err) => {
  console.error(err)
  process.exit(1)
})
