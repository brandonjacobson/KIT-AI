// Backend API URL - calls our secure backend instead of ElevenLabs directly
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

/**
 * Check if the browser is online
 * @returns {boolean} True if online, false otherwise
 */
export function isOnline() {
  return navigator.onLine
}

/**
 * Convert text to speech using backend proxy
 * @param {string} text - The text to convert to speech
 * @param {string} voiceId - The ElevenLabs voice ID to use
 * @param {string} languageCode - ISO 639-1 language code (en, es, fr, etc.)
 * @returns {Promise<Blob|null>} Audio blob or null if failed
 */
export async function textToSpeech(text, voiceId = 'JBFqnCBsd6RMkjVDRZzb', languageCode = 'en') { // Default: George (free tier)
  try {
    // Check if online
    if (!isOnline()) {
      throw new Error('Cannot generate speech while offline')
    }

    // Check text length (ElevenLabs has a ~5000 character limit for most tiers)
    if (text.length > 5000) {
      console.warn(`Text length (${text.length}) exceeds recommended limit. May fail or be truncated.`)
    }

    // Call backend API instead of ElevenLabs directly
    const response = await fetch(`${BACKEND_URL}/api/tts/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, voiceId, languageCode })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate speech`)
    }

    // Convert response to blob
    const blob = await response.blob()
    return blob
  } catch (error) {
    console.error('Error generating speech:', error)
    throw error
  }
}

/**
 * Get list of available voices from backend
 * @returns {Promise<Array>} Array of voice objects with id and name
 */
export async function getAvailableVoices() {
  try {
    // Check if online
    if (!isOnline()) {
      throw new Error('Cannot fetch voices while offline')
    }

    // Fetch voices from backend
    const response = await fetch(`${BACKEND_URL}/api/tts/voices`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch voices`)
    }

    const data = await response.json()
    return data.voices || []
  } catch (error) {
    console.error('Error fetching voices:', error)
    // Return default voices as fallback (free tier compatible)
    return [
      { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', descriptionKey: 'voiceGeorge', category: 'premade' },
      { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', descriptionKey: 'voiceRachel', category: 'premade' },
      { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', descriptionKey: 'voiceDaniel', category: 'premade' },
      { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', descriptionKey: 'voiceCharlotte', category: 'premade' },
      { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', descriptionKey: 'voiceLily', category: 'premade' }
    ]
  }
}

/**
 * Test connection to backend TTS service
 * @returns {Promise<boolean>} True if connection successful, false otherwise
 */
export async function testConnection() {
  try {
    if (!isOnline()) {
      return false
    }

    const response = await fetch(`${BACKEND_URL}/api/tts/health`)
    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.status === 'ok'
  } catch (error) {
    console.error('Connection test failed:', error)
    return false
  }
}

export default {
  textToSpeech,
  getAvailableVoices,
  testConnection,
  isOnline
}
