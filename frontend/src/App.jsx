import { useState, useEffect } from 'react'
import Disclaimer from './components/Disclaimer'
import Home from './components/Home'

const STORAGE_KEY = 'disclaimerAccepted'

function App() {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') {
      setDisclaimerAccepted(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setDisclaimerAccepted(true)
  }

  return (
    <>
      {!disclaimerAccepted ? (
        <Disclaimer onAccept={handleAccept} />
      ) : (
        <Home />
      )}
    </>
  )
}

export default App
