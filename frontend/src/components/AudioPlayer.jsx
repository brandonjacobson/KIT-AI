import { useState, useRef, useEffect } from 'react'
import { useTTS } from '../contexts/TTSContext'
import { useSettings } from '../contexts/SettingsContext'

function AudioPlayer({ messageContent, messageId }) {
  const [state, setState] = useState('idle') // idle, generating, ready, playing, paused, error
  const [audioBlob, setAudioBlob] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const audioRef = useRef(null)
  const audioUrlRef = useRef(null)

  const { generateAudio, speed, ttsEnabled, setPlaying, isOnline } = useTTS()
  const { t } = useSettings()

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  // Update audio playback speed when speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
    }
  }, [speed])

  const handleGenerate = async () => {
    if (!ttsEnabled) {
      setErrorMessage('TTS is disabled')
      setState('error')
      return
    }

    if (!isOnline) {
      setErrorMessage('Offline - TTS unavailable')
      setState('error')
      return
    }

    setState('generating')
    setErrorMessage('')

    try {
      const blob = await generateAudio(messageContent)
      setAudioBlob(blob)

      // Create audio element
      const url = URL.createObjectURL(blob)
      audioUrlRef.current = url

      const audio = new Audio(url)
      audio.playbackRate = speed
      audioRef.current = audio

      // Set up event listeners
      audio.addEventListener('ended', () => {
        setState('ready')
        setPlaying(null)
      })

      audio.addEventListener('pause', () => {
        if (audio.currentTime < audio.duration) {
          setState('paused')
        }
      })

      audio.addEventListener('play', () => {
        setState('playing')
        setPlaying(audio)
      })

      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e)
        setErrorMessage('Playback failed')
        setState('error')
      })

      // Auto-play after generation
      setState('ready')
      audio.play().catch((e) => {
        console.warn('Auto-play blocked:', e)
        // Browser may block auto-play, user can click to play
      })
    } catch (error) {
      console.error('Error generating audio:', error)
      setErrorMessage(error.message || 'Generation failed')
      setState('error')
    }
  }

  const handlePlay = () => {
    if (audioRef.current && state === 'ready') {
      audioRef.current.play()
    } else if (audioRef.current && state === 'paused') {
      audioRef.current.play()
    }
  }

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (state === 'idle') {
        handleGenerate()
      } else if (state === 'ready' || state === 'paused') {
        handlePlay()
      } else if (state === 'playing') {
        handlePause()
      }
    }
  }

  // Don't render if TTS is disabled
  if (!ttsEnabled) {
    return null
  }

  return (
    <div className="inline-flex items-center mt-2">
      {state === 'idle' && (
        <button
          onClick={handleGenerate}
          onKeyDown={handleKeyPress}
          aria-label={t('ttsPlay') || 'Play audio'}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-kit-dark-bg-lighter transition-colors duration-300 group"
          title={t('ttsPlay') || 'Play audio'}
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-kit-dark-text-muted group-hover:text-kit-teal dark:group-hover:text-kit-teal transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        </button>
      )}

      {state === 'generating' && (
        <div className="p-2" title={t('ttsGenerating') || 'Generating audio...'}>
          <div className="w-5 h-5 border-2 border-kit-teal dark:border-kit-teal border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {(state === 'ready' || state === 'paused') && (
        <button
          onClick={handlePlay}
          onKeyDown={handleKeyPress}
          aria-label={t('ttsPlay') || 'Play audio'}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-kit-dark-bg-lighter transition-colors duration-300 group"
          title={t('ttsPlay') || 'Play audio'}
        >
          <svg
            className="w-5 h-5 text-kit-teal dark:text-kit-teal group-hover:text-kit-teal-hover dark:group-hover:text-kit-teal-hover transition-colors duration-300"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}

      {state === 'playing' && (
        <button
          onClick={handlePause}
          onKeyDown={handleKeyPress}
          aria-label={t('ttsPause') || 'Pause audio'}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-kit-dark-bg-lighter transition-colors duration-300 group"
          title={t('ttsPause') || 'Pause audio'}
        >
          <svg
            className="w-5 h-5 text-kit-teal dark:text-kit-teal group-hover:text-kit-teal-hover dark:group-hover:text-kit-teal-hover transition-colors duration-300"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        </button>
      )}

      {state === 'error' && (
        <button
          onClick={handleGenerate}
          onKeyDown={handleKeyPress}
          aria-label={`${t('ttsError') || 'Error'}: ${errorMessage}`}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-kit-dark-bg-lighter transition-colors duration-300 group"
          title={errorMessage}
        >
          <svg
            className="w-5 h-5 text-kit-red dark:text-kit-red group-hover:text-kit-red/80 dark:group-hover:text-kit-red/80 transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

export default AudioPlayer
