import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { useWebLLM } from '../hooks/useWebLLM'

function Home() {
  const [messages, setMessages] = useState([])
  const [streamingContent, setStreamingContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const { status, progress, error, loadEngine, sendMessage, hasWebGPU } = useWebLLM()

  useEffect(() => {
    loadEngine()
  }, [loadEngine])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent])

  const handleSend = async (content) => {
    if (status !== 'ready') return

    setMessages((prev) => [...prev, { role: 'user', content }])
    setIsLoading(true)
    setStreamingContent('')

    try {
      const fullContent = await sendMessage(content, messages, (chunk) => {
        setStreamingContent(chunk)
      })
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: fullContent },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err?.message || 'Failed to get response.'}`,
        },
      ])
    } finally {
      setStreamingContent('')
      setIsLoading(false)
    }
  }

  const chatReady = status === 'ready'
  const chatDisabled = isLoading || !chatReady

  if (status === 'error') {
    return (
      <div className="flex flex-col h-screen bg-slate-50">
        <div className="shrink-0 px-4 py-3 bg-white border-b border-slate-200">
          <h1 className="text-xl font-semibold text-slate-900 text-center">KIT AI</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <h2 className="text-lg font-semibold text-amber-800 mb-2">
              WebGPU Not Supported
            </h2>
            <p className="text-slate-700 mb-4">
              {error?.message || 'Your browser does not support WebGPU.'}
            </p>
            <p className="text-sm text-slate-600">
              Please use Chrome 113+, Edge 113+, Safari 26+, or Firefox 141+ for the best experience.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="shrink-0 px-4 py-3 bg-white border-b border-slate-200">
        <h1 className="text-xl font-semibold text-slate-900 text-center">KIT AI</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-slate-600 mb-4">Loading model...</p>
              <div className="w-full max-w-xs h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-slate-500 mt-2">{Math.round(progress)}%</p>
            </div>
          )}
          {status === 'ready' && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <p className="text-lg mb-2">Describe your symptoms or ask a question.</p>
              <p className="text-sm">This chatbot provides general health guidance.</p>
            </div>
          )}
          {status === 'ready' && messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
          {status === 'ready' && streamingContent && (
            <ChatMessage role="assistant" content={streamingContent} />
          )}
          {isLoading && !streamingContent && (
            <div className="flex justify-start mb-4">
              <div className="bg-slate-200 rounded-2xl px-4 py-3">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="shrink-0">
        <ChatInput
          onSend={handleSend}
          disabled={chatDisabled}
          placeholder={status === 'loading' ? 'Loading model...' : undefined}
        />
      </div>
    </div>
  )
}

export default Home
