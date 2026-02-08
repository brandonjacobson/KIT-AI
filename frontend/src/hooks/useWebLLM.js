import { useState, useCallback, useEffect } from 'react'
import { initEngine, chat, unloadEngine, hasWebGPU } from '../services/webllmService'
import { getMedicalContext } from '../services/medicalCacheService'

const BASE_DISCLAIMER = `You are KIT AI, a helpful health assistant. You provide general health information only. You are NOT a substitute for professional medical advice, diagnosis, or treatment. Always advise users to seek professional care for specific conditions. If someone describes a medical emergency, advise them to call 911 or go to the nearest emergency room.`

export function useWebLLM() {
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const loadEngine = useCallback(async () => {
    if (!hasWebGPU()) {
      setError(new Error('WebGPU is not supported. Please use Chrome 113+, Edge 113+, Safari 26+, or Firefox 141+.'))
      setStatus('error')
      return
    }

    setStatus('loading')
    setError(null)
    setProgress(0)

    try {
      await initEngine(undefined, (report) => {
        setProgress(report.progress ?? 0)
      })
      setStatus('ready')
    } catch (err) {
      setError(err)
      setStatus('error')
    }
  }, [])

  const sendMessage = useCallback(
    async (userContent, chatHistory, onStream) => {
      if (status !== 'ready') return

      const medicalContext = await getMedicalContext()
      const systemContent = `${BASE_DISCLAIMER}\n\nMedical context:\n${medicalContext}`

      const messages = [
        { role: 'system', content: systemContent },
        ...chatHistory.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userContent },
      ]

      try {
        const chunks = await chat(messages, { stream: true })
        let fullContent = ''
        for await (const chunk of chunks) {
          const delta = chunk.choices[0]?.delta?.content ?? ''
          fullContent += delta
          onStream?.(fullContent)
        }
        return fullContent
      } catch (err) {
        throw err
      }
    },
    [status]
  )

  useEffect(() => {
    return () => {
      unloadEngine()
    }
  }, [])

  return {
    status,
    progress,
    error,
    loadEngine,
    sendMessage,
    hasWebGPU: hasWebGPU(),
  }
}
