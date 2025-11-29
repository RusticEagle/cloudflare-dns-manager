import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ApiKeyContextType {
  apiKey: string
  setApiKey: (key: string) => void
  clearApiKey: () => void
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined)

export const useApiKey = () => {
  const context = useContext(ApiKeyContext)
  if (!context) {
    throw new Error('useApiKey must be used within ApiKeyProvider')
  }
  return context
}

interface ApiKeyProviderProps {
  children: ReactNode
}

export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string>('')

  useEffect(() => {
    // Load API key from localStorage on mount
    const stored = localStorage.getItem('cf_api_key')
    if (stored) {
      setApiKeyState(stored)
    }
  }, [])

  const setApiKey = (key: string) => {
    setApiKeyState(key)
    if (key) {
      localStorage.setItem('cf_api_key', key)
    } else {
      localStorage.removeItem('cf_api_key')
    }
  }

  const clearApiKey = () => {
    setApiKeyState('')
    localStorage.removeItem('cf_api_key')
  }

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, clearApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  )
}
