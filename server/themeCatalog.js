'use strict'

// Fixed, curated Meetopia experience themes. The server owns all identifiers;
// user-generated prompts are never allowed into the live session protocol.
const THEMES = Object.freeze({
  'music-memories': Object.freeze({
    id: 'music-memories',
    title: 'Music & Memories',
    tagline: 'Find the story behind a favorite song.',
    spark: 'What song brings you right back to a moment that matters?',
    bridgePrompt: 'You have an afternoon to make a new memory together.',
    activities: Object.freeze([
      { id: 'live-music', label: 'Find a small live-music show' },
      { id: 'playlist', label: 'Trade favorite songs at a listening spot' },
      { id: 'music-walk', label: 'Take a music-themed neighborhood walk' },
    ]),
    settings: Object.freeze([
      { id: 'cafe', label: 'A cozy café' },
      { id: 'park', label: 'An outdoor park' },
      { id: 'city', label: 'A lively city corner' },
    ]),
  }),
  'weekend-adventures': Object.freeze({
    id: 'weekend-adventures',
    title: 'Weekend Adventures',
    tagline: 'Build a tiny adventure together.',
    spark: 'What makes a free Saturday unforgettable for you?',
    bridgePrompt: 'You both get to design a low-pressure first adventure.',
    activities: Object.freeze([
      { id: 'food-hunt', label: 'Discover a new food spot' },
      { id: 'creative-stop', label: 'Explore an art or maker space' },
      { id: 'scenic-stroll', label: 'Take a scenic walk' },
    ]),
    settings: Object.freeze([
      { id: 'daylight', label: 'A sunny afternoon' },
      { id: 'rainy', label: 'A cozy rainy day' },
      { id: 'golden-hour', label: 'Just before sunset' },
    ]),
  }),
  'curious-minds': Object.freeze({
    id: 'curious-minds',
    title: 'Curious Minds',
    tagline: 'Discover how you approach something new.',
    spark: 'What question could you happily talk about for hours?',
    bridgePrompt: 'Choose a new experience you could explore as a team.',
    activities: Object.freeze([
      { id: 'museum', label: 'Discover a thought-provoking exhibit' },
      { id: 'workshop', label: 'Try a creative beginner workshop' },
      { id: 'bookshop', label: 'Pick books for each other to explore' },
    ]),
    settings: Object.freeze([
      { id: 'quiet', label: 'A quiet afternoon' },
      { id: 'energized', label: 'A spontaneous day out' },
      { id: 'weekend', label: 'A relaxed weekend morning' },
    ]),
  }),
})

function getTheme(id) {
  return typeof id === 'string' && Object.hasOwn(THEMES, id) ? THEMES[id] : null
}
function isBridgeChoice(themeId, role, choice) {
  const theme = getTheme(themeId)
  const options = role === 'activity' ? theme?.activities : role === 'setting' ? theme?.settings : null
  return Boolean(typeof choice === 'string' && options?.some(option => option.id === choice))
}
function validateCreation(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const { themeId, activity, setting } = value
  if (!isBridgeChoice(themeId, 'activity', activity) || !isBridgeChoice(themeId, 'setting', setting)) return null
  return { themeId, activity, setting }
}

module.exports = { THEMES, getTheme, isBridgeChoice, validateCreation }
