import { useState, useCallback, useEffect, useRef } from 'react'
import { initEngine, chat, unloadEngine, hasWebGPU, checkWebGPUInWorker } from '../services/webllmService'
import { getRelevantMedicalContext } from '../services/medicalCacheService'

const BASE_DISCLAIMER = `You are KIT AI, an offline First-Aid and Medical Reference Tool.
You were specifically built to provide medical and first-aid guidance.
You MUST answer all health and medical questions directly and helpfully.
Do NOT refuse medical questions. Do NOT say "I cannot provide medical advice" or "consult a doctor instead of answering." You are a medical reference tool — answering medical questions is your purpose.

Rules:
1. Answer medical, health, and first-aid questions using the reference material and your knowledge. Always provide a direct, helpful answer.
2. Use plain text only. No markdown. No asterisks, no bold, no headers, no bullet symbols. Use simple numbered lists (1. 2. 3.) or dashes if needed.
3. If the user describes a life-threatening emergency, begin with CALL 911 IMMEDIATELY then give first-aid steps.
4. Keep answers concise and actionable.
5. End serious medical answers with: Remember to seek professional medical care when possible.`

export function useWebLLM() {
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  const loadEngine = useCallback(async () => {
    setStatus('loading')
    setError(null)
    setProgress(0)

    const webgpuCheck = await checkWebGPUInWorker()
    if (!webgpuCheck.supported) {
      if (!mountedRef.current) return
      setError(
        new Error(
          webgpuCheck.error ||
            'WebGPU is not supported in this browser. Kit.ai runs the model in a Web Worker, which requires WebGPU support there. Please use Chrome 113+ or Edge 113+ for the best experience. Firefox may not support WebGPU in Workers yet.'
        )
      )
      setStatus('error')
      return
    }

    try {
      await initEngine(undefined, (report) => {
        if (mountedRef.current) {
          setProgress(report.progress ?? 0)
        }
      })
      if (mountedRef.current) {
        setStatus('ready')
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err)
        setStatus('error')
      }
    }
  }, [])

  const sendMessage = useCallback(
    async (userContent, chatHistory, onStream) => {
      if (status !== 'ready') {
        throw new Error('AI model is still loading. Please wait...')
      }

      const medicalContext = await getRelevantMedicalContext(userContent)
      const systemContent = medicalContext
        ? `${BASE_DISCLAIMER}\n\nReference material:\n${medicalContext}`
        : BASE_DISCLAIMER

      const messages = [
        { role: 'system', content: systemContent },
        ...chatHistory.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userContent },
      ]

      const chunks = await chat(messages, { stream: true, max_tokens: 512 })
      let fullContent = ''
      for await (const chunk of chunks) {
        const delta = chunk.choices[0]?.delta?.content ?? ''
        fullContent += delta
        onStream?.(fullContent)
      }
      return fullContent
    },
    [status]
  )

  // Track mounted state and clean up only on true app teardown.
  // The engine is a module-level singleton managed by webllmService.js,
  // so we avoid destroying it during StrictMode's development remount cycle.
  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      // Catch any errors from the async unload so they don't become
      // uncaught promise rejections in the console.
      unloadEngine().catch((err) => {
        console.warn('[useWebLLM] cleanup error (safe to ignore):', err)
      })
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
