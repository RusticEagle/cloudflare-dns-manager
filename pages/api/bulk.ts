import type { NextApiRequest, NextApiResponse } from 'next'
import { updateDnsRecord, createDnsRecord, deleteDnsRecord } from '../../lib/cloudflare'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Prioritize user-provided API key from header, fallback to server env
  const userApiKey = req.headers['x-cf-api-key'] as string | undefined
  const CF_API_TOKEN = userApiKey || process.env.CF_API_TOKEN || undefined

  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { actions } = req.body
  if (!Array.isArray(actions)) {
    return res.status(400).json({ error: 'actions must be an array' })
  }

  const results: any[] = []
  for (const a of actions) {
    const { type, zoneId, recordId, payload } = a
    try {
      if (type === 'update') {
        const r = await updateDnsRecord(zoneId, recordId, payload, CF_API_TOKEN)
        results.push({ ok: true, r })
      } else if (type === 'create') {
        const r = await createDnsRecord(zoneId, payload, CF_API_TOKEN)
        results.push({ ok: true, r })
      } else if (type === 'delete') {
        const ok = await deleteDnsRecord(zoneId, recordId, CF_API_TOKEN)
        results.push({ ok: true, okResult: ok })
      } else {
        results.push({ ok: false, error: 'invalid type' })
      }
    } catch (err) {
      console.error('bulk action error', err)
      results.push({ ok: false, error: err })
    }
  }

  res.status(200).json({ results })
}
