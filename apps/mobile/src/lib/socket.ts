import { io, Socket } from 'socket.io-client'
import { getSocketUrl } from './iceServers'
import { api } from './api'
import { VIBE_ROOM_PROTOCOL } from './vibeRoomProtocol'

const LOG = '[Mobile:Socket.io]'
let socket: Socket | null = null
let connecting: Promise<Socket> | null = null
let generation = 0
let refreshing: Promise<void> | null = null

/**
 * leave-chat removes this socket from the signaling presence map, but the
 * singleton stays connected. Drop it and let the next authenticated socket
 * register again, or incoming Connection calls stop arriving.
 */
export function invalidateAuthenticatedSocket(): void {
  const previous = socket
  const token = ++generation
  socket = null
  connecting = null
  refreshing = new Promise(resolve => {
    if (previous?.connected) previous.emit('leave-chat')
    setTimeout(() => {
      previous?.removeAllListeners()
      previous?.disconnect()
      if (generation === token) refreshing = null
      resolve()
    }, 250)
  })
}

async function fetchSocketToken(): Promise<string> {
  const data = await api<{ token: string }>('/api/auth/socket-token', { method: 'GET' })
  if (!data.token) throw new Error('Meetopia video authentication is unavailable right now.')
  return data.token
}

export async function getAuthenticatedSocket(): Promise<Socket> {
  if (refreshing) await refreshing
  // Reuse a socket that is still connecting; recreating it would drop
  // incoming-call listeners and invalidate server-side call invitations.
  if (socket?.connected || socket?.active) return socket
  if (connecting) return connecting
  const createdFor = generation
  connecting = (async () => {
    const token = await fetchSocketToken(), url = getSocketUrl()
    console.log(LOG, 'socket URL', url)
    socket?.removeAllListeners(); socket?.disconnect()
    const created = io(url, { transports: ['polling','websocket'], reconnectionAttempts: 5, reconnectionDelay: 1000, timeout: 10000, auth: { token, meetopiaProtocol: VIBE_ROOM_PROTOCOL } })
    if (createdFor !== generation) {
      created.disconnect()
      throw new Error('Meetopia realtime connection was replaced.')
    }
    socket = created
    socket.on('connect', () => { const transport = socket?.io.engine?.transport?.name ?? 'unknown'; console.log(LOG, 'connected', socket?.id, 'transport', transport); socket?.io.engine?.on('upgrade', nextTransport => console.log(LOG, 'transport upgraded to', nextTransport.name)) })
    socket.on('connect_error', err => console.error(LOG, 'connect_error', err.message))
    return socket
  })()
  try { return await connecting } finally { connecting = null }
}

// Temporary compatibility shim for legacy modules that are no longer used by the
// current Chemistry Check screen. Remove with the final legacy-code deletion.
export function getSocket(): Socket {
  if (!socket) {
    socket = io(getSocketUrl(), { autoConnect: false, transports: ['polling','websocket'] })
  }
  return socket
}

export function getCurrentSocket(): Socket | null { return socket }
export function disconnectSocket(): void { generation += 1; refreshing = null; if (socket) { console.log(LOG, 'disconnecting'); socket.removeAllListeners(); socket.disconnect(); socket = null } connecting = null }
