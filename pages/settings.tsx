import React, { useState, useEffect } from 'react'
import { Typography, TextField, Button, Box, Paper, Alert, Divider, List, ListItem, ListItemText } from '@mui/material'
import { useRouter } from 'next/router'
import { useApiKey } from '../src/contexts/ApiKeyContext'

const SettingsPage: React.FC = () => {
  const { apiKey, setApiKey, logout } = useApiKey()
  const router = useRouter()
  const [localToken, setLocalToken] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    setLocalToken(apiKey ? '••••••••••••••••' : '')
  }, [apiKey])

  const handleSave = () => {
    if (localToken && localToken !== '••••••••••••••••') {
      setApiKey(localToken)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          API Token
        </Typography>
        
        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Settings saved successfully!
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 2 }}>
          Your API token is currently active. To change it, please log out and log in again with a new token.
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          <TextField
            label="Current API Token"
            value={localToken}
            helperText="Your API token is stored securely in your browser"
            type="password"
            fullWidth
            disabled
          />

          <Button variant="outlined" color="error" onClick={handleLogout} sx={{ width: 160 }}>
            Logout & Change Token
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          About
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          <ListItem>
            <ListItemText
              primary="Version"
              secondary="Beta 1.0.0"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Security"
              secondary="Your API token is stored locally in your browser and never sent to any third-party servers"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Get API Token"
              secondary={
                <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noopener noreferrer">
                  Create or manage API tokens in your Cloudflare dashboard
                </a>
              }
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  )
}

export default SettingsPage
