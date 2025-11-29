import React, { useState, useEffect } from 'react'
import { Typography, TextField, Button, Box, Paper, Alert } from '@mui/material'
import { useApiKey } from '../src/contexts/ApiKeyContext'

const SettingsPage: React.FC = () => {
  const { apiKey, setApiKey, clearApiKey } = useApiKey()
  const [localToken, setLocalToken] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    setLocalToken(apiKey)
  }, [apiKey])

  const handleSave = () => {
    setApiKey(localToken)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleClear = () => {
    setLocalToken('')
    clearApiKey()
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Settings
      </Typography>
      
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
        <TextField
          label="Cloudflare API Token"
          value={localToken}
          onChange={(e) => setLocalToken(e.target.value)}
          helperText="Provide a token with sufficient permissions to manage zones and DNS records. Stored securely in your browser."
          type="password"
          fullWidth
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleSave} sx={{ width: 160 }}>
            Save
          </Button>
          <Button variant="outlined" onClick={handleClear} sx={{ width: 160 }}>
            Clear
          </Button>
        </Box>

        <Alert severity="info">
          Your API token is stored locally in your browser and sent with each request. 
          It is never stored on any server. You can obtain an API token from your{' '}
          <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noopener noreferrer">
            Cloudflare dashboard
          </a>.
        </Alert>
      </Box>
    </Paper>
  )
}

export default SettingsPage
