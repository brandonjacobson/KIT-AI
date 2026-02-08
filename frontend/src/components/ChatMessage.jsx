function ChatMessage({ role, content }) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
          isUser ? 'bg-slate-700' : 'bg-kit-red'
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
        <div className={`px-5 py-3 shadow-card ${
          isUser
            ? 'bg-slate-700 text-white rounded-2xl rounded-br-md'
            : 'bg-white text-slate-700 rounded-2xl rounded-bl-md border border-gray-200'
        }`}>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
