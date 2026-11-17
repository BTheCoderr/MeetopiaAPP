import type { Socket } from 'socket.io-client'

export const VIBE_ROOM_PROTOCOL = 3 as const

// Fail closed when a new client reaches an old signaling service.
// A capability echo must complete BEFORE emitting find-user or find-next-user.
// A forged version field alone grants no media access: server-side reciprocal
// consent and active-peer authorization remain mandatory.
export async function confirmVibeRoomServer(socket: Socket): Promise<boolean> {
  if (!socket.connected) return false
  try {
    const response = await fetch('/api/auth/socket-token', {
      credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' },
    })
    if (!response.ok) return false
    const data: { token?: unknown } = await response.json()
    if (typeof data.token !== 'string' || !data.token) return false
    const reply: unknown = await socket.timeout(4500).emitWithAck('vibe-room-hello', {
      version: VIBE_ROOM_PROTOCOL,
      token: data.token,
    })
    return Boolean(
      reply &&
      typeof reply === 'object' &&
      (reply as { protocol?: unknown }).protocol === VIBE_ROOM_PROTOCOL &&
      (reply as { status?: unknown }).status === 'ready' &&
      socket.connected
    )
  } catch {
    return false
  }
}
