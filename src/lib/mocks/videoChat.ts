export const mockVideoChat = {
  status: 'connected' as const,
  isMuted: false,
  isVideoOff: false,
  onToggleMute: () => console.log('Toggle mute'),
  onToggleVideo: () => console.log('Toggle video'),
  onNextPerson: () => console.log('Next person')
} 