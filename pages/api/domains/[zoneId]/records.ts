import type { NextApiRequest, NextApiResponse } from 'next'
import { listDnsRecords, createDnsRecord, updateDnsRecord, deleteDnsRecord } from '../../../../lib/cloudflare'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { zoneId } = req.query
  // Prioritize user-provided API key from header, fallback to server env
  const userApiKey = req.headers['x-cf-api-key'] as string | undefined
  const CF_API_TOKEN = userApiKey || process.env.CF_API_TOKEN || undefined

  if (req.method === 'GET') {
    const records = await listDnsRecords(zoneId as string, CF_API_TOKEN)
    res.status(200).json({ records })
  } else if (req.method === 'POST') {
    const record = req.body
    const newRecord = await createDnsRecord(zoneId as string, record, CF_API_TOKEN)
    res.status(201).json({ record: newRecord })
  } else if (req.method === 'PUT') {
    const { recordId } = req.query
    const changes = req.body
    const updated = await updateDnsRecord(zoneId as string, recordId as string, changes, CF_API_TOKEN)
    res.status(200).json({ record: updated })
  } else if (req.method === 'DELETE') {
    const { recordId } = req.query
    const success = await deleteDnsRecord(zoneId as string, recordId as string, CF_API_TOKEN)
    res.status(200).json({ success })
  } else {
    res.status(405).end()
  }
}
