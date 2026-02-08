import { useState } from 'react'
import { useSettings } from '../contexts/SettingsContext'

function ChatInput({ onSend, disabled, placeholder }) {
  const [message, setMessage] = useState('')
  const { t } = useSettings()

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = message.trim()
    if (trimmed && !disabled) {
      onSend(trimmed)
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-kit-dark-bg transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 bg-white dark:bg-kit-dark-bg-light rounded-full px-4 py-2 shadow-sm border border-gray-200 dark:border-kit-dark-bg-lighter transition-colors duration-300">
          {/* Input field */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder || t('inputPlaceholder')}
            disabled={disabled}
            className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 dark:text-kit-dark-text placeholder-gray-400 dark:placeholder-kit-dark-text-muted font-medium py-2 transition-colors duration-300"
          />

          {/* Mic button */}
          <button
            type="button"
            className="shrink-0 w-10 h-10 flex items-center justify-center text-gray-600 dark:text-kit-dark-text-muted hover:text-white hover:bg-kit-red dark:hover:bg-kit-red rounded-full transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Emoji button */}
          <button
            type="button"
            className="shrink-0 w-10 h-10 flex items-center justify-center text-gray-600 dark:text-kit-dark-text-muted hover:text-white hover:bg-yellow-500 dark:hover:bg-yellow-600 rounded-full transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Send button */}
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="shrink-0 w-10 h-10 flex items-center justify-center bg-kit-teal-hover dark:bg-kit-teal-dark text-white rounded-full hover:bg-[#2E8E82] dark:hover:bg-kit-teal disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow"
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
