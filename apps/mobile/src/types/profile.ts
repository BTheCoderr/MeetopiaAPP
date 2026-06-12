/** Lightweight profile sent over signaling (no private contact info). */
export interface MeetopiaProfile {
  name: string
  age: number
  city: string
  gender: 'woman' | 'man' | 'nonbinary' | 'other'
  interestedIn: 'women' | 'men' | 'everyone'
  intent: MeetopiaIntent
  prompt: string
}

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
    interests: [p.intent.replace('_', ' ')],
    bio: p.prompt,
  }
}

export function intentLabel(intent: MeetopiaIntent): string {
  return INTENT_OPTIONS.find(o => o.id === intent)?.label ?? intent
}
