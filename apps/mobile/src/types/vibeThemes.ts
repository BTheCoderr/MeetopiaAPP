export const VIBE_THEMES = [
  { id: 'music-memories', title: 'Music & Memories', tagline: 'Find the story behind a favorite song.', icon: '♫' },
  { id: 'weekend-adventures', title: 'Weekend Adventures', tagline: 'Create a low-pressure adventure together.', icon: '✦' },
  { id: 'curious-minds', title: 'Curious Minds', tagline: 'Discover how two minds explore something new.', icon: '✧' },
] as const

export type VibeThemeId = typeof VIBE_THEMES[number]['id']
export function isVibeThemeId(id: unknown): id is VibeThemeId {
  return typeof id === 'string' && VIBE_THEMES.some(theme => theme.id === id)
}
