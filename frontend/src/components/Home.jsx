import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import ConversationItem from './ConversationItem'
import { useWebLLM } from '../hooks/useWebLLM'
import { useSettings } from '../contexts/SettingsContext'
import { useTTS } from '../contexts/TTSContext'
import { useChatHistory } from '../contexts/ChatHistoryContext'
import { languageNames } from '../utils/translations'

// Kit.ai Logo - always red, less rounded box
function KitLogo({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-0 hover:scale-105 transition-transform duration-300"
    >
      <span className="text-5xl font-extrabold text-kit-red dark:text-kit-red leading-none tracking-tight">k</span>
      <span className="text-5xl font-extrabold text-kit-red dark:text-kit-red leading-none tracking-tight">i</span>
      <div className="relative inline-flex items-center justify-center w-9 h-9 bg-kit-red dark:bg-kit-red rounded-md group-hover:shadow-lg transition-all duration-300 mx-0.5">
        <div className="relative w-5 h-5">
          <div className="absolute top-1/2 left-0 w-full h-1.5 bg-white -translate-y-1/2 rounded-full"></div>
          <div className="absolute left-1/2 top-0 w-1.5 h-full bg-white -translate-x-1/2 rounded-full"></div>
        </div>
      </div>
      <span className="text-5xl font-extrabold text-kit-red dark:text-kit-red leading-none tracking-tight">.</span>
      <span className="text-5xl font-extrabold text-kit-red dark:text-kit-red leading-none tracking-tight">a</span>
      <span className="text-5xl font-extrabold text-kit-red dark:text-kit-red leading-none tracking-tight">i</span>
    </button>
  )
}

// Navigation item component with seamless tab design
function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-3 px-5 py-3.5 text-left transition-all w-full group duration-300 ${
        active
          ? 'text-gray-800 dark:text-kit-dark-text font-bold'
          : 'text-kit-red dark:text-kit-red-dark font-semibold hover:text-kit-red/80 dark:hover:text-kit-red hover:bg-white/30 dark:hover:bg-kit-dark-bg-lighter/30'
      }`}
    >
      {/* Seamless tab background that extends into content area */}
      {active && (
        <div className="absolute inset-0 bg-white dark:bg-kit-dark-bg-light rounded-l-3xl -right-8 shadow-lg transition-colors duration-300"></div>
      )}
      <span className={`relative z-10 transition-colors duration-300 ${active ? 'text-kit-red dark:text-kit-red' : 'group-hover:text-kit-red/80 dark:group-hover:text-kit-red'}`}>{icon}</span>
      <span className="relative z-10">{label}</span>
    </button>
  )
}

function Home() {
  const [streamingContent, setStreamingContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeNav, setActiveNav] = useState('chat')
  const messagesEndRef = useRef(null)

  const { language, setLanguage, t } = useSettings()
  const { status, progress, error, loadEngine, sendMessage, hasWebGPU } = useWebLLM()
  const { ttsEnabled, setTtsEnabled, voice, setVoice, speed, setSpeed, autoPlay, setAutoPlay, voices } = useTTS()
  const { currentMessages, conversationsList, createNewConversation, loadConversation, deleteConversation, updateMessages, currentConversationId } = useChatHistory()

  useEffect(() => {
    loadEngine()
  }, [loadEngine])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentMessages, streamingContent])

  const handleSend = async (content) => {
    if (status !== 'ready') return

    // Create conversation if none exists
    if (!currentConversationId) {
      createNewConversation()
    }

    // Add user message to history
    updateMessages({ role: 'user', content })

    setIsLoading(true)
    setStreamingContent('')

    try {
      const fullContent = await sendMessage(content, currentMessages, (chunk) => {
        setStreamingContent(chunk)
      })

      // Add assistant message to history
      updateMessages({ role: 'assistant', content: fullContent })
    } catch (err) {
      // Add error message to history
      updateMessages({
        role: 'assistant',
        content: `Error: ${err?.message || 'Failed to get response.'}`,
      })
    } finally {
      setStreamingContent('')
      setIsLoading(false)
    }
  }

  const chatReady = status === 'ready'
  const chatDisabled = isLoading || !chatReady

  const handleGoHome = () => {
    createNewConversation()
    setActiveNav('chat')
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

  const SettingsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )

  if (status === 'error') {
    return (
      <div className="h-screen flex overflow-hidden bg-white dark:bg-kit-dark-bg transition-colors duration-300">
          {/* Sidebar */}
          <div className="w-64 flex flex-col bg-kit-teal-light dark:bg-kit-dark-bg-light p-6 rounded-r-3xl transition-colors duration-300">
            <div className="mb-12 flex justify-start ml-7">
              <KitLogo onClick={handleGoHome} />
            </div>
          </div>
          {/* White Content Area */}
          <div className="flex-1 bg-white dark:bg-kit-dark-bg flex items-center justify-center rounded-l-3xl ml-[-1.5rem] transition-colors duration-300">
            <div className="max-w-md w-full bg-gray-50 dark:bg-kit-dark-bg-light rounded-3xl p-8 transition-colors duration-300">
              <div className="w-16 h-16 bg-kit-red-light dark:bg-kit-red-dark/20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                <svg className="w-8 h-8 text-kit-red dark:text-kit-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-kit-dark-text mb-3 text-center transition-colors duration-300">
                {t('webGpuNotSupported')}
              </h2>
              <p className="text-gray-600 dark:text-kit-dark-text-muted mb-4 text-center transition-colors duration-300">
                {error?.message || t('webGpuError')}
              </p>
              <p className="text-sm text-gray-500 dark:text-kit-dark-text-muted text-center transition-colors duration-300">
                {t('browserSupport')}
              </p>
            </div>
          </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden bg-white dark:bg-kit-dark-bg transition-colors duration-300">
      {/* Sidebar with seamless tab navigation */}
      <div className="w-64 flex flex-col bg-kit-teal-light dark:bg-kit-dark-bg-light p-6 relative rounded-r-3xl transition-colors duration-300">
        {/* Logo */}
        <div className="mb-12 flex justify-start ml-7">
          <KitLogo onClick={handleGoHome} />
        </div>

        {/* Navigation with seamless tab design */}
        <nav className="flex-1 flex flex-col gap-2 relative pr-2">
          <NavItem
            icon={<ChatIcon />}
            label={t('chat')}
            active={activeNav === 'chat'}
            onClick={() => setActiveNav('chat')}
          />
          <NavItem
            icon={<HistoryIcon />}
            label={t('history')}
            active={activeNav === 'history'}
            onClick={() => setActiveNav('history')}
          />
          <NavItem
            icon={<SettingsIcon />}
            label={t('settings')}
            active={activeNav === 'settings'}
            onClick={() => setActiveNav('settings')}
          />

          {/* Spacer */}
          <div className="flex-1"></div>
        </nav>

        {/* Status Indicator - bottom of sidebar */}
        <div className="mt-4 flex justify-center -ml-5">
          <div className="flex items-center gap-4 py-3 px-8 rounded-full bg-white dark:bg-kit-dark-bg-light shadow-sm transition-colors duration-300">
            <div className="w-2 h-2 bg-kit-teal dark:bg-kit-teal rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-kit-teal dark:text-kit-teal">{t('localModeActive')}</span>
          </div>
        </div>
      </div>

      {/* White Content Area - seamlessly connected */}
      <div className="flex-1 bg-white dark:bg-kit-dark-bg flex flex-col relative overflow-hidden rounded-l-3xl ml-[-1.5rem] transition-colors duration-300">
          {/* Content Area */}
          <div className={`flex-1 flex p-8 overflow-y-auto ${
            (activeNav === 'chat' && currentMessages.length > 0) || activeNav === 'settings' || activeNav === 'history' ? 'items-start justify-center' : 'items-center justify-center'
          }`}>
            <div className={`w-full max-w-3xl ${
              activeNav === 'chat' && status === 'loading' ? 'flex items-center justify-center h-full' : ''
            }`}>
              {activeNav === 'settings' ? (
                /* Settings Page */
                <div className="w-full max-w-2xl mx-auto animate-fadeIn">
                  {/* Language Section */}
                  <div className="mb-10 animate-fadeIn">
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-kit-dark-text mb-2 transition-colors duration-300">Language</h2>
                      <p className="text-gray-500 dark:text-kit-dark-text-muted transition-colors duration-300">{t('languageDesc')}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-kit-dark-bg-light dark:to-kit-dark-bg-lighter rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="space-y-2">
                      {Object.entries(languageNames).map(([code, { name, flag }], index) => (
                        <button
                          key={code}
                          onClick={() => setLanguage(code)}
                          style={{ animationDelay: `${index * 50}ms` }}
                          className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 group/lang animate-slideIn ${
                            language === code
                              ? 'bg-kit-teal-light dark:bg-kit-teal-dark/30 text-kit-teal dark:text-kit-teal shadow-md scale-[1.02]'
                              : 'bg-white dark:bg-kit-dark-bg-lighter text-gray-700 dark:text-kit-dark-text hover:bg-gray-50 dark:hover:bg-kit-dark-bg hover:scale-[1.01] hover:shadow-md'
                          }`}
                        >
                          <span className="text-2xl group-hover/lang:scale-125 transition-transform duration-300">{flag}</span>
                          <span className="font-semibold flex-1 text-left">{name}</span>
                          {language === code && (
                            <svg className="w-5 h-5 animate-checkmark" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                    </div>
                  </div>

                  {/* TTS Settings Section */}
                  <div className="mb-10 animate-fadeIn" style={{ animationDelay: '150ms' }}>
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-kit-dark-text mb-2 transition-colors duration-300">Text-to-Speech</h2>
                      <p className="text-gray-500 dark:text-kit-dark-text-muted transition-colors duration-300">{t('ttsSettingsDesc')}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-kit-dark-bg-light dark:to-kit-dark-bg-lighter rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300">

                    <div className="space-y-4">
                      {/* Enable/Disable Toggle */}
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-kit-dark-bg-lighter rounded-2xl transition-colors duration-300">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-kit-dark-text transition-colors duration-300">{t('ttsEnabled')}</p>
                          <p className="text-sm text-gray-600 dark:text-kit-dark-text-muted transition-colors duration-300">{t('ttsEnabledDesc')}</p>
                        </div>
                        <button
                          onClick={() => setTtsEnabled(!ttsEnabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                            ttsEnabled ? 'bg-kit-teal dark:bg-kit-teal' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                              ttsEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Voice Selection */}
                      {ttsEnabled && (
                        <div className="p-4 bg-white dark:bg-kit-dark-bg-lighter rounded-2xl transition-colors duration-300">
                          <label className="block font-semibold text-gray-800 dark:text-kit-dark-text mb-2 transition-colors duration-300">
                            {t('ttsVoice')}
                          </label>
                          <select
                            value={voice}
                            onChange={(e) => setVoice(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-kit-dark-bg border border-gray-200 dark:border-kit-dark-bg-lighter rounded-xl text-gray-800 dark:text-kit-dark-text focus:outline-none focus:ring-2 focus:ring-kit-teal dark:focus:ring-kit-teal transition-colors duration-300"
                          >
                            {voices.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.name} - {v.descriptionKey ? t(v.descriptionKey) : 'Voice'}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Speed Control */}
                      {ttsEnabled && (
                        <div className="p-4 bg-white dark:bg-kit-dark-bg-lighter rounded-2xl transition-colors duration-300">
                          <label className="block font-semibold text-gray-800 dark:text-kit-dark-text mb-2 transition-colors duration-300">
                            {t('ttsSpeed')}: {speed}x
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.1"
                            value={speed}
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-kit-dark-bg rounded-lg appearance-none cursor-pointer accent-kit-teal"
                          />
                          <div className="flex justify-between text-xs text-gray-500 dark:text-kit-dark-text-muted mt-1">
                            <span>0.5x</span>
                            <span>1.0x</span>
                            <span>2.0x</span>
                          </div>
                        </div>
                      )}

                      {/* Auto-play Toggle */}
                      {ttsEnabled && (
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-kit-dark-bg-lighter rounded-2xl transition-colors duration-300">
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-kit-dark-text transition-colors duration-300">{t('ttsAutoPlay')}</p>
                            <p className="text-sm text-gray-600 dark:text-kit-dark-text-muted transition-colors duration-300">{t('ttsAutoPlayDesc')}</p>
                          </div>
                          <button
                            onClick={() => setAutoPlay(!autoPlay)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                              autoPlay ? 'bg-kit-teal dark:bg-kit-teal' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                                autoPlay ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      )}
                    </div>
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="mt-8 text-center space-y-2 animate-fadeIn" style={{ animationDelay: '300ms' }}>
                    <p className="text-sm text-gray-400 dark:text-kit-dark-text-muted transition-colors duration-300">{t('aboutVersion')}</p>
                    <p className="text-xs text-gray-400 dark:text-kit-dark-text-muted max-w-md mx-auto transition-colors duration-300">
                      {t('disclaimer')}
                    </p>
                  </div>
                </div>
              ) : activeNav === 'chat' && status === 'loading' ? (
                <div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
                  <div className="w-20 h-20 bg-kit-teal-light dark:bg-kit-teal-dark/20 rounded-full flex items-center justify-center mb-6 transition-colors duration-300">
                    <div className="w-10 h-10 border-4 border-kit-teal dark:border-kit-teal border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-700 dark:text-kit-dark-text mb-4 text-lg font-semibold transition-colors duration-300">{t('loadingModelProgress')}</p>
                  <div className="w-full max-w-xs h-3 bg-gray-200 dark:bg-kit-dark-bg-lighter rounded-full overflow-hidden transition-colors duration-300">
                    <div
                      className="h-full bg-kit-teal dark:bg-kit-teal rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-kit-dark-text-muted mt-3 font-medium transition-colors duration-300">{Math.round(progress)}%</p>
                </div>
              ) : activeNav === 'chat' && status === 'ready' && currentMessages.length === 0 ? (
                <div className="flex flex-col items-center animate-fadeIn">
                  {/* Welcome Message */}
                  <h1 className="text-5xl font-bold text-gray-800 dark:text-kit-dark-text mb-4 text-center transition-colors duration-300">
                    {t('howCanIHelp')}
                  </h1>
                  <p className="text-lg text-gray-500 dark:text-kit-dark-text-muted mb-10 text-center max-w-md transition-colors duration-300">
                    {t('askMeAnything')}
                  </p>

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-10">
                    <button
                      onClick={() => handleSend("What are common symptoms I should watch for?")}
                      className="group bg-red-50/70 dark:bg-kit-red-dark/10 p-5 rounded-3xl hover:bg-red-50/90 dark:hover:bg-kit-red-dark/20 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left shadow-sm animate-slideIn"
                      style={{ animationDelay: '100ms' }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <svg className="w-8 h-8 text-kit-red dark:text-kit-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="font-bold text-gray-800 dark:text-kit-dark-text text-lg transition-colors duration-300">{t('symptomCheck')}</span>
                      </div>
                      <p className="text-base text-gray-600 dark:text-kit-dark-text-muted transition-colors duration-300">{t('symptomCheckDesc')}</p>
                    </button>

                    <button
                      onClick={() => handleSend("What should I do in case of an emergency?")}
                      className="group bg-teal-50/70 dark:bg-kit-teal-dark/10 p-5 rounded-3xl hover:bg-teal-50/90 dark:hover:bg-kit-teal-dark/20 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left shadow-sm animate-slideIn"
                      style={{ animationDelay: '150ms' }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <svg className="w-8 h-8 text-kit-teal dark:text-kit-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="font-bold text-gray-800 dark:text-kit-dark-text text-lg transition-colors duration-300">{t('emergencyInfo')}</span>
                      </div>
                      <p className="text-base text-gray-600 dark:text-kit-dark-text-muted transition-colors duration-300">{t('emergencyInfoDesc')}</p>
                    </button>

                    <button
                      onClick={() => handleSend("Give me health tips and wellness advice")}
                      className="group bg-teal-50/70 dark:bg-kit-teal-dark/10 p-5 rounded-3xl hover:bg-teal-50/90 dark:hover:bg-kit-teal-dark/20 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left shadow-sm animate-slideIn"
                      style={{ animationDelay: '200ms' }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <svg className="w-8 h-8 text-kit-teal dark:text-kit-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="font-bold text-gray-800 dark:text-kit-dark-text text-lg transition-colors duration-300">{t('healthTips')}</span>
                      </div>
                      <p className="text-base text-gray-600 dark:text-kit-dark-text-muted transition-colors duration-300">{t('healthTipsDesc')}</p>
                    </button>

                    <button
                      onClick={() => handleSend("Tell me about preventive care")}
                      className="group bg-red-50/70 dark:bg-kit-red-dark/10 p-5 rounded-3xl hover:bg-red-50/90 dark:hover:bg-kit-red-dark/20 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left shadow-sm animate-slideIn"
                      style={{ animationDelay: '250ms' }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <svg className="w-8 h-8 text-kit-red dark:text-kit-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.0 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="font-bold text-gray-800 dark:text-kit-dark-text text-lg transition-colors duration-300">{t('preventiveCare')}</span>
                      </div>
                      <p className="text-base text-gray-600 dark:text-kit-dark-text-muted transition-colors duration-300">{t('preventiveCareDesc')}</p>
                    </button>
                  </div>

                  {/* Disclaimer */}
                  <div className="text-center max-w-lg animate-fadeIn" style={{ animationDelay: '300ms' }}>
                    <p className="text-xs text-gray-400 dark:text-kit-dark-text-muted transition-colors duration-300">
                      {t('disclaimer')}
                    </p>
                  </div>
                </div>
              ) : activeNav === 'chat' ? (
                <div className="space-y-4">
                  {currentMessages.map((msg, i) => (
                    <ChatMessage key={`${msg.timestamp}-${i}`} role={msg.role} content={msg.content} />
                  ))}
                  {streamingContent && (
                    <ChatMessage role="assistant" content={streamingContent} />
                  )}
                  {isLoading && !streamingContent && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-kit-red dark:bg-kit-red rounded-full flex items-center justify-center transition-colors duration-300">
                          <div className="w-5 h-5 relative">
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-white -translate-y-1/2 rounded-full"></div>
                            <div className="absolute left-1/2 top-0 w-1 h-full bg-white -translate-x-1/2 rounded-full"></div>
                          </div>
                        </div>
                        <div className="bg-kit-red-light dark:bg-kit-red-dark/20 px-5 py-3 rounded-3xl rounded-tl-lg transition-colors duration-300">
                          <div className="flex gap-1.5">
                            <div className="w-2 h-2 bg-kit-red/60 dark:bg-kit-red rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-kit-red/60 dark:bg-kit-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-kit-red/60 dark:bg-kit-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              ) : activeNav === 'history' ? (
                <div className="w-full max-w-2xl mx-auto animate-fadeIn">
                  {/* Chat History Section */}
                  <div className="mb-10 animate-fadeIn">
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-kit-dark-text mb-2 transition-colors duration-300">
                        {t('chatHistory')}
                      </h2>
                      <p className="text-gray-500 dark:text-kit-dark-text-muted transition-colors duration-300">
                        {t('selectConversationDesc')}
                      </p>
                    </div>

                    {/* Conversations List */}
                    {conversationsList.length === 0 ? (
                      <div className="py-8">
                        <p className="text-gray-500 dark:text-kit-dark-text-muted transition-colors duration-300">
                          {t('selectConversationDesc')}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {conversationsList.map((conversation, index) => (
                          <ConversationItem
                            key={conversation.id}
                            conversation={conversation}
                            isActive={conversation.id === currentConversationId}
                            colorIndex={index}
                            onSelect={(id) => {
                              loadConversation(id)
                              setActiveNav('chat')
                            }}
                            onDelete={deleteConversation}
                            animationDelay={index * 50}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Chat Input - only show on chat page */}
          {activeNav === 'chat' && (
          <div className="shrink-0">
            <ChatInput
              onSend={handleSend}
              disabled={chatDisabled}
              placeholder={status === 'loading' ? t('loadingModel') : undefined}
            />
          </div>
          )}
        </div>
    </div>
  )
}

export default Home
