export const ENCORE_OPTIONS = [
  { id: 'coffee-chat', label: 'A coffee or tea chat', detail: 'Keep the good conversation going' },
  { id: 'playlist-swap', label: 'Swap playlists', detail: 'Get to know each other through music' },
  { id: 'try-something-new', label: 'Try something new', detail: 'Discover a shared interest together' },
  { id: 'walk-and-talk', label: 'A walk and talk', detail: 'Enjoy another unhurried conversation' },
  { id: 'game-night', label: 'A playful game night', detail: 'See where the fun takes you' },
] as const

export type EncoreChoice = typeof ENCORE_OPTIONS[number]['id']

export function isEncoreChoice(value: unknown): value is EncoreChoice {
  return typeof value === 'string' && ENCORE_OPTIONS.some(option => option.id === value)
}

export type EncoreRecord = {
  userAChoice: string | null
  userBChoice: string | null
  userAShared: boolean
  userBShared: boolean
}

export type EncoreView = {
  mine: EncoreChoice | null
  status: 'not-started' | 'waiting' | 'shared'
  card: null | { mine: EncoreChoice; theirs: EncoreChoice; sameIdea: boolean }
}

export function encoreView(record: EncoreRecord | null, memberIsA: boolean): EncoreView {
  if (!record) return { mine: null, status: 'not-started', card: null }
  const mine = memberIsA ? record.userAChoice : record.userBChoice
  const theirs = memberIsA ? record.userBChoice : record.userAChoice
  const mineShared = memberIsA ? record.userAShared : record.userBShared
  const theirsShared = memberIsA ? record.userBShared : record.userAShared
  const myChoice = isEncoreChoice(mine) ? mine : null
  const theirChoice = isEncoreChoice(theirs) ? theirs : null
  const canReveal = Boolean(mineShared && theirsShared && myChoice && theirChoice)
  return {
    mine: mineShared ? myChoice : null,
    status: canReveal ? 'shared' : mineShared ? 'waiting' : 'not-started',
    card: canReveal && myChoice && theirChoice
      ? { mine: myChoice, theirs: theirChoice, sameIdea: myChoice === theirChoice }
      : null,
  }
}
