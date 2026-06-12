import AsyncStorage from '@react-native-async-storage/async-storage'
import type { MeetopiaIntent, MeetopiaProfile } from '@/types/profile'

const KEYS = {
  ageVerified: 'meetopia_age_verified',
  profile: 'meetopia_profile',
  intent: 'meetopia_intent',
  blockedUsers: 'meetopia_blocked_users',
  vibeMatches: 'meetopia_vibe_matches',
} as const

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

export async function getBlockedUsers(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEYS.blockedUsers)
  if (!raw) return []
  try {
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

export async function blockUser(socketId: string): Promise<void> {
  const list = await getBlockedUsers()
  if (!list.includes(socketId)) {
    await AsyncStorage.setItem(KEYS.blockedUsers, JSON.stringify([...list, socketId]))
  }
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
