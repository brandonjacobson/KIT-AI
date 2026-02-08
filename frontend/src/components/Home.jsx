import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { useWebLLM } from '../hooks/useWebLLM'

// Kit.ai Logo - always red, less rounded box
function KitLogo({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-0 hover:scale-105 transition-transform"
    >
      <span className="text-5xl font-extrabold text-kit-red leading-none tracking-tight">k</span>
      <span className="text-5xl font-extrabold text-kit-red leading-none tracking-tight">i</span>
      <div className="relative inline-flex items-center justify-center w-9 h-9 bg-kit-red rounded-md group-hover:shadow-md transition-all mx-0.5">
        <div className="relative w-5 h-5">
          <div className="absolute top-1/2 left-0 w-full h-1.5 bg-white -translate-y-1/2 rounded-full"></div>
          <div className="absolute left-1/2 top-0 w-1.5 h-full bg-white -translate-x-1/2 rounded-full"></div>
        </div>
      </div>
      <span className="text-5xl font-extrabold text-kit-red leading-none tracking-tight">.</span>
      <span className="text-5xl font-extrabold text-kit-red leading-none tracking-tight">a</span>
      <span className="text-5xl font-extrabold text-kit-red leading-none tracking-tight">i</span>
    </button>
  )
}

// Navigation item component with seamless tab design
function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-3 px-5 py-3.5 text-left transition-all w-full group ${
        active
          ? 'text-gray-800 font-bold'
          : 'text-kit-red font-semibold hover:text-kit-red/80 hover:bg-white/30'
      }`}
    >
      {/* Seamless tab background that extends into content area */}
      {active && (
        <div className="absolute inset-0 bg-white rounded-l-3xl -right-8 shadow-lg"></div>
      )}
      <span className={`relative z-10 transition-colors ${active ? 'text-kit-red' : 'group-hover:text-kit-red/80'}`}>{icon}</span>
      <span className="relative z-10">{label}</span>
    </button>
  )
}

function Home() {
  const [messages, setMessages] = useState([])
  const [streamingContent, setStreamingContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeNav, setActiveNav] = useState('chat')
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

  const handleGoHome = () => {
    setMessages([])
  }

  // Icon components
  const ChatIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  )

  const HistoryIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  const ResourcesIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )

  const SettingsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )

  if (status === 'error') {
    return (
      <div className="h-screen flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 flex flex-col bg-kit-teal-light p-6 rounded-r-3xl">
            <div className="mb-12 flex justify-start ml-7">
              <KitLogo onClick={handleGoHome} />
            </div>
          </div>
          {/* White Content Area */}
          <div className="flex-1 bg-white flex items-center justify-center rounded-l-3xl ml-[-1.5rem]">
            <div className="max-w-md w-full bg-gray-50 rounded-3xl p-8">
              <div className="w-16 h-16 bg-kit-red-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-kit-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-3 text-center">
                WebGPU Not Supported
              </h2>
              <p className="text-gray-600 mb-4 text-center">
                {error?.message || 'Your browser does not support WebGPU.'}
              </p>
              <p className="text-sm text-gray-500 text-center">
                Please use Chrome 113+, Edge 113+, Safari 26+, or Firefox 141+ for the best experience.
              </p>
            </div>
          </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar with seamless tab navigation */}
      <div className="w-64 flex flex-col bg-kit-teal-light p-6 relative rounded-r-3xl">
        {/* Logo */}
        <div className="mb-12 flex justify-start items-center ml-7">
          <KitLogo onClick={handleGoHome} />
        </div>

        {/* Navigation with seamless tab design */}
        <nav className="flex-1 flex flex-col gap-2 relative pr-2">
          <NavItem
            icon={<ChatIcon />}
            label="Chat"
            active={activeNav === 'chat'}
            onClick={() => setActiveNav('chat')}
          />
          <NavItem
            icon={<HistoryIcon />}
            label="History"
            active={activeNav === 'history'}
            onClick={() => setActiveNav('history')}
          />

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Settings at bottom */}
          <NavItem
            icon={<SettingsIcon />}
            label="Settings"
            active={activeNav === 'settings'}
            onClick={() => setActiveNav('settings')}
          />
        </nav>
      </div>

      {/* White Content Area - seamlessly connected */}
      <div className="flex-1 bg-white flex flex-col relative overflow-hidden rounded-l-3xl ml-[-1.5rem]">
          {/* Status Indicator */}
          <div className="absolute top-4 right-6 pointer-events-none">
            <div className="flex items-center gap-2 bg-kit-teal-light/60 px-3 py-1.5 rounded-full border border-kit-teal/20">
              <div className="w-2 h-2 bg-kit-teal rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-kit-teal">Local Mode: Active</span>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
            <div className="w-full max-w-3xl">
              {status === 'loading' && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-20 h-20 bg-kit-teal-light rounded-full flex items-center justify-center mb-6">
                    <div className="w-10 h-10 border-4 border-kit-teal border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-700 mb-4 text-lg font-semibold">Loading model...</p>
                  <div className="w-full max-w-xs h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-kit-teal rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-3 font-medium">{Math.round(progress)}%</p>
                </div>
              )}
              {status === 'ready' && messages.length === 0 ? (
                <div className="flex flex-col items-center">
                  {/* Welcome Message */}
                  <h1 className="text-5xl font-bold text-gray-800 mb-4 text-center">
                    How can I help you?
                  </h1>
                  <p className="text-lg text-gray-500 mb-10 text-center max-w-md">
                    Ask me anything about health, symptoms, or wellness tips
                  </p>

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-10">
                    <button
                      onClick={() => handleSend("What are common symptoms I should watch for?")}
                      className="group bg-red-50/70 p-5 rounded-3xl hover:bg-red-50/90 hover:-translate-y-1 hover:shadow-lg transition-all text-left shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <svg className="w-8 h-8 text-kit-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="font-bold text-gray-800 text-lg">Symptom Check</span>
                      </div>
                      <p className="text-base text-gray-600">Learn about common symptoms and what they might mean</p>
                    </button>

                    <button
                      onClick={() => handleSend("What should I do in case of an emergency?")}
                      className="group bg-teal-50/70 p-5 rounded-3xl hover:bg-teal-50/90 hover:-translate-y-1 hover:shadow-lg transition-all text-left shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <svg className="w-8 h-8 text-kit-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="font-bold text-gray-800 text-lg">Emergency Info</span>
                      </div>
                      <p className="text-base text-gray-600">Know when to seek immediate medical attention</p>
                    </button>

                    <button
                      onClick={() => handleSend("Give me health tips and wellness advice")}
                      className="group bg-teal-50/70 p-5 rounded-3xl hover:bg-teal-50/90 hover:-translate-y-1 hover:shadow-lg transition-all text-left shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <svg className="w-8 h-8 text-kit-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="font-bold text-gray-800 text-lg">Health Tips</span>
                      </div>
                      <p className="text-base text-gray-600">Get practical tips for daily wellness</p>
                    </button>

                    <button
                      onClick={() => handleSend("Tell me about preventive care")}
                      className="group bg-red-50/70 p-5 rounded-3xl hover:bg-red-50/90 hover:-translate-y-1 hover:shadow-lg transition-all text-left shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <svg className="w-8 h-8 text-kit-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.0 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="font-bold text-gray-800 text-lg">Preventive Care</span>
                      </div>
                      <p className="text-base text-gray-600">Learn about screenings and staying healthy</p>
                    </button>
                  </div>

                  {/* Disclaimer */}
                  <div className="text-center max-w-lg">
                    <p className="text-xs text-gray-400">
                      Kit.ai is for informational purposes only and not a substitute for professional medical advice.
                      Always consult a healthcare provider. For emergencies, call 911.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <ChatMessage key={i} role={msg.role} content={msg.content} />
                  ))}
                  {streamingContent && (
                    <ChatMessage role="assistant" content={streamingContent} />
                  )}
                  {isLoading && !streamingContent && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-kit-red rounded-full flex items-center justify-center">
                          <div className="w-5 h-5 relative">
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-white -translate-y-1/2 rounded-full"></div>
                            <div className="absolute left-1/2 top-0 w-1 h-full bg-white -translate-x-1/2 rounded-full"></div>
                          </div>
                        </div>
                        <div className="bg-kit-red-light px-5 py-3 rounded-3xl rounded-tl-lg">
                          <div className="flex gap-1.5">
                            <div className="w-2 h-2 bg-kit-red/60 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-kit-red/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-kit-red/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Chat Input */}
          <div className="shrink-0">
            <ChatInput
              onSend={handleSend}
              disabled={chatDisabled}
              placeholder={status === 'loading' ? 'Loading model...' : undefined}
            />
          </div>
        </div>
    </div>
  )
}

export default Home
