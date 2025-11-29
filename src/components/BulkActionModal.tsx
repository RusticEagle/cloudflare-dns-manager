import React, { useState, useEffect } from 'react'
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
  FormControl, InputLabel, Select, MenuItem, Box, Checkbox, List, ListItem, 
  ListItemText, ListItemIcon, Typography, Tabs, Tab, Alert, LinearProgress,
  RadioGroup, Radio, FormControlLabel, Chip, Stack, Paper, Divider
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import axios from 'axios'
import { useApiKey } from '../contexts/ApiKeyContext'

type Props = {
  open: boolean
  onClose: () => void
  domains: { id: string; name: string }[]
}

type OperationType = 'update-ttl' | 'add-record' | 'update-record'

type RecordFilter = {
  type?: string
  name?: string
}

type DetailedReport = {
  operation: string
  domainsProcessed: number
  recordsAffected: number
  successCount: number
  failedCount: number
  details: string[]
  errors: string[]
}

const BulkActionModal: React.FC<Props> = ({ open, onClose, domains }) => {
  const [selected, setSelected] = useState<string[]>([])
  const [operation, setOperation] = useState<OperationType>('update-ttl')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [report, setReport] = useState<DetailedReport | null>(null)
  const { apiKey } = useApiKey()

  // Update TTL fields
  const [ttl, setTtl] = useState<number>(3600)

  // Add record fields
  const [newRecordType, setNewRecordType] = useState<string>('A')
  const [newRecordName, setNewRecordName] = useState<string>('')
  const [newRecordContent, setNewRecordContent] = useState<string>('')
  const [newRecordTtl, setNewRecordTtl] = useState<number>(3600)
  const [newRecordPriority, setNewRecordPriority] = useState<number>(10)

  // Update record fields
  const [filterType, setFilterType] = useState<string>('')
  const [filterName, setFilterName] = useState<string>('')
  const [updateContent, setUpdateContent] = useState<string>('')
  const [updateTtl, setUpdateTtl] = useState<number>(3600)

  useEffect(() => {
    if (!open) {
      setSelected([])
      setOperation('update-ttl')
      setTtl(3600)
      setNewRecordType('A')
      setNewRecordName('')
      setNewRecordContent('')
      setNewRecordTtl(3600)
      setNewRecordPriority(10)
      setFilterType('')
      setFilterName('')
      setUpdateContent('')
      setUpdateTtl(3600)
      setReport(null)
      setProgress('')
    }
  }, [open])

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const toggleAll = () => {
    if (selected.length === domains.length) {
      setSelected([])
    } else {
      setSelected(domains.map(d => d.id))
    }
  }

  const run = async () => {
    setLoading(true)
    setReport(null)
    setProgress('Preparing bulk operation...')
    const headers = apiKey ? { 'x-cf-api-key': apiKey } : {}

    const actions: any[] = []
    const details: string[] = []
    const errors: string[] = []
    let recordsAffected = 0

    try {
      const selectedDomains = domains.filter(d => selected.includes(d.id))
      
      for (let i = 0; i < selected.length; i++) {
        const zid = selected[i]
        const domain = selectedDomains.find(d => d.id === zid)
        const domainName = domain?.name || zid
        
        setProgress(`Processing ${domainName} (${i + 1}/${selected.length})...`)
        
        if (operation === 'update-ttl') {
          // Update TTL on all records
          const rr = await axios.get(`/api/domains/${zid}/records`, { headers })
          const recordCount = rr.data.records.length
          for (const r of rr.data.records) {
            actions.push({ type: 'update', zoneId: zid, recordId: r.id, payload: { ...r, ttl } })
          }
          details.push(`${domainName}: Updated TTL to ${ttl}s on ${recordCount} record(s)`)
          recordsAffected += recordCount
        } else if (operation === 'add-record') {
          // Add new record to each domain
          const payload: any = {
            type: newRecordType,
            name: newRecordName,
            content: newRecordContent,
            ttl: newRecordTtl,
          }
          if (newRecordType === 'MX') {
            payload.priority = newRecordPriority
          }
          actions.push({ type: 'create', zoneId: zid, payload })
          details.push(`${domainName}: Added ${newRecordType} record "${newRecordName}" → ${newRecordContent}`)
          recordsAffected++
        } else if (operation === 'update-record') {
          // Update matching records
          const rr = await axios.get(`/api/domains/${zid}/records`, { headers })
          let matchCount = 0
          for (const r of rr.data.records) {
            let matches = true
            if (filterType && r.type !== filterType) matches = false
            if (filterName && !r.name.includes(filterName)) matches = false
            
            if (matches) {
              const payload: any = { ...r }
              if (updateContent) payload.content = updateContent
              if (updateTtl) payload.ttl = updateTtl
              actions.push({ type: 'update', zoneId: zid, recordId: r.id, payload })
              matchCount++
            }
          }
          if (matchCount > 0) {
            details.push(`${domainName}: Updated ${matchCount} matching record(s)`)
            recordsAffected += matchCount
          } else {
            details.push(`${domainName}: No matching records found`)
          }
        }
      }

      setProgress(`Applying ${actions.length} changes...`)
      const res = await axios.post('/api/bulk', { actions }, { headers })
      
      const successCount = res.data.results.filter((r: any) => r.ok).length
      const failedCount = res.data.results.filter((r: any) => !r.ok).length
      
      // Collect errors
      res.data.results.forEach((r: any, idx: number) => {
        if (!r.ok) {
          errors.push(`Action ${idx + 1}: ${r.error?.message || 'Unknown error'}`)
        }
      })

      const operationNames = {
        'update-ttl': 'TTL Update',
        'add-record': 'Add Records',
        'update-record': 'Update Records'
      }

      setReport({
        operation: operationNames[operation],
        domainsProcessed: selected.length,
        recordsAffected,
        successCount,
        failedCount,
        details,
        errors
      })
      
      setLoading(false)
      setProgress('')
    } catch (err: any) {
      console.error('bulk action error', err)
      setLoading(false)
      setProgress('')
      errors.push(err?.message || 'Unknown error occurred')
      setReport({
        operation: 'Bulk Operation',
        domainsProcessed: selected.length,
        recordsAffected: 0,
        successCount: 0,
        failedCount: actions.length,
        details,
        errors
      })
    }
  }

  const renderOperationForm = () => {
    switch (operation) {
      case 'update-ttl':
        return (
          <Box sx={{ mb: 2 }}>
            <TextField 
              label="TTL (seconds)" 
              type="number" 
              value={ttl} 
              onChange={(e) => setTtl(Number(e.target.value))} 
              fullWidth 
              helperText="Update TTL for all DNS records in selected domains"
            />
          </Box>
        )
      
      case 'add-record':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Record Type</InputLabel>
              <Select value={newRecordType} onChange={(e) => setNewRecordType(e.target.value)} label="Record Type">
                <MenuItem value="A">A</MenuItem>
                <MenuItem value="AAAA">AAAA</MenuItem>
                <MenuItem value="CNAME">CNAME</MenuItem>
                <MenuItem value="MX">MX</MenuItem>
                <MenuItem value="TXT">TXT</MenuItem>
                <MenuItem value="NS">NS</MenuItem>
                <MenuItem value="SRV">SRV</MenuItem>
              </Select>
            </FormControl>
            <TextField 
              label="Record Name" 
              value={newRecordName} 
              onChange={(e) => setNewRecordName(e.target.value)} 
              fullWidth 
              helperText="e.g., www, blog, @ (for root)"
            />
            <TextField 
              label="Content/Value" 
              value={newRecordContent} 
              onChange={(e) => setNewRecordContent(e.target.value)} 
              fullWidth 
              helperText="IP address, hostname, or text value"
            />
            <TextField 
              label="TTL (seconds)" 
              type="number" 
              value={newRecordTtl} 
              onChange={(e) => setNewRecordTtl(Number(e.target.value))} 
              fullWidth 
            />
            {newRecordType === 'MX' && (
              <TextField 
                label="Priority" 
                type="number" 
                value={newRecordPriority} 
                onChange={(e) => setNewRecordPriority(Number(e.target.value))} 
                fullWidth 
              />
            )}
          </Box>
        )
      
      case 'update-record':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Filter which records to update (leave empty to match all):
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Filter by Type (optional)</InputLabel>
              <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Filter by Type (optional)">
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="A">A</MenuItem>
                <MenuItem value="AAAA">AAAA</MenuItem>
                <MenuItem value="CNAME">CNAME</MenuItem>
                <MenuItem value="MX">MX</MenuItem>
                <MenuItem value="TXT">TXT</MenuItem>
                <MenuItem value="NS">NS</MenuItem>
              </Select>
            </FormControl>
            <TextField 
              label="Filter by Name (optional)" 
              value={filterName} 
              onChange={(e) => setFilterName(e.target.value)} 
              fullWidth 
              helperText="Partial match, e.g., 'www' matches www.example.com"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              New values (leave empty to keep existing):
            </Typography>
            <TextField 
              label="New Content (optional)" 
              value={updateContent} 
              onChange={(e) => setUpdateContent(e.target.value)} 
              fullWidth 
            />
            <TextField 
              label="New TTL (optional)" 
              type="number" 
              value={updateTtl} 
              onChange={(e) => setUpdateTtl(Number(e.target.value))} 
              fullWidth 
            />
          </Box>
        )
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {report ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {report.failedCount === 0 ? (
              <>
                <CheckCircleIcon color="success" />
                <span>Operation Completed Successfully</span>
              </>
            ) : (
              <>
                <ErrorIcon color="warning" />
                <span>Operation Completed with Issues</span>
              </>
            )}
          </Box>
        ) : (
          'Bulk DNS Operations'
        )}
      </DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            {progress && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {progress}
              </Typography>
            )}
          </Box>
        )}
        
        {report ? (
          <Box>
            <Alert 
              severity={report.failedCount === 0 ? 'success' : 'warning'} 
              sx={{ mb: 2 }}
            >
              {report.operation} completed: {report.successCount} succeeded
              {report.failedCount > 0 && `, ${report.failedCount} failed`}
            </Alert>

            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Operation Summary
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Domains Processed
                  </Typography>
                  <Typography variant="h6">{report.domainsProcessed}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Records Affected
                  </Typography>
                  <Typography variant="h6">{report.recordsAffected}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Successful Operations
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {report.successCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Failed Operations
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {report.failedCount}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {report.details.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Details by Domain:
                </Typography>
                <Paper variant="outlined" sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  <List dense>
                    {report.details.map((detail, idx) => (
                      <ListItem key={idx}>
                        <ListItemText 
                          primary={detail}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            )}

            {report.errors.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Errors:
                </Typography>
                <Paper variant="outlined" sx={{ maxHeight: 150, overflowY: 'auto', bgcolor: 'error.light', bgcolor: 'rgba(211, 47, 47, 0.1)' }}>
                  <List dense>
                    {report.errors.map((error, idx) => (
                      <ListItem key={idx}>
                        <ListItemText 
                          primary={error}
                          primaryTypographyProps={{ variant: 'body2', color: 'error' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            )}
          </Box>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={operation} onChange={(e, v) => setOperation(v)} disabled={loading}>
                <Tab label="Update TTL" value="update-ttl" />
                <Tab label="Add Record" value="add-record" />
                <Tab label="Update Records" value="update-record" />
              </Tabs>
            </Box>

            {renderOperationForm()}

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">
                  Select Domains ({selected.length} of {domains.length} selected)
                </Typography>
                <Button size="small" onClick={toggleAll} disabled={loading}>
                  {selected.length === domains.length ? 'Deselect All' : 'Select All'}
                </Button>
              </Box>
              <Box sx={{ maxHeight: 200, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <List dense>
                  {domains.map((d) => (
                    <ListItem key={d.id} button onClick={() => toggle(d.id)} disabled={loading}>
                      <ListItemIcon>
                        <Checkbox edge="start" checked={selected.includes(d.id)} />
                      </ListItemIcon>
                      <ListItemText primary={d.name} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        {report ? (
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        ) : (
          <>
            <Button onClick={onClose} disabled={loading}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={run} 
              disabled={loading || selected.length === 0}
            >
              {loading ? 'Processing...' : 'Run Bulk Operation'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default BulkActionModal
