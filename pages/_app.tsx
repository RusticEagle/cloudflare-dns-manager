import * as React from 'react'
import type { AppProps } from 'next/app'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { useRouter } from 'next/router'
import theme from '../src/theme'
import Layout from '../src/components/Layout'
import { ApiKeyProvider } from '../src/contexts/ApiKeyContext'
import ProtectedRoute from '../src/components/ProtectedRoute'

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isLoginPage = router.pathname === '/login'

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ApiKeyProvider>
        <Layout>
          {isLoginPage ? (
            <Component {...pageProps} />
          ) : (
            <ProtectedRoute>
              <Component {...pageProps} />
            </ProtectedRoute>
          )}
        </Layout>
      </ApiKeyProvider>
    </ThemeProvider>
  )
}
