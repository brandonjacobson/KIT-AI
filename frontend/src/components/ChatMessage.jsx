function ChatMessage({ role, content }) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className="flex gap-3 max-w-[85%]">
        {!isUser && (
          <div className="shrink-0 w-12 h-12 bg-kit-red/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-base">K</span>
          </div>
        )}
        <div className="relative group">
          <div className={`absolute inset-0 rounded-3xl ${
            isUser
              ? 'bg-gradient-to-br from-kit-teal/80 to-kit-teal/60 backdrop-blur-xl'
              : 'bg-white/60 backdrop-blur-xl'
          } shadow-lg group-hover:shadow-xl transition-all`}></div>
          <div className={`relative px-6 py-4 ${
            isUser ? 'text-white' : 'text-gray-900'
          }`}>
            {!isUser && (
              <p className="text-xs font-bold text-kit-red mb-2 tracking-wide">KIT</p>
            )}
            <p className="text-base leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>
        </div>
        {isUser && (
          <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-gray-600/80 to-gray-500/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessage
