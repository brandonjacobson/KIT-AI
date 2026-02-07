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
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-white border-t border-slate-200">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder || "Describe your symptoms or ask a question..."}
        disabled={disabled}
        className="flex-1 min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base text-slate-900 placeholder-slate-500"
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="min-h-[44px] min-w-[44px] px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Send
      </button>
    </form>
  )
}

export default ChatInput
