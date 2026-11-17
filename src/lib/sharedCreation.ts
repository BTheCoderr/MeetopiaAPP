// Client-facing labels are curated; incoming persistence payloads are validated.
// In particular, a client may NOT supply arbitrary text for the shared card.
export const CREATION_THEMES = {
  'music-memories': {
    title: 'Music & Memories',
    activities: { 'live-music': 'Find a small live-music show', playlist: 'Trade favorite songs at a listening spot', 'music-walk': 'Take a music-themed neighborhood walk' },
    settings: { cafe: 'A cozy café', park: 'An outdoor park', city: 'A lively city corner' },
  },
  'weekend-adventures': {
    title: 'Weekend Adventures',
    activities: { 'food-hunt': 'Discover a new food spot', 'creative-stop': 'Explore an art or maker space', 'scenic-stroll': 'Take a scenic walk' },
    settings: { daylight: 'A sunny afternoon', rainy: 'A cozy rainy day', 'golden-hour': 'Just before sunset' },
  },
  'curious-minds': {
    title: 'Curious Minds',
    activities: { museum: 'Discover a thought-provoking exhibit', workshop: 'Try a creative beginner workshop', bookshop: 'Pick books for each other to explore' },
    settings: { quiet: 'A quiet afternoon', energized: 'A spontaneous day out', weekend: 'A relaxed weekend morning' },
  },
} as const

export type SharedCreation = { themeId: string; activity: string; setting: string }
export function validateCreation(value: unknown): SharedCreation | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const item = value as Record<string, unknown>
  if (typeof item.themeId !== 'string' || !Object.prototype.hasOwnProperty.call(CREATION_THEMES, item.themeId)) return null
  const theme = CREATION_THEMES[item.themeId as keyof typeof CREATION_THEMES]
  if (typeof item.activity !== 'string' || !Object.prototype.hasOwnProperty.call(theme.activities, item.activity)) return null
  if (typeof item.setting !== 'string' || !Object.prototype.hasOwnProperty.call(theme.settings, item.setting)) return null
  return { themeId: item.themeId, activity: item.activity, setting: item.setting }
}
export function creationLabels(value: SharedCreation) {
  const creation = validateCreation(value)
  if (!creation) return null
  const theme = CREATION_THEMES[creation.themeId as keyof typeof CREATION_THEMES]
  return {
    theme: theme.title,
    activity: (theme.activities as Record<string, string>)[creation.activity],
    setting: (theme.settings as Record<string, string>)[creation.setting],
  }
}
