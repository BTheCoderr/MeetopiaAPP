'use client'

export type VideoConnectionStatus =
  | 'idle'
  | 'searching'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'

interface VideoConnectionStatusProps {
  isDarkTheme: boolean
  areControlsVisible: boolean
  isPeerConnected: boolean
  isSearching: boolean
  hasPeer: boolean
  isSocketConnected: boolean
}

export function deriveConnectionStatus(
  isPeerConnected: boolean,
  isSearching: boolean,
  isSocketConnected: boolean,
  hasPeer: boolean,
  error: string | null
): VideoConnectionStatus {
  if (error?.includes('reconnect')) return 'reconnecting'
  if (!isSocketConnected) return 'disconnected'
  if (isPeerConnected) return 'connected'
  if (hasPeer && !isPeerConnected) return 'connecting'
  if (isSearching) return 'searching'
  return 'idle'
}

export default function VideoConnectionStatusBar({
  isDarkTheme,
  areControlsVisible,
  isPeerConnected,
  isSearching,
  hasPeer,
  isSocketConnected,
}: VideoConnectionStatusProps) {
  const status = deriveConnectionStatus(
    isPeerConnected,
    isSearching,
    isSocketConnected,
    hasPeer,
    null,
  )

  const statusLabel: Record<VideoConnectionStatus, string> = {
    idle: 'Not Connected',
    searching: 'Looking...',
    connecting: 'Connecting...',
    connected: 'Connected',
    reconnecting: 'Reconnecting...',
    disconnected: 'Disconnected',
  }

  const isConnected = status === 'connected'
  const isPending = status === 'searching' || status === 'connecting'

  return (
    <div className={`flex items-center gap-2 transition-opacity duration-300 ${
      areControlsVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`flex items-center gap-2 ${
        isConnected
          ? isDarkTheme ? 'bg-green-500/20' : 'bg-green-500/10'
          : isPending
            ? isDarkTheme ? 'bg-amber-500/20' : 'bg-amber-500/10'
            : isDarkTheme ? 'bg-red-500/20' : 'bg-red-500/10'
      } px-3 py-1 rounded-full backdrop-blur-md border border-white/10`}>
        <span className={`text-sm ${isDarkTheme ? 'text-white/90' : 'text-black/90'}`}>
          {statusLabel[status]}
        </span>
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : isPending ? 'bg-amber-400 animate-pulse' : 'bg-red-500'
        }`} />
      </div>
    </div>
  )
}
