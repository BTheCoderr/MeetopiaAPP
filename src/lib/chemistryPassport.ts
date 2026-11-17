// A small, intentionally bounded preference vocabulary shared by web and the API.
// Passport fields are self-described conversation preferences, not verified traits.
export const CHEMISTRY_INTENTS = ['relationship', 'dating', 'friendship', 'open'] as const
export const CHEMISTRY_STYLES = ['playful', 'thoughtful', 'balanced'] as const
export const CHEMISTRY_INTERESTS = ['music', 'fitness', 'food', 'travel', 'art', 'gaming', 'books', 'outdoors', 'movies', 'tech', 'sports', 'culture'] as const

export type ChemistryIntent = typeof CHEMISTRY_INTENTS[number]
export type ChemistryStyle = typeof CHEMISTRY_STYLES[number]
export type ChemistryInterest = typeof CHEMISTRY_INTERESTS[number]
export type ChemistryPassport = { intent: ChemistryIntent; style: ChemistryStyle; interests: ChemistryInterest[] }

export const INTENT_LABELS: Record<ChemistryIntent, string> = {
  relationship: 'A relationship', dating: 'Dating and meeting people', friendship: 'New friendships', open: 'Open to possibilities',
}
export const STYLE_LABELS: Record<ChemistryStyle, string> = {
  playful: 'Playful and spontaneous', thoughtful: 'Thoughtful and deep', balanced: 'A mix of both',
}
export const INTEREST_LABELS: Record<ChemistryInterest, string> = {
  music: 'Music', fitness: 'Fitness', food: 'Food', travel: 'Travel', art: 'Art', gaming: 'Gaming',
  books: 'Books', outdoors: 'Outdoors', movies: 'Movies', tech: 'Technology', sports: 'Sports', culture: 'Culture',
}

export function parseChemistryPassport(input: unknown): ChemistryPassport | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const p = input as Record<string, unknown>
  if (typeof p.intent !== 'string' || !CHEMISTRY_INTENTS.includes(p.intent as ChemistryIntent)) return null
  if (typeof p.style !== 'string' || !CHEMISTRY_STYLES.includes(p.style as ChemistryStyle)) return null
  if (!Array.isArray(p.interests) || p.interests.length < 2 || p.interests.length > 5) return null
  if (new Set(p.interests).size !== p.interests.length) return null
  if (!p.interests.every(value => typeof value === 'string' && CHEMISTRY_INTERESTS.includes(value as ChemistryInterest))) return null
  return { intent: p.intent as ChemistryIntent, style: p.style as ChemistryStyle, interests: p.interests as ChemistryInterest[] }
}
