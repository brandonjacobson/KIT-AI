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
    <form onSubmit={handleSubmit} className="p-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
          {/* Input field */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder || "Describe your symptoms or ask about first aid..."}
            disabled={disabled}
            className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400 font-medium py-2"
          />

          {/* Mic button */}
          <button
            type="button"
            className="shrink-0 w-10 h-10 flex items-center justify-center text-gray-600 hover:text-white hover:bg-kit-red rounded-full transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Emoji button */}
          <button
            type="button"
            className="shrink-0 w-10 h-10 flex items-center justify-center text-gray-600 hover:text-white hover:bg-yellow-500 rounded-full transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Send button */}
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="shrink-0 w-10 h-10 flex items-center justify-center bg-[#3A9F93] text-white rounded-full hover:bg-[#2E8E82] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </form>
  )
}

export default ChatInput
