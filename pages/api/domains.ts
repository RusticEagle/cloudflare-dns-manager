import type { NextApiRequest, NextApiResponse } from 'next'
import { listZones } from '../../lib/cloudflare'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Prioritize user-provided API key from header, fallback to server env
  const userApiKey = req.headers['x-cf-api-key'] as string | undefined
  const CF_API_TOKEN = userApiKey || process.env.CF_API_TOKEN || undefined

  if (req.method === 'GET') {
    const zones = await listZones(CF_API_TOKEN)
    res.status(200).json({ domains: zones })
  } else {
    res.status(405).end()
  }
}
