import AsyncStorage from '@react-native-async-storage/async-storage'
import { profileFingerprint } from '@/types/profile'
import type { MeetopiaIntent, MeetopiaProfile } from '@/types/profile'

const KEYS = {
  ageVerified: 'meetopia_age_verified',
  profile: 'meetopia_profile',
  intent: 'meetopia_intent',
  blockedUsers: 'meetopia_blocked_users',
  vibeMatches: 'meetopia_vibe_matches',
} as const

export type BlockedEntry = {
  fingerprint: string
  socketId?: string
  blockedAt: number
  label?: string
}

export async function isAgeVerified(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.ageVerified)) === 'true'
}

export async function setAgeVerified(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ageVerified, 'true')
}

export async function getStoredProfile(): Promise<MeetopiaProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.profile)
  if (!raw) return null
  try {
    return JSON.parse(raw) as MeetopiaProfile
  } catch {
    return null
  }
}

export async function saveProfile(profile: MeetopiaProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile))
}

export async function getStoredIntent(): Promise<MeetopiaIntent | null> {
  const v = await AsyncStorage.getItem(KEYS.intent)
  return v as MeetopiaIntent | null
}

export async function saveIntent(intent: MeetopiaIntent): Promise<void> {
  await AsyncStorage.setItem(KEYS.intent, intent)
}

export async function isOnboardingComplete(): Promise<boolean> {
  const [age, profile, intent] = await Promise.all([
    isAgeVerified(),
    getStoredProfile(),
    getStoredIntent(),
  ])
  return age && !!profile && !!intent
}

async function readBlockedRaw(): Promise<BlockedEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.blockedUsers)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    if (parsed.length > 0 && typeof parsed[0] === 'string') {
      const migrated: BlockedEntry[] = parsed.map((socketId: string) => ({
        fingerprint: `socket_${socketId}`,
        socketId,
        blockedAt: Date.now(),
      }))
      await AsyncStorage.setItem(KEYS.blockedUsers, JSON.stringify(migrated))
      return migrated
    }
    return parsed as BlockedEntry[]
  } catch {
    return []
  }
}

export async function getBlockedEntries(): Promise<BlockedEntry[]> {
  return readBlockedRaw()
}

/** @deprecated use getBlockedEntries */
export async function getBlockedUsers(): Promise<string[]> {
  const entries = await getBlockedEntries()
  return entries.map(e => e.socketId).filter((id): id is string => Boolean(id))
}

export function isBlockedEntry(
  entries: BlockedEntry[],
  socketId?: string | null,
  profile?: Record<string, unknown> | null,
): boolean {
  const fp = profileFingerprint(profile ?? null)
  return entries.some(
    e =>
      (socketId && e.socketId === socketId) ||
      (fp && e.fingerprint === fp) ||
      (socketId && e.fingerprint === `socket_${socketId}`),
  )
}

export async function isBlocked(
  socketId?: string | null,
  profile?: Record<string, unknown> | null,
): Promise<boolean> {
  const entries = await getBlockedEntries()
  return isBlockedEntry(entries, socketId, profile)
}

export async function blockUser(
  socketId: string,
  profile?: Record<string, unknown> | null,
): Promise<void> {
  const entries = await readBlockedRaw()
  const fingerprint = profileFingerprint(profile ?? null) ?? `socket_${socketId}`
  if (isBlockedEntry(entries, socketId, profile)) return

  const next: BlockedEntry = {
    fingerprint,
    socketId,
    blockedAt: Date.now(),
    label: typeof profile?.name === 'string' ? profile.name : undefined,
  }
  await AsyncStorage.setItem(KEYS.blockedUsers, JSON.stringify([...entries, next]))
}

export async function addVibeMatch(peerId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.vibeMatches)
  const list: string[] = raw ? JSON.parse(raw) : []
  if (!list.includes(peerId)) {
    await AsyncStorage.setItem(KEYS.vibeMatches, JSON.stringify([...list, peerId]))
  }
}

export async function clearLocalAccountData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS))
}
