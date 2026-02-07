function ChatMessage({ role, content }) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-slate-200 text-slate-900'
        }`}
      >
        <p className="text-base leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}

export default ChatMessage
