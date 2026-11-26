const DEFAULT_API_URL = 'https://meetopia-live.netlify.app'
const IS_STAGING = process.env.EXPO_PUBLIC_STAGING === 'true'
if (IS_STAGING) {
  const configured = process.env.EXPO_PUBLIC_API_URL
  if (!configured) throw new Error('Staging app has no dedicated API URL.')
  const api = new URL(configured)
  if (api.protocol !== 'https:' || api.hostname === 'meetopia-live.netlify.app') {
    throw new Error('Staging app refuses the production Meetopia API.')
  }
}

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(response.status, payload?.error || `Request failed (${response.status})`)
  }
  return payload as T
}
