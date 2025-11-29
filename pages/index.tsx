import React, { useEffect, useState } from 'react'
import { Typography, Grid, Card, CardContent, Button, Box, Paper, CircularProgress, Alert } from '@mui/material'
import Link from 'next/link'
import { PieChart } from '@mui/x-charts/PieChart'
import { BarChart } from '@mui/x-charts/BarChart'
import DomainIcon from '@mui/icons-material/Domain'
import DnsIcon from '@mui/icons-material/Dns'
import SpeedIcon from '@mui/icons-material/Speed'
import StorageIcon from '@mui/icons-material/Storage'
import axios from 'axios'
import { useApiKey } from '../src/contexts/ApiKeyContext'

type DomainStats = {
  totalDomains: number
  activeDomains: number
  totalRecords: number
  recordsByType: { type: string; count: number }[]
  avgRecordsPerDomain: number
  commonTTLs: { ttl: number; count: number }[]
  domainRecordCounts: { domain: string; count: number }[]
}

const HomePage: React.FC = () => {
  const { apiKey } = useApiKey()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DomainStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const headers = apiKey ? { 'x-cf-api-key': apiKey } : {}
        
        // Fetch domains
        const domainsRes = await axios.get('/api/domains', { headers })
        const domains = domainsRes.data.domains || []
        
        if (domains.length === 0) {
          setStats({
            totalDomains: 0,
            activeDomains: 0,
            totalRecords: 0,
            recordsByType: [],
            avgRecordsPerDomain: 0,
            commonTTLs: [],
            domainRecordCounts: []
          })
          setLoading(false)
          return
        }

        // Fetch records for each domain
        const recordsByType: { [key: string]: number } = {}
        const ttlCounts: { [key: number]: number } = {}
        const domainRecordCounts: { domain: string; count: number }[] = []
        let totalRecords = 0
        let activeDomains = 0

        for (const domain of domains) {
          if (domain.status === 'active') activeDomains++
          
          try {
            const recordsRes = await axios.get(`/api/domains/${domain.id}/records`, { headers })
            const records = recordsRes.data.records || []
            
            domainRecordCounts.push({ domain: domain.name, count: records.length })
            totalRecords += records.length

            records.forEach((record: any) => {
              // Count by type
              recordsByType[record.type] = (recordsByType[record.type] || 0) + 1
              
              // Count by TTL
              const ttl = record.ttl === 1 ? 'Auto' : record.ttl
              ttlCounts[ttl] = (ttlCounts[ttl] || 0) + 1
            })
          } catch (err) {
            console.error(`Failed to fetch records for ${domain.name}`, err)
          }
        }

        // Convert to arrays and sort
        const recordsByTypeArray = Object.entries(recordsByType)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count)

        const commonTTLsArray = Object.entries(ttlCounts)
          .map(([ttl, count]) => ({ ttl: ttl === 'Auto' ? 1 : Number(ttl), count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        const topDomains = domainRecordCounts
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)

        setStats({
          totalDomains: domains.length,
          activeDomains,
          totalRecords,
          recordsByType: recordsByTypeArray,
          avgRecordsPerDomain: domains.length > 0 ? Math.round(totalRecords / domains.length) : 0,
          commonTTLs: commonTTLsArray,
          domainRecordCounts: topDomains
        })
      } catch (err: any) {
        setError(err?.message || 'Failed to load statistics')
      }
      
      setLoading(false)
    }

    fetchStats()
  }, [apiKey])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DomainIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Domains</Typography>
              </Box>
              <Typography variant="h3" color="primary">{stats.totalDomains}</Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.activeDomains} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DnsIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">DNS Records</Typography>
              </Box>
              <Typography variant="h3" color="success.main">{stats.totalRecords}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total managed records
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SpeedIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Avg Records</Typography>
              </Box>
              <Typography variant="h3" color="warning.main">{stats.avgRecordsPerDomain}</Typography>
              <Typography variant="body2" color="text.secondary">
                Per domain
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StorageIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Record Types</Typography>
              </Box>
              <Typography variant="h3" color="info.main">{stats.recordsByType.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Different types in use
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      {stats.totalRecords > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Records by Type
              </Typography>
              <PieChart
                series={[
                  {
                    data: stats.recordsByType.map((item, index) => ({
                      id: index,
                      value: item.count,
                      label: `${item.type} (${item.count})`
                    })),
                    highlightScope: { faded: 'global', highlighted: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                  },
                ]}
                height={300}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Domains by Record Count
              </Typography>
              <BarChart
                dataset={stats.domainRecordCounts}
                xAxis={[{ scaleType: 'band', dataKey: 'domain' }]}
                series={[{ dataKey: 'count', label: 'Records', color: '#1976d2' }]}
                height={300}
                margin={{ bottom: 60, left: 40, right: 10, top: 20 }}
                slotProps={{
                  legend: { hidden: true }
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Domains</Typography>
              <Typography variant="body2">Manage the list of domains connected to your Cloudflare account.</Typography>
              <Button size="small" component={Link} href={'/domains'} sx={{ mt: 2 }} variant="contained">
                Open Domains
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Bulk Actions</Typography>
              <Typography variant="body2">Apply bulk edits across multiple domains like adding DNS records or updating TTL.</Typography>
              <Button size="small" component={Link} href={'/domains'} sx={{ mt: 2 }} variant="contained">
                Run Bulk Actions
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Settings</Typography>
              <Typography variant="body2">Configure your Cloudflare API token and other settings.</Typography>
              <Button size="small" component={Link} href={'/settings'} sx={{ mt: 2 }} variant="contained">
                Open Settings
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

export default HomePage
