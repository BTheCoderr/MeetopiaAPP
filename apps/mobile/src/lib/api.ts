import { getSessionToken, NATIVE_CLIENT_HEADER, NATIVE_CLIENT_VALUE } from './session'

const DEFAULT_API_URL = 'https://meetopia-live.netlify.app'

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getSessionToken()
  const response = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      [NATIVE_CLIENT_HEADER]: NATIVE_CLIENT_VALUE,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
            Cookie: `meetopia_session=${token}`,
          }
        : {}),
      ...(init.headers || {}),
    },
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(response.status, payload?.error || `Request failed (${response.status})`)
  }
  return payload as T
}
