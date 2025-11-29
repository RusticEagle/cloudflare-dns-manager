import * as React from 'react'
import type { AppProps } from 'next/app'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import theme from '../src/theme'
import Layout from '../src/components/Layout'
import { ApiKeyProvider } from '../src/contexts/ApiKeyContext'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ApiKeyProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ApiKeyProvider>
    </ThemeProvider>
  )
}
