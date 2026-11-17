export const ENCORE_OPTIONS = [
  { id: 'coffee-chat', label: 'A coffee or tea chat', detail: 'Keep the conversation going' },
  { id: 'playlist-swap', label: 'Swap playlists', detail: 'Get to know each other through music' },
  { id: 'try-something-new', label: 'Try something new', detail: 'Discover a shared interest together' },
  { id: 'walk-and-talk', label: 'A walk and talk', detail: 'Another unhurried conversation' },
  { id: 'game-night', label: 'A playful game night', detail: 'See where the fun takes you' },
] as const
export type EncoreChoice = typeof ENCORE_OPTIONS[number]['id']
export type EncoreView = {
  mine: EncoreChoice | null
  status: 'not-started' | 'waiting' | 'shared'
  card: null | { mine: EncoreChoice; theirs: EncoreChoice; sameIdea: boolean }
}
