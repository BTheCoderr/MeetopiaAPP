import { api, API_URL } from './api'
import {
  clearSession,
  getSetCookieHeader,
  NATIVE_CLIENT_HEADER,
  NATIVE_CLIENT_VALUE,
  parseMeetopiaSessionCookie,
  setSession,
  type SessionUser,
} from './session'
import { disconnectSocket } from './socket'
import { clearLocalAccountData } from './onboardingStorage'

type AuthResponse = {
  message?: string
  user?: SessionUser
  nativeSessionToken?: string
  error?: string
}

async function captureSession(path: string, body: Record<string, string>, userFallback?: SessionUser): Promise<SessionUser> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      [NATIVE_CLIENT_HEADER]: NATIVE_CLIENT_VALUE,
    },
    body: JSON.stringify(body),
  })
  const payload = (await response.json().catch(() => ({}))) as AuthResponse
  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status})`)
  }

  const token = payload.nativeSessionToken ?? parseMeetopiaSessionCookie(getSetCookieHeader(response.headers))
  const user = payload.user ?? userFallback
  if (!token) {
    throw new Error('Could not save your session on this device. The production API still needs the native session update.')
  }
  await setSession(token, user ?? null)
  return user ?? { id: 'unknown' }
}

export async function signIn(identifier: string, password: string): Promise<SessionUser> {
  return captureSession('/api/auth/signin', { identifier, password })
}

export async function signUp(username: string, email: string, password: string): Promise<SessionUser> {
  return captureSession('/api/auth/signup', { username, email, password })
}

export async function confirmAdult(): Promise<void> {
  await api('/api/auth/adult-confirmation', { method: 'POST' })
}

export async function fetchProfile(): Promise<SessionUser | null> {
  try {
    return await api<SessionUser>('/api/auth/profile')
  } catch {
    return null
  }
}

export async function signOut(): Promise<void> {
  disconnectSocket()
  await clearSession()
}

export async function deleteAccount(password: string): Promise<void> {
  await api('/api/auth/account', {
    method: 'DELETE',
    body: JSON.stringify({ password, confirm: true }),
  })
  disconnectSocket()
  await clearSession()
  await clearLocalAccountData()
}

export async function deleteLocalWorkspace(): Promise<void> {
  disconnectSocket()
  await clearSession()
  await clearLocalAccountData()
}
