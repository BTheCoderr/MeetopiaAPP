/** Lightweight profile sent over signaling (no private contact info). */
export interface MeetopiaProfile {
  name: string
  age: number
  city: string
  gender: 'woman' | 'man' | 'nonbinary' | 'other'
  interestedIn: 'women' | 'men' | 'everyone'
  intent: MeetopiaIntent
  prompt: string
  interests?: string[]
}

/** Preset interests users can pick during profile setup. */
export const INTEREST_OPTIONS = [
  'Coffee',
  'Travel',
  'Live music',
  'Fitness',
  'Foodie',
  'Art',
  'Gaming',
  'Outdoors',
  'Movies',
  'Reading',
  'Dogs',
  'Cooking',
  'Photography',
  'Dancing',
] as const

export type MeetopiaIntent =
  | 'dating'
  | 'new_friends'
  | 'local_meet'
  | 'serious'
  | 'casual'
  | 'vibe_check'

export const INTENT_OPTIONS: { id: MeetopiaIntent; label: string; subtitle: string }[] = [
  { id: 'dating', label: 'Dating', subtitle: 'Meet someone with romantic potential' },
  { id: 'new_friends', label: 'New Friends', subtitle: 'Expand your circle' },
  { id: 'local_meet', label: 'Local Meet', subtitle: 'Connect with people nearby' },
  { id: 'serious', label: 'Serious', subtitle: 'Looking for something real' },
  { id: 'casual', label: 'Casual', subtitle: 'Keep it light and fun' },
  { id: 'vibe_check', label: 'Just seeing who I vibe with', subtitle: 'Chemistry first' },
]

/** Maps mobile profile to signaling payload (compatible with server dating queue). */
export function toSignalingProfile(p: MeetopiaProfile) {
  const lookingFor =
    p.interestedIn === 'women' ? 'female' : p.interestedIn === 'men' ? 'male' : 'both'
  const gender =
    p.gender === 'woman' ? 'female' : p.gender === 'man' ? 'male' : p.gender === 'nonbinary' ? 'nonbinary' : 'other'

  return {
    name: p.name,
    age: p.age,
    city: p.city,
    gender,
    lookingFor,
    intent: p.intent,
    prompt: p.prompt,
    interests: p.interests && p.interests.length > 0 ? p.interests : [p.intent.replace('_', ' ')],
    bio: p.prompt,
  }
}

export function intentLabel(intent: MeetopiaIntent): string {
  return INTENT_OPTIONS.find(o => o.id === intent)?.label ?? intent
}

/** Stable key for blocking the same profile across socket reconnects. */
export function profileFingerprint(profile: Record<string, unknown> | null | undefined): string | null {
  if (!profile) return null
  const key = [
    profile.name,
    profile.age,
    profile.city,
    profile.gender,
    profile.intent,
    profile.prompt ?? profile.bio,
  ]
    .map(v => String(v ?? '').trim().toLowerCase())
    .join('|')
  if (!key.replace(/\|/g, '')) return null
  let hash = 5381
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 33) ^ key.charCodeAt(i)
  }
  return `fp_${(hash >>> 0).toString(36)}`
}
