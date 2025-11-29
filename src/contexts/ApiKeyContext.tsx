import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ApiKeyContextType {
  apiKey: string
  setApiKey: (key: string) => void
  clearApiKey: () => void
  isAuthenticated: boolean
  logout: () => void
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    // Load API key from localStorage on mount
    const stored = localStorage.getItem('cf_api_key')
    if (stored) {
      setApiKeyState(stored)
      setIsAuthenticated(true)
    }
  }, [])

  const setApiKey = (key: string) => {
    setApiKeyState(key)
    setIsAuthenticated(!!key)
    if (key) {
      localStorage.setItem('cf_api_key', key)
    } else {
      localStorage.removeItem('cf_api_key')
    }
  }

  const clearApiKey = () => {
    setApiKeyState('')
    setIsAuthenticated(false)
    localStorage.removeItem('cf_api_key')
  }

  const logout = () => {
    clearApiKey()
  }

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, clearApiKey, isAuthenticated, logout }}>
      {children}
    </ApiKeyContext.Provider>
  )
}
