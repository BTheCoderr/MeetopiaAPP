import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'

const LEGACY_SESSION_KEY = 'meetopia_session_id'
const SESSION_TOKEN_KEY = 'meetopia_native_session'
const USER_KEY = 'meetopia_session_user'

export const NATIVE_CLIENT_HEADER = 'X-Meetopia-Client'
export const NATIVE_CLIENT_VALUE = 'native'

export type SessionUser = {
  id: string
  email?: string | null
  username?: string | null
  displayName?: string | null
}

let memoryToken: string | null | undefined
let memoryUser: SessionUser | null | undefined

async function readSecure(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key)
  } catch {
    return AsyncStorage.getItem(key)
  }
}

async function writeSecure(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value)
    await AsyncStorage.removeItem(key)
  } catch {
    await AsyncStorage.setItem(key, value)
  }
}

async function deleteSecure(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key)
  } catch {
    // Fall through to AsyncStorage cleanup.
  }
  await AsyncStorage.removeItem(key)
}

export async function getSessionToken(): Promise<string | null> {
  if (memoryToken !== undefined) return memoryToken
  memoryToken = (await readSecure(SESSION_TOKEN_KEY)) ?? (await AsyncStorage.getItem(LEGACY_SESSION_KEY))
  return memoryToken
}

export async function getSessionId(): Promise<string | null> {
  return getSessionToken()
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (memoryUser !== undefined) return memoryUser
  const raw = await AsyncStorage.getItem(USER_KEY)
  if (!raw) {
    memoryUser = null
    return null
  }
  try {
    memoryUser = JSON.parse(raw) as SessionUser
    return memoryUser
  } catch {
    memoryUser = null
    return null
  }
}

export async function setSession(sessionToken: string, user?: SessionUser | null): Promise<void> {
  memoryToken = sessionToken
  await writeSecure(SESSION_TOKEN_KEY, sessionToken)
  await AsyncStorage.removeItem(LEGACY_SESSION_KEY)
  if (user) {
    memoryUser = user
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

export function parseMeetopiaSessionCookie(header: string | null | undefined): string | null {
  if (!header) return null
  const match = header.match(/meetopia_session=([^;,\s]+)/i)
  return match?.[1] ?? null
}

export function getSetCookieHeader(headers: Headers): string | null {
  return headers.get('set-cookie') ?? headers.get('Set-Cookie')
}

export async function clearSession(): Promise<void> {
  memoryToken = null
  memoryUser = null
  await deleteSecure(SESSION_TOKEN_KEY)
  await AsyncStorage.multiRemove([LEGACY_SESSION_KEY, USER_KEY])
}
