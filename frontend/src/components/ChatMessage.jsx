import AudioPlayer from './AudioPlayer'

function ChatMessage({ role, content }) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-slideIn`}>
      <div className={`flex items-end gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors duration-300 ${
          isUser ? 'bg-kit-teal dark:bg-kit-teal' : 'bg-kit-red dark:bg-kit-red'
        }`}>
          {isUser ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ) : (
            <div className="w-5 h-5 relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-white -translate-y-1/2 rounded-full"></div>
              <div className="absolute left-1/2 top-0 w-1 h-full bg-white -translate-x-1/2 rounded-full"></div>
            </div>
          )}
        </div>

        {/* Message Bubble */}
        <div className={`px-5 py-3 shadow-card transition-colors duration-300 ${
          isUser
            ? 'bg-white dark:bg-kit-dark-bg-light text-slate-700 dark:text-kit-dark-text rounded-2xl rounded-br-md border border-gray-200 dark:border-kit-dark-bg-lighter'
            : 'bg-white dark:bg-kit-dark-bg-light text-slate-700 dark:text-kit-dark-text rounded-2xl rounded-bl-md border border-gray-200 dark:border-kit-dark-bg-lighter'
        }`}>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>

          {/* Audio Player - only for assistant messages */}
          {!isUser && (
            <AudioPlayer
              messageContent={content}
              messageId={`msg-${Date.now()}-${content.substring(0, 20)}`}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
