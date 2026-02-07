import { useState } from 'react'

function ChatInput({ onSend, disabled, placeholder }) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = message.trim()
    if (trimmed && !disabled) {
      onSend(trimmed)
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative p-6">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-xl border-t border-white/20"></div>

      <div className="max-w-4xl mx-auto relative">
        <div className="relative group">
          <div className="absolute inset-0 bg-white/50 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl group-focus-within:shadow-2xl transition-all"></div>

          <div className="relative flex gap-3 items-center p-4">
            <button
              type="button"
              className="shrink-0 w-11 h-11 flex items-center justify-center text-gray-400 hover:text-kit-teal hover:bg-kit-teal/10 rounded-2xl transition-all hover:scale-110"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={placeholder || "Ask Kit anything about your health..."}
              disabled={disabled}
              className="flex-1 bg-transparent border-none focus:outline-none text-base text-gray-900 placeholder-gray-400 font-medium min-h-[48px]"
            />

            <button
              type="button"
              className="shrink-0 w-11 h-11 flex items-center justify-center text-gray-400 hover:text-kit-red hover:bg-kit-red/10 rounded-2xl transition-all hover:scale-110"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            <button
              type="submit"
              disabled={disabled || !message.trim()}
              className="shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-kit-red to-kit-red-hover text-white rounded-2xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default ChatInput
