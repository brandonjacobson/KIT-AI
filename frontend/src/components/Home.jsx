import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'

function Home() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (content) => {
    setMessages((prev) => [...prev, { role: 'user', content }])
    setIsLoading(true)

    // Mock AI response for now - will be replaced with Gemini API later
    await new Promise((resolve) => setTimeout(resolve, 800))
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: 'This is a placeholder response. The Gemini API integration will be added by the backend team.',
      },
    ])

    setIsLoading(false)
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="shrink-0 px-4 py-3 bg-white border-b border-slate-200">
        <h1 className="text-xl font-semibold text-slate-900 text-center">KIT AI</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <p className="text-lg mb-2">Describe your symptoms or ask a question.</p>
              <p className="text-sm">This chatbot provides general health guidance for Greater Alachua County.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))
          )}
          {isLoading && (
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
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  )
}

export default Home
