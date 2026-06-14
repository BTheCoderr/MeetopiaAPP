import type { MeetopiaIntent } from '@/types/profile'

export interface SuggestedMatch {
  id: string
  name: string
  age: number
  city: string
  intent: MeetopiaIntent
  prompt: string
  interests: string[]
}

/**
 * Local suggested profiles for the MVP / App Review build.
 * These power the profile-based discovery flow without requiring two live users.
 * Replace with server-backed suggestions when the matching API ships.
 */
export const SUGGESTED_MATCHES: SuggestedMatch[] = [
  {
    id: 'sm_alex',
    name: 'Alex',
    age: 28,
    city: 'Chicago',
    intent: 'dating',
    prompt: 'Coffee-shop hopper looking for someone to debate the best espresso in town.',
    interests: ['Coffee', 'Live music', 'Hiking'],
  },
  {
    id: 'sm_jordan',
    name: 'Jordan',
    age: 26,
    city: 'Austin',
    intent: 'serious',
    prompt: 'Here for something real. Dog parent, weekend cook, terrible at mini golf.',
    interests: ['Cooking', 'Dogs', 'Travel'],
  },
  {
    id: 'sm_sam',
    name: 'Sam',
    age: 31,
    city: 'Denver',
    intent: 'local_meet',
    prompt: 'New to the city and want to meet people who actually go outside.',
    interests: ['Climbing', 'Photography', 'Coffee'],
  },
  {
    id: 'sm_riley',
    name: 'Riley',
    age: 24,
    city: 'Seattle',
    intent: 'vibe_check',
    prompt: 'Chemistry first. Let’s talk and see if the vibe is real.',
    interests: ['Art', 'Vinyl records', 'Ramen'],
  },
  {
    id: 'sm_taylor',
    name: 'Taylor',
    age: 29,
    city: 'Brooklyn',
    intent: 'casual',
    prompt: 'Keeping it light and fun. Ask me about my rooftop garden.',
    interests: ['Gardening', 'Comedy', 'Cycling'],
  },
]

export function getSuggestedMatch(id: string | undefined): SuggestedMatch | undefined {
  if (!id) return undefined
  return SUGGESTED_MATCHES.find(m => m.id === id)
}
