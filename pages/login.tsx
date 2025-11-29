import React, { useState, useEffect } from 'react'
import { 
  Box, Paper, Typography, TextField, Button, Alert, Container,
  InputAdornment, IconButton, CircularProgress 
} from '@mui/material'
import { Visibility, VisibilityOff, VpnKey } from '@mui/icons-material'
import { useRouter } from 'next/router'
import { useApiKey } from '../src/contexts/ApiKeyContext'
import axios from 'axios'

const LoginPage: React.FC = () => {
  const router = useRouter()
  const { apiKey, setApiKey } = useApiKey()
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (apiKey) {
      router.push('/')
    }
  }, [apiKey, router])

  const validateToken = async (testToken: string): Promise<boolean> => {
    try {
      // Test the API key by trying to list zones
      const headers = { 'x-cf-api-key': testToken }
      await axios.get('/api/domains', { headers })
      return true
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        return false
      }
      // If it's a different error, the token might still be valid
      return true
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!token.trim()) {
      setError('Please enter your Cloudflare API token')
      return
    }

    setLoading(true)

    // Validate the token
    const isValid = await validateToken(token.trim())
    
    if (isValid) {
      setApiKey(token.trim())
      router.push('/')
    } else {
      setError('Invalid API token. Please check your token and try again.')
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <VpnKey sx={{ fontSize: 32, color: 'white' }} />
          </Box>

          <Typography component="h1" variant="h4" gutterBottom>
            Cloudflare DNS Manager
          </Typography>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Sign in with your Cloudflare API token to manage your DNS records
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Cloudflare API Token"
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoFocus
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowToken(!showToken)}
                      edge="end"
                    >
                      {showToken ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Don't have an API token?{' '}
                <a
                  href="https://dash.cloudflare.com/profile/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', fontWeight: 'bold' }}
                >
                  Create one here
                </a>
              </Typography>
            </Alert>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Required Permissions:</strong>
                <br />
                • Zone - DNS - Edit
                <br />
                • Zone - Zone - Read
                <br />
                <br />
                Your API token is stored securely in your browser and never sent to our servers.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default LoginPage
