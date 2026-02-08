import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { textToSpeech, getAvailableVoices, isOnline } from '../services/elevenlabsService'
import { useSettings } from './SettingsContext'

const TTSContext = createContext()

export function TTSProvider({ children }) {
  const { language } = useSettings()
  // Load settings from localStorage
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    const saved = localStorage.getItem('kit-ai-tts-enabled')
    return saved ? JSON.parse(saved) : true
  })

  const [voice, setVoice] = useState(() => {
    const saved = localStorage.getItem('kit-ai-tts-voice')
    // Reset to new default if saved voice is not free-tier compatible
    const freeTierVoices = ['JBFqnCBsd6RMkjVDRZzb', '21m00Tcm4TlvDq8ikWAM', 'onwK4e9ZLuTAKqWW03F9', 'XB0fDUnXU5powFXDhCwa', 'pFZP5JQG7iQjIQuC4Bku']
    if (saved && freeTierVoices.includes(saved)) {
      return saved
    }
    return 'JBFqnCBsd6RMkjVDRZzb' // Default: George (free tier)
  })

  const [speed, setSpeed] = useState(() => {
    const saved = localStorage.getItem('kit-ai-tts-speed')
    return saved ? parseFloat(saved) : 1.0
  })

  const [autoPlay, setAutoPlay] = useState(() => {
    const saved = localStorage.getItem('kit-ai-tts-autoplay')
    return saved ? JSON.parse(saved) : false
  })

  const [voices, setVoices] = useState([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null)

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem('kit-ai-tts-enabled', JSON.stringify(ttsEnabled))
  }, [ttsEnabled])

  useEffect(() => {
    localStorage.setItem('kit-ai-tts-voice', voice)
  }, [voice])

  useEffect(() => {
    localStorage.setItem('kit-ai-tts-speed', speed.toString())
  }, [speed])

  useEffect(() => {
    localStorage.setItem('kit-ai-tts-autoplay', JSON.stringify(autoPlay))
  }, [autoPlay])

  // Load available voices on mount
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const availableVoices = await getAvailableVoices()
        setVoices(availableVoices)
      } catch (error) {
        console.error('Failed to load voices:', error)
      }
    }

    if (ttsEnabled && isOnline()) {
      loadVoices()
    }
  }, [ttsEnabled])

  /**
   * Generate audio from text
   * @param {string} text - Text to convert to speech
   * @returns {Promise<Blob|null>} Audio blob or null if failed
   */
  const generateAudio = useCallback(
    async (text) => {
      if (!ttsEnabled) {
        throw new Error('TTS is disabled')
      }

      if (!isOnline()) {
        throw new Error('Cannot generate audio while offline')
      }

      try {
        const audioBlob = await textToSpeech(text, voice, language)
        return audioBlob
      } catch (error) {
        console.error('Error generating audio:', error)
        throw error
      }
    },
    [ttsEnabled, voice, language]
  )

  /**
   * Set the currently playing audio element
   * @param {HTMLAudioElement|null} audioElement - Audio element that is playing
   */
  const setPlaying = useCallback((audioElement) => {
    // Stop previous audio if exists
    if (currentlyPlaying && currentlyPlaying !== audioElement) {
      currentlyPlaying.pause()
      currentlyPlaying.currentTime = 0
    }
    setCurrentlyPlaying(audioElement)
  }, [currentlyPlaying])

  /**
   * Stop currently playing audio
   */
  const stopPlaying = useCallback(() => {
    if (currentlyPlaying) {
      currentlyPlaying.pause()
      currentlyPlaying.currentTime = 0
      setCurrentlyPlaying(null)
    }
  }, [currentlyPlaying])

  const value = {
    ttsEnabled,
    setTtsEnabled,
    voice,
    setVoice,
    speed,
    setSpeed,
    autoPlay,
    setAutoPlay,
    voices,
    generateAudio,
    setPlaying,
    stopPlaying,
    currentlyPlaying,
    isOnline: isOnline()
  }

  return <TTSContext.Provider value={value}>{children}</TTSContext.Provider>
}

export function useTTS() {
  const context = useContext(TTSContext)
  if (!context) {
    throw new Error('useTTS must be used within TTSProvider')
  }
  return context
}
