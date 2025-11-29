import axios from 'axios'

// Helper to get API key from localStorage
const getApiKey = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('cf_api_key')
  }
  return null
}

// Helper to add API key header
const getHeaders = () => {
  const apiKey = getApiKey()
  return apiKey ? { 'x-cf-api-key': apiKey } : {}
}

export async function get<T>(url: string) {
  const res = await axios.get<T>(url, {
    headers: getHeaders()
  })
  return res.data
}

export async function post<T>(url: string, body?: any) {
  const res = await axios.post<T>(url, body, {
    headers: getHeaders()
  })
  return res.data
}

export async function put<T>(url: string, body?: any) {
  const res = await axios.put<T>(url, body, {
    headers: getHeaders()
  })
  return res.data
}

export async function del<T>(url: string) {
  const res = await axios.delete<T>(url, {
    headers: getHeaders()
  })
  return res.data
}
