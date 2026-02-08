import Home from './components/Home'
import { SettingsProvider } from './contexts/SettingsContext'
import { TTSProvider } from './contexts/TTSContext'
import { ChatHistoryProvider } from './contexts/ChatHistoryContext'

function App() {
  return (
    <SettingsProvider>
      <TTSProvider>
        <ChatHistoryProvider>
          <Home />
        </ChatHistoryProvider>
      </TTSProvider>
    </SettingsProvider>
  )
}

export default App
