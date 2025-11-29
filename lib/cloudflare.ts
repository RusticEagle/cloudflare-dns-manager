import axios from 'axios'

const CF_API_BASE = 'https://api.cloudflare.com/client/v4'

export type CloudflareZone = {
  id: string
  name: string
  status: string
}

export async function listZones(cfApiToken?: string): Promise<CloudflareZone[]> {
  if (!cfApiToken) {
    // return mock data when no token provided
    return [
      { id: 'mock-1', name: 'example.com', status: 'active' },
      { id: 'mock-2', name: 'acme.dev', status: 'active' },
    ]
  }
  try {
    const resp = await axios.get(`${CF_API_BASE}/zones`, {
      headers: {
        Authorization: `Bearer ${cfApiToken}`,
        'Content-Type': 'application/json',
      },
    })
    return resp.data.result.map((z: any) => ({ id: z.id, name: z.name, status: z.status }))
  } catch (err) {
    console.error('Cloudflare listZones error', err)
    return []
  }
}

export async function listDnsRecords(zoneId: string, cfApiToken?: string) {
  if (!cfApiToken) {
    return [
      { id: 'r1', type: 'A', name: 'www', content: '192.0.2.1', ttl: 3600 },
      { id: 'r2', type: 'CNAME', name: 'blog', content: 'gh-pages.github.io', ttl: 120 },
    ]
  }

  try {
    const resp = await axios.get(`${CF_API_BASE}/zones/${zoneId}/dns_records`, {
      headers: {
        Authorization: `Bearer ${cfApiToken}`,
        'Content-Type': 'application/json',
      },
    })
    return resp.data.result
  } catch (err) {
    console.error('Cloudflare listDnsRecords error', err)
    return []
  }
}

export async function createDnsRecord(zoneId: string, record: any, cfApiToken?: string) {
  if (!cfApiToken) {
    // mock create
    return { ...record, id: 'mock-created' }
  }
  const resp = await axios.post(`${CF_API_BASE}/zones/${zoneId}/dns_records`, record, {
    headers: {
      Authorization: `Bearer ${cfApiToken}`,
      'Content-Type': 'application/json',
    },
  })
  return resp.data.result
}

export async function updateDnsRecord(zoneId: string, recordId: string, changes: any, cfApiToken?: string) {
  if (!cfApiToken) {
    return { ...changes, id: recordId }
  }
  const resp = await axios.put(`${CF_API_BASE}/zones/${zoneId}/dns_records/${recordId}`, changes, {
    headers: {
      Authorization: `Bearer ${cfApiToken}`,
      'Content-Type': 'application/json',
    },
  })
  return resp.data.result
}

export async function deleteDnsRecord(zoneId: string, recordId: string, cfApiToken?: string) {
  if (!cfApiToken) {
    return { success: true }
  }
  const resp = await axios.delete(`${CF_API_BASE}/zones/${zoneId}/dns_records/${recordId}`, {
    headers: {
      Authorization: `Bearer ${cfApiToken}`,
      'Content-Type': 'application/json',
    },
  })
  return resp.data.success
}
