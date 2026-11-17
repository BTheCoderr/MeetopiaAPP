export const INTENT_OPTIONS = [
  { value: 'relationship', label: 'A relationship' },
  { value: 'dating', label: 'Dating and meeting people' },
  { value: 'friendship', label: 'New friendships' },
  { value: 'open', label: 'Open to possibilities' },
] as const

export const STYLE_OPTIONS = [
  { value: 'playful', label: 'Playful and spontaneous' },
  { value: 'thoughtful', label: 'Thoughtful and deep' },
  { value: 'balanced', label: 'A little of both' },
] as const

export const INTEREST_OPTIONS = [
  { value: 'music', label: 'Music' }, { value: 'fitness', label: 'Fitness' },
  { value: 'food', label: 'Food' }, { value: 'travel', label: 'Travel' },
  { value: 'art', label: 'Art' }, { value: 'gaming', label: 'Gaming' },
  { value: 'books', label: 'Books' }, { value: 'outdoors', label: 'Outdoors' },
  { value: 'movies', label: 'Movies' }, { value: 'tech', label: 'Tech' },
  { value: 'sports', label: 'Sports' }, { value: 'culture', label: 'Culture' },
] as const

export type ChemistryPassport = {
  intent: (typeof INTENT_OPTIONS)[number]['value']
  style: (typeof STYLE_OPTIONS)[number]['value']
  interests: (typeof INTEREST_OPTIONS)[number]['value'][]
}

export type ChemistryPassportStatus = {
  complete: boolean
  adultConfirmed: boolean
  passport: ChemistryPassport | null
}

export type ChemistryIntroduction = {
  invitationId: string
  expiresAt: number
  accepted: boolean
  person: {
    displayName: string
    conversationStyle: string
    sharedInterests: string[]
  }
}
