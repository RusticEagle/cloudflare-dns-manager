import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Box, Alert, CircularProgress,
  Typography, List, ListItem, ListItemText
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import axios from 'axios'
import { useApiKey } from '../contexts/ApiKeyContext'

type RecordData = {
  id?: string
  type: string
  name: string
  content: string
  ttl: number
  priority?: number
  proxied?: boolean
}

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  zoneId: string
  record?: RecordData | null
  mode: 'add' | 'edit'
}

type SuccessReport = {
  action: string
  recordType: string
  recordName: string
  changes: string[]
}

const RecordEditorModal: React.FC<Props> = ({ open, onClose, onSuccess, zoneId, record, mode }) => {
  const { apiKey } = useApiKey()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successReport, setSuccessReport] = useState<SuccessReport | null>(null)

  const [recordType, setRecordType] = useState<string>('A')
  const [name, setName] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [ttl, setTtl] = useState<number>(3600)
  const [priority, setPriority] = useState<number>(10)

  useEffect(() => {
    if (open && record && mode === 'edit') {
      setRecordType(record.type)
      setName(record.name)
      setContent(record.content)
      setTtl(record.ttl)
      setPriority(record.priority || 10)
    } else if (open && mode === 'add') {
      setRecordType('A')
      setName('')
      setContent('')
      setTtl(3600)
      setPriority(10)
    }
    setError(null)
    setSuccessReport(null)
  }, [open, record, mode])

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const headers = apiKey ? { 'x-cf-api-key': apiKey } : {}
      const payload: any = {
        type: recordType,
        name,
        content,
        ttl,
      }

      if (recordType === 'MX' || recordType === 'SRV') {
        payload.priority = priority
      }

      if (mode === 'add') {
        await axios.post(`/api/domains/${zoneId}/records`, payload, { headers })
        setSuccessReport({
          action: 'Created',
          recordType,
          recordName: name,
          changes: [
            `Type: ${recordType}`,
            `Name: ${name}`,
            `Content: ${content}`,
            `TTL: ${ttl === 1 ? 'Auto' : `${ttl}s`}`,
            ...(payload.priority ? [`Priority: ${priority}`] : [])
          ]
        })
      } else if (mode === 'edit' && record?.id) {
        await axios.put(`/api/domains/${zoneId}/records?recordId=${record.id}`, payload, { headers })
        const changes: string[] = []
        if (name !== record.name) changes.push(`Name: ${record.name} → ${name}`)
        if (content !== record.content) changes.push(`Content: ${record.content} → ${content}`)
        if (ttl !== record.ttl) changes.push(`TTL: ${record.ttl === 1 ? 'Auto' : `${record.ttl}s`} → ${ttl === 1 ? 'Auto' : `${ttl}s`}`)
        if (payload.priority && priority !== record.priority) changes.push(`Priority: ${record.priority} → ${priority}`)
        
        setSuccessReport({
          action: 'Updated',
          recordType,
          recordName: name,
          changes: changes.length > 0 ? changes : ['No changes detected']
        })
      }

      setLoading(false)
      onSuccess()
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose()
      }, 3000)
    } catch (err: any) {
      setLoading(false)
      setError(err?.response?.data?.error || err.message || 'Failed to save record')
    }
  }

  const getHelperText = () => {
    switch (recordType) {
      case 'A':
        return 'IPv4 address (e.g., 192.0.2.1)'
      case 'AAAA':
        return 'IPv6 address (e.g., 2001:0db8::1)'
      case 'CNAME':
        return 'Target hostname (e.g., example.com)'
      case 'MX':
        return 'Mail server hostname'
      case 'TXT':
        return 'Text value (e.g., verification string)'
      case 'NS':
        return 'Nameserver hostname'
      case 'SRV':
        return 'Service target (e.g., server.example.com)'
      default:
        return 'Record value'
    }
  }

  const handleClose = () => {
    if (!loading) {
      setSuccessReport(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {successReport ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
            <CheckCircleIcon />
            Record {successReport.action} Successfully
          </Box>
        ) : (
          mode === 'add' ? 'Add DNS Record' : 'Edit DNS Record'
        )}
      </DialogTitle>
      <DialogContent>
        {successReport ? (
          <Box sx={{ mt: 1 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              DNS record {successReport.action.toLowerCase()} successfully!
            </Alert>
            <Typography variant="subtitle2" gutterBottom>
              Record Details:
            </Typography>
            <List dense>
              {successReport.changes.map((change, idx) => (
                <ListItem key={idx}>
                  <ListItemText primary={change} />
                </ListItem>
              ))}
            </List>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              This dialog will close automatically in 3 seconds...
            </Typography>
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Record Type</InputLabel>
            <Select 
              value={recordType} 
              onChange={(e) => setRecordType(e.target.value)} 
              label="Record Type"
              disabled={mode === 'edit'}
            >
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="AAAA">AAAA</MenuItem>
              <MenuItem value="CNAME">CNAME</MenuItem>
              <MenuItem value="MX">MX</MenuItem>
              <MenuItem value="TXT">TXT</MenuItem>
              <MenuItem value="NS">NS</MenuItem>
              <MenuItem value="SRV">SRV</MenuItem>
              <MenuItem value="CAA">CAA</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            helperText="Record name (e.g., www, blog, or @ for root)"
            required
          />

          <TextField
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            helperText={getHelperText()}
            required
            multiline={recordType === 'TXT'}
            rows={recordType === 'TXT' ? 3 : 1}
          />

          <TextField
            label="TTL (seconds)"
            type="number"
            value={ttl}
            onChange={(e) => setTtl(Number(e.target.value))}
            fullWidth
            helperText="Time to live (1 = auto, typical: 300-86400)"
          />

          {(recordType === 'MX' || recordType === 'SRV') && (
            <TextField
              label="Priority"
              type="number"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              fullWidth
              helperText="Lower values have higher priority"
            />
          )}
        </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        {successReport ? (
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        ) : (
          <>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSubmit} 
              disabled={loading || !name || !content}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <span>Saving...</span>
                </Box>
              ) : (
                mode === 'add' ? 'Add Record' : 'Save Changes'
              )}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default RecordEditorModal
