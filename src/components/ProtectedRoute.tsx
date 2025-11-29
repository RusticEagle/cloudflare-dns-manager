import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Box, CircularProgress } from '@mui/material'
import { useApiKey } from '../contexts/ApiKeyContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useApiKey()
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(true)

  useEffect(() => {
    // Check authentication after initial render
    if (!isAuthenticated) {
      router.push('/login')
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, router])

  if (isLoading || !isAuthenticated) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
