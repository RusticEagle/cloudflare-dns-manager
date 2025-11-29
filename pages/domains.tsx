import React, { useEffect, useState } from 'react'
import { Typography, Box, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, IconButton, Button, Chip, CircularProgress } from '@mui/material'
import Link from 'next/link'
import { Edit as EditIcon } from '@mui/icons-material'
import axios from 'axios'
import BulkActionModal from '../src/components/BulkActionModal'
import { useApiKey } from '../src/contexts/ApiKeyContext'

type Domain = {
  id: string
  name: string
  status: string
  recordCount?: number
  loading?: boolean
}

const DomainsPage: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([])
  const { apiKey } = useApiKey()

  const [bulkOpen, setBulkOpen] = useState(false)

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const headers = apiKey ? { 'x-cf-api-key': apiKey } : {}
        const res = await axios.get('/api/domains', { headers })
        const domainsData = res.data.domains.map((d: Domain) => ({ ...d, loading: true }))
        setDomains(domainsData)
        
        // Fetch record counts for each domain
        domainsData.forEach(async (domain: Domain) => {
          try {
            const recordsRes = await axios.get(`/api/domains/${domain.id}/records`, { headers })
            const recordCount = recordsRes.data.records?.length || 0
            setDomains(prev => prev.map(d => 
              d.id === domain.id ? { ...d, recordCount, loading: false } : d
            ))
          } catch (err) {
            console.error(`Failed to fetch records for ${domain.name}`, err)
            setDomains(prev => prev.map(d => 
              d.id === domain.id ? { ...d, recordCount: 0, loading: false } : d
            ))
          }
        })
      } catch (err) {
        console.error(err)
      }
    }
    fetchDomains()
  }, [apiKey])

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Domains
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button variant="contained">Add Domain</Button>
        <Button variant="outlined" onClick={() => setBulkOpen(true)}>
          Bulk Edit DNS Records
        </Button>
      </Box>

      <BulkActionModal open={bulkOpen} onClose={() => setBulkOpen(false)} domains={domains.map((d) => ({ id: d.id, name: d.name }))} />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>DNS Records</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {domains.map((d) => (
              <TableRow key={d.id} hover>
                <TableCell>
                  <Link href={`/domains/${d.id}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>
                    {d.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={d.status} 
                    color={d.status === 'active' ? 'success' : 'default'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  {d.loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Chip 
                      label={`${d.recordCount || 0} records`} 
                      color="primary" 
                      variant="outlined"
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton size="small" component={Link} href={`/domains/${d.id}`}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default DomainsPage
