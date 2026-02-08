import { useState, useCallback, useEffect } from 'react'
import { initEngine, chat, unloadEngine, hasWebGPU } from '../services/webllmService'
import { getMedicalContext } from '../services/medicalCacheService'

const BASE_DISCLAIMER = `You are KIT AI, an expert offline First-Aid Assistant.
YOUR ONLY PURPOSE is to provide first aid instructions and medical guidance based on the provided context.

STRICT RULES:
1. If the user asks about ANYTHING unrelated to health, medicine, or first aid (e.g. coding, math, history, jokes), you MUST REFUSE.
2. Reply with: "I can only assist with medical or first-aid related questions."
3. Do not be chatty. Do not apologize excessively. Just refuse unrelated topics.
4. If the user describes a life-threatening emergency, ALWAYS start with: "CALL 911 IMMEDIATELY."

You seem to have access to a local medical database. Use it to answer efficiently.`

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
      if (status !== 'ready') {
        throw new Error('AI model is still loading. Please wait...')
      }

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
