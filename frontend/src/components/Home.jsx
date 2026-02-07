import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'

// Kit.ai Logo - "k" "i" [red box with white cross] "." "a" "i"
function KitLogo({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-0 hover:scale-105 transition-transform"
    >
      {/* "k" in red */}
      <span className="text-4xl font-black text-kit-red leading-none tracking-tight">k</span>

      {/* "i" in red */}
      <span className="text-4xl font-black text-kit-red leading-none tracking-tight">i</span>

      {/* Red box with white medical cross - smaller square */}
      <div className="relative inline-flex items-center justify-center w-7 h-7 bg-kit-red rounded-md group-hover:shadow-md transition-all mx-0.5">
        {/* Medical cross */}
        <div className="relative w-4 h-4">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white -translate-y-1/2 rounded-sm"></div>
          <div className="absolute left-1/2 top-0 w-1 h-full bg-white -translate-x-1/2 rounded-sm"></div>
        </div>
        {/* Subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-md"></div>
      </div>

      {/* "." in red */}
      <span className="text-4xl font-black text-kit-red leading-none tracking-tight">.</span>

      {/* "a" in red */}
      <span className="text-4xl font-black text-kit-red leading-none tracking-tight">a</span>

      {/* "i" in red */}
      <span className="text-4xl font-black text-kit-red leading-none tracking-tight">i</span>
    </button>
  )
}

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

  const handleGoHome = () => {
    setMessages([])
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Enhanced animated background with more liquid glass feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-kit-teal/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-kit-red/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      {/* Left Sidebar - Enhanced liquid glass */}
      <div className="relative w-64 flex flex-col z-10">
        <div className="absolute inset-0 bg-white/50 backdrop-blur-2xl border-r border-white/40 shadow-2xl"></div>
        {/* More visible teal overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-kit-teal/[0.15] via-kit-teal/[0.08] to-transparent pointer-events-none"></div>
        {/* Additional glass layer effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/10 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo - centered */}
          <div className="p-5 border-b border-white/30 flex items-center justify-center">
            <KitLogo onClick={handleGoHome} />
          </div>

          {/* Navigation - NO white boxes */}
          <nav className="flex-1 p-4">
            <div className="space-y-1.5">
              {/* Chat button - active state with red background */}
              <button className="w-full flex items-center gap-3 px-4 py-3 text-white bg-gradient-to-r from-kit-red to-kit-red-hover rounded-xl hover:shadow-md transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="font-semibold">Chat</span>
              </button>

              {/* History - just text/icon, no box */}
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">History</span>
              </button>

              {/* Resources - just text/icon, no box */}
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">Resources</span>
              </button>
            </div>
          </nav>

          {/* Bottom Section - Settings without box */}
          <div className="p-4 border-t border-white/30">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Chat Area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-3xl">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center">
                {/* Main heading - NO backdrop box, bigger text */}
                <h1 className="text-6xl font-black text-gray-800 mb-10 tracking-tight">
                  How can I help you?
                </h1>

                {/* Quick Action Buttons - Enhanced liquid glass with bigger text */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-8">
                  <button
                    onClick={() => handleSend("What are common symptoms I should watch for?")}
                    className="group relative p-5 rounded-2xl hover:scale-[1.02] transition-all duration-200"
                  >
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-lg group-hover:shadow-xl group-hover:border-kit-red/50 transition-all"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-kit-red/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-kit-red/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-kit-red/30 transition-colors shadow-sm">
                          <svg className="w-5 h-5 text-kit-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <span className="font-bold text-gray-800 text-base">Symptom Check</span>
                      </div>
                      <p className="text-sm text-gray-500">Get detailed information about common medical symptoms and what they might indicate</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSend("What should I do in case of an emergency?")}
                    className="group relative p-5 rounded-2xl hover:scale-[1.02] transition-all duration-200"
                  >
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-lg group-hover:shadow-xl group-hover:border-kit-teal/50 transition-all"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-kit-teal/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-kit-teal/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-kit-teal/30 transition-colors shadow-sm">
                          <svg className="w-5 h-5 text-kit-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <span className="font-bold text-gray-800 text-base">Emergency Info</span>
                      </div>
                      <p className="text-sm text-gray-500">Learn when immediate medical attention is needed and how to respond to emergencies</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSend("Give me health tips and wellness advice")}
                    className="group relative p-5 rounded-2xl hover:scale-[1.02] transition-all duration-200"
                  >
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-lg group-hover:shadow-xl group-hover:border-kit-teal/50 transition-all"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-kit-teal/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-kit-teal/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-kit-teal/30 transition-colors shadow-sm">
                          <svg className="w-5 h-5 text-kit-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <span className="font-bold text-gray-800 text-base">Health Tips</span>
                      </div>
                      <p className="text-sm text-gray-500">Discover practical health tips and advice for maintaining your daily wellness routine</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSend("Tell me about preventive care")}
                    className="group relative p-5 rounded-2xl hover:scale-[1.02] transition-all duration-200"
                  >
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-lg group-hover:shadow-xl group-hover:border-kit-red/50 transition-all"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-kit-red/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-kit-red/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-kit-red/30 transition-colors shadow-sm">
                          <svg className="w-5 h-5 text-kit-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <span className="font-bold text-gray-800 text-base">Preventive Care</span>
                      </div>
                      <p className="text-sm text-gray-500">Understand preventive care measures and screenings to help you stay healthy long-term</p>
                    </div>
                  </button>
                </div>

                {/* Disclaimer - NO box, just text, bigger */}
                <div className="text-center max-w-2xl">
                  <p className="text-xs text-gray-400 leading-relaxed">
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
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/50 backdrop-blur-2xl rounded-2xl border border-white/50"></div>
                      <div className="relative px-5 py-3 flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-kit-teal rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-kit-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-kit-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">Kit is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Chat Input - fixed at bottom */}
        <div className="shrink-0">
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
      </div>
    </div>
  )
}

export default Home
